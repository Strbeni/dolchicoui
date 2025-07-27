'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

// Types for better type safety
interface ApiResponse {
  success: boolean
  message: string
}

type StepType = 'emailInput' | 'otpInput' | 'passwordReset' | 'success'

export default function ForgotPassword() {
  const router = useRouter()

  // State management
  const [step, setStep] = useState<StepType>('emailInput')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // API Configuration
  const API_BASE = 'http://localhost:4000/api/user'

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/\d/.test(password)) errors.push('One number')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character')
    return errors
  }

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  // API call wrapper with error handling
  const apiCall = async (endpoint: string, body: object): Promise<ApiResponse> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.')
        }
        throw new Error(err.message)
      }
      throw new Error('An unexpected error occurred.')
    }
  }

  // Send OTP to email
  const sendOtp = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await apiCall('/forgot-password', { email })
      setSuccess(data.message || 'OTP sent successfully!')
      setStep('otpInput')
      setResendCooldown(30) // Start cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }, [email])

  // Resend OTP
  const resendOtp = useCallback(async () => {
    if (resendCooldown > 0) return
    await sendOtp()
  }, [sendOtp, resendCooldown])

  // Proceed to password reset after OTP verification
  const proceedToPasswordReset = useCallback(() => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.')
      return
    }
    setError(null)
    setStep('passwordReset')
  }, [otp])

  // Reset password
  const resetPassword = useCallback(async () => {
    setError(null)

    // Client-side validation
    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(', ')}`)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const data = await apiCall('/reset-password', {
        email,
        otp,
        newPassword,
      })

      setSuccess(data.message || 'Password reset successfully!')
      setStep('success')
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }, [email, otp, newPassword, confirmPassword, router])

  // Form handlers
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendOtp()
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    proceedToPasswordReset()
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    resetPassword()
  }

  // Get current form handler based on step
  const getCurrentFormHandler = () => {
    switch (step) {
      case 'emailInput': return handleEmailSubmit
      case 'otpInput': return handleOtpSubmit
      case 'passwordReset': return handlePasswordSubmit
      default: return (e: React.FormEvent) => e.preventDefault()
    }
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
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="flex items-center justify-center text-3xl font-bold text-gray-800 mb-2">
              {step !== 'success' && (
                <Link href="/login" className="mr-4">
                  <ArrowLeft className="hover:text-orange-600 transition-colors" size={24} />
                </Link>
              )}
              FORGOT PASSWORD
            </h2>
            
            {step === 'emailInput' && (
              <p className="text-sm text-gray-600">Enter your email to receive a reset OTP</p>
            )}
            {step === 'otpInput' && (
              <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to {email}</p>
            )}
            {step === 'passwordReset' && (
              <p className="text-sm text-gray-600">Create your new secure password</p>
            )}
          </div>

          {/* Progress Indicator */}
          {step !== 'success' && (
            <div className="flex justify-center space-x-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${step === 'emailInput' ? 'bg-orange-600' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'otpInput' ? 'bg-orange-600' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'passwordReset' ? 'bg-orange-600' : 'bg-gray-300'}`} />
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={getCurrentFormHandler()} className="space-y-6">
            {/* Step 1: Email Input */}
            {step === 'emailInput' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-orange-600 uppercase mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    className="w-full"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white font-medium py-3"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </>
            )}

            {/* Step 2: OTP Input */}
            {step === 'otpInput' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-orange-600 uppercase mb-2">
                    Enter OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-lg tracking-widest"
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={loading || resendCooldown > 0}
                    className="text-orange-600 hover:text-orange-800 underline disabled:text-gray-400 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('emailInput')}
                    className="text-gray-600 hover:text-gray-800 underline"
                  >
                    Change Email
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white font-medium py-3"
                >
                  Proceed to Reset
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </>
            )}

            {/* Step 3: Password Reset */}
            {step === 'passwordReset' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-orange-600 uppercase mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 text-xs space-y-1">
                      {validatePassword(newPassword).map((error, index) => (
                        <div key={index} className="text-red-500">• {error}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-orange-600 uppercase mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <div className="mt-1 text-xs text-red-500">Passwords do not match</div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => setStep('otpInput')}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || validatePassword(newPassword).length > 0 || newPassword !== confirmPassword}
                    className="flex-1 bg-[#d9673f] hover:bg-[#c2552d] text-white font-medium"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Password Reset Successful!</h3>
                <p className="text-gray-600">Your password has been updated successfully.</p>
                <p className="text-sm text-gray-500">Redirecting to login page in 3 seconds...</p>
                
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white font-medium py-3"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </form>

          {/* Login Link */}
          {step !== 'success' && (
            <p className="text-sm text-center text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-orange-600 hover:text-orange-800 underline font-medium">
                Back to Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
