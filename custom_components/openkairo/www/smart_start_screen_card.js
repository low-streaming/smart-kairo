// --- OPENKAIRO OS LAUNCHPAD V4.2.4 ---
console.log("%c 🚀 KAIRO OS V4.2.4 LOADING ", "background: #05f0a0; color: #000; font-weight: bold; padding: 5px;");

class OpenKairoCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) { this._config = config; }
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
    this.shadowRoot.innerHTML = `
      <style>
        .config { padding: 15px; font-family: sans-serif; background: #0a0c10; color: #eee; border-radius: 12px; }
        .row { margin-bottom: 16px; }
        label { display: block; font-size: 10px; font-weight: 800; color: #05f0a0; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px; }
        select { width: 100%; padding: 10px; border-radius: 8px; background: #1a1d23; color: #fff; border: 1px solid #333; outline: none; }
      </style>
      <div class="config">
        <div class="row">
          <label>Netz-Verbrauch (W)</label>
          <select id="energy_main_entity">
            <option value="">-- Sensor wählen --</option>
            ${entities.map(e => `<option value="${e}" ${e === this._config.energy_main_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <label>Solar-Erzeugung (W)</label>
          <select id="energy_solar_entity">
            <option value="">-- Sensor wählen --</option>
            ${entities.map(e => `<option value="${e}" ${e === this._config.energy_solar_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <label>Wetter-Entität</label>
          <select id="weather_entity">
            <option value="">-- Wetter wählen --</option>
            ${entities.filter(e => e.startsWith('weather.')).map(e => `<option value="${e}" ${e === this._config.weather_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
    this.shadowRoot.querySelectorAll('select').forEach(el => {
      el.addEventListener('change', (ev) => {
        const config = { ...this._config, [ev.target.id]: ev.target.value };
        const event = new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true });
        this.dispatchEvent(event);
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
  set hass(hass) {
    this._hass = hass;
    if (!this.initialized) {
      this.initialized = true;
      this.attachShadow({ mode: 'open' });
      this.render();
    }
    this.updateData();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;600;900&display=swap');
        :host { 
          --primary: #10b981; 
          --accent: #05f0a0; 
          --font-main: 'Outfit', sans-serif;
          --glass: rgba(255,255,255,0.03);
          --glass-border: rgba(255,255,255,0.08);
        }
        
        .kairo-os { 
          position: fixed; inset: 0; background: #020406; 
          font-family: var(--font-main); display: flex; z-index: 9999; 
          padding: 40px; gap: 40px; color: white; overflow: hidden;
        }

        .mesh {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(at 0% 0%, hsla(161, 84%, 39%, 0.1) 0, transparent 50%), 
                      radial-gradient(at 100% 100%, hsla(161, 84%, 39%, 0.05) 0, transparent 50%);
          filter: blur(80px);
        }

        .left { flex: 4; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 10; }
        .branding { display: flex; align-items: center; gap: 15px; font-weight: 900; font-size: 1.4rem; letter-spacing: -1px; }
        
        .clock-area { margin-top: 30px; }
        .clock { font-size: 5rem; font-weight: 900; letter-spacing: -3px; margin: 0; line-height: 1; }
        .date { opacity: 0.5; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem; margin-top: 5px; }
        .weather { margin-top: 15px; font-weight: 600; font-size: 1rem; color: var(--accent); }

        .health { background: var(--glass); border: 1px solid var(--glass-border); padding: 12px 20px; border-radius: 100px; width: fit-content; font-size: 0.7rem; font-weight: 900; letter-spacing: 1px; color: var(--accent); display: flex; align-items: center; gap: 10px; }
        .health-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }

        .right { flex: 6; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto auto; gap: 15px; position: relative; z-index: 10; }
        .bento { background: var(--glass); backdrop-filter: blur(40px); border: 1px solid var(--glass-border); border-radius: 24px; padding: 25px; transition: 0.3s ease; cursor: pointer; }
        .bento:hover { background: rgba(255,255,255,0.06); transform: translateY(-4px); }

        .energy { grid-column: span 2; display: flex; justify-content: space-between; align-items: center; padding: 25px 35px; }
        .energy-val { font-size: 2rem; font-weight: 900; }
        .energy-label { font-size: 0.7rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 1px; }

        .stat-label { font-size: 0.7rem; opacity: 0.5; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; }
        .stat-val { font-size: 2rem; font-weight: 900; }

        .btn-main { grid-column: span 2; background: var(--primary); color: #000; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; letter-spacing: 1px; border: none; height: 70px; }
        .btn-main:hover { background: var(--accent); }

        #kairo-fab { position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; background: var(--glass); border-radius: 15px; display: flex; align-items: center; justify-content: center; z-index: 10000; cursor: pointer; font-weight: 900; font-size: 0.7rem; border: 1px solid var(--glass-border); color: white; backdrop-filter: blur(10px); }
        #kairo-fab:hover { background: var(--primary); color: #000; }
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
              <div style="opacity:0.6; font-size:0.8rem; margin-top:4px;">Solar: <span id="p-solar" style="color:var(--accent)">0 W</span></div>
            </div>
            <ha-icon icon="mdi:lightning-bolt" style="color:var(--accent); --mdc-icon-size:32px;"></ha-icon>
          </div>

          <div class="bento">
            <div class="stat-label">Geräte</div>
            <div class="stat-val" id="v-dev">0</div>
          </div>
          <div class="bento">
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
  description: "Redesigned Bento-Grid OS Layer (V4.2.4)."
});
