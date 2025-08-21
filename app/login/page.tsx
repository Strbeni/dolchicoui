'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import DolchiLogo from '@/components/DolchiLogo'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, ChevronDown, Check, Edit3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Enhanced Custom Checkbox
interface CustomCheckboxProps {
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

// Properly typed interfaces
interface User {
  id: number
  name: string
  email?: string
  phoneNumber?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  isProfileComplete?: boolean
  role?: string
  createdAt?: string
  updatedAt?: string
}

interface UserCheckResponse {
  success?: boolean
  message?: string
  exists: boolean
  loginMethods?: string[]
  userRole?: string
  requiresRegistration?: boolean
  isProfileComplete?: boolean
}

interface AuthResponse {
  success?: boolean
  token?: string
  userId?: number
  requiresProfileCompletion?: boolean
  message?: string
  user?: User
}

interface SendOTPResponse {
  success: boolean
  message: string
  userId?: number
  userExists?: boolean
  contactType?: string
}

export default function UnifiedAuthComponent() {
  const router = useRouter()

  // Step and form state
  const [step, setStep] = useState(1) // 1: Contact Check, 2: Auth Flow, 3: Profile Setup
  const [contactInput, setContactInput] = useState('')
  const [contactType, setContactType] = useState<'email' | 'mobile'>('email')
  const [countryCode, setCountryCode] = useState('+91')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpBoxes, setOtpBoxes] = useState<string[]>(['', '', '', '', '', ''])
  const otpRefs = React.useRef<Array<HTMLInputElement | null>>([])
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  // User and auth state
  const [userExists, setUserExists] = useState(false)
  const [showPasswordOption, setShowPasswordOption] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  
  // Contact management
  const [verifiedContact, setVerifiedContact] = useState('')
  const [verifiedContactType, setVerifiedContactType] = useState<'email' | 'mobile'>('email')
  
  // Inline editing state
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [editContactInput, setEditContactInput] = useState('')
  const [editContactType, setEditContactType] = useState<'email' | 'mobile'>('email')
  const [editCountryCode, setEditCountryCode] = useState('+91')
  const [showEditCountryDropdown, setShowEditCountryDropdown] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const RESEND_SECONDS = 24

  // Enhanced token storage and management helper
  const setAuthTokens = React.useCallback((token: string, user?: User) => {
    setRedirecting(true) // Show redirecting state
    
    // Multi-layer persistence
    localStorage.setItem('token', token)
    sessionStorage.setItem('token', token)
    
    // Store user data if provided
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      sessionStorage.setItem('user', JSON.stringify(user))
    }
    
    // Set cookie for additional persistence
    if (typeof window !== 'undefined') {
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
    }
    
    console.log('Authentication successful, redirecting...')
  }, [])

  // Smart contact type detection
  useEffect(() => {
    const trimmedInput = contactInput.trim()
    
    if (!trimmedInput) {
      setContactType('email')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(trimmedInput)) {
      setContactType('email')
      return
    }
    
    if (trimmedInput.includes('@')) {
      setContactType('email')
      return
    }
    
    const digitsOnly = trimmedInput.replace(/\D/g, '')
    const hasMinimumDigits = digitsOnly.length >= 7
    const phoneCharRegex = /^[\+\-\s\(\)\d]+$/
    const hasValidPhoneChars = phoneCharRegex.test(trimmedInput)
    
    if (hasMinimumDigits && hasValidPhoneChars) {
      setContactType('mobile')
    } else {
      setContactType('email')
    }
  }, [contactInput])

  // Auto-detect edit contact type
  useEffect(() => {
    const trimmedInput = editContactInput.trim()
    
    if (!trimmedInput) {
      setEditContactType('email')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(trimmedInput)) {
      setEditContactType('email')
      return
    }
    
    if (trimmedInput.includes('@')) {
      setEditContactType('email')
      return
    }
    
    const digitsOnly = trimmedInput.replace(/\D/g, '')
    const hasMinimumDigits = digitsOnly.length >= 7
    const phoneCharRegex = /^[\+\-\s\(\)\d]+$/
    const hasValidPhoneChars = phoneCharRegex.test(trimmedInput)
    
    if (hasMinimumDigits && hasValidPhoneChars) {
      setEditContactType('mobile')
    } else {
      setEditContactType('email')
    }
  }, [editContactInput])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (): void => {
      if (showCountryDropdown) {
        setShowCountryDropdown(false)
      }
      if (showEditCountryDropdown) {
        setShowEditCountryDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showCountryDropdown, showEditCountryDropdown])

  // Helper function to format contact for API
  const formatContactForAPI = React.useCallback((input: string, type: 'email' | 'mobile', countryCodeVal?: string): string => {
    const trimmed = input.trim()
    
    if (type === 'email') {
      return trimmed.toLowerCase()
    }
    
    if (type === 'mobile') {
      if (trimmed.startsWith('+')) {
        return trimmed
      }
      const cleanNumber = trimmed.replace(/[\s\-\(\)]/g, '')
      const codeToUse = countryCodeVal || countryCode
      return `${codeToUse}${cleanNumber}`
    }
    
    return trimmed
  }, [countryCode])

  // Check if user exists using backend API
  const checkUserExists = React.useCallback(async (emailOrPhone: string): Promise<UserCheckResponse> => {
    if (!emailOrPhone.trim()) return { exists: false }
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
      
      const res = await fetch(`${API_BASE_URL}/api/user/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone }),
      })

      const data: UserCheckResponse = await res.json()

      if (res.ok) {
        setUserExists(data.exists)
        // Use data.loginMethods directly without storing in state
        const hasPasswordMethod = (data.loginMethods || []).includes('password')
        setShowPasswordOption(data.exists && hasPasswordMethod)
        return data
      } else {
        console.error('Check auth API error:', data)
        setUserExists(false)
        setShowPasswordOption(false)
        return { exists: false }
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUserExists(false)
      setShowPasswordOption(false)
      return { exists: false }
    }
  }, [])

  // Send OTP for new user registration
  const handleSendOTPForNewUser = React.useCallback(async (cleanContact: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
    
    const payload = contactType === 'mobile'
      ? { phoneNumber: cleanContact }
      : { email: cleanContact }

    const res = await fetch(`${API_BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data: SendOTPResponse = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data?.message || 'Failed to send OTP')
    }

    if (data.userId) {
      setUserId(data.userId)
    }

    setOtpSent(true)
    setResendTimer(RESEND_SECONDS)
  }, [contactType])

  // Send OTP for existing users
  const handleSendOTPForExistingUser = React.useCallback(async (cleanContact: string): Promise<void> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
    
    const res = await fetch(`${API_BASE_URL}/api/user/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone: cleanContact }),
    })

    const data: SendOTPResponse = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data?.message || 'Failed to send OTP')
    }

    if (data.userId) {
      setUserId(data.userId)
    }

    setOtpSent(true)
    setResendTimer(RESEND_SECONDS)
  }, [])

  // Main entry point: Handle continue from step 1
  const handleContinue = React.useCallback(async (): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      const cleanContact = formatContactForAPI(contactInput, contactType)
      setVerifiedContact(cleanContact)
      setVerifiedContactType(contactType)
      
      // Check if user exists first
      const userStatus = await checkUserExists(cleanContact)
      
      if (userStatus.exists) {
        // Existing user: Go to login flow
        setStep(2)
      } else {
        // New user: Check terms and send OTP immediately
        if (!acceptTerms) {
          setError('Please accept the Terms of Use and Privacy Policy to continue')
          return
        }
        
        await handleSendOTPForNewUser(cleanContact)
        setStep(2)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [contactInput, contactType, acceptTerms, formatContactForAPI, checkUserExists, handleSendOTPForNewUser])

  // Handle edit contact (inline editing with pencil icon)
  const handleEditContact = React.useCallback((): void => {
    setIsEditingContact(true)
    setEditContactInput(contactInput)
    setEditContactType(contactType)
    setEditCountryCode(countryCode)
    setError('')
  }, [contactInput, contactType, countryCode])

  // Save edited contact and re-check user existence
  const handleSaveEditContact = React.useCallback(async (): Promise<void> => {
    if (!editContactInput.trim()) {
      setError('Please enter a valid email or phone number')
      return
    }

    setError('')
    setLoading(true)

    try {
      const cleanContact = formatContactForAPI(editContactInput, editContactType, editCountryCode)
      
      // Update all contact states
      setContactInput(editContactInput)
      setContactType(editContactType)
      setCountryCode(editCountryCode)
      setVerifiedContact(cleanContact)
      setVerifiedContactType(editContactType)
      
      // Re-check user existence with new contact
      await checkUserExists(cleanContact)
      
      // Reset auth states
      setPassword('')
      setOtp('')
      setOtpSent(false)
      setIsEditingContact(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [editContactInput, editContactType, editCountryCode, formatContactForAPI, checkUserExists])

  // Cancel edit contact
  const handleCancelEditContact = React.useCallback((): void => {
    setIsEditingContact(false)
    setEditContactInput('')
    setError('')
  }, [])

  // Handle OTP verification with improved token handling
  const handleVerifyOTP = React.useCallback(async (): Promise<void> => {
    setError('')
    setLoading(true)

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
    const endpoint = verifiedContactType === 'mobile' ? 'verify-phone-otp' : 'verify-email-otp'
    
    const payload = verifiedContactType === 'mobile'
      ? { phoneNumber: verifiedContact, otp }
      : { email: verifiedContact, otp }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data: AuthResponse = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Invalid OTP')
      }

      if (data.requiresProfileCompletion) {
        if (data.userId) {
          setUserId(data.userId)
        }
        setStep(3)
      } else {
        // Login successful
        if (data.token) {
          setAuthTokens(data.token, data.user)
          
          // Add delay to ensure tokens are stored, then redirect
          setTimeout(() => {
            router.push('/home')
          }, 100)
        } else {
          throw new Error('No authentication token received')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [verifiedContactType, verifiedContact, otp, setAuthTokens, router])

  // Handle password login with improved token handling
  const handlePasswordLogin = React.useCallback(async (): Promise<void> => {
    setError('')
    setLoading(true)

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
    const payload = { emailOrPhone: verifiedContact, password }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data: AuthResponse = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Login failed')
      }

      // Login successful
      if (data.token) {
        setAuthTokens(data.token, data.user)
        
        // Add delay to ensure tokens are stored, then redirect
        setTimeout(() => {
          window.location.href = '/home'
        }, 100)
      } else {
        throw new Error('No authentication token received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [verifiedContact, password, setAuthTokens])

  // Handle profile completion with improved token handling
  const handleCompleteProfile = React.useCallback(async (): Promise<void> => {
    setError('')
    setLoading(true)

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
    const payload = {
      userId: userId,
      name: fullName.trim(),
      password: password
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data: AuthResponse = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Profile completion failed')
      }

      // Profile completion successful
      if (data.token) {
        setAuthTokens(data.token, data.user)
        
        // Add delay to ensure tokens are stored, then redirect
        setTimeout(() => {
          window.location.href = '/home'
        }, 100)
      } else {
        throw new Error('No authentication token received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [userId, fullName, password, setAuthTokens])

  // Handle social login
  const handleSocialLogin = React.useCallback((provider: 'google' | 'facebook'): void => {
    if (provider === 'google') {
      window.location.href = 'https://valyris-i.onrender.com/api/auth/google'
    }
  }, [])

  // Handle resend OTP with proper endpoint selection
  const handleResendOTP = React.useCallback(async (): Promise<void> => {
    if (resendTimer > 0) return

    setError('')
    setLoading(true)

    try {
      if (userExists) {
        await handleSendOTPForExistingUser(verifiedContact)
      } else {
        await handleSendOTPForNewUser(verifiedContact)
      }
      setResendTimer(RESEND_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }, [resendTimer, userExists, verifiedContact, handleSendOTPForExistingUser, handleSendOTPForNewUser])

  // OTP box handlers (mobile design)
  const handleOtpBoxChange = React.useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1)
    setOtpBoxes((prev) => {
      const next = [...prev]
      next[index] = digit
      const joined = next.join('')
      setOtp(joined)
      return next
    })
    if (digit && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleOtpKeyDown = React.useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpBoxes[index] && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1]?.focus()
    }
  }, [otpBoxes])

  const handleOtpPaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setOtpBoxes(next)
    setOtp(text)
    const nextIndex = Math.min(text.length, 5)
    otpRefs.current[nextIndex]?.focus()
  }, [])

  // Handle request OTP for existing users
  const handleRequestOTP = React.useCallback(async (): Promise<void> => {
    setError('')
    setLoading(true)

    try {
      await handleSendOTPForExistingUser(verifiedContact)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }, [verifiedContact, handleSendOTPForExistingUser])

  // Utility functions
  const handleContactBlur = React.useCallback((): void => {
    if (contactInput.trim()) {
      const cleanContact = formatContactForAPI(contactInput, contactType)
      void checkUserExists(cleanContact)
    }
  }, [contactInput, contactType, formatContactForAPI, checkUserExists])

  const handleCountrySelect = React.useCallback((countryCodeValue: string): void => {
    setCountryCode(countryCodeValue)
    setShowCountryDropdown(false)
  }, [])

  const handleEditCountrySelect = React.useCallback((countryCodeValue: string): void => {
    setEditCountryCode(countryCodeValue)
    setShowEditCountryDropdown(false)
  }, [])

  const toggleCountryDropdown = React.useCallback((e: React.MouseEvent): void => {
    e.stopPropagation()
    setShowCountryDropdown(!showCountryDropdown)
  }, [showCountryDropdown])

  const toggleEditCountryDropdown = React.useCallback((e: React.MouseEvent): void => {
    e.stopPropagation()
    setShowEditCountryDropdown(!showEditCountryDropdown)
  }, [showEditCountryDropdown])

  const handleCountryDropdownClick = React.useCallback((e: React.MouseEvent, countryCodeValue: string): void => {
    e.stopPropagation()
    handleCountrySelect(countryCodeValue)
  }, [handleCountrySelect])

  const handleEditCountryDropdownClick = React.useCallback((e: React.MouseEvent, countryCodeValue: string): void => {
    e.stopPropagation()
    handleEditCountrySelect(countryCodeValue)
  }, [handleEditCountrySelect])

  return (
    <div className="min-h-screen md:bg-none bg-white relative">
      <div className="">
        <div className="flex min-h-screen">
          {/* Left Image */}
          <div className="relative w-1/2 hidden lg:block">
            <Image 
              src="/banner.svg" 
              alt="Auth Visual" 
              fill 
              className="object-cover" 
              priority 
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex flex-col justify-center px-14 text-white">
              <DolchiLogo className="h-12 w-auto mb-6" width={160} height={52} />
              <h1 className="text-5xl font-semibold leading-tight max-w-xl">
                Fashion Moves Fast
                <br />
                 Stay Ahead
              </h1>
              <p className="mt-6 text-lg max-w-lg opacity-90">
                Discover fashion that reflects your values and your style. Sustainably sourced, thoughtfully designed, endlessly stylish.
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-3 sm:p-6 md:p-8 lg:px-20">
            <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
              {/* Mobile hero header */}
              <div className="lg:hidden relative h-70 -mx-5 sm:-mx-6 md:-mx-8 mb-2 overflow-hidden rounded-b-md">
                <Image src="/banner.svg" alt="Welcome" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
                  <Link href="/home" aria-label="Go to Home">
                    <DolchiLogo className="h-8 w-auto mb-0" width={120} height={40} />
                  </Link>
                  <p className="text-white text-base font-medium">Welcome to the DOLCHI</p>
                  <p className="text-white/80 text-xs">One Account. Endless Style.</p>
                </div>
              </div>
              
              {/* Step 1: Unified Contact Input & User Detection */}
              {step === 1 && (
                <>
                  <div className="hidden lg:block text-center space-y-1">
                    <Link href="/home" aria-label="Go to Home">
                      <DolchiLogo className="h-10 w-auto mx-auto mb-2" width={120} height={40} />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome to the DOLCHI</h1>
                    <p className="text-gray-500 text-sm">One Account. Endless Style.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

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
                      className="w-full h-12 flex items-center justify-center gap-3 bg-[#1877f2] hover:bg-[#166fe0] text-white font-medium"
                    >
                      <Image src="/facebook.svg" alt="Facebook" width={20} height={20} />
                      <span>Continue with Facebook</span>
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="contact" className="text-sm font-medium text-gray-700">
                      Email / mobile no.
                    </Label>
                    <div className="flex">
                      {contactType === 'mobile' && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={toggleCountryDropdown}
                            className="flex items-center gap-2 px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors min-w-[80px] h-12"
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
                                  onClick={(e) => handleCountryDropdownClick(e, country.code)}
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
                        className={`${contactType === 'mobile' ? 'rounded-l-none' : ''} h-12`}
                        autoComplete={contactType === 'mobile' ? 'tel' : 'email'}
                        onBlur={handleContactBlur}
                        placeholder={contactType === 'mobile' ? 'Enter mobile number*' : 'Enter your email / mobile number*'}
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="pt-0.5">
                      <CustomCheckbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={setAcceptTerms}
                      />
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed flex-1">
                      <Label htmlFor="terms" className="cursor-pointer block">
                        By continuing you agree to the{' '}
                        <Link href="/terms" className="text-[#d9673f] underline font-semibold">Terms of Uses</Link>
                        {' '} & Privacy Policy and I am above 18 years old.
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={handleContinue}
                    disabled={loading || !contactInput.trim() || !acceptTerms}
                    className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white disabled:opacity-50 h-12 font-semibold tracking-wide text-base"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Checking...
                      </span>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </>
              )}

              {/* Step 2: Smart Authentication Flow (Login/Register) */}
              {step === 2 && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                      {userExists ? 'Welcome back to the DOLCHI' : 'Create your profile'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {userExists ? 'Sign in your account' : 'Please provide your full name and create a password'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Contact display with edit option */}
                  {!isEditingContact && (
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs text-gray-500 uppercase font-medium">
                            {verifiedContactType === 'mobile' ? 'Phone Number' : 'Email Address'}
                          </Label>
                          <p className="text-sm font-medium text-gray-800">
                            {verifiedContact}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleEditContact}
                          className="p-2 text-gray-400 hover:text-[#d9673f] transition-colors rounded-md hover:bg-white"
                          title="Edit contact"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline contact editing form */}
                  {isEditingContact && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                      <div className="space-y-2">
                        <Label className="uppercase text-xs text-orange-600 font-semibold tracking-wide">
                          Edit Email/Mobile No.
                        </Label>
                        <div className="flex">
                          {editContactType === 'mobile' && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={toggleEditCountryDropdown}
                                className="flex items-center gap-2 px-3 py-2 border border-r-0 rounded-l-md bg-white hover:bg-gray-50 transition-colors min-w-[80px] h-10"
                              >
                                <span className="text-lg">{countryCodes.find(c => c.code === editCountryCode)?.flag}</span>
                                <span className="text-sm font-medium">{editCountryCode}</span>
                                <ChevronDown size={14} className={`transition-transform ${showEditCountryDropdown ? 'rotate-180' : ''}`} />
                              </button>
                              
                              {showEditCountryDropdown && (
                                <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-20 w-48 max-h-48 overflow-y-auto">
                                  {countryCodes.map((country) => (
                                    <button
                                      key={country.code}
                                      type="button"
                                      onClick={(e) => handleEditCountryDropdownClick(e, country.code)}
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
                            type="text"
                            value={editContactInput}
                            onChange={(e) => setEditContactInput(e.target.value)}
                            className={`${editContactType === 'mobile' ? 'rounded-l-none' : ''} h-10`}
                            autoComplete={editContactType === 'mobile' ? 'tel' : 'email'}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEditContact}
                          disabled={loading || !editContactInput.trim()}
                          className="flex-1 bg-[#d9673f] hover:bg-[#c2552d] text-white h-9 text-sm"
                        >
                          {loading ? 'Updating...' : 'Update'}
                        </Button>
                        <Button
                          onClick={handleCancelEditContact}
                          variant="outline"
                          className="flex-1 h-9 text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing users: Password first, then OTP option */}
                  {userExists && showPasswordOption && !isEditingContact && (
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
                        disabled={loading || !password.trim()}
                        className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white h-11 font-medium tracking-wide"
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                        {!loading && <ArrowRight className="ml-2" size={18} />}
                      </Button>

                      <Button
                        onClick={handleRequestOTP}
                        disabled={loading || otpSent}
                        variant="outline"
                        className="w-full h-11 font-medium tracking-wide border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white"
                      >
                        {loading ? 'Sending OTP...' : otpSent ? 'OTP Sent' : 'Send OTP Instead'}
                      </Button>

                      <div className="text-center">
                        <Link 
                          href="/forgotpassword" 
                          className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* OTP Input: For new users (always show) OR existing users who requested OTP */}
                  {((otpSent && userExists) || !userExists) && !isEditingContact && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="uppercase text-xs text-orange-600 font-medium">
                          Verification code
                        </Label>
                        <div className="flex items-center gap-3" onPaste={handleOtpPaste}>
                          {otpBoxes.map((val, idx) => (
                            <Input
                              key={idx}
                              ref={(el) => { otpRefs.current[idx] = el }}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="w-12 h-12 text-center text-lg"
                              value={val}
                              onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              maxLength={1}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">Please enter the one-time password sent to your phone.</p>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={resendTimer > 0 || loading}
                          className="text-sm text-orange-600 hover:text-orange-700 underline disabled:text-gray-400 disabled:no-underline transition-colors"
                        >
                          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : `Resend OTP in ${RESEND_SECONDS}s`}
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
                    </>
                  )}
                </>
              )}

              {/* Step 3: Profile Setup (Only for new users) */}
              {step === 3 && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Create your profile</h2>
                    <p className="text-sm text-gray-600">Please provide your full name and create a password</p>
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
                      <p className="text-xs text-gray-600">Password must be at least 1 number, 1 capital letter, and 6 - 12 character long</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteProfile}
                    disabled={loading || !fullName.trim() || !password.trim()}
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
      {/* Loading overlay during redirect */}
      {redirecting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-0 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#d9673f] border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 font-medium">Logging you in...</span>
          </div>
        </div>
      )}
    </div>
  );
}
