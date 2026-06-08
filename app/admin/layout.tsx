"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // 🌟 ပြင်ဆင်ချက် ၂: Data ဆွဲနေတုန်း (Loading) ဖြစ်နေလျှင် အောက်ကိုဆက်မသွားဘဲ စောင့်နေပေးပါမည်
        if (loading) return;

        if (user && user.role === "ADMIN") {
            setIsChecking(false);
        } else {
            router.push("/");
        }
    }, [user, loading, router]); // loading ကို Dependency တွင် ထည့်ထားပါသည်

    const menuItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
        { name: "Walk-in Sale", path: "/admin/walk-in", icon: "🛍️" },
        { name: "Orders", path: "/admin/orders", icon: "🛒️" },
        { name: "Products", path: "/admin/products", icon: "📦" },
    ];

    // 🌟 ပြင်ဆင်ချက် ၃: Loading ဖြစ်နေချိန်တွင် Loading UI ပြပေးထားပါမည်
    if (loading || isChecking) {
        return <div className="min-h-[calc(100vh-80px)] flex items-center justify-center font-bold text-blue-600">Verifying Admin Access...</div>;
    }

    return (
        // 🌟 ပြင်ဆင်ချက်: Navbar အမြင့် 80px (h-20) ကို ဖယ်ထုတ်ပြီး တွက်ချက်ထားပါသည်
        <div className="flex min-h-[calc(100vh-80px)] bg-gray-50">

            {/* 🌟 Sidebar - top-20 သတ်မှတ်ထားသဖြင့် အပေါ်က Navbar ကို လုံးဝ မဖုံးတော့ပါ */}
            <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-yellow-400 text-gray-900 transition-all duration-300 fixed top-20 left-0 h-[calc(100vh-80px)] z-40 flex flex-col shadow-2xl border-t border-yellow-500`}>

                {/* 🌟 Hamburger / Close Button */}
                <div className={`p-4 flex items-center shrink-0 h-18 border-b border-yellow-500 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 text-gray-800 hover:bg-yellow-500 rounded-xl transition-all flex items-center justify-center font-black"
                    >
                        <span className="text-2xl">{isCollapsed ? "☰" : "✕"}</span>
                    </button>
                </div>

                {/* 🌟 Navigation Links */}
                <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} href={item.path}
                                  className={`flex items-center p-4 rounded-2xl transition-all ${isActive ? 'bg-gray-900 shadow-lg shadow-gray-900/30 text-white' : 'text-gray-800 hover:bg-yellow-500 hover:text-black font-medium'}`}>
                                <span className="text-2xl">{item.icon}</span>
                                {!isCollapsed && <span className="ml-4 font-bold truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* 🌟 Footer User Info */}
                {!isCollapsed && (
                    <div className="p-6 border-t border-yellow-500 bg-yellow-500/50 shrink-0">
                        <p className="text-xs text-gray-700 font-bold mb-2 uppercase">Logged in as</p>
                        <p className="text-sm font-black text-gray-900 truncate">{user?.fullName}</p>
                    </div>
                )}
            </aside>

            {/* 🌟 Main Content Area */}
            <main className={`${isCollapsed ? 'ml-20' : 'ml-72'} flex-1 transition-all duration-300 flex flex-col min-h-[calc(100vh-80px)]`}>
                <div className="p-8 pb-20">
                    {children}
                </div>
            </main>
        </div>
    );
}