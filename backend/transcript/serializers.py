from rest_framework import serializers
from .models import Transcript, Like, Comment, Share, Favorite

class TranscriptSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    shares_count = serializers.SerializerMethodField()
    favorites_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Transcript
        fields = ['id', 'youtube_url', 'video_id', 'title', 'channel_name', 'thumbnail_url', 'duration', 'publish_date', 'transcript', 'summary', 'highlights', 'key_moments', 'topics', 'quotes', 'sentiment', 'host_name', 'guest_name', 'visibility', 'created_at', 'likes_count', 'comments_count', 'shares_count', 'favorites_count', 'is_liked', 'is_favorited']
        read_only_fields = ['id', 'video_id', 'title', 'channel_name', 'thumbnail_url', 'duration', 'publish_date', 'transcript', 'summary', 'highlights', 'key_moments', 'topics', 'quotes', 'sentiment', 'host_name', 'guest_name', 'created_at', 'likes_count', 'comments_count', 'shares_count', 'favorites_count', 'is_liked', 'is_favorited']

    def get_likes_count(self, obj):
        return obj.likes_count

    def get_comments_count(self, obj):
        return obj.comments_count

    def get_shares_count(self, obj):
        return obj.shares_count

    def get_favorites_count(self, obj):
        return obj.favorites_count

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorites.filter(user=request.user).exists()
        return False

class SummarizeSerializer(serializers.Serializer):
    youtube_url = serializers.URLField()
    visibility = serializers.ChoiceField(choices=[('PRIVATE', 'Private'), ('PUBLIC', 'Public')], default='PRIVATE')

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'transcript', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_username', 'transcript', 'text', 'created_at']
        read_only_fields = ['id', 'user', 'user_username', 'transcript', 'created_at']

class ShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Share
        fields = ['id', 'user', 'transcript', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'transcript', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
