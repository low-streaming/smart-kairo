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
              lock.querySelector('.lock-time').innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
              lock.querySelector('.lock-date').innerText = now.toLocaleDateString('de-DE', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
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
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@300;400;800&family=Rajdhani:wght@400;700&display=swap');
          
          :host { --primary: #10b981; }

          #kairo-toast-container {
            position: fixed; top: 20px; right: 20px; z-index: 200000;
            display: flex; flex-direction: column; gap: 10px; pointer-events: none;
          }
          .kairo-toast {
            background: rgba(5, 12, 18, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 15px; padding: 15px 20px;
            color: white; display: flex; align-items: center; gap: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            transform: translateY(-20px); opacity: 1; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Inter', sans-serif; pointer-events: auto; min-width: 280px;
          }
          .kairo-toast-error { border-color: rgba(255, 74, 74, 0.6); }
          .kairo-toast-success { border-color: rgba(5, 240, 160, 0.6); }
          .toast-icon {
            width: 32px; height: 32px; border-radius: 50%; background: rgba(16,185,129,0.15);
            display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'Orbitron'; font-size: 1.1rem;
          }
          .kairo-toast-error .toast-icon { background: rgba(255, 74, 74, 0.2); color: #ff4a4a; }
          .kairo-toast-success .toast-icon { background: rgba(5, 240, 160, 0.2); color: #05f0a0; }
          .toast-title { font-weight: 800; font-size: 0.9rem; margin-bottom: 2px; font-family: 'Orbitron'; letter-spacing: 1px;}
          .toast-message { font-size: 0.8rem; opacity: 0.7; }

          #kairo-lock-screen {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10001;
            background: radial-gradient(circle at center, rgba(5,16,20,0.98) 0%, rgba(1,3,5,1) 100%);
            backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px);
            display: none; flex-direction: column; align-items: center; justify-content: center;
            color: white; font-family: 'Orbitron', sans-serif;
            opacity: 0; transition: opacity 0.8s ease; cursor: pointer;
          }
          .lock-time { font-size: 7rem; font-weight: 900; background: linear-gradient(180deg, #ffffff 30%, #5caaa0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 50px rgba(16,185,129,0.2); margin: 0; }
          .lock-date { font-size: 1.6rem; font-weight: 300; font-family: 'Inter'; opacity: 0.6; margin-top: 10px; }
          .lock-hint { position: absolute; bottom: 60px; font-size: 0.9rem; letter-spacing: 5px; color: #10b981; animation: pulseHint 2s infinite; }
          @keyframes pulseHint { 0%, 100% { opacity: 0.4; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-5px); } }

          #kairo-fab {
            position: fixed; bottom: 40px; right: 40px; z-index: 10000;
            width: 65px; height: 65px; border-radius: 50%;
            background: rgba(16, 185, 129, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(16,185,129,0.5);
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            box-shadow: 0 15px 45px rgba(0,0,0,0.6);
            color: #10b981; font-family: 'Orbitron'; font-weight: 900; font-size: 1rem;
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-shadow: 0 0 10px rgba(16,185,129,0.5);
          }
          #kairo-fab:hover { transform: scale(1.15) rotate(5deg); background: rgba(16,185,129,0.2); border-color: #05f0a0; box-shadow: 0 20px 50px rgba(16,185,129,0.3); }

          .kairo-os {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at center, #051014 0%, #010305 100%);
            font-family: 'Inter', sans-serif; display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: white;
            overflow: hidden; z-index: 9999; transition: 0.6s ease;
          }
          
          .kairo-os::before {
            content: ''; position: absolute; width: 900px; height: 900px;
            background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(0,0,0,0) 65%);
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            animation: pulseOrb 12s infinite alternate ease-in-out; z-index: 0; pointer-events: none;
          }
          @keyframes pulseOrb { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; } 100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; } }

          .grid {
            position: absolute; width: 200%; height: 200%;
            background-image: linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
            background-size: 50px 50px; transform: perspective(600px) rotateX(60deg);
            animation: moveGrid 30s linear infinite; z-index: 1;
          }
          @keyframes moveGrid { from { transform: perspective(600px) rotateX(60deg) translateY(0); } to { transform: perspective(600px) rotateX(60deg) translateY(50px); } }

          .content-shell {
            position: relative; z-index: 10; text-align: center; display: flex; flex-direction: column; align-items: center; width: 100%; padding: 0 20px; box-sizing: border-box; margin-bottom: 80px; 
            animation: slideUpFade 1.2s forwards;
          }
          @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }

          .top-bar { position: absolute; top: 30px; left: 30px; right: 30px; display: flex; justify-content: space-between; align-items: center; z-index: 20; }
          .logo { width: 90px; filter: drop-shadow(0 0 20px var(--primary)); margin-bottom: 10px; animation: pulse 4s infinite ease-in-out; }
          @keyframes pulse { 0%, 100% { filter: drop-shadow(0 0 20px rgba(16,185,129,0.4)); transform: scale(1); } 50% { filter: drop-shadow(0 0 40px rgba(16,185,129,0.8)); transform: scale(1.05); } }

          h1 { font-family: 'Orbitron', sans-serif; font-size: 3.0rem; font-weight: 900; margin: 0; letter-spacing: -1px; background: linear-gradient(180deg, #ffffff 30%, #5caaa0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 40px rgba(16, 185, 129, 0.3); }

          .glass-panel { background: rgba(5, 12, 18, 0.55); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.04); border-top: 1px solid rgba(255, 255, 255, 0.15); border-radius: 40px; padding: 35px; margin-top: 25px; width: 100%; max-width: 680px; box-shadow: 0 40px 100px rgba(0,0,0,0.95); }
          .hub-badge { display: inline-flex; align-items: center; gap: 8px; font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 900; letter-spacing: 4px; color: var(--primary); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 18px; border-radius: 50px; margin-bottom: 25px; }
          .pulse-dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 10px var(--primary); animation: dotPulse 2s infinite; }
          @keyframes dotPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } }
          
          .news-text { font-size: 1.2rem; font-weight: 300; line-height: 1.5; margin-bottom: 25px; color: rgba(255,255,255,0.9); min-height: 55px; }
          .social-container { display: flex; gap: 15px; width: 100%; margin-bottom: 25px; }
          .social-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; border-radius: 15px; font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 0.9rem; letter-spacing: 2px; cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); color: white; }
          .social-btn:hover { transform: translateY(-5px) scale(1.02); }
          .tiktok-btn:hover { background: rgba(255, 0, 80, 0.15); border-color: rgba(255, 0, 80, 0.5); text-shadow: 0 0 15px rgba(255,0,80,0.8); }
          .youtube-btn:hover { background: rgba(255, 0, 0, 0.15); border-color: rgba(255, 0, 0, 0.5); text-shadow: 0 0 15px rgba(255,0,0,0.8); }

          .system-stats { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 30px; }
          .stat-item { display: flex; flex-direction: column; align-items: center; flex: 1; cursor: pointer; transition: 0.4s; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px 10px; border-radius: 20px; }
          .stat-item:hover { transform: translateY(-8px); background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3); }
          .stat-icon { color: var(--primary); margin-bottom: 12px; opacity: 0.8; transition: 0.4s; }
          .stat-value { font-family: 'Orbitron', sans-serif; font-size: 1.4rem; font-weight: 900; color: white; margin-bottom: 4px; }
          .stat-label { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }

          .start-btn { background: var(--primary); color: #000; padding: 18px 40px; border-radius: 20px; font-weight: 900; font-size: 1.15rem; border: none; cursor: pointer; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); transition: 0.4s; font-family: 'Orbitron', sans-serif; letter-spacing: 2px; width: 100%; }
          .start-btn:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.6); }

          .footer { margin-top: 20px; font-family: 'Orbitron', sans-serif; font-size: 0.65rem; opacity: 0.4; letter-spacing: 2px; text-transform: uppercase; color: #fff; }

          .dock-container {
            position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 20px; background: rgba(255,255,255,0.03); backdrop-filter: blur(35px); border: 1px solid rgba(255,255,255,0.05);
            padding: 15px 35px; border-radius: 40px; z-index: 100;
          }
          .dock-item { display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); cursor: pointer; transition: 0.3s; min-width: 70px; }
          .dock-item:hover { color: var(--primary); transform: translateY(-10px) scale(1.15); }
          .dock-icon { --mdc-icon-size: 32px; margin-bottom: 8px; }
          .dock-label { font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 600; opacity: 0; transition: 0.3s; }
          .dock-item:hover .dock-label { opacity: 1; }

          @media (max-width: 768px) {
            h1 { font-size: 2.2rem; }
            .content-shell { margin-bottom: 120px; }
            .dock-container { bottom: 20px; width: 90%; overflow-x: auto; }
          }
        </style>
        
        <div class="kairo-os" id="os-container">
          <div class="grid"></div>
          
          <div class="top-bar">
            <div style="color: var(--primary); font-family: 'Orbitron'; font-size: 1rem; font-weight: 900; letter-spacing: 4px;">OK<span style="opacity:0.5">_SYS</span></div>
            <div style="color: white; opacity: 0.5; font-family: 'Orbitron'; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px;">ONLINE</div>
          </div>

          <div class="content-shell">
            <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo">
            <h1>OPENKAIRO <span style="color:var(--primary)">OS</span></h1>
            
            <div class="glass-panel">
              <div class="hub-badge"><span class="pulse-dot"></span> INTELLIGENCE HUB</div>
              <div id="update-banner"></div>
              <div class="news-text" id="news">Stelle Verbindung her...</div>

              <div class="social-container">
                 <div class="social-btn tiktok-btn" id="tiktok-btn">
                    <ha-icon icon="mdi:video-vintage"></ha-icon>
                    <span>TIKTOK</span>
                 </div>
                 <div class="social-btn youtube-btn" id="youtube-btn">
                    <ha-icon icon="mdi:youtube"></ha-icon>
                    <span>YOUTUBE</span>
                 </div>
              </div>

              <div class="system-stats">
                <div class="stat-item" id="dev-btn">
                  <div class="stat-icon"><ha-icon icon="mdi:devices"></ha-icon></div>
                  <div class="stat-value" id="dev-val">0</div>
                  <div class="stat-label">GERÄTE</div>
                </div>
                <div class="stat-item" id="auto-btn">
                  <div class="stat-icon"><ha-icon icon="mdi:robot"></ha-icon></div>
                  <div class="stat-value" id="auto-val">0</div>
                  <div class="stat-label">ROUTINEN</div>
                </div>
                <div class="stat-item" id="ent-btn">
                  <div class="stat-icon"><ha-icon icon="mdi:cube-outline"></ha-icon></div>
                  <div class="stat-value" id="ent-val">0</div>
                  <div class="stat-label">ENTITÄTEN</div>
                </div>
              </div>
              
              <button class="start-btn" id="go">DASHBOARD AUFRUFEN</button>
            </div>
            
            <div class="footer" id="foot">CORE: V4.1.2 | STATUS: CONNECTED | PL-SYS READY</div>
          </div>
          
          <div class="dock-container" id="auto-dock"></div>
        </div>

        <div id="kairo-toast-container"></div>
        <div id="kairo-lock-screen">
          <div class="lock-time">--:--</div>
          <div class="lock-date">KAIRO OS</div>
          <div class="lock-hint">CLICK TO UNLOCK</div>
        </div>
        <div id="kairo-fab">SYS</div>
      `;

      // Static Handlers
      this.shadowRoot.getElementById('go').onclick = () => {
        const osLayer = this.shadowRoot.getElementById('os-container');
        osLayer.style.opacity = '0';
        osLayer.style.pointerEvents = 'none';
        osLayer.style.transform = 'scale(1.05)';
        setTimeout(() => { osLayer.style.display = 'none'; }, 600);
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
           osLayer.style.transform = 'scale(1)';
           osLayer.style.pointerEvents = 'auto';
         }, 10);
      };

      if (window.KairoOS) {
         window.KairoOS.launchpad = this.shadowRoot.getElementById('os-container');
      }
    }

    try {
      if (!hass || !hass.states) return;
      this._hass = hass; 

      const shadow = this.shadowRoot;
      const updateBanner = shadow.getElementById('update-banner');
      const updateEntities = Object.keys(this._hass.states).filter(k => k.startsWith('update.') && this._hass.states[k].state === 'on');
      
      if (updateEntities.length > 0) {
        const up = this._hass.states[updateEntities[0]];
        const title = up.attributes.title || up.attributes.friendly_name || "System";
        if (updateBanner) {
          updateBanner.innerHTML = `<div id="update-click-btn" style="cursor: pointer; background: rgba(255, 0, 80, 0.05); border: 1px solid rgba(255, 0, 80, 0.3); border-radius: 20px; padding: 15px; margin-bottom: 25px; color:#ff4a4a; display:flex; flex-direction:column; align-items:center;">
             <div style="font-family:'Orbitron'; font-weight:900; letter-spacing:2px; font-size:0.75rem; margin-bottom:8px;">SYSTEM-UPDATE VERFÜGBAR</div>
             <span style="color:rgba(255,255,255,0.8); font-size: 0.85rem; font-weight:600;">${title} (v${up.attributes.latest_version})</span>
          </div>`;
          shadow.getElementById('update-click-btn').onclick = () => {
            const event = new Event('hass-more-info', { bubbles: true, composed: true });
            event.detail = { entityId: updateEntities[0] };
            this.dispatchEvent(event);
          };
        }
      } else {
         if (updateBanner) updateBanner.innerHTML = '';
      }
      
      if (!this._logInterval) {
         this._logInterval = setInterval(() => {
             const stats = shadow.getElementById('news');
             if (!stats || !this._hass) return;
             const liveStates = Object.values(this._hass.states);
             const dynamicLogs = [
                `ÜBERWACHE <span style="color:var(--primary)">${liveStates.length}</span> ENTITÄTEN...`,
                'Lokaler OpenKairo-Core <span style="color:#05f0a0">STABIL</span>.',
                'Sicherheitsprotokolle <span style="color:var(--primary)">AKTIV</span>.',
                'Subroutinen arbeiten <span style="color:#ff0050">FEHLERFREI</span>.',
                'System-Layer <span style="color:var(--primary)">V4.1.2</span> ONLINE.'
             ];
             const nextLog = dynamicLogs[Math.floor(Math.random() * dynamicLogs.length)];
             stats.innerHTML = `<i>"${nextLog}"</i>`;
         }, 5000); 
         shadow.getElementById('news').innerHTML = `<i>"Neural-Core synchronisiert..."</i>`;
      }

      const totalEntities = Object.values(hass.states).length;
      const totalAutos = Object.values(hass.states).filter(s => s.entity_id.startsWith('automation.')).length;
      
      shadow.getElementById('dev-val').innerText = hass.devices ? Object.keys(hass.devices).length : "-";
      shadow.getElementById('auto-val').innerText = totalAutos;
      shadow.getElementById('ent-val').innerText = totalEntities;

      // Dock Logic
      const dock = shadow.getElementById('auto-dock');
      if (dock && hass.panels) {
        let dockHtml = '';
        const paths = Object.keys(hass.panels).filter(p => !['lovelace', 'profile', 'config'].includes(p)).slice(0, 5);
        paths.forEach(path => {
           const p = hass.panels[path];
           dockHtml += `
             <div class="dock-item" data-path="/${path}">
               <ha-icon icon="${p.icon || 'mdi:view-dashboard'}" class="dock-icon"></ha-icon>
               <span class="dock-label">${p.title || path}</span>
             </div>
           `;
        });
        dockHtml += `<div class="dock-item" data-path="/config"><ha-icon icon="mdi:cog" class="dock-icon"></ha-icon><span class="dock-label">System</span></div>`;
        dock.innerHTML = dockHtml;
        shadow.querySelectorAll('.dock-item').forEach(item => {
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
