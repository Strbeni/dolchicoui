'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyEmailClient() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlToken = searchParams.get('token');

    if (!urlToken) {
      setError('Verification token not found in URL.');
      return;
    }

    // Move function inside to avoid useEffect dependency warning
    const verifyToken = async () => {
      setLoading(true);
      setError('');

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${API_BASE_URL}/api/user/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: urlToken }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || 'Verification failed');
        }

        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <h2 className="text-4xl font-bold text-gray-800">VERIFY EMAIL</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm">
          Email verified successfully! Redirecting to login...
        </p>
      )}

      {!success && (
        <Button
          type="button"
          onClick={() => {}} // no longer needed since verification runs automatically
          disabled
          className="w-full bg-[#d9673f] text-white text-sm tracking-widest opacity-70 cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'VERIFY EMAIL'}
          <ArrowRight className="ml-2" />
        </Button>
      )}
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

