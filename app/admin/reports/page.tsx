"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminReportsPage() {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split("T")[0];
    const monthAgo = new Date(Date.now() - 29 * 864e5).toISOString().split("T")[0];
    const [from, setFrom] = useState(monthAgo);
    const [to, setTo] = useState(today);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/orders/reports/sales", {
                params: { startDate: `${from}T00:00:00`, endDate: `${to}T23:59:59` },
            });
            if (res.data.success) setRows(res.data.data);
        } catch {
            toast.error("Report ရယူ၍ မရပါ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); /* eslint-disable-next-line */ }, []);

    const fmt = (n: any) => Number(n || 0).toLocaleString();

    // ပစ္စည်းအလိုက် စုစည်း (qty, sale, profit)
    const byProduct = useMemo(() => {
        const map: Record<string, { name: string; qty: number; sale: number; profit: number }> = {};
        for (const r of rows) {
            const k = r.productName || "—";
            if (!map[k]) map[k] = { name: k, qty: 0, sale: 0, profit: 0 };
            map[k].qty += Number(r.quantity || 0);
            map[k].sale += Number(r.totalSaleVND || 0);
            map[k].profit += Number(r.totalProfitVND || 0);
        }
        return Object.values(map).sort((a, b) => b.profit - a.profit);
    }, [rows]);

    const totalSale = byProduct.reduce((s, p) => s + p.sale, 0);
    const totalProfit = byProduct.reduce((s, p) => s + p.profit, 0);
    const totalQty = byProduct.reduce((s, p) => s + p.qty, 0);
    const chartData = byProduct.slice(0, 8).map((p) => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name, profit: p.profit }));

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-black mb-6 border-l-4 border-blue-600 pl-4 text-gray-800">အရောင်း Report</h1>

            <div className="flex flex-wrap items-end gap-3 mb-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">မှ</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">အထိ</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 outline-none" />
                </div>
                <button onClick={fetchReport} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">ကြည့်မည်</button>
            </div>

            {loading ? (
                <div className="py-20 text-center font-bold text-blue-600 animate-pulse">Loading...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">💰 ဝင်ငွေ</p>
                            <h3 className="text-2xl font-black text-gray-900">{fmt(totalSale)} ₫</h3>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl shadow-md text-white">
                            <p className="text-xs font-bold text-green-100 uppercase mb-1">📈 အမြတ်</p>
                            <h3 className="text-2xl font-black">{fmt(totalProfit)} ₫</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">📦 ရောင်းရ</p>
                            <h3 className="text-2xl font-black text-gray-900">{fmt(totalQty)} ခု</h3>
                        </div>
                    </div>

                    {chartData.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8">
                            <h2 className="text-lg font-black text-gray-900 mb-4">အမြတ်အများဆုံး ပစ္စည်းများ</h2>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => v >= 1000000 ? `${(v/1e6).toFixed(1)}M` : v >= 1000 ? `${(v/1e3).toFixed(0)}K` : v} />
                                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} ₫`} />
                                    <Bar dataKey="profit" name="အမြတ်" fill="#16a34a" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[560px]">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6">ပစ္စည်း</th>
                                <th className="p-4 text-center">ရောင်းရ</th>
                                <th className="p-4 text-right">ဝင်ငွေ</th>
                                <th className="p-4 pr-6 text-right">အမြတ်</th>
                            </tr>
                            </thead>
                            <tbody>
                            {byProduct.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-bold">ဤကာလအတွင်း အရောင်း မရှိပါ။</td></tr>
                            ) : (
                                byProduct.map((p, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="p-4 pl-6 font-bold text-gray-900">{p.name}</td>
                                        <td className="p-4 text-center font-bold text-blue-600">{p.qty}</td>
                                        <td className="p-4 text-right text-gray-700">{fmt(p.sale)} ₫</td>
                                        <td className={`p-4 pr-6 text-right font-black ${p.profit >= 0 ? "text-green-600" : "text-red-500"}`}>{fmt(p.profit)} ₫</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
