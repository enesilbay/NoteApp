# NoteA+

Google Keep'in yerine geçecek, web, telefon ve tablette çalışan, tek hesapla senkronize not uygulaması.
Yol haritası için [ROADMAP.md](ROADMAP.md) dosyasına bakın.

**Teknolojiler:** React 19 + TypeScript + Vite (PWA) · Tailwind CSS 4 + shadcn/ui · Supabase (Auth, Postgres, Realtime)

## Hızlı başlangıç

```bash
npm install
npm run dev
```

`.env` dosyası yoksa uygulama **demo modunda** açılır: giriş istenmez, notlar yalnızca o tarayıcının
`localStorage`'ında saklanır. Arayüzü denemek için yeterlidir.

## Supabase kurulumu (hesap + senkron)

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir proje oluşturun.
2. **SQL Editor**'de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) dosyasının içeriğini çalıştırın.
   Tablolar, Row Level Security kuralları ve realtime yayını oluşturulur.
3. **Project Settings → API** sayfasından URL ve `anon` anahtarını alın, `.env.example`'ı `.env` olarak kopyalayıp doldurun:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. **Authentication → URL Configuration**: *Site URL* olarak `http://localhost:5173` (yayında gerçek alan adı) girin.
5. *(İsteğe bağlı)* Google ile giriş: **Authentication → Providers → Google**'ı açın; Google Cloud Console'da
   OAuth istemcisi oluşturup yönlendirme adresi olarak `https://xxxx.supabase.co/auth/v1/callback` ekleyin.

Sunucuyu yeniden başlatın (`npm run dev`); giriş ekranı gelir.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (http://localhost:5173) |
| `npm run build` | Tip kontrolü + üretim derlemesi (`dist/`) |
| `npm run preview` | Derlenmiş uygulamayı yerelde sunar (PWA/service worker testi için) |
| `npm run lint` | oxlint |
| `npm test` | Birim testleri (vitest) |
| `npm run deploy` | Derler ve Cloudflare Pages'e yükler (önce `npx wrangler login`) |

Telefonda/tablette denemek için: `npm run dev -- --host`, ardından aynı Wi-Fi'deki cihazdan bilgisayarın IP adresine gidin.

## Proje yapısı

```
src/
  components/      Uygulama bileşenleri (AppShell, NoteCard, NoteEditor, …)
  components/ui/   shadcn/ui bileşenleri (npx shadcn add <ad> ile eklenir)
  lib/             Supabase istemcisi, not deposu (Supabase + demo/yerel), context'ler, tipler
  pages/           Sayfalar (giriş, notlar/arşiv/çöp)
supabase/migrations/  Veritabanı şeması
```

Not verisine tüm erişim `src/lib/notes-repo.ts` içindeki `NotesRepo` arayüzü üzerinden yapılır; Faz 6'daki
offline/IndexedDB katmanı buraya yeni bir uygulama olarak eklenecek.

## Katkı

- Dal açın, değişikliği yapın, `npm run lint && npm run build` temiz geçsin, PR açın.
- CI (GitHub Actions) her push ve PR'da lint + build çalıştırır.
