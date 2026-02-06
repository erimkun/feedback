# Coolify ile Deployment Rehberi

Bu rehber, projenizi **Coolify** (açık kaynaklı Vercel/Heroku alternatifi) kullanarak nasıl sunucunuza kolayca deploy edeceğinizi anlatır.

## 1. Hazırlık (Git Reposu)

Coolify, kodunuzu doğrudan bir Git servisinden (GitHub, GitLab, Bitbucket) çeker. Bu yüzden en temiz yöntem kodunuzu bir depoya pushlamaktır.

1.  Projenizi GitHub'a (veya kullandığınız servise) gönderin.
2.  Reponuzun Private (Gizli) olması durumunda Coolify'a erişim izni vermeniz gerekebilir (GitHub App veya Deploy Key ile).

---

## 2. Proje Oluşturma (Coolify Paneli)

1.  Coolify panelinize giriş yapın.
2.  **Projects** sekmesine gidin ve bir proje seçin (yoksa oluşturun "Default Project").
3.  **New** butonuna basın ve **"Application"** seçeneğini seçin.
4.  Kaynak olarak **"Public Repository"** (veya bağlıysa "GitHub/GitLab") seçin.
5.  Reponuzun linkini yapıştırın (Örn: `https://github.com/kullanici/flashback-lite`) ve **"Check Repository"** deyin.
6.  Branch adını (genelde `main` veya `master`) doğru yazdığınızdan emin olun.

---

## 3. Konfigürasyon Ayarları

Coolify projenizi otomatik algılayacaktır ama şu ayarları kontrol etmekte fayda var:

### Build Pack
*   **Seçim:** `Nixpacks` (En sorunsuz çalışan seçenek budur).

### Portlar
*   **Ports Exposes:** `3000` (Next.js varsayılan portu).

### Komutlar (Önemli!)
Next.js ve Prisma kullandığınız için build komutunu özelleştirmeniz gerekir.

*   **Build Command:**
    ```bash
    npm install && npx prisma generate && npm run build
    ```
    *(Not: `prisma generate` komutu veritabanı istemcisini oluşturmak için build öncesi şarttır.)*

*   **Start Command:**
    ```bash
    npm start
    ```

---

## 4. Ortam Değişkenleri (Environment Variables)

Projenizin çalışması için `.env` dosyanızdaki bilgileri Coolify'a eklemelisiniz.

1.  Uygulama ayarlarında **"Environment Variables"** (veya Secrets) sekmesine gidin.
2.  Bilgisayarınızdaki `.env` dosyasının içeriğini kopyalayın.
3.  **"Paste .env"** diyerek topluca yapıştırın veya tek tek ekleyin.
    *   Özellikle `DATABASE_URL`'in doğru olduğundan emin olun.
    *   Eğer veritabanını da Coolify üzerinden açtıysanız (PostgreSQL), Coolify size otomatik bir bağlantı stringi verecektir, onu kullanın.

---

## 5. Deployment

1.  Sağ üst köşedeki **"Deploy"** butonuna basın.
2.  **"Logs"** sekmesinden işlemi takip edin. İlk build işlemi paketlerin indirilmesi nedeniyle biraz uzun sürebilir.
3.  "Deployed" yazısını gördüğünüzde işlem tamamdır.

### Domain Ayarı
Uygulamanızın varsayılan bir URL'de açılması için:
*   **General** sekmesinde **Domains** kısmına domaininizi yazın (Örn: `https://anket.benimsitem.com`).
*   Coolify, DNS ayarlarınız doğruysa (A kaydı sunucu IP'sine yönlendirilmişse) otomatik olarak **SSL Sertifikası** alacaktır.

---

## Sık Karşılaşılan Sorunlar

*   **Build Hatası (Prisma):** Eğer "Prisma Client not found" hatası alırsanız **Build Command** kısmına `npx prisma generate` eklediğinizden emin olun.
*   **Veritabanı Hatası:** `DATABASE_URL`'in sunucunun erişebileceği bir adres olduğundan emin olun. Eğer veritabanı aynı sunucudaysa `localhost` yerine Coolify'ın docker network ismini veya `host.docker.internal` kullanmanız gerekebilir (Coolify versiyonuna göre değişir, internal URL kullanmak en garantisidir).
