// --- OPENKAIRO OS LAUNCHPAD V5.1.0 "CYBER" ---
console.log("%c 🚀 KAIRO OS V5.1.0 CYBER LOADING ", "background: #00ff9d; color: #000; font-weight: bold; padding: 5px;");

if (!window.openKairoHelpers) {
  window.openKairoHelpers = {
    capitalize: (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '',
    formatCond: (s) => {
      const translations = {
        'clear-day': 'Sonnig', 'clear-night': 'Klar', 'partly-cloudy-day': 'Leicht bewölkt',
        'partly-cloudy-night': 'Leicht bewölkt', 'cloudy': 'Bewölkt', 'fog': 'Nebelig',
        'rain': 'Regen', 'sleet': 'Schneeregen', 'snow': 'Schnee', 'wind': 'Windig',
        'hail': 'Hagel', 'thunderstorm': 'Gewitter', 'dry': 'Trocken'
      };
      return translations[s] || (s ? s.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '');
    }
  };
}

class OpenKairoCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) { 
    this._config = config || {}; 
    if (this.initialized) this.render();
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
    const config = this._config || {};
    const entities = Object.keys(this._hass.states).sort();
    this.shadowRoot.innerHTML = `
      <style>
        .config { padding: 20px; font-family: 'Outfit', sans-serif; background: #0a0c10; color: #eee; border-radius: 12px; }
        .row { margin-bottom: 24px; }
        label { display: block; font-size: 11px; font-weight: 800; color: #00ff9d; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1.5px; }
        input { 
          width: 100%; padding: 12px; border-radius: 8px; 
          background: #151921; color: #fff; border: 1px solid #333; 
          outline: none; font-family: inherit; font-size: 14px; box-sizing: border-box;
        }
        input:focus { border-color: #00ff9d; box-shadow: 0 0 0 2px rgba(0, 255, 157, 0.2); }
        .success-msg { color: #00ff9d; font-size: 12px; font-weight: bold; margin-top: 10px; display: none; }
      </style>
      <div class="config">
        <h3 style="margin-top:0; color: white; border-bottom: 1px solid #333; padding-bottom: 10px; font-family: 'Orbitron';">OS Configuration V5.1</h3>
        
        <datalist id="all-entities">${entities.map(e => `<option value="${e}"></option>`).join('')}</datalist>
        <datalist id="weather-entities">${entities.filter(e => e.startsWith('weather.')).map(e => `<option value="${e}"></option>`).join('')}</datalist>
        <datalist id="update-entities">${entities.filter(e => e.startsWith('update.') || e.includes('status')).map(e => `<option value="${e}"></option>`).join('')}</datalist>

        <div class="row">
          <label>Netz-Verbrauch (W)</label>
          <input type="text" id="energy_main_entity" list="all-entities" value="${config.energy_main_entity || ''}" placeholder="-- Sensor suchen --" autocomplete="off">
        </div>
        <div class="row">
          <label>Solar-Erzeugung (W)</label>
          <input type="text" id="energy_solar_entity" list="all-entities" value="${config.energy_solar_entity || ''}" placeholder="-- Sensor suchen --" autocomplete="off">
        </div>
        <div class="row">
          <label>Wetter-Entität</label>
          <input type="text" id="weather_entity" list="weather-entities" value="${config.weather_entity || ''}" placeholder="-- Wetter suchen --" autocomplete="off">
        </div>
        <div class="row">
          <label>Update-Entität (Opt.)</label>
          <input type="text" id="update_entity" list="update-entities" value="${config.update_entity || ''}" placeholder="z.B. update.openkairo_os" autocomplete="off">
        </div>
        <div class="row">
          <label>Wetter PLZ (Fallback)</label>
          <input type="text" id="weather_plz" value="${config.weather_plz || ''}" placeholder="z.B. 10117" autocomplete="off">
        </div>
        <div id="success" class="success-msg">✓ Konfiguration Gespeichert</div>
      </div>
    `;
    
    ['energy_main_entity', 'energy_solar_entity', 'weather_entity', 'update_entity', 'weather_plz'].forEach(id => {
      const el = this.shadowRoot.getElementById(id);
      if (el) {
        el.addEventListener('change', (ev) => {
          const newConfig = { ...this._config, [id]: ev.target.value };
          this._config = newConfig;
          this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
          const s = this.shadowRoot.getElementById('success');
          if(s) { s.style.display = 'block'; setTimeout(() => s.style.display = 'none', 2000); }
        });
      }
    });
  }
}
if (!customElements.get('openkairo-card-editor')) customElements.define('openkairo-card-editor', OpenKairoCardEditor);

class OpenKairoCard extends HTMLElement {
  constructor() {
    super();
    this.initialized = false;
  }
  static getConfigElement() { return document.createElement("openkairo-card-editor"); }
  static getStubConfig() { return { energy_main_entity: "", energy_solar_entity: "", weather_entity: "" }; }

  setConfig(config) { 
    this._config = config; 
    let plz = config.weather_plz;
    if (!plz && config.weather_entity && /^\d{5}$/.test(config.weather_entity)) plz = config.weather_entity;
    if (plz) this.fetchDirectWeather(plz);
  }
  
  set editMode(editMode) {
    this._editMode = editMode;
    if (this.shadowRoot) {
      const os = this.shadowRoot.getElementById('os-container');
      if (os) {
        os.style.position = editMode ? 'relative' : 'fixed';
        os.style.zIndex = editMode ? '1' : '9999';
        os.style.borderRadius = editMode ? '24px' : '0px';
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.initialized) {
      this.initialized = true;
      this.attachShadow({ mode: 'open' });
      this.render();
      setTimeout(() => {
        const p = this.getRootNode();
        if (p && p.host && p.host.tagName === 'HUI-CARD-PREVIEW') this.editMode = true;
      }, 100);
    }
    this.updateData();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Orbitron:wght@400;700;900&display=swap');
        :host { 
          --primary: #00ff9d; 
          --accent: #05f0a0; 
          --warning: #ffb800;
          --font-main: 'Outfit', sans-serif;
          --font-tech: 'Orbitron', sans-serif;
          --glass: rgba(10, 15, 20, 0.45);
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-heavy: rgba(15, 20, 25, 0.7);
          display: block;
        }
        
        .kairo-os { 
          position: fixed; inset: 0; background: #020406; 
          font-family: var(--font-main); display: flex; z-index: 9999; 
          padding: 6vh 6vw; gap: 60px; color: white; overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mesh {
          position: absolute; inset: 0; z-index: 0; opacity: 0.6;
          background: 
            radial-gradient(at 10% 10%, hsla(161, 100%, 50%, 0.12) 0, transparent 50%), 
            radial-gradient(at 90% 90%, hsla(161, 100%, 50%, 0.08) 0, transparent 50%),
            radial-gradient(at 50% 50%, hsla(210, 100%, 10%, 1) 0, transparent 100%);
          filter: blur(60px); animation: meshMove 20s infinite alternate;
        }
        @keyframes meshMove {
          0% { transform: scale(1) translate(0,0); }
          100% { transform: scale(1.2) translate(2%, 2%); }
        }

        .left { flex: 4; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 10; }
        .branding { display: flex; align-items: center; gap: 20px; font-family: var(--font-tech); font-weight: 900; font-size: 1.8rem; letter-spacing: 2px; margin-bottom: 50px; }
        
        .clock-area { margin-bottom: 50px; animation: slideIn 0.8s ease-out; }
        .clock { font-family: var(--font-tech); font-size: 8.5rem; font-weight: 900; letter-spacing: -2px; margin: 0; line-height: 0.9; text-shadow: 0 0 30px rgba(0,255,157,0.3); }
        .date { opacity: 0.7; text-transform: uppercase; letter-spacing: 6px; font-size: 1rem; margin-top: 20px; font-weight: 800; color: var(--primary); }
        .weather { margin-top: 25px; font-weight: 600; font-size: 1.3rem; display: flex; align-items: center; gap: 12px; opacity: 0.9; }

        .status-row { display: flex; align-items: center; gap: 20px; margin-top: 10px; }

        .health { 
          background: rgba(0, 255, 157, 0.03); border: 1px solid rgba(0, 255, 157, 0.15); 
          padding: 14px 28px; border-radius: 100px; width: fit-content; font-size: 0.85rem; 
          font-weight: 900; letter-spacing: 3px; color: var(--primary); font-family: var(--font-tech);
          display: flex; align-items: center; gap: 15px; position: relative; overflow: hidden;
        }
        .health::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,255,157,0.1), transparent);
          animation: scan 3s infinite linear;
        }
        @keyframes scan { 0% { left: -100%; } 100% { left: 100%; } }
        .health-dot { width: 10px; height: 10px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 15px var(--primary); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.6); } }

        .update-badge {
          background: rgba(255, 184, 0, 0.1); border: 1px solid rgba(255, 184, 0, 0.4);
          padding: 14px 28px; border-radius: 100px; color: var(--warning); font-family: var(--font-tech);
          font-size: 0.85rem; font-weight: 900; letter-spacing: 2px; display: none; align-items: center; gap: 10px;
          animation: pulseUpdate 2s infinite ease-in-out; cursor: pointer;
        }
        @keyframes pulseUpdate { 0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 184, 0, 0.2); } 50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 184, 0, 0.4); } }

        .right { flex: 6; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto auto; gap: 30px; position: relative; z-index: 10; align-content: center; }
        .bento { 
          background: var(--glass); backdrop-filter: blur(40px) saturate(180%); -webkit-backdrop-filter: blur(40px) saturate(180%); 
          border: 1px solid var(--glass-border); border-top: 1px solid rgba(255,255,255,0.15); 
          border-radius: 32px; padding: 40px; transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); 
          cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; 
          position: relative; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        }
        .bento:hover { transform: translateY(-10px) scale(1.02); border-color: rgba(0, 255, 157, 0.3); box-shadow: 0 35px 70px rgba(0,0,0,0.5); }

        .energy { grid-column: span 2; flex-direction: row; align-items: center; padding: 45px 55px; background: linear-gradient(145deg, rgba(0,255,157,0.08) 0%, rgba(0,0,0,0) 70%); }
        .energy-val { font-family: var(--font-tech); font-size: 5rem; font-weight: 900; line-height: 1; margin: 15px 0; letter-spacing: -2px; }
        .energy-label { font-size: 1rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 4px; font-weight: 900; display: flex; align-items: center; gap: 12px; }
        
        .energy-visual { position: absolute; right: 0; bottom: 0; width: 100%; height: 60px; opacity: 0.2; pointer-events: none; }
        .energy-visual svg { width: 100%; height: 100%; }

        .stat-card { min-height: 200px; }
        .stat-label { font-size: 0.95rem; opacity: 0.5; text-transform: uppercase; font-weight: 900; letter-spacing: 3px; display: flex; align-items: center; gap: 12px; }
        .stat-val { font-family: var(--font-tech); font-size: 4.2rem; font-weight: 900; line-height: 1; letter-spacing: -1px; margin-top: 10px; }
        .stat-sub { font-size: 0.9rem; font-weight: 700; letter-spacing: 2px; color: var(--primary); margin-top: 8px; opacity: 0.8; }

        .btn-main { 
          grid-column: span 2; background: linear-gradient(135deg, var(--primary) 0%, #009e62 100%); 
          color: #010408; font-weight: 900; display: flex; align-items: center; justify-content: center; 
          font-size: 1.5rem; letter-spacing: 5px; border: none; height: 100px; border-radius: 24px;
          box-shadow: 0 20px 45px rgba(0, 255, 157, 0.25); text-transform: uppercase; font-family: var(--font-tech);
        }
        .btn-main:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0, 255, 157, 0.4); filter: brightness(1.1); }

        #kairo-fab { 
          position: fixed; bottom: 40px; right: 40px; width: 70px; height: 70px; 
          background: var(--glass-heavy); border-radius: 22px; display: flex; align-items: center; 
          justify-content: center; z-index: 10000; cursor: pointer; font-family: var(--font-tech);
          font-weight: 900; border: 1px solid var(--glass-border); color: white; 
          backdrop-filter: blur(25px); transition: 0.4s; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        #kairo-fab:hover { background: var(--primary); color: #000; transform: rotate(90deg); border-radius: 50%; }

        @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

        @media (max-width: 1000px) {
           .kairo-os { flex-direction: column; overflow-y: auto; padding: 40px 30px; gap: 40px; }
           .clock { font-size: 6rem; }
           .right { grid-template-columns: 1fr; }
           .energy, .btn-main { grid-column: span 1; }
        }
      </style>

      <div class="kairo-os" id="os-container">
        <div class="mesh"></div>
        <div class="left">
          <div class="top">
            <div class="branding">
               <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" style="width:65px; filter: drop-shadow(0 0 15px rgba(0,255,157,0.4));">
               <div>KAIRO <span style="color:var(--primary)">OS</span></div>
            </div>
            <div class="clock-area">
              <div class="clock" id="clock">--:--</div>
              <div class="date" id="date">--</div>
              <div class="weather">
                <ha-icon id="weather-icon" icon="mdi:weather-cloudy" style="--mdc-icon-size: 32px; color: var(--primary);"></ha-icon> 
                <span id="weather-text">SYSTEM LOADING...</span>
              </div>
            </div>
          </div>
          <div class="status-row">
            <div class="health">
              <div class="health-dot"></div>
              SYSTEM OPTIMAL // READY
            </div>
            <div class="update-badge" id="update-indicator">
              <ha-icon icon="mdi:package-down"></ha-icon> UPDATE AVAILABLE
            </div>
          </div>
        </div>

        <div class="right">
          <div class="bento energy">
            <div>
              <div class="energy-label"><ha-icon icon="mdi:flash-outline" style="--mdc-icon-size: 18px;"></ha-icon> Power Matrix</div>
              <div class="energy-val" id="p-main">0 W</div>
              <div class="stat-sub">SOLAR: <span id="p-solar">0 W</span></div>
            </div>
            <div class="energy-visual">
               <svg viewBox="0 0 400 100" preserveAspectRatio="none">
                  <path id="energy-wave" d="M0,50 Q100,20 200,50 T400,50" fill="none" stroke="var(--primary)" stroke-width="2" opacity="0.5">
                    <animate attributeName="d" dur="3s" repeatCount="indefinite" values="M0,50 Q100,20 200,50 T400,50; M0,50 Q100,80 200,50 T400,50; M0,50 Q100,20 200,50 T400,50" />
                  </path>
               </svg>
            </div>
            <ha-icon icon="mdi:lightning-bolt" style="position: absolute; right: 40px; color:var(--primary); --mdc-icon-size:70px; opacity: 0.15; filter: blur(2px);"></ha-icon>
          </div>

          <div class="bento stat-card">
            <div class="stat-label"><ha-icon icon="mdi:chip" style="--mdc-icon-size: 18px;"></ha-icon> Infrastruktur</div>
            <div class="stat-val" id="v-dev">0</div>
            <div class="stat-sub">NODES ONLINE</div>
          </div>
          
          <div class="bento stat-card">
            <div class="stat-label"><ha-icon icon="mdi:gauge" style="--mdc-icon-size: 18px;"></ha-icon> Klima</div>
            <div class="stat-val" id="v-hum">--</div>
            <div class="stat-sub">WIND: <span id="v-wind">-- km/h</span></div>
          </div>

          <div class="bento btn-main" id="go">
            DASHBOARD INITIALISIEREN <ha-icon icon="mdi:arrow-right" style="margin-left: 20px; --mdc-icon-size: 32px;"></ha-icon>
          </div>
        </div>
      </div>
      <div id="kairo-fab">SYS</div>
    `;

    this.shadowRoot.getElementById('go').onclick = () => { 
      const container = this.shadowRoot.getElementById('os-container');
      container.style.opacity = '0';
      container.style.transform = 'scale(1.1)';
      setTimeout(() => { container.style.display = 'none'; }, 500);
    };
    this.shadowRoot.getElementById('kairo-fab').onclick = () => { 
      const container = this.shadowRoot.getElementById('os-container');
      container.style.display = 'flex'; 
      setTimeout(() => { container.style.opacity = '1'; container.style.transform = 'scale(1)'; }, 10);
    };
    
    setInterval(() => {
      const now = new Date();
      const clock = this.shadowRoot.getElementById('clock');
      const date = this.shadowRoot.getElementById('date');
      if(clock) clock.innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
      if(date) date.innerText = now.toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long'});
      
      let plz = this._config?.weather_plz;
      if (!plz && this._config?.weather_entity && /^\d{5}$/.test(this._config.weather_entity)) plz = this._config.weather_entity;
      if (plz && now.getMinutes() % 15 === 0 && now.getSeconds() === 0) this.fetchDirectWeather(plz);
    }, 1000);
  }

  async fetchDirectWeather(plz) {
    if (!plz || this._fetchingWeather) return;
    this._fetchingWeather = true;
    try {
      const geoResp = await fetch(`https://api.zippopotam.us/de/${plz}`);
      const geoData = await geoResp.json();
      if (geoData?.places?.length > 0) {
        const { latitude, longitude } = geoData.places[0];
        const weatherResp = await fetch(`https://api.brightsky.dev/current_weather?lat=${latitude}&lon=${longitude}`);
        const weatherData = await weatherResp.json();
        if (weatherData?.weather) {
          this._directWeather = weatherData.weather;
          this.updateData();
        }
      }
    } catch (e) {
      console.error("KAIRO Weather Error", e);
    } finally { this._fetchingWeather = false; }
  }

  _getWeatherIcon(condition) {
    const map = {
      'clear-day': 'mdi:weather-sunny', 'clear-night': 'mdi:weather-night', 'partly-cloudy-day': 'mdi:weather-partly-cloudy',
      'partly-cloudy-night': 'mdi:weather-night-partly-cloudy', 'cloudy': 'mdi:weather-cloudy', 'fog': 'mdi:weather-fog',
      'rain': 'mdi:weather-rainy', 'sleet': 'mdi:weather-snowy-rainy', 'snow': 'mdi:weather-snowy', 'wind': 'mdi:weather-windy',
      'hail': 'mdi:weather-hail', 'thunderstorm': 'mdi:weather-lightning-rainy'
    };
    return map[condition] || 'mdi:weather-cloudy';
  }

  updateData() {
    if (!this._hass || !this.shadowRoot) return;
    const s = this.shadowRoot;
    const config = this._config || {};

    if(s.getElementById('v-dev')) s.getElementById('v-dev').innerText = this._hass.devices ? Object.keys(this._hass.devices).length : "-";
    
    const humEl = s.getElementById('v-hum');
    const windEl = s.getElementById('v-wind');
    const weatherText = s.getElementById('weather-text');
    const weatherIcon = s.getElementById('weather-icon');

    const w = config.weather_entity && !/^\d{5}$/.test(config.weather_entity) ? this._hass.states[config.weather_entity] : null;

    if (w && weatherText) {
      weatherText.innerText = `${Math.round(w.attributes.temperature)}°C | ${window.openKairoHelpers.formatCond(w.state)}`;
      if (weatherIcon) weatherIcon.setAttribute('icon', w.attributes.icon || 'mdi:weather-cloudy');
      if (humEl) humEl.innerText = `${w.attributes.humidity || '--'}%`;
      if (windEl) windEl.innerText = `${Math.round(w.attributes.wind_speed || 0)} km/h`;
    } else if (this._directWeather && weatherText) {
      weatherText.innerText = `${Math.round(this._directWeather.temperature)}°C | ${window.openKairoHelpers.formatCond(this._directWeather.condition)}`;
      if (weatherIcon) weatherIcon.setAttribute('icon', this._getWeatherIcon(this._directWeather.condition));
      if (humEl) humEl.innerText = `${this._directWeather.relative_humidity || '--'}%`;
      if (windEl) windEl.innerText = `${Math.round(this._directWeather.wind_speed || 0)} km/h`;
    }

    const m = config.energy_main_entity ? this._hass.states[config.energy_main_entity] : null;
    if (m && s.getElementById('p-main')) {
      const val = Math.round(parseFloat(m.state) || 0);
      s.getElementById('p-main').innerText = `${val} W`;
      s.getElementById('p-main').style.color = val < 0 ? 'var(--primary)' : 'white';
      const wave = s.getElementById('energy-wave');
      if (wave) wave.parentElement.parentElement.style.opacity = Math.min(0.5, 0.1 + Math.abs(val) / 5000);
    }
    const sol = config.energy_solar_entity ? this._hass.states[config.energy_solar_entity] : null;
    if (sol && s.getElementById('p-solar')) s.getElementById('p-solar').innerText = `${Math.round(parseFloat(sol.state) || 0)} W`;

    // Update Indicator Logic
    const upEl = s.getElementById('update-indicator');
    if (upEl) {
      let hasUpdate = false;
      const uEnt = config.update_entity ? this._hass.states[config.update_entity] : null;
      if (uEnt && (uEnt.state === 'on' || uEnt.state === 'available')) hasUpdate = true;
      
      // Also check the status sensor news for "Version" or "Update" keywords if configured
      const sEnt = this._hass.states['sensor.openkairo_os_status'];
      if (sEnt && sEnt.attributes.github_news && /version|update/i.test(sEnt.attributes.github_news)) {
         // This is a soft check, could be more robust
      }

      upEl.style.display = hasUpdate ? 'flex' : 'none';
    }
  }
}

if (!customElements.get('openkairo-card')) customElements.define('openkairo-card', OpenKairoCard);

window.customCards = window.customCards || [];
window.customCards = window.customCards.filter(c => c.type !== 'openkairo-card');
window.customCards.push({
  type: "openkairo-card",
  name: "OpenKairo OS Launchpad",
  editor: "openkairo-card-editor",
  description: "Premium Cyber OS Layer (V5.1.0)."
});
