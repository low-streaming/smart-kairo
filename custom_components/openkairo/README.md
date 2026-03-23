# ⚡️ OpenKAIRO OS - Card Builder Pro

Willkommen beim offiziellen **Pro-Builder für OpenKAIRO OS**. Dieses Tool verwandelt dein Home Assistant Dashboard in ein echtes Design-Kraftwerk. Mit WYSIWYG-Vorschau, dynamischer Logik und animierten SVG-Leitungen.

## ✨ Features (Freigeschaltet)
- **WYSIWYG Canvas:** Baue deine Karten visuell, statt YAML zu raten.
- **Pro Styles:** Volle Kontrolle über Typografie, Eckenabrundung und Hintergrundbilder.
- **Dynamic Logic:** Ändere Farben von Icons oder Hintergründen basierend auf Entitäts-Status (z.B. rot bei `on`).
- **Media Manager:** Lade Bilder oder Grundrisse via URL direkt in deine Karten.
- **Visual Entity Links:** Zeichne animierte Energie-Leitungen zwischen deinen Sensoren!

---

## 🗺️ Roadmap (Entwicklungsschritte)

### ✅ Phase 1: Interactivity & Logic
Implementierung von Klick-Aktionen (`toggle`, `more-info`) und der `logicState`-Farben.

### ✅ Phase 2: UI Organization
Aufteilung des Editors in die Tabs `PROPERTIES`, `STYLES` und `ACTIONS` für einen cleanen Workflow.

### ✅ Phase 3: Media & Backgrounds
Unterstützung von `imageUrl` und `backgroundImage` für komplexe Layouts (Grundrisse).

### ✅ Phase 4: Visual Entity Links
Einführung des SVG-Overlays und der animierten Bezier-Kurven zwischen den Bausteinen.

### 🕒 Phase 5: Design Polish & Templates (Next)
- [ ] Optimierung der Drag-Performance.
- [ ] Auswahl von SVG-Kurven-Stilen (gepunktet, durchgezogen, pulsierend).
- [ ] Kopieren ganzer Baustein-Gruppen mit `Strg+C / Strg+V`.

### 🚀 Phase 6: Global Resource Manager (Future)
- [ ] Echter Datei-Upload in den HA `/www` Ordner.
- [ ] Gemeinsame Nutzung von Image-Assets über mehrere Karten hinweg.

---

## 🛠️ Installation & Update
Um die neuesten Features im Dashboard zu sehen, musst (nach jedem Update von uns) der Cache in Home Assistant unter **Einstellungen -> Dashboards -> Ressourcen** für die Datei `openkairo_custom_card.js` durch einen URL-Parameter (z.B. `?v=5`) erneuert werden.

**Viel Spaß beim Bauen!**
*Team OpenKAIRO*
