/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        page: "#FAFBF8",
        alt: "#F1F4EF",
        surface: {
          card: "#FFFFFF",
          muted: "#E6EAE5",
          sage: "#B5BEB5",
          "sage-deep": "#A3AEA3",
          mint: "#D7EBDF",
        },
        sage: {
          DEFAULT: "#B5BEB5",
          deep: "#A3AEA3",
          light: "#E6EAE5",
        },
        mint: "#D7EBDF",
        brand: {
          100: "#DCE8E0",
          600: "#5E7F6C",
          700: "#4F6F5D",
        },
        ink: {
          strong: "#1E2A24",
          body: "#3F4A44",
          muted: "#7B857F",
          "on-brand": "#FFFFFF",
        },
        line: {
          subtle: "#E3E8E2",
          strong: "#CBD3CB",
        },
        pastel: {
          mint: "#BFE6D3",
          blue: "#D3E3F4",
          lavender: "#DDD5F0",
          peach: "#FADFC8",
        },
        badge: {
          "hot-bg": "#FDE4E0",
          "hot-fg": "#C2412D",
          "deal-bg": "#D9F2E3",
          "deal-fg": "#2F7D52",
          "trend-bg": "#E8DEF8",
          "trend-fg": "#6B4FB3",
          "new-bg": "#D5F0F0",
          "new-fg": "#1F7A7A",
          "budget-bg": "#FDE9D2",
          "budget-fg": "#B8661A",
        },
        star: "#E0A83A",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        panel: "28px",
        input: "10px",
        pill: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(30,42,36,0.06)",
      },
    },
  },
  plugins: [],
};
