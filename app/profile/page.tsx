"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "", phone: "", address: "", country: "MYANMAR"
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                phone: user.phone || "",
                address: user.address || "",
                country: user.country || "MYANMAR"
            });
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.put("/user/profile", formData);
            if (response.data.success) {
                toast.success("ကိုယ်ရေးအချက်အလက် ပြင်ဆင်ပြီးပါပြီ။");
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "အမှားအယွင်းရှိပါသည်။");
        }
    };

    if (!user) return <div className="text-center py-20 font-bold">Login အရင်ဝင်ပေးပါ။</div>;

    return (
        <div className="mx-auto max-w-xl px-4 py-12">
            <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-black mb-8 text-gray-900">ကိုယ်ရေးအချက်အလက် ပြင်ဆင်ရန်</h1>
                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">နာမည်အပြည့်အစုံ</label>
                        <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full mt-2 p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ဖုန်းနံပါတ်</label>
                        <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full mt-2 p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">လိပ်စာ</label>
                        <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full mt-2 p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">နိုင်ငံ</label>
                        <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full mt-2 p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium">
                            <option value="MYANMAR">Myanmar</option>
                            <option value="VIETNAM">Vietnam</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full mt-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                        သိမ်းဆည်းမည်
                    </button>
                </form>
            </div>
        </div>
    );
}