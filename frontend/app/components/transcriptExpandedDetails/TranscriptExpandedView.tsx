import { Clock, Calendar, User } from "lucide-react";

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
}

interface TranscriptExpandedViewProps {
  transcript: TranscriptData;
  showMeta?: boolean;
  showSentiment?: boolean;
}

export default function TranscriptExpandedView({ transcript, showMeta = false, showSentiment = false }: TranscriptExpandedViewProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Meta info - only if showMeta is true */}
      {showMeta && (
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
          {transcript.host_name && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Host: {transcript.host_name}
            </div>
          )}
          {transcript.guest_name && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Guest: {transcript.guest_name}
            </div>
          )}
          {transcript.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {transcript.duration}
            </div>
          )}
          {transcript.publish_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              {new Date(transcript.publish_date).toLocaleDateString()}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            {new Date(transcript.created_at).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Highlights */}
      {transcript.highlights?.length ? (
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Highlights</h4>
          <ul className="list-disc list-inside text-gray-300 text-xs sm:text-sm space-y-1">
            {transcript.highlights.map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Topics */}
      {transcript.topics?.length ? (
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Topics</h4>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {transcript.topics.map((topic, idx) => (
              <span
                key={idx}
                className="bg-blue-700/40 border border-blue-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-blue-100"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Key Moments */}
      {transcript.key_moments?.length ? (
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Key Moments</h4>
          <ul className="list-disc list-inside text-gray-300 text-xs sm:text-sm space-y-1">
            {transcript.key_moments.map((moment, idx) => (
              <li key={idx}>
                <span className="text-blue-400">{moment.timestamp}</span> — {moment.moment}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Quotes */}
      {transcript.quotes?.length ? (
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Quotes</h4>
          <ul className="text-gray-300 space-y-2 text-xs sm:text-sm">
            {transcript.quotes.map((quote, idx) => (
              <li
                key={idx}
                className="italic border-l-4 border-pink-500 pl-2 sm:pl-3"
              >
                "{quote}"
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Sentiment - only if showSentiment is true */}
      {showSentiment && transcript.sentiment && (
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Sentiment</h4>
          <p className="text-gray-300 text-xs sm:text-sm">{transcript.sentiment}</p>
        </div>
      )}

      {/* Full Transcript */}
      <div>
        <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Full Transcript</h4>
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 sm:p-4 max-h-64 sm:max-h-96 overflow-y-auto">
          <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
            {transcript.transcript}
          </p>
        </div>
      </div>
    </div>
  );
}
