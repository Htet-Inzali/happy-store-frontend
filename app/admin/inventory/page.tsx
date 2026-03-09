"use client";

import { useState } from "react";
import api from "@/lib/axios";

export default function AdminInventory() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("ဖိုင်အရင်ရွေးချယ်ပါ");

        const formData = new FormData();
        formData.append("file", file); // Backend @RequestParam("file") နှင့် ကိုက်ညီရမည်

        setLoading(true);
        try {
            const response = await api.post("/admin/inventory/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert(response.data.message);
        } catch (error: any) {
            alert("Upload လုပ်ရာတွင် အမှားရှိပါသည်");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-black mb-8">ပစ္စည်းစာရင်း စီမံခန့်ခွဲမှု</h1>

            {/* Excel Upload Section */}
            <div className="bg-white p-6 rounded-3xl border border-dashed border-gray-300">
                <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">Excel ဖိုင်ဖြင့် ပစ္စည်းစာရင်းသွင်းရန်</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all"
                    >
                        {loading ? "တင်နေပါသည်..." : "Upload တင်မည်"}
                    </button>
                </div>
            </div>
        </div>
    );
}