'use client';

import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
    fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true,
    redirectTo = '/login',
    fallback
}) => {
    const { isAuthorized, isLoading } = useAuthGuard({
        requireAuth,
        redirectTo
    });

    if (isLoading) {
        return fallback || (
            <div className="flex min-h-screen bg-gray-100 items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#d9673f] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-700 font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // The useAuthGuard hook will handle redirection
    }

    return <>{children}</>;
};
