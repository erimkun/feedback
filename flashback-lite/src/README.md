# 📁 src/ - Kaynak Kod Dizini

Bu dizin, Flashback-Lite uygulamasının tüm kaynak kodlarını içerir.

## 📂 Dizin Yapısı

```
src/
├── app/                 # Next.js App Router - Sayfalar ve API
├── components/          # Yeniden kullanılabilir React bileşenleri
├── lib/                 # Yardımcı fonksiyonlar ve servisler
└── middleware.ts        # Request/Response middleware
```

---

## 🗂️ Alt Dizinler

### `/app`
Next.js 13+ App Router yapısı. Tüm sayfalar, layout'lar ve server action'lar burada.
- **Dosya tabanlı routing**
- **Server Components** varsayılan
- **Nested Layouts** desteği

### `/components`
React bileşenleri. İki ana kategori:
- **Genel bileşenler**: FeedbackForm, WeatherEffect vb.
- **Admin bileşenleri**: /admin alt klasöründe

### `/lib`
Paylaşılan yardımcı modüller:
- Prisma client
- SMS servisi
- Telefon validasyonu
- Hava durumu API

---

## 🔧 middleware.ts

Admin rotalarını koruyan authentication middleware.

```typescript
// Korunan rotalar
/admin/*       → JWT doğrulaması gerekli
/admin/login   → Açık erişim (giriş sayfası)
```

### Çalışma Prensibi
1. İstek `/admin` ile başlıyorsa kontrol et
2. Cookie'den `admin_token` al
3. JWT doğrulaması yap
4. Geçersizse `/admin/login`'e yönlendir

---

## 🎨 Stil Yaklaşımı

- **Tailwind CSS 4** - Utility-first CSS
- **globals.css** - Global stiller ve animasyonlar
- **Inline styles** - Dinamik stiller için

---

## 📝 Kod Standartları

1. **TypeScript** - Tam tip güvenliği
2. **ESLint** - Kod kalitesi
3. **Server/Client Components** - Açık ayrım (`"use client"`)
4. **Server Actions** - Form işlemleri için `"use server"`
