'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, FileText, Box, Truck, Handshake, Check } from "lucide-react";
import Image from "next/image";
import ProfileSidebar from "@/components/ProfileSidebar";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

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
    category?: string;
    subcategory?: string; // Changed from subCategory to subcategory
  };
}

interface Order {
  id: number;
  status: string;
  amount: number;
  date: string | number;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  items: OrderItem[];
}

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch order details from backend
  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!checkAuth()) return;

      console.log(`Fetching order details for ID: ${orderId}`);

      // Try to get all user orders first (since we know this endpoint works)
      // and then filter for the specific order
      console.log(`API URL: ${API_BASE_URL}/api/order/user`);

      const response = await fetch(`${API_BASE_URL}/api/order/user`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const responseText = await response.text();
        console.log(`Error response body:`, responseText);

        if (response.status === 404) {
          throw new Error('Orders not found');
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else {
          throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText} - ${responseText}`);
        }
      }

      const result = await response.json();
      console.log(`API response:`, result);

      if (result.success && result.orders) {
        // Find the specific order by ID
        const specificOrder = result.orders.find((order: any) => order.id.toString() === orderId);

        if (specificOrder) {
          setOrder(specificOrder);
        } else {
          throw new Error(`Order with ID ${orderId} not found`);
        }
      } else {
        throw new Error(result.message || 'Failed to load order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, checkAuth, getAuthHeaders]);

  // Load order details on component mount
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, fetchOrderDetail]);

  // Format date from timestamp
  const formatDate = useCallback((timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Format order placed date for display
  const formatOrderDate = useCallback((timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Format status for display
  const formatStatus = useCallback((status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  // Get status progress
  const getStatusStep = useCallback((status: string) => {
    switch (status.toUpperCase()) {
      case 'ORDER_PLACED':
        return 1;
      case 'CONFIRMED':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Calculate estimated delivery date (7 days from order placed)
  const getEstimatedDelivery = useCallback((orderDate: string | number) => {
    const date = new Date(typeof orderDate === 'string' ? parseInt(orderDate) : orderDate);
    const estimatedDate = new Date(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    return estimatedDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
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
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Order</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchOrderDetail} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/profile/orderHistory')} className="w-full">
                Back to Order History
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order not found state
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <div className="text-gray-400 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              The order with ID #{orderId} could not be found.
            </p>
            <Button onClick={() => router.push('/profile/orderHistory')}>
              Back to Order History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Sidebar */}
        <div className="w-1/4 flex-shrink-0">
          <div className="sticky top-6">
            <ProfileSidebar activeSection="order-history" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-white p-6 rounded-lg shadow">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
                <div className="text-sm text-gray-500">
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => router.push('/profile/orderHistory')}
                  >
                    Order History
                  </span>
                  <span className="mx-2">{'>'}</span>
                  <span>Order Details</span>
                </div>
              </div>
              <Button
                className="bg-orange-600 hover:bg-orange-700 rounded-3xl text-white px-6 py-2"
                onClick={() => console.log('Leave feedback')}
              >
                Leave Delivery Feedback
              </Button>
            </div>
          </div>

          {/* Order Info Container */}
          <div className="mb-6 bg-gray-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  #{order.id}
                </div>
                <div className="text-sm text-gray-600">
                  {order.items.length} Product{order.items.length > 1 ? "s" : ""} • Order Placed on {formatOrderDate(order.date)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ₹ {order.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Expected Delivery Date */}
          <div className="mb-6">
            <div className="text-left flex items-center gap-2">
              <span className="text-sm text-gray-600">Order expected arrival</span>
              <span className="text-lg font-semibold text-gray-800">
                {getEstimatedDelivery(order.date)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="relative">
              {/* Orange Progress Line */}
              <div className="absolute top-3 left-0 right-0 h-1 bg-orange-600 rounded-full"></div>

              {/* Progress Nodes */}
              <div className="flex justify-between relative z-10">
                {/* Order Placed */}
                <div className="flex flex-col items-center">
                  {/* Node */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusStep >= 1 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                    {statusStep >= 1 && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  {/* Icon and label below node */}
                  <div className="mt-3 flex flex-col items-center">
                    <FileText className="w-7 h-7 text-orange-600 mb-2" />
                    <div className="text-md font-medium text-gray-800">Order Placed</div>
                  </div>
                </div>

                {/* Packaging */}
                <div className="flex flex-col items-center">
                  {/* Node */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusStep >= 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                    {statusStep >= 2 && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  {/* Icon and label below node */}
                  <div className="mt-3 flex flex-col items-center">
                    <Box className="w-7 h-7 text-orange-600 mb-2" />
                    <div className="text-md font-medium text-gray-800">Packaging</div>
                  </div>
                </div>

                {/* On The Road */}
                <div className="flex flex-col items-center">
                  {/* Node */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusStep >= 3 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                    {statusStep >= 3 && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  {/* Icon and label below node */}
                  <div className="mt-3 flex flex-col items-center">
                    <Truck className="w-7 h-7 text-orange-600 mb-2" />
                    <div className="text-md font-medium text-gray-800">On The Road</div>
                  </div>
                </div>

                {/* Delivered */}
                <div className="flex flex-col items-center">
                  {/* Node */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusStep >= 4 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                    {statusStep >= 4 && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  {/* Icon and label below node */}
                  <div className="mt-3 flex flex-col items-center">
                    <Handshake className="w-7 h-7 text-orange-600 mb-2" />
                    <div className="text-md font-medium text-gray-800">Delivered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product List Section */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.items.length})
                </h2>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.image[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-contain rounded border"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.product.name}
                        </h3>
                        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Size:</span> {item.size}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Unit Price:</span> IDR {item.price.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Subtotal:</span>
                            <span className="font-bold text-gray-900"> IDR {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-6">
                <div className="flex justify-end">
                  <div className="w-80">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>IDR {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="text-green-700">IDR {order.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          {order.user && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Delivery Details</h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-gray-600">{order.user.email}</p>
                      {order.user.phoneNumber && (
                        <p className="text-gray-600">Phone: {order.user.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </h3>
                    <div className="text-sm">
                      <p className="text-gray-600">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500 mt-1">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}