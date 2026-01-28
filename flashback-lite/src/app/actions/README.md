# 📁 actions/ - Server Actions

Bu dizin, Next.js Server Actions kullanarak backend işlemlerini gerçekleştiren modülleri içerir.

---

## 📂 Dosya Yapısı

```
actions/
├── admin.ts    # Admin panel işlemleri
└── auth.ts     # Kimlik doğrulama işlemleri
```

---

## 🔐 auth.ts - Kimlik Doğrulama

JWT tabanlı authentication sistemi.

### Fonksiyonlar

#### `login(prevState, formData)`
Kullanıcı girişi yapar.

```typescript
// Kullanım
const [state, action] = useActionState(login, initialState);

// Dönen değer
{ success: boolean; error?: string }
```

**Akış:**
1. Form'dan username/password al
2. Environment variable ile karşılaştır
3. JWT token oluştur (2 saat geçerli)
4. HTTP-only cookie'ye yaz
5. `/admin`'e yönlendir

#### `logout()`
Oturumu sonlandırır.

```typescript
// Kullanım
await logout();
```

**İşlem:** `admin_token` cookie'sini siler.

### Güvenlik Özellikleri
- HS256 algoritması
- HTTP-only cookies
- Secure flag (production)
- 2 saatlik token ömrü

---

## 👨‍💼 admin.ts - Admin İşlemleri

Admin paneli için CRUD ve istatistik işlemleri.

### İstatistik Fonksiyonları

#### `getFeedbackStats()`
Genel istatistikleri döner.

```typescript
// Dönen değer
{
  total: number;      // Toplam link sayısı
  used: number;       // Kullanılan link sayısı
  averageRating: string; // Ortalama puan
}
```

#### `getAdvancedStats(startDate?, endDate?, office?)`
Filtrelenebilir detaylı istatistikler.

```typescript
// Dönen değer
{
  total: number;
  used: number;
  averageRating: number;
  positiveCount: number;     // 4-5 puan
  negativeCount: number;     // 1-2 puan
  neutralCount: number;      // 3 puan
  officeStats: Array<{...}>; // Ofis bazlı
  timeSeriesData: Array<{...}>; // Zaman serisi
}
```

#### `getOfficeList()`
Mevcut ofis listesini döner.

---

### CRUD Fonksiyonları

#### `getRecentFeedback()`
Son 50 feedback'i döner.

```typescript
// Dönen değer
Array<{
  id: string;
  targetName: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
}>
```

#### `createFeedbackLink(targetName, phoneNumber?, office?)`
Yeni feedback linki oluşturur.

```typescript
// Dönen değer
{
  success?: boolean;
  link?: string;
  smsSent?: boolean;
  smsError?: string;
  error?: string;
}
```

**Akış:**
1. nanoid ile benzersiz ID üret
2. Veritabanına kaydet
3. SMS gönder (opsiyonel)
4. Link'i döndür

#### `deleteFeedback(id)`
Feedback kaydını siler.

#### `createBulkFeedbackLinks(contacts)`
Toplu link oluşturma ve SMS gönderimi.

```typescript
// Girdi
Array<{
  name: string;
  phone: string;
  office?: string;
}>

// Çıktı
Array<{
  name: string;
  phone: string;
  success: boolean;
  link?: string;
  error?: string;
}>
```

---

## 🔄 Revalidation

Veri değişikliklerinden sonra cache yenileme:

```typescript
revalidatePath("/admin");
```

---

## 📝 Kullanım Örneği

```tsx
"use client";

import { createFeedbackLink } from "@/app/actions/admin";

const handleSubmit = async (formData: FormData) => {
  const result = await createFeedbackLink(
    formData.get("name") as string,
    formData.get("phone") as string,
    formData.get("office") as string
  );
  
  if (result.success) {
    console.log("Link:", result.link);
  }
};
```
