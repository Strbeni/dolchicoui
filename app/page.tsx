'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = false;
    if (!isLoggedIn) {
      router.push('/home');
    }
  }, [router]);

  return <div>Loading...</div>;
}

