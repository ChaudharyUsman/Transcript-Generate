"use client";

import { useState, useEffect } from "react";
import { Video, Search, Loader2, Newspaper } from "lucide-react";
import NaveBar from "./components/navebar/NaveBar";
import TranscriptForm from "./components/summrize/TranscriptForm";
import PublicTranscriptCard from "./components/public-feed/PublicTranscriptCard";
import SearchField from "./components/searching/SearchField";
import { fetchPublicFeedWithoutAuth } from "../src/utils/api";

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

export default function Home() {
  const [transcripts, setTranscripts] = useState<TranscriptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadPublicFeed = async () => {
      try {
        const data = await fetchPublicFeedWithoutAuth();
        if (Array.isArray(data)) {
          setTranscripts(data);
        } else {
          console.error("Invalid data format:", data);
          setTranscripts([]);
        }
      } catch (error) {
        console.error("Error fetching public feed:", error);
        setTranscripts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPublicFeed();
  }, []);

  const handleUpdateTranscript = (updatedTranscript: TranscriptData) => {
    setTranscripts((prev) =>
      prev.map((t) => (t.id === updatedTranscript.id ? updatedTranscript : t))
    );
  };

  const filteredTranscripts = transcripts.filter(
    (transcript) =>
      transcript.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  return (
    <div className="min-h-screen  from-gray-900 via-gray-850 to-gray-950 text-white ">
      <NaveBar />

      <div className="px-4 sm:px-6 lg:px-12 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 text-center lg:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <Video className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              YouTube Transcript Generator
            </h1>
          </div>
          <div className="w-full lg:w-auto lg:flex lg:justify-end">
            <SearchField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
        </div>

        <div className="mb-16">
          <TranscriptForm onSubmit={() => {}} loading={false} />
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Newspaper className="text-yellow-400 w-6 h-6" />
            <h2 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Public Transcripts
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Loader2 className="animate-spin w-6 h-6 mb-2" />
              <p>Loading public transcripts...</p>
            </div>
          ) : transcripts.length === 0 ? (
            <p className="text-center text-gray-400">No public transcripts available.</p>
          ) : (
            <>
              {filteredTranscripts.length === 0 && searchQuery ? (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <Search className="w-6 h-6 mb-2" />
                  <p>
                    No transcripts found matching{" "}
                    <span className="text-blue-400 font-medium">"{searchQuery}"</span>
                  </p>
                </div>
              ) : (
                
                <div className="grid gap-8 grid-cols-1">
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
    </div>
  );
}
