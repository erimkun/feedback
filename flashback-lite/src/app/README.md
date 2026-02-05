# 📁 app/ - Next.js App Router

Bu dizin, Next.js 16 App Router yapısını kullanarak uygulamanın tüm sayfalarını ve API endpoint'lerini içerir.

---

## 📂 Dizin Yapısı

```
app/
├── layout.tsx           # Root layout (HTML, metadata)
├── page.tsx             # Ana sayfa (/)
├── globals.css          # Global CSS stilleri
├── actions.ts           # Feedback server action'ları
├── actions/             # Server action'lar
│   ├── admin.ts         # Admin işlemleri
│   └── auth.ts          # Kimlik doğrulama
├── admin/               # Admin paneli (/admin)
│   ├── layout.tsx       # Admin layout
│   ├── page.tsx         # Dashboard sayfası
│   └── login/           # Giriş sayfası
├── api/                 # API route'ları
│   └── weather/         # Hava durumu API
└── feedback/            # Feedback sayfaları
    └── [id]/            # Dinamik feedback formu
        ├── page.tsx     # Form sayfası
        └── not-found.tsx # 404 sayfası
```

---

## 🏠 Ana Sayfa (page.tsx)

**Route:** `/`

Uygulamanın landing sayfası. Üsküdar Yenileniyor logosunu ve hava durumuna göre dinamik efektleri gösterir.

### Özellikler
- Hava durumu bazlı animasyonlar (güneş/yağmur/kar)
- Parçacık efektleri (GSAP)
- Responsive tasarım

---

## 🔗 Feedback Sayfası (feedback/[id])

**Route:** `/feedback/:id`

Dinamik URL parametresi ile çalışan feedback formu.

### Durumlar
| Durum | Görüntü |
|-------|---------|
| Geçerli link | Feedback formu |
| Kullanılmış link | "Bu link kullanılmış" mesajı |
| Bulunamadı | 404 sayfası |

### Akış
1. URL'den ID al
2. Veritabanında kontrol et
3. `is_used` durumuna göre form veya mesaj göster

---

## 👨‍💼 Admin Paneli (admin/)

**Route:** `/admin/*`

Yönetici paneli. JWT ile korunan rotalar.

### Sayfalar
| Sayfa | Route | Açıklama |
|-------|-------|----------|
| Login | `/admin/login` | Giriş formu |
| Dashboard | `/admin` | Ana panel |

### Layout Özellikleri
- Header ile logout butonu
- Responsive sidebar
- Korumalı rotalar (middleware)

---

## ⚡ Server Actions

### actions.ts
```typescript
// Kullanıcı feedback'i
submitFeedback(id, rating, comment)
```

### actions/admin.ts
```typescript
// Admin işlemleri
getFeedbackStats()        // İstatistikler
getRecentFeedback()       // Son feedback'ler
createFeedbackLink()      // Yeni link oluştur
deleteFeedback()          // Feedback sil
createBulkFeedbackLinks() // Toplu link oluştur
getAdvancedStats()        // Detaylı istatistikler
```

### actions/auth.ts
```typescript
// Kimlik doğrulama
login(formData)           // Giriş yap
logout()                  // Çıkış yap
```

---

## 🎨 globals.css

Global stiller ve animasyonlar:
- Tailwind CSS imports
- Özel animasyonlar (kar, yağmur, kelebek)
- Dark mode override (sadece light mode)
- Safe area padding (mobile)

---

## 📊 Metadata (layout.tsx)

```typescript
export const metadata: Metadata = {
  title: "Üsküdar Yenileniyor - Geri Bildirim",
  description: "Deneyiminizi değerlendirin",
  icons: { icon: '/SmallLogo.png' },
};
```

### Viewport Ayarları
- Mobile-first responsive
- User scaling disabled
- iOS safe area support
