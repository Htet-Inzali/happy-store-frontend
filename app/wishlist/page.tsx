"use client";

import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/app/components/ProductCard";
import Link from "next/link";

export default function WishlistPage() {
    // 🌟 API ကို ထပ်မခေါ်တော့ဘဲ Context ကနေ အဆင်သင့်ရှိနေတဲ့ Data ကို တိုက်ရိုက်ယူသုံးပါမည်
    const { wishlistItems } = useWishlist();

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <h1 className="text-3xl font-black mb-10 text-gray-900 border-l-4 border-red-500 pl-3">
                သိမ်းဆည်းထားသော ပစ္စည်းများ
            </h1>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {wishlistItems.map((product) => (
                        // Context ထဲတွင် Product အတိုင်း သိမ်းထားသဖြင့် product={product} ဟု တိုက်ရိုက်သုံးနိုင်ပါသည်
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-4xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-6xl mb-4">🤍</span>
                    <p className="font-bold text-gray-500 text-lg mb-6">Wishlist ထဲတွင် ပစ္စည်းမရှိသေးပါ။</p>
                    <Link href="/" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                        ပစ္စည်းများ သွားရောက်ရှာဖွေမည်
                    </Link>
                </div>
            )}
        </div>
    );
}