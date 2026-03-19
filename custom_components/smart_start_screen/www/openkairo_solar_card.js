class OpenKairoSolarCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", {
      bubbles: true,
      composed: true
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  get _solar_entity() { return this._config.solar_entity || ""; }
  get _grid_import_entity() { return this._config.grid_import_entity || ""; }
  get _grid_export_entity() { return this._config.grid_export_entity || ""; }
  get _battery_power_entity() { return this._config.battery_power_entity || ""; }
  get _battery_level_entity() { return this._config.battery_level_entity || ""; }

  renderForm() {
    this.innerHTML = `
      <style>
        .row { margin-bottom: 12px; }
        label { display: block; font-size: 12px; margin-bottom: 4px; color: var(--secondary-text-color); }
        ha-entity-picker { width: 100%; }
        h3 { margin-bottom: 10px; color: var(--primary-color); border-bottom: 1px solid var(--divider-color); padding-bottom: 5px; }
        .info { font-size: 11px; opacity: 0.7; font-style: italic; margin-bottom: 20px; }
      </style>
      <div class="card-config">
        <h3>OpenKAIRO Solar Flow</h3>
        <div class="info">Wähle die Entitäten für dein Solar-Dashboard aus. Der Hausverbrauch wird automatisch berechnet!</div>
        
        <div class="row">
          <label>Solarproduktion (z.B. Wechselrichter Leistung in W)</label>
          <ha-entity-picker
            id="solar_entity"
            .hass="\${this._hass}"
            .value="\${this._solar_entity}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <div class="row">
          <label>Netzbezug (aus dem Stromnetz in W)</label>
          <ha-entity-picker
            id="grid_import_entity"
            .hass="\${this._hass}"
            .value="\${this._grid_import_entity}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <div class="row">
          <label>Netzeinspeisung (ins Stromnetz in W)</label>
          <ha-entity-picker
            id="grid_export_entity"
            .hass="\${this._hass}"
            .value="\${this._grid_export_entity}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <h3>optional: Speicher / Batterie</h3>
        <div class="row">
          <label>Batterieleistung (Laden/Entladen in W)</label>
          <ha-entity-picker
            id="battery_power_entity"
            .hass="\${this._hass}"
            .value="\${this._battery_power_entity}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>

        <div class="row">
          <label>Batterie-Ladestand (in %)</label>
          <ha-entity-picker
            id="battery_level_entity"
            .hass="\${this._hass}"
            .value="\${this._battery_level_entity}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>
      </div>
    `;

    // Modern Lit-Elements style binding via raw DOM for ha-entity-picker
    const pickers = this.querySelectorAll('ha-entity-picker');
    pickers.forEach(picker => {
        picker.hass = this._hass;
        picker.value = this[`_${picker.id}`];
        picker.addEventListener('value-changed', (ev) => {
            if (this._config[picker.id] !== ev.detail.value) {
                const newConfig = Object.assign({}, this._config);
                newConfig[picker.id] = ev.detail.value;
                this.configChanged(newConfig);
            }
        });
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.querySelector('.card-config')) {
      this.renderForm();
    }
  }
}

customElements.define("openkairo-solar-editor", OpenKairoSolarCardEditor);

class OpenKairoSolarCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("openkairo-solar-editor");
  }

  static getStubConfig() {
    return {
      solar_entity: "",
      grid_import_entity: "",
      grid_export_entity: "",
      battery_power_entity: "",
      battery_level_entity: ""
    };
  }

  setConfig(config) {
    this._config = config;
    if (!this.content) {
      this.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@300;400;800&display=swap');
          
          ha-card {
            background: rgba(5, 12, 18, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 20px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            padding: 20px;
          }
          
          .header {
             font-family: 'Orbitron', sans-serif;
             font-size: 0.9rem;
             letter-spacing: 2px;
             color: #10b981;
             text-align: center;
             font-weight: 900;
             margin-bottom: 30px;
             display: flex;
             justify-content: center;
             align-items: center;
             gap: 10px;
          }

          .flow-container {
             position: relative;
             height: 250px;
             width: 100%;
          }

          .node {
             position: absolute;
             width: 80px;
             height: 80px;
             border-radius: 50%;
             background: rgba(255,255,255,0.05);
             border: 1px solid rgba(255,255,255,0.1);
             display: flex;
             flex-direction: column;
             justify-content: center;
             align-items: center;
             transform: translate(-50%, -50%);
             z-index: 10;
          }

          .node-icon {
             --mdc-icon-size: 28px;
             margin-bottom: 4px;
          }

          .node-value {
             font-family: 'Orbitron', sans-serif;
             font-size: 0.9rem;
             font-weight: 900;
          }

          /* Positions */
          .node.solar { top: 20%; left: 50%; border-color: #ffb800; box-shadow: 0 0 20px rgba(255, 184, 0, 0.2); }
          .node.solar ha-icon { color: #ffb800; }

          .node.home { top: 80%; left: 50%; border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
          .node.home ha-icon { color: #10b981; }

          .node.grid { top: 50%; left: 20%; border-color: #ff4a4a; }
          .node.grid ha-icon { color: #ff4a4a; }

          .node.battery { top: 50%; left: 80%; border-color: #05f0a0; }
          .node.battery ha-icon { color: #05f0a0; }

          /* Connections / Flow Lines will go here */
          .line {
             position: absolute;
             height: 2px;
             background: rgba(255,255,255,0.1);
             transform-origin: 0 0;
             z-index: 1;
             overflow: hidden;
          }

          .dot {
             width: 8px;
             height: 8px;
             background: #ffb800;
             border-radius: 50%;
             position: absolute;
             top: -3px;
             left: 0;
             box-shadow: 0 0 10px #ffb800;
             display: none;
          }

          @keyframes flowAnim {
             0% { left: 0%; opacity: 0; }
             10% { opacity: 1; }
             90% { opacity: 1; }
             100% { left: 100%; opacity: 0; }
          }
        </style>
        <ha-card>
          <div class="header">
             <ha-icon icon="mdi:solar-power"></ha-icon> 
             ENERGY OS
          </div>
          <div class="flow-container">
             <!-- Solar -->
             <div class="node solar">
                <ha-icon class="node-icon" icon="mdi:white-balance-sunny"></ha-icon>
                <div class="node-value" id="val-solar">0 W</div>
             </div>
             <!-- Grid -->
             <div class="node grid">
                <ha-icon class="node-icon" icon="mdi:transmission-tower"></ha-icon>
                <div class="node-value" id="val-grid">0 W</div>
             </div>
             <!-- Battery -->
             <div class="node battery">
                <ha-icon class="node-icon" icon="mdi:battery-high"></ha-icon>
                <div class="node-value" id="val-batt">0 %</div>
             </div>
             <!-- Home -->
             <div class="node home">
                <ha-icon class="node-icon" icon="mdi:home"></ha-icon>
                <div class="node-value" id="val-home">0 W</div>
             </div>
          </div>
        </ha-card>
      `;
      this.content = true;
    }
  }

  set hass(hass) {
    if (!this._config) return;
    
    // Helper to get numeric state safely
    const getVal = (entityId) => {
        if (!entityId) return 0;
        const state = hass.states[entityId];
        return state ? parseFloat(state.state) || 0 : 0;
    };

    let solarW = getVal(this._config.solar_entity);
    let gridInW = getVal(this._config.grid_import_entity);
    let gridOutW = getVal(this._config.grid_export_entity);
    let battW = getVal(this._config.battery_power_entity); // positive = charge, negative = discharge, or vice versa depending on user. We can assume generic later.
    let battLevel = getVal(this._config.battery_level_entity);

    // Simple Home Calculation (assuming standard convention)
    // Home = Solar + GridIn - GridOut - BatteryCharge(or + BatteryDischarge)
    // To keep it foolproof for V1 we just do Solar + GridIn - GridOut
    let homeW = solarW + gridInW - gridOutW;
    if (homeW < 0) homeW = 0; // Prevent negative home consumption on data mismatch

    // Update DOM
    const eSolar = this.querySelector('#val-solar');
    const eGrid = this.querySelector('#val-grid');
    const eBatt = this.querySelector('#val-batt');
    const eHome = this.querySelector('#val-home');

    if (eSolar) eSolar.innerText = Math.round(solarW) + ' W';
    // showing grid net or separate based on max? We can show Net.
    if (eGrid) {
       if (gridOutW > 0) eGrid.innerText = "-" + Math.round(gridOutW) + ' W';
       else eGrid.innerText = Math.round(gridInW) + ' W';
    }
    if (eBatt) {
       if (this._config.battery_level_entity) {
          eBatt.innerText = Math.round(battLevel) + ' %';
       } else {
          eBatt.innerText = '-';
       }
    }
    if (eHome) eHome.innerText = Math.round(homeW) + ' W';
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("openkairo-solar-card", OpenKairoSolarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-solar-card",
  name: "OpenKairo Solar Dashboard",
  description: "Advanced Energy Flow Dashboard with Visual Editor.",
  preview: true
});
