# 📁 scripts/ - CLI Araçları

Bu dizin, komut satırından çalıştırılabilecek yardımcı script'leri içerir.

---

## 📂 Dizin Yapısı

```
scripts/
└── create-link.ts    # CLI link oluşturma aracı
```

---

## 🔧 create-link.ts

Terminal üzerinden hızlıca feedback linki oluşturma aracı.

### Kullanım

```bash
# npm ile
npm run create-link "Ahmet Yılmaz"

# veya doğrudan
npx tsx scripts/create-link.ts "Ahmet Yılmaz"
```

### Çıktı

```
✅ Yeni feedback linki oluşturuldu!

   Hedef: Ahmet Yılmaz
  ID: b9f8K3pQ2

🔗 URL: http://localhost:3000/feedback/b9f8K3pQ2
```

### Çalışma Prensibi

```typescript
// 1. Komut satırı argümanını al
const target_name = process.argv[2];

// 2. Kısa ID oluştur (nanoid veya merkezi helper)
const id = generateId();

// 3. Veritabanına kaydet
await prisma.feedback.create({
  data: { id, target_name }
});

// 4. URL'i konsola yazdır
console.log(`🔗 URL: http://localhost:3000/feedback/${id}`);
```

### Parametreler

| Parametre | Zorunlu | Açıklama |
|-----------|---------|----------|
| target_name | ✅ | Hedef kişi/konu adı |

### Hata Durumları

**İsim verilmediğinde:**
```
❌ Lütfen bir isim girin: npx tsx scripts/create-link.ts "İsim"
```

**Veritabanı bağlantı hatası:**
- Prisma bağlantı hatası konsola yazdırılır
- Process exit code 1 ile sonlanır

---

## 🔄 package.json Script Tanımı

```json
{
  "scripts": {
    "create-link": "npx tsx scripts/create-link.ts"
  }
}
```

---

## 📦 Bağımlılıklar

| Paket | Kullanım |
|-------|----------|
| @prisma/client | Veritabanı işlemleri |
| uuid | (eski) UUID v4 üretimi — proje artık kısa id'ler (nanoid) kullanıyor |
| tsx | TypeScript çalıştırma |

---

## 💡 Kullanım Senaryoları

1. **Hızlı Test:** Development sırasında hızlıca link oluşturma
2. **Batch İşlem:** Shell script ile toplu link oluşturma
3. **Debug:** Admin panel dışında link oluşturma

### Örnek Batch Script

```bash
#!/bin/bash
# bulk-create.sh

while IFS= read -r name; do
  npm run create-link "$name"
  sleep 1
done < names.txt
```

---

## ⚠️ Notlar

- Bu script development/debug amaçlıdır
- Production'da Admin Panel kullanılmalıdır
- SMS gönderimi desteklenmez (sadece link oluşturur)
- Office parametresi desteklenmez (null olarak kaydeder)
