"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: "", email: "", phone: "", password: "", address: "", country: "MYANMAR"
    });
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 🌟 အစ်ကို့ရဲ့ AuthController ထဲက /api/auth/register endpoint ကို ခေါ်ခြင်း
            const res = await api.post("/auth/register", formData);
            if (res.data.success) {
                toast.success("အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။");
                router.push("/login");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "အချက်အလက်များ မှားယွင်းနေပါသည်");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md bg-white p-10 rounded-4xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-black text-center text-gray-900 mb-8 uppercase tracking-tighter">Sign Up</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="text" placeholder="အမည်အပြည့်အစုံ" required className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                    <input type="email" placeholder="Email" required className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    <input type="text" placeholder="ဖုန်းနံပါတ်" required className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    <input type="password" placeholder="စကားဝှက်" required className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <input type="text" placeholder="လိပ်စာ (မြို့နယ်/မြို့)" required className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all" onChange={(e) => setFormData({...formData, address: e.target.value})} />

                    <select className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-500" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}>
                        <option value="MYANMAR">Myanmar</option>
                        <option value="VIETNAM">Vietnam</option>
                        <option value="SINGAPORE">Singapore</option>
                    </select>

                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">အကောင့်ဖွင့်မည်</button>
                </form>
                <p className="mt-8 text-center text-sm font-bold text-gray-400">
                    အကောင့်ရှိပြီးသားလား? <Link href="/login" className="text-blue-600 hover:underline">ဝင်ရောက်ရန်</Link>
                </p>
            </div>
        </div>
    );
}