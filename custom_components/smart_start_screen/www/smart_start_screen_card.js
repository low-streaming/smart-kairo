class OpenKairoCard extends HTMLElement {
  set hass(hass) {
    if (!this.initialized) {
      this.initialized = true;
      this.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@300;400;800&display=swap');
          
          :host {
            --primary: #10b981;
          }

          .kairo-os {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #05070a;
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            overflow: hidden;
            z-index: 9999;
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .grid {
            position: absolute;
            width: 200%; height: 200%;
            background-image: 
              linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            transform: perspective(600px) rotateX(60deg);
            animation: moveGrid 30s linear infinite;
            z-index: 1;
          }

          @keyframes moveGrid {
            from { transform: perspective(600px) rotateX(60deg) translateY(0); }
            to { transform: perspective(600px) rotateX(60deg) translateY(50px); }
          }

          .content-shell {
            position: relative;
            z-index: 10;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 0 20px;
            box-sizing: border-box;
            margin-bottom: 80px; /* Platz für das Dock lassen */
          }

          .top-bar {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 20;
          }

          .logo {
            width: 120px;
            filter: drop-shadow(0 0 20px var(--primary));
            margin-bottom: 20px;
            animation: pulse 4s infinite ease-in-out;
          }

          @keyframes pulse {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.4)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 40px rgba(16, 185, 129, 0.8)); transform: scale(1.05); }
          }

          h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 3.5rem;
            font-weight: 900;
            margin: 0;
            letter-spacing: -1px;
            background: linear-gradient(180deg, #fff, rgba(255,255,255,0.4));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(255,255,255,0.1);
          }

          .glass-panel {
            background: rgba(16, 185, 129, 0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 30px;
            padding: 40px;
            margin-top: 30px;
            width: 100%;
            max-width: 650px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(16, 185, 129, 0.05);
            transition: 0.3s;
          }
          
          .news-text {
            font-size: 1.2rem;
            font-weight: 300;
            line-height: 1.5;
            margin-bottom: 30px;
            color: rgba(255,255,255,0.9);
          }

          .start-btn {
            background: var(--primary);
            color: white;
            padding: 16px 40px;
            border-radius: 100px;
            font-weight: 800;
            font-size: 1.1rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 1px;
            width: 100%;
          }

          .start-btn:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 20px 50px rgba(16, 185, 129, 0.6);
            background: #12d494;
          }

          .footer {
            margin-top: 40px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            opacity: 0.2;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          /* --- NEU: MAC-OS STYLE DOCK FÜR SEITENLEISTE --- */
          .dock-container {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 15px 30px;
            border-radius: 25px;
            max-width: 90vw;
            overflow-x: auto;
            z-index: 100;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          }

          .dock-container::-webkit-scrollbar { display: none; }
          .dock-container { -ms-overflow-style: none; scrollbar-width: none; }

          .dock-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.5);
            cursor: pointer;
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            min-width: 70px;
          }
          
          .dock-item:hover {
            color: var(--primary);
            transform: translateY(-10px) scale(1.15);
          }

          .dock-icon {
            --mdc-icon-size: 32px;
            margin-bottom: 8px;
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5));
          }

          .dock-label {
            font-family: 'Inter', sans-serif;
            font-size: 0.7rem;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            transition: 0.3s;
            transform: translateY(5px);
          }
          
          .dock-item:hover .dock-label {
            opacity: 1;
            transform: translateY(0);
          }
        </style>
        
        <div class="kairo-os" id="os-container">
          <div class="grid"></div>
          
          <div class="top-bar">
            <!-- Menü Button entfernt, stattdessen fettes System-Branding -->
            <div style="color: var(--primary); font-family: 'Orbitron'; font-size: 1rem; font-weight: 900; letter-spacing: 4px;">OK<span style="opacity:0.5">_SYS</span></div>
            <div style="color: white; opacity: 0.5; font-family: 'Orbitron'; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px;">ONLINE</div>
          </div>

          <div class="content-shell">
            <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo">
            <h1>OPENKAIRO <span style="color:var(--primary)">OS</span></h1>
            
            <div class="glass-panel">
              <div style="color:var(--primary); font-family: 'Orbitron', sans-serif; font-weight:900; letter-spacing:4px; font-size:0.75rem; margin-bottom:15px; opacity:0.8;">// INTELLIGENCE HUB //</div>
              <div class="news-text" id="news">Lade Updates...</div>
              
              <button class="start-btn" id="go">DASHBOARD AUFRUFEN</button>
            </div>
            
            <div class="footer" id="foot">CORE: 2.0.4 | NODE_ID: UNKNOWN | STATUS: CONNECTING</div>
          </div>
          
          <!-- Das dynamische Dock -->
          <div class="dock-container" id="auto-dock">
             <!-- Wird von JS gefüllt -->
          </div>
        </div>
      `;
      this.cardContent = this.querySelector('#news');
      this.cardFooter = this.querySelector('#foot');
      
      // HA Seitenleiste automatisch als App-Dock unten einfügen
      const dock = this.querySelector('#auto-dock');
      if (hass.panels) {
        let dockHtml = '';
        for (const [path, panel] of Object.entries(hass.panels)) {
           // Wir filtern nur brauchbare Panels mit Titeln (außer Config)
           if (panel.title) {
              dockHtml += `
                <div class="dock-item" data-path="/${path}">
                  <ha-icon icon="${panel.icon || 'mdi:apps'}" class="dock-icon"></ha-icon>
                  <span class="dock-label">${panel.title}</span>
                </div>
              `;
           }
        }
        // Einstellungen immer als letztes manuell anhängen
        dockHtml += `
          <div class="dock-item" data-path="/config">
             <ha-icon icon="mdi:cog" class="dock-icon"></ha-icon>
             <span class="dock-label">System</span>
          </div>
        `;
        dock.innerHTML = dockHtml;
        
        // Klick-Event für die Dock-Items
        this.querySelectorAll('.dock-item').forEach(item => {
           item.onclick = () => {
             // Kurze Visuelle Rückmeldung
             item.style.transform = 'scale(0.9)';
             setTimeout(() => {
                window.location.href = item.getAttribute('data-path');
             }, 150);
           };
        });
      }

      // Haupt-Dashboard (Aktuelle Karte) entscheiern
      this.querySelector('#go').onclick = () => {
        const osLayer = this.querySelector('#os-container');
        osLayer.style.opacity = '0';
        osLayer.style.pointerEvents = 'none';
        osLayer.style.transform = 'scale(1.05)';
        setTimeout(() => { osLayer.style.display = 'none'; }, 600);
      };
    }

    const state = hass.states['sensor.openkairo_os_status'];
    if (state && this.cardContent && this.cardFooter) {
      if (state.attributes.github_news) {
         this.cardContent.innerHTML = `<i>"${state.attributes.github_news}"</i>`;
      }
      this.cardFooter.innerText = `LOKALER CORE: VERIFIED | NODE: OK-${Math.floor(Math.random()*9000)+1000} | STATUS: ${state.state}`;
    }
  }

  setConfig(config) {}
  getCardSize() { return 10; }
}

customElements.define('openkairo-card', OpenKairoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-card",
  name: "OpenKairo OS Launchpad",
  description: "Advanced custom Launchpad for OpenKairo Hardware with Dock Navigation."
});
