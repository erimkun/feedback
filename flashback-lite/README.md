# Flashback Lite

Hızlı ve basit geri bildirim toplama uygulaması.

## Proje Yapısı ve İşleyiş

Bu proje, kişiye özel geri bildirim linkleri oluşturarak kullanıcı deneyimini puanlamalarını sağlayan bir Next.js uygulamasıdır.

### 1. Kişiler ve Linkler Nasıl Oluşturuluyor?

Kişiler ve onlara özel linkler, terminal üzerinden çalışan bir script yardımıyla oluşturulur.

*   **Komut:** `npm run create-link "Kişi Adı"`
*   **Arka Plan:** Bu komut `scripts/create-link.ts` dosyasını çalıştırır.
*   **İşleyiş:**
    1.  Script, verdiğiniz ismi (`targetName`) alır.
    2.  Benzersiz bir **UUID** (örn: `123e4567-e89b...`) oluşturur.
    3.  Veritabanına (SQLite) yeni bir kayıt ekler: `{ id: UUID, targetName: "Kişi Adı", isUsed: false }`.
    4.  Size bu ID'ye sahip özel bir URL verir: `http://localhost:3000/feedback/[UUID]`

### 2. URL Yapısı

URL'ler isme özel değil, **ID'ye (UUID) özeldir**. Bu sayede linkler tahmin edilemez ve güvenli olur. Ancak veritabanında bu ID, girdiğiniz isimle eşleştirilmiştir. Kullanıcı linki açtığında, sistem bu ID'yi veritabanında arar ve ilgili geri bildirim formunu gösterir.

### 3. Feedbackler Nasıl Tutuluyor?

Veriler yerel bir **SQLite** veritabanında (`prisma/dev.db`) saklanır.

*   **Veri Modeli (`Feedback`):**
    *   `id`: Linkin benzersiz kimliği (UUID).
    *   `targetName`: Geri bildirimin kimin için olduğu.
    *   `rating`: Verilen puan (1-5 arası).
    *   `comment`: (Opsiyonel) Kullanıcı yorumu.
    *   `isUsed`: Linkin kullanılıp kullanılmadığını belirtir (Tek seferlik kullanım için).

Kullanıcı formu doldurup "Gönder" dediğinde:
1.  `submitFeedback` fonksiyonu (Server Action) çalışır.
2.  ID'ye göre kayıt bulunur.
3.  Eğer link daha önce kullanılmamışsa, puan ve yorum veritabanına kaydedilir.
4.  `isUsed` alanı `true` olarak işaretlenir, böylece link tekrar kullanılamaz.

## Kurulum ve Çalıştırma

1.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

2.  Veritabanını hazırlayın:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  Uygulamayı çalıştırın:
    ```bash
    npm run dev
    ```

4.  Yeni bir link oluşturun:
    ```bash
    npm run create-link "Ahmet Yılmaz"
    ```
