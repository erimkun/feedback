# 📁 components/ - React Bileşenleri

Bu dizin, uygulamada kullanılan tüm yeniden kullanılabilir React bileşenlerini içerir.

---

## 📂 Dizin Yapısı

```
components/
├── FeedbackForm.tsx      # Ana geri bildirim formu
├── ParticlesCanvas.tsx   # Parçacık animasyonları (GSAP)
├── WeatherEffect.tsx     # Hava durumu router
├── RainEffect.tsx        # Yağmur efekti
├── SnowEffect.tsx        # Kar efekti
├── SunEffect.tsx         # Güneş + kelebek efekti
└── admin/                # Admin panel bileşenleri
```

---

## 🎯 Genel Bileşenler

### FeedbackForm.tsx
Kullanıcı geri bildirim formu.

**Props:**
```typescript
interface FeedbackFormProps {
  feedbackId: string;
  targetName: string;
}
```

**Özellikler:**
- 5 dereceli emoji rating (😢 → 😍)
- Renk kodlu puanlama (kırmızı → yeşil)
- Opsiyonel yorum alanı
- Konfeti animasyonu
- Teşekkür ekranı

**State Yönetimi:**
```typescript
const [selectedRating, setSelectedRating] = useState<number | null>(null);
const [comment, setComment] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSubmitted, setIsSubmitted] = useState(false);
const [error, setError] = useState<string | null>(null);
```

---

### WeatherEffect.tsx
Hava durumu türüne göre doğru efekt bileşenini render eder.

```typescript
type WeatherType = 'sun' | 'rain' | 'snow';

// Routing mantığı
if (type === 'rain') return <RainEffect />;
if (type === 'sun') return <SunEffect />;
return <SnowEffect />;
```

---

### RainEffect.tsx
Yağmur damlası animasyonu.

**Teknik Detaylar:**
- 80 adet damla
- 0.5-1 saniye animasyon süresi
- CSS keyframes ile animasyon
- Hydration-safe (useEffect ile oluşturma)

---

### SnowEffect.tsx
Kar tanesi animasyonu.

**Teknik Detaylar:**
- 50 adet kar tanesi
- 2-5 saniye düşüş süresi
- Farklı boyut ve opaklık
- Smooth falling animasyonu

---

### SunEffect.tsx
Güneş ve kelebek animasyonu.

**Teknik Detaylar:**
- ☀️ emoji güneş (60s spin)
- 8 adet CSS kelebek
- Flutter animasyonu
- Glow efekti

---

### ParticlesCanvas.tsx
GSAP ile canvas üzerinde parçacık animasyonları.

**Özellikler:**
- 5 farklı şekil: daire, kare, üçgen, yıldız, ev
- Yukarı doğru hareket
- Dönen ve büyüyen/küçülen parçacıklar
- Performans optimizasyonu (particle pooling)

**Konfigürasyon:**
```typescript
const COLORS = [
  "rgba(255, 255, 255, 0.8)",
  "rgba(255, 255, 255, 0.6)",
  "rgba(46, 104, 122, 0.4)", // primary color
];
```

---

## 📁 Admin Bileşenleri

`/admin` alt klasöründe admin paneline özel bileşenler bulunur.

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| AdminTabs | AdminTabs.tsx | Tab navigasyonu |
| CreateLinkForm | CreateLinkForm.tsx | Tek link oluşturma formu |
| BulkUpload | BulkUpload.tsx | Excel toplu yükleme |
| StatsDashboard | StatsDashboard.tsx | İstatistik dashboard |
| FeedbackRow | FeedbackRow.tsx | Tablo satır bileşeni |
| FeedbackCard | FeedbackCard.tsx | Mobile kart bileşeni |

---

## 🔧 Client vs Server Components

| Bileşen | Tip | Neden? |
|---------|-----|--------|
| FeedbackForm | Client | useState, onClick |
| WeatherEffect | Client | Çocuk client bileşenleri |
| RainEffect | Client | useEffect, useState |
| SnowEffect | Client | useEffect, useState |
| SunEffect | Client | useEffect, useState |
| ParticlesCanvas | Client | Canvas API, useEffect |
| AdminTabs | Client | useState (tab state) |
| CreateLinkForm | Client | Form state, transitions |
| BulkUpload | Client | File upload, state |
| StatsDashboard | Client | Charts, filters |

---

## 🎨 Stil Yaklaşımı

1. **Tailwind CSS** - Ana stil sistemi
2. **Inline styles** - Dinamik değerler için
3. **CSS-in-JS (jsx global)** - Özel animasyonlar
4. **Phosphor Icons** - İkon seti (CDN)
