'use client';

import Link from "next/link";
import { CheckCircle, Package, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";

// API Configuration
const API_BASE_URL = 'http://localhost:4000/api';

// Types
interface OrderDetails {
  id: number;
  status: string;
  amount: number;
  date: number;
  items: Array<{
    id: number;
    quantity: number;
    size: string;
    price: number;
    product: {
      id: number;
      name: string;
      image?: string[];
    };
  }>;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface OrderSuccessContentProps {
  orderId: string | null;
}

function OrderSuccessContent({ orderId }: OrderSuccessContentProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Clear checkout data after successful order
  useEffect(() => {
    if (orderDetails) {
      // Clean up checkout data from localStorage
      localStorage.removeItem('checkoutFormData');
      localStorage.removeItem('checkoutPaymentData');
      localStorage.removeItem('checkoutSessionId');
    }
  }, [orderDetails]);

  // Fetch order details if orderId is provided
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication required to view order details');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check your order number.');
        } else if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.');
        } else {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }
      }

      const result = await response.json();
      if (result.success && result.order) {
        setOrderDetails(result.order);
      } else {
        throw new Error(result.message || 'Order details not available');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, getAuthHeaders]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Format order status for display
  const formatStatus = useCallback((status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  // Get status color and icon
  const getStatusInfo = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'order_placed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📋',
          description: 'Your order has been received and is being processed'
        };
      case 'confirmed':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '✅',
          description: 'Your order has been confirmed and will be prepared soon'
        };
      case 'shipped':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🚚',
          description: 'Your order is on its way to you'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '📦',
          description: 'Your order has been delivered successfully'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌',
          description: 'Your order has been cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📋',
          description: 'Order status updated'
        };
    }
  }, []);

  // Format order date
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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

  if (loading) {
    return (
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div className="text-sm font-medium text-red-800">Failed to Load Order</div>
        </div>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={fetchOrderDetails}
            disabled={loading}
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </button>
          <Link
            href="/orders"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="text-sm font-medium text-yellow-800">No Order ID Found</div>
        </div>
        <p className="text-sm text-yellow-600 mb-4">
          Your order was placed successfully, but we couldn&apos;t retrieve the order details.
        </p>
        <Link
          href="/orders"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-medium transition"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Order Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 max-w-lg w-full shadow-lg">
        {/* Order Header */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-1">Order Number</div>
          <div className="font-mono font-bold text-xl text-gray-800">#{orderId}</div>
        </div>
        
        {orderDetails ? (
          <div className="space-y-6">
            {/* Status with Enhanced Display */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Current Status</div>
              {(() => {
                const statusInfo = getStatusInfo(orderDetails.status);
                return (
                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                      <span>{statusInfo.icon}</span>
                      <span>{formatStatus(orderDetails.status)}</span>
                    </div>
                    <p className="text-xs text-gray-600 max-w-xs mx-auto">
                      {statusInfo.description}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Order Summary Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                <div className="font-bold text-lg text-green-600">
                  IDR {orderDetails.amount?.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Items</div>
                <div className="font-semibold text-gray-800">
                  {orderDetails.items?.length || 0}
                </div>
              </div>
            </div>
            
            {/* Order Date */}
            {orderDetails.date && (
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Order Placed</div>
                <div className="text-sm font-medium text-gray-800">
                  {formatDate(orderDetails.date)}
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {orderDetails.date && orderDetails.status !== 'delivered' && orderDetails.status !== 'cancelled' && (
              <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-600 mb-1">📅 Estimated Delivery</div>
                <div className="text-sm font-semibold text-blue-800">
                  {getEstimatedDelivery(orderDetails.date, orderDetails.status)}
                </div>
              </div>
            )}
            
            {/* Items Preview */}
            {orderDetails.items && orderDetails.items.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-3 font-medium">Items in This Order</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {orderDetails.items.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${index}`} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{item.product.name}</div>
                        <div className="text-gray-500">Size: {item.size} • Qty: {item.quantity}</div>
                      </div>
                      <div className="text-gray-700 font-medium ml-2">
                        IDR {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                {orderDetails.items.length > 3 && (
                  <div className="text-center mt-2">
                    <Link 
                      href={`/orders/${orderId}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all {orderDetails.items.length} items
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Customer Info */}
            {orderDetails.user && (
              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-2">Order Details</div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-800">
                    {orderDetails.user.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {orderDetails.user.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800 text-center">
              🔄 Order details are being processed and will be available shortly.
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-lg">
        {orderId && (
          <Link
            href="/orders"
            className="bg-[#d86538] hover:bg-[#b9552e] text-white px-6 py-3 uppercase text-sm font-semibold tracking-wide transition flex items-center justify-center space-x-2 rounded-lg shadow-md flex-1"
          >
            <Eye className="w-4 h-4" />
            <span>Track Order</span>
          </Link>
        )}
        
        <Link
          href="/productlist"
          className="border-2 border-[#d86538] text-[#d86538] hover:bg-[#d86538] hover:text-white px-6 py-3 uppercase text-sm font-semibold tracking-wide transition flex items-center justify-center space-x-2 rounded-lg flex-1"
        >
          <Package className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </>
  );
}

// Loading fallback for the Suspense boundary
function OrderSuccessLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 mb-6">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      <span className="text-gray-500">Loading order details...</span>
      <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

// Main Success Page Component
export default function SuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti effect after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="hover:opacity-80 transition">
          <h1 className="text-2xl font-serif tracking-wide">
            <span className="text-[#e76f34] font-bold">M</span>
            <span className="text-black font-medium">ODEVA</span>
          </h1>
        </Link>
      </div>

      {/* Success Icon with Animation */}
      <div className="relative mb-8">
        <div className="relative">
          <CheckCircle className="text-green-500 w-20 h-20 drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 bg-green-100 rounded-full p-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        {showConfetti && (
          <div className="absolute -inset-4">
            <div className="w-full h-full border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
          </div>
        )}
      </div>

      {/* Heading with Animation */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 animate-fade-in">
          ORDER PLACED SUCCESSFULLY!
        </h1>
        <p className="text-lg text-gray-600 animate-fade-in-delay">
          🎉 Thank you for your purchase!
        </p>
      </div>

      {/* Order Details Component */}
      <Suspense fallback={<OrderSuccessLoading />}>
        <OrderSuccessContentWrapper />
      </Suspense>

      {/* Description */}
      <div className="max-w-2xl mb-10 space-y-4">
        <div className="bg-white/80 backdrop-blur rounded-xl p-6 border border-gray-200">
          <p className="text-gray-700 mb-3 font-medium">
            🚀 Your order is now in our fulfillment center
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our team is carefully preparing your items for shipment. You&apos;ll receive tracking information via email once your package is on its way.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Browse our collection while you wait – you might find something else you love!
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-800 text-sm font-medium transition inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <span className="text-gray-300 hidden sm:block">|</span>
        
        <Link
          href="/orders"
          className="text-[#d86538] hover:text-[#b9552e] text-sm font-medium transition"
        >
          View All Orders
        </Link>
      </div>

      {/* Email Confirmation Notice */}
      <div className="max-w-md w-full mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-blue-800 text-base mb-2">📧 Email Confirmation Sent</div>
              <div className="text-blue-700 text-sm leading-relaxed">
                A detailed order confirmation has been sent to your email with:
              </div>
              <ul className="text-blue-600 text-xs mt-2 space-y-1 list-disc list-inside">
                <li>Complete order summary</li>
                <li>Tracking information</li>
                <li>Delivery timeline</li>
                <li>Customer support contacts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Support Notice */}
      <div className="text-center bg-white/60 backdrop-blur rounded-lg p-4 border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Need assistance with your order?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/support"
            className="text-sm text-[#d86538] hover:text-[#b9552e] font-semibold transition"
          >
            📞 Contact Support
          </Link>
          <span className="text-gray-300 hidden sm:block">•</span>
          <Link
            href="/faq"
            className="text-sm text-gray-600 hover:text-gray-800 transition"
          >
            💡 Visit FAQ
          </Link>
          <span className="text-gray-300 hidden sm:block">•</span>
          <Link
            href="/track-order"
            className="text-sm text-gray-600 hover:text-gray-800 transition"
          >
            📦 Track Package
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-xs text-gray-400">
        <p>Order confirmation • Secure checkout completed</p>
      </div>
    </div>
  );
}

// Wrapper component to handle search params
function OrderSuccessContentWrapper() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  return <OrderSuccessContent orderId={orderId} />;
}
