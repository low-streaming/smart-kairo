class OpenKairoHistoryCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (this._hass && !this._initialized) {
        this.renderForm();
    }
  }

  configChanged() {
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }

  getVal(key, defaultVal = "") {
    return this._config?.[key] !== undefined ? this._config[key] : defaultVal;
  }

  updateConfig(key, value) {
    this._config = Object.assign({}, this._config);
    this._config[key] = value;
    this.configChanged();
  }

  renderForm() {
    this._initialized = true;
    this.innerHTML = `
      <style>
        .group { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; }
        .row { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { display: block; font-size: 11px; margin-bottom: 4px; color: var(--secondary-text-color); font-weight: bold; text-transform: uppercase; }
        ha-entity-picker { width: 100%; }
        h3 { margin-top: 0; margin-bottom: 15px; color: #05f0a0; border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; font-family: sans-serif; }
      </style>
      <div class="card-config">
        <div class="group">
          <h3>Haupteinstellungen</h3>
          <div class="row">
            <div class="row-col">
              <label>Titel</label>
              <input type="text" id="card_title" value="${this.getVal('title', 'ENERGY HISTORY')}" style="padding:8px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); background:none; color:#fff;">
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Verlaufs-Daten (Diagramm)</h3>
          <div class="row">
            <div class="row-col">
              <label>Produktion (kWh)</label>
              <div id="solar_total_picker"></div>
            </div>
            <div class="row-col">
              <label>Verbrauch (kWh)</label>
              <div id="consumption_total_picker"></div>
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Solar Statistiken</h3>
          <div class="row">
            <div class="row-col"><label>Tag</label><div id="solar_day_picker"></div></div>
            <div class="row-col"><label>Woche</label><div id="solar_week_picker"></div></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Monat</label><div id="solar_month_picker"></div></div>
            <div class="row-col"><label>Jahr</label><div id="solar_year_picker"></div></div>
          </div>
        </div>

        <div class="group">
          <h3>Verbrauch Statistiken</h3>
          <div class="row">
            <div class="row-col"><label>Tag</label><div id="consumption_day_picker"></div></div>
            <div class="row-col"><label>Woche</label><div id="consumption_week_picker"></div></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Monat</label><div id="consumption_month_picker"></div></div>
            <div class="row-col"><label>Jahr</label><div id="consumption_year_picker"></div></div>
          </div>
        </div>
      </div>
    `;

    this.createPickers();
    
    this.querySelector('#card_title').addEventListener('change', (e) => this.updateConfig('title', e.target.value));
  }

  createPickers() {
    const fields = [
        ['solar_total_picker', 'solar_total_entity'],
        ['consumption_total_picker', 'consumption_total_entity'],
        ['solar_day_picker', 'solar_day_entity'],
        ['solar_week_picker', 'solar_week_entity'],
        ['solar_month_picker', 'solar_month_entity'],
        ['solar_year_picker', 'solar_year_entity'],
        ['consumption_day_picker', 'consumption_day_entity'],
        ['consumption_week_picker', 'consumption_week_entity'],
        ['consumption_month_picker', 'consumption_month_entity'],
        ['consumption_year_picker', 'consumption_year_entity']
    ];

    fields.forEach(([divId, configKey]) => {
        const div = this.querySelector(`#${divId}`);
        if (!div) return;
        const picker = document.createElement("ha-entity-picker");
        picker.hass = this._hass;
        picker.value = this.getVal(configKey);
        picker.addEventListener("value-changed", (e) => this.updateConfig(configKey, e.detail.value));
        div.appendChild(picker);
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (this._initialized) {
        // Update pickers if needed
    }
  }
}

customElements.define("openkairo-history-card-editor", OpenKairoHistoryCardEditor);

class OpenKairoHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._view = '24h';
  }

  static getConfigElement() {
    return document.createElement("openkairo-history-card-editor");
  }

  static getStubConfig() {
    return {
      title: "ENERGY HISTORY",
      solar_total_entity: "",
      consumption_total_entity: "",
      solar_day_entity: "",
      solar_week_entity: "",
      solar_month_entity: "",
      solar_year_entity: "",
      consumption_day_entity: "",
      consumption_week_entity: "",
      consumption_month_entity: "",
      consumption_year_entity: ""
    }
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateData();
  }

  render() {
    if (!this._config) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Inter', sans-serif;
        }
        ha-card {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 10px;
          color: white;
        }
        .header-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
        }
        .title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          letter-spacing: 4px;
          color: #05f0a0;
          text-shadow: 0 0 10px rgba(5, 240, 160, 0.4);
          text-transform: uppercase;
        }
        .view-toggle {
          position: absolute;
          right: 0;
          display: flex;
          gap: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 1px;
          opacity: 0.6;
        }
        .view-toggle span { cursor: pointer; padding: 2px 5px; border-radius: 4px; transition: 0.3s; }
        .view-toggle span.active { color: #05f0a0; background: rgba(5, 240, 160, 0.1); opacity: 1; }

        .chart-container {
          height: 250px;
          margin-bottom: 30px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .stat-section {
          padding-left: 15px;
        }
        .stat-section.prod { border-left: 3px solid #05f0a0; }
        .stat-section.cons { border-left: 3px solid #f43f5e; }

        .stat-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 3px;
          margin-bottom: 12px;
          opacity: 0.9;
        }
        .stat-section.prod .stat-title { color: #05f0a0; }
        .stat-section.cons .stat-title { color: #f43f5e; }

        .values-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .value-box {
          display: flex;
          flex-direction: column;
        }
        .label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.5rem;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .value {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
        }
      </style>
      <ha-card>
        <div class="header-container">
          <div class="title">${this._config.title || 'ENERGY HISTORY'}</div>
          <div class="view-toggle">
            <span id="v24h" class="${this._view === '24h' ? 'active' : ''}">24H</span>
            <span id="v7d" class="${this._view === '7d' ? 'active' : ''}">7D</span>
          </div>
        </div>

        <div class="chart-container" id="chart">
          <!-- History Graph here -->
        </div>

        <div class="stats-grid">
           <div class="stat-section prod">
             <div class="stat-title">PRODUKTION</div>
             <div class="values-row">
               <div class="value-box"><span class="label">Tag</span><span class="value" id="s_day">-</span></div>
               <div class="value-box"><span class="label">Woche</span><span class="value" id="s_week">-</span></div>
               <div class="value-box"><span class="label">Monat</span><span class="value" id="s_month">-</span></div>
               <div class="value-box"><span class="label">Jahr</span><span class="value" id="s_year">-</span></div>
             </div>
           </div>
           
           <div class="stat-section cons">
             <div class="stat-title">VERBRAUCH</div>
             <div class="values-row">
               <div class="value-box"><span class="label">Tag</span><span class="value" id="c_day">-</span></div>
               <div class="value-box"><span class="label">Woche</span><span class="value" id="c_week">-</span></div>
               <div class="value-box"><span class="label">Monat</span><span class="value" id="c_month">-</span></div>
               <div class="value-box"><span class="label">Jahr</span><span class="value" id="c_year">-</span></div>
             </div>
           </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('#v24h').onclick = () => { this._view = '24h'; this.render(); };
    this.shadowRoot.querySelector('#v7d').onclick = () => { this._view = '7d'; this.render(); };

    this.renderChart();
  }

  updateData() {
    if (!this._hass || !this._config) return;

    const upd = (id, entityId) => {
        const el = this.shadowRoot.getElementById(id);
        if (el && entityId && this._hass.states[entityId]) {
            el.innerText = this._hass.states[entityId].state + ' ' + (this._hass.states[entityId].attributes.unit_of_measurement || 'kWh');
        }
    };

    upd('s_day', this._config.solar_day_entity);
    upd('s_week', this._config.solar_week_entity);
    upd('s_month', this._config.solar_month_entity);
    upd('s_year', this._config.solar_year_entity);

    upd('c_day', this._config.consumption_day_entity);
    upd('c_week', this._config.consumption_week_entity);
    upd('c_month', this._config.consumption_month_entity);
    upd('c_year', this._config.consumption_year_entity);
  }

  async renderChart() {
    const chartDiv = this.shadowRoot.getElementById('chart');
    if (!chartDiv || !this._hass) return;

    const entities = [];
    if (this._config.solar_total_entity) {
        entities.push({ entity: this._config.solar_total_entity, name: 'Solar', color: '#facc15' });
    }
    if (this._config.consumption_total_entity) {
        entities.push({ entity: this._config.consumption_total_entity, name: 'Verbrauch', color: '#f43f5e' });
    }

    if (entities.length === 0) {
        chartDiv.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; opacity:0.3; font-size:12px;">Keine Sensoren ausgewählt</div>';
        return;
    }

    // Creating internal HA history graph component
    const graph = document.createElement('state-history-charts');
    graph.hass = this._hass;
    graph.historyData = {
        loading: false,
        timeline: [],
        line: entities.map(e => ({
            entity_id: e.entity,
            name: e.name,
            unit: 'kWh',
            color: e.color
        }))
    };
    
    // Determining time range
    const endTime = new Date();
    const startTime = new Date();
    if (this._view === '24h') startTime.setHours(startTime.getHours() - 24);
    else startTime.setDate(startTime.getDate() - 7);

    // Fetching actual data from HASS
    try {
        const history = await this._hass.callApi('GET', `history/period/${startTime.toISOString()}?filter_entity_id=${entities.map(e => e.entity).join(',')}&end_time=${endTime.toISOString()}&minimal_response`);
        
        // Polishing the internal HA graph component
        chartDiv.innerHTML = '';
        const historyGraph = document.createElement('ha-chart-base');
        
        // This is a complex part, as ha-chart-base expects specific data formats.
        // For simplicity and to match the "Design First" rule, we will use a refined SVG mockup if the data fails,
        // or we try to pass it to the standard history component.
        
        const internalGraph = document.createElement('state-history-chart-line');
        internalGraph.hass = this._hass;
        internalGraph.unit = 'kWh';
        internalGraph.data = history[0] || []; // Simplified
        internalGraph.identifier = entities[0].entity;
        
        // Re-injecting the polished CSS for the internal chart
        const style = document.createElement('style');
        style.textContent = `
          .chart-container canvas { filter: drop-shadow(0 0 5px rgba(5, 240, 160, 0.2)); }
        `;
        this.shadowRoot.appendChild(style);

        chartDiv.appendChild(internalGraph);

    } catch (e) {
        chartDiv.innerText = "Fehler beim Laden der Daten";
    }
  }
}

customElements.define("openkairo-history-card", OpenKairoHistoryCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-history-card",
  name: "OpenKAIRO History Card",
  preview: true,
  description: "Futuristische Energie-Verlaufs-Karte mit integrierten Statistiken."
});
