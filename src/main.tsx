import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

// Enhanced service worker registration with proper logging and error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext;

    if (!isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.warn('⚠️ PWA requires HTTPS. Service worker will not be registered.');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Service Worker update found');

          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ New content available, please refresh');
              // You can show a notification to the user here
            }
          });
        });

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);

        // Provide helpful error messages
        if (error.message.includes('network')) {
          console.error('Network error - check your internet connection');
        } else if (error.message.includes('script')) {
          console.error('Could not find /sw.js - ensure the file exists');
        }
      });
  });
}

// Log PWA installation capability
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('📱 PWA installation available');
  // You can save this event to show a custom install button later
  // e.preventDefault();
  // window.deferredPrompt = e;
});

// Log when app is installed
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
});
