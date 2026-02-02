# Önerilen Özellikler — Admin Dashboard

Bu dosya, uygulamaya eklediğimiz ve ekleyebileceğimiz iyileştirme önerilerini toplar. Her madde kısa açıklama, ilgili bileşen/dosya ve test/uygulama notlarını içerir.

---

## 1. NPS Skoru (Net Promoter Score)
- Açıklama: Kullanıcı memnuniyetini ölçmek için NPS hesaplanır ve yarım daire (gauge) ile görselleştirilir. Promoters (5), Passives (3-4), Detractors (1-2) ayrımı gösterilir.
- İlgili bileşenler/dosyalar:
  - src/components/admin/NpsGauge.tsx
  - src/app/actions/admin.ts (NPS hesaplama eklendi)
- Test notları: Veri yoksa 0 gösterilmeli; pozitif/detraktör yüzdeleri toplamı doğru hesaplanmalı.

## 2. Karşılaştırmalı Analiz (Comparison Analysis)
- Açıklama: İki farklı dönem (örn. bu ay vs geçen ay) arasındaki ortalama puan, NPS ve değerlendirme hacmini karşılaştırma. Fark ve yüzde değişimleri gösterir.
- İlgili bileşenler/dosyalar:
  - src/components/admin/ComparisonChart.tsx
  - src/app/actions/admin.ts (getComparisonStats fonksiyonu)
- Test notları: Tarih aralığı seçimleri doğru şekilde geçilmeli; boş veri durumlarında anlamlı mesaj gösterilmeli.

## 3. Hedef Belirleme (Target Setting / Progress)
- Açıklama: Aylık hedefler (NPS, ortalama puan, olumlu oran) tanımlanır ve gerçekleşme oranları progress bar ile gösterilir.
- İlgili bileşenler/dosyalar:
  - src/components/admin/TargetProgress.tsx
  - (Opsiyonel) Backend için aylık hedefleri saklayacak yeni bir yapı veya settings tablosu
- Test notları: Hedef yoksa varsayılan değerlerle gösterim; progress çubuğu sınırları aşarsa düzgün görselleştirme.

## 4. Takvim Görünümü (Calendar View)
- Açıklama: Gün bazında alınan feedback'leri takvim üzerinde gösterir; rengi günün ortalama puanına göre değişir; gün tıklanınca o güne ait detaylar listelenir.
- İlgili bileşenler/dosyalar:
  - src/components/admin/FeedbackCalendar.tsx
  - src/app/actions/admin.ts (getCalendarData fonksiyonu)
- Test notları: Ay sınırları, farklı timezone'lar, ve gün içinde birden fazla entry durumları test edilmeli.

## 5. Olumsuz Feedback için Ticket Sistemi (Popup)
- Açıklama: 1-2 puanlı geri bildirimler `NegativeTickets` bileşeninde modal olarak listelenir; hızlı aksiyon (İletişime geç, Çözüldü) butonları sağlar.
- İlgili bileşenler/dosyalar:
  - src/components/admin/NegativeTickets.tsx
  - src/components/admin/Modal.tsx
  - src/app/actions/admin.ts (getNegativeFeedbacks fonksiyonu)
- Test notları: Modal erişilebilir olmalı (ESC ile kapanma, backdrop click), aksiyonlar arka uca tetiklenmeli veya mock endpoint ile test edilebilmeli.

---

## Uygulama ve Test Önerileri
- Lokal olarak test ederken veritabanı bağlantısının çalışma durumu gereklidir; iş yeri ağ kısıtlamaları varsa VPN veya lokal DB kullanın.
- Tipik test adımları:
  1. Gerekli environment değişkenlerini ayarla (`DATABASE_URL` vb.).
  2. `npm run dev` ile uygulamayı başlat ve admin dashboard'u görüntüle.
  3. Yeni bileşenlerin veri çekme fonksiyonlarını küçük date aralıkları ile dene.

## Önerilen İyileştirmeler (Gelecek)
- Aylık otomatik hedef uyarıları (e-posta veya SMS) — `sms` lib kullanılabilir.
- Hedeflerin admin panelden düzenlenebilmesi için küçük bir ayarlar ekranı.
- Gerçek zamanlı güncellemeler için WebSocket/Pulse entegrasyonu.

---

Dosyalar repoya eklendi ve admin dashboard ile entegre edilebilir. İstersen bu dosyayı README'a bağlayıp commit edip pushlayayım.
