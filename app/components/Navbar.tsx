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

    if (!isMounted) return null;
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 justify-between items-center">
                    <div className="flex items-center space-x-10">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <Image
                                    src="/default-happystore-logo.jpg"
                                    alt="Happy Store Logo"
                                    width={40}
                                    height={40}
                                    className="rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                />
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 bg-yellow-400 blur-md transition duration-300"></div>
                            </div>
                            <span className="text-2xl font-black text-gray-900 uppercase hidden sm:block">Happy
                                <span className="text-orange-500">Store</span>
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/" className={`text-sm transition-all ${activeLink("/")}`}>Home</Link>
                            {/* 🌟 Admin မဟုတ်မှသာ Customer Menu များပြမည် */}
                            {!isAdmin && user && (
                                <>
                                    <Link href="/orders" className={`text-sm transition-all ${activeLink("/orders")}`}>ဝယ်ယူမှု မှတ်တမ်းများ</Link>
                                    <Link href="/wishlist" className={`text-sm transition-all ${activeLink("/wishlist")}`}>Wishlist</Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">

                        {/* 🌟 Admin မဟုတ်မှသာ Shopping Cart ကို ပြမည် */}
                        {!isAdmin && (
                            <Link href="/cart" className="relative p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 11.213a.75.75 0 0 1-.744.824H4.53a.75.75 0 0 1-.744-.824L4.897 8.507a.75.75 0 0 1 .744-.682h12.723a.75.75 0 0 1 .744.682Z" /></svg>
                                {totalItems > 0 && (
                                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white scale-110">{totalItems}</span>
                                )}
                            </Link>
                        )}

                        <div className="h-8 w-[1.5px] bg-gray-100 hidden sm:block"></div>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                {/* Admin သီးသန့် ခလုတ် */}
                                {isAdmin && (
                                    <Link href="/admin/orders" className="hidden md:flex items-center space-x-1 rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 border border-red-200 hover:bg-red-100 transition-all">
                                        <span>Admin Panel</span>
                                        <span>➔</span>
                                    </Link>
                                )}

                                <Link href="/profile" className="flex items-center space-x-3 bg-gray-50 p-1.5 pr-4 rounded-2xl hover:bg-gray-100 transition-all">
                                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">{user.fullName?.charAt(0).toUpperCase()}</div>
                                    <div className="hidden lg:block leading-none">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Account</p>
                                        <p className="text-sm font-black text-gray-800">{user.fullName}</p>
                                    </div>
                                </Link>
                                <button onClick={logout} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50">ထွက်မည်</button>
                            </div>
                        ) : (
                            <Link href="/login" className="rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-black text-white hover:bg-blue-700">ဝင်ရောက်မည်</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}