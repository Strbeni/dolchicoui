// hooks/useRazorpay.ts
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return { isLoaded };
};
