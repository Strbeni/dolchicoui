'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side Image */}
      <div className="relative w-1/2 hidden md:block h-full">
        <Image
          src="/login.svg"
          alt="Login Visual"
          fill
          className="object-cover"
          priority
        />
        {/* Logo */}
        <div className="absolute top-6 left-6 z-10">
          <h1 className="text-white text-3xl font-serif tracking-wide">
            <span className="text-[#844416] font-bold">M</span>
            <span className="text-white font-medium">ODEVA</span>
          </h1>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-20 h-full">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Heading */}
          <h2 className="text-4xl font-serif text-gray-800">SIGN IN</h2>

          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="uppercase text-xs font-semibold text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              className="text-sm"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <Label htmlFor="password" className="uppercase text-xs font-semibold text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                className="pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Rules */}
          <ul className="text-xs text-gray-500 space-y-1">
            <li>✔ Minimum 8 characters</li>
            <li>✔ At least 1 number</li>
            <li>✔ At least 1 uppercase & lowercase letter</li>
            <li>✔ At least 1 symbol</li>
          </ul>

          {/* Submit Button */}
          <Button className="w-full bg-[#844416] hover:bg-[#6f3612] text-white text-sm uppercase tracking-widest">
            
          </Button>

          {/* Register Link */}
          <p className="text-sm text-gray-600 text-center font-serif">
            Don’t have an account?{' '}
            <Link href="/register" className="text-[#844416] underline hover:text-[#6f3612]">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
