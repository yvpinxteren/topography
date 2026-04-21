# GeoChopper

Een retro-stijl topografiegame gebouwd met Vite en TypeScript.

## Lokaal ontwikkelen

1. Installeer dependencies met `npm install`.
2. Start de ontwikkelserver met `npm run dev`.
3. Open `http://localhost:5173`.

## Deploy naar GitHub Pages

Bij elke push naar `main` bouwt GitHub Actions de app en publiceert die naar GitHub Pages.

Voor GitHub zelf moet je nog eenmalig dit instellen:

1. Ga in je repository naar `Settings > Pages`.
2. Kies bij `Source` voor `GitHub Actions`.
3. Push daarna naar `main`.

De Vite `base` en de PWA-bestanden worden tijdens de GitHub-build automatisch aangepast aan de repositorynaam.
