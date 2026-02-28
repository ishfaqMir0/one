import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' //

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({ //
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Prevents Service Worker from intercepting auth redirects
        navigateFallbackDenylist: [/^\/auth/, /^https:\/\/.*\.supabase\.co/], 
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'AppleKul One',
        short_name: 'AppleKul',
        description: 'Apple orchard management platform',
        theme_color: '#ffffff',
        display: 'standalone', // Makes it feel like an app
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})