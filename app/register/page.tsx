'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, ChevronDown, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Enhanced Custom Checkbox with perfect alignment
type CustomCheckboxProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
}

const CustomCheckbox = ({ checked, onCheckedChange, id, className = "" }: CustomCheckboxProps) => {
  return (
    <button
      type="button"
      id={id}
      onClick={() => onCheckedChange(!checked)}
      className={`
        flex items-center justify-center w-4 h-4 border-2 rounded transition-all duration-200 flex-shrink-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9673f] focus-visible:ring-offset-2
        ${checked 
          ? 'bg-[#d9673f] border-[#d9673f] text-white shadow-sm' 
          : 'bg-white border-gray-300 hover:border-[#d9673f] hover:shadow-sm'
        }
        ${className}
      `}
    >
      {checked && <Check size={10} strokeWidth={3} />}
    </button>
  )
}

// Country codes data
const countryCodes = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "UK", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
]

export default function AuthPage() {
  const [step, setStep] = useState(1) // 1: Contact, 2: OTP, 3: Profile Setup
  const [contactInput, setContactInput] = useState('')
  const [contactType, setContactType] = useState<'email' | 'mobile'>('email')
  const [countryCode, setCountryCode] = useState('+91')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [userId, setUserId] = useState<number | null>(null)

  const router = useRouter()

  // Auto-detect contact type and validate
  useEffect(() => {
    const trimmedInput = contactInput.trim()
    const isPhone = /^\d+$/.test(trimmedInput)
    setContactType(isPhone ? 'mobile' : 'email')
  }, [contactInput])

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (showCountryDropdown) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showCountryDropdown])

  const validateInput = () => {
    const trimmedInput = contactInput.trim()
    if (!trimmedInput) {
      setError('Please enter your email or mobile number')
      return false
    }
    
    if (contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedInput)) {
        setError('Please enter a valid email address')
        return false
      }
    } else {
      if (trimmedInput.length < 10) {
        setError('Please enter a valid mobile number')
        return false
      }
    }
    
    if (!acceptTerms) {
      setError('Please accept terms and conditions to continue')
      return false
    }
    
    return true
  }

  // ✅ Uses registerUser controller function
  const handleSendOTP = async () => {
    if (!validateInput()) return

    setError('')
    setLoading(true)

    const payload = contactType === 'mobile'
      ? { phoneNumber: `${countryCode}${contactInput.trim()}` }
      : { email: contactInput.trim() }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to send OTP')
      }

      setUserId(data.userId)
      setStep(2)
      setResendTimer(30)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Uses verifyEmailOtp or verifyPhoneOtp controller functions
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setError('')
    setLoading(true)

    // ✅ Use specific endpoints based on contact type (matching controller)
    const endpoint = contactType === 'mobile' ? 'verify-phone-otp' : 'verify-email-otp'
    const payload = contactType === 'mobile'
      ? { phoneNumber: `${countryCode}${contactInput.trim()}`, otp }
      : { email: contactInput.trim(), otp }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/user/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Invalid OTP')
      }

      // ✅ Check response based on controller logic
      if (data.requiresProfileCompletion) {
        setUserId(data.userId)
        setStep(3) // Go to profile completion
      } else {
        // User already has complete profile - login successful
        localStorage.setItem('token', data.token)
        sessionStorage.setItem('token', data.token)
        router.push('/home')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Uses loginUser controller function
  const handlePasswordLogin = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    setError('')
    setLoading(true)

    const payload = contactType === 'mobile'
      ? { phoneNumber: `${countryCode}${contactInput.trim()}`, password }
      : { email: contactInput.trim(), password }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      sessionStorage.setItem('token', data.token)
      router.push('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Uses completeProfile controller function
  const handleCompleteProfile = async () => {
    if (!fullName.trim() || !password) {
      setError('Please fill all required fields')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setError('')
    setLoading(true)

    const payload = {
      userId: userId,
      name: fullName.trim(),
      password: password
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/user/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Profile completion failed')
      }

      localStorage.setItem('token', data.token)
      sessionStorage.setItem('token', data.token)
      router.push('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    if (!acceptTerms && step === 1) {
      setError('Please accept terms and conditions to continue')
      return
    }
    
    if (provider === 'google') {
      window.location.href = 'https://valyris-i.onrender.com/api/auth/google'
    }
  }

  // ✅ Resend by calling register again (as per controller logic)
  const handleResendOTP = async () => {
    if (resendTimer > 0) return

    setError('')
    setLoading(true)

    const payload = contactType === 'mobile'
      ? { phoneNumber: `${countryCode}${contactInput.trim()}` }
      : { email: contactInput.trim() }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to resend OTP')
      }

      setResendTimer(30)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('/login.svg')] md:bg-none bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-black/30 md:bg-transparent">
        <div className="flex min-h-screen">
          {/* Left Image */}
          <div className="relative w-1/2 hidden lg:block">
            <Image 
              src="/login.svg" 
              alt="Auth Visual" 
              fill 
              className="object-cover" 
              priority 
            />
          </div>

          {/* Right Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:px-20">
            <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
              
              {/* Step 1: Contact Input */}
              {step === 1 && (
                <>
                  <div className="text-center space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                      Welcome Back
                    </h1>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="contact" className="uppercase text-xs text-orange-600 font-semibold tracking-wide">
                      Email/Mobile No.
                    </Label>
                    <div className="flex">
                      {contactType === 'mobile' && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowCountryDropdown(!showCountryDropdown)
                            }}
                            className="flex items-center gap-2 px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors min-w-[80px] h-10"
                          >
                            <span className="text-lg">{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                            <span className="text-sm font-medium">{countryCode}</span>
                            <ChevronDown size={14} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {showCountryDropdown && (
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-20 w-48 max-h-48 overflow-y-auto">
                              {countryCodes.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCountryCode(country.code)
                                    setShowCountryDropdown(false)
                                  }}
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 w-full text-left text-sm transition-colors"
                                >
                                  <span className="text-lg">{country.flag}</span>
                                  <span className="font-medium">{country.code}</span>
                                  <span className="text-gray-600 text-xs">{country.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <Input
                        id="contact"
                        type="text"
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        className={`${contactType === 'mobile' ? 'rounded-l-none' : ''} h-10`}
                        autoComplete={contactType === 'mobile' ? 'tel' : 'email'}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={loading || !contactInput.trim() || !acceptTerms}
                    className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white disabled:opacity-50 h-12 font-semibold tracking-wide text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Continue
                        <ArrowRight size={18} />
                      </span>
                    )}
                  </Button>

                  {/* Terms and Conditions Below Button */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="pt-0.5">
                      <CustomCheckbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={setAcceptTerms}
                      />
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed flex-1">
                      <Label htmlFor="terms" className="cursor-pointer block">
                        By continuing, I agree to the{' '}
                        <Link 
                          href="/terms" 
                          className="text-[#d9673f] hover:text-[#c2552d] underline font-semibold transition-colors duration-200 hover:decoration-2"
                        >
                          Terms of Use
                        </Link>{' '}
                        and{' '}
                        <Link 
                          href="/privacy" 
                          className="text-[#d9673f] hover:text-[#c2552d] underline font-semibold transition-colors duration-200 hover:decoration-2"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <hr className="flex-grow border-gray-300" />
                    <span className="px-2 bg-white text-gray-400 font-medium">Continue with</span>
                    <hr className="flex-grow border-gray-300" />
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-3">
                    <Button 
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      variant="outline"
                      className="w-full h-12 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200 border-2 font-medium"
                    >
                      <Image src="/google.svg" alt="Google" width={20} height={20} />
                      <span>Continue with Google</span>
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => handleSocialLogin('facebook')}
                      variant="outline"
                      className="w-full h-12 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200 border-2 font-medium"
                    >
                      <Image src="/facebook.svg" alt="Facebook" width={20} height={20} />
                      <span>Continue with Facebook</span>
                    </Button>
                  </div>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Verify Your Identity</h2>
                    <p className="text-sm text-gray-600">
                      We've sent a verification code to{' '}
                      <span className="font-semibold text-[#d9673f]">
                        {contactType === 'mobile' ? `${countryCode}${contactInput}` : contactInput}
                      </span>
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="uppercase text-xs text-orange-600 font-medium">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="text-center text-lg tracking-widest h-12 font-medium"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                      className="text-sm text-orange-600 hover:text-orange-700 underline disabled:text-gray-400 disabled:no-underline transition-colors"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white h-11 font-medium tracking-wide"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                    {!loading && <ArrowRight className="ml-2" size={18} />}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <hr className="flex-grow border-gray-300" />
                    <span className="px-2">or</span>
                    <hr className="flex-grow border-gray-300" />
                  </div>

                  {/* Password Login Option */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="uppercase text-xs text-orange-600 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 h-10"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handlePasswordLogin}
                      disabled={loading || !password}
                      variant="outline"
                      className="w-full h-11 font-medium tracking-wide border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white"
                    >
                      {loading ? 'Signing In...' : 'Login with Password'}
                      {!loading && <ArrowRight className="ml-2" size={18} />}
                    </Button>
                  </div>

                  <div className="text-center space-y-2">
                    <Link 
                      href="/forgotpassword" 
                      className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                    >
                      Forgot Password?


                  
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-orange-600 hover:text-orange-700 underline mx-auto block transition-colors"
                  >
                    Change Email/Mobile
                  </button>
                </>
              )}

              {/* Step 3: Profile Setup (Name and Password) */}
              {step === 3 && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Complete Your Profile</h2>
                    <p className="text-sm text-gray-600">
                      Please provide your full name and create a password
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="uppercase text-xs text-orange-600 font-medium">Full Name</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-10"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-xs text-orange-600 font-medium">Create Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                          className="pr-10 h-10"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {password && password.length < 8 && (
                        <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteProfile}
                    disabled={loading || !fullName.trim() || !password || password.length < 8}
                    className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white h-11 font-medium tracking-wide"
                  >
                    {loading ? 'Creating Account...' : 'Complete Setup'}
                    {!loading && <ArrowRight className="ml-2" size={18} />}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
