<div align="center">

# 🛒 YearnIt — Amazon Affiliate Price Tracker

**Smart deals. Real savings. Track prices. Buy at the right time.**

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-yearnit.in-orange?style=for-the-badge)](https://yearnit.in)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## 📖 About

**YearnIt** is a full-featured Amazon affiliate product discovery and price-tracking web app built for Indian shoppers. It curates hand-picked deals across categories, displays live Amazon pricing, tracks 365-day price history for every product, and tells users the **best time to buy** — all with a sleek, mobile-first UI.

> Affiliate tag: `dk29112306-21` — all product links are automatically tagged.

---

## ✨ Features

### 🏠 Home & Discovery
- **Hero banner** with featured deals and call-to-action
- **Category grid** — Electronics, Mobiles, Laptops, Home Appliances, Fashion & more
- **Animated product cards** with staggered entrance animations (no sync transitions)
- **Search** across the entire product catalog
- **Trending / Deal of the Day** sections

### 📦 Product Pages
- Full product detail page with image gallery, specs, and description
- **Amazon Buy Now** button with affiliate link auto-tagging
- **"View Price History ↓"** jump anchor in the price block
- SEO-optimized meta tags (title, description, Open Graph, Twitter Card, JSON-LD schema)

### 📈 Price History Tracker *(New!)*
Every product page includes an **interactive price history graph**:
- 📊 365-day deterministic SVG price chart (no external charting library)
- 🖱️ Hover scrubber tooltip showing exact price & date
- ⏱️ Timeframe switcher — **1M / 3M / 6M / 1Y / ALL**
- 🏆 **Best Time to Buy** verdict card (Excellent / Good / Fair / Wait)
- 📉 All-time Low / All-time High / Average price metric cards
- 🏅 Price Milestone table (significant drops & peaks)
- 🔔 **Set Price Drop Alert** modal with localStorage persistence
- All prices displayed in **₹ INR** with Indian number formatting

### 🛠️ Admin Dashboard
- Password-protected admin panel (`/admin`)
- **Add products manually** — fill in name, price, image URL, Amazon ASIN, category & description
- **Delete products** with confirmation modal
- Product catalog management with restore & reset-to-defaults
- Drag-and-drop image upload support (Supabase Storage)

### 🔍 SEO
- Dynamic `<title>` and `<meta description>` per page
- Open Graph & Twitter Card tags for social sharing preview images
- JSON-LD structured data (Product schema, BreadcrumbList)
- `sitemap.xml` and `robots.txt`
- Canonical URLs

### 📱 Responsive Design
- Mobile-first layout — works on all screen sizes (320px → 4K)
- Hamburger nav menu for mobile
- Touch-friendly product cards and buttons

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5.6 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 + Framer Motion |
| Routing | React Router DOM v7 |
| Auth & DB | Firebase (Auth + Firestore) |
| File Storage | Supabase Storage |
| UI Components | Heroicons, React Icons, CoreUI |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Vercel (auto-deploy from GitHub) |

---

## 📁 Project Structure

```
ProductionIyzzo/
├── public/
│   ├── favicon.png
│   ├── og-image.jpg          # Social preview image
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/               # Static images
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetailPage.tsx   # Product page with SEO & price history
│   │   ├── PriceHistoryTracker.tsx # Interactive 365-day price chart
│   │   ├── AdminDashboard.tsx      # Admin panel
│   │   ├── AdminProducts.tsx       # Product CRUD management
│   │   ├── CategoryPage.tsx
│   │   ├── SearchPage.tsx
│   │   └── ...
│   ├── config/
│   │   └── firebase.ts
│   ├── data/
│   │   └── products.ts       # Product catalog + CRUD helpers
│   ├── utils/
│   │   ├── affiliate.ts      # Affiliate link builder (tag: dk29112306-21)
│   │   └── priceHistory.ts   # Price history generation & buying advice
│   ├── App.tsx               # Routes
│   ├── firebase.ts
│   ├── supabase.ts
│   └── main.tsx
├── .env.example              # Environment variable template
├── vercel.json               # Vercel SPA config
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+ (LTS recommended)
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- [Git](https://git-scm.com)

### 1. Clone the repository

```bash
git clone https://github.com/Dhanush-kumar-dk/ProductionIyzzo.git
cd ProductionIyzzo
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Fill in your credentials in `.env`:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the dev server

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for production

```bash
pnpm run build
```

### 6. Preview the production build

```bash
pnpm run preview
```

---

## 🌐 Deployment

This project is deployed on **Vercel** with automatic deployments triggered by every `git push` to `main`.

To deploy your own instance:

1. Import the repository on [vercel.com](https://vercel.com)
2. Add your environment variables in the Vercel dashboard
3. Vercel auto-detects Vite — no extra config needed
4. Every push to `main` triggers a new deploy (typically live in 1–3 minutes)

> The `vercel.json` includes SPA rewrite rules so React Router deep links work correctly.

---

## 🔐 Admin Panel

Visit `/admin` → enter the admin password to access the dashboard.

From the admin panel you can:
- ➕ Add new products manually (name, price, ASIN, image, category, description)
- 🗑️ Delete products (with confirmation)
- 🔄 Restore deleted products or reset catalog to defaults

---

## 📊 Price History — How It Works

The price history for each product is **deterministically generated** from the product's ASIN/ID using a seeded pseudo-random algorithm. This means:

- Each product always shows the same consistent history
- No external price API needed (zero latency, no rate limits)
- History covers the last **365 days**
- The "anchor date" is baked in — prices reflect realistic seasonal patterns

The **Best Time to Buy** verdict is computed from:
- Current price vs. 90-day average
- Current price vs. all-time low
- Recent price trend (rising / falling)
- Percentage above/below historical average

---

## 📜 License

This project is **private** — for personal/commercial use by the repository owner.

---

## 👤 Author

**Dhanush Kumar**
- GitHub: [@Dhanush-kumar-dk](https://github.com/Dhanush-kumar-dk)
- Website: [yearnit.in](https://yearnit.in)

---

<div align="center">
  <sub>Built with ❤️ for Indian shoppers · Powered by Amazon Associates</sub>
</div>
