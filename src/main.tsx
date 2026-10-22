import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { App as CapApp } from '@capacitor/app'
import App from './App.tsx'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { isNative } from '@/lib/supabase'

if (isNative) {
  // Android geri tuşu: önce uygulama içinde geri git, en baştaysa uygulamadan çık
  void CapApp.addListener('backButton', ({ canGoBack }) => (canGoBack ? history.back() : void CapApp.exitApp()))
} else if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Yeni sürüm devraldığında sayfayı yenile; not düzenlenirken değil, sekme bir dahaki gizlenişinde
  const hadController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return
    const editing = () => document.querySelector('[role=dialog]') || document.activeElement?.matches('input, textarea')
    if (!editing()) return location.reload()
    document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && location.reload())
  })
  void navigator.serviceWorker.register('/sw.js')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider delayDuration={400}>
          <App />
          <Toaster position="bottom-left" />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
