import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
// 🌟 Error ပြင်ဆင်ချက်
import Navbar from "@/app/components/Navbar";
import AnnouncementBar from "@/app/components/AnnouncementBar";
import Footer from "@/app/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "HappyStore — မြန်မာ့ အရသာ ဗီယက်နမ်အရောက်",
    description: "HappyStore — မြန်မာ့ ကုန်ခြောက်နှင့် အစားအသောက် ပစ္စည်းများ၊ ဗီယက်နမ်အရောက် ဝန်ဆောင်မှု။",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            <CartProvider>
                <AnnouncementBar />
                <Navbar />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <Toaster position="top-center" />
            </CartProvider>
        </AuthProvider>
        </body>
        </html>
    );
}