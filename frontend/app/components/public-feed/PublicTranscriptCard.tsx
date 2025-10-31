"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, Star, Lock, Globe, ChevronDown, ChevronUp, User, Facebook } from "lucide-react";
import { likeTranscript, unlikeTranscript, favoriteTranscript, unfavoriteTranscript, shareTranscript, addComment, fetchComments } from "../../../src/utils/api";
import { toast } from "react-toastify";
import TranscriptExpandedView from "../transcriptExpandedDetails/TranscriptExpandedView";

interface TranscriptData {
  id: number;
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  transcript: string;
  summary: string;
  highlights?: string[];
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  visibility?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  favorites_count?: number;
  is_liked?: boolean;
  is_favorited?: boolean;
}

interface PublicTranscriptCardProps {
  transcript: TranscriptData;
  onUpdate: (updatedTranscript: TranscriptData) => void;
}

export default function PublicTranscriptCard({ transcript, onUpdate }: PublicTranscriptCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<{ id: number; user_username: string; text: string; created_at: string }[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments(transcript.id).then(setComments);
    }
  }, [showComments, transcript.id, comments.length]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let result;
      if (transcript.is_liked) {
        result = await unlikeTranscript(transcript.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onUpdate({
          ...transcript,
          is_liked: false,
          likes_count: (transcript.likes_count || 0) - 1,
        });
      } else {
        result = await likeTranscript(transcript.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onUpdate({
          ...transcript,
          is_liked: true,
          likes_count: (transcript.likes_count || 0) + 1,
        });
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error("Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let result;
      if (transcript.is_favorited) {
        result = await unfavoriteTranscript(transcript.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onUpdate({
          ...transcript,
          is_favorited: false,
          favorites_count: (transcript.favorites_count || 0) - 1,
        });
      } else {
        result = await favoriteTranscript(transcript.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onUpdate({
          ...transcript,
          is_favorited: true,
          favorites_count: (transcript.favorites_count || 0) + 1,
        });
      }
    } catch (error) {
      console.error("Favorite error:", error);
      toast.error("Failed to update favorite");
    } finally {
      setLoading(false);
    }
  };

  const handleShareAPI = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await shareTranscript(transcript.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onUpdate({
        ...transcript,
        shares_count: (transcript.shares_count || 0) + 1,
      });
      toast.success("Transcript shared!");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share");
    } finally {
      setLoading(false);
    }
  };

  const handleShareToPlatform = async (platform: string) => {
    const url = window.location.href;
    const text = `${transcript.title}\n${transcript.summary}\n${url}`;
    let shareUrl = '';
    if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'messenger') {
      shareUrl = `https://m.me/?link=${encodeURIComponent(url)}`;
    }
    window.open(shareUrl, '_blank');
    await handleShareAPI();
    setShowSharePopup(false);
  };

  const handleComment = async () => {
    if (!commentText.trim() || loading) return;
    setLoading(true);
    try {
      const result = await addComment(transcript.id, commentText);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCommentText("");
      onUpdate({
        ...transcript,
        comments_count: (transcript.comments_count || 0) + 1,
      });
      // Refresh comments after adding a new one
      fetchComments(transcript.id).then(setComments);
      toast.success("Comment added!");
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 hover:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        {transcript.thumbnail_url && (
          <img
            src={transcript.thumbnail_url}
            alt={transcript.title}
            className="w-32 h-20 sm:w-24 sm:h-16 md:w-28 md:h-20 object-cover rounded flex-shrink-0"
          />
        )}

        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2">{transcript.title}</h3>
            {transcript.visibility === 'PUBLIC' ? (
              <Globe className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
          </div>

          <p className="text-gray-400 text-xs sm:text-sm mb-2">{transcript.channel_name}</p>
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">{transcript.summary}</p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
            {isLoggedIn ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                disabled={loading}
                className={`flex items-center gap-1 transition-colors ${
                  transcript.is_liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${transcript.is_liked ? 'fill-current' : ''}`} />
                {transcript.likes_count || 0}
              </button>
            ) : (
              <div className="flex items-center gap-1 text-gray-600 cursor-not-allowed">
                <Heart className="w-4 h-4" />
                {transcript.likes_count || 0}
              </div>
            )}

            {isLoggedIn ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {transcript.comments_count || 0}
              </button>
            ) : (
              <div className="flex items-center gap-1 text-gray-600 cursor-not-allowed">
                <MessageCircle className="w-4 h-4" />
                {transcript.comments_count || 0}
              </div>
            )}

            {isLoggedIn ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSharePopup(!showSharePopup); }}
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Share className="w-4 h-4" />
                {transcript.shares_count || 0}
              </button>
            ) : (
              <div className="flex items-center gap-1 text-gray-600 cursor-not-allowed">
                <Share className="w-4 h-4" />
                {transcript.shares_count || 0}
              </div>
            )}

            {isLoggedIn ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
                disabled={loading}
                className={`flex items-center gap-1 transition-colors ${
                  transcript.is_favorited ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                <Star className={`w-4 h-4 ${transcript.is_favorited ? 'fill-current' : ''}`} />
                {transcript.favorites_count || 0}
              </button>
            ) : (
              <div className="flex items-center gap-1 text-gray-600 cursor-not-allowed">
                <Star className="w-4 h-4" />
                {transcript.favorites_count || 0}
              </div>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showSharePopup && (
            <div className="mt-4 w-full">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <h4 className="text-white text-sm font-semibold mb-3">Share this transcript</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleShareToPlatform('whatsapp')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShareToPlatform('facebook')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShareToPlatform('messenger')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Messenger
                  </button>
                </div>
                <button
                  onClick={() => setShowSharePopup(false)}
                  className="mt-3 text-gray-400 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showComments && (
            <div className="mt-4 w-full">
              {/* Display latest comment */}
              {comments.length > 0 && (
                <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">{comments[comments.length - 1].user_username}</span>
                    <span className="text-xs text-gray-400">{new Date(comments[comments.length - 1].created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-300">{comments[comments.length - 1].text}</p>
                </div>
              )}

              {comments.length > 1 && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="mb-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showAllComments ? 'Hide comments' : `Read ${comments.length - 1} more comments...`}
                </button>
              )}

              {/* Show all comments if expanded */}
              {showAllComments && comments.length > 1 && (
                <div className="mb-4 space-y-3">
                  {comments.slice(0, -1).map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">{comment.user_username}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {isLoggedIn && (
                <>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-2 bg-gray-700 text-white rounded resize-none text-sm"
                    rows={3}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || loading}
                    className="mt-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 text-sm"
                  >
                    Comment
                  </button>
                </>
              )}
            </div>
          )}

          {expanded && (
            <div className="mt-4 sm:mt-6 border-t border-gray-700 pt-4 sm:pt-6">
              <TranscriptExpandedView transcript={transcript} showMeta={true} showSentiment={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
