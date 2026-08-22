// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import ProductCard from "./components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waking, setWaking] = useState(false); // 🌟 ဆာဗာ နိုးနေတုန်း (cold start) ဖြစ်/မဖြစ်
  const [errorMsg, setErrorMsg] = useState(""); // 🌟 အမှားပြရန်

  // 🌟 Search အတွက် State အသစ်
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    // 🌟 Cold start ကြောင့် ၈ စက္ကန့်ထက်ကြာရင် "ဆာဗာ နိုးနေတုန်း" message ပြမယ်
    const wakeTimer = setTimeout(() => {
      if (!cancelled) setWaking(true);
    }, 8000);

    const fetchProducts = async () => {
      const maxAttempts = 5; // Render cold start အတွက် အကြိမ်ကြိမ် ထပ်ကြိုးစားမယ်
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await api.get("/products", { timeout: 30000 });
          if (cancelled) return;
          if (response.data.success) {
            setProducts(response.data.data);
          }
          setErrorMsg("");
          return; // အောင်မြင်ရင် ထွက်မယ်
        } catch (error) {
          console.error(`Products ယူရာတွင် အမှားအယွင်း (ကြိုးစားမှု ${attempt}):`, error);
          if (cancelled) return;
          if (attempt === maxAttempts) {
            setErrorMsg(
                "ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ။ Internet ကို စစ်ဆေးပြီး ပြန်ကြိုးစားကြည့်ပါ။"
            );
          } else {
            // ၃ စက္ကန့် စောင့်ပြီး ပြန်ကြိုးစားမယ် (backend နိုးချိန်ပေး)
            await new Promise((r) => setTimeout(r, 3000));
          }
        }
      }
    };

    fetchProducts().finally(() => {
      if (!cancelled) {
        clearTimeout(wakeTimer);
        setWaking(false);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(wakeTimer);
    };
  }, []);

  // 🌟 Category စာရင်း (ပစ္စည်းများထဲမှ ထုတ်ယူ)
  const categories = Array.from(
      new Set(products.map((p: any) => p.category).filter((c: any) => c && String(c).trim() !== ""))
  ) as string[];

  // 🌟 ရှာဖွေမှုကို space ဂရုမစိုက်ဘဲ ရှာနိုင်ရန် normalize (ဥပမာ "ဒံ ပေါက်" = "ဒံပေါက်")
  const norm = (s: any) => String(s || "").toLowerCase().replace(/\s+/g, "");

  // 🌟 ရှာဖွေထားသော စာသား + category နဲ့ ကိုက်ညီတဲ့ ပစ္စည်းတွေကို စစ်ထုတ်ခြင်း
  const filteredProducts = products.filter((product: any) => {
    const q = norm(searchTerm);
    const matchSearch = !q || norm(product.name).includes(q) || norm(product.sku).includes(q);
    const matchCategory = selectedCategory === "ALL" || product.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (loading)
    return (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
          <p className="font-bold text-blue-600 text-lg">ပစ္စည်းများ ရယူနေပါသည်...</p>
          {waking && (
              <p className="mt-3 text-sm text-gray-500 max-w-sm font-myanmar leading-relaxed">
                ဆာဗာ ပြန်နိုးနေသောကြောင့် ပထမဆုံးအကြိမ် ၁ မိနစ်ခန့် ကြာနိုင်ပါသည်။
                ကျေးဇူးပြု၍ ခဏစောင့်ပေးပါ။ 🙏
              </p>
          )}
        </div>
    );

  if (errorMsg)
    return (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <p className="font-bold text-red-600 text-lg mb-6 max-w-sm font-myanmar">{errorMsg}</p>
          <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            ပြန်ကြိုးစားမည်
          </button>
        </div>
    );

  return (
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-7xl font-myanmar">

        {/* 🌟 Welcome Hero */}
        <div className="mb-6 sm:mb-10 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-10 shadow-lg shadow-blue-200/50 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-black leading-tight">မြန်မာ့ အရသာ — ဗီယက်နမ်အရောက် 🇲🇲</h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
              HappyStore မှ မြန်မာ ကုန်ခြောက်နှင့် အစားအသောက် ပစ္စည်းများကို လွယ်ကူစွာ ရွေးချယ် မှာယူနိုင်ပါပြီ။
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm font-bold">
              <span className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">🛒 ခြင်းတောင်းထဲထည့်</span>
              <span className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">📦 Order တင်</span>
              <span className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">🚚 အိမ်အရောက် / ဆိုင်လာယူ</span>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none"></div>
          <div className="absolute right-20 -bottom-12 w-36 h-36 bg-white/5 rounded-full pointer-events-none"></div>
        </div>

        {/* 🌟 Search Bar & Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-10 gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-3xl font-black text-gray-900 border-l-4 border-yellow-400 pl-3 sm:pl-4">ပစ္စည်းအသစ်များ</h2>

          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
                type="text"
                placeholder="ပစ္စည်းအမည် (သို့) SKU ရှာရန်..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base rounded-xl sm:rounded-2xl border border-gray-200 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        {/* 🌟 Category Filter Chips */}
        {categories.length > 0 && (
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar md:flex-wrap gap-2 mb-5 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
              <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${selectedCategory === "ALL" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
              >
                အားလုံး
              </button>
              {categories.map((cat) => (
                  <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${selectedCategory === cat ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                  >
                    {cat}
                  </button>
              ))}
            </div>
        )}

        {/* 🌟 Product Grid Section */}
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
              ))}
            </div>
        ) : (
            /* 🌟 ရှာလို့မတွေ့ပါက ပြသမည့် အပိုင်း */
            <div className="text-center py-24 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-sm mt-4">
              <span className="text-5xl mb-4 block opacity-50">📦</span>
              <p className="text-gray-500 font-bold text-lg">သင်ရှာဖွေထားသော ပစ္စည်း မရှိသေးပါ။</p>
              <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                စာရင်းအားလုံး ပြန်ကြည့်မည်
              </button>
            </div>
        )}

      </div>
  );
}