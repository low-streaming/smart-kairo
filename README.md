# ☀️ OpenKAIRO OS - Smart Home Dashboard 💎

Das **OpenKAIRO OS** Dashboard-Paket ist eine exklusive, hochperformante Frontend-Erweiterung für Home Assistant. Sie kombiniert modernstes **Glassmorphism** Design mit flüssigen Animationen und einem professionellen Layout, das dein Smarthome wie ein echtes Premium-Betriebssystem aussehen lässt. 

Egal ob du dein Dashboard im tiefschwarzen Sci-Fi Look oder im cleanen, strahlend hellen "Milchglas"-Stil fährst: OpenKAIRO OS passt sich ab Version 2.0 vollautomatisch in Echtzeit an dein System-Theme an!

Dieses Repository enthält eine komplette Custom Component (`smart_start_screen`), die automatisiert eine Reihe luxuriöser Lovelace-Karten für dein Dashboard registriert.

---

## 🚀 Neue Features & Meilensteine (Aktuelles Release V2.0)

Wir haben das Portfolio signifikant erweitert und das Design perfektioniert!

### 1. 🖱️ OpenKairo Button Card V2 (Das Schweizer Taschenmesser)
Die vermutlich fortschrittlichste und universellste Premium-Steuerung für Lichter, Schalter, Skripte und Szenen in ganz Home Assistant.
- **Wisch-Gesten (Slide-to-Dim):** Wische mit dem Finger direkt über den Button nach links oder rechts, um das Licht stufenlos zu dimmen. Ein Laser-Balken zeigt dir den eleganten Füllstand im Hintergrund an!
- **Sicherheitssperre (Hold-to-Unlock):** Perfekt für Haustüren oder Alarmanlagen. Ein einfacher Klick wird ignoriert. Halte den Button 1,5 Sekunden gedrückt, während sich ein glühender Ladekreis um das Icon aufbaut, um auszulösen.
- **Sensor Badges (2-in-1 Karte):** Kombiniere Schalter und Sensor! Weise deinem Smart Plug den passenden Stromverbrauchssensor zu, und am Icon schwebt ein gläsernes Schild (z.B. "1200 W" oder "21°C"), ohne dass du Platz für zwei Karten verlierst.
- **Sci-Fi Toggle Schalter:** Aktiviere im Editor den "Sci-Fi Schalter" für einen physisch wirkenden, leuchtenden Schiebeschalter am Rande der Karte (ähnlich wie bei iOS).
- **Live-Animationen:** Ist das Gerät an, erwacht das Icon zum Leben! Ventilatoren rotieren in Echtzeit, Waschmaschinen schaukeln leicht und Radare pulsieren.
- **Multi-Klick (Triple Action):** Konfiguriere getrennte Aktionen für "Einfacher Klick", "Doppelklick" und "Langes Halten".

### 2. ☀️ OpenKairo Solar Card (Energy OS)
Die zentrale Kommandozentrale für deine Energie-Flüsse!
- **Neues Editor-Design:** Der visuelle Editor wurde komplett übersichtlich überarbeitet. Jede Entität (Solar, Batterie, Wärmepumpe, Miner) hat nun ihre eigene aufgeräumte "Box" im UI-Editor.
- **Native Color-Picker:** Farben wählst du jetzt im Editor bequem über ein echtes interaktives Farbrad aus.
- **Smartmeter / Kaskaden-Logik:** Wähle flexibel aus, ob Sonderverbraucher (z.B. WP, Wallbox) vom Haussaldo *abgezogen* (bei gemeinsamem Smartmeter) oder *addiert* (bei getrennten Zählern) werden sollen.
- **Plastisches Node-Design:** Die "Bälle" (Knoten) leuchten intensiv durch radiale Gradienten, Inner-Glows und einen pulsierenden Drop-Shadow.

### 3. 🌗 Auto-Theme Engine (Light & Dark Mode)
Schluss mit schlecht lesbaren Karten auf weißem Hintergrund!
- **Dynamic Adaption:** Alle Karten lesen den Modus deines Home Assistants heimlich im Hintergrund mit. Zieht der Nutzer ein "Light Theme" (Helles Design) an, schaltet OpenKAIRO OS sofort das Acrylglas von dunklem "Sci-Fi Schwarz" auf hochglänzendes, weißes "Opal-Milchglas" um. Schriftarten und Schatten invertieren perfekt!

### 4. 🔔 OpenKairo Smart Alert Card (Dynamic Island)
Ein unsichtbares Benachrichtigungssystem, das nur bei Bedarf elegant in Erscheinung tritt.
- **Zero-Pixels Design:** Solange dein Bedingungs-Limit (z.B. *Akku < 10%*) nicht erreicht ist, ist die Karte zu 100% unsichtbar und raubt keinen Platz.
- **Geschmeidige Animation:** Wird die Warnschwelle überschritten, fährt die Karte wie eine *Dynamic Island* butterweich ins Dashboard herab.

### 5. 📈 OpenKairo History Card
Macht langweilige HA-Graphen zu einem echten Premium-Feature.
- **Auto-Skalierung:** Graphen schrumpfen nicht mehr unschön zusammen, sondern haben nun ein smartes `max-height` (gecappt bei 400px) samt Scrollbar.
- **Stats-Grid:** Unter dem Graphen befindet sich ein aufgeräumtes Panel mit aufbereiteten Tages-/Wochen-/Jahresstatistiken im echten OpenKAIRO-Design.

---

## 🛠️ Installation via HACS

1. Öffne **HACS** in deinem Home Assistant.
2. Gehe auf **Integrations** und klicke oben rechts auf die drei Punkte -> **Custom repositories**.
3. Füge die URL dieses Repositories hinzu und wähle die Kategorie **Integration**.
4. Installiere die Integration (Suchbegriff: *OpenKairo OS*).
5. **WICHTIG:** Lade bei Aktualisierungen immer den `main` Branch oder das neuste Release herunter.
6. Nach der Konfiguration zwingend deinen Browser-Cache leeren (**STRG + F5** oder App-Cache löschen in der Companion App), damit die brandneuen Animationen greifen!

## ⚙️ Nutzung (No-Code Architektur!)

Du brauchst für keine einzige dieser Karten auch nur eine Zeile YAML-Code zu schreiben (obwohl du das natürlich darfst). Jede Karte bringt ihren eigenen, perfekt aufgeräumten und visuell anpassbaren Options-Dialog im Home Assistant Editor mit.

Im Dashboard-Editor kannst du direkt nach folgenden neuen Karten suchen:
- `OpenKairo Solar Card`
- `OpenKairo Button Card`
- `OpenKairo Smart Alert Card`
- `OpenKairo Gauge Card`
- `OpenKairo History Card`

---

## 🗺️ Roadmap (Was in Zukunft noch kommen könnte)

Die Vision von OpenKAIRO OS ist noch lange nicht am Ende:

- [ ] **OpenKAIRO Climate Card:** Eine hochvisuelle Steuerung für Klimaanlagen und Heizkörper mit animierten Luftströmen, Lüfter-Rotoren und einem dynamischen Temperatur-Glow-Slider.
- [ ] **Room Hub / Media Deck:** Großzügige Kontrollzentren für ganze Räume oder zur Musik-Steuerung mit Live-Cover-Art und Equalizer-Effekten.
- [ ] **OpenKAIRO EV-Charger Card:** Ein dediziertes Widget für die Wallbox, das den Ladefluss, genutzte Phasen und die voraussichtliche Restdauer elegant als Lade-Ring darstellt.
- [ ] **Erweiterte History-Analytics:** Integration von Langzeit-Statistiken directly ins Dashboard als optisch ansprechende Heatmaps und Bar-Charts.

---
*Powered by OpenKAIRO OS – Smarthome in Exklusiv.*
