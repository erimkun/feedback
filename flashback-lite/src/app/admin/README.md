# 📁 admin/ - Yönetici Paneli

Bu dizin, Flashback-Lite uygulamasının yönetici arayüzünü içerir.

---

## 📂 Dizin Yapısı

```
admin/
├── layout.tsx    # Admin layout (header + logout)
├── page.tsx      # Ana dashboard
└── login/
    └── page.tsx  # Giriş sayfası
```

---

## 🔐 Erişim Kontrolü

Tüm `/admin/*` rotaları middleware ile korunmaktadır.

### Yetkilendirme Akışı
```
Kullanıcı → /admin/* → Middleware kontrol
    ├── Token yok/geçersiz → /admin/login'e yönlendir
    └── Token geçerli → Sayfaya erişim izni
```

---

## 📄 Sayfalar

### login/page.tsx - Giriş Sayfası

**Route:** `/admin/login`

```tsx
// Özellikler
- useActionState hook ile form yönetimi
- Hata mesajı gösterimi
- Loading state
- Otomatik yönlendirme (başarılı giriş)
```

#### Form Alanları
| Alan | Tip | Açıklama |
|------|-----|----------|
| username | text | Admin kullanıcı adı |
| password | password | Admin şifresi |

---

### page.tsx - Dashboard

**Route:** `/admin`

Ana yönetim sayfası. Tab yapısı ile organize edilmiş.

```tsx
// Server Component
const recentFeedback = await getRecentFeedback();
return <AdminTabs recentFeedback={recentFeedback} />;
```

#### Tab'lar
| Tab | İçerik |
|-----|--------|
| Link Yönetimi | Link oluşturma, toplu yükleme, feedback listesi |
| İstatistikler | Grafikler, analizler, raporlar |

---

### layout.tsx - Admin Layout

Tüm admin sayfalarını saran layout.

#### Özellikler
- **Header:** Logo + Logout butonu
- **Responsive:** Mobile-first tasarım
- **Logout:** Server action ile oturum sonlandırma

```tsx
// Logout akışı
const handleLogout = async () => {
  "use server";
  await logout();
  redirect('/admin/login');
};
```

---

## 🎨 UI Özellikleri

### Tasarım Dili
- Minimal ve temiz arayüz
- Gri tonları ağırlıklı
- Blue accent rengi
- Shadow ve border kullanımı

### Responsive Breakpoints
```css
sm: 640px   /* Küçük tablet */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
```

---

## 🔧 Bileşenler

Dashboard, aşağıdaki admin bileşenlerini kullanır:

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| AdminTabs | AdminTabs.tsx | Tab navigasyonu |
| CreateLinkForm | CreateLinkForm.tsx | Tek link oluşturma |
| BulkUpload | BulkUpload.tsx | Excel ile toplu yükleme |
| StatsDashboard | StatsDashboard.tsx | İstatistik grafikleri |
| FeedbackRow | FeedbackRow.tsx | Tablo satırı (desktop) |
| FeedbackCard | FeedbackCard.tsx | Kart görünümü (mobile) |

---

## 📊 Veri Akışı

```
Server Component (page.tsx)
    ↓ getRecentFeedback()
    ↓
AdminTabs (Client Component)
    ├── CreateLinkForm → createFeedbackLink()
    ├── BulkUpload → createBulkFeedbackLinks()
    └── StatsDashboard → getAdvancedStats()
```
