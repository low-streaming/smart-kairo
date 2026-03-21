# ☀️ OpenKAIRO OS - Smart Home Dashboard 💎

Das **OpenKAIRO OS** Dashboard-Paket ist eine exklusive, hochperformante Frontend-Erweiterung für Home Assistant. Sie kombiniert modernstes **Glassmorphism** Design mit flüssigen Animationen und einem professionellen Layout, das dein Smarthome wie ein echtes Premium-Betriebssystem aussehen lässt.

Dieses Repository enthält eine komplette Custom Component (`smart_start_screen`), die automatisiert eine Reihe luxuriöser Lovelace-Karten für dein Dashboard registriert.

## 🚀 Neue Features & Meilensteine (Aktuelles Release)

Wir haben das Portfolio signifikant erweitert und das Design perfektioniert!

### 1. ☀️ OpenKairo Solar Card (Energy OS)
Die zentrale Kommandozentrale für deine Energie-Flüsse!
- **Neues Editor-Design:** Der visuelle Editor wurde komplett übersichtlich überarbeitet. Jede Entität (Solar, Batterie, Wärmepumpe) hat nun ihre eigene aufgeräumte "Box" im UI-Editor.
- **Native Color-Picker:** Farben wählst du jetzt im Editor bequem über ein echtes interaktives Farbrad aus, statt mühsam Hex-Codes einzutippen!
- **Smartmeter / Kaskaden-Logik:** Wähle flexibel aus, ob Sonderverbraucher (z.B. WP, Wallbox) vom Haussaldo *abgezogen* (bei gemeinsamem Smartmeter) oder *addiert* (bei getrennten Zählern) werden sollen. Nie wieder doppelt gezählte Wattzahlen!
- **Plastisches Node-Design:** Die "Bälle" (Knoten) leuchten intensiv durch radiale Gradienten, Inner-Glows und einen pulsierenden Drop-Shadow.

### 2. 🖱️ OpenKairo Button Card (NEU)
Die universelle Premium-Steuerung für Lichter, Schalter, Skripte und Szenen.
- **Zwei Format-Layouts:** Wähle zwischen *Quadratisch* (Vertical) für kompakte Raster oder *Breite Zeile* (Horizontal) für aufgeräumte Listenansichten.
- **Drei Glow-Styles:** Von "Vollem Ambient Glow" über "Dezenten Bälle-Look" bis zu einem unsichtbaren "Puls" (ideal für Skripte, die nur kurz angetriggert werden). 
- **Long Press Support:** Durch Gedrückthalten öffnest du bei Lampen etc. direkt das native Helligkeits-/Farbrad von Home Assistant (More-Info Dialog).

### 3. 🔔 OpenKairo Smart Alert Card (Dynamic Island - NEU)
Ein unsichtbares Benachrichtigungssystem, das nur bei Bedarf elegant in Erscheinung tritt.
- **Zero-Pixels Design:** Solange dein Bedingungs-Limit (z.B. *Akku < 10%*) nicht erreicht ist, ist die Karte zu 100% unsichtbar und raubt keinen Platz auf dem Bildschirm.
- **Geschmeidige Animation:** Wird die Warnschwelle überschritten, fährt die Karte samt Icon wie eine *Dynamic Island* (Pille) butterweich ins Dashboard herab.
- **Flexibles Stacking:** Füge beliebig viele Alert-Cards im Dashboard untereinander ein. Sie stapeln sich bei gleichzeitigen Alarmen perfekt!
- **Swipe-to-Dismiss:** Ein einfacher Klick/Wisch lässt den Alarm bis zum nächsten physischen Auslöser verschwinden.

### 4. ⚡ OpenKairo Gauge Card
Die perfekte Ergänzung für einzelne Detailwerte (z.B. Akku-Ladung, Miner-Last).
- **Segmentierte Farben:** Erstelle im Visuellen Editor bis zu 3 Farbzonen (z.B. 0-20% Rot, 20-80% Grün, 80-100% Lila).
- **Dynamic Glow:** Wenn der Zeiger in ein neues Farb-Segment wandert, ändert sich nicht nur die Füllung des Bogens – auch der Info-Text und das Leuchten der gesamten Karte wechseln extrem fließend (animiert) in die neue Signalfarbe!
- **Sleek Mirroring:** Nutzt denselben volumetrischen Drop-Shadow und das Acrylic-Glass-Verfahren wie das Solar Dashboard.

### 5. 📈 OpenKairo History Card
Macht langweilige HA-Graphen zu einem echten Premium-Feature.
- **Auto-Skalierung:** Graphen schrumpfen bei vielen Werten nicht mehr unschön zusammen, sondern haben nun ein smartes `max-height` (gecappt bei 400px) samt Scrollbar.
- **Stats-Grid:** Unter dem Graphen befindet sich ein aufgeräumtes Panel mit aufbereiteten Tages-/Wochen-/Jahresstatistiken im echten OpenKAIRO-Design.

---

## 🛠️ Installation via HACS

1. Öffne **HACS** in deinem Home Assistant.
2. Gehe auf **Integrations** und klicke oben rechts auf die drei Punkte -> **Custom repositories**.
3. Füge die URL dieses Repositories hinzu und wähle die Kategorie **Integration**.
4. Installiere die Integration (Suchbegriff: *Smart Start Screen* oder *OpenKairo*).
5. **WICHTIG:** Starte Home Assistant einmal komplett neu! Die `__init__.py` meldet die neuen Karten tief im Backend deines Systems an.
6. Leere im Zweifel nach der Konfiguration deinen Browser-Cache (**F12 -> Netzwerk -> Cache deaktivieren -> F5**).

## ⚙️ Nutzung

Im Dashboard-Editor kannst du nach dem Neustart direkt nach folgenden neuen Karten suchen:
- `OpenKairo Solar Card`
- `OpenKairo Button Card`
- `OpenKairo Smart Alert Card`
- `OpenKairo Gauge Card`
- `OpenKairo History Card`

Jede Karte bringt ihren eigenen, stark visuell aufgeräumten Editor mit. Du kommst ohne eine einzige Zeile YAML-Code aus!

---

## 🗺️ Roadmap (Was in Zukunft noch kommen könnte)

Die Vision von OpenKAIRO OS ist noch lange nicht am Ende. Hier ist ein Ausblick auf mögliche künftige Features, Erweiterungen und Meilensteine:

- [ ] **OpenKAIRO Climate Card:** Eine hochvisuelle Steuerung für Klimaanlagen und Heizkörper mit animierten Luftströmen, Lüfter-Rotoren und einem dynamischen Temperatur-Glow-Slider.
- [ ] **OpenKAIRO EV-Charger Card:** Ein dediziertes Widget für die Wallbox, das den Ladefluss, genutzte Phasen und die voraussichtliche Restdauer elegant als Lade-Ring darstellt.
- [ ] **Responsive Drag & Drop Layouts:** Frei verschiebbare Nodes innerhalb der Solar Card, um die Anordnung optisch perfekt an das eigene Hausnetz anzupassen.
- [ ] **Komplettes Lovelace-Theme:** Ein übergreifendes Home Assistant Overlay-Theme (`themes.yaml`), das den Glassmorphism-Look auf *jeden* Standard-Schalter im Haus ausweitet (Popups, Menüs etc.).
- [ ] **Erweiterte History-Analytics:** Integration von Langzeit-Statistiken (InfluxDB-Abfragen) direkt als optisch ansprechende Heatmaps und Bar-Charts innerhalb der Energy Cards.

---
*Powered by OpenKAIRO OS – Smarthome in Exklusiv.*
