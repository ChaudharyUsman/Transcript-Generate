'use client';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';

interface SubscriptionButtonProps {
  className?: string;
}

export default function SubscriptionButton({ className = '' }: SubscriptionButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/subscription')}
      className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 ${className}`}
    >
      <Crown className="w-4 h-4" />
      Upgrade to Premium
    </button>
  );
}
