"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState<any>(null);
    const [expiringBatches, setExpiringBatches] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [salesTrend, setSalesTrend] = useState<any[]>([]);
    const [salesRows, setSalesRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("TODAY");

    // dateFilter (TODAY/WEEK/MONTH) → sales report date range
    const dateRange = () => {
        const now = new Date();
        const end = new Date(now); end.setHours(23, 59, 59);
        const start = new Date(now); start.setHours(0, 0, 0, 0);
        if (dateFilter === "WEEK") start.setDate(start.getDate() - 6);
        else if (dateFilter === "MONTH") start.setDate(1);
        const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return { startDate: `${iso(start)}T00:00:00`, endDate: `${iso(end)}T23:59:59` };
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 🌟 Filter ကို Backend သို့ ပို့၍ Data လှမ်းယူခြင်း
                const trendFilter = dateFilter === "MONTH" ? "MONTH" : "WEEK";
                const [summaryRes, alertsRes, topRes, trendRes, salesRes] = await Promise.all([
                    api.get(`/admin/dashboard/summary?filter=${dateFilter}`),
                    api.get("/admin/dashboard/alerts/expiring"),
                    api.get("/admin/dashboard/top-products"),
                    api.get(`/admin/dashboard/sales-trend?filter=${trendFilter}`),
                    api.get("/admin/orders/reports/sales", { params: dateRange() }),
                ]);

                if (summaryRes.data.success) setSummary(summaryRes.data.data);
                if (alertsRes.data.success) setExpiringBatches(alertsRes.data.data);
                if (topRes.data.success) setTopProducts(topRes.data.data);
                if (salesRes.data.success) setSalesRows(salesRes.data.data);
                if (trendRes.data.success) {
                    setSalesTrend(
                        trendRes.data.data.map((p: any) => ({
                            date: new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
                            revenue: Number(p.revenue || 0),
                            profit: Number(p.profit || 0),
                            orders: p.orders,
                        }))
                    );
                }
            } catch (error) {
                toast.error("Dashboard အချက်အလက်များ ယူရာတွင် အမှားရှိပါသည်။");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [dateFilter]); // 🌟 Date ပြောင်းတိုင်း Data အသစ်ပြန်ဆွဲမည်

    const fmtVND = (n: any) => Number(n || 0).toLocaleString();

    // 🌟 Sales report — ပစ္စည်းအလိုက် စုစည်း (qty, ဝင်ငွေ, အမြတ်)
    const salesByProduct = (() => {
        const map: Record<string, { name: string; qty: number; sale: number; profit: number }> = {};
        for (const r of salesRows) {
            const k = r.productName || "—";
            if (!map[k]) map[k] = { name: k, qty: 0, sale: 0, profit: 0 };
            map[k].qty += Number(r.quantity || 0);
            map[k].sale += Number(r.totalSaleVND || 0);
            map[k].profit += Number(r.totalProfitVND || 0);
        }
        return Object.values(map).sort((a, b) => b.profit - a.profit);
    })();

    // 🌟 Excel File အစစ်ကို Backend မှ Download ဆွဲမည့် Function
    const handleDownloadExcel = async () => {
        const toastId = toast.loading("Excel ဖိုင် ဖန်တီးနေပါသည်...");
        try {
            const response = await api.get(`/admin/dashboard/export/excel?filter=${dateFilter}`, {
                responseType: 'blob', // 🌟 ဖိုင် (Binary) အနေဖြင့် လက်ခံရန် အရေးကြီးသည်
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Sales_Report_${dateFilter}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success("Download အောင်မြင်ပါသည်။", { id: toastId });
        } catch (error) {
            toast.error("Download ဆွဲရာတွင် အမှားရှိပါသည်။", { id: toastId });
        }
    };

    if (loading && !summary) return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">Dashboard အချက်အလက်များ တွက်ချက်နေပါသည်...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 font-myanmar">

            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 border-b border-gray-200 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black border-l-4 border-blue-600 pl-4 text-gray-900">လုပ်ငန်း အကျဉ်းချုပ်</h1>
                    <p className="text-sm text-gray-500 mt-2 pl-5">အရောင်းအဝယ်၊ အမြတ်အစွန်းနှင့် သတိပေးချက်များ</p>
                </div>
                <div className="flex items-center space-x-3">
                    {/* 🌟 ဤ Dropdown ပြောင်းတိုင်း Backend မှ Data အလိုအလျောက် ပြောင်းမည် */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="TODAY">ယနေ့ (Today)</option>
                        <option value="WEEK">ဒီတစ်ပတ် (This Week)</option>
                        <option value="MONTH">ဒီလ (This Month)</option>
                    </select>

                    {/* 🌟 Excel Download အစစ် */}
                    <button onClick={handleDownloadExcel} className="px-4 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-600 hover:text-white transition-all border border-green-200 flex items-center">
                        <span className="mr-2">📊</span> Download Excel
                    </button>
                </div>
            </div>

            {/* Top Summary Cards (Loading ပြနေချိန် ဝါးသွားအောင် opacity လျှော့ထားသည်) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <Link href="/admin/orders" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform text-6xl">💰</div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">ရောင်းရငွေ ({dateFilter})</p>
                    <h3 className="text-2xl font-black text-gray-900">{Number(summary?.todayRevenue || 0).toLocaleString()} ₫</h3>
                    <p className="text-[11px] text-blue-500 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Orders ကြည့်ရန် →</p>
                </Link>

                <Link href="/admin/orders" className="bg-linear-to-br from-green-500 to-green-600 p-6 rounded-3xl border border-green-400 shadow-md shadow-green-200 text-white relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform text-6xl">📈</div>
                    <p className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2">အမြတ်ငွေ ({dateFilter})</p>
                    <h3 className="text-2xl font-black">{Number(summary?.todayProfit || 0).toLocaleString()} ₫</h3>
                    <p className="text-[11px] text-green-50 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Orders ကြည့်ရန် →</p>
                </Link>

                <Link href="/admin/orders?tab=preorder" className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${summary?.pendingPreordersCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform text-6xl">⏳</div>
                    <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${summary?.pendingPreordersCount > 0 ? 'text-orange-500' : 'text-gray-400'}`}>ဖြည့်တင်းရန် Preorder</p>
                    <h3 className={`text-2xl font-black ${summary?.pendingPreordersCount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {summary?.pendingPreordersCount || 0} ခု
                    </h3>
                    <p className="text-[11px] text-orange-500 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Preorder ဖြည့်ရန် →</p>
                </Link>

                <Link href="/admin/products?lowstock=1" className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${summary?.lowStockProductsCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform text-6xl">📉</div>
                    <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${summary?.lowStockProductsCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>Stock ပြတ်လုနီးပါး</p>
                    <h3 className={`text-2xl font-black ${summary?.lowStockProductsCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {summary?.lowStockProductsCount || 0} မျိုး
                    </h3>
                    <p className="text-[11px] text-red-500 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Stock ဖြည့်ရန် →</p>
                </Link>
            </div>

            {/* 🌟 ဒုတိယ Metric Cards Row */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <Link href="/admin/orders" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">🧾 Order အရေအတွက်</p>
                    <h3 className="text-xl font-black text-gray-900">{summary?.totalOrdersCount || 0} ခု</h3>
                </Link>
                <Link href="/admin/orders" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">📦 ရောင်းရ ပစ္စည်း</p>
                    <h3 className="text-xl font-black text-gray-900">{summary?.totalItemsSold || 0} ခု</h3>
                </Link>
                <Link href="/admin/orders" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">📊 ပျမ်းမျှ Order</p>
                    <h3 className="text-xl font-black text-gray-900">{fmtVND(summary?.averageOrderValueVND)} ₫</h3>
                </Link>
                <Link href="/admin/orders" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">💹 အမြတ် Margin</p>
                    <h3 className="text-xl font-black text-gray-900">{Number(summary?.profitMarginPercent || 0)}%</h3>
                </Link>
            </div>

            {/* 🌟 Sales Trend Chart + ဘေး panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                        <span className="text-2xl mr-2">📈</span> ရောင်းအား Trend ({dateFilter === "MONTH" ? "၃၀ ရက်" : "၇ ရက်"})
                    </h2>
                    {salesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={salesTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} ₫`} />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" name="ဝင်ငွေ" stroke="#2563EB" strokeWidth={2} fill="url(#rev)" />
                                <Area type="monotone" dataKey="profit" name="အမြတ်" stroke="#16A34A" strokeWidth={2} fill="url(#prof)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl text-gray-500 font-bold">ရောင်းအား data မရှိသေးပါ။</div>
                    )}
                </div>

                {/* ဝင်ငွေ ခွဲခြမ်း + Inventory */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-3xl shadow-md text-white">
                        <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider mb-3">ဝင်ငွေ ခွဲခြမ်း ({dateFilter})</p>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">🛒 Online</span>
                            <span className="font-black">{fmtVND(summary?.onlineRevenue)} ₫</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">🛍️ Walk-in</span>
                            <span className="font-black">{fmtVND(summary?.walkInRevenue)} ₫</span>
                        </div>
                    </div>
                    <Link href="/admin/products" className="block bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">🏬 လက်ကျန် Stock တန်ဖိုး</p>
                        <h3 className="text-2xl font-black text-gray-900">{fmtVND(summary?.inventoryValueVND)} ₫</h3>
                        <p className="text-xs text-gray-400 mt-2">ရောင်းနေသော ပစ္စည်း {summary?.totalActiveProducts || 0} မျိုး →</p>
                    </Link>
                </div>
            </div>

            {/* Middle Section (Alerts & Top Products) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Expiring Alerts */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900 flex items-center">
                            <span className="text-2xl mr-2">🚨</span> သက်တမ်းကုန်လုနီးပါး အသုတ်များ
                        </h2>
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">{expiringBatches.length} Batches</span>
                    </div>

                    {expiringBatches.length > 0 ? (
                        <div className="overflow-x-auto custom-scrollbar max-h-72">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest sticky top-0">
                                <tr>
                                    <th className="p-3">ပစ္စည်းအမည်</th>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3 text-center">လက်ကျန် (Qty)</th>
                                    <th className="p-3 text-right">ကုန်ဆုံးရက် (EXP)</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {expiringBatches.map((batch: any, index: number) => {
                                    const expDate = new Date(batch.expiryDate);
                                    const today = new Date();
                                    const diffTime = Math.abs(expDate.getTime() - today.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    return (
                                        <tr key={index} className="hover:bg-red-50/30 transition-colors">
                                            <td className="p-3 font-bold text-gray-800 text-sm">{batch.productName}</td>
                                            <td className="p-3 text-xs text-gray-500">{batch.sku}</td>
                                            <td className="p-3 text-center">
                                                <span className="font-bold text-red-500">{batch.remainingQuantity}</span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-gray-800 text-sm">{batch.expiryDate}</span>
                                                    <span className="text-[10px] font-black text-red-500">({diffDays} ရက် အလို)</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 font-bold">သက်တမ်းကုန်မည့် ပစ္စည်း မရှိသေးပါ။ 🎉</p>
                        </div>
                    )}
                </div>

                {/* 🌟 Top Selling Products (အရောင်းရဆုံး ပစ္စည်းများ) */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                        <span className="text-2xl mr-2">🔥</span> အရောင်းရဆုံး ၅ မျိုး
                    </h2>

                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((prod: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-400 text-gray-900' : index === 1 ? 'bg-gray-300 text-gray-800' : index === 2 ? 'bg-amber-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                            #{index + 1}
                                        </div>
                                        <p className="font-bold text-gray-800 text-sm truncate max-w-30">{prod.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase">ရောင်းရ</p>
                                        <p className="text-sm font-black text-blue-600">{prod.totalSold} ခု</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl">
                            <p className="text-gray-500 font-bold">အရောင်းမှတ်တမ်း မရှိသေးပါ။</p>
                        </div>
                    )}
                </div>

            </div>

            {/* 🌟 အရောင်း Report — ပစ္စည်းအလိုက် (Dashboard ထဲ ပေါင်းထားသည်) */}
            <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-black text-gray-900 mb-1 flex items-center">
                    <span className="text-2xl mr-2">📈</span> အရောင်း Report — ပစ္စည်းအလိုက် ({dateFilter})
                </h2>
                <p className="text-sm text-gray-500 mb-5">အထက်က ကာလ (Today/Week/Month) အတိုင်း ပစ္စည်းတစ်ခုချင်း ဝင်ငွေ/အမြတ်</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[520px]">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="p-3 pl-4">ပစ္စည်း</th>
                            <th className="p-3 text-center">ရောင်းရ</th>
                            <th className="p-3 text-right">ဝင်ငွေ</th>
                            <th className="p-3 pr-4 text-right">အမြတ်</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {salesByProduct.length === 0 ? (
                            <tr><td colSpan={4} className="p-6 text-center text-gray-500 font-bold">ဤကာလအတွင်း အရောင်း မရှိသေးပါ။</td></tr>
                        ) : (
                            salesByProduct.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="p-3 pl-4 font-bold text-gray-900">{p.name}</td>
                                    <td className="p-3 text-center font-bold text-blue-600">{p.qty}</td>
                                    <td className="p-3 text-right text-gray-700">{fmtVND(p.sale)} ₫</td>
                                    <td className={`p-3 pr-4 text-right font-black ${p.profit >= 0 ? "text-green-600" : "text-red-500"}`}>{fmtVND(p.profit)} ₫</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}