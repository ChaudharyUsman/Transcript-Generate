"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, FileText,AlertCircle } from "lucide-react";
import NaveBar from "../navebar/NaveBar";
import PublicTranscriptCard from "../public-feed/PublicTranscriptCard";
import SearchField from "../searching/SearchField";
import { fetchFavorites } from "../../../src/utils/api";

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

export default function ShowAllFavorite() {
  const [transcripts, setTranscripts] = useState<TranscriptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await fetchFavorites();
        setTranscripts(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setTranscripts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleUpdateTranscript = (updatedTranscript: TranscriptData) => {
    setTranscripts(prev =>
      prev.map(t => t.id === updatedTranscript.id ? updatedTranscript : t)
    );
  };

  const filteredTranscripts = transcripts.filter(transcript =>
    transcript.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  return (
    <div className="min-h-screen  text-white">
      <NaveBar />
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Favorite Transcripts</h1>
          </div>
          <SearchField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400 py-8">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading favorite transcripts...</p>
          </div>
        ) : transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 py-8">
            <FileText className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-center">No favorite transcripts available.</p>
          </div>
        ) : (
          <>
            {filteredTranscripts.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>No transcripts found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredTranscripts.map((transcript) => (
                  <PublicTranscriptCard
                    key={transcript.id}
                    transcript={transcript}
                    onUpdate={handleUpdateTranscript}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
