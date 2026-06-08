"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminOrderListPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [filter, setFilter] = useState<"online" | "walkin" | "all">("online");

    const isWalkIn = (o: any) => typeof o.orderNumber === "string" && o.orderNumber.startsWith("POS-");
    const onlineCount = orders.filter((o) => !isWalkIn(o)).length;
    const walkinCount = orders.filter((o) => isWalkIn(o)).length;
    const filteredOrders = orders.filter((o) =>
        filter === "all" ? true : filter === "walkin" ? isWalkIn(o) : !isWalkIn(o)
    );

    const fetchOrders = async () => {
        try {
            const res = await api.get("/admin/orders");
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (error) {
            toast.error("အော်ဒါများ ယူရာတွင် အမှားရှိပါသည်။");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "PENDING": return { text: "အသစ်ဝင်ထားသည်", style: "bg-yellow-100 text-yellow-700" };
            case "PREORDER_PENDING": return { text: "Preorder (Stock မရှိသေးပါ)", style: "bg-orange-100 text-orange-700 border border-orange-200" };
            case "APPROVED": return { text: "အတည်ပြုပြီး", style: "bg-blue-100 text-blue-700" };
            case "SHIPPING": return { text: "ပို့ဆောင်နေဆဲ", style: "bg-purple-100 text-purple-700" };
            case "DELIVERED": return { text: "ပို့ဆောင်ပြီး", style: "bg-green-100 text-green-700" };
            case "CANCELLED": return { text: "ပယ်ဖျက်ထားသည်", style: "bg-red-100 text-red-700" };
            default: return { text: status, style: "bg-gray-100 text-gray-700" };
        }
    };

    const openOrderDetails = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            const res = await api.put(`/admin/orders/${selectedOrder.id}/status?status=${newStatus}`);
            if (res.data.success) {
                toast.success("အော်ဒါ အခြေအနေကို ပြောင်းလဲလိုက်ပါပြီ။");
                fetchOrders();
                setIsModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Status ပြောင်းရာတွင် အမှားရှိပါသည်။");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFulfillPreorder = async () => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            const res = await api.post(`/admin/orders/${selectedOrder.id}/fulfill`);
            if (res.data.success) {
                toast.success("Preorder အတွက် Stock နှုတ်ယူပြီး အတည်ပြုလိုက်ပါပြီ။");
                fetchOrders();
                setIsModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Stock မလုံလောက်သေးပါ (သို့) အမှားရှိပါသည်။");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">Loading Orders...</div>;

    const subtotal = selectedOrder?.items?.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0) || 0;
    const deliveryFee = Number(selectedOrder?.totalAmountVND || 0) - subtotal;
    const isPickup = selectedOrder?.shippingAddress?.includes("ဆိုင်တွင်လာယူ");

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-black mb-6 border-l-4 border-blue-600 pl-4 text-gray-800">
                အော်ဒါ စီမံခန့်ခွဲမှု
            </h1>

            {/* 🌟 Filter Tabs — Online / Walk-in / All */}
            <div className="flex gap-2 mb-6">
                {[
                    { key: "online", label: "🛒 Online", count: onlineCount },
                    { key: "walkin", label: "🛍️ Walk-in", count: walkinCount },
                    { key: "all", label: "အားလုံး", count: orders.length },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setFilter(t.key as any)}
                        className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                            filter === t.key
                                ? "bg-gray-900 text-white shadow-md"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {t.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === t.key ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                            {t.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-sm">
                        <th className="p-4 pl-6">အော်ဒါ နံပါတ် / နေ့စွဲ</th>
                        <th className="p-4">ဝယ်ယူသူ</th>
                        <th className="p-4">ကျသင့်ငွေ (VND)</th>
                        <th className="p-4 text-center">အခြေအနေ</th>
                        <th className="p-4 pr-6 text-right">လုပ်ဆောင်ချက်</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrders.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">
                                {filter === "walkin" ? "ဆိုင်ရှေ့ ရောင်းအား မရှိသေးပါ။" : "ဝင်ထားသော အော်ဒါ မရှိသေးပါ။"}
                            </td>
                        </tr>
                    ) : (
                        filteredOrders.map((o) => {
                            const statusInfo = getStatusStyle(o.status);
                            const orderDate = new Date(o.orderDate).toLocaleString();

                            return (
                                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 pl-6">
                                        <p className="font-black text-blue-600 text-lg">{o.orderNumber}</p>
                                        <p className="text-xs text-gray-400 font-medium">{orderDate}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-gray-800">{o.customerName}</p>
                                        <p className="text-sm text-gray-500">{o.customerPhone}</p>
                                    </td>
                                    <td className="p-4">
                                            <span className="font-bold text-gray-900">
                                                {Number(o.totalAmountVND).toLocaleString()} ₫
                                            </span>
                                    </td>
                                    <td className="p-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${statusInfo.style}`}>
                                                {statusInfo.text}
                                            </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <button
                                            onClick={() => openOrderDetails(o)}
                                            className="p-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl transition-colors shadow-sm inline-flex items-center justify-center"
                                            title="အသေးစိတ် / ပြင်မည်"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-4xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 text-2xl font-bold transition-colors"
                        >
                            ✕
                        </button>

                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-black text-gray-900">အော်ဒါ: <span className="text-blue-600">{selectedOrder.orderNumber}</span></h2>
                            <p className="text-gray-500 font-medium mt-1">ဝယ်ယူသူ: {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-gray-800 mb-4 text-lg border-l-4 border-green-500 pl-3">ဝယ်ယူထားသော ပစ္စည်းများ</h3>
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                {selectedOrder.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.productName}</p>
                                            <p className="text-xs font-medium text-gray-500 mt-1">
                                                Qty: <span className="text-blue-600 font-bold">{item.quantity}</span> |
                                                Batch ID: {item.batchId || "N/A"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900">{(item.price * item.quantity).toLocaleString()} ₫</p>

                                            {/* 🌟 ပြင်ဆင်ချက်: "အရင်း" အစား "Net အရင်း" ဟု ပြောင်းလဲထားပြီး netOriginalCost ကို အသုံးပြုရန် ပြင်ဆင်ထားသည် */}
                                            <p className="text-xs text-gray-400">Net အရင်း: {Number(item.netOriginalCost || item.originalCost).toLocaleString()} Ks</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4 mt-4 border-t border-gray-200 px-2 space-y-3">
                                    <div className="flex justify-between items-center font-bold text-gray-500 text-sm">
                                        <span>ဝယ်ယူမှု တန်ဖိုး (Subtotal)</span>
                                        <span>{subtotal.toLocaleString()} ₫</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-gray-500 text-sm">
                                        <span>
                                            ပို့ဆောင်ခ ({isPickup ? 'ဆိုင်လာယူမည်' : 'အိမ်အရောက်ပို့'})
                                        </span>
                                        <span>{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} ₫` : '0 ₫'}</span>
                                    </div>

                                    {!isPickup && selectedOrder.shippingAddress && (
                                        <div className="bg-blue-50/50 p-3 rounded-xl mt-2 text-sm border border-blue-100">
                                            <span className="font-bold text-blue-800">ပို့ဆောင်ရမည့်လိပ်စာ: </span>
                                            <span className="text-blue-600">{selectedOrder.shippingAddress}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                        <span className="font-bold text-gray-800">စုစုပေါင်း ကျသင့်ငွေ</span>
                                        <span className="text-xl font-black text-green-600">{Number(selectedOrder.totalAmountVND).toLocaleString()} ₫</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-4 text-lg border-l-4 border-purple-500 pl-3">အခြေအနေ (Status) ပြောင်းလဲရန်</h3>

                            {selectedOrder.status === "PREORDER_PENDING" ? (
                                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 text-center">
                                    <p className="text-orange-800 font-medium mb-4">ဤအော်ဒါသည် ပစ္စည်းပြတ်နေသဖြင့် ကြိုတင်မှာယူထားခြင်း ဖြစ်ပါသည်။ Stock အသစ်ရောက်ပါက အောက်ပါခလုတ်ကို နှိပ်၍ အတည်ပြုပါ။</p>
                                    <button
                                        onClick={handleFulfillPreorder}
                                        disabled={isUpdating}
                                        className="px-6 py-3 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-colors w-full md:w-auto shadow-md"
                                    >
                                        {isUpdating ? "လုပ်ဆောင်နေပါသည်..." : "✅ Stock နှုတ်ယူပြီး အတည်ပြုမည် (Fulfill)"}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate("APPROVED")}
                                        disabled={isUpdating || selectedOrder.status === "APPROVED"}
                                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === "APPROVED" ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'}`}
                                    >
                                        အတည်ပြုမည်
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate("SHIPPING")}
                                        disabled={isUpdating || selectedOrder.status === "SHIPPING"}
                                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === "SHIPPING" ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-2' : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'}`}
                                    >
                                        ပို့ဆောင်နေသည်
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate("DELIVERED")}
                                        disabled={isUpdating || selectedOrder.status === "DELIVERED"}
                                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === "DELIVERED" ? 'bg-green-600 text-white ring-2 ring-green-300 ring-offset-2' : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'}`}
                                    >
                                        ရောက်ရှိပြီး
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate("CANCELLED")}
                                        disabled={isUpdating || selectedOrder.status === "CANCELLED"}
                                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === "CANCELLED" ? 'bg-red-600 text-white ring-2 ring-red-300 ring-offset-2' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100'}`}
                                    >
                                        ပယ်ဖျက်မည်
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}