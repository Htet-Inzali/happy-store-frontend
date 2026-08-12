"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post("/auth/forgot-password", { email }, { timeout: 90000 });
            if (res.data.success) {
                setSent(true);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "တောင်းဆို၍ မရပါ။ ထပ်ကြိုးစားပါ။");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-3xl sm:rounded-4xl shadow-lg border border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-black text-center text-gray-900 mb-2">စကားဝှက် မေ့သွားခြင်း</h2>

                {sent ? (
                    // ✅ ပို့ပြီး message
                    <div className="text-center mt-6">
                        <span className="text-5xl block mb-4">📧</span>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            အကယ်၍ <span className="font-bold text-gray-900">{email}</span> ဖြင့် အကောင့်ရှိပါက
                            စကားဝှက် ပြန်သတ်မှတ်ရန် link ကို ပို့လိုက်ပါပြီ။
                        </p>
                        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                            Email ကို စစ်ဆေးပါ (Spam folder ပါ ကြည့်ပါ)။ Link က ၃၀ မိနစ်အတွင်း အသုံးပြုရပါမည်။
                        </p>
                        <Link href="/login" className="inline-block mt-6 text-sm font-bold text-blue-600 hover:underline">
                            ← Login သို့ ပြန်သွားမည်
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-center text-xs text-gray-400 mb-6 leading-relaxed">
                            အကောင့်ဖွင့်စဉ်က သုံးခဲ့သော email ကို ထည့်ပါ။ စကားဝှက် ပြန်သတ်မှတ်ရန် link ကို ပို့ပေးပါမည်။
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input
                                type="email"
                                required
                                disabled={isLoading}
                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-60"
                                placeholder="သင့် email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading && <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                                {isLoading ? "ပို့နေပါသည်..." : "Reset link ပို့မည်"}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-5">
                            <p className="text-gray-400">Email မထည့်ခဲ့ပါက — ဆိုင် (Admin) သို့ ဆက်သွယ်၍ ပြန်သတ်မှတ်ပေးရန် တောင်းဆိုပါ။</p>
                            <Link href="/login" className="inline-block mt-3 font-bold text-blue-600 hover:underline">
                                ← Login သို့ ပြန်သွားမည်
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
