# EatWell Mobile

Yeni Expo istemcisi. Eski `EatWellMobile` projesinden bağımsızdır.

## Başlatma

```bash
npm install
copy .env.example .env
npm start
```

`EXPO_PUBLIC_API_URL` değerini kullandığın ortama göre değiştir:

- Android emulator: `http://10.0.2.2:5126`
- iOS simulator: `http://localhost:5126`
- Gerçek telefon: bilgisayarının yerel IP adresi, örn. `http://192.168.1.20:5126`

## Mimari

`Screen -> Feature Hook -> Feature Service -> Axios Client -> Backend`

- Sunucu durumu: TanStack Query
- İstemci durumu: Zustand
- Firebase ID token saklama: Expo SecureStore
- Özellikler: `src/features/*`
