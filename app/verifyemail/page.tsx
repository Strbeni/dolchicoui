'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function VerifyEmailClient() {
  const [status, setStatus] = useState<'loading' | 'verified' | 'invalid' | 'error'>('loading');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlToken = searchParams.get('token');


useEffect(() => {
  const verifyToken = async () => {
    if (!urlToken) {
      setStatus('invalid');
      return;
    }
    setLoading(true);
    try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${API_BASE_URL}/api/user/verify-email?token=${urlToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('verified');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus('invalid');
        setMessage(data?.message || 'Invalid or expired token.');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };
  verifyToken();
}, [urlToken, router]);

  const handleResendToken = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/user/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data?.message || 'Verification email sent.');
    } catch {
      setMessage('Error resending token.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('verified');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage(data?.message || 'Invalid OTP.');
      }
    } catch {
      setMessage('Error verifying OTP.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6 py-10 px-4">
      <h2 className="text-4xl font-bold text-gray-800">VERIFY EMAIL</h2>

      {status === 'loading' && <p className="text-gray-500">Verifying token...</p>}

      {status === 'verified' && (
        <>
          <p className="text-green-600">Email verified successfully! Redirecting to login...</p>
          <Button onClick={() => router.push('/login')} className="w-full mt-4">
            Go to Login <ArrowRight className="ml-2" />
          </Button>
        </>
      )}

      {status === 'invalid' && (
        <div className="space-y-4">
          <p className="text-red-600">Invalid or expired token.</p>

          <div className="space-y-2">
            <Input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleResendToken} className="w-full bg-yellow-500 text-white">
              Regenerate Token
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Enter OTP from email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white">
              Verify OTP
            </Button>
          </div>

          {message && <p className="text-gray-700 text-sm">{message}</p>}
        </div>
      )}

      {status === 'error' && <p className="text-red-600">Something went wrong. Please try again later.</p>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  );
}