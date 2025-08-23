'use client';

import Link from "next/link";
import { CheckCircle, Package, Eye, AlertCircle, RefreshCw, Home, Mail, Phone, HelpCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";

// API Configuration
const API_BASE_URL = 'https://valyris-i.onrender.com/api';

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
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Clear checkout data after successful order
  useEffect(() => {
    if (orderDetails && typeof window !== 'undefined') {
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
      
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
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
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: '📋',
          description: 'Your order has been received and is being processed'
        };
      case 'confirmed':
        return {
          color: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: '✅',
          description: 'Your order has been confirmed and will be prepared soon'
        };
      case 'shipped':
        return {
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: '🚚',
          description: 'Your order is on its way to you'
        };
      case 'delivered':
        return {
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: '📦',
          description: 'Your order has been delivered successfully'
        };
      case 'cancelled':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: '❌',
          description: 'Your order has been cancelled'
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
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
      <div className="flex flex-col items-center space-y-4 py-8">
        <div className="w-6 h-6 border-2 border-orange-200 border-t-[#D9643A] rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-sm font-medium text-red-800">Failed to Load Order</div>
        </div>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchOrderDetails}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex-1 sm:flex-none"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </button>
          <Link
            href="/orders"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition text-center flex-1 sm:flex-none"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <div className="text-sm font-medium text-orange-800">No Order ID Found</div>
        </div>
        <p className="text-sm text-orange-600 mb-4">
          Your order was placed successfully, but we couldn&apos;t retrieve the order details.
        </p>
        <Link
          href="/orders"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition inline-block"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Information Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {/* Order Header */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-1">Order Number</div>
          <div className="font-mono font-bold text-xl text-gray-800">#{orderId}</div>
        </div>
        
        {orderDetails ? (
          <div className="space-y-6">
            {/* Status */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3">Current Status</div>
              {(() => {
                const statusInfo = getStatusInfo(orderDetails.status);
                return (
                  <div className="space-y-3">
                    <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                      <span className="text-base">{statusInfo.icon}</span>
                      <span>{formatStatus(orderDetails.status)}</span>
                    </div>
                    <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                      {statusInfo.description}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Order Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border border-orange-200">
                <div className="text-xs text-[#D9643A] mb-1 font-medium">Total Amount</div>
                <div className="font-bold text-xl text-[#D9643A]">
                  IDR {orderDetails.amount?.toLocaleString()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center border border-gray-200">
                <div className="text-xs text-gray-600 mb-1 font-medium">Total Items</div>
                <div className="font-bold text-xl text-gray-700">
                  {orderDetails.items?.length || 0} items
                </div>
              </div>
            </div>
            
            {/* Order Date */}
            {orderDetails.date && (
              <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-700 mb-1 font-medium">📅 Order Placed</div>
                <div className="text-sm font-semibold text-blue-800">
                  {formatDate(orderDetails.date)}
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {orderDetails.date && orderDetails.status !== 'delivered' && orderDetails.status !== 'cancelled' && (
              <div className="text-center bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm text-purple-700 mb-1 font-medium">🚚 Estimated Delivery</div>
                <div className="text-sm font-semibold text-purple-800">
                  {getEstimatedDelivery(orderDetails.date, orderDetails.status)}
                </div>
              </div>
            )}
            
            {/* Items Preview */}
            {orderDetails.items && orderDetails.items.length > 0 && (
              <div>
                <div className="text-sm text-gray-700 mb-4 font-semibold">Items in This Order</div>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {orderDetails.items.slice(0, 3).map((item, index) => (
                    <div key={`${item.id}-${item.size}-${index}`} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm truncate">{item.product.name}</div>
                        <div className="text-gray-500 text-xs mt-1">Size: {item.size} • Quantity: {item.quantity}</div>
                      </div>
                      <div className="text-[#D9643A] font-bold ml-3 text-sm">
                        IDR {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                {orderDetails.items.length > 3 && (
                  <div className="text-center mt-3">
                    <Link 
                      href={`/orders/${orderId}`}
                      className="text-sm text-[#D9643A] hover:text-[#B8552E] font-medium hover:underline transition"
                    >
                      View all {orderDetails.items.length} items →
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Customer Info */}
            {orderDetails.user && (
              <div className="border-t pt-6">
                <div className="text-sm text-gray-600 mb-3 font-semibold">Customer Details</div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-sm font-medium text-gray-800 mb-1">
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
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-800 text-center">
              🔄 Order details are being processed and will be available shortly.
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/orders"
          className="bg-[#D9643A] hover:bg-[#B8552E] text-white px-6 py-4 text-sm font-semibold transition flex items-center justify-center gap-2 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>TRACK ORDER</span>
        </Link>
        
        <Link
          href="/productlist"
          className="border-2 border-[#D9643A] text-[#D9643A] hover:bg-[#D9643A] hover:text-white px-6 py-4 text-sm font-semibold transition flex items-center justify-center gap-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Package className="w-4 h-4" />
          <span>CONTINUE SHOPPING</span>
        </Link>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function OrderSuccessLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-[#D9643A] rounded-full animate-spin"></div>
      <div className="text-center space-y-2">
        <span className="text-gray-600 font-medium">Loading order details...</span>
        <div className="flex space-x-2 justify-center">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Main Success Page Component
export default function SuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti effect after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Animated Background Elements */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full opacity-70"
              style={{
                backgroundColor: ['#D9643A', '#f97316', '#fb923c', '#fed7aa', '#22c55e'][Math.floor(Math.random() * 5)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `bounce ${1 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}


      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="bg-green-100 rounded-full p-8 shadow-lg relative">
                <CheckCircle className="text-green-600 w-16 h-16 mx-auto" />
                {showConfetti && (
                  <>
                    <div className="absolute -inset-4 border-4 border-green-300 rounded-full animate-ping opacity-40"></div>
                    <div className="absolute -inset-8 border-2 border-green-200 rounded-full animate-pulse opacity-30"></div>
                  </>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
              PAYMENT SUCCESS!
            </h1>
            <div className="max-w-lg mx-auto">
              <p className="text-gray-600 leading-relaxed mb-6">
                Lean back and relax, knowing our team is hard at work preparing and shipping your package swiftly. Feel free to browse our diverse product selection during this time - you might discover another item you'd like to add to your collection!
              </p>
            </div>
          </div>

          {/* Order Details Component */}
          <Suspense fallback={<OrderSuccessLoading />}>
            <OrderSuccessContentWrapper />
          </Suspense>

          {/* Additional Information */}
          <div className="space-y-6 mt-8">
            {/* Email Confirmation */}
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-blue-800 text-lg mb-2">📧 Email Confirmation Sent</div>
                  <div className="text-blue-700 leading-relaxed mb-4">
                    A detailed order confirmation has been sent to your email with:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-blue-600 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Complete order summary
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Tracking information
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Delivery timeline
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Customer support contacts
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">Quick Actions</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/"
                  className="flex flex-col items-center gap-3 text-gray-600 hover:text-[#D9643A] p-4 rounded-lg hover:bg-orange-50 transition-all duration-200 group"
                >
                  <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Home</span>
                </Link>
                <Link
                  href="/support"
                  className="flex flex-col items-center gap-3 text-gray-600 hover:text-[#D9643A] p-4 rounded-lg hover:bg-orange-50 transition-all duration-200 group"
                >
                  <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Support</span>
                </Link>
                <Link
                  href="/faq"
                  className="flex flex-col items-center gap-3 text-gray-600 hover:text-[#D9643A] p-4 rounded-lg hover:bg-orange-50 transition-all duration-200 group"
                >
                  <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">FAQ</span>
                </Link>
                <Link
                  href="/track-order"
                  className="flex flex-col items-center gap-3 text-gray-600 hover:text-[#D9643A] p-4 rounded-lg hover:bg-orange-50 transition-all duration-200 group"
                >
                  <Package className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Track</span>
                </Link>
              </div>
            </div>

            {/* Back to Home - Primary CTA */}
            <Link
              href="/"
              className="w-full bg-gradient-to-r from-[#D9643A] to-[#B8552E] hover:from-[#B8552E] hover:to-[#A04A29] text-white py-6 text-center font-bold text-xl tracking-wider transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 block"
            >
              BACK TO HOME
            </Link>

            {/* Support Notice */}
            <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-gray-600 mb-4 font-medium">Need assistance with your order?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/support"
                  className="text-[#D9643A] hover:text-[#B8552E] font-semibold transition hover:underline"
                >
                  📞 Contact Support
                </Link>
                <span className="text-gray-300">•</span>
                <Link
                  href="/faq"
                  className="text-gray-600 hover:text-gray-800 transition hover:underline"
                >
                  💡 Visit FAQ
                </Link>
                <span className="text-gray-300">•</span>
                <Link
                  href="/track-order"
                  className="text-gray-600 hover:text-gray-800 transition hover:underline"
                >
                  📦 Track Package
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm">Order confirmation • Secure checkout completed</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrapper component to handle search params
function OrderSuccessContentWrapper() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  return <OrderSuccessContent orderId={orderId} />;
}