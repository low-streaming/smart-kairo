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
        .row { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { display: block; font-size: 11px; margin-bottom: 4px; color: var(--secondary-text-color); font-weight: bold; text-transform: uppercase; }
        ha-entity-picker { width: 100%; }
        input[type="color"] { background: none; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; height: 36px; padding: 2px; cursor:pointer;}
        select { background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid rgba(255,255,255,0.2); padding: 8px; border-radius: 4px; width: 100%; }
        h3 { margin-top: 0; margin-bottom: 15px; color: var(--primary-color); border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; font-family: sans-serif; }
      </style>
      <div class="card-config">
        
        <div class="group">
          <h3>Haupteinstellungen & Aussehen</h3>
          <div class="row">
            <div class="row-col">
              <label>Animations-Typ</label>
              <select id="animation_type">
                <option value="dots" ${this.getVal('animation_type') === 'dots' ? 'selected' : ''}>Energie-Kugeln (Dots)</option>
                <option value="dash" ${this.getVal('animation_type') === 'dash' ? 'selected' : ''}>Strichel-Linien (Dash)</option>
                <option value="neon" ${this.getVal('animation_type') === 'neon' ? 'selected' : ''}>Neon Blitz (Flash)</option>
              </select>
            </div>
            <div class="row-col">
              <label>Geschwindigkeit</label>
              <select id="animation_speed">
                <option value="slow" ${this.getVal('animation_speed') === 'slow' ? 'selected' : ''}>Langsam</option>
                <option value="normal" ${this.getVal('animation_speed') === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="fast" ${this.getVal('animation_speed') === 'fast' ? 'selected' : ''}>Schnell</option>
              </select>
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Energiequellen</h3>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Solarproduktion (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="solar_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="solar_color" value="${this.getVal('solar_color', '#ffb800')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="solar_entity_kw" ${this.getVal('solar_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Netzbezug (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="grid_import_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="grid_import_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="grid_color" value="${this.getVal('grid_color', '#ff4a4a')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="grid_import_entity_kw" ${this.getVal('grid_import_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Netzeinspeisung (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="grid_export_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="grid_export_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Export-Farbe</label><input type="color" id="grid_export_color" value="${this.getVal('grid_export_color', '#00d1ff')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="grid_export_entity_kw" ${this.getVal('grid_export_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Haus / Eigenverbrauch</label>
              <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:5px;">(Wird automatisch aus Saldo berechnet)</div>
            </div>
            <div class="row-col"><label>Haus-Farbe</label><input type="color" id="home_color" value="${this.getVal('home_color', '#10b981')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Batterieleistung (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="battery_power_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="battery_power_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="battery_color" value="${this.getVal('battery_color', '#05f0a0')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="battery_power_entity_kw" ${this.getVal('battery_power_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Batterieladung (%)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="battery_level_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="battery_level_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col" style="justify-content:center;">
               <label>Batt. Invertieren?</label>
               <input type="checkbox" id="battery_invert" ${this.getVal('battery_invert') ? 'checked' : ''}>
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Optionale Sonderverbraucher</h3>
          <!-- CRYPTO MINER -->
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Crypto Miner (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="miner_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="miner_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="miner_color" value="${this.getVal('miner_color', '#a855f7')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="miner_entity_kw" ${this.getVal('miner_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Anzeigename</label><input type="text" id="miner_name" value="${this.getVal('miner_name', 'Miner')}"></div>
            <div class="row-col"><label>Icon (MDI)</label><div id="miner_icon_picker"></div></div>
          </div>
          
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:15px 0;">

          <!-- WÄRMEPUMPE -->
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Wärmepumpe / Heizung (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="heatpump_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="heatpump_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="heatpump_color" value="${this.getVal('heatpump_color', '#3b82f6')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="heatpump_entity_kw" ${this.getVal('heatpump_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Anzeigename</label><input type="text" id="heatpump_name" value="${this.getVal('heatpump_name', 'Heizung')}"></div>
            <div class="row-col"><label>Icon (MDI)</label><div id="heatpump_icon_picker"></div></div>
          </div>

          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:15px 0;">

          <!-- E-AUTO -->
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>E-Auto / Wallbox (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="ev_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="ev_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="ev_color" value="${this.getVal('ev_color', '#eab308')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="ev_entity_kw" ${this.getVal('ev_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Anzeigename</label><input type="text" id="ev_name" value="${this.getVal('ev_name', 'Auto')}"></div>
            <div class="row-col"><label>Icon (MDI)</label><div id="ev_icon_picker"></div></div>
          </div>

          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:15px 0;">

          <!-- KLIMAANLAGE -->
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Klimaanlage (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="ac_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="ac_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="ac_color" value="${this.getVal('ac_color', '#3b82f6')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="ac_entity_kw" ${this.getVal('ac_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Anzeigename</label><input type="text" id="ac_name" value="${this.getVal('ac_name', 'Klima')}"></div>
            <div class="row-col"><label>Icon (MDI)</label><div id="ac_icon_picker"></div></div>
          </div>

          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:15px 0;">

          <!-- POOL -->
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Pool / Teich (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="pool_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="pool_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="pool_color" value="${this.getVal('pool_color', '#00d1ff')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="pool_entity_kw" ${this.getVal('pool_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Anzeigename</label><input type="text" id="pool_name" value="${this.getVal('pool_name', 'Pool')}"></div>
            <div class="row-col"><label>Icon (MDI)</label><div id="pool_icon_picker"></div></div>
          </div>

          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05); margin:15px 0;">

          <!-- WASCHMASCHINE -->
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Waschm. / Spülm. (W)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="washer_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="washer_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="washer_color" value="${this.getVal('washer_color', '#f43f5e')}"></div>
            <div class="row-col" style="flex:0.5; min-width:45px;"><label>kW?</label><input type="checkbox" id="washer_entity_kw" ${this.getVal('washer_entity_kw') ? 'checked' : ''}></div>
          </div>
          <div class="row">
            <div class="row-col"><label>Anzeigename</label><input type="text" id="washer_name" value="${this.getVal('washer_name', 'Waschm.')}"></div>
            <div class="row-col"><label>Icon (MDI)</label><div id="washer_icon_picker"></div></div>
          </div>
        </div>

        <div class="group">
          <h3>Statistiken & Wetter</h3>
          <div class="row">
            <div class="row-col">
              <label>Ertrag Heute (kWh)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="solar_yield_today_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_yield_today_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="row-col">
              <label>Ertrag Woche (kWh)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="solar_yield_week_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_yield_week_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="row-col">
              <label>Ertrag Monat (kWh)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="solar_yield_month_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_yield_month_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="row-col">
              <label>Wetter (Entity)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <div id="weather_entity_picker" style="flex:1;"></div>
                <ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="weather_entity" style="--mdc-icon-size:20px; opacity:0.3; cursor:pointer;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3"></ha-icon>
              </div>
            </div>
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
        'battery_power_entity', 'battery_soc_entity',
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
    }
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
           background: rgba(10, 20, 28, 0.98); border-radius: 28px; padding: 25px;
           position: relative; box-shadow: 0 15px 45px rgba(0,0,0,0.7);
           overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
           color: #fff; font-family: 'Inter', sans-serif;
        }
        
        .header { 
           font-family: 'Orbitron', sans-serif; font-size: 1.1rem; color: #10b981; 
           text-align: center; font-weight: 900; margin-bottom: 25px; letter-spacing: 5px; 
           text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
        }
        
        .main-container { 
           display: grid; grid-template-columns: 170px 1fr; gap: 10px; 
           align-items: center; position: relative; width: 100%; min-height: 500px;
        }
        
        .sidebar-stats {
          display: flex; flex-direction: column; gap: 15px; width: 160px; 
          flex-shrink: 0; padding-top: 10px;
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
           position: relative; width: 100%; height: 500px;
           display: flex; align-items: center; justify-content: center;
           margin-left: 0;
        }
        
        .svg-layer { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 1;}
        .svg-path { fill: none; stroke-width: 1.5; stroke-linecap: round; transition: 0.5s; opacity: 0.15; }
        
        /* Animation Types - Premium Particles */
        .anim-dots { stroke-dasharray: 2 15; animation: dashAnim linear infinite; stroke-linecap: round; filter: drop-shadow(0 0 3px currentColor);}
        .anim-dash { stroke-dasharray: 8 20; animation: dashAnim linear infinite; }
        .anim-neon { stroke-dasharray: 10 30; animation: dashAnim linear infinite; filter: url(#neon-glow); stroke-width: 1.8;}
        
        @keyframes dashAnim { to { stroke-dashoffset: -100; } }

        .node {
           position: absolute; width: 68px; height: 68px; border-radius: 50%;
           background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.5)); 
           border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column;
           justify-content: center; align-items: center; transform: translate(-50%, -50%); z-index: 10;
           box-shadow: 0 10px 25px rgba(0,0,0,0.6), inset 0 0 15px rgba(255,255,255,0.05); 
           backdrop-filter: blur(12px) saturate(180%);
           transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .node * { z-index: 12; }
        .node::after {
           content: ''; position: absolute; inset: -1px; border-radius: 50%;
           border: 1px solid currentColor; opacity: 0.25; pointer-events: none;
        }

        .node-icon { --mdc-icon-size: 24px; margin-bottom: 3px; color: currentColor; opacity: 0.9; filter: drop-shadow(0 0 5px currentColor);}
        .node-value { font-family: 'Orbitron', sans-serif; font-size: 0.72rem; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);}
        .node-label { font-size: 0.5rem; text-transform: uppercase; color: rgba(255,255,255,0.5); letter-spacing: 1.2px; font-weight: 300;}

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
             <svg class="svg-layer" id="svg-layer">
                <defs>
                  <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
             </svg>
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

  // Generate SVG Path relative to percentages (rough bounding box math)
  drawPath(id, color, x1, y1, x2, y2, curved = true) {
      if (!curved) return `<path id="path-${id}" class="svg-path" d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}"></path>`;
      return `<path id="path-${id}" class="svg-path" d="M ${x1} ${y1} Q ${x1} ${y2}, ${x2} ${y2}" stroke="${color}"></path>`;
  }

  updateLayout() {
      const container = this.querySelector('#flow-container');
      if (!container) return;

      const cSolar = this.getValStr('solar_color', '#ffb800');
      const cGrid = this.getValStr('grid_color', '#ff4a4a');
      const cHome = this.getValStr('home_color', '#10b981');
      const cBatt = this.getValStr('battery_color', '#05f0a0');
      const cMiner = this.getValStr('miner_color', '#a855f7');
      const cHeat = this.getValStr('heatpump_color', '#3b82f6');
      const cEv = this.getValStr('ev_color', '#eab308');

      const nodes = [];
      const paths = [];

      nodes.push(this.drawNode('home', 'mdi:home', 'Haus', cHome, 50, 35));
      if (this.getValStr('solar_entity')) {
          nodes.push(this.drawNode('solar', 'mdi:white-balance-sunny', 'Solar', cSolar, 50, 10));
          paths.push(this.drawPath('solar-home', cSolar, 50, 10, 50, 35));
      }
      if (this.getValStr('grid_import_entity') || this.getValStr('grid_export_entity')) {
          nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'Netz', cGrid, 15, 35));
          paths.push(this.drawPath('grid-home', cGrid, 15, 35, 50, 35));
      }
      if (this.getValStr('battery_power_entity')) {
          nodes.push(this.drawNode('batt', 'mdi:battery-high', 'Akku', cBatt, 85, 35));
          paths.push(this.drawPath('batt-home', cBatt, 85, 35, 50, 35));
      }
      
      // Options in arc layout below
      if (this.getValStr('pool_entity')) {
          const name = this.getValStr('pool_name', 'Pool');
          const icon = this.getValStr('pool_icon', 'mdi:pool');
          nodes.push(this.drawNode('pool', icon, name, this.getValStr('pool_color', '#00d1ff'), 12, 65));
          paths.push(this.drawPath('home-pool', this.getValStr('pool_color', '#00d1ff'), 50, 35, 12, 65, false));
      }
      if (this.getValStr('miner_entity')) {
          const name = this.getValStr('miner_name', 'Miner');
          const icon = this.getValStr('miner_icon', 'mdi:bitcoin');
          nodes.push(this.drawNode('miner', icon, name, cMiner, 25, 82));
          paths.push(this.drawPath('home-miner', cMiner, 50, 35, 25, 82, false));
      }
      if (this.getValStr('heatpump_entity')) {
          const name = this.getValStr('heatpump_name', 'Heizung');
          const icon = this.getValStr('heatpump_icon', 'mdi:heat-pump');
          nodes.push(this.drawNode('heatpump', icon, name, cHeat, 42, 92));
          paths.push(this.drawPath('home-heatpump', cHeat, 50, 35, 42, 92, false));
      }
      if (this.getValStr('ev_entity')) {
          const name = this.getValStr('ev_name', 'Auto');
          const icon = this.getValStr('ev_icon', 'mdi:car-electric');
          nodes.push(this.drawNode('ev', icon, name, cEv, 58, 92));
          paths.push(this.drawPath('home-ev', cEv, 50, 35, 58, 92, false));
      }
      if (this.getValStr('ac_entity')) {
          const name = this.getValStr('ac_name', 'Klima');
          const icon = this.getValStr('ac_icon', 'mdi:air-conditioner');
          nodes.push(this.drawNode('ac', icon, name, this.getValStr('ac_color', '#3b82f6'), 75, 82));
          paths.push(this.drawPath('home-ac', this.getValStr('ac_color', '#3b82f6'), 50, 35, 75, 82, false));
      }
      if (this.getValStr('washer_entity')) {
          const name = this.getValStr('washer_name', 'Waschm.');
          const icon = this.getValStr('washer_icon', 'mdi:washing-machine');
          nodes.push(this.drawNode('washer', icon, name, this.getValStr('washer_color', '#f43f5e'), 88, 65));
          paths.push(this.drawPath('home-washer', this.getValStr('washer_color', '#f43f5e'), 50, 35, 88, 65, false));
      }

      const svgHtml = `
      <svg class="svg-layer" id="svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
         <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
         </defs>
         ${paths.join('')}
      </svg>`;
      container.innerHTML = svgHtml + nodes.join('');
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
          if (abs >= 1000) return (val / 1000).toFixed(1) + ' kW';
          return Math.round(val) + ' W';
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
    let homeW = solarW + gridInW - gridOutW + battW - extraConsumers;
    if (homeW < 0) homeW = 0;
    
    let totalHomeW = homeW + extraConsumers; 

    // Battery Level (%)
    const battLevel = getValRaw(this._config.battery_level_entity);

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
            if (val > 500) n.classList.add('pulse-active');
            else n.classList.remove('pulse-active');
        }
    };
    
    const cEx = this.getValStr('grid_export_color', '#00d1ff');
    const cGr = this.getValStr('grid_color', '#ff4a4a');

    upd('solar', solarW);
    if (gridOutW > 0) {
        upd('grid', -gridOutW, cEx);
    } else {
        upd('grid', gridInW, cGr);
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

    const animType = this.getValStr('animation_type', 'dots');
    const animSpeedStr = this.getValStr('animation_speed', 'normal');
    const speedMult = animSpeedStr === 'fast' ? 0.5 : animSpeedStr === 'slow' ? 2 : 1;

    const animatePath = (pathId, flowW, maxExpected, reverse = false, colorOverride = null) => {
        const p = this.querySelector(`#path-${pathId}`);
        if (!p) return;
        if (Math.abs(flowW) < 5) {
            p.style.opacity = '0.1';
            p.style.animation = 'none';
        } else {
            p.style.opacity = '0.8';
            p.setAttribute('class', `svg-path anim-${animType}`);
            p.style.animation = '';
            if (colorOverride) p.setAttribute('stroke', colorOverride);
            let duration = (2000 / Math.max(100, Math.abs(flowW))) * speedMult;
            if (duration > 3) duration = 3; 
            if (duration < 0.2) duration = 0.2; 
            
            p.style.animationDuration = duration + 's';
            p.style.animationDirection = reverse ? 'reverse' : 'normal';
        }
    };

    animatePath('solar-home', solarW, 5000, false);
    animatePath('grid-home', gridInW > 0 ? gridInW : gridOutW, 5000, gridOutW > 0, gridOutW > 0 ? cEx : cGr);
    animatePath('batt-home', battW, 3000, battW < 0); 
    animatePath('home-miner', minerW, 2000, false);
    animatePath('home-heatpump', heatW, 3000, false);
    animatePath('home-ev', evW, 11000, false);
    animatePath('home-ac', acW, 3000, false);
    animatePath('home-pool', poolW, 5000, false);
    animatePath('home-washer', washerW, 3000, false);
    
    // Stats & Weather (Unit-Aware)
    const updateStat = (id, entityId) => {
        const el = this.querySelector(`#stat-${id}`);
        if (!el) return;
        if (!entityId) { el.style.display = 'none'; return; }
        el.style.display = 'flex';
        const state = hass.states[entityId];
        const val = state ? parseFloat(state.state) || 0 : null;
        const unit = state && state.attributes.unit_of_measurement ? ' ' + state.attributes.unit_of_measurement : ' kWh';
        const valEl = el.querySelector('.stat-value');
        if (valEl) valEl.innerText = val !== null ? (Math.round(val * 10) / 10) + unit : '--';
    };

    updateStat('today', this._config.solar_yield_today_entity);
    updateStat('week', this._config.solar_yield_week_entity);
    updateStat('month', this._config.solar_yield_month_entity);
    
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
