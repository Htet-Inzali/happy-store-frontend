"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import toast from "react-hot-toast";

interface CartItem {
    id: number;
    name: string;
    currentPriceVND: number;
    imageUrl: string;
    quantity: number;
    totalStock: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCartItems(JSON.parse(savedCart));
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: any) => {
        // 🌟 1. Stock Limit စစ်ဆေးခြင်းနှင့် Toast ပြသခြင်းများကို State Update မလုပ်ခင် အပြင်ဘက်တွင် ကြိုတင်လုပ်ဆောင်ပါမည်
        const existingItem = cartItems.find((item) => item.id === product.id);

        if (existingItem && product.totalStock > 0 && existingItem.quantity >= product.totalStock) {
            toast.error(`လက်ကျန် ${product.totalStock} ခုသာ ရှိပါတော့သည်။ ပိုမိုလိုချင်ပါက Preorder တင်ရန် Admin သို့ ဆက်သွယ်ပါ။`, { duration: 4000 });
            return; // Stock ပြည့်သွားလျှင် အောက်သို့ဆက်မသွားဘဲ ရပ်လိုက်မည်
        }

        if (existingItem) {
            toast.success("ခြင်းတောင်းထဲ ထပ်ထည့်လိုက်ပါပြီ");
        } else {
            toast.success(product.totalStock > 0 ? "ခြင်းတောင်းထဲ ထည့်လိုက်ပါပြီ" : "Preorder စာရင်းထဲ ထည့်လိုက်ပါပြီ");
        }

        // 🌟 2. State Update ကို သီးသန့် သန့်သန့်ရှင်းရှင်း လုပ်ဆောင်မည် (React Error ဖြေရှင်းပြီး)
        setCartItems((prevItems) => {
            const itemInPrev = prevItems.find((item) => item.id === product.id);
            if (itemInPrev) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, {
                id: product.id,
                name: product.name,
                currentPriceVND: product.currentPriceVND || 0,
                imageUrl: product.imageUrl,
                quantity: 1,
                totalStock: product.totalStock || 0
            }];
        });
    };

    const updateQuantity = (id: number, quantity: number) => {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
    };

    const removeFromCart = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("ဖယ်ရှားလိုက်ပါပြီ");
    };

    const clearCart = () => setCartItems([]);

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};