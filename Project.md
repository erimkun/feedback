BÖLÜM 1: Proje Özeti (Executive Summary)
Proje Adı: Flashback (Lite Sürüm) Amaç: Müşteri veya kullanıcılardan, herhangi bir giriş işlemine (login) gerek kalmadan, kişiye özel oluşturulan linkler aracılığıyla "Duygu Durumu" ve "Yorum" toplamak.

Akış (User Flow):

Giriş: Kullanıcı özel linke tıklar (Örn: app.com/feedback/12345).

Oylama: Karşısına gönderdiğin tasarım çıkar. 1-5 arası bir yüz ifadesi seçer.

Onay: "Gönder" butonuna basar.

Bitiş: Ekranda sadece "Teşekkürler, geri bildiriminiz alındı." mesajı belirir.

Temel Farklılıklar:

Veritabanı olarak SQLite kullanılır (Dosya tabanlı, sunucu kurulumu gerektirmez).

Arayüz, gönderdiğin koyu mod (dark mode) destekli, 5 yüzlü tasarıma sadık kalır.

BÖLÜM 2: Teknik Spesifikasyon (Technical Specification)
1. Teknoloji Yığını (Tech Stack)
Uygulamanın "çok simple" olması için en yalın ve modern araçları seçiyoruz:

Framework: Next.js (App Router ile).

Neden? Frontend (Tasarım) ve Backend (API) tek bir projede çalışır. Ayrı ayrı sunucuyla uğraşmazsın.

Veritabanı: SQLite.

Neden? Tek bir dosya (database.db) olarak projenin içinde durur. Kurulum, şifre, port derdi yoktur.

ORM (Veritabanı Yöneticisi): Prisma.

Neden? SQLite ile konuşmak için SQL kodu yazmak yerine JavaScript nesneleri kullanmanı sağlar. Hata yapmanı engeller.

Stil: Tailwind CSS.

Neden? Gönderdiğin HTML zaten Tailwind ile yazılmış, doğrudan entegre edeceğiz.

2. Veritabanı Şeması (SQLite Schema)
SQLite için basitleştirilmiş tablo yapısı. UUID (Benzersiz ID) oluşturma işini veritabanına değil, yazılıma (JavaScript) bırakacağız.

Kod snippet'i

// schema.prisma dosyası örneği

model Feedback {
  id          String   @id // Linkteki benzersiz kod (UUID)
  targetName  String   // Geri bildirim kimden isteniyor? (Örn: "Ahmet Bey")
  rating      Int?     // 1-5 arası puan (Başlangıçta boş)
  comment     String?  // Opsiyonel yorum
  isUsed      Boolean  @default(false) // Link kullanıldı mı?
  createdAt   DateTime @default(now())
}
3. Uygulama Mantığı ve Kurallar
A. Arayüz (Frontend) Mantığı
Gönderdiğin HTML'i bir React Component'e çevireceğiz. Şu kurallar işleyecek:

Seçim Zorunluluğu: Başlangıçta hiçbir yüz seçili değildir. "Gönder" butonu pasif (opacity-50) ve tıklanamaz durumdadır.

Aktiflik: Kullanıcı bir yüze tıkladığında:

O yüzün ikonu parlar (rengi #135bec olur) ve içi dolu (FILL 1) hale gelir.

Diğer yüzler sönük kalır.

"Gönder" butonu aktif hale gelir (opacity-100).

Gönderim Sonrası: Butona basılınca API'ye istek atılır. Başarılı cevap gelirse form kaybolur, yerine ortalanmış büyük bir "Teşekkürler" yazısı gelir.

B. Backend (API) Mantığı
Link Oluşturma (Admin Scripti):

Basit bir script ile (örn: npm run create-link "Mehmet") veritabanına yeni bir satır eklenir ve sana localhost:3000/feedback/uuid-kodu şeklinde link verir.

Veri Kaydetme (POST):

Kullanıcı "Gönder" dediğinde id, rating ve comment verisi gelir.

Sistem şu kontrolleri yapar:

Bu ID var mı?

Daha önce kullanılmış mı (isUsed true mu)?

Sorun yoksa veriyi günceller ve isUsed = true yapar.

4. Kurulum ve Çalıştırma (Deployment)
SQLite dosya tabanlı olduğu için "Serverless" (Vercel vb.) ortamlarda veri kalıcı olmaz (her dağıtımda sıfırlanabilir). Bu yüzden bu "simple" yapıyı şu şekilde çalıştırabilirsin:

Lokal: Kendi bilgisayarında çalıştırıp ngrok ile dışarı açabilirsin (En basiti).

Basit VPS: DigitalOcean veya Hetzner gibi bir yerde en ucuz (5$) sunucuya koyarsın.

Railway/Render: Dockerize ederek buralarda barındırabilirsin (SQLite dosyasını "Volume" olarak bağlamak gerekir).