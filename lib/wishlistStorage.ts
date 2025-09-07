// Utility functions for wishlist localStorage persistence

const WISHLIST_STORAGE_KEY = 'dolchico_wishlist';

export interface StoredWishlistItem {
    id: number;
    product: {
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
    };
    addedAt: string;
}

// Load wishlist from localStorage
export const loadWishlistFromStorage = (): StoredWishlistItem[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
        return [];
    }
};

// Save wishlist to localStorage
export const saveWishlistToStorage = (items: StoredWishlistItem[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
    }
};

// Clear wishlist from localStorage
export const clearWishlistFromStorage = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing wishlist from localStorage:', error);
    }
};

// Sync Redux wishlist with localStorage
export const syncWishlistWithStorage = (items: StoredWishlistItem[]): void => {
    saveWishlistToStorage(items);
};
