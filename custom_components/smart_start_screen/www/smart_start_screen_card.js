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

          .menu-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: 0.3s;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .menu-btn:hover {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--primary);
            box-shadow: 0 0 20px rgba(16,185,129,0.3);
          }

          .menu-icon {
            width: 18px;
            height: 2px;
            background: white;
            position: relative;
          }
          .menu-icon::before, .menu-icon::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 2px;
            background: white;
            left: 0;
            transition: 0.2s;
          }
          .menu-icon::before { top: -6px; }
          .menu-icon::after { bottom: -6px; }

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

          .action-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 25px;
          }

          .action-btn {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            color: rgba(255,255,255,0.8);
            padding: 12px 10px;
            border-radius: 12px;
            cursor: pointer;
            transition: 0.3s;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .action-btn:hover {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.4);
            color: white;
            transform: translateY(-2px);
          }
          
          .action-icon {
            font-size: 1.3rem;
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
            margin-top: 50px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            opacity: 0.2;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
        </style>
        
        <div class="kairo-os" id="os-container">
          <div class="grid"></div>
          
          <div class="top-bar">
            <button class="menu-btn" id="menu-btn">
              <div class="menu-icon"></div> MENÜ
            </button>
            <div style="color: var(--primary); font-family: 'Orbitron'; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px;">SYS.ONLINE</div>
          </div>

          <div class="content-shell">
            <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo">
            <h1>OPENKAIRO <span style="color:var(--primary)">OS</span></h1>
            
            <div class="glass-panel">
              <div style="color:var(--primary); font-family: 'Orbitron', sans-serif; font-weight:900; letter-spacing:4px; font-size:0.75rem; margin-bottom:15px; opacity:0.8;">// INTELLIGENCE HUB //</div>
              <div class="news-text" id="news">Lade Updates...</div>
              
              <button class="start-btn" id="go">DASHBOARD AUFRUFEN</button>
              
              <div class="action-grid">
                <button class="action-btn" id="nav-energy">
                  <span class="action-icon">⚡</span> Energie
                </button>
                <button class="action-btn" id="nav-garden">
                  <span class="action-icon">🌱</span> Garten
                </button>
                <button class="action-btn" id="nav-system">
                  <span class="action-icon">⚙️</span> System
                </button>
              </div>
            </div>
            
            <div class="footer" id="foot">CORE: 2.0.4 | NODE_ID: UNKNOWN | STATUS: CONNECTING</div>
          </div>
        </div>
      `;
      this.cardContent = this.querySelector('#news');
      this.cardFooter = this.querySelector('#foot');
      
      // Sidebar Toggle Event in HA
      this.querySelector('#menu-btn').addEventListener('click', () => {
        this.dispatchEvent(new Event('hass-toggle-menu', { bubbles: true, composed: true }));
      });
      
      // Dashboard "Entscheiern" (Fade-Out)
      this.querySelector('#go').onclick = () => {
        const osLayer = this.querySelector('#os-container');
        osLayer.style.opacity = '0';
        osLayer.style.pointerEvents = 'none'; // Verhindert Klicks während es unsichtbar ist
        osLayer.style.transform = 'scale(1.05)';
        
        // Nach dem Fade komplett aus dem Weg räumen
        setTimeout(() => {
          osLayer.style.display = 'none';
        }, 600);
      };

      // Externe Navigation für die kleinen Buttons
      this.querySelector('#nav-energy').onclick = () => { window.location.href = '/energy'; };
      this.querySelector('#nav-garden').onclick = () => { window.location.href = '/dashboard-openkairo/garden'; }; // Pfad anpassen falls nötig
      this.querySelector('#nav-system').onclick = () => { window.location.href = '/config'; };
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
  description: "Advanced custom Launchpad for OpenKairo Hardware with Navigation."
});
