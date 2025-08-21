

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// import Image from 'next/image';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data?.message || 'Login failed');
      }

      localStorage.setItem('adminToken', data.token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left image */}
      <div className="relative w-1/2 hidden md:block h-full">
        {/* <Image
          src="/login.svg"
          alt="Login Visual"
          fill
          className="object-cover"
          priority
        /> */}
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-20 h-full">
        <form onSubmit={handleLogin} className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center">ADMIN LOGIN</h2>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="uppercase text-xs text-orange-600">
              EMAIL
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border px-3 py-2 w-full"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <Label htmlFor="password" className="uppercase text-xs text-orange-600">
              PASSWORD
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border px-3 py-2 pr-10 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Optional Social Login */}
          {/* <div className="flex items-center gap-4 text-gray-500 text-sm">
            <hr className="flex-grow border-gray-300" />
            <span>Continue with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="space-y-3">
            <Button className="w-full border border-gray-300 bg-white text-gray-800 flex items-center justify-center gap-2 hover:bg-white hover:text-gray-800">
              <Image src="/google.svg" alt="Google" width={20} height={20} />
              Login with Google
            </Button>
          </div> */}

          <Button
            type="submit"
            className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white text-sm tracking-widest"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'LOGIN'}
            <ArrowRight className="ml-2" />
          </Button>

          {/* Redirect Links */}
          <p className="text-sm text-center mt-2">
            Not an admin?{' '}
            <Link href="/login" className="underline font-semibold text-orange-600 hover:text-orange-800">
              User Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
