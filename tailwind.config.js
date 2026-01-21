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
                    bg: "#0a0a0a",
                    card: "#121212",
                    border: "#2a2a2a",
                    primary: "#FF5733", // Orange
                    accent: "#00FF88", // Cyber Green
                    text: "#F5F5F5",
                    muted: "#888888"
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Montserrat', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
