"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
    // Reset to original values
    setUsername("demoUser");
    setEmail("demo@example.com");
    setPhone("+1-202-555-0118");
    setDisplayName("Kevin");
    setFullName("Kevin Gilbert");
    setCountry("USA");
    setState("California");
    setZip("1207");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEmailChanged || isPhoneChanged) {
      setShowOtp(true);
      return;
    }
    setIsEditing(false);
    alert(`Saved!\nUsername: ${username}\nEmail: ${email}\nPhone: ${phone}`);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // Simulate OTP verification (in a real app, this would be an API call)
    if (otp === "123456") { // Dummy OTP check
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

  const handleEmailChange = (e) => {
    setTempEmail(e.target.value);
    setIsEmailChanged(e.target.value !== email);
  };

  const handlePhoneChange = (e) => {
    setTempPhone(e.target.value);
    setIsPhoneChanged(e.target.value !== phone);
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
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="w-3/4">
          <TabsContent value="account">
            {/* Account Settings Card */}
            <Card className="shadow-md mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Account Setting</h2>
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
                    <div className="flex flex-col items-center md:items-start">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                        <img
                          src="/profile.jpg"
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
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
                <form className="grid grid-cols-1 gap-6">
                  <div className="relative">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" className="pr-10" />
                    <span className="absolute right-3 top-8 cursor-pointer text-gray-400">👁️</span>
                  </div>
                  <div className="relative">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="8+ characters" className="pr-10" />
                    <span className="absolute right-3 top-8 cursor-pointer text-gray-400">👁️</span>
                  </div>
                  <div className="relative">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" className="pr-10" />
                    <span className="absolute right-3 top-8 cursor-pointer text-gray-400">👁️</span>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded">
                      CHANGE PASSWORD
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tab Contents */}
          <TabsContent value="security">
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-2">Billing Info</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-2">Settings</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}