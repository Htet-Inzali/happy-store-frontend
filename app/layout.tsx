import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
// 🌟 Error ပြင်ဆင်ချက်
import Navbar from "@/app/components/Navbar";
import { Toaster } from "react-hot-toast";
import {WishlistProvider} from "@/context/WishlistContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Happy Store",
    description: "Production Level E-commerce",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <Navbar />
                        {children}
                        <Toaster position="top-center" />
                 </WishlistProvider>
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}