# 📁 public/ - Statik Dosyalar

Bu dizin, Next.js tarafından doğrudan sunulan statik dosyaları içerir.

---

## 📂 Dizin Yapısı

```
public/
├── logo.png                      # Ana logo (büyük)
├── SmallLogo.png                 # Favicon/küçük logo
├── smiley-in-love-svgrepo-com.svg # Rating 5 ikonu (😍)
└── uskkenttaswhite.png           # Alternatif logo (beyaz)
```

---

## 🖼️ Dosya Açıklamaları

### logo.png
**Kullanım:** Ana sayfa ve feedback formu
- Landing page'de ortada
- Feedback formunun üstünde
- Kırmızı arka plan için optimize

### SmallLogo.png
**Kullanım:** Favicon
- Browser tab ikonu
- Bookmark ikonu
- PWA ikonu

```tsx
// layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: '/SmallLogo.png',
  },
};
```

### smiley-in-love-svgrepo-com.svg
**Kullanım:** Rating 5 (en yüksek puan) ikonu
- FeedbackForm'da 5. rating butonu
- "Mükemmel" duygusu

```tsx
// FeedbackForm.tsx
<img src="/smiley-in-love-svgrepo-com.svg" alt="Rating 5" />
```

### uskkenttaswhite.png
**Kullanım:** Alternatif logo (beyaz versiyonu)
- Koyu arka planlar için
- Şu anda aktif kullanılmıyor

---

## 🔗 Erişim

Tüm public dosyalar root path'ten erişilebilir:

```
/logo.png
/SmallLogo.png
/smiley-in-love-svgrepo-com.svg
/uskkenttaswhite.png
```

---

## 📐 Optimizasyon

### Next.js Image Component

```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Üsküdar Yenileniyor"
  width={200}
  height={200}
  priority
/>
```

**Avantajlar:**
- Otomatik boyutlandırma
- Lazy loading
- WebP dönüşümü
- Blur placeholder

---

## 📝 Notlar

- Tüm görseller Üsküdar Yenileniyor markasına aittir
- SVG dosyaları inline olarak da kullanılabilir
- Büyük dosyalar için CDN düşünülebilir
