// --- OPENKAIRO OS LAUNCHPAD V4.3.6 ---
console.log("%c 🚀 KAIRO OS V4.3.6 LOADING ", "background: #05f0a0; color: #000; font-weight: bold; padding: 5px;");

if (!window.openKairoHelpers) {
  window.openKairoHelpers = {
    capitalize: (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '',
    formatCond: (s) => {
      const translations = {
        'clear-day': 'Sonnig',
        'clear-night': 'Klar',
        'partly-cloudy-day': 'Leicht bewölkt',
        'partly-cloudy-night': 'Leicht bewölkt',
        'cloudy': 'Bewölkt',
        'fog': 'Nebelig',
        'rain': 'Regen',
        'sleet': 'Schneeregen',
        'snow': 'Schnee',
        'wind': 'Windig',
        'hail': 'Hagel',
        'thunderstorm': 'Gewitter',
        'dry': 'Trocken'
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
        .config { padding: 20px; font-family: sans-serif; background: #111; color: #eee; border-radius: 12px; }
        .row { margin-bottom: 24px; }
        label { display: block; font-size: 11px; font-weight: 800; color: #05f0a0; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1.5px; }
        input { 
          width: 100%; padding: 12px; border-radius: 8px; 
          background: #222; color: #fff; border: 1px solid #333; 
          outline: none; font-family: inherit; font-size: 14px; box-sizing: border-box;
        }
        input:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
        .success-msg { color: #10b981; font-size: 12px; font-weight: bold; margin-top: 10px; display: none; }
      </style>
      <div class="config">
        <h3 style="margin-top:0; color: white; border-bottom: 1px solid #333; padding-bottom: 10px;">OS Konfiguration</h3>
        
        <datalist id="all-entities">
          ${entities.map(e => `<option value="${e}"></option>`).join('')}
        </datalist>
        <datalist id="weather-entities">
          ${entities.filter(e => e.startsWith('weather.')).map(e => `<option value="${e}"></option>`).join('')}
        </datalist>

        <div class="row">
          <label>Netz-Verbrauch (W)</label>
          <input type="text" id="energy_main_entity" list="all-entities" value="${config.energy_main_entity || ''}" placeholder="-- Sensor suchen oder eingeben --" autocomplete="off">
        </div>
        <div class="row">
          <label>Solar-Erzeugung (W)</label>
          <input type="text" id="energy_solar_entity" list="all-entities" value="${config.energy_solar_entity || ''}" placeholder="-- Sensor suchen oder eingeben --" autocomplete="off">
        </div>
        <div class="row">
          <label>Wetter-Entität</label>
          <input type="text" id="weather_entity" list="weather-entities" value="${config.weather_entity || ''}" placeholder="-- Wetter suchen oder eingeben --" autocomplete="off">
        </div>
        <div class="row">
          <label>ODER: Wetter PLZ (Direkt)</label>
          <input type="text" id="weather_plz" value="${config.weather_plz || ''}" placeholder="z.B. 10117" autocomplete="off">
        </div>
        <div id="success" class="success-msg">✓ Gespeichert</div>
      </div>
    `;
    
    ['energy_main_entity', 'energy_solar_entity', 'weather_entity', 'weather_plz'].forEach(id => {
      const el = this.shadowRoot.getElementById(id);
      if (el) {
        el.addEventListener('change', (ev) => {
          const newConfig = { ...this._config, [id]: ev.target.value };
          this._config = newConfig;
          const event = new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true });
          this.dispatchEvent(event);
          
          const success = this.shadowRoot.getElementById('success');
          if(success) {
            success.style.display = 'block';
            setTimeout(() => success.style.display = 'none', 2000);
          }
        });
      }
    });
  }
}
if (!customElements.get('openkairo-card-editor')) {
  customElements.define('openkairo-card-editor', OpenKairoCardEditor);
}

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
      const osContainer = this.shadowRoot.getElementById('os-container');
      if (osContainer) {
        if (editMode) {
          osContainer.style.position = 'relative';
          osContainer.style.zIndex = '1';
          osContainer.style.borderRadius = '16px';
        } else {
          osContainer.style.position = 'fixed';
          osContainer.style.zIndex = '9999';
          osContainer.style.borderRadius = '0px';
        }
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.initialized) {
      this.initialized = true;
      this.attachShadow({ mode: 'open' });
      this.render();
      // Auto-detect if inside editor preview
      setTimeout(() => {
        const parent = this.getRootNode();
        if (parent && parent.host && parent.host.tagName === 'HUI-CARD-PREVIEW') {
            this.editMode = true;
        }
      }, 100);
    }
    this.updateData();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;600;800;900&display=swap');
        :host { 
          --primary: #10b981; 
          --accent: #05f0a0; 
          --font-main: 'Outfit', sans-serif;
          --glass: rgba(15, 20, 25, 0.4);
          --glass-border: rgba(255, 255, 255, 0.06);
          --glass-highlight: rgba(255, 255, 255, 0.1);
          display: block;
        }
        
        .kairo-os { 
          position: fixed; inset: 0; background: #010203; 
          font-family: var(--font-main); display: flex; z-index: 9999; 
          padding: 60px 80px; gap: 60px; color: white; overflow: hidden;
          transition: all 0.3s ease;
        }

        .mesh {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(at 0% 0%, hsla(161, 84%, 39%, 0.15) 0, transparent 40%), 
                      radial-gradient(at 100% 100%, hsla(161, 84%, 39%, 0.08) 0, transparent 40%);
          filter: blur(80px); pointer-events: none;
        }

        .left { flex: 4; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 10; padding-bottom: 20px; }
        .branding { display: flex; align-items: center; gap: 20px; font-weight: 900; font-size: 1.8rem; letter-spacing: -1px; margin-bottom: 60px; }
        
        .clock-area { margin-bottom: 60px; }
        .clock { font-size: 8rem; font-weight: 900; letter-spacing: -4px; margin: 0; line-height: 1; text-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .date { opacity: 0.6; text-transform: uppercase; letter-spacing: 4px; font-size: 1.1rem; margin-top: 15px; font-weight: 600; color: var(--accent); }
        .weather { margin-top: 20px; font-weight: 600; font-size: 1.2rem; display: flex; align-items: center; gap: 10px; opacity: 0.8; }

        .health { background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 12px 25px; border-radius: 100px; width: fit-content; font-size: 0.8rem; font-weight: 800; letter-spacing: 2px; color: var(--accent); display: flex; align-items: center; gap: 12px; box-shadow: 0 0 30px rgba(16, 185, 129, 0.05); }
        .health-dot { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 15px var(--accent); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } }

        .right { flex: 6; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto auto; gap: 25px; position: relative; z-index: 10; align-content: center; }
        .bento { background: var(--glass); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid var(--glass-border); border-top: 1px solid rgba(255,255,255,0.1); border-left: 1px solid rgba(255,255,255,0.05); border-radius: 32px; padding: 35px; transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .bento::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, var(--glass-highlight) 0%, transparent 100%); opacity: 0.3; pointer-events: none; }
        .bento:hover { transform: translateY(-8px); border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 25px 50px rgba(0,0,0,0.4); }

        .energy { grid-column: span 2; flex-direction: row; align-items: center; padding: 40px 50px; background: linear-gradient(145deg, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0) 100%); }
        .energy-val { font-size: 4.5rem; font-weight: 900; line-height: 1; margin: 15px 0; text-shadow: 0 5px 20px rgba(0,0,0,0.4); letter-spacing: -2px; }
        .energy-label { font-size: 0.9rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .energy-icon-wrapper { width: 90px; height: 90px; border-radius: 50%; background: rgba(16, 185, 129, 0.08); border: 2px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 30px rgba(16, 185, 129, 0.1), 0 0 40px rgba(16, 185, 129, 0.2); }

        .stat-card { min-height: 180px; }
        .stat-label { font-size: 0.9rem; opacity: 0.5; text-transform: uppercase; font-weight: 800; letter-spacing: 2px; display: flex; align-items: center; gap: 10px; }
        .stat-val { font-size: 4rem; font-weight: 900; line-height: 1; letter-spacing: -1px; }

        .btn-main { grid-column: span 2; background: linear-gradient(135deg, var(--primary) 0%, #0d9467 100%); color: #000; font-weight: 900; display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 1.4rem; letter-spacing: 3px; border: none; height: 90px; padding: 0; box-shadow: 0 15px 40px rgba(16, 185, 129, 0.25); text-transform: uppercase; }
        .btn-main::before { display: none; }
        .btn-main:hover { transform: scale(0.98); box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4); }

        #kairo-fab { position: fixed; bottom: 40px; right: 40px; width: 65px; height: 65px; background: rgba(15, 20, 25, 0.8); border-radius: 20px; display: flex; align-items: center; justify-content: center; z-index: 10000; cursor: pointer; font-weight: 900; font-size: 0.9rem; border: 1px solid var(--glass-border); color: white; backdrop-filter: blur(20px); transition: 0.3s; }
        #kairo-fab:hover { background: var(--primary); color: #000; transform: rotate(15deg) scale(1.1); }

        @media (max-width: 800px) {
           .kairo-os { flex-direction: column; overflow-y: auto; position: absolute; padding: 30px; }
           .right { grid-template-columns: 1fr; }
           .energy, .btn-main { grid-column: 1; }
           .clock { font-size: 5rem; }
        }
      </style>

      <div class="kairo-os" id="os-container">
        <div class="mesh"></div>
        <div class="left">
          <div class="top">
            <div class="branding">
               <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" style="width:60px; filter: drop-shadow(0 0 20px rgba(16,185,129,0.5));">
               <div>KAIRO <span style="color:var(--primary)">OS</span></div>
            </div>
            <div class="clock-area">
              <div class="clock" id="clock">--:--</div>
              <div class="date" id="date">--</div>
              <div class="weather">
                <ha-icon id="weather-icon" icon="mdi:weather-cloudy"></ha-icon> 
                <span id="weather-text">Lade Wetter...</span>
              </div>
            </div>
          </div>
          <div class="health">
            <div class="health-dot"></div>
            SYSTEM OPTIMAL
          </div>
        </div>

        <div class="right">
          <div class="bento energy">
            <div>
              <div class="energy-label"><ha-icon icon="mdi:flash" style="--mdc-icon-size: 16px;"></ha-icon> Energy Hub</div>
              <div class="energy-val" id="p-main">0 W</div>
              <div style="opacity:0.8; font-size:1rem; font-weight: 700; letter-spacing: 2px;">SOLAR: <span id="p-solar" style="color:var(--accent)">0 W</span></div>
            </div>
            <div class="energy-icon-wrapper">
              <ha-icon icon="mdi:lightning-bolt" style="color:var(--accent); --mdc-icon-size:42px;"></ha-icon>
            </div>
          </div>

          <div class="bento stat-card">
            <div class="stat-label"><ha-icon icon="mdi:devices" style="--mdc-icon-size: 16px;"></ha-icon> Geräte Online</div>
            <div class="stat-val" id="v-dev">0</div>
          </div>
          <div class="bento stat-card">
            <div class="stat-label"><ha-icon icon="mdi:robot" style="--mdc-icon-size: 16px;"></ha-icon> Routinen</div>
            <div class="stat-val" id="v-auto">0</div>
          </div>

          <div class="bento btn-main" id="go">
            DASHBOARD AUFRUFEN <ha-icon icon="mdi:arrow-right" style="margin-left: 10px;"></ha-icon>
          </div>
        </div>
      </div>
      <div id="kairo-fab">SYS</div>
    `;

    this.shadowRoot.getElementById('go').onclick = () => { this.shadowRoot.getElementById('os-container').style.display = 'none'; };
    this.shadowRoot.getElementById('kairo-fab').onclick = () => { this.shadowRoot.getElementById('os-container').style.display = 'flex'; };
    
    setInterval(() => {
      const now = new Date();
      if(this.shadowRoot.getElementById('clock')) this.shadowRoot.getElementById('clock').innerText = now.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
      if(this.shadowRoot.getElementById('date')) this.shadowRoot.getElementById('date').innerText = now.toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long'});
      
      // Refresh direct weather every 15 mins
      let plz = this._config ? this._config.weather_plz : null;
      if (!plz && this._config && this._config.weather_entity && /^\d{5}$/.test(this._config.weather_entity)) plz = this._config.weather_entity;

      if (plz && now.getMinutes() % 15 === 0 && now.getSeconds() === 0) {
        this.fetchDirectWeather(plz);
      }
    }, 1000);
  }

  async fetchDirectWeather(plz) {
    if (!plz || this._fetchingWeather) return;
    this._fetchingWeather = true;
    try {
      const geoResp = await fetch(`https://api.zippopotam.us/de/${plz}`);
      const geoData = await geoResp.json();
      
      if (geoData && geoData.places && geoData.places.length > 0) {
        const { latitude, longitude } = geoData.places[0];
        
        const weatherResp = await fetch(`https://api.brightsky.dev/current_weather?lat=${latitude}&lon=${longitude}`);
        const weatherData = await weatherResp.json();

        if (weatherData && weatherData.weather) {
          this._directWeather = weatherData.weather;
          this.updateData();
        }
      } else {
        console.warn("KAIRO OS: PLZ not found", plz);
      }
    } catch (e) {
      console.error("OpenKairo Weather Fetch Failed", e);
      if (this.shadowRoot.getElementById('weather-text')) {
        this.shadowRoot.getElementById('weather-text').innerText = "Fehler (PLZ/API)";
      }
    } finally {
      this._fetchingWeather = false;
    }
  }

  _getWeatherIcon(condition) {
    const map = {
      'clear-day': 'mdi:weather-sunny',
      'clear-night': 'mdi:weather-night',
      'partly-cloudy-day': 'mdi:weather-partly-cloudy',
      'partly-cloudy-night': 'mdi:weather-night-partly-cloudy',
      'cloudy': 'mdi:weather-cloudy',
      'fog': 'mdi:weather-fog',
      'rain': 'mdi:weather-rainy',
      'sleet': 'mdi:weather-snowy-rainy',
      'snow': 'mdi:weather-snowy',
      'wind': 'mdi:weather-windy',
      'hail': 'mdi:weather-hail',
      'thunderstorm': 'mdi:weather-lightning-rainy'
    };
    return map[condition] || 'mdi:weather-cloudy';
  }

  updateData() {
    if (!this._hass || !this.shadowRoot) return;
    const shadow = this.shadowRoot;
    const config = this._config || {};

    if(shadow.getElementById('v-dev')) shadow.getElementById('v-dev').innerText = this._hass.devices ? Object.keys(this._hass.devices).length : "-";
    if(shadow.getElementById('v-auto')) shadow.getElementById('v-auto').innerText = Object.values(this._hass.states).filter(s => s.entity_id.startsWith('automation.')).length;

    let plz = config.weather_plz;
    if (!plz && config.weather_entity && /^\d{5}$/.test(config.weather_entity)) plz = config.weather_entity;

    const w = config.weather_entity && !/^\d{5}$/.test(config.weather_entity) ? this._hass.states[config.weather_entity] : null;
    const weatherText = shadow.getElementById('weather-text');
    const weatherIcon = shadow.getElementById('weather-icon');

    if (!weatherText) {
      console.warn("KAIRO OS: weather-text element not found in shadowRoot");
    }

    if (w && weatherText) {
      weatherText.innerText = `${Math.round(w.attributes.temperature)}°C | ${w.state}`;
      if (weatherIcon && w.attributes.icon) weatherIcon.setAttribute('icon', w.attributes.icon);
    } else if (this._directWeather && weatherText) {
      const temp = Math.round(this._directWeather.temperature);
      const cond = window.openKairoHelpers.formatCond(this._directWeather.condition);
      weatherText.innerText = `${temp}°C | ${cond}`;
      if (weatherIcon) weatherIcon.setAttribute('icon', this._getWeatherIcon(this._directWeather.condition));
    } else if (plz && !this._fetchingWeather && !this._directWeather) {
       this.fetchDirectWeather(plz);
    }

    const m = config.energy_main_entity ? this._hass.states[config.energy_main_entity] : null;
    if (m && shadow.getElementById('p-main')) {
      const val = Math.round(parseFloat(m.state) || 0);
      shadow.getElementById('p-main').innerText = `${val} W`;
      shadow.getElementById('p-main').style.color = val < 0 ? 'var(--accent)' : 'white';
    }
    const s = config.energy_solar_entity ? this._hass.states[config.energy_solar_entity] : null;
    if (s && shadow.getElementById('p-solar')) shadow.getElementById('p-solar').innerText = `${Math.round(parseFloat(s.state) || 0)} W`;
  }
}

if (!customElements.get('openkairo-card')) {
  customElements.define('openkairo-card', OpenKairoCard);
}

// FORCE UPDATE GLOBAL LIST
window.customCards = window.customCards || [];
window.customCards = window.customCards.filter(c => c.type !== 'openkairo-card');
window.customCards.push({
  type: "openkairo-card",
  name: "OpenKairo OS Launchpad",
  editor: "openkairo-card-editor",
  description: "Redesigned Bento-Grid OS Layer (V4.3.5)."
});
