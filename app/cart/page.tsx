"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    // 🌟 API မှ ရယူမည့် ဆက်တင်များအတွက် State များ
    const [deliveryFee, setDeliveryFee] = useState(30000);
    const [freeThreshold, setFreeThreshold] = useState(500000);

    // 🌟 Backend မှ Settings များ လှမ်းယူခြင်း (Hardcode အစားထိုးခြင်း)
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/settings/all");
                if (res.data.success && Object.keys(res.data.data).length > 0) {
                    setDeliveryFee(res.data.data["DELIVERY_FEE_VND"] || 30000);
                    setFreeThreshold(res.data.data["FREE_DELIVERY_THRESHOLD"] || 500000);
                }
            } catch (error) {
                console.error("Settings fetch error");
            }
        };
        fetchSettings();
    }, []);

    const [deliveryType, setDeliveryType] = useState("COD");
    const [contactName, setContactName] = useState(user?.fullName || "");
    const [contactPhone, setContactPhone] = useState(user?.phone || "");
    const [shippingAddress, setShippingAddress] = useState(user?.address || "");

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:8080";
    const getResolvedImageUrl = (url?: string) => {
        if (!url) return "https://via.placeholder.com/300?text=No+Image";
        if (url.startsWith("http")) return url;
        return `${backendUrl}${url}`;
    };

    const inStockItems = cartItems.filter(item => item.totalStock > 0);
    const preorderItems = cartItems.filter(item => item.totalStock <= 0);

    const inStockTotal = inStockItems.reduce((sum, item) => sum + (Number(item.currentPriceVND) * item.quantity), 0);
    const preorderTotal = preorderItems.reduce((sum, item) => sum + (Number(item.currentPriceVND) * item.quantity), 0);

    // 🌟 ပို့ဆောင်ခ — total ထဲ မပေါင်းတော့ဘဲ note အဖြစ်သာ ပြသည် (COD တွင် ပို့ချိန်မှ သီးသန့်ကောက်ခံ)
    // COD + 500,000 ထက်ကျော် → Free၊ မဟုတ်ရင် "Add-on Delivery Charge" note
    const isFreeDelivery = deliveryType === "PICKUP" || inStockTotal >= freeThreshold;

    // Grand total = ပစ္စည်းတန်ဖိုးသာ (ပို့ခ မပါ)
    const grandTotalInStockVND = inStockTotal;

    const handleCheckout = async () => {
        if (!user) return toast.error("အော်ဒါတင်ရန် Login အရင်ဝင်ပေးပါ။");
        if (!contactName.trim() || !contactPhone.trim()) return toast.error("နာမည်နှင့် ဖုန်းနံပါတ် ထည့်ပေးပါ။");
        if (deliveryType === "COD" && !shippingAddress.trim()) return toast.error("ပို့ဆောင်မည့် လိပ်စာထည့်ပေးပါ။");

        try {
            const finalAddress = deliveryType === "COD"
                ? `[လက်ခံမည့်သူ: ${contactName}] ${shippingAddress}`
                : `[ဆိုင်တွင်လာယူမည့်သူ: ${contactName}]`;

            const orderData = {
                deliveryType,
                contactPhone,
                shippingAddress: finalAddress,
                items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity }))
            };

            const response = await api.post("/orders/checkout", orderData);
            if (response.data.success) {
                toast.success("Order တင်ခြင်း အောင်မြင်ပါသည်။");
                clearCart();
                router.push("/orders");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "အော်ဒါတင်ရာတွင် အမှားရှိပါသည်။");
        }
    };

    if (cartItems.length === 0) return <div className="text-center py-20 font-bold text-gray-500">ခြင်းတောင်းထဲတွင် ပစ္စည်းမရှိပါ။</div>;

    const renderItems = (items: any[]) => (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <img
                        src={getResolvedImageUrl(item.imageUrl)}
                        className="h-20 w-20 rounded-xl object-cover border border-gray-50"
                        alt={item.name}
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300?text=No+Image" }}
                    />
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800">{item.name}</h3>
                        <p className="text-blue-600 font-black text-sm mt-1">{Number(item.currentPriceVND).toLocaleString()} VND</p>
                        <div className="mt-2 flex items-center bg-gray-50 w-fit rounded-lg border border-gray-100">

                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1 font-black text-gray-500 hover:text-blue-600 transition-colors">−</button>

                            <span className="font-black text-gray-900 px-2 text-sm">{item.quantity}</span>

                            <button
                                onClick={() => {
                                    if (item.totalStock > 0 && item.quantity >= item.totalStock) {
                                        toast.error(
                                            `လက်ကျန် ${item.totalStock} ခုသာ ရှိပါတော့သည်။ ကျန်အရေအတွက်ကို Preorder တင်လိုပါက Admin သို့ ဆက်သွယ်ပေးပါ။`,
                                            { duration: 5000, icon: '⚠️' }
                                        );
                                    } else {
                                        updateQuantity(item.id, item.quantity + 1);
                                    }
                                }}
                                className={`px-3 py-1 font-black transition-colors ${item.totalStock > 0 && item.quantity >= item.totalStock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                                +
                            </button>

                        </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors">✕</button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-7 space-y-8">
                    {inStockItems.length > 0 && (
                        <div>
                            <h2 className="text-xl font-black mb-4 text-gray-900 border-l-4 border-blue-600 pl-3">ချက်ချင်းရမည့် ပစ္စည်းများ</h2>
                            {renderItems(inStockItems)}
                        </div>
                    )}
                    {preorderItems.length > 0 && (
                        <div>
                            <h2 className="text-xl font-black mb-4 text-gray-900 border-l-4 border-orange-500 pl-3">ကြိုတင်မှာယူရမည့် (Preorder) ပစ္စည်းများ</h2>
                            {renderItems(preorderItems)}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-white p-8 rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-black mb-6 border-b pb-4">အော်ဒါစာရင်းချုပ်</h2>

                        {inStockItems.length > 0 && (
                            <div className="mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">ချက်ချင်းပေးချေရမည့်ငွေ</h3>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-bold">ပစ္စည်းတန်ဖိုး</span>
                                    <span className="font-black text-gray-900">{inStockTotal.toLocaleString()} VND</span>
                                </div>
                                <div className="flex justify-between text-sm mb-3 border-b border-blue-100 pb-3">
                                    <span className="text-gray-600 font-bold">ပို့ဆောင်ခ {deliveryType === "PICKUP" && "(ဆိုင်လာယူ)"}</span>
                                    {isFreeDelivery ? (
                                        <span className="font-black text-green-600">အခမဲ့ (Free)</span>
                                    ) : (
                                        <span className="font-bold text-orange-500 text-right">Add-on Delivery Charge<br/><span className="text-[10px] text-gray-400 font-medium">(ပို့ချိန်တွင် သီးသန့် ကောက်ခံပါမည်)</span></span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-blue-900">စုစုပေါင်း (ပစ္စည်းဖိုး)</span>
                                    <span className="text-2xl font-black text-blue-600">{grandTotalInStockVND.toLocaleString()} VND</span>
                                </div>
                            </div>
                        )}

                        {preorderItems.length > 0 && (
                            <div className="mb-6 bg-orange-50/50 p-4 rounded-2xl border border-orange-50">
                                <h3 className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-2">ပစ္စည်းရောက်မှ ပေးချေရမည့်ငွေ</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-bold text-sm">ခန့်မှန်းတန်ဖိုး (ပို့ဆောင်ခမပါ)</span>
                                    <span className="text-lg font-black text-orange-600">~ {preorderTotal.toLocaleString()} VND</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ပို့ဆောင်မည့်နည်းလမ်း</label>
                                <div className="flex space-x-3 mt-2">
                                    {["COD", "PICKUP"].map((type) => (
                                        <button key={type} onClick={() => setDeliveryType(type)} className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all ${deliveryType === type ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200'}`}>
                                            {type === "COD" ? "အိမ်အရောက်ငွေချေ" : "ဆိုင်မှာလာယူမည်"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">နာမည်</label>
                                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-gray-50 border-none text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all" placeholder="အမည်" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ဖုန်းနံပါတ်</label>
                                    <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-gray-50 border-none text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all" placeholder="09..." />
                                </div>
                            </div>
                            {deliveryType === "COD" && (
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ပို့ဆောင်ရမည့်လိပ်စာ</label>
                                    <textarea rows={2} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-gray-50 border-none text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all" placeholder="အိမ်အမှတ်၊ လမ်း၊ မြို့နယ်..." />
                                </div>
                            )}
                        </div>

                        <button onClick={handleCheckout} className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-300">
                            အော်ဒါတင်မည်
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}