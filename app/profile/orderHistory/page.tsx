"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Image from "next/image";

const allOrders = [
  {
    id: "#406-9025561-0841152",
    placed: "6 July 2025",
    orderId: "406-9025561-0841152",
    total: "₹699.00",
    shipTo: "Akash Kulshrestha",
    delivered: "9 July",
    placedDate: new Date("2025-07-06"),
    products: [
      {
        title:
          "Weavers Villa Beads Hanging Curtain - 20 Strings, 7 Ft - Sparkling Decor for Doors/Windows...",
        image: "/curtain.jpg",
        quantity: 2,
        returnWindow: "18 July 2025",
        status: "delivered",
        isBroadband: false,
      },
      {
        title:
          "BNSN Pure & Original Kala Gond | Gond Siyah | Pure Jadibooti | for Joint Pain & Arthritis...",
        image: "/gond.jpg",
        quantity: 1,
        returnWindow: "19 July 2025",
        status: "delivered",
        isBroadband: false,
      },
    ],
  },
  {
    id: "#406-3908338-4442743",
    placed: "6 July 2025",
    orderId: "406-3908338-4442743",
    total: "₹699.00",
    shipTo: "Akash Kulshrestha",
    delivered: "8 July",
    placedDate: new Date("2025-07-06"),
    products: [
      {
        title:
          "BNSN Pure & Original Kala Gond | Gond Siyah | Pure Jadibooti | for Joint Pain & Arthritis...",
        image: "/gond.jpg",
        quantity: 3,
        returnWindow: "18 July 2025",
        status: "delivered",
        isBroadband: false,
      },
    ],
  },
  {
    id: "#406-3396058-1809901",
    orderId: "406-3396058-1809901",
    placed: "27 June 2025",
    total: "₹588.82",
    shipTo: "Akash Kulshrestha",
    delivered: null,
    placedDate: new Date("2025-06-27"),
    products: [
      {
        title: "Broadband - Airtel",
        image: "/airtel.png",
        quantity: 1,
        returnWindow: "",
        status: "not_shipped",
        isBroadband: true,
      },
    ],
  },
];

export default function OrderHistoryPage() {
  const [tab, setTab] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const router = useRouter();

  const handleViewDetails = (orderId: string) => {
    router.push(`/profile/orderHistory/orderDetail/${orderId}`);
  };

  const getFilteredOrdersByMonth = (orders: typeof allOrders) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (monthFilter) {
      case "past30days":
        cutoffDate.setDate(now.getDate() - 30);
        return orders.filter((order) => order.placedDate >= cutoffDate);
      case "past3months":
        cutoffDate.setMonth(now.getMonth() - 3);
        return orders.filter((order) => order.placedDate >= cutoffDate);
      case "2025":
        return orders.filter((order) => order.placedDate.getFullYear() === 2025);
      case "2024":
        return orders.filter((order) => order.placedDate.getFullYear() === 2024);
      case "2023":
        return orders.filter((order) => order.placedDate.getFullYear() === 2023);
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrdersByMonth(
    allOrders.filter((order) => {
      const allStatuses = order.products.map((p) => p.status);

      if (tab === "not_shipped") return allStatuses.includes("not_shipped");
      if (tab === "cancelled") return allStatuses.includes("cancelled");
      return true; // for "all" and "buy_again"
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
            <button
              type="button"
              onClick={() => router.push("/profile/payment")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Saved Payment Method
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/address")}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium w-full"
            >
              Address Book
            </button>
          </TabsList>
        </div>

        <TabsContent value="orders" className="w-3/4">
          <Card className="shadow-md w-full">
            {/* Filter Tabs */}
            <div className="bg-white p-4 rounded shadow mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm font-medium text-blue-600">
                {["all", "buy_again", "not_shipped", "cancelled"].map((type) => (
                  <button
                    key={type}
                    className={`pb-1 ${tab === type ? "border-b-2 border-black text-black" : "hover:underline"
                      }`}
                    onClick={() => setTab(type)}
                  >
                    {type === "all"
                      ? "Orders"
                      : type === "buy_again"
                        ? "Buy Again"
                        : type === "not_shipped"
                          ? "Not Yet Shipped"
                          : "Cancelled Orders"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input type="text" placeholder="Search all orders" className="w-64 px-3" />
                <Button>Search Orders</Button>
              </div>
            </div>

            {/* Date Filter */}
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

            {/* Orders List */}
            <CardContent className="p-6 space-y-6">
              {filteredOrders.length === 0 ? (
                <p className="text-center text-gray-500">No orders found in this category.</p>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.orderId} className="bg-white border rounded-lg shadow p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          ORDER ID: <span className="font-medium text-black">{order.orderId}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          ORDER PLACED: <span className="font-medium text-black">{order.placed}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          TOTAL: <span className="font-medium text-black">{order.total}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          SHIP TO: <span className="font-medium text-black">{order.shipTo}</span>
                        </p>
                      </div>
                      <div
                        className="text-right text-sm text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleViewDetails(order.orderId)}
                      >
                        View order details
                      </div>
                    </div>

                    {order.products.map((product, idx) => (
                      <div key={idx} className="flex gap-4 mb-4">
                        <div className="w-24 h-24 relative shrink-0">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <p className="font-medium text-black text-sm line-clamp-2">{product.title}</p>
                          <p className="text-sm text-gray-500">Qty: {product.quantity ?? 1}</p>
                          {product.status === "delivered" && (
                            <p className="text-sm text-gray-600">
                              Delivered <span className="font-semibold">{order.delivered}</span>
                            </p>
                          )}
                          {product.returnWindow && (
                            <p className="text-sm text-gray-500">
                              Return window closed on {product.returnWindow}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Button size="sm" variant="secondary">
                              Track package
                            </Button>
                            {!product.isBroadband && (
                              <>
                                <Button size="sm" variant="secondary">
                                  Leave Delivery feedback
                                </Button>
                                <Button size="sm" variant="secondary">
                                  Write a product review
                                </Button>
                              </>
                            )}
                            {product.isBroadband && (
                              <Button size="sm" variant="default">
                                Pay Bill Again
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
