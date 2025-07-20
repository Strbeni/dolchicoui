'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type CartContextType = {
  cartCount: number;
  addToCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};


// CartContext.tsx
// 'use client';

// import { createContext, useContext, useState, ReactNode } from 'react';

// type CartItem = {
//   id: number;
//   name: string;
//   price: number;
//   image: string;
//   quantity: number;
//   originalPrice?: number;
//   discount?: number;
// };

// type CartContextType = {
//   items: CartItem[];
//   addToCart: (item: CartItem) => void;
//   updateQuantity: (id: number, delta: number) => void;
//   removeFromCart: (id: number) => void;
//   cartCount: number; // TOTAL quantity across all items
// };

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const CartProvider = ({ children }: { children: ReactNode }) => {
//   const [items, setItems] = useState<CartItem[]>([]);

//   const addToCart = (item: CartItem) => {
//     setItems(prev => {
//       const existing = prev.find(i => i.id === item.id);
//       if (existing) {
//         return prev.map(i =>
//           i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
//         );
//       }
//       return [...prev, { ...item, quantity: 1 }];
//     });
//   };

//   const updateQuantity = (id: number, delta: number) => {
//     setItems(prev =>
//       prev.map(item =>
//         item.id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + delta) }
//           : item
//       )
//     );
//   };

//   const removeFromCart = (id: number) => {
//     setItems(prev => prev.filter(item => item.id !== id));
//   };

//   // 👇 FIXED: count total quantity
//   const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

//   return (
//     <CartContext.Provider
//       value={{ items, addToCart, updateQuantity, removeFromCart, cartCount }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error('useCart must be used within a CartProvider');
//   return context;
// };
