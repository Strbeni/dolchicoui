"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import DolchiLogo from "@/components/DolchiLogo"

// Types for better type safety
interface ApiResponse {
  success: boolean
  message: string
}

type StepType = "emailInput" | "otpInput" | "passwordReset" | "success"

export default function ForgotPassword() {
  const router = useRouter()

  // State management
  const [step, setStep] = useState<StepType>("emailInput")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpBoxes, setOtpBoxes] = useState<string[]>(["", "", "", "", "", ""]) 
  const otpRefs = useState<Array<HTMLInputElement | null>>([])[0]
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // API Configuration
  const API_BASE = "http://localhost:4000/api/user"
  const RESEND_SECONDS = 24

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push("At least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter")
    if (!/\d/.test(password)) errors.push("One number")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("One special character")
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        if (err.name === "AbortError") {
          throw new Error("Request timeout. Please try again.")
        }
        throw new Error(err.message)
      }
      throw new Error("An unexpected error occurred.")
    }
  }

  // Send OTP to email
  const sendOtp = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await apiCall("/forgot-password", { email })
      setSuccess(data.message || "OTP sent successfully!")
      setStep("otpInput")
      setResendCooldown(RESEND_SECONDS) // Start cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP")
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
      setError("Please enter a valid 6-digit OTP.")
      return
    }
    setError(null)
    setStep("passwordReset")
  }, [otp])

  // Reset password
  const resetPassword = useCallback(async () => {
    setError(null)

    // Client-side validation
    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(", ")}`)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const data = await apiCall("/reset-password", {
        email,
        otp,
        newPassword,
      })

      setSuccess(data.message || "Password reset successfully!")
      setStep("success")

      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
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
  // OTP box handlers (mobile design)
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    resetPassword()
  }

  // Get current form handler based on step
  const getCurrentFormHandler = () => {
    switch (step) {
      case "emailInput":
        return handleEmailSubmit
      case "otpInput":
        return handleOtpSubmit
      case "passwordReset":
        return handlePasswordSubmit
      default:
        return (e: React.FormEvent) => e.preventDefault()
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
          <h1 className="text-5xl font-semibold leading-tight max-w-xl">Fashion Moves Fast<br />
             Stay Ahead</h1>
          <p className="mt-6 text-lg max-w-lg opacity-90">Discover fashion that reflects your values and your style. Sustainably sourced, thoughtfully designed, endlessly stylish.</p>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Logo */}
        
        <div className="lg:hidden bg-gradient-to-r from-blue-400 to-purple-400 p-0 text-center">
          <div className="relative h-70 w-full overflow-hidden">
            <Image src="/banner.svg" alt="Welcome" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
              <a href="/home" aria-label="Go to Home">
                <DolchiLogo className="h-8 w-auto mb-1" width={120} height={40} />
              </a>
              <p className="text-white text-base font-medium">Welcome to the DOLCHI</p>
              <p className="text-white/80 text-xs">One Account. Endless Style.</p>
            </div>
          </div>
        
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Desktop Logo */}
            <div className="hidden lg:block text-center mb-8">
              <DolchiLogo className="h-10 w-auto mx-auto mb-4" width={120} height={40} />
            
            </div>

            {/* Step Title */}
            <div className="text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {step === "emailInput" && "Forgot password"}
                {step === "otpInput" && "Verify your email"}
                {step === "passwordReset" && "Reset password"}
                {step === "success" && "Success!"}
              </h2>

              {step === "emailInput" && (
                <p className="text-sm text-gray-600">Enter your email to receive a reset OTP</p>
              )}
              {step === "otpInput" && (
                <p className="text-sm text-gray-600">Enter OTP send on your email for reset password</p>
              )}
              {step === "passwordReset" && <p className="text-sm text-gray-600">Enter your new password to reset</p>}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={getCurrentFormHandler()} className="space-y-6">
              {/* Step 1: Email Input */}
              {step === "emailInput" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email / mobile no.</label>
                    <Input
                      type="email"
                      placeholder="Enter Email/Phone Number.."
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                  >
                    {loading ? "Sending..." : "Continue"}
                  </Button>

                  <p className="text-sm text-center text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-[#ff6b35] hover:underline font-medium">
                      back to login
                    </Link>
                  </p>
                </>
              )}

              {/* Step 2: OTP Input */}
              {step === "otpInput" && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="text-[#ff6b35] font-medium">{email}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
                    <div className="flex items-center gap-3" onPaste={handleOtpPaste}>
                      {otpBoxes.map((val, idx) => (
                        <Input
                          key={idx}
                          ref={(el) => { otpRefs[idx] = el }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-12 h-12 text-center text-lg"
                          value={val}
                          onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          maxLength={1}
                          disabled={loading}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Please enter the one-time password sent to your phone.</p>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={loading || resendCooldown > 0}
                      className="text-[#ff6b35] hover:underline text-sm disabled:text-gray-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : `Resend OTP in ${RESEND_SECONDS}s`}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                  >
                    Continue
                  </Button>
                </>
              )}

              {/* Step 3: Password Reset */}
              {step === "passwordReset" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter new password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password*"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Re-enter password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="New Password*"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || validatePassword(newPassword).length > 0 || newPassword !== confirmPassword}
                    className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                  >
                    {loading ? "Resetting..." : "Continue"}
                  </Button>

                  <p className="text-sm text-center text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-[#ff6b35] hover:underline font-medium">
                      back to login
                    </Link>
                  </p>
                </>
              )}

              {/* Step 4: Success */}
              {step === "success" && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Password Reset Successful!</h3>
                  <p className="text-gray-600">Your password has been updated successfully.</p>
                  <p className="text-sm text-gray-500">Redirecting to login page in 3 seconds...</p>

                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
