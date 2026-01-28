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
                    bg: "#050505", // Deepest Black
                    card: "#0F0F0F",
                    border: "#1F1F1F",
                    primary: "#FF5733",
                    accent: "#00FF88",
                    text: "#EDEDED",
                    muted: "#737373"
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
