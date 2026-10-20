import { Link } from 'react-router'
import { Download, Smartphone } from 'lucide-react'
import { LogoMark } from '@/components/NotebookArt'

const APK_URL = '/downloads/notea-plus.apk'

/** Arkadaşlara gönderilen sayfa: Android APK'sı ve iPhone için ana ekrana ekleme talimatı. */
export function DownloadPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="card-shadow w-full max-w-[30rem] rounded-[24px] bg-white px-6 pt-6 pb-7 text-ink">
        <div className="mb-5 flex items-center gap-2.5">
          <LogoMark className="size-9" />
          <h1 className="text-[1.6rem] [font-weight:800] tracking-[-0.02em] [font-stretch:88%]">NoteA+ indir</h1>
        </div>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-extrabold">Android</h2>
          <a
            href={APK_URL}
            download
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-base font-bold text-white shadow-[0_10px_20px_-10px_rgb(23_17_46/0.8)] transition-[background-color,scale] hover:bg-night active:scale-[0.98]"
          >
            <Download className="size-5" /> APK'yı indir
          </a>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-[0.95rem] font-medium text-ink/80">
            <li>İndirilen <b>notea-plus.apk</b> dosyasına dokun.</li>
            <li>"Bilinmeyen uygulamalar" uyarısı çıkarsa <b>Ayarlar</b>'a gidip tarayıcına izin ver.</li>
            <li><b>Yükle</b>'ye bas. Play Protect uyarırsa "Yine de yükle"yi seç.</li>
          </ol>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold">
            <Smartphone className="size-5" /> iPhone / iPad
          </h2>
          <p className="text-[0.95rem] font-medium text-ink/80">
            Bu sayfayı <b>Safari</b>'de aç, <b>Paylaş</b> düğmesine ve ardından <b>Ana Ekrana Ekle</b>'ye dokun. Uygulama gibi açılır.
          </p>
        </section>

        <p className="text-[0.95rem] font-medium text-ink/80">
          Bilgisayarda doğrudan tarayıcıdan kullanabilirsin:{' '}
          <Link to="/login" className="font-extrabold text-ink underline decoration-2 underline-offset-4">
            giriş yap
          </Link>
          . Aynı hesapla girdiğin her cihazda notların aynı.
        </p>
      </div>
    </div>
  )
}
