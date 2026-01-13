# 📡 Kariyer Kamulog API Dokümantasyonu

> Proje: **kamulogkariyer.com**  
> Tarih: 13 Ocak 2026  
> Toplam: **55 API Endpoint**

---

## 🔐 Auth (Kimlik Doğrulama)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js ana route |
| `/api/auth/login` | POST | Kullanıcı girişi (WhatsApp doğrulamalı) |
| `/api/auth/register` | POST | Yeni kullanıcı kaydı |
| `/api/auth/verify-registration` | POST | Kayıt doğrulama kodu kontrolü |
| `/api/auth/forgot-password` | POST | Şifre sıfırlama talebi |
| `/api/auth/reset-password` | POST | Yeni şifre belirleme |
| `/api/auth/send-code` | POST | Doğrulama kodu gönder |
| `/api/auth/verify-code` | POST | Doğrulama kodu kontrolü |

---

## 👑 Admin (Yönetici Paneli)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/admin/users` | GET | Kullanıcı listesi |
| `/api/admin/users` | POST | Yeni kullanıcı oluştur |
| `/api/admin/users` | PUT | Kullanıcı güncelle |
| `/api/admin/users` | PATCH | Manuel doğrulama toggle |
| `/api/admin/users` | DELETE | Kullanıcı sil |
| `/api/admin/stats` | GET | Dashboard istatistikleri |
| `/api/admin/sales` | GET/POST/PUT | Satış kayıtları yönetimi |
| `/api/admin/subscriptions` | GET/PUT | Abonelik yönetimi |
| `/api/admin/logs` | GET | Admin işlem logları |
| `/api/admin/jobs/fetch` | POST | İş ilanları çekme |
| `/api/admin/legal` | GET/POST/PUT/DELETE | Yasal sayfalar yönetimi |
| `/api/admin/settings` | GET/PUT | Site ayarları |
| `/api/admin/media` | GET/POST/DELETE | Medya dosyaları |
| `/api/admin/campaigns` | GET/POST/PUT/DELETE | Kampanya yönetimi |
| `/api/admin/reset-tokens` | POST | Token sıfırlama |
| `/api/admin/consultants` | GET/POST | Danışman listesi/oluşturma |
| `/api/admin/consultants/[id]` | GET/PUT/DELETE | Tekil danışman işlemleri |
| `/api/admin/consultant-chats` | GET | Danışman sohbetleri görüntüleme |
| `/api/admin/whatsapp-bot` | GET/POST | WhatsApp bot durumu/kontrol |
| `/api/admin/whatsapp-bot/logs` | GET | WhatsApp bot logları |

---

## 📄 CV İşlemleri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/cv` | GET | Kullanıcının CV listesi |
| `/api/cv` | POST | Yeni CV oluştur |
| `/api/cv/[id]` | GET | CV detayı |
| `/api/cv/[id]` | PUT | CV güncelle |
| `/api/cv/[id]` | DELETE | CV sil |
| `/api/cv/export-pdf` | POST | CV'yi PDF olarak dışa aktar |
| `/api/cv/upload-pdf` | POST | PDF'den CV yükle (AI parse) |

---

## 💼 İş İlanları

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/jobs` | GET | İş ilanları listesi |
| `/api/jobs/[id]` | GET | Tekil ilan detayı |
| `/api/jobs/analyze` | POST | AI ile CV-ilan uyumluluk analizi |
| `/api/jobs/match` | POST | CV eşleştirme |

---

## 💬 Chat / Mesajlaşma

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/chat` | GET | Sohbet odaları listesi |
| `/api/chat` | POST | Mesaj gönder / oda oluştur |
| `/api/chat/consultant` | GET/POST | Danışman sohbeti |
| `/api/chat/unread` | GET | Okunmamış mesaj sayısı |
| `/api/moderator/chats` | GET/PUT | Moderatör sohbet yönetimi |

---

## 👤 User (Kullanıcı)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/user/profile` | GET | Profil bilgileri |
| `/api/user/profile` | PUT | Profil güncelle |
| `/api/user/profile/email-verification` | POST | E-posta değişikliği kodu gönder (WhatsApp) |
| `/api/user/profile/email-verification` | PUT | E-posta değişikliği doğrula |
| `/api/user/credits` | GET | Kredi bakiyesi |
| `/api/user/subscription` | GET | Abonelik durumu |
| `/api/user/cv-chat` | POST | CV AI sohbet |

---

## 🏪 Danışmanlar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/consultants` | GET | Aktif danışman listesi |
| `/api/consultant-rating` | POST | Danışman puanlama |

---

## 💳 Ödeme & Abonelik

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/orders` | POST | Sipariş oluşturma |
| `/api/subscription/usage` | GET | Abonelik kullanım bilgisi |
| `/api/coupons/validate` | POST | Kupon doğrulama |
| `/api/public/plans` | GET | Herkese açık plan listesi |

---

## ⚙️ Ayarlar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/settings/payment` | GET/PUT | Ödeme ayarları |
| `/api/settings/pages` | GET/PUT | Sayfa içerikleri |
| `/api/settings/chat-limits` | GET/PUT | Sohbet limitleri |
| `/api/settings/whatsapp` | GET/PUT | WhatsApp ayarları |

---

## 📍 Diğer

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/locations` | GET | Şehir/İlçe listesi |
| `/api/legal` | GET | Yasal sayfalar (KVKK, Gizlilik vb.) |
| `/api/slider` | GET | Ana sayfa slider |
| `/api/cookie-consent` | POST | Çerez onayı kaydet |

---

## 🔑 Yetkilendirme

Çoğu endpoint aşağıdaki yetkilendirme seviyelerinden birini gerektirir:

| Seviye | Açıklama |
|--------|----------|
| `PUBLIC` | Herkes erişebilir |
| `USER` | Giriş yapmış kullanıcı |
| `MODERATOR` | Moderatör yetkisi (Danışmanlar) |
| `ADMIN` | Tam yönetici yetkisi |

---

## 📦 Teknoloji Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** NextAuth.js
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Google Gemini API
- **Messaging:** WhatsApp (Baileys)

---

*Bu dokümantasyon otomatik olarak oluşturulmuştur.*
