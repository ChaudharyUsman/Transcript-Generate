import re
import yt_dlp
import tempfile
import os
import time
from pathlib import Path
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
from googleapiclient.discovery import build
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Transcript, Like, Comment, Share, Favorite
from .serializers import TranscriptSerializer, SummarizeSerializer, CommentSerializer
from users.models import Subscription
import isodate

class HistoryView(viewsets.ModelViewSet):
    serializer_class = TranscriptSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Transcript.objects.filter(user=self.request.user).order_by('-created_at')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'message': 'Transcript deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

def extract_video_id(url):
    """Extract video ID from YouTube URL."""
    patterns = [
        r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def split_transcript_into_chunks(transcript_text, chunk_size=1000):
    """Split transcript text into chunks of approximately chunk_size words."""
    words = transcript_text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def process_chunk_with_gemini(model, chunk_text, chunk_index, total_chunks):
    """Process a single chunk to generate partial summary, highlights, and key moments."""
    # Partial summary
    summary_prompt = f"Summarize this part ({chunk_index + 1}/{total_chunks}) of the YouTube video transcript in a concise paragraph:\n\n{chunk_text}"
    summary_response = model.generate_content(summary_prompt)
    partial_summary = summary_response.text.strip()

    # Partial highlights
    highlights_prompt = f"Extract key highlights from this part ({chunk_index + 1}/{total_chunks}) of the YouTube video transcript as bullet points:\n\n{chunk_text}"
    highlights_response = model.generate_content(highlights_prompt)
    highlights_text = highlights_response.text.strip()
    partial_highlights = [line.strip('- •').strip() for line in highlights_text.split('\n') if line.strip()]

    # Partial key moments (without timestamps for now, will adjust later if needed)
    key_moments_prompt = f"Extract key moments from this part ({chunk_index + 1}/{total_chunks}) of the YouTube video transcript. Format as: moment description\n\n{chunk_text}"
    key_moments_response = model.generate_content(key_moments_prompt)
    key_moments_text = key_moments_response.text.strip()
    partial_key_moments = []
    for line in key_moments_text.split('\n'):
        moment = line.strip('- •').strip()
        if moment:
            partial_key_moments.append({'timestamp': '', 'moment': moment})

    return partial_summary, partial_highlights, partial_key_moments

def combine_chunk_results(partial_summaries, partial_highlights, partial_key_moments, transcript_with_timestamps, transcript_list):
    """Combine results from all chunks into final outputs."""
    # Combine summaries
    combined_summaries = '\n\n'.join(partial_summaries)
    overall_summary_prompt = f"Create an overall concise summary of the entire YouTube video based on these partial summaries:\n\n{combined_summaries}"
    model = genai.GenerativeModel('gemini-2.0-flash')
    summary_response = model.generate_content(overall_summary_prompt)
    summary = summary_response.text.strip()

    # Combine highlights
    highlights = []
    for hl_list in partial_highlights:
        highlights.extend(hl_list)

    # Combine key moments
    key_moments = []
    if transcript_with_timestamps and transcript_list:
        # Adjust timestamps based on chunks
        # Calculate approximate time per chunk
        total_duration = transcript_list[-1].start + transcript_list[-1].duration if transcript_list else 0
        chunk_duration = total_duration / len(partial_key_moments) if partial_key_moments else 0
        for idx, km_list in enumerate(partial_key_moments):
            start_time = idx * chunk_duration
            for km in km_list:
                # Adjust timestamp if possible, but for simplicity, keep as is or add offset
                key_moments.append({'timestamp': f"{start_time:.1f}s", 'moment': km['moment']})
    else:
        for km_list in partial_key_moments:
            key_moments.extend(km_list)

    return summary, highlights, key_moments

class SummarizeView(generics.CreateAPIView):
    serializer_class = SummarizeSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        # Check subscription limit
        user_transcripts_count = Transcript.objects.filter(user=request.user).count()
        try:
            subscription = request.user.subscription
            has_active_subscription = subscription.is_active
        except Subscription.DoesNotExist:
            has_active_subscription = False

        if not has_active_subscription and user_transcripts_count >= 2:
            return Response({
                'error': 'Free limit reached. You can only create 2 transcripts. Please subscribe for unlimited access.',
                'upgrade_required': True
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        youtube_url = serializer.validated_data['youtube_url']
        visibility = serializer.validated_data.get('visibility', 'PRIVATE')

        video_id = extract_video_id(youtube_url)
        if not video_id:
            return Response({'error': 'Invalid YouTube URL'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Configure Gemini early
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.0-flash')

            transcript_text = None
            transcript_with_timestamps = None
            transcript_list = None

            # Try to fetch transcript
            try:
                api = YouTubeTranscriptApi()
                transcripts = api.list(video_id)
                transcript = transcripts.find_transcript(['en'])
                transcript_list = transcript.fetch()
                transcript_text = ' '.join([item.text for item in transcript_list])
                transcript_with_timestamps = '\n'.join([f"{item.start:.1f}s: {item.text}" for item in transcript_list])
            except Exception as transcript_error:
                # Fallback: Download audio and transcribe with Gemini
                with tempfile.TemporaryDirectory() as temp_dir:
                    audio_path = os.path.join(temp_dir, f"{video_id}.mp3")
                    ydl_opts = {
                        'format': 'bestaudio/best',
                        'outtmpl': os.path.join(temp_dir, f"{video_id}.%(ext)s"),
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': 'mp3',
                            'preferredquality': '192',
                        }],
                        'keepvideo': False,
                        'nopart': True,  
                        'noresume': True,  
                        'concurrent_fragment_downloads': 1,  
                    }
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([youtube_url])

                    # Force garbage collection and wait longer for Windows file handles to release
                    import gc
                    gc.collect()
                    time.sleep(5)

                    # Check if audio file exists
                    if not os.path.exists(audio_path):
                        raise Exception("Audio extraction failed")

                    # On Windows, aggressively check file accessibility and retry
                    max_lock_checks = 10
                    for check in range(max_lock_checks):
                        try:
                            # Try to open exclusively to ensure no other process has it
                            with open(audio_path, 'rb') as f:
                                data = f.read()
                                if len(data) == 0:
                                    raise Exception("Audio file is empty")
                            break  # File is accessible and has content
                        except (OSError, IOError) as e:
                            if check == max_lock_checks - 1:
                                raise Exception(f"Audio file is still locked after {max_lock_checks} attempts: {str(e)}")
                            time.sleep(2)

                    # Create a copy in system temp directory to avoid any temp dir issues
                    import shutil
                    system_temp = os.path.join(os.environ.get('TEMP', '/tmp'), f"transcript_{video_id}_{os.getpid()}")
                    os.makedirs(system_temp, exist_ok=True)
                    try:
                        copied_audio_path = os.path.join(system_temp, f"{video_id}_processed.mp3")
                        shutil.copy2(audio_path, copied_audio_path)

                        # Verify the copied file
                        with open(copied_audio_path, 'rb') as f:
                            if f.read(1) == b'':
                                raise Exception("Copied file appears to be empty")

                        # Transcribe audio with Gemini using the copied file
                        max_retries = 5
                        for attempt in range(max_retries):
                            try:
                                audio_file = genai.upload_file(copied_audio_path)
                                break
                            except Exception as upload_error:
                                if attempt == max_retries - 1:
                                    raise upload_error
                                time.sleep(3)  # Longer wait between retries
                    finally:
                        # Clean up system temp directory
                        try:
                            shutil.rmtree(system_temp)
                        except:
                            pass

                    transcription_prompt = "Transcribe the following audio file accurately."
                    transcription_response = model.generate_content([transcription_prompt, audio_file])
                    transcript_text = transcription_response.text.strip()
                    transcript_with_timestamps = ""

            # Fetch video details from YouTube API
            youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
            video_response = youtube.videos().list(
                part='snippet,contentDetails',
                id=video_id
            ).execute()

            if not video_response['items']:
                return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)

            video_data = video_response['items'][0]
            title = video_data['snippet']['title']
            channel_name = video_data['snippet']['channelTitle']
            thumbnail_url = video_data['snippet']['thumbnails']['default']['url']
            duration = video_data['contentDetails']['duration']  # ISO 8601 format
            publish_date_str = video_data['snippet']['publishedAt']
            # Parse the ISO 8601 date string to YYYY-MM-DD format
            from datetime import datetime
            publish_date = datetime.fromisoformat(publish_date_str.replace('Z', '+00:00')).date()

            # Apply chunking for all videos
            chunks = split_transcript_into_chunks(transcript_text, chunk_size=1000)
            partial_summaries = []
            partial_highlights = []
            partial_key_moments = []

            for idx, chunk in enumerate(chunks):
                ps, ph, pkm = process_chunk_with_gemini(model, chunk, idx, len(chunks))
                partial_summaries.append(ps)
                partial_highlights.append(ph)
                partial_key_moments.append(pkm)

            # Combine results
            summary, highlights, key_moments = combine_chunk_results(
                partial_summaries, partial_highlights, partial_key_moments,
                transcript_with_timestamps, transcript_list
            )

            # Generate topics using Gemini
            topics_prompt = f"List the main topics discussed in the following YouTube video transcript as a comma-separated list:\n\n{transcript_text}"
            topics_response = model.generate_content(topics_prompt)
            topics_text = topics_response.text.strip()
            topics = [topic.strip() for topic in topics_text.split(',') if topic.strip()]

            # Generate quotes using Gemini
            quotes_prompt = f"Extract notable quotes from the following YouTube video transcript as a numbered list:\n\n{transcript_text}"
            quotes_response = model.generate_content(quotes_prompt)
            quotes_text = quotes_response.text.strip()
            quotes = []
            for line in quotes_text.split('\n'):
                if line.strip() and (line[0].isdigit() or line.startswith('-')):
                    quote = line.lstrip('0123456789.- ').strip('"')
                    if quote:
                        quotes.append(quote)

            # Generate sentiment using Gemini
            sentiment_prompt = f"Analyze the overall sentiment of the following YouTube video transcript. Respond with only one word: positive, negative, or neutral.\n\n{transcript_text}"
            sentiment_response = model.generate_content(sentiment_prompt)
            sentiment = sentiment_response.text.strip().lower()
            if sentiment not in ['positive', 'negative', 'neutral']:
                sentiment = 'neutral'

            # Generate host name using Gemini
            host_prompt = f"Who is the host in the following YouTube video transcript? If no host is mentioned, respond with 'None'.\n\n{transcript_text}"
            host_response = model.generate_content(host_prompt)
            host_name = host_response.text.strip()
            if host_name.lower() in ['none', 'no host', '']:
                host_name = None

            # Generate guest name using Gemini
            guest_prompt = f"Who is the guest in the following YouTube video transcript? If no guest is mentioned, respond with 'None'.\n\n{transcript_text}"
            guest_response = model.generate_content(guest_prompt)
            guest_name = guest_response.text.strip()
            if guest_name.lower() in ['none', 'no guest', '']:
                guest_name = None



            # Save to database
            transcript_obj = Transcript.objects.create(
                user=request.user,
                youtube_url=youtube_url,
                video_id=video_id,
                title=title,
                channel_name=channel_name,
                thumbnail_url=thumbnail_url,
                duration=duration,
                publish_date=publish_date,
                transcript=transcript_text,
                summary=summary,
                highlights=highlights,
                key_moments=key_moments,
                topics=topics,
                quotes=quotes,
                sentiment=sentiment,
                host_name=host_name,
                guest_name=guest_name,
                visibility=visibility
            )

            response_serializer = TranscriptSerializer(transcript_obj)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicFeedView(viewsets.ReadOnlyModelViewSet):
    serializer_class = TranscriptSerializer

    def get_queryset(self):
        return Transcript.objects.filter(visibility='PUBLIC').order_by('-created_at')


class LikeView(generics.CreateAPIView, generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        transcript_id = kwargs.get('transcript_id')
        try:
            transcript = Transcript.objects.get(id=transcript_id, visibility='PUBLIC')
            like, created = Like.objects.get_or_create(user=request.user, transcript=transcript)
            if created:
                return Response({'message': 'Liked successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Already liked'}, status=status.HTTP_200_OK)
        except Transcript.DoesNotExist:
            return Response({'error': 'Public transcript not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, *args, **kwargs):
        transcript_id = kwargs.get('transcript_id')
        try:
            transcript = Transcript.objects.get(id=transcript_id, visibility='PUBLIC')
            like = Like.objects.get(user=request.user, transcript=transcript)
            like.delete()
            return Response({'message': 'Unliked successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Transcript.DoesNotExist:
            return Response({'error': 'Public transcript not found'}, status=status.HTTP_404_NOT_FOUND)
        except Like.DoesNotExist:
            # If like doesn't exist, it's already unliked, so return success
            return Response({'message': 'Already unliked'}, status=status.HTTP_200_OK)


class CommentView(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        transcript_id = self.kwargs.get('transcript_id')
        if transcript_id:
            return Comment.objects.filter(transcript_id=transcript_id, transcript__visibility='PUBLIC').order_by('-created_at')
        return Comment.objects.none()

    def perform_create(self, serializer):
        transcript_id = self.kwargs.get('transcript_id')
        try:
            transcript = Transcript.objects.get(id=transcript_id, visibility='PUBLIC')
            serializer.save(user=self.request.user, transcript=transcript)
        except Transcript.DoesNotExist:
            raise serializers.ValidationError({'error': 'Public transcript not found'})


class ShareView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        transcript_id = kwargs.get('transcript_id')
        try:
            transcript = Transcript.objects.get(id=transcript_id, visibility='PUBLIC')
            Share.objects.create(user=request.user, transcript=transcript)
            return Response({'message': 'Shared successfully'}, status=status.HTTP_201_CREATED)
        except Transcript.DoesNotExist:
            return Response({'error': 'Public transcript not found'}, status=status.HTTP_404_NOT_FOUND)


class FavoriteView(generics.CreateAPIView, generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        transcript_id = kwargs.get('transcript_id')
        try:
            transcript = Transcript.objects.get(id=transcript_id, visibility='PUBLIC')
            favorite, created = Favorite.objects.get_or_create(user=request.user, transcript=transcript)
            if created:
                return Response({'message': 'Favorited successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Already favorited'}, status=status.HTTP_200_OK)
        except Transcript.DoesNotExist:
            return Response({'error': 'Public transcript not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, *args, **kwargs):
        transcript_id = kwargs.get('transcript_id')
        try:
            transcript = Transcript.objects.get(id=transcript_id, visibility='PUBLIC')
            favorite = Favorite.objects.get(user=request.user, transcript=transcript)
            favorite.delete()
            return Response({'message': 'Unfavorited successfully'}, status=status.HTTP_204_NO_CONTENT)
        except (Transcript.DoesNotExist, Favorite.DoesNotExist):
            return Response({'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)


class FavoritesListView(generics.ListAPIView):
    serializer_class = TranscriptSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Transcript.objects.filter(
            favorites__user=self.request.user,
            visibility='PUBLIC'
        ).order_by('-favorites__created_at')
