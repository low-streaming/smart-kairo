class OpenKairoCard extends HTMLElement {
  constructor() {
    super();
    this.initialized = false;
  }

  static getConfigElement() {
    return document.createElement("openkairo-card-editor");
  }

  static getStubConfig() {
    return {
      energy_main_entity: "",
      energy_solar_entity: "",
      weather_entity: ""
    };
  }

  _initGlobalOS() {
    if (window.KairoOS && window.KairoOS.version === '4.2.0') return;
    
    window.KairoOS = {
      version: '4.2.0',
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
        requestAnimationFrame(() => toast.classList.add('kairo-toast-active'));
        setTimeout(() => {
          toast.classList.remove('kairo-toast-active');
          setTimeout(() => toast.remove(), 500);
        }, 5000);
      }
    };

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
    this._hass = hass;
    if (!this.initialized) {
      this.initialized = true;
      this.attachShadow({ mode: 'open' });
      this._initGlobalOS();
      this.render();
    }
    this.updateData();
  }

  setConfig(config) {
    this._config = config;
  }

  render() {
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

        .kairo-os {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: var(--bg-dark);
          font-family: var(--font-main);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; z-index: 9999; transition: 0.8s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .mesh-gradient {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(at 0% 0%, hsla(161, 84%, 39%, 0.15) 0, transparent 50%), 
                      radial-gradient(at 100% 0%, hsla(161, 84%, 39%, 0.1) 0, transparent 50%),
                      radial-gradient(at 50% 100%, hsla(161, 84%, 39%, 0.1) 0, transparent 50%);
          filter: blur(80px); animation: meshMove 20s infinite alternate ease-in-out;
        }
        @keyframes meshMove { 0% { transform: scale(1); } 100% { transform: scale(1.1) rotate(2deg); } }

        .hub-shell {
          position: relative; z-index: 10; width: 100%; height: 100%;
          display: flex; padding: 60px; gap: 60px; max-width: 1600px;
        }

        /* Left Panel */
        .left-panel { flex: 4; display: flex; flex-direction: column; justify-content: space-between; }
        .branding { display: flex; align-items: center; gap: 20px; }
        .logo-img { width: 80px; filter: drop-shadow(0 0 20px rgba(16,185,129,0.3)); }
        .brand-name { font-weight: 900; font-size: 1.8rem; letter-spacing: -1px; }

        .greeting-area { margin-top: 40px; }
        .greeting { font-size: 1.2rem; font-weight: 300; opacity: 0.6; }
        .clock { font-size: 6rem; font-weight: 900; margin: 0; line-height: 1; letter-spacing: -4px; }
        .date { font-size: 1.2rem; font-weight: 400; opacity: 0.5; text-transform: uppercase; letter-spacing: 2px; }
        
        .weather-info {
          margin-top: 20px; display: flex; align-items: center; gap: 15px;
          font-size: 1.1rem; font-weight: 600; opacity: 0.8;
        }
        .weather-icon { --mdc-icon-size: 32px; color: var(--accent); }

        /* Right Panel */
        .right-panel {
          flex: 6; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
          animation: slideInRight 1s 0.2s forwards cubic-bezier(0.19, 1, 0.22, 1); opacity: 0;
        }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

        .bento-card {
          background: var(--glass); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
          border: 1px solid var(--glass-border); border-radius: 32px; padding: 30px;
          transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1); cursor: pointer;
        }
        .bento-card:hover { transform: translateY(-8px); background: rgba(255,255,255,0.06); }

        .energy-card { grid-column: span 2; display: flex; flex-direction: row; align-items: center; justify-content: space-between; position: relative; overflow: hidden; }
        .energy-core { width: 80px; height: 80px; border-radius: 50%; background: rgba(16,185,129,0.1); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; position: relative; }
        .energy-pulse { position: absolute; inset: -10px; border-radius: 50%; border: 2px solid var(--accent); opacity: 0; animation: pulseCore 2s infinite; }
        @keyframes pulseCore { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
        .energy-val { font-size: 2.5rem; font-weight: 900; }
        .energy-label { font-size: 0.8rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 1px; }

        .stat-card { display: flex; flex-direction: column; justify-content: space-between; min-height: 160px; }
        .stat-header { display: flex; justify-content: space-between; opacity: 0.5; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
        .stat-val { font-size: 2.5rem; font-weight: 900; }

        .action-card { grid-column: span 2; background: var(--primary); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.4rem; border: none; letter-spacing: 1px; }

        #kairo-fab {
          position: fixed; bottom: 40px; right: 40px; width: 60px; height: 60px; border-radius: 20px;
          background: var(--glass); backdrop-filter: blur(20px); border: 1px solid var(--glass-border);
          display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-weight: 900; z-index: 10000;
        }

        @media (max-width: 1024px) {
          .hub-shell { flex-direction: column; padding: 30px; gap: 30px; overflow-y: auto; }
          .left-panel { flex: none; align-items: center; text-align: center; }
          .right-panel { flex: none; display: flex; flex-direction: column; padding-bottom: 100px; }
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
                <div class="greeting" id="greeting-text">Lade OS...</div>
                <div class="clock" id="main-clock">--:--</div>
                <div class="date" id="main-date">--. --. ----</div>
                <div class="weather-info" id="weather-row" style="display:none">
                   <ha-icon icon="mdi:weather-partly-cloudy" class="weather-icon" id="w-icon"></ha-icon>
                   <span id="w-temp">--°C</span>
                   <span style="opacity:0.4">|</span>
                   <span id="w-desc">--</span>
                </div>
              </div>
            </div>
            <div class="system-health">
              <div class="health-dot"></div>
              <div class="health-text">SYSTEM STATUS: OPTIMAL</div>
            </div>
          </div>

          <div class="right-panel">
            <div id="update-banner-container" style="grid-column: span 2; display: none;"></div>
            
            <div class="bento-card energy-card" id="energy-hub">
              <div>
                <div class="energy-label">Energie Hub</div>
                <div class="energy-val" id="power-main">0 W</div>
                <div style="font-size: 0.9rem; opacity: 0.6; margin-top: 5px;">Solar: <span id="power-solar" style="color:var(--accent)">0 W</span></div>
              </div>
              <div class="energy-core">
                <div class="energy-pulse"></div>
                <ha-icon icon="mdi:lightning-bolt" style="color:var(--accent); --mdc-icon-size:40px;"></ha-icon>
              </div>
            </div>

            <div class="bento-card stat-card" id="dev-btn">
              <div class="stat-header">Geräte <ha-icon icon="mdi:devices"></ha-icon></div>
              <div class="stat-val" id="dev-val">0</div>
            </div>
            <div class="bento-card stat-card" id="auto-btn">
              <div class="stat-header">Routinen <ha-icon icon="mdi:robot"></ha-icon></div>
              <div class="stat-val" id="auto-val">0</div>
            </div>

            <div class="bento-card action-card" id="go">DASHBOARD AUFRUFEN</div>
          </div>
        </div>
      </div>

      <div id="kairo-toast-container"></div>
      <div id="kairo-fab">SYS</div>
    `;

    this._setupHandlers();
    this._startClock();
  }

  _setupHandlers() {
    const shadow = this.shadowRoot;
    shadow.getElementById('go').onclick = () => {
      const os = shadow.getElementById('os-container');
      os.style.opacity = '0';
      os.style.transform = 'scale(1.1) blur(20px)';
      os.style.pointerEvents = 'none';
      setTimeout(() => os.style.display = 'none', 800);
    };
    shadow.getElementById('kairo-fab').onclick = () => {
      const os = shadow.getElementById('os-container');
      os.style.display = 'flex';
      setTimeout(() => {
        os.style.opacity = '1';
        os.style.transform = 'scale(1) blur(0px)';
        os.style.pointerEvents = 'auto';
      }, 10);
    };
    shadow.getElementById('dev-btn').onclick = () => window.location.href = '/config/devices/dashboard';
    shadow.getElementById('auto-btn').onclick = () => window.location.href = '/config/automation/dashboard';
  }

  _startClock() {
    setInterval(() => {
      const now = new Date();
      const hrs = now.getHours();
      let greet = "Guten Abend,";
      if (hrs < 12) greet = "Guten Morgen,";
      else if (hrs < 18) greet = "Guten Tag,";
      
      const shadow = this.shadowRoot;
      shadow.getElementById('greeting-text').innerText = greet;
      shadow.getElementById('main-clock').innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
      shadow.getElementById('main-date').innerText = now.toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long'});
    }, 1000);
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.updateData();
  }

  updateData() {
    if (!this._hass || !this.shadowRoot) return;
    const shadow = this.shadowRoot;

    // Update Clock & Greeting
    const now = new Date();
    const hrs = now.getHours();
    let greet = "Guten Abend,";
    if (hrs < 12) greet = "Guten Morgen,";
    else if (hrs < 18) greet = "Guten Tag,";
    
    const greetEl = shadow.getElementById('greeting-text');
    const clockEl = shadow.getElementById('main-clock');
    const dateEl = shadow.getElementById('main-date');
    if (greetEl) greetEl.innerText = greet;
    if (clockEl) clockEl.innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
    if (dateEl) dateEl.innerText = now.toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long'});

    // Update Stats
    const devVal = shadow.getElementById('dev-val');
    const autoVal = shadow.getElementById('auto-val');
    if (devVal) devVal.innerText = this._hass.devices ? Object.keys(this._hass.devices).length : "-";
    if (autoVal) autoVal.innerText = Object.values(this._hass.states).filter(s => s.entity_id.startsWith('automation.')).length;

    // Update Weather
    const weatherEntity = this._config.weather_entity;
    const weatherRow = shadow.getElementById('weather-row');
    if (weatherEntity && this._hass.states[weatherEntity] && weatherRow) {
      const w = this._hass.states[weatherEntity];
      weatherRow.style.display = 'flex';
      shadow.getElementById('w-temp').innerText = `${w.attributes.temperature}°C`;
      shadow.getElementById('w-desc').innerText = w.state;
    } else if (weatherRow) {
      weatherRow.style.display = 'none';
    }

    // Update Energy
    const mainPwr = this._config.energy_main_entity;
    const solarPwr = this._config.energy_solar_entity;
    const pwrMainEl = shadow.getElementById('power-main');
    const pwrSolarEl = shadow.getElementById('power-solar');
    
    if (mainPwr && this._hass.states[mainPwr] && pwrMainEl) {
      const val = parseFloat(this._hass.states[mainPwr].state) || 0;
      pwrMainEl.innerText = `${Math.round(val)} W`;
      pwrMainEl.style.color = val < 0 ? 'var(--accent)' : 'white';
    }
    if (solarPwr && this._hass.states[solarPwr] && pwrSolarEl) {
      const val = parseFloat(this._hass.states[solarPwr].state) || 0;
      pwrSolarEl.innerText = `${Math.round(val)} W`;
    }
  }

  getCardSize() { return 10; }
}

class OpenKairoCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.initialized) {
      this.initialized = true;
      this.render();
    }
  }

  render() {
    if (!this._hass) return;
    const entities = Object.keys(this._hass.states).sort();
    const weatherEntities = entities.filter(e => e.startsWith('weather.'));

    this.innerHTML = `
      <style>
        .config-container { padding: 20px; color: var(--primary-text-color); }
        .config-row { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        .config-label { font-weight: 600; font-size: 0.9rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }
        select { 
          width: 100%; padding: 12px; border-radius: 12px; 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
          color: white; font-family: inherit; font-size: 1rem; outline: none;
        }
        select:focus { border-color: #10b981; }
        .config-hint { font-size: 0.8rem; opacity: 0.4; }
      </style>
      <div class="config-container">
        <div class="config-row">
          <div class="config-label">Netz-Verbrauch (W)</div>
          <select id="energy_main_entity">
            <option value="">Nicht konfiguriert</option>
            ${entities.map(e => `<option value="${e}" ${e === this._config.energy_main_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
          <div class="config-hint">Sensor für den aktuellen Hausverbrauch vom Netz.</div>
        </div>

        <div class="config-row">
          <div class="config-label">Solar-Erzeugung (W)</div>
          <select id="energy_solar_entity">
            <option value="">Nicht konfiguriert</option>
            ${entities.map(e => `<option value="${e}" ${e === this._config.energy_solar_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
          <div class="config-hint">Sensor für die aktuelle PV-Leistung.</div>
        </div>

        <div class="config-row">
          <div class="config-label">Wetter-Dienst</div>
          <select id="weather_entity">
            <option value="">Nicht konfiguriert</option>
            ${weatherEntities.map(e => `<option value="${e}" ${e === this._config.weather_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
          <div class="config-hint">Zeigt Temperatur und Status im Launchpad.</div>
        </div>
      </div>
    `;

    ['energy_main_entity', 'energy_solar_entity', 'weather_entity'].forEach(id => {
      this.querySelector(`#${id}`).addEventListener('change', (ev) => {
        const config = { ...this._config, [id]: ev.target.value };
        const event = new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true });
        this.dispatchEvent(event);
      });
    });
  }
}

if (!customElements.get('openkairo-card')) {
  customElements.define('openkairo-card', OpenKairoCard);
}
if (!customElements.get('openkairo-card-editor')) {
  customElements.define('openkairo-card-editor', OpenKairoCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-card",
  name: "OpenKairo OS Launchpad",
  description: "Shadow-DOM Optimized OS Layer for OpenKairo (V4.2.0)."
});
