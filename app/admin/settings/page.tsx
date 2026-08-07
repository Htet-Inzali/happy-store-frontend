"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
    // 🌟 အစ်ကို့ Backend မှ Key များအတိုင်း ချိတ်ဆက်ထားသည်
    const [settings, setSettings] = useState({
        "EXCHANGE_RATE": 6,
        "FREE_DELIVERY_THRESHOLD": 500000
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/settings/all");
                if (res.data.success && Object.keys(res.data.data).length > 0) {
                    setSettings(prev => ({ ...prev, ...res.data.data }));
                }
            } catch (error) {
                toast.error("ဆက်တင်များ ယူရာတွင် အမှားရှိပါသည်။");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: any) => {
        e.preventDefault();
        const toastId = toast.loading("သိမ်းဆည်းနေပါသည်...");
        try {
            const res = await api.post("/settings/update", settings);
            if (res.data.success) {
                toast.success("ဆက်တင်များ အတည်ပြု သိမ်းဆည်းပြီးပါပြီ။", { id: toastId });
            }
        } catch (error) {
            toast.error("ပြင်ဆင်ရာတွင် အမှားရှိပါသည်။", { id: toastId });
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 font-myanmar">
            <h1 className="text-3xl font-black mb-8 border-l-4 border-yellow-500 pl-4">စနစ် ဆက်တင်များ</h1>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">

                {/* ငွေလဲလှယ်နှုန်း — အရင်း (MMK) ကို VND ပြောင်း၍ အမြတ်တွက်ရန်သာ သုံးသည် */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <label className="block text-sm font-black text-blue-800 uppercase mb-2">ငွေလဲလှယ်နှုန်း (Exchange Rate)</label>
                    <p className="text-xs text-blue-600/70 mb-2">အရင်း (MMK) ကို VND ပြောင်း၍ <b>အမြတ်တွက်ရန်သာ</b> သုံးသည်။ ရောင်းဈေးက သင် ကိုယ်တိုင် သတ်မှတ်တာမို့ ဤနှုန်းနှင့် မဆိုင်ပါ။</p>
                    <input
                        type="number" step="0.01" required
                        value={settings["EXCHANGE_RATE"]}
                        onChange={(e) => setSettings({...settings, "EXCHANGE_RATE": Number(e.target.value)})}
                        className="w-full p-4 rounded-xl bg-white border border-gray-200 font-black text-lg outline-none"
                    />
                </div>

                {/* ပို့ဆောင်ခ အခမဲ့ ကန့်သတ်ပမာဏ — ဤပမာဏထက် ကျော်ရင် "အခမဲ့"၊ မဟုတ်ရင် "Add-on" note ပြသည် */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <label className="block text-sm font-black text-gray-800 uppercase mb-2">ပို့ဆောင်ခ အခမဲ့ ကန့်သတ်ပမာဏ (VND)</label>
                    <p className="text-xs text-gray-500 mb-2">ဤပမာဏထက် ကျော်ဝယ်ရင် "အခမဲ့"၊ မဟုတ်ရင် "ပို့ချိန်တွင် သီးသန့်ကောက်ခံ" ဟု ပြသည်။ ပို့ဆောင်ခကို order total ထဲ မပေါင်းပါ။</p>
                    <input
                        type="number" required
                        value={settings["FREE_DELIVERY_THRESHOLD"]}
                        onChange={(e) => setSettings({...settings, "FREE_DELIVERY_THRESHOLD": Number(e.target.value)})}
                        className="w-full p-4 rounded-xl bg-white border border-gray-200 font-black text-lg outline-none"
                    />
                </div>

                <button type="submit" className="w-full py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all">
                    အတည်ပြု သိမ်းဆည်းမည်
                </button>
            </form>
        </div>
    );
}