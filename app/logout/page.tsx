'use client';

// import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Logout() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Optional: clear all if needed
    // localStorage.clear();
    // sessionStorage.clear();

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
