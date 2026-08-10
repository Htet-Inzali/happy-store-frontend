"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [waking, setWaking] = useState(false); // 🌟 cold start (ဆာဗာနိုးနေတုန်း) ပြရန်
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // ၈ စက္ကန့်ထက်ကြာရင် ဆာဗာ cold start ဖြစ်နေကြောင်း ပြသည်
        const wakeTimer = setTimeout(() => setWaking(true), 8000);
        try {
            const response = await api.post("/auth/login", { credential, password }, { timeout: 90000 });
            if (response.data.success) {
                login(response.data.data.token);
                toast.success("Login အောင်မြင်ပါသည်။");
                const userRole = response.data.data.role || response.data.data.user?.role;
                if (userRole === "ADMIN") {
                    router.push("/admin/orders");
                } else {
                    router.push("/");
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "အကောင့် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။");
        } finally {
            clearTimeout(wakeTimer);
            setWaking(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-10 rounded-4xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-black text-center text-gray-900 mb-8">Login ဝင်ရန်</h2>
                <form onSubmit={handleLogin} className="space-y-5">
                    <input type="text" required className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium" placeholder="Email သို့မဟုတ် ဖုန်းနံပါတ်" value={credential} onChange={(e) => setCredential(e.target.value)} />
                    <input type="password" required disabled={isLoading} className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-60" placeholder="စကားဝှက်" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isLoading && <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                        {isLoading ? "ဝင်နေပါသည်..." : "ဝင်ရောက်မည်"}
                    </button>
                    {waking && (
                        <p className="text-center text-xs text-gray-500 leading-relaxed">
                            ⏳ ဆာဗာ ပြန်နိုးနေသောကြောင့် ပထမဆုံးအကြိမ် ၁ မိနစ်ခန့် ကြာနိုင်ပါသည်။ ခဏစောင့်ပေးပါ။ 🙏
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}