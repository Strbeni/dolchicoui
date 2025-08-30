// components/PaymentButton.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRazorpay } from '../app/hooks/useRazorpay';
import { createPaymentOrder, verifyPayment } from '@/lib/paymentApi';

interface PaymentButtonProps {
  cartData: any;
  formData: any;
  appliedCoupon: any;
  total: number;
  disabled?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  cartData,
  formData,
  appliedCoupon,
  total,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const { isLoaded } = useRazorpay();
  const router = useRouter();

  const handlePayment = async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);

      // Prepare order data from your existing cart structure
      const orderData = {
        items: cartData.items.map((item: any) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        })),
        amount: total,
        address: {
          name: formData.name,
          street: formData.street,
          city: formData.province, // Using province as city from your form
          state: formData.province,
          zip: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email
        },
        notes: {
          coupon: appliedCoupon?.code || null,
          totalItems: cartData.summary.totalItems
        }
      };

      // Step 1: Create Razorpay order
      const orderResponse = await createPaymentOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message);
      }

      const { orderId, amount: orderAmount, currency, key } = orderResponse.data;

      // Step 2: Configure Razorpay checkout
      const options = {
        key: key,
        amount: orderAmount,
        currency: currency,
        name: 'Your Store Name', // Replace with your store name
        description: `Order for ${cartData.summary.totalItems} item(s)`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              // Clear local storage data
              if (typeof window !== 'undefined') {
                localStorage.removeItem('checkoutFormData');
                localStorage.removeItem('appliedCoupon');
              }
              
              // Redirect to success page
              router.push(`/payment/success?orderId=${verifyResponse.orderId}&txnId=${response.razorpay_payment_id}`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            router.push(`/payment/failed?orderId=${orderResponse.data.dbOrderId}&error=${error.message}`);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#f97316' // Orange color matching your theme
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      // Step 4: Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        router.push(`/payment/failed?orderId=${orderResponse.data.dbOrderId}&error=${response.error.description}`);
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      router.push(`/payment/failed?error=${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading || !isLoaded}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Processing Payment...
        </>
      ) : !isLoaded ? (
        'Loading Payment System...'
      ) : (
        `Pay ₹${total.toLocaleString()}`
      )}
    </button>
  );
};
