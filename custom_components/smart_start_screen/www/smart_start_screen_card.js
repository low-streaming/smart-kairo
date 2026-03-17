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
          }

          .logo {
            width: 140px;
            filter: drop-shadow(0 0 20px var(--primary));
            margin-bottom: 20px;
            animation: pulse 4s infinite ease-in-out;
            background: transparent;
            border: none;
          }

          @keyframes pulse {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.4)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 40px rgba(16, 185, 129, 0.8)); transform: scale(1.05); }
          }

          h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 4rem;
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
            padding: 50px;
            margin-top: 40px;
            max-width: 650px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(16, 185, 129, 0.05);
            transition: 0.3s;
          }
          
          .glass-panel:hover {
            border-color: rgba(16, 185, 129, 0.4);
            box-shadow: 0 30px 70px rgba(0,0,0,0.9), inset 0 0 60px rgba(16, 185, 129, 0.1);
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
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 1px;
          }

          .start-btn:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 20px 50px rgba(16, 185, 129, 0.6);
            background: #12d494;
          }

          .footer {
            margin-top: 60px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            opacity: 0.2;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          
          .ha-toast {
            display: none !important;
          }
        </style>
        <div class="kairo-os">
          <div class="grid"></div>
          <div class="content-shell">
            <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo">
            <h1>OPENKAIRO <span style="color:var(--primary)">OS</span></h1>
            
            <div class="glass-panel">
              <div style="color:var(--primary); font-family: 'Orbitron', sans-serif; font-weight:900; letter-spacing:4px; font-size:0.75rem; margin-bottom:15px; opacity:0.8;">// LATEST GITHUB PUSH //</div>
              <div class="news-text" id="news">Verbinde mit Core...</div>
              <button class="start-btn" id="go">INITIALISIEREN</button>
            </div>
            
            <div class="footer" id="foot">CORE: 2.0.4 | NODE_ID: UNKNOWN | STATUS: CONNECTING</div>
          </div>
        </div>
      `;
      this.cardContent = this.querySelector('#news');
      this.cardFooter = this.querySelector('#foot');
      
      this.querySelector('#go').onclick = () => {
        this.querySelector('#go').innerText = "SYSTEM BOOT...";
        this.querySelector('#go').style.transform = "scale(0.95)";
        setTimeout(() => {
          window.location.href = '/dashboard-openkairo/home';
        }, 600);
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
  name: "OpenKairo OS Welcome",
  description: "The custom Launchpad for OpenKairo Hardware."
});
