"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreVertical } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import PaymentMethodPage from "../profile/paymentMethod/page";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountSettings() {
  const [username, setUsername] = useState("demoUser");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Saved!\nUsername: ${username}\nEmail: ${email}`);
  };

  const cards = [
    {
      type: "visa",
      last4: "3814",
      bgColor: "bg-blue-800",
      name: "Kevin Gilbert",
    },
    {
      type: "mastercard",
      last4: "1761",
      bgColor: "bg-green-600",
      name: "Kevin Gilbert",
    },
  ];

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const toggleMenu = (index: number) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const orders = [
    {
      id: "#96459761",
      status: "IN PROGRESS",
      date: "Dec 30, 2019 05:18",
      total: "$1,500",
      products: 5,
    },
    {
      id: "#71667167",
      status: "COMPLETED",
      date: "Feb 2, 2019 19:28",
      total: "$1,500",
      products: 5,
    },
    {
      id: "#95214362",
      status: "CANCELED",
      date: "Mar 20, 2019 23:14",
      total: "$1,500",
      products: 5,
    },
    {
      id: "#71667167",
      status: "COMPLETED",
      date: "Feb 2, 2019 19:28",
      total: "$1,500",
      products: 5,
    },
    {
      id: "#51746385",
      status: "COMPLETED",
      date: "Feb 2, 2019 19:28",
      total: "$1,500",
      products: 5,
    },
    {
      id: "#51746385",
      status: "CANCELED",
      date: "Dec 30, 2019 07:52",
      total: "$1,500",
      products: 5,
    },
    {
      id: "#673971743",
      status: "COMPLETED",
      date: "Dec 7, 2019 23:26",
      total: "$1,500",
      products: 5,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN PROGRESS":
        return "text-orange-500";
      case "CANCELED":
        return "text-red-500";
      default:
        return "text-gray-600";
    }
  };

  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-100 p-6">
      {/* Sidebar Tabs */}
      <Tabs defaultValue="account" className="w-full flex">
        <div className="w-1/4 pr-6">
          <TabsList className="flex flex-col w-full gap-2 bg-white p-4 shadow rounded-xl">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <button
              type="button"
              onClick={() => router.push("/profile/paymentMethod")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Saved Payment Method
            </button>
            <TabsTrigger value="address">Address Book</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Area */}
        <div className="w-3/4">
          <TabsContent value="account">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="p-8 max-w-7xl mx-auto space-y-6">
                  <h1 className="text-2xl font-bold">Hello, Kevin</h1>
                  <p className="text-gray-600">
                    From your account dashboard, you can easily check & view
                    your <strong>Recent Orders</strong>, manage your{" "}
                    <strong>Shipping and Billing Addresses</strong> and edit
                    your <strong>Password and Account Details</strong>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Account Info */}
                    <div className="bg-white shadow-md p-6 rounded-lg">
                      <h2 className="text-lg font-semibold mb-4">
                        Account Info
                      </h2>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="font-semibold">Kevin Gilbert</p>
                        <p>Dhaka - 1207, Bangladesh</p>
                        <p>Email: kevin.gilbert@gmail.com</p>
                        <p>See Email: kevin12345@gmail.com</p>
                        <p>Phone: +1-202-555-0118</p>
                      </div>
                      <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Edit Account
                      </button>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white shadow-md p-6 rounded-lg">
                      <h2 className="text-lg font-semibold mb-4">
                        Billing Address
                      </h2>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="font-semibold">Kevin Gilbert</p>
                        <p>
                          East Tejturi Bazar, Word No. 04, Road No. 13/x House
                          no. 1320/C, Flat No. 5D, Dhaka - 1200, Bangladesh
                        </p>
                        <p>Phone: +1-202-555-0118</p>
                        <p>Email: kevin.gilbert@gmail.com</p>
                      </div>
                      <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Edit Address
                      </button>
                    </div>

                    {/* Orders Info */}
                    <div className="space-y-4">
                      <div className="bg-blue-100 text-blue-900 p-4 rounded shadow">
                        <p className="text-lg font-semibold">154</p>
                        <p className="text-sm">Total Orders</p>
                      </div>
                      <div className="bg-orange-100 text-orange-900 p-4 rounded shadow">
                        <p className="text-lg font-semibold">05</p>
                        <p className="text-sm">Pending Orders</p>
                      </div>
                      <div className="bg-green-100 text-green-900 p-4 rounded shadow">
                        <p className="text-lg font-semibold">149</p>
                        <p className="text-sm">Completed Orders</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="border rounded-md p-6 bg-white">
                 
                  <div className="grid md:grid-cols-2 gap-6">
                    <PaymentMethodPage />
                  </div>
                </div> */}
                <div className="border rounded-md p-6 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-md font-semibold uppercase text-gray-700">
                      Recent Order
                    </h2>
                    <button className="text-orange-600 font-medium flex items-center hover:underline">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="uppercase text-xs border-b bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 font-medium">Order ID</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Total</th>
                          <th className="px-4 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{order.id}</td>
                            <td
                              className={`px-4 py-2 font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </td>
                            <td className="px-4 py-2">{order.date}</td>
                            <td className="px-4 py-2">
                              {order.total} ({order.products} Products)
                            </td>
                            <td className="px-4 py-2">
                              <button className="flex items-center text-orange-600 hover:underline">
                                View Details{" "}
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="border rounded-md p-6 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-md font-semibold uppercase text-gray-700">
                      Order History
                    </h2>
                    <button className="text-orange-600 font-medium flex items-center hover:underline">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="uppercase text-xs border-b bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 font-medium">Order ID</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Total</th>
                          <th className="px-4 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{order.id}</td>
                            <td
                              className={`px-4 py-2 font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </td>
                            <td className="px-4 py-2">{order.date}</td>
                            <td className="px-4 py-2">
                              {order.total} ({order.products} Products)
                            </td>
                            <td className="px-4 py-2">
                              <button className="flex items-center text-orange-600 hover:underline">
                                View Details{" "}
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-2">Address Book</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </Card>
          </TabsContent>

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
