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
          height: 220px;
          margin-bottom: 5px;
        }
        
        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 25px;
          padding: 0 10px;
        }
        .stat-section {
          position: relative;
        }
        .stat-section::before {
          content: "";
          position: absolute;
          left: -10px;
          top: 0;
          bottom: 0;
          width: 3px;
          border-radius: 2px;
        }
        .stat-section.prod::before { background: #05f0a0; box-shadow: 0 0 8px rgba(5, 240, 160, 0.5); }
        .stat-section.cons::before { background: #f43f5e; box-shadow: 0 0 8px rgba(244, 63, 94, 0.5); }

        .stat-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.15rem;
          letter-spacing: 4px;
          margin-bottom: 20px;
          font-weight: 900;
        }
        .stat-section.prod .stat-title { color: #05f0a0; }
        .stat-section.cons .stat-title { color: #f43f5e; }

        .values-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 10px;
        }
        .value-box {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 6px;
          letter-spacing: 2px;
        }
        .value {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.35rem;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          text-shadow: 0 0 10px rgba(255,255,255,0.1);
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
    this.updateData();
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
