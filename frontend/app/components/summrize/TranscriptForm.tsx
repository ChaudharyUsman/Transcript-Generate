"use client";

import { useState } from "react";
import { Youtube, Loader2, Lock, Globe, Volleyball, X } from "lucide-react";
import { toast } from "react-toastify";

interface TranscriptFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function TranscriptForm({ onSubmit, loading }: TranscriptFormProps) {
  const [url, setUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('youtubeUrl') || '';
    }
    return '';
  });
  const [visibility, setVisibility] = useState("PRIVATE");

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return youtubeRegex.test(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('youtubeUrl', newUrl);
    }
  };

  const clearUrl = () => {
    setUrl('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('youtubeUrl');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    if (!isValidYouTubeUrl(url)) {
      toast.error("This link is not valid. Please paste a valid YouTube video link.");
      return;
    }
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error("Please log in to generate transcripts.");
      // Redirect to login page
      window.location.href = '/auth/login';
      return;
    }
    onSubmit(url);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-lg border border-gray-600/50 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10 rounded-3xl"></div>
      <div className="relative z-10">
        <h2 className="flex items-center justify-center gap-3 text-3xl font-bold  mb-8 bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
          <Youtube className="w-8 h-8 text-red-500 animate-pulse" />
          YouTube Transcript Generator
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
            <input
              type="text"
              placeholder="Paste YouTube video link here..."
              value={url}
              onChange={handleUrlChange}
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-800/50 text-gray-200 placeholder-gray-400 border border-gray-600/50 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-gray-800/70"
            />
            {url && (
              <button
                type="button"
                onClick={clearUrl}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-200 transition-colors"
                title="Clear link"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-6 h-6" /> Generating...
              </>
            ) : (
              <>
                <Volleyball className="w-6 h-6" />
                Generate Summary
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-gray-300 mt-6 text-center opacity-80">
          Paste any public YouTube video link to generate its transcript and summary.
        </p>
      </div>
    </div>
  );
}
