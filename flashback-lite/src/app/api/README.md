# 📁 api/ - API Route Handlers

Bu dizin, Next.js API route handler'larını içerir.

---

## 📂 Dizin Yapısı

```
api/
└── weather/           # Hava durumu API (boş/kullanılmıyor)
```

---

## 📝 Notlar

### Mevcut Durum
`weather/` klasörü şu anda boş durumdadır. Hava durumu işlemleri doğrudan `lib/weather.ts` modülünde Server Component içinde yapılmaktadır.

### Next.js 13+ Route Handlers

API route'ları oluşturmak için:

```typescript
// api/example/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

---

## 🔄 Alternatif: Server Actions

Bu projede API route'ları yerine ağırlıklı olarak **Server Actions** kullanılmaktadır:

| Yaklaşım | Kullanım Yeri |
|----------|---------------|
| Server Actions | Form işlemleri, CRUD operasyonları |
| API Routes | Harici servis entegrasyonları (gerektiğinde) |

### Server Actions Avantajları
- Form ile doğrudan entegrasyon
- Otomatik tip güvenliği
- Daha az boilerplate kod
- Revalidation desteği

---

## 🌐 Potansiyel Kullanım Alanları

İleride eklenebilecek API endpoint'leri:

```
api/
├── webhook/
│   └── sms/route.ts      # SMS delivery callback
├── export/
│   └── route.ts          # CSV/Excel export
└── health/
    └── route.ts          # Health check endpoint
```
