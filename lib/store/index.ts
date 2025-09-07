import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import wishlistReducer from './wishlistSlice';

// Create a function to make the store for SSR compatibility
export function makeStore() {
  return configureStore({
    reducer: {
      user: userReducer,
      wishlist: wishlistReducer,
    },
  });
}

// Create the store instance
export const store = makeStore();

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
