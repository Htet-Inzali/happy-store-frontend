"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    // Admin စာမျက်နှာများတွင် customer-facing footer မပြပါ
    if (pathname?.startsWith("/admin")) return null;

    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 mt-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">

                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center space-x-2">
                            <Image src="/default-happystore-logo.jpg" alt="HappyStore" width={36} height={36} className="w-9 h-9 rounded-xl" />
                            <span className="text-xl font-black text-white uppercase">
                                Happy<span className="text-orange-400">Store</span>
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                            မြန်မာ့ အရသာ ပစ္စည်းများ — ဗီယက်နမ်အရောက် ဝန်ဆောင်မှု။
                        </p>
                    </div>

                    {/* ဆက်သွယ်ရန် */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">ဆက်သွယ်ရန်</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="https://zalo.me/84365750492" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                    <span>💬</span> +84 36 575 0492 <span className="text-gray-500 text-xs">(Zalo)</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/886976399644" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                    <span>💬</span> +886 976 399 644 <span className="text-gray-500 text-xs">(WhatsApp)</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://www.facebook.com/HappyStoreBurmeseProduct" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                    <span>📘</span> Facebook Page
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* တည်နေရာ */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">တည်နေရာ</h3>
                        <p className="text-sm text-gray-400 leading-relaxed flex items-start gap-2">
                            <span>📍</span> FPT City, DaNang City, Vietnam
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Menu</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">ပင်မစာမျက်နှာ</Link></li>
                            <li><Link href="/cart" className="hover:text-white transition-colors">ခြင်းတောင်း</Link></li>
                            <li><Link href="/orders" className="hover:text-white transition-colors">ဝယ်ယူမှု မှတ်တမ်း</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
                    © {year} HappyStore · မြန်မာ့ အရသာ ဗီယက်နမ်အရောက်
                </div>
            </div>
        </footer>
    );
}
