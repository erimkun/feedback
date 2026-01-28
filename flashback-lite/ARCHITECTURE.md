# 🏗️ Flashback-Lite Sistem Mimarisi

## Proje Genel Bakış

**Flashback-Lite**, Üsküdar Belediyesi kentsel dönüşüm projesi için geliştirilmiş bir **geri bildirim toplama sistemidir**. Next.js 16 ile geliştirilmiş modern bir full-stack web uygulamasıdır.

---

## 📊 Sistem Mimarisi Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FLASHBACK-LITE                                     │
│                     Geri Bildirim Toplama Sistemi                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                 │
│  │   Frontend   │     │   Backend    │     │   Database   │                 │
│  │  (Next.js)   │◄───►│ (Server Act) │◄───►│ (PostgreSQL) │                 │
│  └──────────────┘     └──────────────┘     └──────────────┘                 │
│         │                    │                                               │
│         │                    │         ┌──────────────┐                     │
│         │                    └────────►│   SMS API    │                     │
│         │                              │(PostaGüverci)│                     │
│         │                              └──────────────┘                     │
│         │                                                                    │
│         │              ┌──────────────┐                                     │
│         └─────────────►│  Weather API │                                     │
│                        │ (Open-Meteo) │                                     │
│                        └──────────────┘                                     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧱 Katmanlı Mimari

### 1. Sunum Katmanı (Presentation Layer)
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Ana sayfa (Landing)
│   ├── layout.tsx         # Root layout
│   ├── feedback/[id]/     # Dinamik feedback sayfası
│   └── admin/             # Admin paneli
└── components/            # React bileşenleri
    ├── FeedbackForm.tsx   # Kullanıcı formu
    ├── WeatherEffect.tsx  # Hava durumu efektleri
    └── admin/             # Admin bileşenleri
```

### 2. İş Mantığı Katmanı (Business Logic Layer)
```
src/app/
├── actions.ts             # Feedback işlemleri
└── actions/
    ├── admin.ts           # Admin işlemleri (CRUD, istatistik)
    └── auth.ts            # Kimlik doğrulama
```

### 3. Veri Erişim Katmanı (Data Access Layer)
```
src/lib/
├── prisma.ts              # Prisma client singleton
├── sms.ts                 # SMS servisi
├── phone.ts               # Telefon validasyonu
└── weather.ts             # Hava durumu API

prisma/
├── schema.prisma          # Veritabanı şeması
└── migrations/            # Migration dosyaları
```

---

## 🔄 Veri Akışı

### Feedback Toplama Akışı
```
1. Admin → Link Oluştur → Benzersiz ID üret
         ↓
2. SMS Gönder (opsiyonel) → Kullanıcıya link gönder
         ↓
3. Kullanıcı → Linke tıkla → Feedback form aç
         ↓
4. Kullanıcı → Puan + Yorum → Veritabanına kaydet
         ↓
5. Link → "Kullanıldı" olarak işaretle
```

### Kimlik Doğrulama Akışı
```
1. Admin → Login sayfası → Kullanıcı/Şifre gir
         ↓
2. Sunucu → Doğrula → JWT token üret
         ↓
3. Token → HTTP-only Cookie'ye yaz
         ↓
4. Middleware → Her istekte token doğrula
```

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji | Versiyon | Açıklama |
|--------|-----------|----------|----------|
| **Frontend** | Next.js | 16.1.2 | React framework |
| **UI** | Tailwind CSS | 4.x | Utility-first CSS |
| **State** | React Hooks | 19.x | State yönetimi |
| **Animasyon** | GSAP | 3.14.2 | Parçacık efektleri |
| **Grafikler** | Recharts | 3.7.0 | İstatistik grafikleri |
| **Backend** | Server Actions | - | API katmanı |
| **ORM** | Prisma | 5.22.0 | Veritabanı ORM |
| **Database** | PostgreSQL | - | İlişkisel DB |
| **Auth** | Jose (JWT) | 6.1.3 | Token yönetimi |
| **SMS** | Posta Güvercini | - | SMS gateway |

---

## 🔐 Güvenlik Mimarisi

### Authentication
- JWT tabanlı token sistemi
- HTTP-only secure cookies
- 2 saatlik token geçerliliği

### Middleware Koruması
```typescript
// Korunan rotalar
/admin/*  → JWT doğrulaması gerekli
/admin/login → Açık erişim
```

### Veri Güvenliği
- Tek kullanımlık feedback linkleri
- UUID tabanlı link ID'leri
- SQL injection koruması (Prisma ORM)

---

## 📁 Klasör Yapısı Özeti

```
flashback-lite/
├── prisma/                 # Veritabanı şeması ve migration'lar
├── public/                 # Statik dosyalar (logo, görseller)
├── scripts/                # CLI araçları
└── src/
    ├── app/                # Next.js App Router (sayfalar + API)
    │   ├── actions/        # Server Actions
    │   ├── admin/          # Admin paneli sayfaları
    │   ├── api/            # API route'ları
    │   └── feedback/       # Feedback sayfaları
    ├── components/         # React bileşenleri
    │   └── admin/          # Admin-specific bileşenler
    ├── lib/                # Yardımcı kütüphaneler
    └── middleware.ts       # Auth middleware
```

---

## 🌐 Entegrasyonlar

### 1. SMS Servisi (Posta Güvercini)
- Otomatik link gönderimi
- Template tabanlı mesajlar
- Test modu desteği

### 2. Hava Durumu API (Open-Meteo)
- Üsküdar koordinatları ile canlı hava durumu
- 1 saatlik cache
- Görsel efekt tetikleme (güneş/yağmur/kar)

### 3. Excel Import (xlsx)
- Toplu kişi yükleme
- Otomatik format doğrulama
- Batch SMS gönderimi

---

## 📈 Performans Optimizasyonları

1. **Prisma Singleton** - Tek client instance
2. **Image Optimization** - Next.js Image component
3. **Font Preload** - Google Fonts optimizasyonu
4. **Caching** - API yanıtları için cache
5. **Code Splitting** - Otomatik chunk'lama

---

## 🚀 Deployment

```bash
# Build komutu
prisma generate && prisma db push && next build

# Production başlatma
next start
```

### Gerekli Environment Variables
```
DATABASE_URL          # PostgreSQL bağlantı URL'i
JWT_SECRET            # JWT imzalama anahtarı
ADMIN_USERNAME        # Admin kullanıcı adı
ADMIN_PASSWORD        # Admin şifresi
SMS_API_USERNAME      # SMS API kullanıcı adı
SMS_API_PASSWORD      # SMS API şifresi
SMS_API_URL           # SMS API endpoint
NEXT_PUBLIC_BASE_URL  # Uygulama base URL
```
