"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/axios";

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 🌟 Token ရှိမရှိ စစ်ဆေးပြီး User Profile ကို Backend ကနေ လှမ်းယူမယ်
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const res = await api.get("/user/profile"); // Backend မှာ ဒီ API ရှိရပါမယ်
                if (res.data.success) {
                    setUser(res.data.data);
                }
            }
        } catch (err) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        fetchProfile();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};