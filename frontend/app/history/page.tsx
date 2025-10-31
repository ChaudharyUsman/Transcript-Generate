'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HistoryList from '../components/history/HistoryList';
import NaveBar from '../components/navebar/NaveBar';
import SearchField from '../components/searching/SearchField';
import { toast } from 'react-toastify';
import { Clock, Youtube, Loader2, FileText, AlertCircle } from 'lucide-react'; 

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
  created_at: string;
}

export default function HistoryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [history, setHistory] = useState<TranscriptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      fetchHistory();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transcript/history/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        toast.error('Failed to fetch history');
      }
    } catch (error) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateVisibility = (id: number, visibility: string) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, visibility } : item
    ));
  };

  const filteredHistory = history.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NaveBar />
      <div className="p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Summary History</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-400" />
            <p>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Youtube className="w-10 h-10 text-red-500 mb-2" />
            <p>No summaries found. Start by summarizing a YouTube video!</p>
          </div>
        ) : (
            <>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-300">
                <FileText className="w-5 h-5 text-green-400" />
                <p>{filteredHistory.length} summaries found{searchQuery && ` (filtered from ${history.length})`}</p>
              </div>
              <SearchField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
              {filteredHistory.length === 0 && searchQuery ? (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p>No summaries found matching "{searchQuery}"</p>
                </div>
              ) : (
                <HistoryList history={filteredHistory} onDelete={handleDelete} onUpdateVisibility={handleUpdateVisibility} />
              )}
            </>
        )}
      </div>
    </div>
  );
}
