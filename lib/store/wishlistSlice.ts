import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveWishlistToStorage, clearWishlistFromStorage } from '../wishlistStorage';

// Product interface (matching the one from wishlist page)
interface Product {
    id: number;
    name: string;
    price: number;
    image: string[];
    category: string;
    subCategory: string;
    sizes: string[];
    bestseller: boolean;
    stock: number;
    createdAt: string;
}

// Wishlist item interface for Redux (simpler than API version)
interface WishlistItem {
    id: number; // productId for local storage
    product: Product;
    addedAt: string; // timestamp when added
}

interface WishlistState {
    items: WishlistItem[];
    loading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        // Add item to wishlist
        addToWishlist: (state, action: PayloadAction<Product>) => {
            const product = action.payload;
            const existingItem = state.items.find(item => item.id === product.id);

            if (!existingItem) {
                state.items.push({
                    id: product.id,
                    product,
                    addedAt: new Date().toISOString(),
                });
                // Sync with localStorage
                saveWishlistToStorage(state.items);
            }
            state.error = null;
        },

        // Remove item from wishlist
        removeFromWishlist: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            // Sync with localStorage
            saveWishlistToStorage(state.items);
            state.error = null;
        },

        // Clear entire wishlist
        clearWishlist: (state) => {
            state.items = [];
            // Clear from localStorage
            clearWishlistFromStorage();
            state.error = null;
        },

        // Set loading state
        setWishlistLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        // Set error state
        setWishlistError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // Load wishlist items (for hydration from localStorage)
        loadWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
            state.items = action.payload;
            state.error = null;
        },
    },
});

export const {
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    setWishlistLoading,
    setWishlistError,
    loadWishlistItems,
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items;
export const selectWishlistLoading = (state: { wishlist: WishlistState }) => state.wishlist.loading;
export const selectWishlistError = (state: { wishlist: WishlistState }) => state.wishlist.error;
export const selectWishlistCount = (state: { wishlist: WishlistState }) => state.wishlist.items.length;
export const selectIsInWishlist = (productId: number) => (state: { wishlist: WishlistState }) =>
    state.wishlist.items.some(item => item.id === productId);

export default wishlistSlice.reducer;
