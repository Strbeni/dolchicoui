import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { loadWishlistItems } from '@/lib/store/wishlistSlice';
import { loadWishlistFromStorage } from '@/lib/wishlistStorage';

export const useWishlistInit = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Only load from localStorage for unauthenticated users
        const token = typeof window !== 'undefined'
            ? localStorage.getItem('token') || sessionStorage.getItem('token')
            : null;

        if (!token) {
            // User is not authenticated, load wishlist from localStorage
            const storedItems = loadWishlistFromStorage();
            if (storedItems.length > 0) {
                dispatch(loadWishlistItems(storedItems));
            }
        }
    }, [dispatch]);
};
