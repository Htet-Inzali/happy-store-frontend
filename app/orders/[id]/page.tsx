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

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <Link href="/orders" className="text-blue-600 font-bold mb-6 inline-block hover:underline">← နောက်သို့ပြန်သွားမည်</Link>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">အော်ဒါအသေးစိတ်</h1>
                        <p className="text-sm text-gray-500 font-bold mt-1">အော်ဒါနံပါတ်: #{order.id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase ${
                        order.status === 'PREORDER_PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                        {order.status}
                    </span>
                </div>
                <div className="space-y-6 mb-8">
                    {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                            <div>
                                <p className="font-bold text-gray-800">{item.productName}</p>
                                <p className="text-xs text-gray-500 font-bold mt-1">အရေအတွက်: {item.quantity}</p>
                            </div>
                            {/* 🌟 Ks အစား VND ဟု အတိအကျ ပြင်ဆင်ထားသည် */}
                            <p className="font-black text-gray-900 text-lg">{(item.price * item.quantity).toLocaleString()} VND</p>
                        </div>
                    ))}
                </div>
                <div className="border-t border-dashed pt-6 space-y-3 flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                        {order.status === 'PREORDER_PENDING' ? 'ခန့်မှန်းကျသင့်ငွေ' : 'စုစုပေါင်းကျသင့်ငွေ'}
                    </span>
                    <span className="text-2xl font-black text-blue-600">{order.totalAmountVND?.toLocaleString()} VND</span>
                </div>
            </div>
        </div>
    );
}