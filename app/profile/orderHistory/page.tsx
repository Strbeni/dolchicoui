"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const allOrders = [
  {
    id: "#406-9025561-0841152",
    placed: "6 July 2025",
    orderId: "406-9025561-0841152",
    total: "₹699.00",
    shipTo: "Akash Kulshrestha",
    delivered: "9 July",
    title:
      "Weavers Villa Beads Hanging Curtain - 20 Strings, 7 Ft - Sparkling Decor for Doors/Windows...",
    image: "/curtain.jpg",
    returnWindow: "19 July 2025",
    status: "delivered",
    placedDate: new Date("2025-07-06"),
  },
  {
    id: "#406-3908338-4442743",
    placed: "6 July 2025",
    orderId: "406-3908338-4442743",
    total: "₹699.00",
    shipTo: "Akash Kulshrestha",
    delivered: "8 July",
    title:
      "BNSN Pure & Original Kala Gond | Gond Siyah | Pure Jadibooti | for Joint Pain & Arthritis...",
    image: "/gond.jpg",
    returnWindow: "18 July 2025",
    status: "delivered",
    placedDate: new Date("2025-07-06"),
  },
  {
    id: "#406-3396058-1809901",
    orderId: "406-3396058-1809901",
    placed: "27 June 2025",
    total: "₹588.82",
    shipTo: "Akash Kulshrestha",
    delivered: null,
    title: "Broadband - Airtel",
    image: "/airtel.png",
    isBroadband: true,
    status: "not_shipped",
    placedDate: new Date("2025-06-27"),
  },
];

export default function OrderHistoryPage() {
  const [tab, setTab] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const router = useRouter();

  const handleViewDetails = (orderId: string) => {
    router.push(`/profile/orderHistory/orderDetail/${orderId}`);
  };

  // Filter orders by month
  const getFilteredOrdersByMonth = (orders: typeof allOrders) => {
    if (monthFilter === "all") return orders;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (monthFilter) {
      case "past30days":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "past3months":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "2025":
        return orders.filter(order => order.placedDate.getFullYear() === 2025);
      case "2024":
        return orders.filter(order => order.placedDate.getFullYear() === 2024);
      case "2023":
        return orders.filter(order => order.placedDate.getFullYear() === 2023);
      default:
        return orders;
    }
    
    return orders.filter(order => order.placedDate >= cutoffDate);
  };

  const filteredOrders = getFilteredOrdersByMonth(
    tab === "all"
      ? allOrders
      : allOrders.filter((order) => {
          if (tab === "not_shipped") return order.status === "not_shipped";
          if (tab === "cancelled") return order.status === "cancelled";
          if (tab === "buy_again") return true;
          return true;
        })
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Tabs defaultValue="orders" className="w-full flex">
        <div className="w-1/4 pr-6">
          <TabsList className="flex flex-col w-full gap-2 bg-white p-4 shadow rounded-xl">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/orderHistory")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full bg-gray-100"
            >
              Order History
            </button>
            <TabsTrigger value="payment">Saved Payment Method</TabsTrigger>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Address Book
            </button>
           
          </TabsList>
        </div>
        <TabsContent value="orders" className="w-3/4">
          <Card className="shadow-md w-full">
            <div className="bg-white p-4 rounded shadow mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm font-medium text-blue-600">
                <button
                  className={`pb-1 ${
                    tab === "all"
                      ? "border-b-2 border-black text-black"
                      : "hover:underline"
                  }`}
                  onClick={() => setTab("all")}
                >
                  Orders
                </button>
                <button
                  className={`pb-1 ${
                    tab === "buy_again"
                      ? "border-b-2 border-black text-black"
                      : "hover:underline"
                  }`}
                  onClick={() => setTab("buy_again")}
                >
                  Buy Again
                </button>
                <button
                  className={`pb-1 ${
                    tab === "not_shipped"
                      ? "border-b-2 border-black text-black"
                      : "hover:underline"
                  }`}
                  onClick={() => setTab("not_shipped")}
                >
                  Not Yet Shipped
                </button>
                <button
                  className={`pb-1 ${
                    tab === "cancelled"
                      ? "border-b-2 border-black text-black"
                      : "hover:underline"
                  }`}
                  onClick={() => setTab("cancelled")}
                >
                  Cancelled Orders
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search all orders"
                  className="w-64 px-3"
                />
                <Button>Search Orders</Button>
              </div>
            </div>
            
            {/* Month Filter Section */}
            <div className="bg-white p-4 rounded shadow mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {filteredOrders.length} orders placed in
                </span>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="past30days">Past 30 days</SelectItem>
                    <SelectItem value="past3months">Past 3 months</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {filteredOrders.length === 0 ? (
                <p className="text-center text-gray-500">
                  No orders found in this category.
                </p>
              ) : (
                filteredOrders.map((order, index) => (
                  <div
                    key={order.orderId}
                    className="bg-white border rounded-lg shadow p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          ORDER ID:{" "}
                          <span className="font-medium text-black">
                            {order.orderId}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          ORDER PLACED:{" "}
                          <span className="font-medium text-black">
                            {order.placed}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          TOTAL:{" "}
                          <span className="font-medium text-black">
                            {order.total}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          SHIP TO:{" "}
                          <span className="font-medium text-black">
                            {order.shipTo}
                          </span>
                        </p>
                      </div>
                      <div 
                        className="text-right text-sm text-blue-600 cursor-pointer hover:underline" 
                        onClick={() => handleViewDetails(order.orderId)}
                      >
                        View order details
                      </div>
                    </div>

                    <div className="border-t pt-4 flex gap-4">
                      <div className="w-24 h-24 relative">
                        <Image
                          src={order.image}
                          alt={order.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <p className="font-medium text-black text-sm line-clamp-2">
                          {order.title}
                        </p>
                        {order.delivered ? (
                          <p className="text-sm text-gray-600">
                            Delivered{" "}
                            <span className="font-semibold">
                              {order.delivered}
                            </span>
                          </p>
                        ) : null}
                        {order.returnWindow ? (
                          <p className="text-sm text-gray-500">
                            Return window closed on {order.returnWindow}
                          </p>
                        ) : null}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Button size="sm" variant="secondary">
                            Track package
                          </Button>
                          {!order.isBroadband && (
                            <>
                              <Button size="sm" variant="secondary">
                                Leave seller feedback
                              </Button>
                              <Button size="sm" variant="secondary">
                                Write a product review
                              </Button>
                            </>
                          )}
                          {order.isBroadband && (
                            <Button size="sm" variant="default">
                              Pay Bill Again
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}