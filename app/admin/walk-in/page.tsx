"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Product {
    id: number;
    name: string;
    currentPriceVND: number;
    totalStock: number;
    imageUrl?: string;
}

interface CartLine {
    productId: number;
    name: string;
    quantity: number;
    priceVND: number;
    stock: number;
}

export default function WalkInSalePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartLine[]>([]);
    const [customerName, setCustomerName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            if (res.data.success) setProducts(res.data.data);
        } catch (e) {
            toast.error("ပစ္စည်းစာရင်း ရယူ၍ မရပါ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) => p.name?.toLowerCase().includes(q));
    }, [products, search]);

    const addToCart = (p: Product) => {
        if (p.totalStock <= 0) {
            toast.error(`${p.name} — Stock ကုန်နေပါသည်`);
            return;
        }
        setCart((prev) => {
            const existing = prev.find((l) => l.productId === p.id);
            if (existing) {
                if (existing.quantity >= p.totalStock) {
                    toast.error(`${p.name} — လက်ကျန် (${p.totalStock}) ထက် ပိုမရပါ`);
                    return prev;
                }
                return prev.map((l) =>
                    l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l
                );
            }
            return [
                ...prev,
                {
                    productId: p.id,
                    name: p.name,
                    quantity: 1,
                    priceVND: p.currentPriceVND ?? 0,
                    stock: p.totalStock,
                },
            ];
        });
    };

    const updateLine = (productId: number, field: "quantity" | "priceVND", value: number) => {
        setCart((prev) =>
            prev.map((l) => {
                if (l.productId !== productId) return l;
                if (field === "quantity") {
                    const q = Math.max(1, Math.min(value || 1, l.stock));
                    if (value > l.stock) toast.error(`လက်ကျန် ${l.stock} ခုသာ ရှိပါသည်`);
                    return { ...l, quantity: q };
                }
                return { ...l, priceVND: Math.max(0, value || 0) };
            })
        );
    };

    const removeLine = (productId: number) =>
        setCart((prev) => prev.filter((l) => l.productId !== productId));

    const total = useMemo(
        () => cart.reduce((sum, l) => sum + l.priceVND * l.quantity, 0),
        [cart]
    );

    const fmt = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

    const submitSale = async () => {
        if (cart.length === 0) {
            toast.error("ပစ္စည်း အနည်းဆုံး တစ်ခု ထည့်ပါ");
            return;
        }
        setSubmitting(true);
        const toastId = toast.loading("ရောင်းအား မှတ်တမ်းတင်နေသည်...");
        try {
            const res = await api.post("/admin/orders/walk-in", {
                customerName: customerName.trim() || null,
                items: cart.map((l) => ({
                    productId: l.productId,
                    quantity: l.quantity,
                    priceVND: l.priceVND,
                })),
            });
            if (res.data.success) {
                toast.success(
                    `ရောင်းအား မှတ်တမ်းတင်ပြီး Stock နုတ်ပြီးပါပြီ (${res.data.data?.orderNumber || ""})`,
                    { id: toastId }
                );
                setCart([]);
                setCustomerName("");
                fetchProducts(); // stock ပြန် refresh
            } else {
                toast.error(res.data.message || "မအောင်မြင်ပါ", { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "ရောင်းအား မှတ်တမ်းတင်၍ မရပါ", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">🛍️ ဆိုင်ရှေ့ ရောင်းအား (Walk-in)</h1>
            <p className="text-sm text-gray-500 mb-6">
                ဆိုင်တွင် လာရောက်ဝယ်ယူသူများအတွက် — ရွေး၍ ရောင်းလိုက်ပါ၊ Stock အလိုအလျောက် နုတ်ပြီး ရောင်းအား report ထဲ ဝင်ပါမည်။
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ဘယ်ဘက် — ပစ္စည်းစာရင်း */}
                <div className="lg:col-span-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="🔍 ပစ္စည်း ရှာရန်..."
                        className="w-full mb-4 px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />

                    {loading ? (
                        <div className="py-20 text-center font-bold text-blue-600 animate-pulse">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {filtered.map((p) => {
                                const out = p.totalStock <= 0;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => addToCart(p)}
                                        disabled={out}
                                        className={`text-left p-3 rounded-2xl border transition-all ${
                                            out
                                                ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                                : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
                                        }`}
                                    >
                                        <div className="aspect-square w-full rounded-xl bg-gray-50 overflow-hidden mb-2 flex items-center justify-center">
                                            {p.imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl">📦</span>
                                            )}
                                        </div>
                                        <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">{p.name}</p>
                                        <p className="text-blue-600 font-black text-sm mt-1">{fmt(p.currentPriceVND ?? 0)} đ</p>
                                        <p className={`text-xs mt-0.5 font-medium ${out ? "text-red-500" : "text-gray-500"}`}>
                                            {out ? "Stock ကုန်" : `လက်ကျန် ${p.totalStock}`}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ညာဘက် — ရောင်းမည့် စာရင်း (cart) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sticky top-24">
                        <h2 className="font-black text-gray-900 mb-4">ရောင်းမည့် စာရင်း</h2>

                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="ဖောက်သည်အမည် (optional)"
                            className="w-full mb-4 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
                        />

                        {cart.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-8">
                                ပစ္စည်း ရွေးပါ — ဘယ်ဘက်က ပစ္စည်းကို နှိပ်ပါ
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto mb-4">
                                {cart.map((l) => (
                                    <div key={l.productId} className="border border-gray-100 rounded-2xl p-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-bold text-sm text-gray-900 flex-1">{l.name}</p>
                                            <button
                                                onClick={() => removeLine(l.productId)}
                                                className="text-red-400 hover:text-red-600 text-lg leading-none"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => updateLine(l.productId, "quantity", l.quantity - 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    value={l.quantity}
                                                    onChange={(e) => updateLine(l.productId, "quantity", parseInt(e.target.value))}
                                                    className="w-12 text-center text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button
                                                    onClick={() => updateLine(l.productId, "quantity", l.quantity + 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-xs text-gray-400">×</span>
                                            <input
                                                type="number"
                                                value={l.priceVND}
                                                onChange={(e) => updateLine(l.productId, "priceVND", parseFloat(e.target.value))}
                                                className="w-24 px-2 py-1 text-sm text-right border border-gray-200 rounded-lg outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-xs text-gray-500">đ</span>
                                        </div>
                                        <p className="text-right text-xs text-gray-500 mt-1">
                                            = <span className="font-bold text-gray-700">{fmt(l.priceVND * l.quantity)} đ</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-4">
                            <span className="font-bold text-gray-700">စုစုပေါင်း</span>
                            <span className="font-black text-xl text-blue-600">{fmt(total)} đ</span>
                        </div>

                        <button
                            onClick={submitSale}
                            disabled={submitting || cart.length === 0}
                            className="w-full py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "မှတ်တမ်းတင်နေသည်..." : "ရောင်းပြီး Stock နုတ်မည်"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
