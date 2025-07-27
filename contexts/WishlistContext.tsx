// contexts/WishlistContext.tsx - Local Storage Version
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  stock?: number;
};

type WishlistContextType = {
  wishlistItems: Product[];
  wishlistCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product: Product) => {
    setLoading(true);
    
    setWishlistItems(prev => {
      // Check if product already exists
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, product];
    });
    
    setLoading(false);
  };

  const removeFromWishlist = (productId: number) => {
    setLoading(true);
    
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    
    setLoading(false);
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
