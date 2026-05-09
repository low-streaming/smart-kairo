// --- OPENKAIRO OS LAUNCHPAD V4.2.2 ---

class OpenKairoCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
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
    this.shadowRoot.innerHTML = `
      <style>
        .config-container { padding: 20px; font-family: sans-serif; }
        .row { margin-bottom: 20px; }
        label { display: block; font-weight: bold; margin-bottom: 8px; color: #10b981; font-size: 12px; text-transform: uppercase; }
        select { width: 100%; padding: 10px; border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); }
      </style>
      <div class="config-container">
        <div class="row">
          <label>Netz-Verbrauch (W)</label>
          <select id="energy_main_entity">
            <option value="">-- Wählen --</option>
            ${entities.map(e => `<option value="${e}" ${e === this._config.energy_main_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <label>Solar-Erzeugung (W)</label>
          <select id="energy_solar_entity">
            <option value="">-- Wählen --</option>
            ${entities.map(e => `<option value="${e}" ${e === this._config.energy_solar_entity ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <label>Wetter-Entität</label>
          <select id="weather_entity">
            <option value="">-- Wählen --</option>
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
customElements.define('openkairo-card-editor', OpenKairoCardEditor);

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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;900&display=swap');
        :host { --primary: #10b981; --accent: #05f0a0; --font-main: 'Outfit', sans-serif; }
        .kairo-os { position: fixed; inset: 0; background: #020406; font-family: var(--font-main); display: flex; z-index: 9999; padding: 60px; gap: 60px; }
        .left { flex: 4; display: flex; flex-direction: column; justify-content: space-between; }
        .clock { font-size: 6rem; font-weight: 900; letter-spacing: -4px; margin: 20px 0; }
        .right { flex: 6; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .bento { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; padding: 30px; }
        .energy { grid-column: span 2; display: flex; justify-content: space-between; align-items: center; border-color: rgba(16,185,129,0.2); }
        .energy-val { font-size: 2.5rem; font-weight: 900; }
        .btn-main { grid-column: span 2; background: var(--primary); color: #000; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        #kairo-fab { position: fixed; bottom: 40px; right: 40px; width: 60px; height: 60px; background: rgba(255,255,255,0.05); border-radius: 20px; display: flex; align-items: center; justify-content: center; z-index: 10000; cursor: pointer; font-weight: 900; border: 1px solid rgba(255,255,255,0.1); }
      </style>
      <div class="kairo-os" id="os-container">
        <div class="left">
          <div>
            <div style="font-weight:900; font-size:1.8rem;">KAIRO <span style="color:var(--primary)">OS</span></div>
            <div class="clock" id="clock">--:--</div>
            <div id="date" style="opacity:0.5; text-transform:uppercase; letter-spacing:2px;">--</div>
            <div id="weather" style="margin-top:20px; font-weight:600; display:none;"></div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:15px 25px; border-radius:100px; width:fit-content; color:var(--accent); font-size:0.8rem; font-weight:900;">SYSTEM OPTIMAL</div>
        </div>
        <div class="right">
          <div class="bento energy">
            <div>
              <div style="font-size:0.8rem; opacity:0.5; text-transform:uppercase;">Energy Hub</div>
              <div class="energy-val" id="p-main">0 W</div>
              <div style="opacity:0.6; font-size:0.9rem;">Solar: <span id="p-solar" style="color:var(--accent)">0 W</span></div>
            </div>
            <ha-icon icon="mdi:lightning-bolt" style="color:var(--accent); --mdc-icon-size:40px;"></ha-icon>
          </div>
          <div class="bento">
            <div style="opacity:0.5; font-size:0.8rem;">GERÄTE</div>
            <div style="font-size:2.5rem; font-weight:900;" id="v-dev">0</div>
          </div>
          <div class="bento">
            <div style="opacity:0.5; font-size:0.8rem;">ROUTINEN</div>
            <div style="font-size:2.5rem; font-weight:900;" id="v-auto">0</div>
          </div>
          <div class="bento btn-main" id="go">DASHBOARD AUFRUFEN</div>
        </div>
      </div>
      <div id="kairo-fab">SYS</div>
    `;
    this.shadowRoot.getElementById('go').onclick = () => {
      this.shadowRoot.getElementById('os-container').style.display = 'none';
    };
    this.shadowRoot.getElementById('kairo-fab').onclick = () => {
      this.shadowRoot.getElementById('os-container').style.display = 'flex';
    };
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
    if (w) {
      shadow.getElementById('weather').style.display = 'block';
      shadow.getElementById('weather').innerText = `${w.attributes.temperature}°C | ${w.state}`;
    }

    const m = config.energy_main_entity ? this._hass.states[config.energy_main_entity] : null;
    if (m) {
      const val = Math.round(parseFloat(m.state) || 0);
      shadow.getElementById('p-main').innerText = `${val} W`;
      shadow.getElementById('p-main').style.color = val < 0 ? 'var(--accent)' : 'white';
    }
    const s = config.energy_solar_entity ? this._hass.states[config.energy_solar_entity] : null;
    if (s) shadow.getElementById('p-solar').innerText = `${Math.round(parseFloat(s.state) || 0)} W`;
  }
}
customElements.define('openkairo-card', OpenKairoCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-card",
  name: "OpenKairo OS Launchpad",
  editor: "openkairo-card-editor",
  description: "Bento-Grid OS Layer for OpenKairo (V4.2.2)."
});
