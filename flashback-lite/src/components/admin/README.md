# 📁 admin/ - Admin Panel Bileşenleri

Bu dizin, yönetici panelinde kullanılan tüm React bileşenlerini içerir.

---

## 📂 Dizin Yapısı

```
admin/
├── AdminTabs.tsx        # Tab navigasyonu
├── CreateLinkForm.tsx   # Tek link oluşturma
├── BulkUpload.tsx       # Toplu Excel yükleme
├── StatsDashboard.tsx   # İstatistik grafikleri
├── FeedbackRow.tsx      # Tablo satırı (desktop)
└── FeedbackCard.tsx     # Kart görünümü (mobile)
```

---

## 🗂️ Bileşen Detayları

### AdminTabs.tsx
Ana admin panel container. Tab-based navigasyon sağlar.

**Props:**
```typescript
interface AdminTabsProps {
  recentFeedback: {
    id: string;
    target_name: string;
    rating: number | null;
    comment: string | null;
    created_at: string;
  }[];
}
```

**Tab'lar:**
| Tab | İçerik |
|-----|--------|
| links | CreateLinkForm + BulkUpload + Feedback Listesi |
| stats | StatsDashboard |

---

### CreateLinkForm.tsx
Tek tek feedback linki oluşturma formu.

**Özellikler:**
- Hedef kişi adı (zorunlu)
- Ofis seçimi (opsiyonel)
- SMS toggle
- Telefon numarası (SMS aktifse)
- Link kopyalama
- SMS durumu gösterimi

**Ofis Seçenekleri:**
```typescript
const OFFICES = [
  { value: "Merkez", label: "Merkez" },
  { value: "Ünalan", label: "Ünalan" },
  { value: "Bahçelievler", label: "Bahçelievler" },
  { value: "Yavuztürk", label: "Yavuztürk" },
];
```

---

### BulkUpload.tsx
Excel dosyasından toplu kişi yükleme ve SMS gönderimi.

**Adımlar (Steps):**
```typescript
type Step = "upload" | "preview" | "sending" | "results";
```

**Desteklenen Excel Kolonları:**
- AD-SOYAD, AD SOYAD, İSİM
- TEL, TELEFON, TEL NO
- GÖRÜŞME YAPILAN OFİS, OFİS

**Özellikler:**
- Drag & drop dosya yükleme
- Otomatik validasyon
- Satır düzenleme
- İlerleme göstergesi
- Sonuç raporu

---

### StatsDashboard.tsx
İstatistik ve analiz dashboard'u.

**Filtreler:**
- Tarih aralığı (7 gün, 30 gün, bu ay, geçen ay, 90 gün, tümü)
- Ofis filtresi

**Grafikler (Recharts):**
| Grafik | Tip | Veri |
|--------|-----|------|
| Zaman Serisi | LineChart | Günlük feedback sayısı |
| Ofis Dağılımı | BarChart | Ofis bazlı istatistik |
| Memnuniyet | PieChart | Olumlu/Nötr/Olumsuz |

**KPI Kartları:**
- Toplam feedback
- Ortalama puan
- Olumlu oran

---

### FeedbackRow.tsx
Masaüstü tablo görünümü için satır bileşeni.

**Props:**
```typescript
interface FeedbackRowProps {
  item: {
    id: string;
    target_name: string;
    rating: number | null;
    comment: string | null;
    created_at: string;
  };
}
```

**Özellikler:**
- Puan yıldızları
- Yorum önizleme (tooltip)
- Tarih formatı
- Silme butonu

---

### FeedbackCard.tsx
Mobil kart görünümü için bileşen.

**Özellikler:**
- Kompakt kart tasarımı
- Touch-friendly butonlar
- Swipe-to-delete (opsiyonel)

---

## 🎨 Tasarım Sistemi

### Renkler
```typescript
const COLORS = {
  positive: "#22c55e",  // Yeşil (4-5 puan)
  neutral: "#f59e0b",   // Sarı (3 puan)
  negative: "#ef4444",  // Kırmızı (1-2 puan)
  primary: "#3b82f6",   // Mavi (vurgu)
};
```

### Responsive Yaklaşım
- **Mobile:** Kart görünümü (FeedbackCard)
- **Desktop:** Tablo görünümü (FeedbackRow)
- **Breakpoint:** `md:` (768px)

---

## 🔄 State Yönetimi

Tüm bileşenler React hooks kullanır:
- `useState` - Lokal state
- `useTransition` - Server action transitions
- `useEffect` - Side effects

---

## 📦 Bağımlılıklar

| Kütüphane | Kullanım |
|-----------|----------|
| recharts | Grafikler |
| xlsx | Excel okuma |
| date-fns | Tarih formatlama |
| date-fns/locale/tr | Türkçe locale |
