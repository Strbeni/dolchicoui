'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAppDispatch } from '@/lib/store/hooks';
import { clearUser } from '@/lib/store/userSlice';

export default function Logout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      // Call backend logout API to clear server-side session
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error during logout API call:', error);
      // Continue with client-side logout even if API call fails
    }

    // Clear client-side storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Clear auth cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    // Clear user data in Redux store
    dispatch(clearUser());

    // Redirect to login
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Image Section */}
      <div className="relative w-1/2 hidden md:block h-full">
        <Image
          src="/login.svg"
          alt="Logout Visual"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Content Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-20 h-full">
        <div className="max-w-md w-full mx-auto space-y-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800">ARE YOU SURE?</h2>
          <p className="text-sm text-gray-600">You&apos;re about to sign out of your account.</p>
          <Button
            onClick={handleLogout}
            className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white text-sm tracking-widest"
          >
            LOG OUT
            <ArrowRight className="ml-2" />
          </Button>

          <p className="text-sm">
            Want to go back?{' '}
            <span
              onClick={() => router.back()}
              className="underline cursor-pointer font-semibold"
            >
              Cancel
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
