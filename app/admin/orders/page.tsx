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
    const [filter, setFilter] = useState<"online" | "walkin" | "preorder" | "all">("online");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // 🌟 Dashboard card မှ လာသောအခါ URL (?tab=preorder) အတိုင်း tab ဖွင့်ပေးသည်
    useEffect(() => {
        const tab = new URLSearchParams(window.location.search).get("tab");
        if (tab === "preorder" || tab === "walkin" || tab === "all" || tab === "online") {
            setFilter(tab);
        }
    }, []);

    const isWalkIn = (o: any) => typeof o.orderNumber === "string" && o.orderNumber.startsWith("POS-");
    const isPreorder = (o: any) => o.status === "PREORDER_PENDING";
    const onlineCount = orders.filter((o) => !isWalkIn(o)).length;
    const walkinCount = orders.filter((o) => isWalkIn(o)).length;
    const preorderCount = orders.filter(isPreorder).length;
    const q = search.trim().toLowerCase();
    const filteredOrders = orders.filter((o) => {
        const tabOk = filter === "all" ? true
            : filter === "walkin" ? isWalkIn(o)
                : filter === "preorder" ? isPreorder(o)
                    : !isWalkIn(o);
        const statusOk = statusFilter === "ALL" || o.status === statusFilter;
        const searchOk = !q
            || (o.orderNumber || "").toLowerCase().includes(q)
            || (o.customerName || "").toLowerCase().includes(q)
            || (o.customerPhone || "").toLowerCase().includes(q);
        return tabOk && statusOk && searchOk;
    });

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
        // 🌟 ပယ်ဖျက် (customer မယူတော့/ပြန်အမ်း) — stock ပြန်ထည့်ပြီး အမြတ်ထဲက ဖယ်မည်
        if (newStatus === "CANCELLED" &&
            !confirm("ဤအော်ဒါကို ပယ်ဖျက်မှာ သေချာပါသလား?\n\n• Stock ကို ပြန်ပေါင်းထည့်ပါမည်\n• ဝင်ငွေ/အမြတ်ထဲမှ ဖယ်ရှားပါမည်")) return;
        setIsUpdating(true);
        try {
            const res = await api.put(`/admin/orders/${selectedOrder.id}/status?status=${newStatus}`);
            if (res.data.success) {
                toast.success(newStatus === "CANCELLED" ? "ပယ်ဖျက်ပြီး Stock ပြန်ထည့်ပြီးပါပြီ။" : "အော်ဒါ အခြေအနေကို ပြောင်းလဲလိုက်ပါပြီ။");
                fetchOrders();
                setIsModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Status ပြောင်းရာတွင် အမှားရှိပါသည်။");
        } finally {
            setIsUpdating(false);
        }
    };

    // 🌟 Row-level quick actions (modal မဖွင့်ဘဲ)
    const quickPayment = async (o: any) => {
        setIsUpdating(true);
        try {
            const res = await api.put(`/admin/orders/${o.id}/payment?status=PAID`);
            if (res.data.success) { toast.success("ငွေရရှိပြီး မှတ်လိုက်ပါပြီ။"); fetchOrders(); }
        } catch (e: any) {
            toast.error(e.response?.data?.message || "မအောင်မြင်ပါ");
        } finally { setIsUpdating(false); }
    };

    const quickDeliver = async (o: any) => {
        setIsUpdating(true);
        try {
            const res = await api.put(`/admin/orders/${o.id}/status?status=DELIVERED`);
            if (res.data.success) { toast.success("ပို့ဆောင်ပြီး မှတ်လိုက်ပါပြီ။"); fetchOrders(); }
        } catch (e: any) {
            toast.error(e.response?.data?.message || "မအောင်မြင်ပါ");
        } finally { setIsUpdating(false); }
    };

    const printReceipt = (order: any) => {
        const fmt = (n: any) => Number(n || 0).toLocaleString();
        const subtotal = (order.items || []).reduce((s: number, i: any) => s + Number(i.price) * Number(i.quantity), 0);
        const isPickup = (order.shippingAddress || "").includes("ဆိုင်တွင်လာယူ") || order.orderNumber?.startsWith("POS-");
        const rows = (order.items || []).map((i: any) => `
            <tr>
              <td>${i.productName || ""}</td>
              <td class="c">${i.quantity}</td>
              <td class="r">${fmt(i.price)}</td>
              <td class="r">${fmt(Number(i.price) * Number(i.quantity))}</td>
            </tr>`).join("");
        const paid = order.paymentStatus === "PAID";
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${order.orderNumber}</title>
          <style>
            * { font-family: -apple-system, 'Myanmar Text', sans-serif; }
            body { padding: 24px; color: #111; max-width: 380px; margin: auto; }
            h1 { text-align:center; margin:0; font-size:20px; }
            .sub { text-align:center; color:#666; font-size:12px; margin:4px 0 16px; }
            .meta { font-size:12px; line-height:1.7; border-top:1px dashed #999; border-bottom:1px dashed #999; padding:10px 0; }
            table { width:100%; border-collapse:collapse; margin:12px 0; font-size:12px; }
            th { text-align:left; border-bottom:1px solid #333; padding:6px 2px; }
            td { padding:5px 2px; border-bottom:1px solid #eee; }
            .c { text-align:center; } .r { text-align:right; }
            .tot { display:flex; justify-content:space-between; font-size:13px; padding:3px 0; }
            .grand { font-weight:800; font-size:16px; border-top:2px solid #333; padding-top:8px; margin-top:6px; }
            .badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:800; }
            .note { font-size:11px; color:#666; text-align:center; margin-top:14px; }
          </style></head><body>
            <h1>HAPPY STORE</h1>
            <div class="sub">Burmese Products</div>
            <div class="meta">
              <div><b>Order:</b> ${order.orderNumber || ""}</div>
              <div><b>နေ့စွဲ:</b> ${new Date(order.orderDate).toLocaleString()}</div>
              <div><b>ဝယ်ယူသူ:</b> ${order.customerName || ""} ${order.customerPhone ? "(" + order.customerPhone + ")" : ""}</div>
              <div><b>ငွေပေးချေမှု:</b> <span class="badge" style="background:${paid ? "#dcfce7" : "#fee2e2"};color:${paid ? "#16a34a" : "#dc2626"}">${paid ? "ငွေရရှိပြီး" : "ငွေမရသေး"}</span></div>
            </div>
            <table>
              <thead><tr><th>ပစ္စည်း</th><th class="c">အရေ</th><th class="r">ဈေး</th><th class="r">ပေါင်း</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="tot"><span>ပစ္စည်းဖိုး (Subtotal)</span><span>${fmt(subtotal)} ₫</span></div>
            <div class="tot"><span>ပို့ဆောင်ခ</span><span>${isPickup ? "—" : "သီးသန့် ကောက်ခံမည်"}</span></div>
            <div class="tot grand"><span>စုစုပေါင်း</span><span>${fmt(order.totalAmountVND)} ₫</span></div>
            <div class="note">ကျေးဇူးတင်ပါသည် 🙏<br/>${isPickup ? "" : "ပို့ဆောင်ခကို ပို့ချိန်တွင် သီးသန့် ကောက်ခံပါမည်။"}</div>
          </body></html>`;
        const w = window.open("", "_blank", "width=420,height=640");
        if (!w) { toast.error("Popup ကို ခွင့်ပြုပေးပါ (browser popup blocker)"); return; }
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 300);
    };

    const handlePaymentToggle = async () => {
        if (!selectedOrder) return;
        const newStatus = selectedOrder.paymentStatus === "PAID" ? "UNPAID" : "PAID";
        setIsUpdating(true);
        try {
            const res = await api.put(`/admin/orders/${selectedOrder.id}/payment?status=${newStatus}`);
            if (res.data.success) {
                toast.success(newStatus === "PAID" ? "ငွေရရှိပြီး အဖြစ် မှတ်လိုက်ပါပြီ။" : "ငွေမရသေး အဖြစ် ပြန်ပြောင်းလိုက်ပါပြီ။");
                setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
                fetchOrders();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "ငွေပေးချေမှု ပြောင်းရာတွင် အမှားရှိပါသည်။");
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
                    { key: "preorder", label: "⏳ Preorder", count: preorderCount },
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

            {/* 🌟 Search + Status filter (Admin အလွယ်တကူ ရှာရန်) */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 Order နံပါတ် / ဖောက်သည်အမည် / ဖုန်း နဲ့ ရှာရန်..."
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700 outline-none focus:border-blue-500 bg-white"
                >
                    <option value="ALL">အခြေအနေ — အားလုံး</option>
                    <option value="PENDING">အသစ်ဝင်ထားသည်</option>
                    <option value="APPROVED">အတည်ပြုပြီး</option>
                    <option value="DELIVERED">ပို့ဆောင်ပြီး</option>
                    <option value="PREORDER_PENDING">Preorder</option>
                    <option value="CANCELLED">ပယ်ဖျက်ထားသည်</option>
                </select>
                {(search || statusFilter !== "ALL") && (
                    <button onClick={() => { setSearch(""); setStatusFilter("ALL"); }} className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 whitespace-nowrap">
                        ✕ ရှင်း
                    </button>
                )}
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
                                {filter === "walkin" ? "ဆိုင်ရှေ့ ရောင်းအား မရှိသေးပါ။" : filter === "preorder" ? "ဖြည့်တင်းရန် Preorder မရှိပါ။ 🎉" : "ဝင်ထားသော အော်ဒါ မရှိသေးပါ။"}
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
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${statusInfo.style}`}>
                                                {statusInfo.text}
                                            </span>
                                            {o.status !== "CANCELLED" && (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${o.paymentStatus === "PAID" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                                                    {o.paymentStatus === "PAID" ? "💵 ငွေရပြီး" : "⏳ ငွေမရသေး"}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            {/* 🌟 Quick actions — modal မဖွင့်ဘဲ တိုက်ရိုက် */}
                                            {o.status !== "CANCELLED" && o.paymentStatus !== "PAID" && (
                                                <button onClick={() => quickPayment(o)} disabled={isUpdating}
                                                    className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-colors" title="ငွေရရှိပြီး မှတ်မည်">💵</button>
                                            )}
                                            {["PENDING", "APPROVED"].includes(o.status) && (
                                                <button onClick={() => quickDeliver(o)} disabled={isUpdating}
                                                    className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors" title="ပို့ဆောင်ပြီး မှတ်မည်">✅</button>
                                            )}
                                            <button
                                                onClick={() => openOrderDetails(o)}
                                                className="p-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl transition-colors shadow-sm inline-flex items-center justify-center"
                                                title="အသေးစိတ် / ပြင်မည်"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                            </button>
                                        </div>
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

                        <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">အော်ဒါ: <span className="text-blue-600">{selectedOrder.orderNumber}</span></h2>
                                <p className="text-gray-500 font-medium mt-1">ဝယ်ယူသူ: {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                            </div>
                            <button
                                onClick={() => printReceipt(selectedOrder)}
                                className="shrink-0 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-black transition-all"
                            >
                                🖨️ ဘောက်ချာ
                            </button>
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

                        {/* 🌟 ငွေပေးချေမှု (Payment) — COD ငွေရ/မရ */}
                        <div className="mb-6 flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ငွေပေးချေမှု</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-black ${selectedOrder.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                    {selectedOrder.paymentStatus === "PAID" ? "✅ ငွေရရှိပြီး" : "⏳ ငွေမရသေး"}
                                </span>
                            </div>
                            <button
                                onClick={handlePaymentToggle}
                                disabled={isUpdating}
                                className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${selectedOrder.paymentStatus === "PAID" ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200"}`}
                            >
                                {selectedOrder.paymentStatus === "PAID" ? "↩ ငွေမရသေး ပြန်ပြောင်း" : "💵 ငွေရရှိပြီး မှတ်မည်"}
                            </button>
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate("APPROVED")}
                                        disabled={isUpdating || selectedOrder.status === "APPROVED"}
                                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === "APPROVED" ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'}`}
                                    >
                                        အတည်ပြုမည်
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
                                        title="Customer မယူတော့ပါက — Stock ပြန်ထည့်ပြီး အမြတ်ထဲက ဖယ်မည်"
                                        className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === "CANCELLED" ? 'bg-red-600 text-white ring-2 ring-red-300 ring-offset-2' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100'}`}
                                    >
                                        ပယ်ဖျက် / ပြန်အမ်း
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