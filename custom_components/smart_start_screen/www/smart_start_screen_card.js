class OpenKairoCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@300;400;700&display=swap');
          
          :host {
            --primary: #10b981;
            --accent: #3b82f6;
            --dark: #0a0e1a;
          }

          .kairo-shell {
            background: center / cover no-repeat url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2070');
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
            color: white;
            padding: 20px;
            overflow: hidden;
            position: relative;
          }

          .overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, transparent 0%, rgba(10, 14, 26, 0.9) 100%);
            z-index: 1;
          }

          .content-box {
            position: relative;
            z-index: 2;
            text-align: center;
            max-width: 800px;
            width: 100%;
            animation: slideUp 1s cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .logo-container {
            margin-bottom: 40px;
          }

          .logo-pulse {
            width: 140px;
            filter: drop-shadow(0 0 30px var(--primary));
            animation: pulse 4s infinite ease-in-out;
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
            letter-spacing: -2px;
            background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.4) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .news-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 40px;
            padding: 50px;
            margin-top: 50px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.6);
            position: relative;
            transition: 0.4s;
          }

          .news-card::before {
            content: '';
            position: absolute;
            top: -2px; left: -2px; right: -2px; bottom: -2px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            z-index: -1;
            border-radius: 41px;
            opacity: 0.1;
          }

          .label {
            color: var(--primary);
            font-weight: 900;
            letter-spacing: 4px;
            font-size: 0.8rem;
            margin-bottom: 20px;
            display: block;
          }

          .news-msg {
            font-size: 1.8rem;
            font-weight: 300;
            line-height: 1.4;
            color: rgba(255,255,255,0.95);
            margin-bottom: 30px;
          }

          .btn-row {
            display: flex;
            gap: 20px;
            justify-content: center;
          }

          .btn {
            padding: 18px 45px;
            border-radius: 100px;
            text-decoration: none;
            font-weight: 800;
            font-size: 1.1rem;
            transition: 0.3s;
            cursor: pointer;
            border: none;
            font-family: 'Inter', sans-serif;
          }

          .btn-primary {
            background: var(--primary);
            color: white;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          }

          .btn-outline {
            background: rgba(255,255,255,0.05);
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
          }

          .btn:hover {
            transform: translateY(-4px);
            filter: brightness(1.1);
          }

          .footer {
            margin-top: 80px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            opacity: 0.3;
            letter-spacing: 2px;
          }
        </style>
        <div class="kairo-shell">
          <div class="overlay"></div>
          <div class="content-box">
            <div class="logo-container">
              <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo-pulse">
            </div>
            <h1>OPENKAIRO <span style="color:var(--primary)">OS</span></h1>
            <div class="news-card">
              <span class="label">GITHUB UPDATES</span>
              <div class="news-msg" id="news-text">Lade verschlüsselte Daten...</div>
              <div class="btn-row">
                <button class="btn btn-primary" id="btn-start">COCKPIT STARTEN</button>
                <button class="btn btn-outline" id="btn-docs">HILFE</button>
              </div>
            </div>
            <div class="footer" id="footer-text">CORE_VER: 2.0.4 | NODE_ID: UNKNOWN | ENCRYPTION: ACTIVE</div>
          </div>
        </div>
      `;
      this.content = this.querySelector('#news-text');
      this.foot = this.querySelector('#footer-text');
      this.querySelector('#btn-start').onclick = () => window.location.href = '/test/test';
      this.querySelector('#btn-docs').onclick = () => window.open('https://openkairo.de', '_blank');
    }

    const sensor = hass.states['sensor.openkairo_os_status'];
    if (sensor) {
      const news = sensor.attributes.github_news || 'System bereit.';
      const ver = sensor.attributes.version || '2.0.4';
      this.content.innerText = news;
      this.foot.innerText = `CORE_VER: ${ver} | NODE_ID: OK-${Math.floor(Math.random()*9000)+1000} | ENCRYPTION: VERIFIED`;
    }
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 10;
  }
}

customElements.define('openkairo-card', OpenKairoCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-card",
  name: "OpenKairo OS Card",
  preview: true,
  description: "Die offizielle OpenKairo Welcome Experience Card"
});
