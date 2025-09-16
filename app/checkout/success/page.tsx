
'use client';
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Truck, Home, Info, Loader2 } from "lucide-react";
import {Suspense} from "react";
// API Configuration
const API_BASE_URL = 'https://valyris-i.onrender.com/api';

interface OrderDetails {
  id: number;
  status: string;
  amount: number;
  date: number;
  transactionId: string;
  paymentMethod: string;
  sender: string;
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
    avatar?: string;
  };
}

interface OrderSuccessContentProps {
  orderId: string | null;
  showOrderDetails: boolean;
  setShowOrderDetails: (b: boolean) => void;
}

function OrderSuccessContent({ orderId, showOrderDetails, setShowOrderDetails }: OrderSuccessContentProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCodOrder, setIsCodOrder] = useState(false);

  // For responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Create COD order details from localStorage data
  const createCodOrderDetails = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const paymentData = localStorage.getItem('checkoutPaymentData');
      const formData = localStorage.getItem('checkoutFormData');
      
      if (!paymentData) return null;
      
      const payment = JSON.parse(paymentData);
      const form = formData ? JSON.parse(formData) : null;
      
      if (payment.method !== 'cod') return null;
      
      // Create mock order details for COD
      const codOrderDetails: OrderDetails = {
        id: Date.now(), // Use timestamp as temporary order ID
        status: 'Order Placed',
        amount: (payment.codCharges || 0) + (form?.totalAmount || 0),
        date: Date.now(),
        transactionId: 'COD-' + Date.now(),
        paymentMethod: 'Cash on Delivery',
        sender: form?.selectedAddress?.name || form?.address?.name || 'Customer',
        items: [], // COD orders don't have item details in localStorage
        user: {
          id: 1,
          name: form?.selectedAddress?.name || form?.address?.name || 'Customer',
          email: form?.selectedAddress?.email || form?.address?.email || 'customer@example.com'
        }
      };
      
      return codOrderDetails;
    } catch (error) {
      console.error('Error creating COD order details:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (orderDetails && typeof window !== 'undefined') {
      localStorage.removeItem('checkoutFormData');
      localStorage.removeItem('checkoutPaymentData');
      localStorage.removeItem('checkoutSessionId');
    }
  }, [orderDetails]);

  // Fetch order details if orderId is provided, or create COD order details
const fetchOrderDetails = useCallback(async () => {
  if (!orderId) {
    // Check if this is a COD order
    const codOrderDetails = createCodOrderDetails();
    if (codOrderDetails) {
      setIsCodOrder(true);
      setOrderDetails(codOrderDetails);
    }
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

    // Use the payment status endpoint instead of direct order endpoint
    const response = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      // Map the backend response to your expected format
      const orderData = {
        id: result.data.orderId,
        status: result.data.orderStatus,
        amount: result.data.amount,
        date: new Date(result.data.createdAt).getTime(),
        transactionId: result.data.razorpayPaymentId || (result.data.paymentMethod === 'cod' ? 'COD-' + result.data.orderId : 'N/A'),
        paymentMethod: result.data.paymentMethod === 'cod' ? 'Cash on Delivery' : result.data.paymentMethod,
        sender: result.data.address?.name || 'N/A',
        items: result.data.items || [],
        user: {
          id: 1, // You can get this from the token
          name: result.data.address?.name || 'User',
          email: result.data.address?.email || 'user@example.com'
        }
      };
      setOrderDetails(orderData);
      // Set COD flag if this is a COD order
      if (result.data.paymentMethod === 'cod') {
        setIsCodOrder(true);
      }
    } else {
      throw new Error(result.message || 'Order details not available');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load order details');
  } finally {
    setLoading(false);
  }
}, [orderId, createCodOrderDetails]);


  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }, []);

  // Main Payment Success Card
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <span className="text-sm text-gray-500">Loading order details...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm text-center">
        <Info className="w-8 h-8 mx-auto text-red-600 mb-3" />
        <div className="text-sm text-red-800">{error}</div>
        <button
          onClick={fetchOrderDetails}
          disabled={loading}
          className="mt-4 px-5 py-2 rounded bg-red-100 hover:bg-red-200 text-red-800 font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6 shadow-sm text-center">
        <Info className="w-8 h-8 mx-auto text-orange-600 mb-3" />
        <div className="text-sm text-orange-800">Order details not found.</div>
      </div>
    );
  }

  // Payment Success UI
  if (!showOrderDetails) {
    return (
      <div className={`flex flex-col items-center w-full ${isMobile ? 'py-8' : 'py-16'}`}>
        <div className="mb-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2 text-center">
          {isCodOrder ? 'Order Placed Successfully!' : 'Payment Success!'}
        </h1>
        <p className="text-gray-700 mb-6 text-center">
          {isCodOrder 
            ? 'Your order has been placed successfully. Pay cash on delivery.' 
            : 'Your payment has been successfully done.'
          }
        </p>
        <div className="flex justify-center mb-4">
          {/* Avatar fallback */}
          {orderDetails.user?.avatar ? (
            <Image
              src={orderDetails.user.avatar}
              alt="Avatar"
              width={50}
              height={50}
              className="rounded-full border-2 border-green-100 shadow"
            />
          ) : (
            <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg">
              {orderDetails.user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 w-full max-w-md mx-auto mb-4">
          <div className="flex flex-col gap-2 text-sm text-gray-800">
            <div className="flex justify-between">
              <span>Amount :</span>
              <span className="font-semibold text-gray-900 text-base">₹ {orderDetails.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Saving Status :</span>
              <span className="text-green-600 font-medium">Success</span>
            </div>
            <div className="flex justify-between">
              <span>Order Id :</span>
              <span className="font-mono font-bold">{orderDetails.id || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Id :</span>
              <span className="font-mono">{orderDetails.transactionId || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method :</span>
              <span className="font-semibold">{orderDetails.paymentMethod || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Time :</span>
              <span>{orderDetails.date ? formatDate(orderDetails.date) : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span>Sender :</span>
              <span className="font-semibold">{orderDetails.user?.name || orderDetails.sender || "N/A"}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full max-w-md mx-auto mt-4 flex-col sm:flex-row">
          <button
            onClick={() => setShowOrderDetails(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-orange-50 border border-orange-500 text-orange-700 font-semibold hover:bg-orange-100 transition"
          >
            <Truck className="w-5 h-5" />
            Delivery Status
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
        </div>
      </div>
    );
  }

  // Order Details On Delivery Status Click
  return (
    <div className={`max-w-md mx-auto w-full py-8`}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
        <div className="flex gap-3 items-center mb-4">
          <Truck className="w-7 h-7 text-orange-500" />
          <span className="font-bold text-lg text-orange-700">Delivery Status</span>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-800 mb-2">
          <div className="flex justify-between">
            <span>Status :</span>
            <span className="font-semibold text-green-600">{orderDetails.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery :</span>
            <span>
              {orderDetails.date
                ? new Date(orderDetails.date + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  weekday: "short", month: "short", day: "numeric"
                })
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Order Amount :</span>
            <span>₹ {orderDetails.amount?.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mt-3">
          <div className="font-semibold text-gray-800 mb-2">Order Items</div>
          {orderDetails.items && orderDetails.items.length > 0 ? (
            <div className="space-y-2">
              {orderDetails.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.product.name}</span>
                  <span className="text-xs text-gray-500">Qty: {item.quantity} • Size: {item.size}</span>
                  <span className="font-semibold text-orange-600">₹ {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No items found in this order.</div>
          )}
        </div>
        <button
          onClick={() => setShowOrderDetails(false)}
          className="mt-6 w-full px-4 py-2 rounded bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
        >
          Back to Payment Success
        </button>
      </div>
    </div>
  );
}

 function SuccessPaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-2">
      <div className="w-full max-w-lg">
        <OrderSuccessContent
          orderId={orderId}
          showOrderDetails={showOrderDetails}
          setShowOrderDetails={setShowOrderDetails}
        />
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading checkout details...</div>}>
      <SuccessPaymentPage />
    </Suspense>
  );
}