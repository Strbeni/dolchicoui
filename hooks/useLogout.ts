'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { clearUser } from '@/lib/store/userSlice';
import { useLoading } from '@/contexts/LoadingContext';

export const useLogout = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { setLoading, setLoadingMessage } = useLoading();

    const logout = useCallback(async (redirectTo: string = '/login') => {
        try {
            setLoadingMessage("Logging out...");
            setLoading(true);

            // Call backend logout API to clear server-side session
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

            try {
                await fetch(`${API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                console.error('Error during logout API call:', error);
                // Continue with client-side logout even if API call fails
            }

            // Clear all client-side storage
            if (typeof window !== 'undefined') {
                localStorage.clear(); // Clear all localStorage
                sessionStorage.clear(); // Clear all sessionStorage

                // Clear specific auth cookies
                const cookies = ['auth-token', 'session', 'jwt'];
                cookies.forEach(cookie => {
                    document.cookie = `${cookie}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                    document.cookie = `${cookie}=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                });
            }

            // Clear Redux state
            dispatch(clearUser());

            // Small delay to show loading, then redirect
            setTimeout(() => {
                setLoading(false);
                router.push(redirectTo);

                // Force a page reload to ensure clean state
                if (typeof window !== 'undefined') {
                    window.location.href = redirectTo;
                }
            }, 500);

        } catch (error) {
            console.error('Logout error:', error);
            setLoading(false);

            // Force logout even if there are errors
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }
            dispatch(clearUser());
            router.push(redirectTo);
        }
    }, [dispatch, router, setLoading, setLoadingMessage]);

    return logout;
};
