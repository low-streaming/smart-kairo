class OpenKairoCard extends HTMLElement {
  constructor() {
    super();
    this.initialized = false;
  }

  _initGlobalOS() {
    if (window.KairoOS && window.KairoOS.version === '4.1.2') return;
    
    window.KairoOS = {
      version: '4.1.2',
      idleTime: 0,
      locked: false,
      launchpad: null,
      showToast: (title, message, type = 'info') => {
        const container = this.shadowRoot.getElementById('kairo-toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `kairo-toast kairo-toast-${type}`;
        toast.innerHTML = `
          <div class="toast-icon">${type === 'error' ? '!' : (type === 'success' ? '✓' : 'i')}</div>
          <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
          </div>
        `;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.style.transform = 'translateY(0)');
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(20px)';
          setTimeout(() => toast.remove(), 400);
        }, 5000);
      }
    };

    // OS Background Services
    if (!window.KairoOSInterval) {
        window.KairoOSInterval = setInterval(() => {
          window.KairoOS.idleTime++;
          if (window.KairoOS.idleTime > 300 && !window.KairoOS.locked) {
            this._lockMode(true);
          }
          if (window.KairoOS.locked) {
            const now = new Date();
            const lock = this.shadowRoot.getElementById('kairo-lock-screen');
            if(lock) {
              const clock = lock.querySelector('.lock-clock');
              const date = lock.querySelector('.lock-date');
              if(clock) clock.innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
              if(date) date.innerText = now.toLocaleDateString('de-DE', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
            }
          }
        }, 1000);
    }

    ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(evt => window.addEventListener(evt, () => {
      if (!window.KairoOS.locked) window.KairoOS.idleTime = 0;
    }, {passive: true}));

    setTimeout(() => window.KairoOS.showToast('OS Initialisiert', 'System-Layer V4.1.2 aktiv.', 'success'), 1500);
  }

  _lockMode(state) {
    const lock = this.shadowRoot.getElementById('kairo-lock-screen');
    if (!lock) return;
    if (state) {
      window.KairoOS.locked = true;
      lock.style.display = 'flex';
      setTimeout(() => lock.style.opacity = '1', 10);
    } else {
      lock.style.opacity = '0';
      setTimeout(() => { 
        lock.style.display = 'none'; 
        window.KairoOS.locked = false; 
        window.KairoOS.idleTime = 0; 
      }, 800);
    }
  }

  set hass(hass) {
    if (!this.initialized) {
      this.initialized = true;
      this.attachShadow({ mode: 'open' });
      this._initGlobalOS();
      
      this.shadowRoot.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;600;900&family=Inter:wght@300;400;800&display=swap');
          
          :host { 
            --primary: #10b981; 
            --accent: #05f0a0;
            --bg-dark: #020406;
            --glass: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
            --font-main: 'Outfit', sans-serif;
          }

          * { box-sizing: border-box; }

          #kairo-toast-container {
            position: fixed; top: 20px; right: 20px; z-index: 200000;
            display: flex; flex-direction: column; gap: 10px; pointer-events: none;
          }
          .kairo-toast {
            background: rgba(5, 12, 18, 0.95); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border: 1px solid var(--glass-border); border-radius: 20px; padding: 18px 25px;
            color: white; display: flex; align-items: center; gap: 15px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.6);
            transform: translateY(-20px); opacity: 0; transition: 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            font-family: var(--font-main); pointer-events: auto; min-width: 300px;
          }
          .kairo-toast-active { transform: translateY(0); opacity: 1; }
          .toast-icon { width: 32px; height: 32px; border-radius: 10px; background: rgba(16,185,129,0.1); display: flex; align-items: center; justify-content: center; font-weight: 900; }
          .toast-title { font-weight: 800; font-size: 0.95rem; margin-bottom: 2px; letter-spacing: 0.5px;}
          .toast-message { font-size: 0.85rem; opacity: 0.6; }

          .kairo-os {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: var(--bg-dark);
            font-family: var(--font-main);
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; z-index: 9999; transition: 0.8s cubic-bezier(0.19, 1, 0.22, 1);
          }

          /* Mesh Gradient Background */
          .mesh-gradient {
            position: absolute; inset: 0;
            background-color: var(--bg-dark);
            background-image: 
              radial-gradient(at 0% 0%, hsla(161, 84%, 39%, 0.15) 0, transparent 50%), 
              radial-gradient(at 50% 0%, hsla(161, 84%, 39%, 0.05) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(161, 84%, 39%, 0.15) 0, transparent 50%), 
              radial-gradient(at 0% 100%, hsla(161, 84%, 39%, 0.1) 0, transparent 50%), 
              radial-gradient(at 100% 100%, hsla(161, 84%, 39%, 0.1) 0, transparent 50%);
            filter: blur(80px);
            animation: meshMove 20s infinite alternate ease-in-out;
            z-index: 0;
          }
          @keyframes meshMove {
            0% { transform: scale(1); }
            100% { transform: scale(1.1) rotate(2deg); }
          }

          .hub-shell {
            position: relative; z-index: 10;
            width: 100%; height: 100%;
            display: flex; padding: 60px;
            gap: 60px; max-width: 1600px;
          }

          /* Left Panel */
          .left-panel {
            flex: 4; display: flex; flex-direction: column; justify-content: space-between;
            animation: slideInLeft 1s forwards cubic-bezier(0.19, 1, 0.22, 1);
          }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }

          .branding { display: flex; align-items: center; gap: 20px; }
          .logo-img { width: 80px; filter: drop-shadow(0 0 20px rgba(16,185,129,0.3)); transition: 0.5s; }
          .logo-img:hover { transform: rotate(5deg) scale(1.05); }
          .brand-name { font-weight: 900; font-size: 1.8rem; letter-spacing: -1px; }

          .greeting-area { margin-top: 40px; }
          .greeting { font-size: 1.2rem; font-weight: 300; opacity: 0.6; margin-bottom: 5px; }
          .clock { font-size: 6rem; font-weight: 900; margin: 0; line-height: 1; letter-spacing: -4px; background: linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.4) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .date { font-size: 1.2rem; font-weight: 400; opacity: 0.5; margin-top: 10px; letter-spacing: 2px; text-transform: uppercase; }

          .system-health {
            margin-top: auto; display: flex; align-items: center; gap: 12px;
            background: var(--glass); border: 1px solid var(--glass-border); padding: 15px 25px; border-radius: 100px; width: fit-content;
          }
          .health-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 15px var(--accent); animation: pulseDot 2s infinite; }
          @keyframes pulseDot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.4; } }
          .health-text { font-size: 0.8rem; font-weight: 600; letter-spacing: 1px; color: var(--accent); }

          /* Right Panel */
          .right-panel {
            flex: 6; display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: auto auto 1fr; gap: 20px;
            animation: slideInRight 1s 0.2s forwards cubic-bezier(0.19, 1, 0.22, 1); opacity: 0;
          }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

          .bento-card {
            background: var(--glass); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
            border: 1px solid var(--glass-border); border-radius: 32px; padding: 30px;
            transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1); cursor: pointer;
            display: flex; flex-direction: column; justify-content: space-between;
            animation: fadeInScale 0.6s backwards;
          }
          .bento-card:hover { transform: translateY(-8px); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); }
          
          @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          .delay-1 { animation-delay: 0.3s; }
          .delay-2 { animation-delay: 0.4s; }
          .delay-3 { animation-delay: 0.5s; }
          .delay-4 { animation-delay: 0.6s; }
          .delay-5 { animation-delay: 0.7s; }

          .update-card { grid-column: span 2; background: rgba(255, 0, 80, 0.03); border-color: rgba(255, 0, 80, 0.2); flex-direction: row; align-items: center; gap: 30px; }
          .update-card:hover { background: rgba(255, 0, 80, 0.05); border-color: rgba(255, 0, 80, 0.4); }
          .update-icon { width: 50px; height: 50px; border-radius: 15px; background: rgba(255, 0, 80, 0.1); display: flex; align-items: center; justify-content: center; color: #ff0050; }

          .stat-card { min-height: 160px; }
          .stat-header { display: flex; justify-content: space-between; align-items: flex-start; }
          .stat-icon { color: var(--primary); opacity: 0.7; --mdc-icon-size: 28px; }
          .stat-val { font-size: 2.8rem; font-weight: 900; margin-top: 15px; }
          .stat-label { font-size: 0.8rem; font-weight: 600; opacity: 0.4; letter-spacing: 1px; text-transform: uppercase; }

          .action-card { grid-column: span 2; background: var(--primary); border: none; padding: 40px; color: #000; align-items: center; justify-content: center; position: relative; overflow: hidden; }
          .action-card:hover { transform: scale(1.02); box-shadow: 0 40px 80px rgba(16, 185, 129, 0.3); }
          .action-text { font-size: 1.6rem; font-weight: 900; letter-spacing: 2px; position: relative; z-index: 5; }
          .action-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: translateX(-100%); transition: 0.6s; }
          .action-card:hover::after { transform: translateX(100%); }

          .social-links { grid-column: span 2; display: flex; gap: 15px; }
          .social-pill { flex: 1; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 100px; padding: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 800; font-size: 0.8rem; transition: 0.3s; }
          .social-pill:hover { background: rgba(255,255,255,0.1); transform: translateY(-4px); }

          /* Lock Screen */
          #kairo-lock-screen {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10001;
            background: rgba(1, 3, 5, 0.9); backdrop-filter: blur(60px); -webkit-backdrop-filter: blur(60px);
            display: none; flex-direction: column; align-items: center; justify-content: center;
            color: white; font-family: var(--font-main);
            opacity: 0; transition: 1s ease; cursor: pointer;
          }
          .lock-clock { font-size: 10rem; font-weight: 100; letter-spacing: -5px; }
          .lock-hint { position: absolute; bottom: 80px; font-size: 0.8rem; letter-spacing: 8px; opacity: 0.5; animation: blink 2s infinite; }
          @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }

          #kairo-fab {
            position: fixed; bottom: 40px; right: 40px; z-index: 10000;
            width: 50px; height: 50px; border-radius: 15px;
            background: var(--glass); backdrop-filter: blur(20px); border: 1px solid var(--glass-border);
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            color: #fff; font-family: var(--font-main); font-weight: 900; font-size: 0.7rem;
            transition: 0.4s;
          }
          #kairo-fab:hover { background: var(--primary); color: #000; border-color: var(--primary); transform: scale(1.1); }

          @media (max-width: 1024px) {
            .hub-shell { flex-direction: column; padding: 30px; gap: 30px; overflow-y: auto; }
            .left-panel { flex: none; align-items: center; text-align: center; }
            .clock { font-size: 4rem; }
            .right-panel { flex: none; display: flex; flex-direction: column; padding-bottom: 100px; }
            .bento-card { min-height: 120px; }
          }
        </style>
        
        <div class="kairo-os" id="os-container">
          <div class="mesh-gradient"></div>
          
          <div class="hub-shell">
            <div class="left-panel">
              <div class="top">
                <div class="branding">
                  <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo-img">
                  <div class="brand-name">KAIRO <span style="color:var(--primary)">OS</span></div>
                </div>
                
                <div class="greeting-area">
                  <div class="greeting" id="greeting-text">Guten Tag,</div>
                  <div class="clock" id="main-clock">--:--</div>
                  <div class="date" id="main-date">--. --. ----</div>
                </div>
              </div>
              
              <div class="system-health">
                <div class="health-dot"></div>
                <div class="health-text">SYSTEM STATUS: OPTIMAL</div>
              </div>
            </div>

            <div class="right-panel">
              <div id="update-banner-container" style="grid-column: span 2; display: none;"></div>
              
              <div class="bento-card stat-card delay-1" id="dev-btn">
                <div class="stat-header">
                  <div class="stat-label">Geräte</div>
                  <ha-icon icon="mdi:devices" class="stat-icon"></ha-icon>
                </div>
                <div class="stat-val" id="dev-val">0</div>
              </div>

              <div class="bento-card stat-card delay-2" id="auto-btn">
                <div class="stat-header">
                  <div class="stat-label">Routinen</div>
                  <ha-icon icon="mdi:robot" class="stat-icon"></ha-icon>
                </div>
                <div class="stat-val" id="auto-val">0</div>
              </div>

              <div class="bento-card stat-card delay-3" id="ent-btn">
                <div class="stat-header">
                  <div class="stat-label">Entitäten</div>
                  <ha-icon icon="mdi:cube-outline" class="stat-icon"></ha-icon>
                </div>
                <div class="stat-val" id="ent-val">0</div>
              </div>

              <div class="bento-card stat-card delay-4">
                <div class="stat-header">
                  <div class="stat-label">System</div>
                  <ha-icon icon="mdi:cog" class="stat-icon"></ha-icon>
                </div>
                <div id="nav-dock" style="display: flex; gap: 10px; margin-top: 10px; overflow-x: auto;"></div>
              </div>

              <div class="social-links delay-5">
                <div class="social-pill" id="tiktok-btn">
                  <ha-icon icon="mdi:video-vintage"></ha-icon> TIKTOK
                </div>
                <div class="social-pill" id="youtube-btn">
                  <ha-icon icon="mdi:youtube"></ha-icon> YOUTUBE
                </div>
              </div>

              <div class="bento-card action-card delay-5" id="go">
                <div class="action-text">DASHBOARD AUFRUFEN</div>
              </div>
            </div>
          </div>
        </div>

        <div id="kairo-toast-container"></div>
        <div id="kairo-lock-screen">
          <div class="lock-clock">--:--</div>
          <div class="lock-date" style="font-size: 1.5rem; opacity: 0.5; margin-top: 20px;">KAIRO OS</div>
          <div class="lock-hint">ZUM ENTSPERREN TIPPEN</div>
        </div>
        <div id="kairo-fab">SYS</div>
      `;

      // Static Handlers
      this.shadowRoot.getElementById('go').onclick = () => {
        const osLayer = this.shadowRoot.getElementById('os-container');
        osLayer.style.opacity = '0';
        osLayer.style.transform = 'scale(1.1) blur(20px)';
        osLayer.style.pointerEvents = 'none';
        setTimeout(() => { osLayer.style.display = 'none'; }, 800);
      };

      this.shadowRoot.getElementById('tiktok-btn').onclick = () => { window.open('https://www.tiktok.com/@openkairo', '_blank'); };
      this.shadowRoot.getElementById('youtube-btn').onclick = () => { window.open('https://www.youtube.com/@openkairo', '_blank'); };
      this.shadowRoot.getElementById('dev-btn').onclick = () => { window.location.href = '/config/devices/dashboard'; };
      this.shadowRoot.getElementById('auto-btn').onclick = () => { window.location.href = '/config/automation/dashboard'; };
      this.shadowRoot.getElementById('ent-btn').onclick = () => { window.location.href = '/config/entities'; };
      this.shadowRoot.getElementById('kairo-lock-screen').onclick = () => this._lockMode(false);
      this.shadowRoot.getElementById('kairo-fab').onclick = () => {
         const osLayer = this.shadowRoot.getElementById('os-container');
         osLayer.style.display = 'flex';
         setTimeout(() => {
           osLayer.style.opacity = '1';
           osLayer.style.transform = 'scale(1) blur(0px)';
           osLayer.style.pointerEvents = 'auto';
         }, 10);
      };

      // Live Clock
      setInterval(() => {
        const now = new Date();
        const hrs = now.getHours();
        let greet = "Guten Abend,";
        if (hrs < 12) greet = "Guten Morgen,";
        else if (hrs < 18) greet = "Guten Tag,";
        
        const greetEl = this.shadowRoot.getElementById('greeting-text');
        const clockEl = this.shadowRoot.getElementById('main-clock');
        const dateEl = this.shadowRoot.getElementById('main-date');
        const lockClock = this.shadowRoot.querySelector('.lock-clock');

        if (greetEl) greetEl.innerText = greet;
        if (clockEl) clockEl.innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
        if (dateEl) dateEl.innerText = now.toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long'});
        if (lockClock) lockClock.innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
      }, 1000);

      if (window.KairoOS) {
         window.KairoOS.launchpad = this.shadowRoot.getElementById('os-container');
      }
    }

    try {
      if (!hass || !hass.states) return;
      this._hass = hass; 

      const shadow = this.shadowRoot;
      const updateContainer = shadow.getElementById('update-banner-container');
      const updateEntities = Object.keys(this._hass.states).filter(k => k.startsWith('update.') && this._hass.states[k].state === 'on');
      
      if (updateEntities.length > 0) {
        const up = this._hass.states[updateEntities[0]];
        const title = up.attributes.title || up.attributes.friendly_name || "System";
        if (updateContainer) {
          updateContainer.style.display = 'block';
          updateContainer.innerHTML = `
            <div class="bento-card update-card" id="update-click-btn">
              <div class="update-icon"><ha-icon icon="mdi:update"></ha-icon></div>
              <div>
                <div style="font-weight:900; font-size:0.8rem; color:#ff0050; letter-spacing:1px;">UPDATE VERFÜGBAR</div>
                <div style="font-weight:400; font-size:1.1rem; opacity:0.8;">${title} v${up.attributes.latest_version}</div>
              </div>
            </div>`;
          shadow.getElementById('update-click-btn').onclick = () => {
            const event = new Event('hass-more-info', { bubbles: true, composed: true });
            event.detail = { entityId: updateEntities[0] };
            this.dispatchEvent(event);
          };
        }
      } else {
         if (updateContainer) updateContainer.style.display = 'none';
      }
      
      const totalEntities = Object.values(hass.states).length;
      const totalAutos = Object.values(hass.states).filter(s => s.entity_id.startsWith('automation.')).length;
      
      const devVal = shadow.getElementById('dev-val');
      const autoVal = shadow.getElementById('auto-val');
      const entVal = shadow.getElementById('ent-val');

      if (devVal) devVal.innerText = hass.devices ? Object.keys(hass.devices).length : "-";
      if (autoVal) autoVal.innerText = totalAutos;
      if (entVal) entVal.innerText = totalEntities;

      // Nav Dock Logic
      const navDock = shadow.getElementById('nav-dock');
      if (navDock && hass.panels) {
        let dockHtml = '';
        const paths = Object.keys(hass.panels).filter(p => !['lovelace', 'profile', 'config'].includes(p)).slice(0, 4);
        paths.forEach(path => {
           const p = hass.panels[path];
           dockHtml += `
             <div class="nav-item" data-path="/${path}" style="cursor:pointer; background:rgba(255,255,255,0.05); padding:10px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
               <ha-icon icon="${p.icon || 'mdi:view-dashboard'}" style="--mdc-icon-size:20px; color:var(--primary)"></ha-icon>
             </div>
           `;
        });
        navDock.innerHTML = dockHtml;
        shadow.querySelectorAll('.nav-item').forEach(item => {
           item.onclick = () => { window.location.href = item.getAttribute('data-path'); };
        });
      }

    } catch (err) { console.error("OS Error:", err); }
  }

  setConfig(config) {}
  getCardSize() { return 10; }
}

if (!customElements.get('openkairo-card')) {
  customElements.define('openkairo-card', OpenKairoCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "openkairo-card",
    name: "OpenKairo OS Launchpad",
    description: "Shadow-DOM Optimized OS Layer for OpenKairo."
  });
}
