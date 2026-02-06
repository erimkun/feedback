# Basit Next.js Deployment Rehberi (Ubuntu/Linux Sunucu)

Bu rehber, projenizin kaynak kodlarını sunucuya atıp, orada build alarak (PM2 ve Nginx ile) yayına almayı anlatır.

## 1. Hazırlık (Kendi Bilgisayarınızda)

Sunucuya dosya göndermeden önce projenizdeki şu klasörleri **hariç tutun** (bunları sunucuya **ATMAYIN**):
- ❌ `node_modules`
- ❌ `.next`
- ❌ `.git`

**Şunları sunucuya (`/var/www/kdanket` klasörüne) atın:**
- ✅ `src` klasörü
- ✅ `public` klasörü
- ✅ `prisma` klasörü
- ✅ `package.json` ve `package-lock.json`
- ✅ `next.config.ts`
- ✅ `tsconfig.json` vb. (kök dizindeki ayar dosyaları)
- ✅ `.env` dosyanız (Production veritabanı bilgilerini içerdiğinden emin olun)

---

## 2. Sunucu Kurulumları (Sunucuda Terminalde)

Sunucunuz boşsa önce gerekli araçları kurun (Node.js, NPM, Nginx, PM2).

```bash
# Sistem güncellemeleri
sudo apt update && sudo apt upgrade -y

# Node.js Kurulumu (Örnek v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (Process Manager) Kurulumu
sudo npm install -g pm2

# Nginx (Web Sunucusu) Kurulumu
sudo apt install -y nginx
```

---

## 3. Proje Kurulumu ve Build (Sunucuda)

Dosyaları attığınız klasöre gidin ve projeyi derleyin.

```bash
cd /var/www/kdanket

# 1. Bağımlılıkları yükle
npm install

# 2. Veritabanı şemalarını oluştur (Prisma)
npx prisma generate
npx prisma migrate deploy

# 3. Projeyi Build al (Derle)
npm run build
```

---

## 4. Uygulamayı Başlatma (PM2 ile)

Uygulamanın arka planda sürekli çalışması için PM2 kullanıyoruz.

```bash
# Uygulamayı başlat (Port 3000 varsayılandır)
pm2 start npm --name "kdanket" -- start

# Eğer 3000 doluysa ve başka port (örn: 4001) istiyorsanız:
# pm2 start npm --name "kdanket" -- start -- -p 4001

# Ayarları kaydet (Sunucu kapanıp açılırsa otomatik başlasın)
pm2 save
pm2 startup
```

---

## 5. Nginx Ayarları (Dış Dünyaya Açma)

Gelen istekleri (Domain veya IP) içeride çalışan 3000 portuna yönlendireceğiz.

1. **Ayar dosyasını oluşturun:**
   ```bash
   sudo nano /etc/nginx/sites-available/kdanket
   ```

2. **İçine şunları yapıştırın:**
   *(server_name kısmına kendi domaininizi veya IP adresinizi yazın)*

   ```nginx
   server {
       listen 80;
       server_name ornek-siteniz.com;

       location / {
           proxy_pass http://localhost:3000; # PM2 kaçta çalışıyorsa o port
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   *(Kaydetmek için: CTRL+O, Enter. Çıkmak için: CTRL+X)*

3. **Siteyi aktif edin:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/kdanket /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # (Varsayılan ayarı silmek isterseniz)
   ```

4. **Nginx'i yeniden başlatın:**
   ```bash
   sudo nginx -t      # Hata kontrolü
   sudo systemctl restart nginx
   ```

---

## 6. Sonuç

Artık tarayıcınızdan `http://ornek-siteniz.com` (veya IP adresi) girdiğinizde siteniz açılacaktır.

**Yönetim Komutları (İhtiyaç olursa):**
- `pm2 status` -> Çalışan uygulamaları gösterir.
- `pm2 logs kdanket` -> Hata loglarını gösterir.
- `pm2 restart kdanket` -> Uygulamayı yeniden başlatır.
