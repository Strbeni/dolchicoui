"use client";

import React from "react";
import ProfileSidebar from "./ProfileSidebar";

interface ProfileLayoutProps {
    children: React.ReactNode;
    activeSection?: string;
    className?: string;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
    children,
    activeSection = "personal-info",
    className = ""
}) => {
    return (
        <div className={`flex min-h-screen bg-gray-100 p-6 ${className}`}>
            <div className="w-full flex gap-6">
                {/* Sidebar */}
                <div className="w-1/4 shrink-0">
                    <ProfileSidebar activeSection={activeSection} />
                </div>

                {/* Main Content */}
                <div className="w-3/4 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
