"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountSettings() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("demoUser");
  const [email, setEmail] = useState("demo@example.com");
  const [phone, setPhone] = useState("+1-202-555-0118");
  const [displayName, setDisplayName] = useState("Kevin");
  const [fullName, setFullName] = useState("Kevin Gilbert");
  const [country, setCountry] = useState("USA");
  const [state, setState] = useState("California");
  const [zip, setZip] = useState("1207");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isPhoneChanged, setIsPhoneChanged] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileImage, setProfileImage] = useState("/profile.jpg");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // New states for delete verification
  const [showDeleteOtp, setShowDeleteOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [deleteOtpError, setDeleteOtpError] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowOtp(false);
    setOtp("");
    setTempEmail("");
    setTempPhone("");
    setIsEmailChanged(false);
    setIsPhoneChanged(false);
    setUsername("demoUser");
    setEmail("demo@example.com");
    setPhone("+1-202-555-0118");
    setDisplayName("Kevin");
    setFullName("Kevin Gilbert");
    setCountry("USA");
    setState("California");
    setZip("1207");
    setProfileImage("/profile.jpg");
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmailChanged || isPhoneChanged) {
      setShowOtp(true);
      return;
    }
    setIsEditing(false);
    alert(`Saved!\nUsername: ${username}\nEmail: ${email}\nPhone: ${phone}`);
  };

  const handleVerifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp === "123456") {
      if (isEmailChanged) setEmail(tempEmail);
      if (isPhoneChanged) setPhone(tempPhone);
      setShowOtp(false);
      setIsEditing(false);
      setOtp("");
      setTempEmail("");
      setTempPhone("");
      setIsEmailChanged(false);
      setIsPhoneChanged(false);
      alert(`Saved!\nUsername: ${username}\nEmail: ${email}\nPhone: ${phone}`);
    } else {
      alert("Invalid OTP");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempEmail(e.target.value);
    setIsEmailChanged(e.target.value !== email);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempPhone(e.target.value);
    setIsPhoneChanged(e.target.value !== phone);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!minLength) return "Password must be at least 8 characters long";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecialChar) return "Password must contain at least one special character";
    return "";
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    setPasswordError("");
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Updated delete account handler to show confirmation modal first
  const handleDeleteAccountClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOtpVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeleteOtpError("");
    
    const hasEmail = email && email.trim() !== "";
    const hasMobile = phone && phone.trim() !== "";
    
    let isValid = true;
    
    // Check email OTP if email exists
    if (hasEmail && emailOtp !== "123456") {
      isValid = false;
    }
    
    // Check mobile OTP if mobile exists
    if (hasMobile && mobileOtp !== "123456") {
      isValid = false;
    }
    
    // Check if both fields are filled when both email and mobile exist
    if (hasEmail && hasMobile) {
      if (!emailOtp || !mobileOtp) {
        setDeleteOtpError("Please enter both email and mobile OTP");
        return;
      }
    } else if (hasEmail && !emailOtp) {
      setDeleteOtpError("Please enter email OTP");
      return;
    } else if (hasMobile && !mobileOtp) {
      setDeleteOtpError("Please enter mobile OTP");
      return;
    }
    
    if (isValid) {
      // OTP verified, proceed with account deletion
      proceedWithDeletion();
    } else {
      setDeleteOtpError("Invalid OTP. Please check and try again.");
    }
  };

  const handleDeleteAccount = () => {
    const hasEmail = email && email.trim() !== "";
    const hasMobile = phone && phone.trim() !== "";

    if (hasEmail || hasMobile) {
      // Show OTP verification modal
      setShowDeleteOtp(true);
      setIsDeleteModalOpen(false);
      // Simulate sending OTP
      alert(`OTP sent to ${hasEmail ? 'your email' : ''}${hasEmail && hasMobile ? ' and ' : ''}${hasMobile ? 'your mobile' : ''}`);
    } else {
      // No email or mobile, proceed with direct deletion
      proceedWithDeletion();
    }
  };

  const proceedWithDeletion = () => {
    // In a real app, you'd call an API to delete the user.
    alert("Your profile deleted successfully. Redirecting to login screen");
    setShowDeleteOtp(false);
    setIsDeleteModalOpen(false);
    setEmailOtp("");
    setMobileOtp("");
    setDeleteOtpError("");
    // Redirect to home or login page
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handleCancelDeleteOtp = () => {
    setShowDeleteOtp(false);
    setEmailOtp("");
    setMobileOtp("");
    setDeleteOtpError("");
  };

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
                {showOtp ? (
                  <form onSubmit={handleVerifyOtp} className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
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
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center" onSubmit={handleSave}>
                    <div>
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative">
                        <Image
                          src={profileImage}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                        {isEditing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <Label htmlFor="profileImage" className="cursor-pointer text-white text-sm">
                              Upload Image
                            </Label>
                            <Input
                              id="profileImage"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 col-span-2">
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
                          value={isEditing ? tempPhone || phone : phone}
                          onChange={handlePhoneChange}
                          disabled={!isEditing}
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
                            className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded"
                          >
                            Save Changes
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

            {/* Password Change Card */}
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <form className="grid grid-cols-1 gap-6" onSubmit={handleChangePassword}>
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
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
                  <div className="flex justify-end mt-4">
                    <Button
                      type="submit"
                      className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded"
                    >
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Delete OTP Verification Modal */}
            {showDeleteOtp && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="bg-white rounded-lg p-6 min-w-[400px] shadow-lg">
                  <CardContent>
                    <h2 className="text-xl font-semibold mb-4">Verify Identity</h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Please verify your identity by entering the OTP sent to your registered email and/or mobile number.
                    </p>
                    <form onSubmit={handleDeleteOtpVerification} className="space-y-4">
                      {email && email.trim() !== "" && (
                        <div>
                          <Label htmlFor="emailOtp">Email OTP</Label>
                          <Input
                            id="emailOtp"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            placeholder="Enter email OTP"
                            maxLength={6}
                          />
                          <p className="text-xs text-gray-500 mt-1">OTP sent to {email}</p>
                        </div>
                      )}
                      {phone && phone.trim() !== "" && (
                        <div>
                          <Label htmlFor="mobileOtp">Mobile OTP</Label>
                          <Input
                            id="mobileOtp"
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value)}
                            placeholder="Enter mobile OTP"
                            maxLength={6}
                          />
                          <p className="text-xs text-gray-500 mt-1">OTP sent to {phone}</p>
                        </div>
                      )}
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