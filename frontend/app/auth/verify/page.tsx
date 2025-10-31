"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '../../../src/utils/api';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token).then(res => setMessage(res.detail));
    }
  }, [searchParams]);
  return <div>{message || 'Verifying...'}</div>;
}
