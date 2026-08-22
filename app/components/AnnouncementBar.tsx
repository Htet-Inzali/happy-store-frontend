"use client";

import { usePathname } from "next/navigation";

// 🌟 အပေါ်ဆုံး ကြေညာ banner — စာသားများ ဘယ်ဘက်သို့ ပြေးဆင်းသွားသည် (marquee)
// စာသားပြောင်းရန် — အောက်က messages array ကို ပြင်ရုံပါ။
const messages = [
    "🎉 HappyStore — မြန်မာ့ အရသာ ဗီယက်နမ်အရောက်",
    "📍 FPT City, DaNang City",
    "📞 Order / ဆက်သွယ်ရန်: +84 36 575 0492 (Zalo) · +886 976 399 644 (WhatsApp)",
    "✨ ပစ္စည်းအသစ်များ ပုံမှန် ရောက်ရှိနေပါသည်",
];

export default function AnnouncementBar() {
    const pathname = usePathname();
    // Admin စာမျက်နှာများတွင် customer-facing banner မပြပါ
    if (pathname?.startsWith("/admin")) return null;

    // seamless loop အတွက် စာသားစုကို ၂ ခါ ထပ်ပြသည် (translateX -50% နှင့် ကိုက်ညီစေရန်)
    const strip = (
        <div className="hs-marquee" aria-hidden="false">
            {[...messages, ...messages].map((msg, i) => (
                <span key={i} className="mx-6 text-xs sm:text-sm font-bold tracking-wide">
                    {msg}
                    <span className="mx-6 opacity-40">•</span>
                </span>
            ))}
        </div>
    );

    return (
        <div className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white overflow-hidden py-2">
            {strip}
        </div>
    );
}
