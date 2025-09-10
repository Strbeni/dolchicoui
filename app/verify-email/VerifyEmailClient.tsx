"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, RefreshCw, AlertCircle } from "lucide-react"
import DolchiLogo from "@/components/DolchiLogo"

interface User {
  id: string
  name?: string
  email: string
  phoneNumber?: string
  emailVerified: boolean
  phoneVerified: boolean
  isProfileComplete: boolean
  role: string
}

interface VerificationResponse {
  success: boolean
  message: string
  token?: string
  user?: User
  requiresProfileCompletion?: boolean
  nextStep?: string
  errorCode?: string
}

export default function VerifyEmailClient() {
  const [status, setStatus] = useState<"idle" | "loading" | "verified" | "invalid" | "error">("idle")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpBoxes, setOtpBoxes] = useState<string[]>(["", "", "", "", "", ""])
  const otpRefs = useState<Array<HTMLInputElement | null>>([])[0]
  const [message, setMessage] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Autofill email from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastContact = localStorage.getItem("dolchi_last_contact") || ""
      if (lastContact && !email) {
        setEmail(lastContact)
      }
    }
  }, [email])

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

  // Handle URL token verification
  useEffect(() => {
    const urlToken = searchParams.get("token")
    const urlEmail = searchParams.get("email")

    if (urlEmail) {
      setEmail(urlEmail)
    }

    // If there's a token in URL, verify it directly
    if (urlToken) {
      verifyEmailToken(urlToken)
      return
    }

    // Otherwise, show OTP verification form
    setStatus("invalid")
  }, [searchParams])

  // Helper function to handle successful verification
  const handleSuccessfulVerification = (data: VerificationResponse) => {
    console.log('[VerifyEmail] Successful verification data:', data)
    
    // Store auth token if provided
    if (data.token) {
      localStorage.setItem('dolchi_auth_token', data.token)
      localStorage.setItem('token', data.token)
      console.log('[VerifyEmail] Auth token stored')
    }

    // Store user data if provided
    if (data.user) {
      localStorage.setItem('dolchi_user_data', JSON.stringify(data.user))
      localStorage.setItem('user', JSON.stringify(data.user))
      console.log('[VerifyEmail] User data stored:', data.user)
    }

    setVerificationData(data)
    setStatus("verified")
    setMessage(data.message || "Email verified successfully!")

    // Store verification completion flag
    localStorage.setItem('email_verified', 'true')
    localStorage.setItem('verification_timestamp', Date.now().toString())

    // Check if profile is complete and redirect accordingly
    const isProfileComplete = data.user?.isProfileComplete
    
    if (isProfileComplete) {
      console.log('[VerifyEmail] Profile is complete, redirecting to home page')
      setTimeout(() => {
        router.push("/home")
      }, 2000)
    } else {
      console.log('[VerifyEmail] Profile incomplete, redirecting to profile setup')
      // Store flow information for profile completion
      localStorage.setItem('auth_flow', 'email-verification-complete')
      localStorage.setItem('verified_user_id', data.user?.id || '')
      localStorage.setItem('requires_profile_setup', 'true')
      
      setTimeout(() => {
        router.push("/profile-setup")
      }, 2000)
    }
  }

  const verifyEmailToken = async (token: string) => {
    setStatus("loading")
    setMessage("")

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

      console.log(`[v0] Verifying token:`, token)
      console.log(`[v0] Using API base URL:`, API_BASE_URL)

      const res = await fetch(`${API_BASE_URL}/api/user/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      console.log(`[v0] Token verification response status:`, res.status)

      // Handle HTML error responses
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error('[v0] Server returned non-JSON response')
        throw new Error("API endpoint not available. Please contact support.")
      }

      const data: VerificationResponse = await res.json()
      console.log(`[v0] Parsed response data:`, data)

      if (!res.ok) {
        console.error(`[v0] Verification API error:`, res.status, data)
        
        // Handle specific error codes
        switch (data.errorCode) {
          case 'INVALID_TOKEN':
            setMessage("Invalid or expired verification token. Please request a new verification email.")
            break
          case 'TOKEN_EXPIRED':
            setMessage("Verification token has expired. Please request a new verification email.")
            break
          case 'TOKEN_USED':
            setMessage("This verification link has already been used.")
            break
          case 'USER_NOT_FOUND':
            setMessage("User account not found. Please register again.")
            break
          default:
            setMessage(data.message || `Verification failed (${res.status}). Please try again.`)
        }
        
        setStatus("invalid")
        return
      }

      if (!data.success) {
        setMessage(data.message || "Email verification failed")
        setStatus("invalid")
        return
      }

      console.log(`[v0] Email verified successfully`)
      handleSuccessfulVerification(data)

    } catch (err) {
      console.error(`[v0] Token verification error:`, err)
      setStatus("invalid")
      if (err instanceof Error) {
        setMessage(err.message)
      } else {
        setMessage("An unexpected error occurred during verification")
      }
    }
  }

  const handleResendEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email)) {
      setMessage("Please enter a valid email address.")
      return
    }

    if (resendCooldown > 0) {
      setMessage(`Please wait ${resendCooldown} seconds before requesting another email.`)
      return
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

      console.log(`[v0] Resending verification email to:`, email)
      
      const res = await fetch(`${API_BASE_URL}/api/user/resend-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      // Handle HTML error responses
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API endpoint not available. Please contact support.")
      }

      const data = await res.json()

      if (!res.ok) {
        console.error(`[v0] Resend email API error:`, res.status, data)
        throw new Error(data?.message || `Failed to resend email (${res.status}). Please try again.`)
      }

      if (!data.success) {
        throw new Error(data?.message || "Failed to resend verification email")
      }

      console.log(`[v0] Verification email resent successfully`)
      setMessage("A new verification email has been sent to your email address.")
      setResendCooldown(60) // 60 seconds cooldown
    } catch (err) {
      console.error(`[v0] Resend email error:`, err)
      if (err instanceof Error) {
        setMessage(err.message)
      } else {
        setMessage("Failed to resend verification email. Please try again.")
      }
    }
  }

  const handleVerifyOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email)) {
      setMessage("Please enter a valid email address.")
      return
    }

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit OTP.")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

      console.log(`[v0] Verifying OTP for:`, email)
      
      const res = await fetch(`${API_BASE_URL}/api/user/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      })

      // Handle HTML error responses
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API endpoint not available. Please contact support.")
      }

      const data: VerificationResponse = await res.json()

      if (!res.ok) {
        console.error(`[v0] OTP verification API error:`, res.status, data)
        setStatus("invalid")
        setMessage(data.message || `OTP verification failed (${res.status}). Please try again.`)
        return
      }

      if (!data.success) {
        setStatus("invalid")
        setMessage(data.message || "OTP verification failed")
        return
      }

      console.log(`[v0] OTP verified successfully`)
      handleSuccessfulVerification(data)

    } catch (err) {
      console.error(`[v0] OTP verification error:`, err)
      setStatus("invalid")
      if (err instanceof Error) {
        setMessage(err.message)
      } else {
        setMessage("OTP verification failed. Please try again.")
      }
    }
  }

  // OTP box handlers
  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1)
    const next = [...otpBoxes]
    next[index] = digit
    setOtpBoxes(next)
    setOtp(next.join(""))
    if (digit && otpRefs[index + 1]) otpRefs[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpBoxes[index] && otpRefs[index - 1]) otpRefs[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = ["", "", "", "", "", ""]
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setOtpBoxes(next)
    setOtp(text)
  }

  const handleManualRedirect = () => {
    // Check profile completion status before redirecting
    const isProfileComplete = verificationData?.user?.isProfileComplete
    
    if (isProfileComplete) {
      router.push("/home")
    } else {
      // Store flow information before redirect
      localStorage.setItem('auth_flow', 'email-verification-complete')
      localStorage.setItem('verified_user_id', verificationData?.user?.id || '')
      localStorage.setItem('requires_profile_setup', 'true')
      router.push("/profile-setup")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/banner.svg" alt="Fashion Models" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col justify-center px-14 text-white">
          <DolchiLogo className="h-12 w-auto mb-6" width={160} height={52} />
          <h1 className="text-5xl font-semibold leading-tight max-w-xl">
            Fashion Moves Fast
            <br /> Stay Ahead
          </h1>
          <p className="mt-6 text-lg max-w-lg opacity-90">
            Discover fashion that reflects your values and your style. Sustainably sourced, thoughtfully designed,
            endlessly stylish.
          </p>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden p-0 text-center">
          <div className="relative h-40 w-full overflow-hidden">
            <Image src="/banner.svg" alt="Welcome" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
              <Link href="/home" aria-label="Go to Home">
                <DolchiLogo className="h-8 w-auto" width={120} height={40} />
              </Link>
              <p className="text-white text-base font-medium">Welcome to DOLCHI</p>
              <p className="text-white/80 text-xs">One Account. Endless Style.</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Desktop Logo */}
            <div className="hidden lg:block text-center mb-8">
              <Link href="/home" aria-label="Go to Home">
                <DolchiLogo className="h-10 w-auto mx-auto mb-4" width={120} height={40} />
              </Link>
              <h1 className="text-gray-600 text-lg">Welcome to DOLCHI</h1>
              <p className="text-gray-500 text-sm">One Account. Endless Style.</p>
            </div>

            {/* Content based on status */}
            {status === "loading" && (
              <div className="text-center space-y-4">
                <div className="animate-spin mx-auto w-8 h-8">
                  <RefreshCw className="w-8 h-8 text-[#ff6b35]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Verifying...</h2>
                <p className="text-gray-600">Please wait while we verify your email.</p>
              </div>
            )}

            {status === "verified" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
                <p className="text-green-600">{message}</p>
                
                {verificationData?.user && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 text-sm">
                    <p className="text-green-800">
                      Welcome, <strong>{verificationData.user.name || verificationData.user.email}!</strong>
                    </p>
                    <p className="text-green-700 mt-1">
                      {verificationData.user.isProfileComplete 
                        ? "Redirecting to your dashboard..." 
                        : "Redirecting to complete your profile..."}
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={handleManualRedirect}
                  className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                >
                  {verificationData?.user?.isProfileComplete ? "Go to Home" : "Complete Your Profile"}
                </Button>
              </div>
            )}

            {(status === "idle" || status === "invalid") && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify your email</h2>
                  <p className="text-sm text-gray-600">Enter OTP sent to your email address</p>
                </div>

                {message && (
                  <div className={`border px-4 py-3 rounded-md text-sm ${
                    message.includes("sent") || message.includes("successfully") 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    <div className="flex items-start">
                      {message.includes("sent") || message.includes("successfully") ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      )}
                      <span>{message}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                    <div className="flex items-center gap-3" onPaste={handleOtpPaste}>
                      {otpBoxes.map((val, idx) => (
                        <Input
                          key={idx}
                          ref={(el) => {
                            otpRefs[idx] = el
                          }}
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
                    <p className="text-xs text-gray-500 mt-1">Please enter the 6-digit code sent to your email.</p>
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || !email}
                    className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg disabled:opacity-50"
                  >
                    Verify Email
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={resendCooldown > 0}
                      className="text-[#ff6b35] hover:underline text-sm disabled:text-gray-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend Email in ${resendCooldown}s` : "Resend Verification Email"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
                <p className="text-red-600">Something went wrong. Please try again later.</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
