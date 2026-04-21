# Beste Volgende Stappen

- Meer maps toevoegen: Europa en Wereld staan al als knoppen klaar, dus dat is een logische volgende uitbreiding.
- Moeilijkheidsgraden: snellere heli, minder tijd, kleinere target-hitbox, of meer steden per ronde.
- Echte progression: levels per regio of oplopende moeilijkheid terwijl je speelt.
- Geluid: rotor, target-hit, countdown, explosie, menu select. Dat geeft meteen veel meer spelgevoel.
- High scores verbeteren: datum, mapnaam, difficulty en misschien top-10 per map.
- Namen invoeren mooier maken: standaardnaam onthouden, toetsenbord-focus op mobiel verbeteren.

# Gameplay-verbeteringen

- Mini-radar of richtingshint naar de target.
- Combo-systeem: sneller meerdere targets halen geeft bonuspunten.
- Straf voor missen of te lang stilstaan.
- Random events: mist, wind, nachtmodus, beperkte zichtbaarheid (wolken).
- Visuele feedback bij target-hit: flits, score-popup, kort geluidje.

# UX / PWA

- Install-knop in de app zodra beforeinstallprompt beschikbaar is.
- Offline-scherm of “offline ready”-melding.
- Save state: laatste settings en maybe laatste map onthouden.
- Splash screen / laadscherm bij opstarten als PWA.

# Technisch slim

- Europa en Wereld als aparte game-component/config aanpakken zodat je niet alles dupliceert.
- Game data los trekken naar JSON/TS datasets per map.
- Local storage centraliseren voor settings + high scores.
- Kleine testset voor high score-opslag en game-over flow.
