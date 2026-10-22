import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Kayıt main.tsx'te yapılır: Android uygulamasında service worker'a gerek yok
      injectRegister: false,
      // injectRegister kapalıyken autoUpdate bunları kendisi eklemiyor: yeni sürüm sonsuza dek "bekliyor"da kalıyordu
      workbox: { skipWaiting: true, clientsClaim: true },
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'NoteA+',
        short_name: 'NoteA+',
        description: 'Tüm cihazlarınızda senkronize notlar',
        lang: 'tr',
        theme_color: '#17112e',
        background_color: '#f5f3fc',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  // Port sabit: Supabase'deki Site/Redirect URL'leri 5173'e göre ayarlı, port kayarsa giriş yönlendirmesi bozulur.
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
