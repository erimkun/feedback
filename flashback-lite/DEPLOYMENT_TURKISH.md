# Flashback Lite - Kendi Sunucunuza Kurulum Rehberi

Bu proje Next.js ve Prisma (PostgreSQL) kullanmaktadır. Kendi sunucunuzda (Ubuntu/Debian, CentOS vb. veya Windows Server) barındırmak için aşağıdaki adımları takip etmeniz gerekir.

Soru: **"Olay sadece env dosyalarında mı?"**
**Cevap:** Hayır, `.env` dosyası çok önemlidir ancak sunucuda Node.js kurulumu, PostgreSQL veritabanı hazırlığı, uygulamanın 'build' edilmesi ve sürekli çalışır halde tutulması (PM2 vb. ile) gibi adımlar da gereklidir.

## 1. Gereksinimler

Sunucunuzda şunların kurulu olması gerekir:
- **Node.js**: v18 veya üzeri (v20 tavsiye edilir).
- **NPM** veya **Yarn**: Paket yöneticisi.
- **PostgreSQL**: Veritabanı sunucusu. (Veya harici bir veritabanı hizmeti örn: Supabase, AWS RDS).
- **Git**: Kodları çekmek için.

## 2. Kurulum Adımları

### Adım 1: Kodları Sunucuya Çekin
Projeyi sunucunuza `git clone` ile veya dosyaları kopyalayarak atın.
```bash
git clone <repo-url>
cd flashback-lite
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Çevresel Değişkenleri (.env) Ayarlayın
Proje kök dizininde `.env` adında bir dosya oluşturun (`.env.example` dosyasını kopyalayabilirsiniz).

```bash
cp .env.example .env
nano .env  # veya favori editörünüz ile açın
```

**Dikkat etmeniz gereken ayarlar:**

*   `DATABASE_URL`: PostgreSQL bağlantı adresiniz.
    *   Format: `postgresql://KULLANICI:SIFRE@HOST:PORT/VERITABANI_ADI?schema=public`
    *   Örnek: `postgresql://admin:123456@localhost:5432/feedback_db?schema=public`
*   `NEXT_PUBLIC_BASE_URL`: Sunucunuzun domain adresi veya IP'si. Linkler bu adrese göre oluşturulur.
    *   Örnek: `https://anket.benimfirman.com` veya `http://192.168.1.50:3000`
*   `ADMIN_USERNAME` & `ADMIN_PASSWORD`: Admin paneline giriş bilgileri.
*   `JWT_SECRET`: Güvenlik için rastgele uzun bir şifre/kelime girin.
*   `SMS_API_*`: Eğer Posta Güvercini SMS servisi kullanmayacaksanız `SMS_TEST_MODE=true` yapabilirsiniz.

### Adım 4: Veritabanını Hazırlayın
Prisma ile veritabanı tablolarını oluşturun.

```bash
# Veritabanı şemasını veritabanına uygula
npx prisma db push

# Prisma istemcisini oluştur
npx prisma generate
```

### Adım 5: Uygulamayı Derleyin (Build)
Production (canlı) ortam için uygulamayı optimize edilmiş, derlenmiş hale getirin.

```bash
npm run build
```
*(Bu işlem biraz sürebilir. Eğer veritabanı hatası alırsanız `.env` dosyasındaki DATABASE_URL'i kontrol edin)*

### Adım 6: Uygulamayı Başlatın
```bash
npm run start
```
Artık uygulamanız `http://localhost:3000` adresinde çalışıyor olacaktır.

---

## 3. Uygulamayı Sürekli Ayakta Tutma (Production — systemd önerilir)

Üretim ortamında uygulamayı "build" edip `npm run start` ile çalıştırmak ve `systemd` ile servis olarak yönetmek genellikle PM2'ye göre daha basit ve kararlıdır. Aşağıda hem servis örneği hem de Prisma ile veritabanı hazırlama adımları yer alır.

Önce uygulamayı build edin:

```bash
npm run build
```

Prisma istemcisini oluşturun ve veritabanı şemasını uygulayın:

```bash
npx prisma generate

# Eğer migration tabanlı bir iş akışınız varsa (migrations/ dizini varsa):
npx prisma migrate deploy

# Eğer migration kullanmıyorsanız ve sadece şemayı DB'ye push etmek isterseniz:
npx prisma db push
```

Üretimde uygulamayı başlatın:

```bash
npm run start
```

Örnek `systemd` servis dosyası (`/etc/systemd/system/feedback-app.service`):

```ini
[Unit]
Description=Feedback App (Next.js)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/flashback-lite
ExecStart=/usr/bin/npm run start
Restart=on-failure
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public

[Install]
WantedBy=multi-user.target
```

Servisi etkinleştirme ve başlatma:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now feedback-app
```

Not: `systemd` yerine `pm2` kullanmak isterseniz PM2 komutlarını kullanabilirsiniz; PM2 hâlâ bir seçenektir.

### Ek: Localde `dev.db` silindiğinde ne yapmalı?

Eğer local `dev.db` dosyasını sildiyseniz (veriler gidicektir), proje kök dizininde veritabanı şemasını yeniden oluşturmak için:

```bash
cd flashback-lite

# migration'lar varsa reset ile temiz DB oluşturup migration'ları uygulayabilirsiniz (veri kaybı olur):
npx prisma migrate reset --force

# veya sadece şemayı DB'ye push etmek isterseniz:
npx prisma db push

npx prisma generate

npm run dev
```

### Ek: Mevcut bir uzak veritabanına bağlanma

1. Sunucunuzdaki `.env` dosyasında `DATABASE_URL`'i uzak PostgreSQL URL'sine ayarlayın.
2. Eğer migration'larınız varsa sunucuda `npx prisma migrate deploy` çalıştırarak tabloların oluşturulmasını sağlayın. Migration kullanmıyorsanız `npx prisma db push` ile şemayı itebilirsiniz.

Uyarılar:
- Eğer hedef veritabanı üzerinde zaten veri veya farklı bir şema varsa, migration'lar çakışabilir — önce test bir veritabanında deneyin.
- Production için `migrate deploy` tercih edilir; `migrate reset` üretimde asla kullanılmamalıdır.


## 4. Domain ve Port Yönlendirme (Nginx - Opsiyonel)

Kullanıcıların `http://domain.com:3000` yerine direkt `http://domain.com` (80 portu) üzerinden girmesi için Nginx (reverse proxy) kurmanız önerilir.

Basit bir Nginx konfigürasyonu örneği:

```nginx
server {
    listen 80;
    server_name anket.benimfirman.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 5. Yönetici (Admin) Kullanımı

*   **Admin Paneli**: `DOMAIN.com/admin` adresinden `.env` dosyasında belirlediğiniz bilgilerle giriş yapabilirsiniz.
*   **Manuel Link Oluşturma (Sunucu içinde)**:
    ```bash
    npx tsx scripts/create-link.ts "Ahmet Yılmaz"
    ```
