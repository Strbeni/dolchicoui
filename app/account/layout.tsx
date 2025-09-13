"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ProfileSidebar from "@/components/ProfileSidebar";

interface AccountLayoutProps {
    children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 p-3 md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* Sidebar - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:block lg:w-80 flex-shrink-0">
                    <div className="sticky top-6">
                        <ProfileSidebar />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 max-w-4xl w-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;