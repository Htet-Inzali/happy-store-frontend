"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await api.get(`/orders/my-orders`);
                if (response.data.success) {
                    const found = response.data.data.find((o: any) => o.id === Number(id));
                    setOrder(found);
                }
            } catch (error) {
                console.error("Order Detail Error:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrderDetail();
    }, [id]);

    if (loading) return <div className="text-center py-20 font-bold text-blue-600">ခဏစောင့်ပေးပါ...</div>;
    if (!order) return <div className="text-center py-20 text-red-500 font-bold">အော်ဒါအချက်အလက် ရှာမတွေ့ပါ။</div>;

    // 🌟 တွက်ချက်မှု Logic များ
    const subtotal = order.items?.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0) || 0;
    const deliveryFee = Number(order.totalAmountVND || 0) - subtotal;
    const isPickup = order.shippingAddress?.includes("ဆိုင်တွင်လာယူ");

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <Link href="/orders" className="text-blue-600 font-bold mb-6 inline-block hover:underline">← နောက်သို့ပြန်သွားမည်</Link>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">အော်ဒါအသေးစိတ်</h1>
                        <p className="text-sm text-gray-500 font-bold mt-2">အော်ဒါနံပါတ်: #{order.orderNumber || order.id}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
                        order.status === 'PREORDER_PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                        {order.status === 'PREORDER_PENDING' ? 'PREORDER' : order.status}
                    </span>
                </div>

                <div className="space-y-4 mb-8">
                    {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                            <div>
                                <p className="font-bold text-gray-800">{item.productName}</p>
                                <p className="text-xs text-gray-500 font-bold mt-1">အရေအတွက်: {item.quantity}</p>
                            </div>
                            <p className="font-black text-gray-900 text-lg">{(item.price * item.quantity).toLocaleString()} ₫</p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-dashed pt-6 space-y-4">
                    <div className="flex justify-between items-center font-bold text-gray-500 text-sm">
                        <span>ဝယ်ယူမှု တန်ဖိုး (Subtotal)</span>
                        <span>{subtotal.toLocaleString()} ₫</span>
                    </div>

                    <div className="flex justify-between items-center font-bold text-gray-500 text-sm">
                        <span>ပို့ဆောင်ခ ({isPickup ? 'ဆိုင်လာယူမည်' : 'အိမ်အရောက်ပို့'})</span>
                        <span>{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} ₫` : '0 ₫'}</span>
                    </div>

                    {!isPickup && order.shippingAddress && (
                        <div className="bg-blue-50/50 p-4 rounded-xl mt-2 text-sm border border-blue-100">
                            <span className="font-bold text-blue-800">ပို့ဆောင်ရမည့်လိပ်စာ: </span>
                            <span className="text-blue-600 leading-relaxed">{order.shippingAddress}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                        <span className="text-gray-900 font-black uppercase tracking-widest text-sm">
                            {order.status === 'PREORDER_PENDING' ? 'ခန့်မှန်းကျသင့်ငွေ' : 'စုစုပေါင်းကျသင့်ငွေ'}
                        </span>
                        <span className="text-2xl font-black text-blue-600">{Number(order.totalAmountVND || 0).toLocaleString()} ₫</span>
                    </div>
                </div>
            </div>
        </div>
    );
}