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

## 3. Uygulamayı Sürekli Ayakta Tutma (PM2 Kullanımı)

Terminali kapattığınızda uygulamanın kapanmaması için PM2 kullanmanız önerilir.

```bash
# PM2'yi global olarak yükleyin
npm install -g pm2

# Uygulamayı başlatın
pm2 start npm --name "feedback-app" -- start

# Başlangıçta otomatik açılması için kaydetme
pm2 startup
pm2 save
```

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
