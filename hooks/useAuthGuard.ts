'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated, selectUser, selectUserLoading } from '@/lib/store/userSlice';

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
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const userLoading = useAppSelector(selectUserLoading);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        // If auth is required but no token and not loading
        if (requireAuth && !token && !userLoading) {
            router.push(redirectTo);
            return;
        }

        // If auth is required, has token, but user fetch failed and not loading
        if (requireAuth && token && !isAuthenticated && !user && !userLoading) {
            // Clear invalid tokens and redirect
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            router.push(redirectTo);
        }
    }, [isAuthenticated, user, userLoading, requireAuth, router, redirectTo]);

    const isLoading = userLoading && requireAuth;
    const isAuthorized = requireAuth ? isAuthenticated && user : true;

    return {
        isAuthenticated,
        user,
        isLoading,
        isAuthorized
    };
};
