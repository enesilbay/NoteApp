# NoteA+ Roadmap

Google Keep'in yerine geçecek, web + telefon + tablette çalışan, tek hesapla senkronize not uygulaması.

## Hedef Özellikler

- Web, telefon ve tablette kullanım; aynı hesapla giriş, notlar her cihazda
- Not kaydetme, silme, arşivleme, sabitleme (pin)
- Notlara şifre koyma (kilitli notlar)
- Yazı ile ve el yazısı/çizim ile not alma (mouse / parmak / kalem)
- Onay kutucuklu (checklist) notlar
- Kategori / etiket, isimlendirme, proje klasörleri
- Nota görsel ekleme
- İsme ve kategoriye göre arama + filtreleme
- Uygulama içi hesap makinesi

## Önerilen Teknoloji Yığını

Tek kod tabanıyla üç platform hedeflendiği için **PWA-öncelikli** yaklaşım önerilir.

| Katman | Öneri | Neden |
|---|---|---|
| Frontend | React + TypeScript + Vite (PWA) | Web, telefon ve tabletin tamamı tek kod tabanı; ana ekrana eklenebilir |
| Mobil paketleme (sonra) | Capacitor | Aynı koddan Android/iOS uygulaması, mağazaya çıkış |
| Stil | Tailwind CSS + shadcn/ui | Responsive (telefon/tablet/masaüstü) hızlı geliştirme |
| Backend + Auth + DB | Supabase (Postgres, Auth, Storage, Realtime) | Hesap, senkron, görsel depolama ve gerçek zamanlı güncelleme hazır gelir |
| Çizim | Canvas + Pointer Events (`perfect-freehand`) | Mouse, parmak ve kalem tek API ile desteklenir |
| Offline | IndexedDB (Dexie) + senkron kuyruğu | İnternetsiz kullanım, sonra senkron |
| Şifreleme | Web Crypto API (AES-GCM + PBKDF2) | Kilitli notlar cihazda şifrelenir |

> Alternatif: Flutter (tek kod, native performans) veya React Native + ayrı web. Çizim ve web desteği için PWA + Capacitor daha basit olduğu için önerildi.

---

## Faz 0 — Hazırlık (1 hafta)

- [x] Teknoloji kararının netleşmesi
- [x] Repo yapısı, lint/format, TypeScript, CI (GitHub Actions)
- [ ] Tasarım: renk paleti, tipografi, telefon/tablet/masaüstü wireframe'leri
- [x] Veri modeli taslağı (aşağıda)
- [x] README ve katkı rehberi

## Faz 1 — MVP: Hesap + Temel Notlar (2–3 hafta)

- [ ] Kayıt / giriş / çıkış (e-posta + şifre, Google ile giriş) — kod hazır, Supabase projesiyle doğrulanacak
- [x] Not oluştur / düzenle / sil (çöp kutusu, geri alma)
- [x] Başlık + metin içeriği, otomatik kaydetme
- [x] Not listesi (grid/liste görünümü), responsive yerleşim
- [x] Notları sabitleme (pin)
- [x] Arşivleme + arşiv ekranı
- [ ] Bulut senkronizasyonu (tüm cihazlarda aynı notlar) — kod hazır (Supabase Realtime), doğrulanacak
- [x] PWA kurulumu (ana ekrana ekle)

**Çıkış kriteri:** Telefonda yazdığım not web'de ve tablette görünüyor.

## Faz 2 — Düzenleme ve Organizasyon (2 hafta)

- [ ] Onay kutucuklu (checklist) notlar; işaretlenenleri alta indir
- [ ] Kategoriler / etiketler (oluştur, yeniden adlandır, renk ata)
- [ ] Proje klasörleri (notları klasöre taşı, iç içe klasör opsiyonel)
- [x] Not renkleri (8 kapak rengi, renk seçici)
- [ ] Arama (başlık + içerik) ve filtreleme (kategori, klasör, sabitli, arşiv, checklist)
- [ ] Sürükle-bırak ile sıralama

## Faz 3 — Görsel ve El Yazısı (2–3 hafta)

- [ ] Nota görsel ekleme (galeriden, kameradan, yapıştırma, sürükle-bırak)
- [ ] Görsel sıkıştırma/yeniden boyutlandırma + bulut depolama
- [ ] Çizim/el yazısı modu: mouse (web), parmak (telefon), kalem veya parmak (tablet)
- [ ] Kalem kalınlığı, renk, silgi, geri al / yinele
- [ ] Palm rejection (tablette avuç içini yoksayma, `pointerType === "pen"` önceliği)
- [ ] Çizimin nota gömülmesi (SVG/PNG olarak saklama)

## Faz 4 — Güvenlik: Şifreli Notlar (1–2 hafta)

- [ ] Not başına şifre/PIN koyma
- [ ] İçeriğin cihazda şifrelenmesi (uçtan uca, sunucu içeriği göremez)
- [ ] Kilitli notlarda önizleme gizleme, aramada hariç tutma
- [ ] Biyometrik kilit açma (Capacitor ile mobilde)
- [ ] Şifre unutma uyarısı (kurtarma yok → kullanıcıyı bilgilendir)

## Faz 5 — Hesap Makinesi (1 hafta)

- [ ] Temel hesap makinesi (+ − × ÷, %, parantez)
- [ ] Not içinden açılabilir panel / ayrı ekran
- [ ] Sonucu nota ekleme
- [ ] Hesap geçmişi
- [ ] (Opsiyonel) Bilimsel mod

## Faz 6 — Offline, Performans ve Cilalama (2 hafta)

- [ ] Offline çalışma + çakışma çözümü (son değişiklik kazanır / birleştirme)
- [ ] Gerçek zamanlı senkron (bir cihazda yazılan diğerinde anında görünür)
- [ ] Koyu tema
- [ ] Klavye kısayolları (web)
- [ ] Erişilebilirlik, çoklu dil (TR/EN)
- [ ] Veri dışa aktarma (JSON/Markdown) ve Google Keep'ten içe aktarma (Google Takeout)

## Faz 7 — Yayın (1–2 hafta)

- [ ] Capacitor ile Android/iOS paketleme
- [ ] Web'in canlıya alınması (Vercel/Netlify/Cloudflare)
- [ ] Hata izleme (Sentry), temel analitik
- [ ] Yedekleme stratejisi, gizlilik politikası
- [ ] Kapalı beta testi → mağaza yayını

## Faz 8 — Gelecek Fikirleri (backlog)

- Hatırlatıcılar ve bildirimler
- Notları başkalarıyla paylaşma / ortak düzenleme
- Ses notu ve sesten yazıya çevirme
- Görselden metin çıkarma (OCR)
- Widget'lar (Android/iOS)
- Not şablonları
- Sürüm geçmişi

---

## Veri Modeli Taslağı

```
users            (id, email, created_at)
folders          (id, user_id, name, color, parent_id, created_at)
categories       (id, user_id, name, color)
notes            (id, user_id, folder_id, title, type[text|checklist|drawing],
                  content, is_pinned, is_archived, is_locked, color,
                  deleted_at, created_at, updated_at)
note_categories  (note_id, category_id)
checklist_items  (id, note_id, text, is_checked, position)
attachments      (id, note_id, kind[image|drawing], storage_path, created_at)
```

## Önerilen Çalışma Sırası

Önce **Faz 1** ile dikey bir dilim çıkarın (giriş → not yaz → diğer cihazda gör). Bu, mimariyi doğrular. Sonrasında özellikler bağımsız fazlar olarak eklenir; el yazısı (Faz 3) en riskli parça olduğu için Faz 2'den hemen sonra ele alınması önerilir.

## Toplam Tahmini Süre

Tek kişi, yarı zamanlı: yaklaşık **3–5 ay**. Faz 1–2 ile kullanılabilir bir ilk sürüm ~1 ay içinde çıkarılabilir.
