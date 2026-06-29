"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const activeLink = (path: string) =>
        pathname === path ? "text-blue-600 font-black" : "text-gray-600 font-bold hover:text-blue-600";

    // 🌟 Admin ဟုတ်မဟုတ် စစ်ဆေးခြင်း
    const isAdmin = user?.role === "ADMIN";

    // ၁။ Hydration Loading ပြသခြင်း
    if (!isMounted) {
        return (
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="w-40 h-10 bg-gray-100 rounded-xl animate-pulse" />
                    <div className="w-32 h-10 bg-gray-100 rounded-xl animate-pulse" />
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 justify-between items-center">

                    {/* Left Side: Logo & Home Link */}
                    <div className="flex items-center space-x-10">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <Image
                                src="/default-happystore-logo.jpg"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="rounded-xl shadow-md group-hover:scale-110 transition-all"
                            />
                            <span className="text-2xl font-black text-gray-900 uppercase hidden sm:block">
                                Happy<span className="text-orange-500">Store</span>
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/" className={`text-sm ${activeLink("/")}`}>Home</Link>
                            {/* 🌟 Admin မဟုတ်မှသာ Customer Menu များပြမည် */}
                            {!isAdmin && user && (
                                <>
                                    <Link href="/orders" className={`text-sm ${activeLink("/orders")}`}>ဝယ်ယူမှု မှတ်တမ်းများ</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Actions & Auth */}
                    <div className="flex items-center space-x-4">

                        {/* 🌟 Admin မဟုတ်မှသာ Shopping Cart ကို ပြမည် */}
                        {!isAdmin && (
                            <Link href="/cart" className="relative p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 11.213a.75.75 0 0 1-.744.824H4.53a.75.75 0 0 1-.744-.824L4.897 8.507a.75.75 0 0 1 .744-.682h12.723a.75.75 0 0 1 .744.682Z" /></svg>
                                {totalItems > 0 && (
                                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white scale-110">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center space-x-4 border-l pl-4 border-gray-100">
                                {/* 🌟 Admin ဖြစ်ပါက Admin Panel ခလုတ်ကို ပြမည် */}
                                {isAdmin && (
                                    <Link href="/admin/orders" className="hidden md:flex items-center space-x-1 rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 border border-red-200 hover:bg-red-100 transition-all">
                                        <span>Admin Panel ➔</span>
                                    </Link>
                                )}

                                <Link href="/profile" className="flex items-center space-x-2">
                                    <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                                        {user.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden lg:block text-sm font-bold text-gray-700">{user.fullName}</span>
                                </Link>
                                <button onClick={logout} className="text-xs font-bold text-red-500 hover:underline">ထွက်မည်</button>
                            </div>
                        ) : (
                            // 🌟 အကောင့်မဝင်ရသေးလျှင် Login နှင့် Register ခလုတ်များပြမည်
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                                    ဝင်ရောက်မည်
                                </Link>
                                <Link href="/register" className="px-5 py-2.5 text-sm font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                                    အကောင့်ဖွင့်မည်
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}