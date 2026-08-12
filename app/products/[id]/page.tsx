"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // 🌟 ဤနေရာတွင် အမှားပြင်ဆင်ထားပါသည် (Backticks သုံးရပါမည်)
                const response = await api.get(`/products/${id}`);
                if (response.data.success) {
                    setProduct(response.data.data);
                }
            } catch (error) {
                console.error("Product fetching error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center font-bold text-blue-600 animate-pulse">
            ပစ္စည်းအချက်အလက်များကို ရယူနေပါသည်...
        </div>
    );

    if (!product) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-red-500">ပစ္စည်းရှာမတွေ့ပါ။</h2>
            <Link href="/" className="mt-4 inline-block text-blue-600 underline">ပင်မစာမျက်နှာသို့ ပြန်သွားမည်</Link>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-16">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">

                    <div className="aspect-square w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-50 border border-gray-100 shadow-inner">
                        <img
                            src={product.imageUrl || "https://via.placeholder.com/600"}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>

                    <div className="mt-6 sm:mt-16 lg:mt-0">
                        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-snug">{product.name}</h1>

                        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">
                {Number(product.currentPriceVND || 0).toLocaleString()} VND
              </span>
                            {product.totalStock > 0 ? (
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600 uppercase">In Stock ({product.totalStock})</span>
                            ) : (
                                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 uppercase">Preorder</span>
                            )}
                        </div>

                        <div className="mt-6 sm:mt-8 border-t border-gray-100 pt-6 sm:pt-8">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">ပစ္စည်းအကြောင်းအသေးစိတ်</h3>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                {product.description || "ဤပစ္စည်းအတွက် အသေးစိတ်ဖော်ပြချက် မရှိသေးပါ။"}
                            </p>
                        </div>

                        <div className="mt-8 sm:mt-10 flex space-x-3 sm:space-x-4">
                            <button
                                onClick={() => addToCart(product)}
                                className={`flex-1 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 text-sm sm:text-base font-black text-white shadow-xl active:scale-95 transition-all ${product.totalStock > 0 ? "bg-blue-600 shadow-blue-100 hover:bg-blue-700" : "bg-orange-500 shadow-orange-100 hover:bg-orange-600"}`}
                            >
                                {product.totalStock > 0 ? "ခြင်းတောင်းထဲထည့်မည်" : "ကြိုတင်မှာယူမည် (Preorder)"}
                            </button>
                            <Link href="/cart" className="flex items-center justify-center rounded-xl sm:rounded-2xl bg-gray-100 px-5 sm:px-6 py-3.5 sm:py-4 text-lg sm:text-xl">🛒</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}