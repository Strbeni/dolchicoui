// lib/paymentApi.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

interface OrderItem {
  productId: number;
  size: string;
  quantity: number;
  price: number;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface CreateOrderData {
  items: OrderItem[];
  amount: number;
  address: Address;
  notes?: any;
}

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Get auth token from localStorage or cookies
// Update getAuthToken function to match your backend expectations:
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Match the token key names used in your other pages
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
};


export const createPaymentOrder = async (orderData: CreateOrderData) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/payment/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create payment order');
  }
  
  return data;
};

export const verifyPayment = async (paymentData: PaymentVerificationData) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/payment/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Payment verification failed');
  }
  
  return data;
};

export const getPaymentStatus = async (orderId: string) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/payment/status/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get payment status');
  }
  
  return data;
};

export const retryPayment = async (orderId: string) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/payment/retry/${orderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retry payment');
  }
  
  return data;
};
