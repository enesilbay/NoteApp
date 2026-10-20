import { Capacitor } from '@capacitor/core'
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Ortam değişkenleri yoksa `null`: uygulama demo (yalnızca yerel) modunda çalışır. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isDemoMode = supabase === null

/** Android uygulaması (Capacitor) içinde mi çalışıyoruz? */
export const isNative = Capacitor.isNativePlatform()

/**
 * E-posta bağlantılarının (onay, şifre sıfırlama) açılacağı web adresi. Uygulamanın içi `https://localhost`
 * olduğundan mobilde yayındaki site adresi kullanılır.
 */
export const siteUrl = isNative ? ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '') : window.location.origin

/** Google girişinden sonra Android uygulamasına geri dönülen adres (AndroidManifest'teki şemayla aynı). */
export const NATIVE_AUTH_CALLBACK = 'com.enesilbay.noteaplus://auth/callback'
