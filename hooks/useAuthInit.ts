'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchUser, setUser, selectIsAuthenticated, selectUser } from '@/lib/store/userSlice';

export const useAuthInit = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window === 'undefined') return;

            // Check for existing token
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (token && !user && !isAuthenticated) {
                try {
                    // Check if user data exists in localStorage
                    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

                    if (storedUser) {
                        try {
                            const userData = JSON.parse(storedUser);
                            dispatch(setUser(userData));
                        } catch (error) {
                            console.error('Error parsing stored user data:', error);
                            // If stored user data is corrupted, fetch from server
                            await dispatch(fetchUser()).unwrap();
                        }
                    } else {
                        // No stored user data, fetch from server
                        await dispatch(fetchUser()).unwrap();
                    }
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    // Clear invalid tokens
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');
                    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                }
            }
        };

        initializeAuth();
    }, [dispatch, isAuthenticated, user]);

    return { isAuthenticated, user };
};
