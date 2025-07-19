'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function ForgotPassword() {
  const router = useRouter()

  const [step, setStep] = useState<'options' | 'emailInput' | 'mobileInput' | 'otpInput'>('options')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [method, setMethod] = useState<'email' | 'mobile' | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // const API_BASE = 'https://valyris-i.onrender.com/api/auth'
  const API_BASE="https://valyris-i.onrender.com/api/auth"

  const resendOtp = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method === 'email' ? { email } : { phone: mobile }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.message || 'Failed to resend OTP')

      // Start cooldown timer
      setResendCooldown(30)
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev === 1) clearInterval(interval)
          return prev - 1
        })
      }, 1000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false)
    }
  }

  const sendOtp = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method === 'email' ? { email } : { phone: mobile }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.message || 'Failed to send OTP')
      setStep('otpInput')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
    finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp,
          ...(method === 'email' ? { email } : { phone: mobile }),
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.message || 'Invalid OTP')
      router.push('/register/set-password')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
    finally {
      setLoading(false)
    }
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setMethod(step === 'emailInput' ? 'email' : 'mobile')
    sendOtp()
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    verifyOtp()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side Image */}
      <div className="relative w-1/2 hidden md:block h-full">
        <Image
          src="/login.svg"
          alt="Forgot Password Visual"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-20 h-full">
        <form
          onSubmit={step === 'otpInput' ? handleVerifyOtp : handleSendOtp}
          className="max-w-md w-full mx-auto space-y-6 text-center"
        >
          {/* Header */}
          <h2 className="flex items-center text-3xl font-bold text-gray-800">
            <Link href="/login">
              <ArrowLeft className="mr-6" size={18} />
            </Link>
            FORGOT PASSWORD
          </h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Step 1: Choose Method */}
          {step === 'options' && (
            <>
              <Button
                type="button"
                onClick={() => setStep('emailInput')}
                className="w-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
              >
                OTP on Email
              </Button>

              <Button
                type="button"
                onClick={() => setStep('mobileInput')}
                className="w-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
              >
                OTP on Mobile No.
              </Button>

              <div className="text-sm text-gray-500 underline cursor-pointer">OR</div>
            </>
          )}

          {/* Email Input */}
          {step === 'emailInput' && (
            <>
              <div className="text-left">
                <label className="block mb-1 text-sm font-semibold text-orange-600 uppercase">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white text-sm tracking-widest"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight className="ml-2" size={18} />
              </Button>

              <div className="text-sm text-gray-500 underline cursor-pointer">
                <button type="button" onClick={() => setStep('options')}>
                  Go Back
                </button>
              </div>
            </>
          )}

          {/* Mobile Input */}
          {step === 'mobileInput' && (
            <>
              <div className="text-left">
                <label className="block mb-1 text-sm font-semibold text-orange-600 uppercase">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter your mobile number"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white text-sm tracking-widest"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight className="ml-2" size={18} />
              </Button>

              <div className="text-sm text-gray-500 underline cursor-pointer">
                <button type="button" onClick={() => setStep('options')}>
                  Go Back
                </button>
              </div>
            </>
          )}

          {/* OTP Input */}
          {step === 'otpInput' && (
            <>
              <div className="text-left">
                <label className="block mb-1 text-sm font-semibold text-orange-600 uppercase">
                  Enter OTP {method === 'email' ? 'sent to your Email' : 'sent to your Mobile'}
                </label>
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="underline"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(method === 'email' ? 'emailInput' : 'mobileInput')}
                  className="underline"
                >
                  Go Back
                </button>
              </div>


              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white text-sm tracking-widest"
              >
                {loading ? 'Verifying...' : 'Verify OTP'} <ArrowRight className="ml-2" size={18} />
              </Button>

              <div className="text-sm text-gray-500 underline cursor-pointer">
                <button
                  type="button"
                  onClick={() => setStep(method === 'email' ? 'emailInput' : 'mobileInput')}
                >
                  Go Back
                </button>
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="text-sm text-center mt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-black underline font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
