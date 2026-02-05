# 📁 feedback/ - Geri Bildirim Sayfaları

Bu dizin, kullanıcıların geri bildirim formunu doldurduğu dinamik sayfaları içerir.

---

## 📂 Dizin Yapısı

```
feedback/
└── [id]/
    ├── page.tsx       # Ana feedback formu
    └── not-found.tsx  # 404 sayfası
```

---

## 🔗 Dinamik Routing

**Route Pattern:** `/feedback/:id`

Next.js dynamic segments kullanılarak her feedback için benzersiz URL oluşturulur.

```typescript
// URL Örnekleri
/feedback/abc123xyz
/feedback/Hn4kL9mQp2
```

---

## 📄 page.tsx - Feedback Formu

### Props
```typescript
interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}
```

### Durum Kontrolleri

```typescript
const feedback = await prisma.feedback.findUnique({ where: { id } });

if (!feedback) {
  notFound();  // 404 sayfasına yönlendir
}

if (feedback.is_used) {
  // "Link kullanılmış" mesajı göster
}

// Form göster
return <FeedbackForm feedbackId={id} target_name={feedback.target_name} />;
```

### Render Durumları

| Durum | Sonuç |
|-------|-------|
| ID bulunamadı | `not-found.tsx` render edilir |
| `is_used: true` | Bilgilendirme mesajı |
| `is_used: false` | FeedbackForm bileşeni |

---

## ❌ not-found.tsx - 404 Sayfası

Geçersiz feedback ID'leri için özel 404 sayfası.

### İçerik
- Büyük "404" başlığı
- "Link bulunamadı" mesajı
- Üsküdar Yenileniyor footer

---

## 🔄 Veri Akışı

```
URL → /feedback/abc123
    ↓
page.tsx (Server Component)
    ↓ Prisma query
    ↓
Durum kontrolleri
    ├── Bulunamadı → not-found.tsx
    ├── Kullanılmış → Mesaj göster
    └── Geçerli → FeedbackForm
         ↓
Kullanıcı formu doldurur
         ↓
submitFeedback() Server Action
         ↓
is_used: true olarak güncelle
         ↓
Teşekkür ekranı + Konfeti
```

---

## 🎨 UI/UX Özellikleri

### Feedback Form
- 5 yıldız emoji rating sistemi
- Opsiyonel yorum alanı
- Konfeti animasyonu (başarılı submit)
- Mobile-first responsive tasarım

### Kullanılmış Link Ekranı
- Info ikonu
- Net açıklama metni
- Marka tutarlılığı (footer)

### 404 Sayfası
- Minimal tasarım
- Marka renkleri
- Kullanıcı dostu mesaj

---

## 🔐 Güvenlik

- **Tek kullanımlık linkler:** Her link sadece bir kez kullanılabilir
- **UUID tabanlı ID:** Tahmin edilemez link ID'leri
- **Server-side validation:** Tüm kontroller sunucu tarafında
