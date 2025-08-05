// hooks/usePayment.ts
import { useState } from 'react';

/* ---------- ambient Paytm type ---------- */
declare global {
  interface Window {
    Paytm?: {
      CheckoutJS: {
        init(config: unknown): Promise<void>;
        invoke(): void;
      };
    };
  }
}

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

  const initiatePayment = async (
    data: InitiatePaymentData
  ): Promise<PaymentConfig | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.message);

      return result.data.paytmConfig as PaymentConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = (config: PaymentConfig) => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = config.isStaging
      ? `https://securestage.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${config.mid}.js`
      : `https://secure.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${config.mid}.js`;

    script.onload = () => {
      const paymentConfig = {
        root: '',
        flow: 'DEFAULT',
        data: {
          orderId: config.orderId,
          token: config.txnToken,
          tokenType: 'TXN_TOKEN',
          amount: config.amount,
        },
        handler: {
          notifyMerchant(eventName: string, data: unknown) {
            console.log('notifyMerchant:', eventName, data);
          },
        },
      };

      window.Paytm?.CheckoutJS.init(paymentConfig)
        .then(() => window.Paytm?.CheckoutJS.invoke())
        .catch((err: unknown) => console.error('Paytm init error:', err));
    };

    document.head.appendChild(script);
  };

  return {
    initiatePayment,
    processPayment,
    loading,
    error,
  };
};
