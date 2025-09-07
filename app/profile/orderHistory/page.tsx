'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import ProfileSidebar from "@/components/ProfileSidebar";

// API Configuration
const API_BASE_URL = 'https://valyris-i.onrender.com/api';

// Types
interface OrderItem {
  id: number;
  quantity: number;
  size: string;
  price: number;
  product: {
    id: number;
    name: string;
    image: string[];
  };
}

interface Order {
  id: number;
  status: string;
  amount: number;
  date: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [tab, setTab] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Authentication check
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return false;
    }
    return true;
  }, [router]);

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch user orders from backend
  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!checkAuth()) return;

      const response = await fetch(`${API_BASE_URL}/order/user`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [checkAuth, getAuthHeaders]);

  // Load orders on component mount
  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  // Format date from timestamp
  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Format status for display
  const formatStatus = useCallback((status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
        return 'text-blue-600';
      case 'confirmed':
        return 'text-yellow-600';
      case 'shipped':
        return 'text-purple-600';
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }, []);

  // Filter orders by month
  const getFilteredOrdersByMonth = useCallback((orders: Order[]) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (monthFilter) {
      case "past30days":
        cutoffDate.setDate(now.getDate() - 30);
        return orders.filter((order) => new Date(order.date) >= cutoffDate);
      case "past3months":
        cutoffDate.setMonth(now.getMonth() - 3);
        return orders.filter((order) => new Date(order.date) >= cutoffDate);
      case "2025":
        return orders.filter((order) => new Date(order.date).getFullYear() === 2025);
      case "2024":
        return orders.filter((order) => new Date(order.date).getFullYear() === 2024);
      case "2023":
        return orders.filter((order) => new Date(order.date).getFullYear() === 2023);
      default:
        return orders;
    }
  }, [monthFilter]);

  // Filter orders by status and search
  const filteredOrders = useCallback(() => {
    let filtered = orders;

    // Filter by tab/status
    if (tab === "not_shipped") {
      filtered = filtered.filter(order => 
        ['ORDER_PLACED', 'CONFIRMED'].includes(order.status.toUpperCase())
      );
    } else if (tab === "cancelled") {
      filtered = filtered.filter(order => 
        order.status.toUpperCase() === 'CANCELLED'
      );
    }
    // "all" and "buy_again" show all orders

    // Filter by month
    filtered = getFilteredOrdersByMonth(filtered);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(query) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [orders, tab, getFilteredOrdersByMonth, searchQuery]);

  const handleViewDetails = (orderId: number) => {
    router.push(`/profile/orderHistory/orderDetail/${orderId}`);
  };

  const handleSearch = () => {
    // Search is handled automatically through filteredOrders
    console.log('Searching for:', searchQuery);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchUserOrders} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayedOrders = filteredOrders();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Tabs defaultValue="orders" className="w-full flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-6">
          <ProfileSidebar activeSection="order-history" />
        </div>

        {/* Main Content */}
        <TabsContent value="orders" className="w-3/4">
          <Card className="shadow-md w-full">
            {/* Filter Tabs */}
            <div className="bg-white p-4 rounded shadow mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm font-medium text-blue-600">
                {["all", "buy_again", "not_shipped", "cancelled"].map((type) => (
                  <button
                    key={type}
                    className={`pb-1 ${tab === type ? "border-b-2 border-black text-black" : "hover:underline"}`}
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
                <Input 
                  type="text" 
                  placeholder="Search all orders" 
                  className="w-64 px-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={handleSearch}>Search Orders</Button>
              </div>
            </div>

            {/* Date Filter */}
            <div className="bg-white p-4 rounded shadow mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {displayedOrders.length} orders placed in
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
              {displayedOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery.trim() 
                      ? `No orders match "${searchQuery}"`
                      : "You haven't placed any orders in this category yet."
                    }
                  </p>
                  <Button onClick={() => router.push('/productlist')}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                displayedOrders.map((order) => (
                  <div key={order.id} className="bg-white border rounded-lg shadow p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          ORDER ID: <span className="font-medium text-black">#{order.id}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          ORDER PLACED: <span className="font-medium text-black">{formatDate(order.date)}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          TOTAL: <span className="font-medium text-black">IDR {order.amount.toLocaleString()}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          STATUS: <span className={`font-medium ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </p>
                        {order.user && (
                          <p className="text-sm text-gray-600">
                            SHIP TO: <span className="font-medium text-black">{order.user.name}</span>
                          </p>
                        )}
                      </div>
                      <div
                        className="text-right text-sm text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        View order details
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={`${item.id}-${idx}`} className="flex gap-4 mb-4">
                            <div className="w-24 h-24 relative shrink-0">
                              <Image
                                src={item.product.image[0] || '/placeholder.png'}
                                alt={item.product.name}
                                fill
                                className="object-contain rounded border"
                              />
                            </div>
                            <div className="flex flex-col justify-between flex-1">
                              <p className="font-medium text-black text-sm line-clamp-2">
                                {item.product.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} • Size: {item.size}
                              </p>
                              <p className="text-sm text-gray-600">
                                Price: IDR {item.price.toLocaleString()}
                              </p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <Button size="sm" variant="secondary">
                                  Track package
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => router.push(`/product/${item.product.id}`)}
                                >
                                  Buy again
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
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