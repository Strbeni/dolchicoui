'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchUser, setUser, selectIsAuthenticated, selectUser, selectUserLoading } from '@/lib/store/userSlice';

export const useAuthInit = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const userLoading = useAppSelector(selectUserLoading);
    const [authInitialized, setAuthInitialized] = useState(false);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window === 'undefined') return;

            try {
                // Check for existing token
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                setHasToken(!!token);

                if (token) {
                    // Check if user data exists in localStorage
                    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

                    if (storedUser && !user && !isAuthenticated) {
                        try {
                            const userData = JSON.parse(storedUser);
                            console.log('Setting user from localStorage:', userData);
                            dispatch(setUser(userData));
                        } catch (error) {
                            console.error('Error parsing stored user data:', error);
                            // If stored user data is corrupted, fetch from server
                            await dispatch(fetchUser()).unwrap();
                        }
                    } else if (!storedUser && !user && !isAuthenticated) {
                        // No stored user data, fetch from server
                        console.log('Fetching user from server...');
                        await dispatch(fetchUser()).unwrap();
                    }
                } else {
                    // No token found, clear any leftover user data
                    console.log('No token found, clearing user data');
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                // Clear invalid tokens
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setHasToken(false);
            } finally {
                setAuthInitialized(true);
                console.log('Auth initialization completed');
            }
        };

        // Listen for storage events to detect authentication changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' || e.key === 'user') {
                console.log('Storage change detected, reinitializing auth');
                setAuthInitialized(false);
            }
        };

        // Listen for custom storage events from login page
        const handleCustomStorageEvent = () => {
            console.log('Custom storage event detected, reinitializing auth');
            setAuthInitialized(false);
        };

        // Listen for custom auth state change events
        const handleAuthStateChange = (e: CustomEvent) => {
            console.log('Auth state change event detected:', e.detail);
            if (e.detail && e.detail.user && e.detail.authenticated) {
                // Immediately set user in Redux store
                dispatch(setUser(e.detail.user));
                setAuthInitialized(true);
            }
        };

        if (!authInitialized) {
            initializeAuth();
        }

        // Add event listeners
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('storage', handleCustomStorageEvent);
        window.addEventListener('authStateChange', handleAuthStateChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('storage', handleCustomStorageEvent);
            window.removeEventListener('authStateChange', handleAuthStateChange as EventListener);
        };
    }, [dispatch, isAuthenticated, user, authInitialized]);

    return { 
        isAuthenticated, 
        user, 
        authInitialized,
        userLoading,
        hasToken
    };
};
