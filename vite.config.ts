import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Content-Security-Policy-Report-Only':
    "default-src 'self'; script-src 'self' 'sha256-YWRBXjWV5MTAmox1+cTv1FVyTmTRts0OmHXo4Tv9z+Y=' 'sha256-ULZ/Aj7MaTYgeBqkgy+CjeFbGVSR7hbtVID0Gg4x4U0=' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://connect.facebook.net https://*.clarity.ms https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https://m.media-amazon.com https://images-eu.ssl-images-amazon.com https://images.unsplash.com https://*.google-analytics.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.facebook.com https://*.facebook.com https://c.clarity.ms https://lh3.googleusercontent.com; connect-src 'self' https://zxwfwtagcqwwevnuqber.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://*.googleapis.com https://*.clarity.ms https://c.clarity.ms https://e.clarity.ms https://vitals.vercel-insights.com https://www.facebook.com https://api.allorigins.win https://r.jina.ai; frame-src 'self' https://www.googletagmanager.com https://drop-e7d21.firebaseapp.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none';",
};

// Inject Meta Pixel <noscript> inside <head> after Vite's parse5 HTML pass
const metaPixelHeadNoscriptPlugin = () => ({
  name: 'meta-pixel-head-noscript',
  transformIndexHtml: {
    order: 'post' as const,
    handler(html: string) {
      return html.replace(
        '<!-- Meta Pixel Noscript -->',
        '<noscript><img height="1" width="1" style="display:none"\nsrc="https://www.facebook.com/tr?id=1154456314006792&ev=PageView&noscript=1"\n/></noscript>'
      );
    },
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), metaPixelHeadNoscriptPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    open: false,
    headers: SECURITY_HEADERS,
  },
  preview: {
    host: '0.0.0.0',
    port: 3001,
    headers: SECURITY_HEADERS,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
          'vendor-ui': ['@heroicons/react', 'framer-motion'],
        },
      },
    },
  },
});
