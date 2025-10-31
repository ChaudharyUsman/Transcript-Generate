'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Page from '../components/summrize/Page';

export default function SummarizerPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      router.push('/');
    }
  }, [router]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return <Page />;
}
