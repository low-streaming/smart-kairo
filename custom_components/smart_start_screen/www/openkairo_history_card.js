class OpenKairoHistoryCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._initialized && this._hass) {
        this.renderForm();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
        this.renderForm();
    } else {
        this.updateSelectors();
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
        .group { 
            background: rgba(10, 20, 28, 0.4); 
            border: 1px solid rgba(5, 240, 160, 0.1); 
            padding: 18px; 
            border-radius: 16px; 
            margin-bottom: 25px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .row { margin-bottom: 15px; display: flex; gap: 12px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { 
            display: block; 
            font-size: 10px; 
            margin-bottom: 6px; 
            color: rgba(255,255,255,0.5); 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 1.5px;
            font-family: 'Orbitron', sans-serif;
        }
        h3 { 
            margin-top: 0; 
            margin-bottom: 20px; 
            color: #05f0a0; 
            font-family: 'Orbitron', sans-serif; 
            font-size: 0.9rem; 
            letter-spacing: 2px;
            text-transform: uppercase;
            border-bottom: 1px solid rgba(5, 240, 160, 0.2); 
            padding-bottom: 10px; 
            text-shadow: 0 0 10px rgba(5, 240, 160, 0.3);
        }
        input { 
            background: rgba(0,0,0,0.2) !important; 
            color: white !important; 
            border: 1px solid rgba(255,255,255,0.1) !important; 
            padding: 10px !important; 
            border-radius: 8px !important; 
            width: 100%;
            box-sizing: border-box;
        }
        ha-selector { width: 100%; }
      </style>
      <div class="card-config">
        <div class="group">
          <h3>Haupteinstellungen</h3>
          <div class="row">
            <div class="row-col">
              <label>Karten-Titel</label>
              <input type="text" id="card_title" value="${this.getVal('title', 'ENERGY HISTORY')}">
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Verlaufs-Daten (Diagramm)</h3>
          <div class="row">
            <div class="row-col">
              <label>Solar Produktion (Gesamt-Sensor)</label>
              <div id="solar_total_picker"></div>
            </div>
          </div>
          <div class="row">
            <div class="row-col">
              <label>Verbrauch (Gesamt-Sensor)</label>
              <div id="consumption_total_picker"></div>
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Statistiken: Solar</h3>
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
          <h3>Statistiken: Verbrauch</h3>
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

    this.updateSelectors();
    this.querySelector('#card_title').addEventListener('change', (e) => this.updateConfig('title', e.target.value));
  }

  updateSelectors() {
    if (!this._hass) return;
    
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
        
        let sel = div.querySelector('ha-selector');
        if (!sel) {
            sel = document.createElement("ha-selector");
            sel.selector = { entity: {} };
            sel.addEventListener("value-changed", (e) => this.updateConfig(configKey, e.detail.value));
            div.appendChild(sel);
        }
        
        sel.hass = this._hass;
        sel.value = this.getVal(configKey);
    });
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
          background: rgba(10, 20, 28, 0.45) !important;
          backdrop-filter: blur(15px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(15px) saturate(180%) !important;
          border-radius: 28px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 15px 45px rgba(0,0,0,0.7) !important;
          padding: 25px;
          color: white;
        }
        .header-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
          position: relative;
          height: 40px;
        }
        .title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          letter-spacing: 4px;
          color: #05f0a0;
          text-shadow: 0 0 10px rgba(5, 240, 160, 0.4);
          text-transform: uppercase;
        }
        .view-toggle {
          position: absolute;
          right: 10px;
          display: flex;
          gap: 15px;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 1px;
          opacity: 0.5;
        }
        .view-toggle span { cursor: pointer; transition: 0.3s; padding: 2px 4px; border-radius: 4px; }
        .view-toggle span.active { color: #05f0a0; opacity: 1; background: rgba(5, 240, 160, 0.15); }

        .chart-container {
          width: 100%;
          min-height: 180px;
          max-height: 400px;
          margin-bottom: 15px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        /* Unsichtbare Scrollbar für den Graphen */
        .chart-container::-webkit-scrollbar { width: 0; }
        
        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 15px;
          padding: 0;
        }
        .stat-section {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .stat-section.prod { border-left: 4px solid #05f0a0; background: linear-gradient(90deg, rgba(5,240,160,0.05) 0%, transparent 60%); }
        .stat-section.cons { border-left: 4px solid #f43f5e; background: linear-gradient(90deg, rgba(244,63,94,0.05) 0%, transparent 60%); }

        .stat-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          letter-spacing: 3px;
          margin-bottom: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stat-section.prod .stat-title { color: #05f0a0; text-shadow: 0 0 10px rgba(5,240,160,0.4); }
        .stat-section.cons .stat-title { color: #f43f5e; text-shadow: 0 0 10px rgba(244,63,94,0.4); }

        .stat-title::before {
          content: "";
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .stat-section.prod .stat-title::before { background: #05f0a0; box-shadow: 0 0 10px #05f0a0; }
        .stat-section.cons .stat-title::before { background: #f43f5e; box-shadow: 0 0 10px #f43f5e; }

        .values-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .value-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: all 0.3s ease;
        }
        .value-box:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .label {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .value-wrapper {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .value {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .unit {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
        }

        @media (max-width: 600px) {
          .values-row {
            grid-template-columns: repeat(2, 1fr);
          }
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
               <div class="value-box"><span class="label">Tag</span><div class="value-wrapper"><span class="value" id="s_day">-</span><span class="unit" id="s_day_unit"></span></div></div>
               <div class="value-box"><span class="label">Woche</span><div class="value-wrapper"><span class="value" id="s_week">-</span><span class="unit" id="s_week_unit"></span></div></div>
               <div class="value-box"><span class="label">Monat</span><div class="value-wrapper"><span class="value" id="s_month">-</span><span class="unit" id="s_month_unit"></span></div></div>
               <div class="value-box"><span class="label">Jahr</span><div class="value-wrapper"><span class="value" id="s_year">-</span><span class="unit" id="s_year_unit"></span></div></div>
             </div>
           </div>
           
           <div class="stat-section cons">
             <div class="stat-title">VERBRAUCH</div>
             <div class="values-row">
               <div class="value-box"><span class="label">Tag</span><div class="value-wrapper"><span class="value" id="c_day">-</span><span class="unit" id="c_day_unit"></span></div></div>
               <div class="value-box"><span class="label">Woche</span><div class="value-wrapper"><span class="value" id="c_week">-</span><span class="unit" id="c_week_unit"></span></div></div>
               <div class="value-box"><span class="label">Monat</span><div class="value-wrapper"><span class="value" id="c_month">-</span><span class="unit" id="c_month_unit"></span></div></div>
               <div class="value-box"><span class="label">Jahr</span><div class="value-wrapper"><span class="value" id="c_year">-</span><span class="unit" id="c_year_unit"></span></div></div>
             </div>
           </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('#v24h').onclick = () => { this._view = '24h'; this.render(); };
    this.shadowRoot.querySelector('#v7d').onclick = () => { this._view = '7d'; this.render(); };

    this.renderChart();
    this.updateData();
  }

  updateData() {
    if (!this._hass || !this._config) return;

    const upd = (id, entityId) => {
        const valEl = this.shadowRoot.getElementById(id);
        const unitEl = this.shadowRoot.getElementById(id + '_unit');
        
        if (valEl && entityId && this._hass.states[entityId]) {
            const stateObj = this._hass.states[entityId];
            let val = stateObj.state;
            const unit = stateObj.attributes.unit_of_measurement || 'kWh';
            
            if (!isNaN(parseFloat(val))) {
                val = parseFloat(val).toFixed(2);
            }
            if (val === "unavailable" || val === "unknown") {
                val = "-";
            }
            
            valEl.innerText = val;
            if (unitEl) unitEl.innerText = val !== "-" ? unit : "";
        } else if (valEl) {
            valEl.innerText = "-";
            if (unitEl) unitEl.innerText = "";
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
        entities.push({ entity: this._config.solar_total_entity, name: 'Produktion', color: '#05f0a0' });
    }
    if (this._config.consumption_total_entity) {
        entities.push({ entity: this._config.consumption_total_entity, name: 'Verbrauch', color: '#f43f5e' });
    }

    if (entities.length === 0) {
        chartDiv.innerHTML = '<div style="display:flex; height:100%; align-items:center; justify-content:center; opacity:0.3; font-size:12px;">Keine Sensoren für Tagesverlauf ausgewählt</div>';
        return;
    }

    const cardConfig = {
        type: 'history-graph',
        hours_to_show: this._view === '24h' ? 24 : 168,
        entities: entities.map(e => ({ entity: e.entity, name: e.name, color: e.color })),
        logarithmic_scale: false
    };

    let card = chartDiv.querySelector('hui-history-graph-card');
    
    if (!card) {
        chartDiv.innerHTML = '';
        const style = document.createElement('style');
        style.textContent = `
            hui-history-graph-card {
                --ha-card-background: transparent !important;
                --ha-card-border-width: 0 !important;
                --ha-card-box-shadow: none !important;
            }
            .chart-container { margin-top: -10px; }
        `;
        chartDiv.appendChild(style);

        try {
            if (window.loadCardHelpers) {
                const helpers = await window.loadCardHelpers();
                card = await helpers.createCardElement(cardConfig);
            } else {
                card = document.createElement('hui-history-graph-card');
                card.setConfig(cardConfig);
            }
            chartDiv.appendChild(card);
        } catch (e) {
            chartDiv.innerHTML = '<div style="color:#f43f5e; font-size:12px; text-align:center;">Laden des Tagesverlaufs fehlgeschlagen.</div>';
            return;
        }
    } else {
        card.setConfig(cardConfig);
    }
    
    card.hass = this._hass;
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
