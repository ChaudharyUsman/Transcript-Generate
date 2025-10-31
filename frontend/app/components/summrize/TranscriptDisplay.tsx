"use client";

import {
  Video,
  Calendar,
  Clock,
  User,
  Users,
  MessageCircle,
  Star,
  Quote,
  Bookmark,
  FileText,
  List,
  Tags,
  PlayCircle,
  Tv,
  Globe,
} from "lucide-react";

interface TranscriptDisplayProps {
  transcript: string;
  summary: string;
  highlights?: string[];
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  visibility?: string;
  onVisibilityChange?: () => void;
}

export default function TranscriptDisplay({
  transcript,
  summary,
  highlights,
  video_id,
  title,
  channel_name,
  thumbnail_url,
  duration,
  publish_date,
  key_moments,
  topics,
  quotes,
  sentiment,
  host_name,
  guest_name,
  visibility,
  onVisibilityChange,
}: TranscriptDisplayProps) {
  if (!transcript) return null;

  return (
    <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Video Title and Thumbnail */}
      <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
        {title && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <PlayCircle className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-semibold break-words">{title}</h1>
          </div>
        )}

        {thumbnail_url && (
          <div className="overflow-hidden rounded-xl flex justify-center">
            <img
              src={thumbnail_url}
              alt={title || "Video thumbnail"}
              className="w-full sm:max-w-lg rounded-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" /> Video Details
          </h2>
          <button
            onClick={onVisibilityChange}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <Globe className="w-4 h-4" />
            Change Visibility
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300 text-sm">
          {duration && (
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" /> <strong>Duration:</strong> {duration}
            </p>
          )}
          {channel_name && (
            <p className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-gray-400" /> <strong>Channel:</strong> {channel_name}
            </p>
          )}
          {publish_date && (
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" /> <strong>Published:</strong> {publish_date}
            </p>
          )}
          {sentiment && (
            <p className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400" /> <strong>Sentiment:</strong> {sentiment}
            </p>
          )}
          {host_name && (
            <p className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> <strong>Host:</strong> {host_name}
            </p>
          )}
          {guest_name && (
            <p className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> <strong>Guest:</strong> {guest_name}
            </p>
          )}
          {visibility && (
            <p className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" /> <strong>Visibility:</strong> {visibility}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-blue-400" /> Summary
        </h2>
        <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{summary}</p>
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-3">
            <Bookmark className="w-5 h-5 text-yellow-400" /> Highlights
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm sm:text-base">
            {highlights.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Moments */}
      {key_moments && key_moments.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-3">
            <List className="w-5 h-5 text-purple-400" /> Key Moments
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm sm:text-base">
            {key_moments.map((item, idx) => (
              <li key={idx}>
                <span className="text-blue-400">{item.timestamp}</span> — {item.moment}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topics */}
      {topics && topics.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-3">
            <Tags className="w-5 h-5 text-green-400" /> Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, idx) => (
              <span
                key={idx}
                className="bg-blue-700/40 border border-blue-600 px-3 py-1 rounded-full text-xs sm:text-sm text-blue-100"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quotes */}
      {quotes && quotes.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-3">
            <Quote className="w-5 h-5 text-pink-400" /> Quotes
          </h2>
          <ul className="text-gray-300 space-y-2 text-sm sm:text-base">
            {quotes.map((quote, idx) => (
              <li key={idx} className="italic border-l-4 border-pink-500 pl-3">
                “{quote}”
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full Transcript */}
      <div className="bg-gray-900/50 border border-gray-700 p-4 sm:p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-blue-400" /> Full Transcript
        </h2>
        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
          {transcript}
        </p>
      </div>
    </div>
  );
}
