import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

interface NavbarCountsContextType {
    wishlistCount: number;
    cartCount: number;
    refreshWishlistCount: () => Promise<void>;
    refreshCartCount: () => Promise<void>;
    refreshAllCounts: () => Promise<void>;
}

const NavbarCountsContext = createContext<NavbarCountsContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const authHeaders = () => {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export function NavbarCountsProvider({ children }: { children: React.ReactNode }) {
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    const isAuthenticated = () => {
        if (typeof window === 'undefined') return false;
        return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
    };

    const refreshWishlistCount = useCallback(async () => {
        if (!isAuthenticated()) {
            setWishlistCount(0);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/user/wishlist`, { headers: authHeaders() });
            if (!res.ok) return;
            const data = await res.json();
            if (data.success && Array.isArray(data.data?.wishlist)) {
                setWishlistCount(data.data.wishlist.length);
            }
        } catch (err) {
            console.error('Error fetching wishlist count:', err);
        }
    }, []);

    const refreshCartCount = useCallback(async () => {
        if (!isAuthenticated()) {
            setCartCount(0);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/cart`, { headers: authHeaders() });
            if (!res.ok) return;
            const data = await res.json();
            if (data.success && Array.isArray(data.data?.items)) {
                const totalQuantity = data.data.items.reduce((total: number, item: any) => total + item.quantity, 0);
                setCartCount(totalQuantity);
            } else if (data.success && typeof data.data?.totalItems === 'number') {
                setCartCount(data.data.totalItems);
            }
        } catch (err) {
            console.error('Error fetching cart count:', err);
        }
    }, []);

    const refreshAllCounts = useCallback(async () => {
        await Promise.all([refreshWishlistCount(), refreshCartCount()]);
    }, [refreshWishlistCount, refreshCartCount]);

    // Initial load and auth change detection
    useEffect(() => {
        const handleAuthChange = () => {
            console.log('Auth change detected in NavbarCountsContext');
            if (isAuthenticated()) {
                refreshAllCounts();
            } else {
                setWishlistCount(0);
                setCartCount(0);
            }
        };

        const handleAuthStateChange = (e: CustomEvent) => {
            console.log('Custom auth state change detected in NavbarCountsContext:', e.detail);
            if (e.detail && e.detail.authenticated) {
                // User just logged in, refresh counts
                refreshAllCounts();
            }
        };

        // Initial load
        if (isAuthenticated()) {
            refreshAllCounts();
        }

        // Listen for storage events to detect auth changes
        window.addEventListener('storage', handleAuthChange);
        // Listen for custom auth events
        window.addEventListener('authStateChange', handleAuthStateChange as EventListener);
        
        return () => {
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('authStateChange', handleAuthStateChange as EventListener);
        };
    }, [refreshAllCounts]);

    return (
        <NavbarCountsContext.Provider
            value={{
                wishlistCount,
                cartCount,
                refreshWishlistCount,
                refreshCartCount,
                refreshAllCounts,
            }}
        >
            {children}
        </NavbarCountsContext.Provider>
    );
}

export function useNavbarCounts() {
    const context = useContext(NavbarCountsContext);
    if (context === undefined) {
        throw new Error('useNavbarCounts must be used within a NavbarCountsProvider');
    }
    return context;
}
