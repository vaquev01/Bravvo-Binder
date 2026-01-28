/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bravvo: {
                    bg: "#1A1A1B", // Deep Charcoal
                    card: "#1F1F1F",
                    border: "#2A2A2A",
                    primary: "#FF6600",
                    accent: "#FF6600",
                    text: "#EDEDED",
                    muted: "#8E8E93"
                }
            },
            fontFamily: {
                sans: ['var(--brand-font)', 'Inter', 'sans-serif'],
                display: ['var(--brand-font)', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}
