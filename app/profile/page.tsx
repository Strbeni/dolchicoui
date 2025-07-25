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

  const [username, setUsername] = useState("demoUser");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Saved!\nUsername: ${username}\nEmail: ${email}`);
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
                      <Input id="displayName" defaultValue="Kevin" />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue="Kevin Gilbert" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="+1-202-555-0118" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country/Region</Label>
                      <select id="country" className="border rounded px-2 py-1 w-full">
                        <option>Bangladesh</option>
                        <option>India</option>
                        <option>USA</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <select id="state" className="border rounded px-2 py-1 w-full">
                        <option>Dhaka</option>
                        <option>Delhi</option>
                        <option>California</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input id="zip" defaultValue="1207" />
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end mt-4">
                    <Button type="submit" className="bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded">
                      SAVE CHANGES
                    </Button>
                  </div>
                </form>
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
