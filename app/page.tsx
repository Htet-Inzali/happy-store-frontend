// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import ProductCard from "./components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Backend API သို့ ချိတ်ဆက်ခြင်း
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

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">ပစ္စည်းအသစ်များ</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
  );
}