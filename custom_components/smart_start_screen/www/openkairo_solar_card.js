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
              <div id="solar_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="solar_color" value="${this.getVal('solar_color', '#ffb800')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Netzbezug (W)</label>
              <div id="grid_import_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="grid_color" value="${this.getVal('grid_color', '#ff4a4a')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Netzeinspeisung (W)</label>
              <div id="grid_export_entity_picker"></div>
            </div>
            <div class="row-col"><label>Export-Farbe</label><input type="color" id="grid_export_color" value="${this.getVal('grid_export_color', '#00d1ff')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Haus / Eigenverbrauch</label>
              <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:5px;">(Wird automatisch aus Saldo berechnet)</div>
            </div>
            <div class="row-col"><label>Haus-Farbe</label><input type="color" id="home_color" value="${this.getVal('home_color', '#10b981')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Batterieleistung (W)</label>
              <div id="battery_power_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="battery_color" value="${this.getVal('battery_color', '#05f0a0')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Batterieladung (%)</label>
              <div id="battery_level_entity_picker"></div>
            </div>
            <div class="row-col" style="justify-content:center;">
               <label>Batt. Invertieren?</label>
               <input type="checkbox" id="battery_invert" ${this.getVal('battery_invert') ? 'checked' : ''}>
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Optionale Sonderverbraucher</h3>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Crypto Miner (W)</label>
              <div id="miner_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="miner_color" value="${this.getVal('miner_color', '#a855f7')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Wärmepumpe / Heizung (W)</label>
              <div id="heatpump_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="heatpump_color" value="${this.getVal('heatpump_color', '#3b82f6')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>E-Auto / Wallbox (W)</label>
              <div id="ev_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="ev_color" value="${this.getVal('ev_color', '#eab308')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Kliamanlage (W)</label>
              <div id="ac_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="ac_color" value="${this.getVal('ac_color', '#3b82f6')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Pool / Teich (W)</label>
              <div id="pool_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="pool_color" value="${this.getVal('pool_color', '#00d1ff')}"></div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:3;">
              <label>Waschm. / Spülm. (W)</label>
              <div id="washer_entity_picker"></div>
            </div>
            <div class="row-col"><label>Farbe</label><input type="color" id="washer_color" value="${this.getVal('washer_color', '#f43f5e')}"></div>
          </div>
        </div>

      </div>
    `;

    // Dynamically mount Entity Pickers to prevent ConnectedCallback crash in HA
    const mountPicker = (id) => {
        const picker = document.createElement('ha-selector');
        picker.hass = this._hass;
        picker.selector = { entity: {} };
        picker.value = this.getVal(id);
        picker.addEventListener('value-changed', (ev) => { this.updateConfig(id, ev.detail.value); });
        
        const container = this.querySelector(`#${id}_picker`);
        if(container) container.appendChild(picker);
    };

    [
        'solar_entity', 'grid_import_entity', 'grid_export_entity',
        'battery_power_entity', 'battery_level_entity',
        'miner_entity', 'heatpump_entity', 'ev_entity',
        'ac_entity', 'pool_entity', 'washer_entity'
    ].forEach(mountPicker);

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
      washer_color: "#f43f5e"
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
          background: rgba(5, 12, 18, 0.85); backdrop-filter: blur(20px);
          border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px;
          color: #fff; font-family: 'Inter', sans-serif; padding: 20px;
          position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        
        .header { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; color: #10b981; text-align: center; font-weight: 900; margin-bottom: 20px; letter-spacing: 2px;}
        
        .flow-container { position: relative; width: 100%; aspect-ratio: 1.5; min-height: 480px; display: flex; align-items: center; justify-content: center;}
        
        .svg-layer { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 1;}
        .svg-path { fill: none; stroke-width: 4; stroke-linecap: round; transition: 0.5s; opacity: 0.2; }
        
        /* Animation Types */
        .anim-dots { stroke-dasharray: 4 20; animation: dashAnim linear infinite; stroke-linecap: round;}
        .anim-dash { stroke-dasharray: 20 20; animation: dashAnim linear infinite; }
        .anim-neon { stroke-dasharray: 100 200; animation: dashAnim linear infinite; filter: drop-shadow(0 0 8px currentColor); stroke-width: 3;}
        
        @keyframes dashAnim { to { stroke-dashoffset: -100; } }

        .node {
           position: absolute; width: 65px; height: 65px; border-radius: 50%;
           background: rgba(0,0,0,0.5); border: 2px solid; display: flex; flex-direction: column;
           justify-content: center; align-items: center; transform: translate(-50%, -50%); z-index: 10;
           box-shadow: 0 5px 15px rgba(0,0,0,0.5); backdrop-filter: blur(10px);
           transition: 0.3s;
        }
        .node * { z-index: 12; }
        .node::before {
           content: ''; position: absolute; inset: 0; border-radius: 50%;
           box-shadow: inset 0 0 20px currentColor; opacity: 0.2;
        }

        .node-icon { --mdc-icon-size: 24px; margin-bottom: 2px; color: currentColor; }
        .node-value { font-family: 'Orbitron', sans-serif; font-size: 0.75rem; font-weight: 900; color: #fff;}
        .node-label { font-size: 0.5rem; text-transform: uppercase; color: rgba(255,255,255,0.5); letter-spacing: 1px;}
      </style>
      <ha-card>
        <div class="header">ENERGY OS</div>
        <div class="flow-container" id="flow-container">
           <svg class="svg-layer" id="svg-layer"></svg>
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
  drawPath(id, color, x1, y1, x2, y2) {
      // Use relatively scaled coordinates via SVG viewBox
      return `<path id="path-${id}" class="svg-path" d="M ${x1} ${y1} Q ${x1} ${y2}, ${x2} ${y2}" stroke="${color}"></path>`;
  }

  updateLayout() {
      const container = this.querySelector('#flow-container');
      const svg = this.querySelector('#svg-layer');
      
      const cSolar = this.getValStr('solar_color', '#ffb800');
      const cGrid = this.getValStr('grid_color', '#ff4a4a');
      const cHome = this.getValStr('home_color', '#10b981');
      const cBatt = this.getValStr('battery_color', '#05f0a0');
      const cMiner = this.getValStr('miner_color', '#a855f7');
      const cHeat = this.getValStr('heatpump_color', '#3b82f6');
      const cEv = this.getValStr('ev_color', '#eab308');

      const nodes = [];
      const paths = [];

      nodes.push(this.drawNode('home', 'mdi:home', 'Haus', cHome, 50, 40));
      if (this.getValStr('solar_entity')) {
          nodes.push(this.drawNode('solar', 'mdi:white-balance-sunny', 'Solar', cSolar, 50, 10));
          paths.push(this.drawPath('solar-home', cSolar, 50, 10, 50, 40));
      }
      if (this.getValStr('grid_import_entity') || this.getValStr('grid_export_entity')) {
          nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'Netz', cGrid, 15, 40));
          paths.push(this.drawPath('grid-home', cGrid, 15, 40, 50, 40));
      }
      if (this.getValStr('battery_power_entity')) {
          nodes.push(this.drawNode('batt', 'mdi:battery-high', 'Akku', cBatt, 85, 40));
          paths.push(this.drawPath('batt-home', cBatt, 85, 40, 50, 40));
      }
      
      // Options in arc layout below
      if (this.getValStr('pool_entity')) {
          nodes.push(this.drawNode('pool', 'mdi:pool', 'Pool', this.getValStr('pool_color', '#00d1ff'), 10, 65));
          paths.push(this.drawPath('home-pool', this.getValStr('pool_color', '#00d1ff'), 50, 40, 10, 65));
      }
      if (this.getValStr('miner_entity')) {
          nodes.push(this.drawNode('miner', 'mdi:bitcoin', 'Miner', cMiner, 25, 75));
          paths.push(this.drawPath('home-miner', cMiner, 50, 40, 25, 75));
      }
      if (this.getValStr('heatpump_entity')) {
          nodes.push(this.drawNode('heatpump', 'mdi:heat-pump', 'Heizung', cHeat, 40, 90));
          paths.push(this.drawPath('home-heatpump', cHeat, 50, 40, 40, 90));
      }
      if (this.getValStr('ev_entity')) {
          nodes.push(this.drawNode('ev', 'mdi:car-electric', 'Auto', cEv, 60, 90));
          paths.push(this.drawPath('home-ev', cEv, 50, 40, 60, 90));
      }
      if (this.getValStr('ac_entity')) {
          nodes.push(this.drawNode('ac', 'mdi:air-conditioner', 'Klima', this.getValStr('ac_color', '#3b82f6'), 75, 75));
          paths.push(this.drawPath('home-ac', this.getValStr('ac_color', '#3b82f6'), 50, 40, 75, 75));
      }
      if (this.getValStr('washer_entity')) {
          nodes.push(this.drawNode('washer', 'mdi:washing-machine', 'Waschm.', this.getValStr('washer_color', '#f43f5e'), 90, 65));
          paths.push(this.drawPath('home-washer', this.getValStr('washer_color', '#f43f5e'), 50, 40, 90, 65));
      }

      const svgHtml = `<svg class="svg-layer" id="svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">${paths.join('')}</svg>`;
      container.innerHTML = svgHtml + nodes.join('');
  }

  set hass(hass) {
    try {
      if (!this._config || !hass || !hass.states) return;
      
      if (!this._layoutBuilt) {
          this.updateLayout();
          this._layoutBuilt = true;
      }

      const getVal = (entityId) => {
          if (!entityId) return 0;
          const state = hass.states[entityId];
          return state ? parseFloat(state.state) || 0 : 0;
      };

      let solarW = getVal(this._config.solar_entity);
    let gridInW = getVal(this._config.grid_import_entity);
    let gridOutW = getVal(this._config.grid_export_entity);
    let battW = getVal(this._config.battery_power_entity); 
    if (this.getValStr('battery_invert')) battW = battW * -1; 
    let minerW = getVal(this._config.miner_entity);
    let heatW = getVal(this._config.heatpump_entity);
    let evW = getVal(this._config.ev_entity);
    let acW = getVal(this._config.ac_entity);
    let poolW = getVal(this._config.pool_entity);
    let washerW = getVal(this._config.washer_entity);

    let extraConsumers = minerW + heatW + evW + acW + poolW + washerW;
    let homeW = solarW + gridInW - gridOutW + battW - extraConsumers;
    if (homeW < 0) homeW = 0;
    
    let totalHomeW = homeW + extraConsumers; 

    // Battery Level (%)
    const battLevel = getVal(this._config.battery_level_entity);

    const upd = (id, val, textSuffix, colorOverride = null) => {
        const el = this.querySelector(`#val-${id}`);
        const n = this.querySelector(`#node-${id}`);
        if (el) el.innerText = Math.round(val) + textSuffix;
        if (n && colorOverride) {
            n.style.borderColor = colorOverride;
            n.style.color = colorOverride;
            const icon = n.querySelector('ha-icon');
            if (icon) icon.style.color = colorOverride;
        }
    };
    
    const cEx = this.getValStr('grid_export_color', '#00d1ff');
    const cGr = this.getValStr('grid_color', '#ff4a4a');

    upd('solar', solarW, ' W');
    if (gridOutW > 0) {
        upd('grid', -gridOutW, ' W', cEx);
    } else {
        upd('grid', gridInW, ' W', cGr);
    }
    
    // Custom label for Battery to include SOC
    const battEl = this.querySelector(`#val-batt`);
    if (battEl) {
        battEl.innerHTML = `<div>${Math.round(battW)} W</div><div style="font-size:0.6rem; opacity:0.7;">${Math.round(battLevel)}%</div>`;
    }

    upd('home', totalHomeW, ' W');
    upd('miner', minerW, ' W');
    upd('heatpump', heatW, ' W');
    upd('ev', evW, ' W');
    upd('ac', acW, ' W');
    upd('pool', poolW, ' W');
    upd('washer', washerW, ' W');

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
