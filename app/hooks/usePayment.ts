// hooks/usePayment.ts
import { useState } from 'react';

interface PaymentConfig {
  mid: string;
  orderId: string;
  txnToken: string;
  amount: string;
  callbackUrl: string;
  isStaging: boolean;
}

interface InitiatePaymentData {
  amount: number;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (data: InitiatePaymentData): Promise<PaymentConfig | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Your auth token
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data.paytmConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = (config: PaymentConfig) => {
    if (typeof window !== 'undefined') {
      // Load Paytm script dynamically
      const script = document.createElement('script');
      script.src = config.isStaging 
        ? 'https://securestage.paytmpayments.com/merchantpgpui/checkoutjs/merchants/mid.js'
        : 'https://secure.paytmpayments.com/merchantpgpui/checkoutjs/merchants/mid.js';
      
      script.onload = () => {
        const paymentConfig = {
          "root": "",
          "flow": "DEFAULT",
          "data": {
            "orderId": config.orderId,
            "token": config.txnToken,
            "tokenType": "TXN_TOKEN",
            "amount": config.amount
          },
          "handler": {
            "notifyMerchant": function(eventName: string, data: any) {
              console.log("notifyMerchant handler function called");
              console.log("eventName => ", eventName);
              console.log("data => ", data);
            }
          }
        };

        // @ts-ignore
        window.Paytm.CheckoutJS.init(paymentConfig).then(function onSuccess() {
          // @ts-ignore
          window.Paytm.CheckoutJS.invoke();
        }).catch(function onError(error: any) {
          console.log("error => ", error);
        });
      };

      document.head.appendChild(script);
    }
  };

  return {
    initiatePayment,
    processPayment,
    loading,
    error
  };
};
