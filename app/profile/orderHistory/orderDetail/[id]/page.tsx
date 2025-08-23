'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, Menu, X } from "lucide-react";
import Image from "next/image";

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
    category?: string;
    subCategory?: string;
  };
}

interface Order {
  id: number;
  status: string;
  amount: number;
  date: number;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }
      }

      const result = await response.json();
      
      if (result.success && result.order) {
        setOrder(result.order);
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
  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Calculate estimated delivery
  const getEstimatedDelivery = useCallback((orderDate: number, status: string) => {
    const date = new Date(orderDate);
    let deliveryDays = 3; // Default 3 days

    if (status.toLowerCase() === 'shipped') {
      deliveryDays = 1; // 1 day if already shipped
    } else if (status.toLowerCase() === 'confirmed') {
      deliveryDays = 2; // 2 days if confirmed
    }

    const estimatedDate = new Date(date.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
    return estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm lg:text-base">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-3 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">Error Loading Order</h2>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">{error}</p>
            <div className="space-y-3">
              <Button onClick={fetchOrderDetail} className="w-full text-sm lg:text-base">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/profile/orderHistory')} className="w-full text-sm lg:text-base">
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
      <div className="min-h-screen bg-gray-100 p-3 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <div className="text-gray-400 mb-6">
              <svg className="w-12 lg:w-16 h-12 lg:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">
              The order with ID #{orderId} could not be found.
            </p>
            <Button onClick={() => router.push('/profile/orderHistory')} className="text-sm lg:text-base">
              Back to Order History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusStep = getStatusStep(order.status);
  const steps = [
    { label: "Order Placed", icon: "📦" },
    { label: "Confirmed", icon: "✅" },
    { label: "Shipped", icon: "🚚" },
    { label: "Delivered", icon: "📬" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-3 lg:p-6">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.back()}
                className="flex items-center text-sm text-gray-500 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
            
            {isMobileMenuOpen && (
              <div className="space-y-2 border-t pt-3">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium text-sm"
                >
                  Account
                </button>
                <button
                  onClick={() => router.push("/profile/orderHistory")}
                  className="w-full text-left px-3 py-2 rounded bg-gray-100 font-semibold text-sm"
                >
                  Order History
                </button>
                <button
                  onClick={() => router.push("/profile/paymentMethod")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium text-sm"
                >
                  Saved Payment Method
                </button>
                <button
                  onClick={() => router.push("/profile/addressBook")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition font-medium text-sm"
                >
                  Address Book
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-1/4 pr-6">
          <div className="flex flex-col w-full gap-2 bg-white p-4 shadow rounded-xl">
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
          </div>
        </div>

        {/* Order Detail Content */}
        <div className="flex-1 lg:w-3/4">
          <Card>
            <div className="p-3 lg:p-6">
              {/* Header - Desktop only */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <div
                  className="flex items-center text-sm text-gray-500 cursor-pointer hover:underline"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Order History
                </div>
              </div>

              {/* Order Info Card */}
              <Card className="mb-4 lg:mb-6 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Order #{order.id}</div>
                      <div className="text-xs lg:text-sm text-gray-600 mb-2">
                        {order.items.length} Product{order.items.length > 1 ? "s" : ""} • 
                        <span className="block sm:inline"> Placed on {formatDate(order.date)}</span>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm font-semibold border ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="text-xl lg:text-2xl font-bold text-green-700">
                        IDR {order.amount.toLocaleString()}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Delivery */}
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                  <div className="text-xs lg:text-sm text-blue-600 mb-1">📅 Estimated Delivery</div>
                  <div className="text-sm lg:text-lg font-semibold text-blue-800">
                    {getEstimatedDelivery(order.date, order.status)}
                  </div>
                </div>
              )}

              {/* Order Progress */}
              <div className="bg-gray-50 rounded-lg p-4 lg:p-6 mb-4 lg:mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isCompleted = index < statusStep;
                    const isCurrent = index + 1 === statusStep;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1 relative"
                      >
                        <div
                          className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center z-10 text-sm lg:text-lg ${
                            isCompleted || isCurrent
                              ? "bg-orange-600 text-white shadow-lg"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <div className="text-xs mt-2 text-center font-medium max-w-16 lg:max-w-none">
                          {step.label}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`absolute top-4 lg:top-5 left-1/2 right-[-50%] h-1 ${
                              isCompleted ? "bg-orange-600" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Product List Section */}
          <Card className="mt-4 lg:mt-6">
            <CardContent className="p-4 lg:p-6">
              <div className="mb-4 lg:mb-6">
                <h2 className="text-base lg:text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-4 lg:w-5 h-4 lg:h-5" />
                  Order Items ({order.items.length})
                </h2>
                
                <div className="space-y-3 lg:space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex gap-3 lg:gap-4 p-3 lg:p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0">
                        <Image
                          src={item.product.image[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-contain rounded border"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base line-clamp-2">
                          {item.product.name}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs lg:text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Size:</span> {item.size}
                          </div>
                          <div>
                            <span className="font-medium">Qty:</span> {item.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Unit:</span> IDR {item.price.toLocaleString()}
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
              <div className="border-t pt-4 lg:pt-6">
                <div className="lg:flex lg:justify-end">
                  <div className="w-full lg:w-80">
                    <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Order Summary</h3>
                    <div className="space-y-2 lg:space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>IDR {order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t pt-2 lg:pt-3">
                        <div className="flex justify-between font-bold text-base lg:text-lg">
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
            <Card className="mt-4 lg:mt-6">
              <CardContent className="p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 lg:w-5 h-4 lg:h-5" />
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Delivery Details</h3>
                    <div className="space-y-1 text-xs lg:text-sm">
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-gray-600">{order.user.email}</p>
                      {order.user.phoneNumber && (
                        <p className="text-gray-600">Phone: {order.user.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm lg:text-base">
                      <CreditCard className="w-3 lg:w-4 h-3 lg:h-4" />
                      Payment Method
                    </h3>
                    <div className="text-xs lg:text-sm">
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