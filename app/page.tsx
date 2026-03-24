// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import ProductCard from "./components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌟 Search အတွက် State အသစ်
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Products ယူရာတွင် အမှားအယွင်းရှိပါသည်:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🌟 ရှာဖွေထားသော စာသားနဲ့ ကိုက်ညီတဲ့ ပစ္စည်းတွေကို စစ်ထုတ်ခြင်း (နာမည် သို့မဟုတ် SKU)
  const filteredProducts = products.filter((product: any) =>
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="text-center py-20 font-bold text-blue-600 animate-pulse">Loading...</div>;

  return (
      <div className="container mx-auto px-4 py-8 max-w-7xl font-myanmar">

        {/* 🌟 Search Bar & Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl font-black text-gray-900 border-l-4 border-yellow-400 pl-4">ပစ္စည်းအသစ်များ</h1>

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
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
            />
          </div>
        </div>

        {/* 🌟 Product Grid Section */}
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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