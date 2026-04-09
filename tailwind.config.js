/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "soul-pink": "#ff4ecd",
                "soul-purple": "#7c3aed",
            },
        },
    },
    plugins: [],
};