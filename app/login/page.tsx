"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/auth/login", { credential, password });
            if (response.data.success) {
                login(response.data.data.token);
                toast.success("Login အောင်မြင်ပါသည်။");
                router.push("/");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "အကောင့် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-10 rounded-4xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-black text-center text-gray-900 mb-8">Login ဝင်ရန်</h2>
                <form onSubmit={handleLogin} className="space-y-5">
                    <input type="text" required className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium" placeholder="Email သို့မဟုတ် ဖုန်းနံပါတ်" value={credential} onChange={(e) => setCredential(e.target.value)} />
                    <input type="password" required className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-600 font-medium" placeholder="စကားဝှက်" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        ဝင်ရောက်မည်
                    </button>
                </form>
            </div>
        </div>
    );
}