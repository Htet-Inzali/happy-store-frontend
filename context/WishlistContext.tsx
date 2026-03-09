"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
    wishlistItems: any[];
    toggleWishlist: (product: any) => Promise<void>;
    isInWishlist: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const { user } = useAuth(); // User login ဝင်ထားမှသာ API ခေါ်မည်

    const fetchWishlist = async () => {
        if (!user) {
            setWishlistItems([]);
            return;
        }
        try {
            const res = await api.get("/wishlist");
            if (res.data.success) {
                // Backend မှ WishlistItem Object များပြန်လာသဖြင့် အတွင်းမှ product ကိုသာ ရွေးထုတ်မည်
                const products = res.data.data.map((item: any) => item.product);
                setWishlistItems(products);
            }
        } catch (error) {
            console.error("Wishlist ယူရာတွင် အမှားရှိပါသည်", error);
        }
    };

    // User အခြေအနေပြောင်းတိုင်း (Login/Logout) Wishlist ကို အသစ်ပြန်ခေါ်မည်
    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const toggleWishlist = async (product: any) => {
        if (!user) {
            toast.error("Wishlist အသုံးပြုရန် Login အရင်ဝင်ပေးပါ။");
            return;
        }

        // UI ကို ချက်ချင်း Update လုပ်ပေးရန် (Optimistic UI Update)
        const exists = wishlistItems.some((item) => item.id === product.id);
        if (exists) {
            setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
        } else {
            setWishlistItems((prev) => [...prev, product]);
        }

        try {
            // Backend သို့ လှမ်းပို့ခြင်း
            const res = await api.post(`/wishlist/${product.id}`);
            if (res.data.success) {
                toast.success(res.data.message); // Backend မှ ပြန်လာသော စာသားကို ပြမည်
                fetchWishlist(); // နောက်ကွယ်မှ အသေအချာ ပြန်ညှိမည်
            }
        } catch (error: any) {
            toast.error("အမှားအယွင်းဖြစ်ပွားခဲ့ပါသည်။");
            fetchWishlist(); // Error တက်လျှင် မူလအတိုင်း ပြန်ထားမည်
        }
    };

    const isInWishlist = (id: number) => wishlistItems.some((item) => item.id === id);

    return (
        <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
};