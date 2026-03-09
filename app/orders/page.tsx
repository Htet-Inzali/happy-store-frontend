"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get("/orders/my-orders");
                if (response.data.success) setOrders(response.data.data);
            } catch (error: any) {
                toast.error(error.response?.data?.message || "ဝယ်ယူမှုမှတ်တမ်း ယူရာတွင် အမှားရှိပါသည်။");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    if (loading) return <div className="text-center py-20 font-bold text-blue-600">Loading...</div>;

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-2xl font-black mb-8 text-gray-900">ကျွန်ုပ်၏ ဝယ်ယူမှုမှတ်တမ်းများ</h1>
            <div className="space-y-6">
                {orders.length > 0 ? orders.map((order) => (
                    <Link href={`/orders/${order.id}`} key={order.id} className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-bold">အော်ဒါနံပါတ်: #{order.id}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(order.orderDate).toLocaleString()}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                order.status === 'PREORDER_PENDING' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="border-t border-dashed pt-4 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400">{order.items?.length || 0} items</span>
                            <p className="text-base font-black text-gray-800">
                                {/* 🌟 Ks အစား VND ဟု အတိအကျ ပြင်ဆင်ထားသည် */}
                                စုစုပေါင်း: {order.totalAmountVND?.toLocaleString()} VND
                            </p>
                        </div>
                    </Link>
                )) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <p className="text-gray-500 font-medium">ဝယ်ယူထားသော မှတ်တမ်း မရှိသေးပါ။</p>
                    </div>
                )}
            </div>
        </div>
    );
}