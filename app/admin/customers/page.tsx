"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // 🌟 Password reset modal state
    const [resetTarget, setResetTarget] = useState<any>(null);
    const [newPw, setNewPw] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const handleReset = async () => {
        if (newPw.length < 6) return toast.error("Password အနည်းဆုံး ၆ လုံး ဖြစ်ရပါမည်။");
        setResetLoading(true);
        try {
            const res = await api.put(`/admin/orders/customers/${resetTarget.id}/reset-password`, { newPassword: newPw });
            if (res.data.success) {
                toast.success(`${resetTarget.fullName || "ဖောက်သည်"} ၏ password ကို ပြောင်းပြီးပါပြီ။`);
                setResetTarget(null);
                setNewPw("");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Reset လုပ်၍ မရပါ။");
        } finally {
            setResetLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/admin/orders/customers");
                if (res.data.success) setCustomers(res.data.data);
            } catch {
                toast.error("Customer စာရင်း ရယူ၍ မရပါ");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const fmt = (n: any) => Number(n || 0).toLocaleString();

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return customers;
        return customers.filter(
            (c) => (c.fullName || "").toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q)
        );
    }, [customers, search]);

    const totalRevenue = customers.reduce((s, c) => s + Number(c.totalSpentVND || 0), 0);

    if (loading) return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-black mb-2 border-l-4 border-blue-600 pl-4 text-gray-800">ဖောက်သည်များ</h1>
            <p className="text-sm text-gray-500 mb-6 pl-5">ဝယ်ယူသူ {customers.length} ဦး · စုစုပေါင်း ဝင်ငွေ {fmt(totalRevenue)} ₫</p>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 အမည် / ဖုန်း နဲ့ ရှာရန်..."
                className="w-full max-w-md mb-6 px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-gray-100">
                    <tr>
                        <th className="p-4 pl-6">#</th>
                        <th className="p-4">ဖောက်သည်</th>
                        <th className="p-4 text-center">Order</th>
                        <th className="p-4 text-right">သုံးစွဲငွေ</th>
                        <th className="p-4 text-right">နောက်ဆုံး Order</th>
                        <th className="p-4 pr-6 text-center">Password</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-bold">ဖောက်သည် မရှိသေးပါ။</td></tr>
                    ) : (
                        filtered.map((c, i) => (
                            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="p-4 pl-6">
                                    <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full font-black text-xs ${i === 0 ? "bg-yellow-400 text-gray-900" : i === 1 ? "bg-gray-300 text-gray-800" : i === 2 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-gray-900">{c.fullName || "—"}</p>
                                    <p className="text-sm text-gray-500">{c.phone || c.email || "—"}{c.country ? ` · ${c.country}` : ""}</p>
                                </td>
                                <td className="p-4 text-center font-bold text-blue-600">{c.orderCount}</td>
                                <td className="p-4 text-right font-black text-gray-900">{fmt(c.totalSpentVND)} ₫</td>
                                <td className="p-4 text-right text-sm text-gray-500">{c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "—"}</td>
                                <td className="p-4 pr-6 text-center">
                                    <button
                                        onClick={() => { setResetTarget(c); setNewPw(""); }}
                                        className="text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        🔑 Reset
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* 🌟 Password Reset Modal */}
            {resetTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !resetLoading && setResetTarget(null)}>
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 mb-1">🔑 Password Reset</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            <span className="font-bold text-gray-800">{resetTarget.fullName || resetTarget.phone || "ဖောက်သည်"}</span> အတွက် password အသစ် သတ်မှတ်ပါ။
                        </p>
                        <input
                            type="text"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            placeholder="Password အသစ် (အနည်းဆုံး ၆ လုံး)"
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none font-medium mb-2"
                            autoFocus
                        />
                        <p className="text-[11px] text-gray-400 mb-5">💡 ဖောက်သည်ကို ဖုန်း/မက်ဆေ့ချ်ဖြင့် အတည်ပြုပြီးမှ password အသစ်ကို ပြောပြပါ။</p>
                        <div className="flex gap-3">
                            <button onClick={() => setResetTarget(null)} disabled={resetLoading} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                                မလုပ်တော့ပါ
                            </button>
                            <button onClick={handleReset} disabled={resetLoading} className="flex-1 py-3 rounded-2xl bg-orange-600 text-white font-black hover:bg-orange-700 transition-colors disabled:opacity-50">
                                {resetLoading ? "..." : "အတည်ပြုမည်"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
