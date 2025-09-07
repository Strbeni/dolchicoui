"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { DatePickerComponent } from "@/components/ui/date-picker";
import {
  updateUser,
  selectUser,
  selectUserLoading,
  selectUserError
} from "@/lib/store/userSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const toast = (msg: string, ok = true) => {
  if (typeof window === 'undefined') return;
  const el = document.createElement('div');
  el.textContent = msg;
  el.className = `fixed top-4 right-4 px-4 py-2 rounded shadow text-white z-50 transition-all duration-300 ${
    ok ? 'bg-green-600' : 'bg-red-600'
  }`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => el.remove(), 300);
  }, 2700);
};

export default function AccountSettings() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const userLoading = useAppSelector(selectUserLoading);
  const userError = useAppSelector(selectUserError);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [language, setLanguage] = useState("English");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("USA");
  const [state, setState] = useState("California");
  const [zip, setZip] = useState("");

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempEmailContact, setTempEmailContact] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [showEmailOtpContact, setShowEmailOtpContact] = useState(false);
  const [emailOtpContact, setEmailOtpContact] = useState("");
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [basicEmailOtpLoading, setBasicEmailOtpLoading] = useState(false);
  const [passwordResetVerifyLoading, setPasswordResetVerifyLoading] = useState(false);

  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [isEmailChanged, setIsEmailChanged] = useState(false);

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetOtp, setPasswordResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDeleteOtp, setShowDeleteOtp] = useState(false);
  const [deleteEmailOtp, setDeleteEmailOtp] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      setFullName(user.fullName || "");
      setCountry(user.country || "INDIA");
      setState(user.state || "PUNJAB");
      setZip(user.zip || "");

      const nameParts = (user.name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setDateOfBirth((user as any).dateOfBirth ? new Date((user as any).dateOfBirth) : undefined);
      setLanguage((user as any).language || "English");
      setIsEmailVerified(!!user?.email);
      setIsPhoneVerified(!!user?.phoneNumber);
    }
  }, [user]);

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast('Authentication required. Redirecting to login...', false);
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (userError) {
      toast(userError, false);
    }
  }, [userError]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowEmailOtp(false);
    setEmailOtp("");
    setTempEmail("");
    setIsEmailChanged(false);
    setBasicEmailOtpLoading(false);
    // Reset to original values from Redux user data
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      setFullName(user.fullName || "");
      setCountry(user.country || "USA");
      setState(user.state || "California");
      setZip(user.zip || "");

      const nameParts = (user.name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setDateOfBirth((user as any).dateOfBirth ? new Date((user as any).dateOfBirth) : undefined);
      setLanguage((user as any).language || "English");
      setIsEmailVerified(!!user?.email);
      setIsPhoneVerified(!!user?.phoneNumber);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEmailChanged) {
      await handleEmailChangeRequest();
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: `${firstName} ${lastName}`.trim(),
        username,
        fullName,
        country,
        state,
        zip,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : "",
        language,
      };

      // Use Redux action to update user
      const result = await dispatch(updateUser(updateData));

      if (updateUser.fulfilled.match(result)) {
        setIsEditing(false);
        toast('Profile updated successfully!');
      } else {
        toast(result.payload as string || 'Failed to update profile', false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast('Failed to update profile', false);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChangeRequest = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail: tempEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowEmailOtp(true);
        toast(data.message || 'OTP sent to new email address');
      } else {
        toast(data.error || 'Failed to send OTP', false);
      }
    } catch (err) {
      console.error('Error requesting email change:', err);
      toast('Failed to request email change', false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBasicEmailOtpLoading(true);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/verify-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: emailOtp }),
      });

      if (response.ok) {
        setEmail(tempEmail);
        setShowEmailOtp(false);
        setIsEditing(false);
        setEmailOtp("");
        setTempEmail("");
        setIsEmailChanged(false);
        toast('Email updated successfully!');
      } else {
        const data = await response.json();
        toast(data.error || 'Invalid OTP', false);
      }
    } catch (err) {
      console.error('Error verifying email OTP:', err);
      toast('Failed to verify OTP', false);
    } finally {
      setBasicEmailOtpLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempEmail(e.target.value);
    setIsEmailChanged(e.target.value !== email);
  };

  // Password Reset Flow
  const handleRequestPasswordReset = async () => {
    setPasswordResetLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowPasswordReset(true);
        toast('Password reset OTP sent to your email');
      } else {
        toast(data.message || 'Failed to send password reset OTP', false);
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      toast('Failed to request password reset', false);
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
    return "";
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordResetVerifyLoading(true);

    const validationError = validatePassword(newPassword);
    if (validationError) {
      toast(validationError, false);
      setPasswordResetVerifyLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: passwordResetOtp,
          newPassword
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast("Password changed successfully!");
        setShowPasswordReset(false);
        setPasswordResetOtp("");
        setNewPassword("");
      } else {
        toast(data.message || 'Failed to reset password', false);
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      toast('Failed to reset password', false);
    } finally {
      setPasswordResetVerifyLoading(false);
    }
  };

  // Account Deletion Flow
  const handleDeleteAccountClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/request-account-deletion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowDeleteOtp(true);
        setIsDeleteModalOpen(false);
        toast('OTP sent to your registered email');
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to send OTP', false);
      }
    } catch (err) {
      console.error('Error requesting account deletion:', err);
      toast('Failed to request account deletion', false);
    }
  };

  const handleDeleteOtpVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeleteAccountLoading(true);

    if (!deleteEmailOtp) {
      toast("Please enter the OTP", false);
      setDeleteAccountLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/verify-account-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: deleteEmailOtp }),
      });

      if (response.ok) {
        toast("Account deleted successfully. Redirecting to home screen.");
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        router.push("/");
      } else {
        const data = await response.json();
        toast(data.error || 'Invalid OTP', false);
      }
    } catch (err) {
      console.error('Error verifying deletion OTP:', err);
      toast('Failed to verify OTP', false);
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const handleCancelDeleteOtp = () => {
    setShowDeleteOtp(false);
    setDeleteEmailOtp("");
    setDeleteAccountLoading(false);
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordReset(false);
    setPasswordResetOtp("");
    setNewPassword("");
    setPasswordResetLoading(false);
    setPasswordResetVerifyLoading(false);
  };

  const handleCancelContact = () => {
    setIsEditingContact(false);
    setShowEmailOtpContact(false);
    setShowPhoneOtp(false);
    setEmailOtpContact("");
    setPhoneOtp("");
    setTempEmailContact("");
    setTempPhone("");
    setEmailOtpLoading(false);
    setPhoneOtpLoading(false);
    setEmailVerifyLoading(false);
    setPhoneVerifyLoading(false);
  };

  const handleEmailChangeRequestContact = async () => {
    setEmailOtpLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail: tempEmailContact }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowEmailOtpContact(true);
        toast(data.message || 'OTP sent to new email address');
      } else {
        toast(data.error || 'Failed to send OTP', false);
      }
    } catch (err) {
      toast('Failed to request email change', false);
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handlePhoneChangeRequest = async () => {
    setPhoneOtpLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/request-phone-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPhone: tempPhone }),
      });
      if (response.ok) {
        setShowPhoneOtp(true);
        toast('OTP sent to your phone number');
      } else {
        const data = await response.json();
        toast(data.error || 'Failed to send OTP', false);
      }
    } catch (err) {
      toast('Failed to request phone change', false);
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleVerifyEmailOtpContact = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setEmailVerifyLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/verify-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: emailOtpContact }),
      });
      if (response.ok) {
        setEmail(tempEmailContact);
        setIsEmailVerified(true);
        setShowEmailOtpContact(false);
        setEmailOtpContact("");
        setTempEmailContact("");
        const phoneChanged = tempPhone && tempPhone !== phone;
        if (phoneChanged) {
          await handlePhoneChangeRequest();
        } else {
          setIsEditingContact(false);
        }
        toast('Email updated successfully!');
      } else {
        const data = await response.json();
        toast(data.error || 'Invalid OTP', false);
      }
    } catch (err) {
      toast('Failed to verify OTP', false);
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setPhoneVerifyLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/user/verify-phone-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: phoneOtp }),
      });
      if (response.ok) {
        setPhone(tempPhone);
        setIsPhoneVerified(true);
        setShowPhoneOtp(false);
        setPhoneOtp("");
        setTempPhone("");
        setIsEditingContact(false);
        toast('Phone updated successfully!');
      } else {
        const data = await response.json();
        toast(data.error || 'Invalid OTP', false);
      }
    } catch (err) {
      toast('Failed to verify OTP', false);
    } finally {
      setPhoneVerifyLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-6">
      <Tabs defaultValue="account" className="w-full flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-6">
          <div className="bg-white p-6 shadow rounded-xl">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-[#F3612A] font-semibold text-lg">
                    {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.email || ""}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                <div className="w-5 h-5 text-gray-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="m16 10-4 4-4-4" />
                  </svg>
                </div>
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile/reviews")}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                <div className="w-5 h-5 text-gray-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </div>
                <span>My Reviews</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile/orderHistory")}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <span>Order History</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/wishlist")}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                <div className="w-5 h-5 text-gray-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <span>Wishlist</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile/coupons")}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                <div className="w-5 h-5 text-gray-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <span>Coupons</span>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 tracking-wide mb-3">Manage Account</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg bg-[#F3612A] text-white font-medium">
                  <div className="w-5 h-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span>Personal Info</span>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/profile/addressBook")}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  <div className="w-5 h-5 text-gray-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span>Addresses</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 tracking-wide mb-3">Customer Service</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => router.push("/return-policy")}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  <div className="w-5 h-5 text-gray-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <span>Return Policy</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/contact")}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  <div className="w-5 h-5 text-gray-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <span>Contact Us</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/logout")}
                className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg hover:bg-red-50 transition font-medium text-red-600"
              >
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="w-3/4">
          <TabsContent value="account">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Personal Info</h1>
                </div>
                {/* Basic Info */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Basic Info</h2>
                    {!isEditing && (
                      <Button
                        type="button"
                        onClick={handleEdit}
                        variant="outline"
                        className="px-4 py-2"
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  <form className="grid grid-cols-2 gap-6" onSubmit={handleSave}>
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                        Date of Birth
                      </Label>
                      {isEditing ? (
                        <DatePickerComponent
                          date={dateOfBirth}
                          onDateChange={(date) => setDateOfBirth(date || undefined)}
                          placeholder="Select date of birth"
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      ) : (
                        <Input
                          id="dateOfBirth"
                          type="text"
                          value={dateOfBirth ? dateOfBirth.toLocaleDateString() : ''}
                          disabled={true}
                          className="mt-1 h-10 bg-gray-100 cursor-not-allowed"
                          placeholder="Not set"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                        Language
                      </Label>
                      <div className="relative">
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#F3612A] focus:border-[#F3612A] transition-colors"
                          disabled={!isEditing}
                        >
                          <option value="English">🇺🇸 English</option>
                          <option value="Spanish">🇪🇸 Spanish</option>
                          <option value="French">🇫🇷 French</option>
                          <option value="German">🇩🇪 German</option>
                          <option value="Italian">🇮🇹 Italian</option>
                          <option value="Portuguese">🇵🇹 Portuguese</option>
                          <option value="Hindi">🇮🇳 Hindi</option>
                          <option value="Bengali">🇧🇩 Bengali</option>
                          <option value="Chinese">🇨🇳 Chinese</option>
                          <option value="Japanese">🇯🇵 Japanese</option>
                          <option value="Korean">🇰🇷 Korean</option>
                          <option value="Arabic">🇸🇦 Arabic</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="col-span-2 flex justify-start gap-4 mt-6">
                        <Button
                          type="submit"
                          disabled={loading || userLoading}
                          className="bg-[#F3612A] hover:bg-[#E55120] text-white px-6 py-2"
                        >
                          {(loading || userLoading) ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="outline"
                          className="px-6 py-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </div>
                {/* Divider */}
                <div className="border-t border-gray-200 mb-8"></div>

                {/* Contact Info */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
                    {!isEditingContact && (
                      <Button
                        type="button"
                        onClick={() => {
                          setTempEmailContact(email);
                          setTempPhone(phone);
                          setIsEditingContact(true);
                        }}
                        variant="outline"
                        className="px-4 py-2"
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  {isEditingContact ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-end gap-3">
                          <div className="w-1/3 space-y-2">
                            <Label htmlFor="contactEmail">Email</Label>
                            <Input
                              id="contactEmail"
                              value={tempEmailContact}
                              onChange={(e) => setTempEmailContact(e.target.value)}
                              placeholder="Enter email"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleEmailChangeRequestContact}
                            disabled={!tempEmailContact || tempEmailContact === email || emailOtpLoading}
                            className="bg-[#F3612A] hover:bg-[#E55120] text-white px-4 py-2 h-10 disabled:bg-gray-300 disabled:hover:bg-gray-300"
                          >
                            {emailOtpLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              'Send OTP'
                            )}
                          </Button>
                        </div>
                        
                        {showEmailOtpContact && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Verification Code</h4>
                            <p className="text-xs text-gray-500 mb-3">Enter OTP sent to {tempEmailContact}</p>
                            <div className="flex gap-2 mb-4">
                              {[0, 1, 2, 3, 4, 5].map((i) => (
                                <Input
                                  key={i}
                                  type="text"
                                  maxLength={1}
                                  value={emailOtpContact[i] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length > 1) {
                                      const chars = value.split('').slice(0, 6);
                                      const newOtp = chars.concat(Array(6 - chars.length).fill(''));
                                      setEmailOtpContact(newOtp.join(''));
                                      const focusIndex = Math.min(chars.length - 1, 5);
                                      const nextInput = document.getElementById(`email-contact-otp-${focusIndex}`);
                                      if (nextInput) nextInput.focus();
                                    } else {
                                      const newOtp = emailOtpContact.split('');
                                      newOtp[i] = value;
                                      setEmailOtpContact(newOtp.join(''));
                                      if (value && i < 5) {
                                        const nextInput = document.getElementById(`email-contact-otp-${i + 1}`);
                                        if (nextInput) nextInput.focus();
                                      }
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                                      const prevInput = document.getElementById(`email-contact-otp-${i - 1}`);
                                      if (prevInput) prevInput.focus();
                                    }
                                  }}
                                  id={`email-contact-otp-${i}`}
                                  className="w-12 h-12 text-center border-[#F3612A] focus:ring-[#F3612A] focus:border-[#F3612A]"
                                />
                              ))}
                            </div>
                            <Button 
                              type="button"
                              onClick={handleVerifyEmailOtpContact}
                              disabled={emailVerifyLoading}
                              className="bg-[#F3612A] hover:bg-[#E55120] text-white px-4 py-2 disabled:bg-gray-300 disabled:hover:bg-gray-300"
                            >
                              {emailVerifyLoading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Verifying...
                                </>
                              ) : (
                                'Verify'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-end gap-3">
                          <div className="w-1/3 space-y-2">
                            <Label htmlFor="contactPhone">Phone Number</Label>
                            <Input
                              id="contactPhone"
                              value={tempPhone}
                              onChange={(e) => setTempPhone(e.target.value)}
                              placeholder="Enter phone"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handlePhoneChangeRequest}
                            disabled={!tempPhone || tempPhone === phone || phoneOtpLoading}
                            className="bg-[#F3612A] hover:bg-[#E55120] text-white px-4 py-2 h-10 disabled:bg-gray-300 disabled:hover:bg-gray-300"
                          >
                            {phoneOtpLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              'Send OTP'
                            )}
                          </Button>
                        </div>

                        {showPhoneOtp && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Verification Code</h4>
                            <p className="text-xs text-gray-500 mb-3">Enter OTP sent to {tempPhone}</p>
                            <div className="flex gap-2 mb-4">
                              {[0, 1, 2, 3, 4, 5].map((i) => (
                                <Input
                                  key={i}
                                  type="text"
                                  maxLength={1}
                                  value={phoneOtp[i] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length > 1) {
                                      const chars = value.split('').slice(0, 6);
                                      const newOtp = chars.concat(Array(6 - chars.length).fill(''));
                                      setPhoneOtp(newOtp.join(''));
                                      const focusIndex = Math.min(chars.length - 1, 5);
                                      const nextInput = document.getElementById(`phone-contact-otp-${focusIndex}`);
                                      if (nextInput) nextInput.focus();
                                    } else {
                                      const newOtp = phoneOtp.split('');
                                      newOtp[i] = value;
                                      setPhoneOtp(newOtp.join(''));
                                      if (value && i < 5) {
                                        const nextInput = document.getElementById(`phone-contact-otp-${i + 1}`);
                                        if (nextInput) nextInput.focus();
                                      }
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                                      const prevInput = document.getElementById(`phone-contact-otp-${i - 1}`);
                                      if (prevInput) prevInput.focus();
                                    }
                                  }}
                                  id={`phone-contact-otp-${i}`}
                                  className="w-12 h-12 text-center border-[#F3612A] focus:ring-[#F3612A] focus:border-[#F3612A]"
                                />
                              ))}
                            </div>
                            <Button 
                              type="button"
                              onClick={handleVerifyPhoneOtp}
                              disabled={phoneVerifyLoading}
                              className="bg-[#F3612A] hover:bg-[#E55120] text-white px-4 py-2 disabled:bg-gray-300 disabled:hover:bg-gray-300"
                            >
                              {phoneVerifyLoading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Verifying...
                                </>
                              ) : (
                                'Verify'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-start gap-4 pt-4">
                        <Button type="button" onClick={handleCancelContact} variant="outline" className="px-6 py-2">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Email:</span>
                        <span className="text-gray-900">{email || "Not provided"}</span>
                        {email && isEmailVerified && <span className="text-green-600 text-sm">Verified</span>}
                        {email && !isEmailVerified && <span className="text-red-600 text-sm">Unverified</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Phone:</span>
                        <span className="text-gray-900">{phone || "Not provided"}</span>
                        {phone && isPhoneVerified && <span className="text-green-600 text-sm">Verified</span>}
                        {phone && !isPhoneVerified && <span className="text-red-600 text-sm">Unverified</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-8"></div>

                {/* Password Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Password</h2>
                    {!showPasswordReset && (
                      <Button
                        type="button"
                        onClick={handleRequestPasswordReset}
                        variant="outline"
                        className="px-4 py-2"
                        disabled={passwordResetLoading}
                      >
                        {passwordResetLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending OTP...
                          </>
                        ) : (
                          'Edit'
                        )}
                      </Button>
                    )}
                  </div>

                  {!showPasswordReset ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Input
                          id="password"
                          type="password"
                          value="••••••••••••"
                          disabled={true}
                          className="mt-1 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">                      
                      <form className="grid grid-cols-1 gap-6" onSubmit={handleResetPassword}>
                        <div>
                          <Label>OTP sent to {email}</Label>
                          <div className="flex gap-2 mt-2">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <Input
                                key={i}
                                type="text"
                                maxLength={1}
                                value={passwordResetOtp[i] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.length > 1) {
                                    const chars = value.split('').slice(0, 6);
                                    const newOtp = chars.concat(Array(6 - chars.length).fill(''));
                                    setPasswordResetOtp(newOtp.join(''));
                                    const focusIndex = Math.min(chars.length - 1, 5);
                                    const nextInput = document.getElementById(`password-otp-${focusIndex}`);
                                    if (nextInput) nextInput.focus();
                                  } else {
                                    const newOtp = passwordResetOtp.split('');
                                    newOtp[i] = value;
                                    setPasswordResetOtp(newOtp.join(''));
                                    if (value && i < 5) {
                                      const nextInput = document.getElementById(`password-otp-${i + 1}`);
                                      if (nextInput) nextInput.focus();
                                    }
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                                    const prevInput = document.getElementById(`password-otp-${i - 1}`);
                                    if (prevInput) prevInput.focus();
                                  }
                                }}
                                id={`password-otp-${i}`}
                                className="w-12 h-12 text-center border-[#F3612A] focus:ring-[#F3612A] focus:border-[#F3612A]"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                            New Password
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="8+ characters, number, special character"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-start gap-4 mt-4">
                          <Button
                            type="submit"
                            disabled={passwordResetVerifyLoading}
                            className="bg-[#F3612A] hover:bg-[#E55120] text-white px-6 py-2 disabled:bg-gray-300 disabled:hover:bg-gray-300"
                          >
                            {passwordResetVerifyLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Changing...
                              </>
                            ) : (
                              'Change Password'
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCancelPasswordReset}
                            variant="outline"
                            className="px-6 py-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-8"></div>

                {/* Delete Account Section */}
                <div className="mb-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Account</h2>
                    <p className="text-gray-600 leading-relaxed">
                      When you delete your account, your public profile will be deactivated immediately. If you change your mind before the 14 days are up, sign in with your email and password, and we'll send you a link to reactivate your account.
                    </p>
                  </div>

                  <div className="flex justify-start">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccountClick}
                      className="bg-[#F3612A] hover:bg-red-600 text-white px-6 py-2"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showDeleteOtp && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="bg-white rounded-lg p-6 min-w-[400px] shadow-lg">
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-4">Verify Identity</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Please verify your identity by entering the OTP sent to your registered email.
                    </p>
                    <form onSubmit={handleDeleteOtpVerification} className="space-y-4">
                      <div>
                        <Label>Email OTP</Label>
                        <div className="flex gap-2 mt-2">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Input
                              key={i}
                              type="text"
                              maxLength={1}
                              value={deleteEmailOtp[i] || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.length > 1) {
                                  const chars = value.split('').slice(0, 6);
                                  const newOtp = chars.concat(Array(6 - chars.length).fill(''));
                                  setDeleteEmailOtp(newOtp.join(''));
                                  const focusIndex = Math.min(chars.length - 1, 5);
                                  const nextInput = document.getElementById(`delete-otp-${focusIndex}`);
                                  if (nextInput) nextInput.focus();
                                } else {
                                  const newOtp = deleteEmailOtp.split('');
                                  newOtp[i] = value;
                                  setDeleteEmailOtp(newOtp.join(''));
                                  if (value && i < 5) {
                                    const nextInput = document.getElementById(`delete-otp-${i + 1}`);
                                    if (nextInput) nextInput.focus();
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                                  const prevInput = document.getElementById(`delete-otp-${i - 1}`);
                                  if (prevInput) prevInput.focus();
                                }
                              }}
                              id={`delete-otp-${i}`}
                              className="w-12 h-12 text-center border-[#F3612A] focus:ring-[#F3612A] focus:border-[#F3612A]"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">OTP sent to {email}</p>
                      </div>
                      <div className="flex justify-end gap-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelDeleteOtp}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={deleteAccountLoading} className="bg-[#F3612A] hover:bg-[#E55120] text-white px-6 py-2 disabled:bg-gray-300 disabled:hover:bg-gray-300">
                          {deleteAccountLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Verifying...
                            </>
                          ) : (
                            'Verify & Delete Account'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {isDeleteModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="bg-white rounded-lg p-6 min-w-[350px] shadow-lg">
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      This action cannot be undone. This will permanently delete your account and all
                      your data.
                    </p>
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="button" variant="destructive" onClick={handleDeleteAccount}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}