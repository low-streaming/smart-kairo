class OpenKairoCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@300;400;800&display=swap');
          
          :host {
            --primary: #10b981;
            --accent: #3b82f6;
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
          }

          .grid {
            position: absolute;
            width: 200%; height: 200%;
            background-image: 
              linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px);
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
          }

          .logo {
            width: 140px;
            filter: drop-shadow(0 0 20px var(--primary));
            margin-bottom: 20px;
            animation: pulse 4s infinite ease-in-out;
          }

          @keyframes pulse {
            0%, 100% { filter: drop-shadow(0 0 20px var(--primary)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 40px var(--primary)); transform: scale(1.05); }
          }

          h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 4rem;
            font-weight: 900;
            margin: 0;
            background: linear-gradient(180deg, #fff, rgba(255,255,255,0.4));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 40px;
            padding: 50px;
            margin-top: 40px;
            max-width: 650px;
            box-shadow: 0 50px 100px rgba(0,0,0,0.8);
          }

          .news-text {
            font-size: 1.5rem;
            font-weight: 300;
            line-height: 1.5;
            margin-bottom: 35px;
            color: rgba(255,255,255,0.9);
          }

          .start-btn {
            background: var(--primary);
            color: white;
            padding: 18px 50px;
            border-radius: 100px;
            font-weight: 800;
            font-size: 1.1rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
            transition: 0.3s;
          }

          .start-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 50px rgba(16, 185, 129, 0.6);
          }

          .footer {
            margin-top: 60px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            opacity: 0.2;
            letter-spacing: 2px;
          }
        </style>
        <div class="kairo-os">
          <div class="grid"></div>
          <div class="content-shell">
            <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo">
            <h1>OPENKAIRO <span style="color:var(--primary)">OS</span></h1>
            <div class="glass-panel">
              <div style="color:var(--primary); font-weight:900; letter-spacing:3px; font-size:0.7rem; margin-bottom:15px;">// GITHUB_FEED //</div>
              <div class="news-text" id="news">Lade Systemdaten...</div>
              <button class="start-btn" id="go">SYSTEM STARTEN</button>
            </div>
            <div class="footer" id="foot">CORE_VER: -- | NODE_ID: -- | STATUS: --</div>
          </div>
        </div>
      `;
      this.cardContent = this.querySelector('#news');
      this.cardFooter = this.querySelector('#foot');
      this.querySelector('#go').onclick = () => window.location.href = '/test/test';
    }

    const state = hass.states['sensor.openkairo_os_status'];
    if (state) {
      this.cardContent.innerText = state.attributes.github_news || 'System bereit.';
      this.cardFooter.innerText = `CORE_VER: 2.0.4 | NODE_ID: OK-LOKAL | STATUS: ${state.state}`;
    }
  }

  setConfig(config) {}
  getCardSize() { return 10; }
}

customElements.define('openkairo-card', OpenKairoCard);

// Mark as custom card for UI editor
window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-card",
  name: "OpenKairo OS Pro Card",
  description: "The official high-end intro screen for OpenKairo."
});
