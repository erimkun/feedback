# 🚀 Flashback Lite

**Üsküdar Yenileniyor** kentsel dönüşüm projesi için geliştirilmiş modern geri bildirim toplama sistemi.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-green)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC)](https://tailwindcss.com/)

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Dokümantasyon](#-dokümantasyon)
- [API](#-api)

---

## ✨ Özellikler

- 🔗 **Tek Kullanımlık Linkler** - Her feedback için benzersiz, güvenli URL
- 📱 **SMS Entegrasyonu** - Otomatik link gönderimi (Posta Güvercini)
- 📊 **Detaylı İstatistikler** - Grafikler, analizler, raporlar
- 📁 **Toplu Yükleme** - Excel dosyasından kişi import
- 🌤️ **Hava Durumu Efektleri** - Dinamik animasyonlar (güneş/yağmur/kar)
- 🔐 **JWT Kimlik Doğrulama** - Güvenli admin paneli
- 📱 **Responsive Tasarım** - Mobile-first yaklaşım

---

## 🛠️ Teknoloji Stack

| Kategori | Teknoloji |
|----------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js Server Actions, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (jose) |
| SMS | Posta Güvercini API |
| Charts | Recharts |
| Animation | GSAP |

---

## 📁 Proje Yapısı

```
flashback-lite/
├── 📄 ARCHITECTURE.md      # Sistem mimarisi dokümantasyonu
├── 📄 README.md            # Bu dosya
├── prisma/                 # Veritabanı şeması ve migration
├── public/                 # Statik dosyalar (logo, görseller)
├── scripts/                # CLI araçları
└── src/
    ├── app/                # Next.js App Router
    │   ├── actions/        # Server Actions
    │   ├── admin/          # Admin paneli
    │   ├── api/            # API routes
    │   └── feedback/       # Feedback sayfaları
    ├── components/         # React bileşenleri
    │   └── admin/          # Admin bileşenleri
    ├── lib/                # Yardımcı modüller
    └── middleware.ts       # Auth middleware
```

> 📚 Her klasörde detaylı `README.md` dosyası bulunmaktadır.

---

## Proje Yapısı ve İşleyiş

Bu proje, kişiye özel geri bildirim linkleri oluşturarak kullanıcı deneyimini puanlamalarını sağlayan bir Next.js uygulamasıdır.

### 1. Kişiler ve Linkler Nasıl Oluşturuluyor?

Kişiler ve onlara özel linkler, terminal üzerinden çalışan bir script yardımıyla oluşturulur.

*   **Komut:** `npm run create-link "Kişi Adı"`
*   **Arka Plan:** Bu komut `scripts/create-link.ts` dosyasını çalıştırır.
*   **İşleyiş:**
    1.  Script, verdiğiniz ismi (`targetName`) alır.
    2.  Benzersiz bir **UUID** (örn: `123e4567-e89b...`) oluşturur.
    3.  Veritabanına (SQLite) yeni bir kayıt ekler: `{ id: UUID, targetName: "Kişi Adı", isUsed: false }`.
    4.  Size bu ID'ye sahip özel bir URL verir: `http://localhost:3000/feedback/[UUID]`

### 2. URL Yapısı

URL'ler isme özel değil, **ID'ye (UUID) özeldir**. Bu sayede linkler tahmin edilemez ve güvenli olur. Ancak veritabanında bu ID, girdiğiniz isimle eşleştirilmiştir. Kullanıcı linki açtığında, sistem bu ID'yi veritabanında arar ve ilgili geri bildirim formunu gösterir.

### 3. Feedbackler Nasıl Tutuluyor?

Veriler yerel bir **SQLite** veritabanında (`prisma/dev.db`) saklanır.

*   **Veri Modeli (`Feedback`):**
    *   `id`: Linkin benzersiz kimliği (UUID).
    *   `targetName`: Geri bildirimin kimin için olduğu.
    *   `rating`: Verilen puan (1-5 arası).
    *   `comment`: (Opsiyonel) Kullanıcı yorumu.
    *   `isUsed`: Linkin kullanılıp kullanılmadığını belirtir (Tek seferlik kullanım için).

Kullanıcı formu doldurup "Gönder" dediğinde:
1.  `submitFeedback` fonksiyonu (Server Action) çalışır.
2.  ID'ye göre kayıt bulunur.
3.  Eğer link daha önce kullanılmamışsa, puan ve yorum veritabanına kaydedilir.
4.  `isUsed` alanı `true` olarak işaretlenir, böylece link tekrar kullanılamaz.

## Kurulum ve Çalıştırma

1.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

2.  Veritabanını hazırlayın:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  Uygulamayı çalıştırın:
    ```bash
    npm run dev
    ```

4.  Yeni bir link oluşturun:
    ```bash
    npm run create-link "Ahmet Yılmaz"
    ```
---

## 📚 Dokümantasyon

Her klasörde detaylı README.md dosyaları bulunmaktadır:

| Dosya | Açıklama |
|-------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Sistem mimarisi ve teknik tasarım |
| [src/README.md](./src/README.md) | Kaynak kod dizini genel bakış |
| [src/app/README.md](./src/app/README.md) | Next.js App Router yapısı |
| [src/app/actions/README.md](./src/app/actions/README.md) | Server Actions dokümantasyonu |
| [src/app/admin/README.md](./src/app/admin/README.md) | Admin paneli yapısı |
| [src/app/feedback/README.md](./src/app/feedback/README.md) | Feedback sayfaları |
| [src/components/README.md](./src/components/README.md) | React bileşenleri |
| [src/components/admin/README.md](./src/components/admin/README.md) | Admin bileşenleri |
| [src/lib/README.md](./src/lib/README.md) | Yardımcı kütüphaneler |
| [prisma/README.md](./prisma/README.md) | Veritabanı şeması |
| [scripts/README.md](./scripts/README.md) | CLI araçları |
| [public/README.md](./public/README.md) | Statik dosyalar |

---

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/flashback"

# Auth
JWT_SECRET="your-secret-key"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password"

# SMS (Posta Güvercini)
SMS_API_USERNAME="username"
SMS_API_PASSWORD="password"
SMS_API_URL="https://api.postaguvercini.com/..."
SMS_TEST_MODE="true"

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---
npx prisma migrate deploy
npx prisma generate
npm run build
npm run start
## 📄 Lisans

© 2026 Üsküdar Yenileniyor - Tüm hakları saklıdır.