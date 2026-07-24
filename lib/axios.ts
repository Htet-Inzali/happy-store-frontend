import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🌟 Session ကုန်ဆုံး (401) ပါက token ရှင်းပြီး login သို့ ပြန်ပို့သည်
// (403 ကို မထိပါ — ၎င်းသည် login ဝင်ထားပြီး ခွင့်မရှိသည့် အခြေအနေဖြစ်၍ logout မလုပ်သင့်ပါ)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined' && error.response?.status === 401) {
            const hadToken = !!localStorage.getItem('token');
            localStorage.removeItem('token');
            const onAuthPage = window.location.pathname.startsWith('/login')
                || window.location.pathname.startsWith('/register');
            if (hadToken && !onAuthPage) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;