'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthInit } from './useAuthInit';

interface UseAuthGuardOptions {
    redirectTo?: string;
    requireAuth?: boolean;
    showLoading?: boolean;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
    const {
        redirectTo = '/login',
        requireAuth = true,
        showLoading = true
    } = options;

    const router = useRouter();
    const { isAuthenticated, user, authInitialized, userLoading, hasToken } = useAuthInit();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Wait for auth initialization to complete
        if (!authInitialized) {
            return;
        }

        const checkAuth = () => {
            console.log('AuthGuard - checking auth:', {
                requireAuth,
                authInitialized,
                hasToken,
                isAuthenticated,
                user: !!user,
                userLoading
            });

            // If auth is required
            if (requireAuth) {
                // No token at all - redirect to login
                if (!hasToken) {
                    console.log('AuthGuard - No token, redirecting to login');
                    setAuthChecked(true);
                    router.push(redirectTo);
                    return;
                }

                // Has token but not authenticated and not loading - invalid token
                if (hasToken && !isAuthenticated && !user && !userLoading) {
                    console.log('AuthGuard - Invalid token, clearing and redirecting');
                    // Clear invalid tokens and redirect
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');
                    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    setAuthChecked(true);
                    router.push(redirectTo);
                    return;
                }

                // Has token and is authenticated - all good
                if (hasToken && isAuthenticated && user) {
                    console.log('AuthGuard - Authenticated, access granted');
                    setAuthChecked(true);
                    return;
                }

                // Has token but still loading - wait
                if (hasToken && userLoading) {
                    console.log('AuthGuard - Still loading, waiting...');
                    return;
                }
            } else {
                // Auth not required - access granted
                console.log('AuthGuard - Auth not required, access granted');
                setAuthChecked(true);
                return;
            }

            // Fallback - mark as checked
            setAuthChecked(true);
        };

        checkAuth();
    }, [authInitialized, hasToken, isAuthenticated, user, userLoading, requireAuth, router, redirectTo]);

    const isLoading = (userLoading || !authInitialized || !authChecked) && requireAuth;
    const isAuthorized = requireAuth ? (isAuthenticated && user && authChecked) : true;

    return {
        isAuthenticated,
        user,
        isLoading,
        isAuthorized,
        authInitialized
    };
};
