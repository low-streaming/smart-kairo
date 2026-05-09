// --- OPENKAIRO OS LAUNCHPAD V4.2.5 ---
console.log("%c 🚀 KAIRO OS V4.2.5 LOADING ", "background: #05f0a0; color: #000; font-weight: bold; padding: 5px;");

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
        .config { padding: 15px; font-family: sans-serif; background: #0a0c10; color: #eee; border-radius: 12px; }
        .row { margin-bottom: 16px; }
        label { display: block; font-size: 10px; font-weight: 800; color: #05f0a0; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px; }
        select { width: 100%; padding: 10px; border-radius: 8px; background: #1a1d23; color: #fff; border: 1px solid #333; outline: none; }
        .success-msg { color: #10b981; font-size: 12px; font-weight: bold; margin-top: 10px; display: none; }
      </style>
      <div class="config">
        <h3 style="margin-top:0; color: white;">OS Konfiguration</h3>
        <div class="row">
          <label>Netz-Verbrauch (W)</label>
          <select id="energy_main_entity">
            <option value="">-- Sensor wählen --</option>
            ${entities.map(e => `<option value="${e}" ${e === config.energy_main_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <label>Solar-Erzeugung (W)</label>
          <select id="energy_solar_entity">
            <option value="">-- Sensor wählen --</option>
            ${entities.map(e => `<option value="${e}" ${e === config.energy_solar_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <label>Wetter-Entität</label>
          <select id="weather_entity">
            <option value="">-- Wetter wählen --</option>
            ${entities.filter(e => e.startsWith('weather.')).map(e => `<option value="${e}" ${e === config.weather_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
        <div id="success" class="success-msg">✓ Gespeichert</div>
      </div>
    `;
    this.shadowRoot.querySelectorAll('select').forEach(el => {
      el.addEventListener('change', (ev) => {
        const newConfig = { ...this._config, [ev.target.id]: ev.target.value };
        this._config = newConfig;
        const event = new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true });
        this.dispatchEvent(event);
        
        const success = this.shadowRoot.getElementById('success');
        success.style.display = 'block';
        setTimeout(() => success.style.display = 'none', 2000);
      });
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

  setConfig(config) { this._config = config; }
  
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
          padding: 50px 60px; gap: 50px; color: white; overflow: hidden;
          transition: all 0.3s ease;
        }

        .mesh {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(at 0% 0%, hsla(161, 84%, 39%, 0.15) 0, transparent 40%), 
                      radial-gradient(at 100% 100%, hsla(161, 84%, 39%, 0.08) 0, transparent 40%);
          filter: blur(60px); pointer-events: none;
        }

        .left { flex: 4; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 10; padding-bottom: 20px; }
        .branding { display: flex; align-items: center; gap: 15px; font-weight: 900; font-size: 1.5rem; letter-spacing: -1px; margin-bottom: 40px; }
        
        .clock-area { margin-bottom: 40px; }
        .clock { font-size: 6.5rem; font-weight: 800; letter-spacing: -3px; margin: 0; line-height: 1; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .date { opacity: 0.6; text-transform: uppercase; letter-spacing: 3px; font-size: 1rem; margin-top: 10px; font-weight: 600; }
        .weather { margin-top: 15px; font-weight: 600; font-size: 1.1rem; color: var(--accent); display: flex; align-items: center; gap: 8px; }

        .health { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 10px 20px; border-radius: 100px; width: fit-content; font-size: 0.75rem; font-weight: 800; letter-spacing: 1.5px; color: var(--accent); display: flex; align-items: center; gap: 10px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.05); }
        .health-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 12px var(--accent); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } }

        .right { flex: 6; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: min-content min-content auto; gap: 20px; position: relative; z-index: 10; align-content: center; }
        .bento { background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 28px; padding: 30px; transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .bento::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, var(--glass-highlight) 0%, transparent 100%); opacity: 0.5; pointer-events: none; }
        .bento:hover { transform: translateY(-5px); border-color: rgba(16, 185, 129, 0.3); box-shadow: 0 15px 35px rgba(0,0,0,0.3); }

        .energy { grid-column: span 2; flex-direction: row; align-items: center; padding: 35px 40px; }
        .energy-val { font-size: 3.5rem; font-weight: 800; line-height: 1; margin: 10px 0; text-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .energy-label { font-size: 0.8rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
        .energy-icon-wrapper { width: 70px; height: 70px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 2px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.2); }

        .stat-card { min-height: 160px; }
        .stat-label { font-size: 0.8rem; opacity: 0.6; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
        .stat-val { font-size: 3.5rem; font-weight: 800; line-height: 1; }

        .btn-main { grid-column: span 2; background: linear-gradient(135deg, var(--primary) 0%, #0d9467 100%); color: #000; font-weight: 900; display: flex; flex-direction: row; align-items: center; justify-content: center; font-size: 1.2rem; letter-spacing: 2px; border: none; height: 80px; padding: 0; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); }
        .btn-main::before { display: none; }
        .btn-main:hover { transform: scale(0.98); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); }

        #kairo-fab { position: fixed; bottom: 30px; right: 30px; width: 55px; height: 55px; background: rgba(15, 20, 25, 0.6); border-radius: 18px; display: flex; align-items: center; justify-content: center; z-index: 10000; cursor: pointer; font-weight: 900; font-size: 0.8rem; border: 1px solid var(--glass-border); color: white; backdrop-filter: blur(20px); transition: 0.3s; }
        #kairo-fab:hover { background: var(--primary); color: #000; transform: rotate(10deg); }

        @media (max-width: 800px) {
           .kairo-os { flex-direction: column; overflow-y: auto; position: absolute; }
           .right { grid-template-columns: 1fr; }
           .energy, .btn-main { grid-column: 1; }
        }
      </style>

      <div class="kairo-os" id="os-container">
        <div class="mesh"></div>
        <div class="left">
          <div class="top">
            <div class="branding">
               <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" style="width:50px;">
               <div>KAIRO <span style="color:var(--primary)">OS</span></div>
            </div>
            <div class="clock-area">
              <div class="clock" id="clock">--:--</div>
              <div class="date" id="date">--</div>
              <div class="weather" id="weather"></div>
            </div>
          </div>
          <div class="health">
            <div class="health-dot"></div>
            SYSTEM STATUS: OPTIMAL
          </div>
        </div>

        <div class="right">
          <div class="bento energy">
            <div>
              <div class="energy-label">Energy Hub</div>
              <div class="energy-val" id="p-main">0 W</div>
              <div style="opacity:0.7; font-size:0.9rem; font-weight: 600; letter-spacing: 1px;">SOLAR: <span id="p-solar" style="color:var(--accent)">0 W</span></div>
            </div>
            <div class="energy-icon-wrapper">
              <ha-icon icon="mdi:lightning-bolt" style="color:var(--accent); --mdc-icon-size:36px;"></ha-icon>
            </div>
          </div>

          <div class="bento stat-card">
            <div class="stat-label">Geräte Online</div>
            <div class="stat-val" id="v-dev">0</div>
          </div>
          <div class="bento stat-card">
            <div class="stat-label">Routinen</div>
            <div class="stat-val" id="v-auto">0</div>
          </div>

          <div class="bento btn-main" id="go">DASHBOARD AUFRUFEN</div>
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
    }, 1000);
  }

  updateData() {
    if (!this._hass || !this.shadowRoot) return;
    const shadow = this.shadowRoot;
    const config = this._config || {};

    if(shadow.getElementById('v-dev')) shadow.getElementById('v-dev').innerText = this._hass.devices ? Object.keys(this._hass.devices).length : "-";
    if(shadow.getElementById('v-auto')) shadow.getElementById('v-auto').innerText = Object.values(this._hass.states).filter(s => s.entity_id.startsWith('automation.')).length;

    const w = config.weather_entity ? this._hass.states[config.weather_entity] : null;
    if (w && shadow.getElementById('weather')) {
      shadow.getElementById('weather').innerText = `${Math.round(w.attributes.temperature)}°C | ${w.state}`;
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
  description: "Redesigned Bento-Grid OS Layer (V4.2.5)."
});
