# 📁 lib/ - Yardımcı Kütüphaneler

Bu dizin, uygulama genelinde paylaşılan yardımcı fonksiyonları ve servis modüllerini içerir.

---

## 📂 Dizin Yapısı

```
lib/
├── prisma.ts    # Prisma client singleton
├── sms.ts       # SMS gönderim servisi
├── phone.ts     # Telefon numarası validasyonu
└── weather.ts   # Hava durumu API
```

---

## 🗄️ prisma.ts - Veritabanı Bağlantısı

Prisma Client singleton pattern implementasyonu.

```typescript
// Kullanım
import { prisma } from "@/lib/prisma";

const feedback = await prisma.feedback.findUnique({
  where: { id }
});
```

### Neden Singleton?
- Development'ta hot-reload sırasında çoklu bağlantı önleme
- Connection pooling optimizasyonu
- Tek client instance ile memory tasarrufu

### Pattern
```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") 
  globalForPrisma.prisma = prisma;
```

---

## 📱 phone.ts - Telefon Validasyonu

Türk telefon numarası formatlama ve validasyon.

### Fonksiyonlar

#### `formatPhoneNumber(phone: string): string | null`
Telefon numarasını API formatına dönüştürür.

**Desteklenen Formatlar:**
| Girdi | Çıktı |
|-------|-------|
| 5XX XXX XX XX | 905XXXXXXXXX |
| 05XX XXX XX XX | 905XXXXXXXXX |
| 90 5XX XXX XX XX | 905XXXXXXXXX |
| +90 5XX XXX XX XX | 905XXXXXXXXX |

#### `isValidPhoneNumber(phone: string): boolean`
Telefon numarasının geçerli olup olmadığını kontrol eder.

```typescript
// Kullanım
import { isValidPhoneNumber } from "@/lib/phone";

if (isValidPhoneNumber("05321234567")) {
  // Geçerli numara
}
```

---

## 📨 sms.ts - SMS Servisi

Posta Güvercini API entegrasyonu.

### Fonksiyonlar

#### `sendSMS(phoneNumber, feedbackLink, targetName, office?)`

**Parametreler:**
| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| phoneNumber | string | Hedef telefon |
| feedbackLink | string | Feedback URL |
| targetName | string | Kişi adı |
| office | string? | Ofis adı (opsiyonel) |

**Dönen Değer:**
```typescript
interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
}
```

### Konfigürasyon (Environment Variables)
```env
SMS_API_USERNAME     # API kullanıcı adı
SMS_API_PASSWORD     # API şifresi
SMS_API_URL          # API endpoint
SMS_TEST_MODE        # "true" ise SMS göndermez
SMS_MESSAGE_TEMPLATE # Mesaj şablonu
```

### Mesaj Şablonu
```
Sayın {name}, Üsküdar Yenileniyor kapsamında{office} almış olduğunuz hizmeti değerlendirmek için lütfen linke tıklayınız. {link}
```

### Test Modu
`SMS_TEST_MODE=true` ayarlandığında:
- Gerçek SMS gönderilmez
- Console'a log yazılır
- Development için ideal

---

## 🌤️ weather.ts - Hava Durumu API

Open-Meteo API ile Üsküdar hava durumu.

### Fonksiyonlar

#### `getWeather(): Promise<WeatherType>`

**Dönen Değerler:**
```typescript
type WeatherType = 'sun' | 'rain' | 'snow';
```

**WMO Kod Mapping:**
| Kod Aralığı | Hava Durumu |
|-------------|-------------|
| 0-3 | sun (güneşli/bulutlu) |
| 51-67 | rain (yağmur) |
| 71-77, 85-86 | snow (kar) |
| 80-82 | rain (sağanak) |
| 95+ | rain (fırtına) |

### Konfigürasyon
- **Koordinatlar:** 41.0264° N, 29.0156° E (Üsküdar)
- **Cache:** 1 saat (next.js revalidate)

### Kullanım
```typescript
import { getWeather } from "@/lib/weather";

const weather = await getWeather(); // 'sun' | 'rain' | 'snow'
```

### Hata Yönetimi
- API hatası durumunda varsayılan: `'sun'`
- Try-catch ile güvenli fallback

---

## 🔧 Best Practices

1. **Single Responsibility:** Her modül tek bir işlevi üstlenir
2. **Type Safety:** Tüm fonksiyonlar TypeScript typed
3. **Error Handling:** Tüm dış servisler try-catch ile sarılı
4. **Environment Variables:** Gizli bilgiler env'de
5. **Logging:** Debug için console.log kullanımı
