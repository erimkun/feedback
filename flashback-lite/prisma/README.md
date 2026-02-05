# 📁 prisma/ - Veritabanı Şeması ve Migration

Bu dizin, Prisma ORM yapılandırmasını ve veritabanı migration dosyalarını içerir.

---

## 📂 Dizin Yapısı

```
prisma/
├── schema.prisma           # Veritabanı şeması
└── migrations/
    ├── migration_lock.toml # Migration kilidi
    ├── 20260116133429_init/
    │   └── migration.sql   # İlk migration
    └── 20260128120000_add_office_field/
        └── migration.sql   # Office field ekleme
```

---

## 📄 schema.prisma

Veritabanı şeması tanımı.

### Generator
```prisma
generator client {
  provider = "prisma-client-js"
}
```

### Datasource
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Model: Feedback

```prisma
model Feedback {
  id         String   @id           // UUID - benzersiz link ID
  target_name String                 // Hedef kişi adı
  office     String?                // Ofis (opsiyonel)
  rating     Int?                   // 1-5 puan (nullable)
  comment    String?                // Yorum (opsiyonel)
  is_used     Boolean  @default(false) // Kullanılmış mı?
  created_at  DateTime @default(now()) // Oluşturulma tarihi
}
```

### Alan Açıklamaları

| Alan | Tip | Null | Açıklama |
|------|-----|------|----------|
| id | String | ❌ | Primary key, nanoid ile üretilen benzersiz ID |
| target_name | String | ❌ | Geri bildirim talep edilen kişi |
| office | String | ✅ | Merkez, Ünalan, Bahçelievler, Yavuztürk |
| rating | Int | ✅ | 1-5 arası puan, form dolana kadar null |
| comment | String | ✅ | Kullanıcının opsiyonel yorumu |
| is_used | Boolean | ❌ | Link kullanıldı mı? Default: false |
| created_at | DateTime | ❌ | Otomatik timestamp |

---

## 📦 Migration'lar

### 20260116133429_init
İlk veritabanı oluşturma migration'ı.

**İşlemler:**
- Feedback tablosu oluşturma
- Primary key tanımlama
- Varsayılan değerler

### 20260128120000_add_office_field
Office alanı ekleme migration'ı.

**İşlemler:**
- `office` kolonu ekleme (nullable)

---

## 🔧 Prisma Komutları

### Development
```bash
# Schema'yı veritabanına push et (migration oluşturmadan)
npx prisma db push

# Migration oluştur ve uygula
npx prisma migrate dev --name migration_name

# Prisma Client'ı yeniden oluştur
npx prisma generate
```

### Production
```bash
# Migration'ları uygula
npx prisma migrate deploy

# Client oluştur
npx prisma generate
```

### Debug
```bash
# Prisma Studio (görsel veritabanı arayüzü)
npx prisma studio

# Veritabanı durumunu kontrol et
npx prisma migrate status
```

---

## 🔗 Connection String

**Format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Environment Variable:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/flashback?schema=public"
```

---

## 📝 Notlar

### UUID Kullanımı
- Standard auto-increment yerine UUID kullanılıyor
- Güvenlik: Tahmin edilemez linkler
- nanoid ile 10 karakterlik kısa ID'ler

### Nullable Alanlar
- `rating` ve `comment`: Form dolana kadar null
- `office`: Opsiyonel alan

### Soft Delete
- Şu anda hard delete kullanılıyor
- İleride `deletedAt` alanı eklenebilir
