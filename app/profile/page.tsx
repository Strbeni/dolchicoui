"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Next.js base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function AccountSettings() {
  const router = useRouter();

  // Profile states
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // User data states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Read-only
  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("USA");
  const [state, setState] = useState("California");
  const [zip, setZip] = useState("");

  // Email change states
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [isEmailChanged, setIsEmailChanged] = useState(false);

  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetOtp, setPasswordResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Delete account states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDeleteOtp, setShowDeleteOtp] = useState(false);
  const [deleteEmailOtp, setDeleteEmailOtp] = useState("");
  const [deleteOtpError, setDeleteOtpError] = useState("");

  // Helper function to get auth token
  const getAuthToken = () => {
    // FIX: Check both localStorage and sessionStorage for the token
    return typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : null;
  };

  // Fetch user profile function
  const fetchUserProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication required. Redirecting to login...');
      router.push('/login'); // Redirect if no token is found
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ FIX: Implemented the 'get-user' API endpoint
      const response = await fetch(`${API_BASE_URL}/api/user/get-user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // ✅ FIX: Added robust data handling for different response structures
        const user = data.user || data; 
        
        setUsername(user.username || "");
        setEmail(user.email || "");
        setPhone(user.phoneNumber || "");
        setDisplayName(user.name || "");
        setFullName(user.fullName || "");
        setCountry(user.country || "USA");
        setState(user.state || "California");
        setZip(user.zip || "");
      } else if (response.status === 401 || response.status === 403) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('An unexpected error occurred. Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [router]); // Dependency array for useCallback

  // Load user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowEmailOtp(false);
    setEmailOtp("");
    setTempEmail("");
    setIsEmailChanged(false);
    setError("");
    // Reset to original values
    fetchUserProfile();
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isEmailChanged) {
      await handleEmailChangeRequest();
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const updateData = {
        name: displayName,
        username,
        fullName,
        country,
        state,
        zip,
      };

      const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
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

      if (response.ok) {
        setShowEmailOtp(true);
        alert('OTP sent to new email address');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error requesting email change:', err);
      setError('Failed to request email change');
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        alert('Email updated successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Error verifying email OTP:', err);
      setError('Failed to verify OTP');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempEmail(e.target.value);
    setIsEmailChanged(e.target.value !== email);
  };

  // Password Reset Flow
  const handleRequestPasswordReset = async () => {
    setPasswordError("");
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
        alert('Password reset OTP sent to your email');
      } else {
        setPasswordError(data.message || 'Failed to send password reset OTP');
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setPasswordError('Failed to request password reset');
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
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
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
        alert("Password changed successfully!");
        setShowPasswordReset(false);
        setPasswordResetOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setPasswordError('Failed to reset password');
    }
  };

  // Account Deletion Flow
  const handleDeleteAccountClick = () => {
    setIsDeleteModalOpen(true);
    setDeleteOtpError("");
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
        alert('OTP sent to your registered email');
      } else {
        const data = await response.json();
        setDeleteOtpError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error requesting account deletion:', err);
      setDeleteOtpError('Failed to request account deletion');
    }
  };

  const handleDeleteOtpVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeleteOtpError("");

    if (!deleteEmailOtp) {
      setDeleteOtpError("Please enter the OTP");
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
        alert("Account deleted successfully. Redirecting to home screen.");
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        router.push("/");
      } else {
        const data = await response.json();
        setDeleteOtpError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Error verifying deletion OTP:', err);
      setDeleteOtpError('Failed to verify OTP');
    }
  };

  const handleCancelDeleteOtp = () => {
    setShowDeleteOtp(false);
    setDeleteEmailOtp("");
    setDeleteOtpError("");
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordReset(false);
    setPasswordResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  // Main component render
  return (
    <div className="flex min-h-screen bg-gray-100 p-6">
      <Tabs defaultValue="account" className="w-full flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-6">
          <TabsList className="flex flex-col w-full gap-2 bg-white p-4 shadow rounded-xl">
            <TabsTrigger value="account">Account</TabsTrigger>
            <button
              type="button"
              onClick={() => router.push("/profile/orderHistory")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Order History
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/paymentMethod")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Saved Payment Method
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/addressBook")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Address Book
            </button>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="w-3/4">
          <TabsContent value="account">
            {/* Account Settings Card */}
            <Card className="shadow-md mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Account Settings</h2>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccountClick}
                  >
                    Delete account
                  </Button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                {showEmailOtp ? (
                  <form onSubmit={handleVerifyEmailOtp} className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor="emailOtp">Enter OTP sent to {tempEmail}</Label>
                      <Input
                        id="emailOtp"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded"
                      >
                        Verify OTP
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form className="grid grid-cols-2 gap-6" onSubmit={handleSave}>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={isEditing ? tempEmail || email : email}
                        onChange={handleEmailChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        disabled={true}
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country/Region</Label>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                        disabled={!isEditing}
                      >
                        <option>Bangladesh</option>
                        <option>India</option>
                        <option>USA</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                        disabled={!isEditing}
                      >
                        <option>Dhaka</option>
                        <option>Delhi</option>
                        <option>California</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input
                        id="zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="col-span-2 flex justify-end gap-4 mt-4">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleEdit}
                          className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-2 rounded"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Password Reset Card */}
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                
                {!showPasswordReset ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      To change your password, we&apos;ll send an OTP to your registered email address.
                    </p>
                    <Button
                      type="button"
                      onClick={handleRequestPasswordReset}
                      className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded"
                    >
                      Request Password Reset
                    </Button>
                  </div>
                ) : (
                  <form className="grid grid-cols-1 gap-6" onSubmit={handleResetPassword}>
                    <div>
                      <Label htmlFor="passwordResetOtp">OTP sent to {email}</Label>
                      <Input
                        id="passwordResetOtp"
                        value={passwordResetOtp}
                        onChange={(e) => setPasswordResetOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="8+ characters, number, special character"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-sm">{passwordError}</p>
                    )}
                    <div className="flex justify-end gap-4 mt-4">
                      <Button
                        type="button"
                        onClick={handleCancelPasswordReset}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Delete OTP Verification Modal */}
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
                        <Label htmlFor="deleteEmailOtp">Email OTP</Label>
                        <Input
                          id="deleteEmailOtp"
                          value={deleteEmailOtp}
                          onChange={(e) => setDeleteEmailOtp(e.target.value)}
                          placeholder="Enter email OTP"
                          maxLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">OTP sent to {email}</p>
                      </div>
                      {deleteOtpError && (
                        <p className="text-red-500 text-sm">{deleteOtpError}</p>
                      )}
                      <div className="flex justify-end gap-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelDeleteOtp}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="destructive">
                          Verify & Delete Account
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Delete Confirmation Modal */}
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