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
        const existingItem = cartItems.find((item) => item.id === product.id);

        // 🌟 ပြင်ဆင်ချက်: Stock မလောက်ပါက ခြင်းတောင်းထဲ ဆက်မထည့်ဘဲ ရပ်တန့် (return) ပါမည်
        if (existingItem && product.totalStock > 0 && existingItem.quantity >= product.totalStock) {
            toast.error(`လက်ကျန် ${product.totalStock} ခုသာ ရှိပါတော့သည်။`);
            return; // 🌟 ဒါလေး ထည့်လိုက်ပါပြီ
        }

        setCartItems((prevItems) => {
            if (existingItem) {
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
        toast.success("ခြင်းတောင်းထဲ ထည့်လိုက်ပါပြီ");
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