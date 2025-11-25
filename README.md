# CoinSupli

CoinSupli; CoinGecko API altyapısını kullanarak kripto paraların fiyat hareketlerini, piyasa değerlerini ve özellikle **token ekonomisi (tokenomics)** verilerini analiz etmeye yarayan, mobil öncelikli bir web uygulamasıdır.

## 🚀 Özellikler

*   **Detaylı Token Ekonomisi:** Dolaşımdaki arz, toplam arz ve maksimum arz verilerinin görselleştirilmesi.
*   **Arz Enflasyonu Analizi:** Son 1 yıllık arz artışını ve yıllık enflasyon oranını gösteren grafikler.
*   **Kilit Açılım (Unlock) Takibi:** Kilitli token miktarı, dolaşıma giriş takvimi ve FDV (Tam Seyreltilmiş Değer) risk analizleri.
*   **Akıllı Arama:** Kripto paraları isim veya sembol ile hızlıca arama imkanı.
*   **Çoklu Dil Desteği:** Türkçe ve İngilizce dil desteği (Otomatik tarayıcı dili algılama).
*   **Responsive Tasarım:** Mobil cihazlar için optimize edilmiş modern ve karanlık mod arayüzü.

## 🛠 Teknolojiler

Bu proje modern web teknolojileri kullanılarak geliştirilmiştir:

*   **React 19:** Kullanıcı arayüzü kütüphanesi.
*   **TypeScript:** Tip güvenliği ve ölçeklenebilir kod yapısı.
*   **Tailwind CSS:** Hızlı ve duyarlı stillendirme.
*   **Recharts:** Veri görselleştirme ve interaktif grafikler.
*   **CoinGecko API:** Kripto para verileri (Public/Free Tier).

## ⚙️ Kurulum ve Çalıştırma

Bu proje çalışmak için herhangi bir **API Anahtarı (API Key)** gerektirmez. Veriler halka açık CoinGecko API üzerinden çekilmektedir.

1.  Projeyi klonlayın:
    ```bash
    git clone https://github.com/kullaniciadi/CoinSupli.git
    ```
2.  Proje dizinine gidin:
    ```bash
    cd CoinSupli
    ```
3.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
4.  Uygulamayı başlatın:
    ```bash
    npm start
    ```

## ⚠️ API Sınırlamaları ve Kullanım Notları

*   Uygulama CoinGecko'nun **ücretsiz (public)** API planını kullanmaktadır.
*   **Rate Limit:** Dakikada belirli bir istek sınırı vardır (yaklaşık 10-30 istek/dakika).
*   Çok sık arama yapıldığında veya sayfa yenilendiğinde "API Limiti" uyarısı alabilirsiniz. Bu durumda kısa bir süre (yaklaşık 1 dakika) beklemeniz yeterlidir.

## 🔒 Gizlilik

Bu proje istemci taraflı (client-side) çalışır ve herhangi bir sunucuya kişisel veri göndermez. Google Gemini veya başka bir AI servisi için API anahtarı gerektirmez ve barındırmaz.

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

---
*Yasal Uyarı: Bu uygulamadaki veriler bilgilendirme amaçlıdır ve yatırım tavsiyesi değildir.*