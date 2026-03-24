"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
    const [summary, setSummary] = useState<any>(null);
    const [expiringBatches, setExpiringBatches] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("TODAY");

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 🌟 Filter ကို Backend သို့ ပို့၍ Data လှမ်းယူခြင်း
                const [summaryRes, alertsRes, topRes] = await Promise.all([
                    api.get(`/admin/dashboard/summary?filter=${dateFilter}`),
                    api.get("/admin/dashboard/alerts/expiring"),
                    api.get("/admin/dashboard/top-products")
                ]);

                if (summaryRes.data.success) setSummary(summaryRes.data.data);
                if (alertsRes.data.success) setExpiringBatches(alertsRes.data.data);
                if (topRes.data.success) setTopProducts(topRes.data.data);
            } catch (error) {
                toast.error("Dashboard အချက်အလက်များ ယူရာတွင် အမှားရှိပါသည်။");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [dateFilter]); // 🌟 Date ပြောင်းတိုင်း Data အသစ်ပြန်ဆွဲမည်

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
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform text-6xl">💰</div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">ရောင်းရငွေ ({dateFilter})</p>
                    <h3 className="text-2xl font-black text-gray-900">{Number(summary?.todayRevenue || 0).toLocaleString()} ₫</h3>
                </div>

                <div className="bg-linear-to-br from-green-500 to-green-600 p-6 rounded-3xl border border-green-400 shadow-md shadow-green-200 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform text-6xl">📈</div>
                    <p className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2">အမြတ်ငွေ ({dateFilter})</p>
                    <h3 className="text-2xl font-black">{Number(summary?.todayProfit || 0).toLocaleString()} ₫</h3>
                </div>

                <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group ${summary?.pendingPreordersCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform text-6xl">⏳</div>
                    <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${summary?.pendingPreordersCount > 0 ? 'text-orange-500' : 'text-gray-400'}`}>ဖြည့်တင်းရန် Preorder</p>
                    <h3 className={`text-2xl font-black ${summary?.pendingPreordersCount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {summary?.pendingPreordersCount || 0} ခု
                    </h3>
                </div>

                <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group ${summary?.lowStockProductsCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform text-6xl">📉</div>
                    <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${summary?.lowStockProductsCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>Stock ပြတ်လုနီးပါး</p>
                    <h3 className={`text-2xl font-black ${summary?.lowStockProductsCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {summary?.lowStockProductsCount || 0} မျိုး
                    </h3>
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
        </div>
    );
}