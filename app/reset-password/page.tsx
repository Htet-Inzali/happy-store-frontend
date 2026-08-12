"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.error("Password အနည်းဆုံး ၆ လုံး ဖြစ်ရပါမည်။");
        if (newPassword !== confirmPassword) return toast.error("Password ၂ ခု မတူညီပါ။");
        setIsLoading(true);
        try {
            const res = await api.post("/auth/reset-password", { token, newPassword }, { timeout: 90000 });
            if (res.data.success) {
                toast.success("စကားဝှက် ပြောင်းလဲပြီးပါပြီ။ Login ပြန်ဝင်ပါ။");
                router.push("/login");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Reset link မမှန်ကန် (သို့) သက်တမ်းကုန်သွားပါပြီ။");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center mt-6">
                <span className="text-5xl block mb-4">⚠️</span>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    Reset link မမှန်ကန်ပါ။ ကျေးဇူးပြု၍ စကားဝှက် မေ့သွားခြင်း စာမျက်နှာမှ ထပ်မံတောင်းဆိုပါ။
                </p>
                <Link href="/forgot-password" className="inline-block mt-6 text-sm font-bold text-blue-600 hover:underline">
                    ← Reset link ထပ်တောင်းမည်
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <input
                type="password"
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-60"
                placeholder="စကားဝှက် အသစ် (အနည်းဆုံး ၆ လုံး)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
                type="password"
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-60"
                placeholder="စကားဝှက် အသစ် (ထပ်ရိုက်)"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {isLoading && <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {isLoading ? "ပြောင်းနေပါသည်..." : "စကားဝှက် အသစ် သတ်မှတ်မည်"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-3xl sm:rounded-4xl shadow-lg border border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-black text-center text-gray-900 mb-6 sm:mb-8">စကားဝှက် အသစ် သတ်မှတ်ရန်</h2>
                <Suspense fallback={<div className="text-center text-sm text-gray-400 py-6">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
