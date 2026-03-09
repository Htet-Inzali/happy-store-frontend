import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",        // app folder ထဲက page တွေအတွက်
        "./context/**/*.{js,ts,jsx,tsx,mdx}",    // context folder အတွက်
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",        // lib folder အတွက်
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [],
};
export default config;