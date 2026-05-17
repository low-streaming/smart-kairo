class OpenKairoSolarCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._config.animation_type) this._config.animation_type = 'dots';
    if (!this._config.animation_speed) this._config.animation_speed = 'normal';
    
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
        h3 { margin-top: 0; margin-bottom: 15px; color: var(--primary-color); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; font-family: sans-serif; font-size: 14px; }
        .row { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { display: block; font-size: 11px; margin-bottom: 4px; color: var(--secondary-text-color); font-weight: bold; text-transform: uppercase; }
        select, input[type="text"], input[type="number"] { background: rgba(0,0,0,0.2); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box; }
        
        /* New Clean Layout Box */
        .item-box { background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .item-header label { margin: 0; color: #05f0a0; font-size: 10px; letter-spacing: 1px;}
        .clear-btn { --mdc-icon-size: 16px; color: rgba(255,255,255,0.3); cursor: pointer; transition: 0.2s; }
        .clear-btn:hover { color: #f43f5e; }
        .item-selector { margin-bottom: 10px; }
        .item-options { display: flex; gap: 20px; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; flex-wrap: wrap; }
        .opt { display: flex; align-items: center; gap: 8px; }
        .opt label { margin: 0; font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        
        /* Beautiful Circular Color Picker */
        input[type="color"] { 
            -webkit-appearance: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; 
            width: 26px; height: 26px; padding: 0; cursor: pointer; overflow: hidden; background: none;
        }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 50%; }
        input[type="checkbox"] { cursor: pointer; width: 16px; height: 16px; }
      </style>
      <div class="card-config">
        
        <!-- MAIN SETTINGS -->
        <div class="group">
          <h3>Haupteinstellungen & Aussehen</h3>
          <div class="row">
            <div class="row-col">
              <label>Animations-Typ</label>
              <select id="animation_type">
                <option value="dots" ${this.getVal('animation_type') === 'dots' ? 'selected' : ''}>Energie-Kugeln (Dots)</option>
                <option value="dash" ${this.getVal('animation_type') === 'dash' ? 'selected' : ''}>Strichel-Linien (Dash)</option>
                <option value="neon" ${this.getVal('animation_type') === 'neon' ? 'selected' : ''}>Neon Blitz (Flash)</option>
                <option value="comet" ${this.getVal('animation_type') === 'comet' ? 'selected' : ''}>Energy Comet (Slow Tail)</option>
                <option value="pulse" ${this.getVal('animation_type') === 'pulse' ? 'selected' : ''}>Power Pulse (Thick)</option>
                <option value="liquid" ${this.getVal('animation_type') === 'liquid' ? 'selected' : ''}>Hyper Liquid (Organic)</option>
                <option value="warp" ${this.getVal('animation_type') === 'warp' ? 'selected' : ''}>Cyber Warp (Fast)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ENERGY SOURCES -->
        <div class="group">
          <h3>Energiequellen</h3>

          <div class="item-box">
            <div class="item-header"><label>Solarproduktion (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_entity"></ha-icon></div>
            <div class="item-selector"><div id="solar_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Farbe</label><input type="color" id="solar_color" value="${this.getVal('solar_color', '#ffb800')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="solar_entity_kw" ${this.getVal('solar_entity_kw') ? 'checked' : ''}></div>

            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Netzbezug (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="grid_import_entity"></ha-icon></div>
            <div class="item-selector"><div id="grid_import_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Farbe</label><input type="color" id="grid_color" value="${this.getVal('grid_color', '#ff4a4a')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="grid_import_entity_kw" ${this.getVal('grid_import_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Netzeinspeisung (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="grid_export_entity"></ha-icon></div>
            <div class="item-selector"><div id="grid_export_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Export Farbe</label><input type="color" id="grid_export_color" value="${this.getVal('grid_export_color', '#00d1ff')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="grid_export_entity_kw" ${this.getVal('grid_export_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box" style="border-color: rgba(16, 185, 129, 0.3);">
            <div class="item-header"><label style="color:#10b981;">Haus / Eigenverbrauch</label></div>
            <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:10px;">Basissaldo berechnet sich automatisch aus: Solar + Netz - Export + Akku.</div>
            <div class="item-options" style="border:none; padding:0;">
              <div class="opt"><label>Haus Farbe</label><input type="color" id="home_color" value="${this.getVal('home_color', '#10b981')}"></div>
              <div class="opt" style="flex:1;">
                 <label>Haus-Berechnung</label>
                 <select id="home_calc_mode">
                   <option value="subtract" ${this.getVal('home_calc_mode', 'subtract') === 'subtract' ? 'selected' : ''}>Smartmeter (Geräte Abziehen)</option>
                   <option value="add" ${this.getVal('home_calc_mode') === 'add' ? 'selected' : ''}>Kein Smartmeter (Addieren)</option>
                   <option value="none" ${this.getVal('home_calc_mode') === 'none' ? 'selected' : ''}>Unverändert lassen</option>
                 </select>
              </div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Batterieleistung (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="battery_power_entity"></ha-icon></div>
            <div class="item-selector"><div id="battery_power_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Farbe</label><input type="color" id="battery_color" value="${this.getVal('battery_color', '#05f0a0')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="battery_power_entity_kw" ${this.getVal('battery_power_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Batterieladung (%)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="battery_level_entity"></ha-icon></div>
            <div class="item-selector"><div id="battery_level_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Batt. Invertieren?</label><input type="checkbox" id="battery_invert" ${this.getVal('battery_invert') ? 'checked' : ''}></div>
            </div>
          </div>

        </div>

        <!-- SPECIAL CONSUMERS -->
        <div class="group">
          <h3>Optionale Sonderverbraucher</h3>

          <div class="item-box">
            <div class="item-header"><label>Crypto Miner (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="miner_entity"></ha-icon></div>
            <div class="item-selector"><div id="miner_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Name</label><input type="text" id="miner_name" value="${this.getVal('miner_name', 'Miner')}"></div>
              <div class="opt"><label>Icon</label><div id="miner_icon_picker"></div></div>
              <div class="opt"><label>Farbe</label><input type="color" id="miner_color" value="${this.getVal('miner_color', '#a855f7')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="miner_entity_kw" ${this.getVal('miner_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Wärmepumpe / Heizung (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="heatpump_entity"></ha-icon></div>
            <div class="item-selector"><div id="heatpump_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Name</label><input type="text" id="heatpump_name" value="${this.getVal('heatpump_name', 'Heizung')}"></div>
              <div class="opt"><label>Icon</label><div id="heatpump_icon_picker"></div></div>
              <div class="opt"><label>Farbe</label><input type="color" id="heatpump_color" value="${this.getVal('heatpump_color', '#3b82f6')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="heatpump_entity_kw" ${this.getVal('heatpump_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>E-Auto / Wallbox (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="ev_entity"></ha-icon></div>
            <div class="item-selector"><div id="ev_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Name</label><input type="text" id="ev_name" value="${this.getVal('ev_name', 'Auto')}"></div>
              <div class="opt"><label>Icon</label><div id="ev_icon_picker"></div></div>
              <div class="opt"><label>Farbe</label><input type="color" id="ev_color" value="${this.getVal('ev_color', '#eab308')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="ev_entity_kw" ${this.getVal('ev_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Klimaanlage (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="ac_entity"></ha-icon></div>
            <div class="item-selector"><div id="ac_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Name</label><input type="text" id="ac_name" value="${this.getVal('ac_name', 'Klima')}"></div>
              <div class="opt"><label>Icon</label><div id="ac_icon_picker"></div></div>
              <div class="opt"><label>Farbe</label><input type="color" id="ac_color" value="${this.getVal('ac_color', '#3b82f6')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="ac_entity_kw" ${this.getVal('ac_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Pool / Teich (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="pool_entity"></ha-icon></div>
            <div class="item-selector"><div id="pool_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Name</label><input type="text" id="pool_name" value="${this.getVal('pool_name', 'Pool')}"></div>
              <div class="opt"><label>Icon</label><div id="pool_icon_picker"></div></div>
              <div class="opt"><label>Farbe</label><input type="color" id="pool_color" value="${this.getVal('pool_color', '#00d1ff')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="pool_entity_kw" ${this.getVal('pool_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Waschmaschine / Spülmaschine (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="washer_entity"></ha-icon></div>
            <div class="item-selector"><div id="washer_entity_picker"></div></div>
            <div class="item-options">
              <div class="opt"><label>Name</label><input type="text" id="washer_name" value="${this.getVal('washer_name', 'Waschm.')}"></div>
              <div class="opt"><label>Icon</label><div id="washer_icon_picker"></div></div>
              <div class="opt"><label>Farbe</label><input type="color" id="washer_color" value="${this.getVal('washer_color', '#f43f5e')}"></div>
              <div class="opt"><label>kW?</label><input type="checkbox" id="washer_entity_kw" ${this.getVal('washer_entity_kw') ? 'checked' : ''}></div>
            </div>
          </div>

        </div>

        <!-- STATS -->
        <div class="group">
          <h3>Statistiken & Wetter</h3>
          
          <div class="item-box">
            <div class="item-header"><label>Ertrag Heute (kWh)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_yield_today_entity"></ha-icon></div>
            <div class="item-selector"><div id="solar_yield_today_entity_picker"></div></div>
            <div class="item-options"><div class="opt"><label>Wird in kW gemeldet?</label><input type="checkbox" id="solar_yield_today_entity_kw" ${this.getVal('solar_yield_today_entity_kw') ? 'checked' : ''}></div></div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Ertrag Woche (kWh)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_yield_week_entity"></ha-icon></div>
            <div class="item-selector"><div id="solar_yield_week_entity_picker"></div></div>
            <div class="item-options"><div class="opt"><label>Wird in kW gemeldet?</label><input type="checkbox" id="solar_yield_week_entity_kw" ${this.getVal('solar_yield_week_entity_kw') ? 'checked' : ''}></div></div>
          </div>

          <div class="item-box">
            <div class="item-header"><label>Ertrag Monat (kWh)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_yield_month_entity"></ha-icon></div>
            <div class="item-selector"><div id="solar_yield_month_entity_picker"></div></div>
            <div class="item-options"><div class="opt"><label>Wird in kW gemeldet?</label><input type="checkbox" id="solar_yield_month_entity_kw" ${this.getVal('solar_yield_month_entity_kw') ? 'checked' : ''}></div></div>
          </div>

          <div class="item-box">
             <div class="item-header"><label>Wetter (Entity)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="weather_entity"></ha-icon></div>
             <div class="item-selector"><div id="weather_entity_picker"></div></div>
          </div>

        </div>

      </div>
    `;

    // Dynamically mount Selectors (Entities & Icons)
    const mountSelector = (key, type = "entity") => {
        const container = this.querySelector(`#${key}_picker`);
        if (!container) return;
        const sel = document.createElement('ha-selector');
        sel.hass = this._hass;
        sel.selector = type === "icon" ? { icon: {} } : { entity: {} };
        sel.value = this.getVal(key);
        sel.addEventListener('value-changed', (ev) => { this.updateConfig(key, ev.detail.value); });
        container.innerHTML = "";
        container.appendChild(sel);

        // Clear button logic
        const clearBtn = this.querySelector(`.clear-btn[data-id="${key}"]`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.updateConfig(key, ""); 
            });
        }
    };

    [
        'solar_entity', 'grid_import_entity', 'grid_export_entity',
        'battery_power_entity', 'battery_level_entity',
        'miner_entity', 'heatpump_entity', 'ev_entity',
        'ac_entity', 'pool_entity', 'washer_entity',
        'solar_yield_today_entity', 'solar_yield_week_entity', 'solar_yield_month_entity',
        'weather_entity'
    ].forEach(k => mountSelector(k));

    ['miner_icon', 'heatpump_icon', 'ev_icon', 'ac_icon', 'pool_icon', 'washer_icon'].forEach(k => mountSelector(k, "icon"));

    // Bind generic inputs (Selects, Colors, Checkboxes)
    this.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', (ev) => {
            const val = el.type === 'checkbox' ? el.checked : el.value;
            this.updateConfig(el.id, val); 
        });
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && !this._initialized) {
      this.renderForm();
      this._initialized = true;
    }
    // Update all selectors with new hass
    this.querySelectorAll('ha-selector').forEach(sel => {
        sel.hass = hass;
    });
  }
}

if (!customElements.get("openkairo-solar-editor")) {
  customElements.define("openkairo-solar-editor", OpenKairoSolarCardEditor);
}

class OpenKairoSolarCard extends HTMLElement {
  static getConfigElement() { return document.createElement("openkairo-solar-editor"); }

  static getStubConfig() {
    return {
      type: "custom:openkairo-solar-card",
      animation_type: "dots",
      animation_speed: "normal",
      solar_color: "#ffb800",
      grid_color: "#ff4a4a",
      grid_export_color: "#00d1ff",
      home_color: "#10b981",
      battery_color: "#05f0a0",
      miner_color: "#a855f7",
      heatpump_color: "#3b82f6",
      ev_color: "#eab308",
      ac_color: "#3b82f6",
      pool_color: "#00d1ff",
      washer_color: "#f43f5e",
      solar_yield_today_entity: "",
      solar_yield_week_entity: "",
      solar_yield_month_entity: "",
      weather_entity: ""
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = Object.assign({}, config);
    this._layoutBuilt = false; // Reset layout flag on config change
    if (!this.content) {
      this.setupDOM();
    }
  }

  getValStr(key, def="") { return this._config && this._config[key] !== undefined ? this._config[key] : def; }

  setupDOM() {
    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@300;400;800&display=swap');
        
        ha-card {
           background: rgba(10, 20, 28, 0.45); border-radius: 28px; padding: 25px;
           backdrop-filter: blur(15px) saturate(180%); -webkit-backdrop-filter: blur(15px) saturate(180%);
           position: relative; box-shadow: 0 15px 45px rgba(0,0,0,0.7);
           overflow: hidden !important; border: 1px solid rgba(255,255,255,0.1);
           color: #fff; font-family: 'Inter', sans-serif;
           contain: paint;
        }
        
        .header { 
           font-family: 'Orbitron', sans-serif; font-size: 1.1rem; color: #10b981; 
           text-align: center; font-weight: 900; margin-bottom: 25px; letter-spacing: 5px; 
           text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }
        
        .main-container { 
           display: flex; flex-wrap: wrap; gap: 20px; 
           align-items: center; justify-content: center;
           position: relative; width: 100%; min-height: 500px;
        }
        
        .sidebar-stats {
          flex: 0 0 160px; display: flex; flex-direction: column; gap: 15px; 
          z-index: 20; position: relative; padding-top: 10px;
        }
        
        .stat-box {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 12px; display: flex; flex-direction: column;
          align-items: center; gap: 4px; backdrop-filter: blur(8px);
          transition: 0.3s; width: 150px;
        }
        .stat-box:hover { background: rgba(255,255,255,0.07); border-color: rgba(16, 185, 129, 0.3); transform: translateY(-2px);}
        .stat-box ha-icon { --mdc-icon-size: 20px; color: #10b981; margin-bottom: 2px; filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.4));}
        .stat-label { font-size: 0.55rem; text-transform: uppercase; color: rgba(255,255,255,0.4); letter-spacing: 1px; font-weight: 500;}
        .stat-value { font-family: 'Inter', sans-serif; font-size: 0.62rem; font-weight: 800; color: #fff; line-height: 1.2; text-align: center; overflow-wrap: anywhere; max-width: 100%;}

        .flow-container { 
           flex: 1 1 400px; position: relative; height: 500px;
           min-width: 320px; overflow: hidden;
        }
        
        .svg-layer { 
          position: absolute; top:0; left:0; width:100%; height:100%; 
          pointer-events:none; z-index: 1; display: block;
          overflow: hidden !important;
        }
        .svg-wire { fill: none; stroke-width: 1.5; stroke-linecap: round; opacity: 0.15; }
        #particle-canvas { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 2; }

        .node {
           position: absolute; width: 82px; height: 82px; border-radius: 50%;
           background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.5)); 
           border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column;
           justify-content: center; align-items: center; transform: translate(-50%, -50%); z-index: 10;
           box-shadow: 0 12px 30px rgba(0,0,0,0.65), inset 0 0 15px rgba(255,255,255,0.05); 
           backdrop-filter: blur(12px) saturate(180%);
           transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .node * { z-index: 12; }
        .node::after {
           content: ''; position: absolute; inset: -1px; border-radius: 50%;
           border: 1px solid currentColor; opacity: 0.25; pointer-events: none;
        }

        .node-icon { --mdc-icon-size: 28px; margin-bottom: 4px; color: currentColor; opacity: 0.9; filter: drop-shadow(0 0 5px currentColor);}
        .node-value { font-family: 'Orbitron', sans-serif; font-size: 0.82rem; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);}
        .node-label { font-size: 0.58rem; text-transform: uppercase; color: rgba(255,255,255,0.5); letter-spacing: 1.2px; font-weight: 300; margin-top:1px;}

        @keyframes pulseHome {
            0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { transform: translate(-50%, -50%) scale(1.03); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
            100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .pulse-active { animation: pulseHome 2.5s infinite ease-in-out; }

        .footer {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 10px; padding-bottom: 10px;
          font-family: 'Orbitron', sans-serif; font-size: 0.5rem; 
          color: rgba(255,255,255,0.25); letter-spacing: 3px;
          text-shadow: 0 0 5px rgba(16, 185, 129, 0.15);
          border-top: 1px solid rgba(255,255,255,0.03); padding-top: 15px;
        }
        .footer ha-icon { --mdc-icon-size: 14px; color: #10b981; opacity: 0.5; }
        .footer .br-name { font-weight: 800; color: rgba(16, 185, 129, 0.6); margin-left: 2px;}

        /* Mobile Optimization Styling */
        @media (max-width: 600px) {
           ha-card { padding: 15px; border-radius: 20px; }
           .header { font-size: 0.95rem; margin-bottom: 15px; letter-spacing: 3px; }
           .main-container { min-height: auto; gap: 15px; }
           .sidebar-stats {
              flex: 1 1 100%;
              flex-direction: row;
              flex-wrap: wrap;
              gap: 8px;
              justify-content: center;
              padding-top: 0;
           }
           .stat-box {
              flex: 1 1 calc(50% - 8px);
              width: auto;
              padding: 8px;
              border-radius: 12px;
           }
           .flow-container {
              flex: 1 1 100%;
              height: 440px;
           }
           .node {
              width: 68px;
              height: 68px;
           }
           .node-icon {
              --mdc-icon-size: 20px;
              margin-bottom: 2px;
           }
           .node-value {
              font-size: 0.68rem;
           }
           .node-label {
              font-size: 0.48rem;
              letter-spacing: 0.8px;
           }
           .footer {
              margin-top: 5px;
              padding-top: 10px;
              letter-spacing: 2px;
           }
        }
      </style>
      <ha-card>
        <div class="header">ENERGY OS</div>
        <div class="main-container">
          <div class="sidebar-stats" id="sidebar-stats">
            <div class="stat-box" id="stat-today"><ha-icon icon="mdi:calendar-today"></ha-icon><span class="stat-label">Heute</span><span class="stat-value">--</span></div>
            <div class="stat-box" id="stat-week"><ha-icon icon="mdi:calendar-week"></ha-icon><span class="stat-label">Woche</span><span class="stat-value">--</span></div>
            <div class="stat-box" id="stat-month"><ha-icon icon="mdi:calendar-month"></ha-icon><span class="stat-label">Monat</span><span class="stat-value">--</span></div>
            <div class="stat-box" id="stat-weather"><ha-icon icon="mdi:weather-sunny"></ha-icon><span class="stat-label">Wetter</span><span class="stat-value">--</span></div>
          </div>
          <div class="flow-container" id="flow-container">
             <svg class="svg-layer" id="svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
             <canvas id="particle-canvas"></canvas>
          </div>
        </div>
        <div class="footer">
           <ha-icon icon="mdi:flash-circle"></ha-icon>
           POWERED BY <span class="br-name">OPENKAIRO OS</span>
        </div>
      </ha-card>
    `;
    this.content = true;
  }

  // Draw node HTML
  drawNode(id, icon, label, color, x, y) {
      return `<div class="node ${id}" id="node-${id}" style="left: ${x}%; top: ${y}%; border-color: ${color}; color: ${color};">
         <ha-icon class="node-icon" icon="${icon}"></ha-icon>
         <div class="node-value" id="val-${id}">0 W</div>
         <div class="node-label">${label}</div>
      </div>`;
  }

  // Draw wire (static guide line) and store bezier data for canvas
  drawPath(id, color, x1, y1, x2, y2) {
      const midX = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
      // Store bezier control points for canvas particle system
      this._pathDefs = this._pathDefs || {};
      this._pathDefs[id] = { x1, y1, cx1: midX, cy1: y1, cx2: midX, cy2: y2, x2, y2, color };
      return `<path id="wire-${id}" class="svg-wire" d="${d}" stroke="${color}"></path>`;
  }

  updateLayout() {
      const container = this.querySelector('#flow-container');
      if (!container) return;
      this._pathDefs = {};

      const cSolar = this.getValStr('solar_color', '#ffce00');
      const cGrid  = this.getValStr('grid_color', '#ff2222');
      const cHome  = this.getValStr('home_color', '#00ff9d');
      const cBatt  = this.getValStr('battery_color', '#00ffd1');
      const cMiner = this.getValStr('miner_color', '#bf40ff');
      const cHeat  = this.getValStr('heatpump_color', '#1a8cff');
      const cEv    = this.getValStr('ev_color', '#ffe600');

      const nodes = [];
      const wires = [];

      nodes.push(this.drawNode('home', 'mdi:home', 'Haus', cHome, 50, 42));

      if (this.getValStr('solar_entity')) {
          nodes.push(this.drawNode('solar', 'mdi:white-balance-sunny', 'Solar', cSolar, 50, 8));
          wires.push(this.drawPath('solar-home', cSolar, 50, 8, 50, 42));
      }
      if (this.getValStr('grid_import_entity') || this.getValStr('grid_export_entity')) {
          nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'Netz', cGrid, 12, 42));
          wires.push(this.drawPath('grid-home', cGrid, 12, 42, 50, 42));
      }
      if (this.getValStr('battery_power_entity')) {
          // Battery upper-right: far from consumer cluster
          nodes.push(this.drawNode('batt', 'mdi:battery-high', 'Akku', cBatt, 86, 18));
          wires.push(this.drawPath('batt-home', cBatt, 86, 18, 50, 42));
      }
      if (this.getValStr('pool_entity')) {
          const name = this.getValStr('pool_name', 'Pool');
          const icon = this.getValStr('pool_icon', 'mdi:pool');
          const cc = this.getValStr('pool_color', '#00d1ff');
          nodes.push(this.drawNode('pool', icon, name, cc, 14, 72));
          wires.push(this.drawPath('home-pool', cc, 50, 42, 14, 72));
      }
      if (this.getValStr('miner_entity')) {
          const name = this.getValStr('miner_name', 'Miner');
          const icon = this.getValStr('miner_icon', 'mdi:bitcoin');
          nodes.push(this.drawNode('miner', icon, name, cMiner, 30, 84));
          wires.push(this.drawPath('home-miner', cMiner, 50, 42, 30, 84));
      }
      if (this.getValStr('heatpump_entity')) {
          const name = this.getValStr('heatpump_name', 'Heizung');
          const icon = this.getValStr('heatpump_icon', 'mdi:heat-pump');
          nodes.push(this.drawNode('heatpump', icon, name, cHeat, 50, 90));
          wires.push(this.drawPath('home-heatpump', cHeat, 50, 42, 50, 90));
      }
      if (this.getValStr('ev_entity')) {
          const name = this.getValStr('ev_name', 'Auto');
          const icon = this.getValStr('ev_icon', 'mdi:car-electric');
          nodes.push(this.drawNode('ev', icon, name, cEv, 68, 84));
          wires.push(this.drawPath('home-ev', cEv, 50, 42, 68, 84));
      }
      if (this.getValStr('ac_entity')) {
          const name = this.getValStr('ac_name', 'Klima');
          const icon = this.getValStr('ac_icon', 'mdi:air-conditioner');
          const cc = this.getValStr('ac_color', '#3b82f6');
          nodes.push(this.drawNode('ac', icon, name, cc, 82, 72));
          wires.push(this.drawPath('home-ac', cc, 50, 42, 82, 72));
      }
      if (this.getValStr('washer_entity')) {
          const name = this.getValStr('washer_name', 'Waschm.');
          const icon = this.getValStr('washer_icon', 'mdi:washing-machine');
          const cc = this.getValStr('washer_color', '#f43f5e');
          nodes.push(this.drawNode('washer', icon, name, cc, 88, 54));
          wires.push(this.drawPath('home-washer', cc, 50, 42, 88, 54));
      }

      const svg = this.querySelector('#svg-layer');
      if (svg) svg.innerHTML = wires.join('');
      // Remove old nodes, keep canvas
      this.querySelectorAll('.node').forEach(n => n.remove());
      const fc = this.querySelector('#flow-container');
      if (fc) nodes.forEach(h => { const t = document.createElement('div'); t.innerHTML = h; fc.appendChild(t.firstElementChild); });

      this._initCanvas();
  }

  _initCanvas() {
      const canvas = this.querySelector('#particle-canvas');
      if (!canvas) return;
      const fc = this.querySelector('#flow-container');
      canvas.width = fc.offsetWidth || 600;
      canvas.height = fc.offsetHeight || 500;
      this._particles = {}; 
      if (this._rafId) cancelAnimationFrame(this._rafId);
      this._rafId = null;
      this._drawCanvas();
  }

  _bezier(def, t, W, H) {
      const mt = 1 - t;
      const x = mt*mt*mt*(def.x1/100*W) + 3*mt*mt*t*(def.cx1/100*W) + 3*mt*t*t*(def.cx2/100*W) + t*t*t*(def.x2/100*W);
      const y = mt*mt*mt*(def.y1/100*H) + 3*mt*mt*t*(def.cy1/100*H) + 3*mt*t*t*(def.cy2/100*H) + t*t*t*(def.y2/100*H);
      return { x, y };
  }

  _drawCanvas() {
      const canvas = this.querySelector('#particle-canvas');
      if (!canvas) return;
      
      const fc = this.querySelector('#flow-container');
      if (fc) {
          const w = fc.offsetWidth;
          const h = fc.offsetHeight;
          if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
              canvas.width = w;
              canvas.height = h;
          }
      }
      
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const defs = this._pathDefs || {};
      const parts = this._particles || {};

      Object.keys(parts).forEach(pathId => {
          const def = defs[pathId];
          if (!def) return;
          const list = parts[pathId];

          list.forEach(p => {
              // Advance position
              if (p.reverse) {
                  p.t -= p.speed;
                  if (p.t < 0) p.t = 1;
              } else {
                  p.t += p.speed;
                  if (p.t > 1) p.t = 0;
              }
              const pos = this._bezier(def, Math.max(0, Math.min(1, p.t)), W, H);

              // Draw comet trail
              if (p.trailLen > 0) {
                  p.history = p.history || [];
                  p.history.push({ x: pos.x, y: pos.y });
                  if (p.history.length > p.trailLen) p.history.shift();
                  p.history.forEach((hp, i) => {
                      const ratio = i / p.history.length;
                      const tr = p.radius * ratio * 0.9;
                      if (tr < 0.5) return;
                      ctx.beginPath();
                      ctx.arc(hp.x, hp.y, tr, 0, Math.PI * 2);
                      ctx.fillStyle = p.color;
                      ctx.globalAlpha = ratio * 0.6;
                      ctx.fill();
                  });
                  ctx.globalAlpha = 1;
              }

              const r = p.radius;
              const gMult = p.glowMult || 2.5;

              // Draw glow halo
              const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * gMult);
              grd.addColorStop(0,   p.color + 'ff');
              grd.addColorStop(0.5, p.color + '88');
              grd.addColorStop(1,   p.color + '00');
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, r * gMult, 0, Math.PI * 2);
              ctx.fillStyle = grd;
              ctx.fill();

              // Solid white core
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.globalAlpha = 0.95;
              ctx.fill();
              ctx.globalAlpha = 1.0;
          });
      });

      this._rafId = requestAnimationFrame(() => this._drawCanvas());
  }

  _setFlow(pathId, watts, reverse = false, colorOverride = null) {
      if (!this._pathDefs || !this._pathDefs[pathId]) return;
      const def = this._pathDefs[pathId];
      const color = colorOverride || def.color;
      const absW = Math.abs(watts);
      this._particles = this._particles || {};

      if (absW < 5) {
          this._particles[pathId] = [];
          return;
      }

      // Read user settings
      const animType = this.getValStr('animation_type', 'dots');

      // Dynamic Speed formula: non-linear, beautiful fluidity across all wattages
      const speedBase = 0.0018 + Math.min(0.015, Math.pow(absW / 5000, 0.5) * 0.013);

      // Base dynamic particle count
      let count = Math.max(1, Math.min(6, Math.ceil(Math.pow(absW / 200, 0.6))));

      // Ball appearance per animation type
      let radius = 4, glowMult = 2.5, trailLen = 0;
      switch (animType) {
          case 'dots':   
              radius = 4.5; glowMult = 2.5; trailLen = 0; 
              break;
          case 'dash':   
              radius = 3.5; glowMult = 1.8; trailLen = 0; 
              count = Math.max(2, count + 1); 
              break;
          case 'neon':   
              radius = 4;   glowMult = 5;   trailLen = 4; 
              break;
          case 'comet':  
              radius = 5.5; glowMult = 2;   trailLen = 14; 
              count = Math.max(1, Math.min(4, Math.ceil(Math.pow(absW / 600, 0.6)))); 
              break;
          case 'pulse':  
              radius = 7;   glowMult = 3.5; trailLen = 0; 
              count = Math.max(1, Math.min(3, Math.ceil(absW / 1200))); 
              break;
          case 'liquid': 
              radius = 5.5; glowMult = 2.8; trailLen = 6; 
              break;
          case 'warp':   
              radius = 3;   glowMult = 2;   trailLen = 18; 
              count = Math.max(2, count); 
              break;
      }

      const existing = this._particles[pathId] || [];
      const newList = [];
      for (let i = 0; i < count; i++) {
          const ex = existing[i];
          newList.push({
              t: ex ? ex.t : i / count,
              speed: speedBase,
              reverse,
              color,
              radius,
              glowMult,
              trailLen,
              history: ex ? (ex.history || []) : []
          });
      }
      this._particles[pathId] = newList;
  }

  set hass(hass) {
    try {
      if (!this._config || !hass || !hass.states) return;
      
      if (!this._layoutBuilt) {
          this.updateLayout();
          this._layoutBuilt = true;
      }

    const getPower = (entityId, isKw) => {
        if (!entityId) return 0;
        const state = hass.states[entityId];
        let val = state ? parseFloat(state.state) || 0 : 0;
        return isKw ? val * 1000 : val;
    };

    const formatPower = (val) => {
        const abs = Math.abs(val);
        if (abs >= 1000) return (abs / 1000).toFixed(1) + ' kW';
        return Math.round(abs) + ' W';
    };

    const upd = (id, val, colorOverride = null) => {
        const el = this.querySelector(`#val-${id}`);
        const n = this.querySelector(`#node-${id}`);
        if (el) el.innerText = formatPower(val);
        if (n && colorOverride) {
            n.style.borderColor = colorOverride;
            n.style.color = colorOverride;
            const icon = n.querySelector('ha-icon');
            if (icon) icon.style.color = colorOverride;
        }
        
        // Pulse effects for Home and Solar/Battery when active
        if (id === 'home') {
            const absVal = Math.abs(val);
            if (absVal > 500) n.classList.add('pulse-active');
            else n.classList.remove('pulse-active');
        }
    };
    
    let solarW = getPower(this._config.solar_entity, this._config.solar_entity_kw);
    let gridInW = getPower(this._config.grid_import_entity, this._config.grid_import_entity_kw);
    let gridOutW = getPower(this._config.grid_export_entity, this._config.grid_export_entity_kw);
    let battW = getPower(this._config.battery_power_entity, this._config.battery_power_entity_kw); 
    if (this.getValStr('battery_invert')) battW = battW * -1; 
    
    let minerW = getPower(this._config.miner_entity, this._config.miner_entity_kw);
    let heatW = getPower(this._config.heatpump_entity, this._config.heatpump_entity_kw);
    let evW = getPower(this._config.ev_entity, this._config.ev_entity_kw);
    let acW = getPower(this._config.ac_entity, this._config.ac_entity_kw);
    let poolW = getPower(this._config.pool_entity, this._config.pool_entity_kw);
    let washerW = getPower(this._config.washer_entity, this._config.washer_entity_kw);

    const getValRaw = (entityId) => {
        if (!entityId) return 0;
        const state = hass.states[entityId];
        return state ? parseFloat(state.state) || 0 : 0;
    };

    let extraConsumers = minerW + heatW + evW + acW + poolW + washerW;
    let baseBalance = solarW + gridInW - gridOutW + battW;
    
    let totalHomeW = baseBalance;
    const calcMode = this.getValStr('home_calc_mode', 'subtract');
    
    if (calcMode === 'subtract') {
        totalHomeW = baseBalance - extraConsumers;
        if (totalHomeW < 0) totalHomeW = 0;
    } else if (calcMode === 'add') {
        totalHomeW = baseBalance + extraConsumers;
    } else {
        totalHomeW = baseBalance;
    }

    // Battery Level (%)
    const battLevel = getValRaw(this._config.battery_level_entity);

    const cEx = this.getValStr('grid_export_color', '#00d1ff');
    const cGr = this.getValStr('grid_color', '#ff4a4a');

    upd('solar', solarW);
    
    // Grid Logic (Import vs Export)
    if (gridOutW > 0 || gridInW < 0) {
        const exportVal = gridOutW > 0 ? gridOutW : Math.abs(gridInW);
        upd('grid', -exportVal, cEx);
        this._setFlow('grid-home', exportVal, true, cEx);
    } else {
        upd('grid', gridInW, cGr);
        this._setFlow('grid-home', gridInW, false, cGr);
    }
    
    // Custom label for Battery to include SOC
    const battEl = this.querySelector(`#val-batt`);
    if (battEl) {
        battEl.innerHTML = `<div>${formatPower(battW)}</div><div style="font-size:0.6rem; opacity:0.7;">${Math.round(battLevel)}%</div>`;
    }

    upd('home', totalHomeW);
    upd('miner', minerW);
    upd('heatpump', heatW);
    upd('ev', evW);
    upd('ac', acW);
    upd('pool', poolW);
    upd('washer', washerW);

    this._setFlow('solar-home', solarW, false);
    this._setFlow('batt-home', battW, battW < 0);
    this._setFlow('home-miner', minerW, false);
    this._setFlow('home-heatpump', heatW, false);
    this._setFlow('home-ev', evW, false);
    this._setFlow('home-ac', acW, false);
    this._setFlow('home-pool', poolW, false);
    this._setFlow('home-washer', washerW, false);
    
    // Stats & Weather (Auto-Scaling & Unit-Aware)
    const updateStat = (id, entityId, isKw = false) => {
        const el = this.querySelector(`#stat-${id}`);
        if (!el) return;
        if (!entityId) { el.style.display = 'none'; return; }
        el.style.display = 'flex';
        const state = hass.states[entityId];
        let val = state ? parseFloat(state.state) || 0 : null;
        if (val !== null && isKw) val *= 1000;
        let unit = state && state.attributes.unit_of_measurement ? state.attributes.unit_of_measurement : 'kWh';
        
        // Intelligent Auto-Scaling
        if (unit.toLowerCase() === 'wh' && val >= 1000) { val /= 1000; unit = 'kWh'; }
        else if (unit.toLowerCase() === 'kwh' && val >= 1000) { val /= 1000; unit = 'MWh'; }
        
        const valStr = val !== null ? (val < 10 ? val.toFixed(2) : val.toFixed(1)) + ' ' + unit : '--';
        const valEl = el.querySelector('.stat-value');
        if (valEl) valEl.innerText = valStr;
    };

    updateStat('today', this._config.solar_yield_today_entity, this._config.solar_yield_today_entity_kw);
    updateStat('week', this._config.solar_yield_week_entity, this._config.solar_yield_week_entity_kw);
    updateStat('month', this._config.solar_yield_month_entity, this._config.solar_yield_month_entity_kw);
    
    // Weather
    const weatherEnt = this._config.weather_entity;
    if (weatherEnt && hass.states[weatherEnt]) {
        const wS = hass.states[weatherEnt];
        const temp = wS.attributes.temperature;
        const state = wS.state;
        const wEl = this.querySelector(`#stat-weather .stat-value`);
        const wIcon = this.querySelector(`#stat-weather ha-icon`);
        if (wEl) wEl.innerText = temp !== undefined ? temp + '°C' : '--°C';
        if (wIcon) {
            const iconMap = { 'sunny': 'mdi:weather-sunny', 'cloudy': 'mdi:weather-cloudy', 'partlycloudy': 'mdi:weather-partly-cloudy', 'rainy': 'mdi:weather-rainy', 'snowy': 'mdi:weather-snowy', 'clear-night': 'mdi:weather-night' };
            wIcon.setAttribute('icon', iconMap[state] || 'mdi:weather-cloudy');
        }
    }
    
    } catch(err) {
      console.error("OpenKairo Solar Card Error:", err);
    }
  }

  getCardSize() { return 12; }
}

if (!customElements.get("openkairo-solar-card")) {
  customElements.define("openkairo-solar-card", OpenKairoSolarCard);
}

window.customCards = window.customCards || [];
const cardExists = window.customCards.find(c => c.type === "openkairo-solar-card");
if (!cardExists) {
  window.customCards.push({
    type: "openkairo-solar-card",
    name: "OpenKairo Solar Dashboard",
    description: "Advanced Energy Flow Dashboard with Visual Editor.",
    preview: true
  });
}
