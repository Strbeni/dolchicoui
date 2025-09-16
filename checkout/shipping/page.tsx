"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";

// Razorpay loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// API
const API_BASE_URL = "https://valyris-i.onrender.com/api";
const COUPON_KEY = "appliedCoupon";

// Types
interface CartItem {
  id: number;
  productId: number;
  size: string;
  quantity: number;
  price: number;
  product: { name: string; image: string[] };
}
interface CartData {
  items: CartItem[];
  summary: { totalItems: number; subtotal: number };
}
interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  province: string;
  country: string;
  zipCode: string;
}
interface PaymentData {
  method: "cod" | "upi" | "card" | "razorpay";
  razorpayPaymentId?: string;
}

const PaymentMethodPage = () => {
  // States
  const [paymentMethod, setPaymentMethod] = useState<PaymentData["method"]>("razorpay");
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auth check
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("Please login to continue");
      return false;
    }
    return true;
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [getAuthHeaders]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      if (!checkAuth()) return;
      try {
        const cartResult = await fetchCart();
        if (!cartResult || cartResult.items.length === 0) {
          setCartData(null);
          return;
        }
        setCartData(cartResult);

        const savedForm = localStorage.getItem("checkoutFormData");
        if (savedForm) setFormData(JSON.parse(savedForm));
        else setError("No delivery address found. Please complete checkout first.");

        const storedCoupon = localStorage.getItem(COUPON_KEY);
        if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));
      } catch {
        setError("Failed to load checkout data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [checkAuth, fetchCart]);

  const subtotal = cartData?.summary.subtotal || 0;
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? Math.floor(subtotal * appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0;
  const total = Math.max(0, subtotal - couponDiscount);

  // Razorpay
  const handleRazorpayPayment = useCallback(async () => {
    if (!checkAuth()) return;
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) return alert("Razorpay SDK failed to load.");

    try {
      const orderRes = await fetch(`${API_BASE_URL}/create-razorpay-order`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: total * 100 }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error("Failed to create order");

      const options = {
        key: "YOUR_RAZORPAY_KEY", // Replace with your key
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Valyris Shop",
        description: "Order Payment",
        order_id: orderData.order.id,
        handler: (response: any) => {
          localStorage.setItem(
            "checkoutPaymentData",
            JSON.stringify({ method: "razorpay", razorpayPaymentId: response.razorpay_payment_id })
          );
          window.location.href = "/checkout/confirmation";
        },
        prefill: {
          name: formData?.name || "",
          email: formData?.email || "",
          contact: formData?.phone || "",
        },
        theme: { color: "#F97316" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      alert("Failed to start payment. Try again.");
    }
  }, [total, formData, getAuthHeaders, checkAuth]);

  const handleContinue = () => {
    if (paymentMethod === "razorpay") handleRazorpayPayment();
    else {
      localStorage.setItem("checkoutPaymentData", JSON.stringify({ method: paymentMethod }));
      window.location.href = "/checkout/confirmation";
    }
  };

  const handleEditAddress = () => (window.location.href = "/checkout");
  const handleBackToCart = () => (window.location.href = "/cart");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  if (!cartData || cartData.items.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Your cart is empty.</p>
        <button onClick={() => (window.location.href = "/productlist")}>Shop Now</button>
      </div>
    );

  // Render
  return (
    <div className="min-h-screen bg-[#faf9f6] p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Section */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Payment Method</h1>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="radio"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                className="w-4 h-4 text-orange-600"
              />
              <label className="ml-2 font-medium">Pay Online (Razorpay)</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="w-4 h-4 text-orange-600"
              />
              <label className="ml-2 font-medium">Cash on Delivery</label>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-orange-500 text-white py-3 rounded font-medium hover:bg-orange-600 transition"
          >
            Proceed To Payment
          </button>

          {/* Delivery Address */}
          <div className="bg-gray-50 p-4 rounded space-y-1">
            <h3 className="font-semibold">Delivering Address</h3>
            {formData && (
              <>
                <p>{formData.name}</p>
                <p>{formData.phone}</p>
                <p>{formData.street}, {formData.province}, {formData.zipCode}</p>
              </>
            )}
            <button onClick={handleEditAddress} className="mt-2 w-full border border-orange-500 text-orange-500 py-1 rounded">
              Edit Address
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-[#f8f8f8] p-4 rounded shadow-sm space-y-2">
            <h2 className="font-semibold">Order Summary</h2>
            <p>Subtotal: ₹ {subtotal}</p>
            <p>Coupon Discount: -₹ {couponDiscount}</p>
            <p className="font-bold text-orange-600">Total: ₹ {total}</p>
            <button onClick={handleBackToCart} className="w-full border border-orange-500 text-orange-500 py-1 rounded mt-2">
              Edit Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPage;
