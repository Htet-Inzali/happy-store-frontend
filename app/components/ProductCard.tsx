"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext"; // 🌟 Admin စစ်ရန် Import လုပ်ထားသည်

export default function ProductCard({ product }: { product: any }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth(); // 🌟 User Data ဆွဲယူခြင်း

    const isAdmin = user?.role === "ADMIN";

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isAdmin) return; // Admin ဆိုလျှင် ဝယ်ခွင့်မပေးပါ
        addToCart(product);
    };

    let imageUrl = "https://via.placeholder.com/300?text=No+Image";
    if (product.imageUrl) {
        if (product.imageUrl.startsWith("http")) {
            imageUrl = product.imageUrl;
        } else {
            const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:8080";
            imageUrl = `${backendUrl}${product.imageUrl}`;
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all group flex flex-col h-full relative">

            <div className="absolute top-6 left-6 z-10">
                {product.totalStock > 0 ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                        Stock: {product.totalStock}
                    </span>
                ) : (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                        Preorder
                    </span>
                )}
            </div>

            {/* 🌟 Admin မဟုတ်မှသာ အသည်းပုံ (Wishlist) ကို ပြမည် */}
            {!isAdmin && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                    }}
                    className="absolute top-5 right-5 z-20 flex items-center justify-center w-9 h-9 bg-white/90 rounded-full shadow-md hover:scale-110 transition-transform"
                >
                    {isInWishlist(product.id) ? "❤️" : "🤍"}
                </button>
            )}

            <Link href={`/products/${product.id}`} className="flex-1 mt-2">
                <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden relative">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300?text=No+Image" }}
                    />
                </div>
                <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2">{product.name}</h3>
                    <p className="text-xs font-medium mt-1.5 text-gray-500">
                        {product.totalStock > 0 ? (
                            <span className="text-green-600">လက်ကျန်: {product.totalStock} ခု ရနိုင်ပါသည်</span>
                        ) : (
                            <span className="text-orange-500">ကြိုတင်မှာယူမှသာ ရနိုင်ပါမည်</span>
                        )}
                    </p>
                </div>
            </Link>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-blue-600 font-black text-lg">
                    {Number(product.currentPriceVND || 0).toLocaleString()} VND
                </span>

                {/* 🌟 Admin ဆိုလျှင် 'Preview Only' ဟုသာ ပြမည် */}
                {!isAdmin ? (
                    <button
                        onClick={handleAddToCart}
                        className={`font-bold text-sm px-4 py-2 rounded-xl transition-colors ${
                            product.totalStock > 0
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                                : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-600 hover:text-white'
                        }`}
                    >
                        {product.totalStock > 0 ? "ဝယ်မည်" : "Preorder"}
                    </button>
                ) : (
                    <div className="text-xs font-bold text-gray-400 py-2 border border-dashed border-gray-300 px-3 rounded-lg bg-gray-50">Preview Only</div>
                )}
            </div>
        </div>
    );
}