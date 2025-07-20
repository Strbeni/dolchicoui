// 'use client';

// import { Suspense, useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { ArrowRight } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// function VerifyEmailClient() {
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const searchParams = useSearchParams();
//   const router = useRouter();

//   useEffect(() => {
//     const urlToken = searchParams.get('token');

//     if (!urlToken) {
//       setError('Verification token not found in URL.');
//       return;
//     }

//     // Move function inside to avoid useEffect dependency warning
//     const verifyToken = async () => {
//       setLoading(true);
//       setError('');

//       try {
//         const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
//         const res = await fetch(`${API_BASE_URL}/api/user/verify-email`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ token: urlToken }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data?.message || 'Verification failed');
//         }

//         setSuccess(true);
//         setTimeout(() => router.push('/login'), 2000);
//       } catch (err) {
//         if (err instanceof Error) {
//           setError(err.message);
//         } else {
//           setError('An unexpected error occurred');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyToken();
//   }, [searchParams, router]);

//   return (
//     <div className="max-w-md w-full mx-auto space-y-6 py-10 px-4">
//       <h2 className="text-4xl font-bold text-gray-800">VERIFY EMAIL</h2>

//       {status === 'loading' && <p className="text-gray-500">Verifying token...</p>}

//       {status === 'verified' && (
//         <>
//           <p className="text-green-600">Email verified successfully! Redirecting to login...</p>
//           <Button onClick={() => router.push('/login')} className="w-full mt-4">
//             Go to Login <ArrowRight className="ml-2" />
//           </Button>
//         </>
//       )}

//       {status === 'invalid' && (
//         <div className="space-y-4">
//           <p className="text-red-600">Invalid or expired token.</p>

//           <div className="space-y-2">
//             <Input
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <Button onClick={handleResendToken} className="w-full bg-yellow-500 text-white">
//               Regenerate Token
//             </Button>
//           </div>

//           <div className="space-y-2">
//             <Input
//               placeholder="Enter OTP from email"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//             />
//             <Button onClick={handleVerifyOtp} className="w-full bg-green-600 text-white">
//               Verify OTP
//             </Button>
//           </div>

//           {message && <p className="text-gray-700 text-sm">{message}</p>}
//         </div>
//       )}

//       {status === 'error' && <p className="text-red-600">Something went wrong. Please try again later.</p>}
//     </div>
//   );
// }

// export default function Page() {
//   return (
//     <Suspense>
//       <VerifyEmailClient />
//     </Suspense>
//   );
// }


'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function VerifyEmailClient() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'invalid' | 'error'>('idle');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      setStatus('invalid');
      setMessage('Verification token not found in URL.');
      return;
    }

    const verifyToken = async () => {
      setStatus('loading');

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${API_BASE_URL}/api/user/verify-email`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: urlToken }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || 'Verification failed');
        }

        setStatus('verified');
        setTimeout(() => router.push('/login'), 2000);
      } catch (err) {
        setStatus('invalid');
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage('An unexpected error occurred');
        }
      }
    };

    verifyToken();
  }, [searchParams, router]);

  const handleResendToken = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/user/resend-verification-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to resend token');
      }

      setMessage('A new token has been sent to your email.');
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message);
      }
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

      if (!res.ok) {
        throw new Error(data?.message || 'OTP verification failed');
      }

      setStatus('verified');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message);
      }
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
          <p className="text-red-600">{message || 'Invalid or expired token.'}</p>

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

      {status === 'error' && (
        <p className="text-red-600">Something went wrong. Please try again later.</p>
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
