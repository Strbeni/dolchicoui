// contexts/WishlistContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type WishlistContextType = {
  wishlistCount: number;
  addToWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistCount, setWishlistCount] = useState(0);

  const addToWishlist = () => {
    setWishlistCount(prev => prev + 1);
  };

  return (
    <WishlistContext.Provider value={{ wishlistCount, addToWishlist }}>
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
