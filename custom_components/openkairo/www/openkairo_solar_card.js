class OpenKairoSolarCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._config.animation_type) this._config.animation_type = 'comet';
    if (!this._config.animation_speed) this._config.animation_speed = '5';
    
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
        h3 { margin-top: 0; margin-bottom: 15px; color: #10b981; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; font-family: sans-serif; font-size: 14px; }
        .row { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { display: block; font-size: 11px; margin-bottom: 4px; color: var(--secondary-text-color); font-weight: bold; text-transform: uppercase; }
        select, input[type="text"], input[type="number"] { background: rgba(0,0,0,0.2); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box; }
        
        .item-box { background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .item-header label { margin: 0; color: #05f0a0; font-size: 10px; letter-spacing: 1px;}
        .clear-btn { --mdc-icon-size: 16px; color: rgba(255,255,255,0.3); cursor: pointer; transition: 0.2s; }
        .clear-btn:hover { color: #f43f5e; }
        .item-selector { margin-bottom: 10px; }
        .item-options { display: flex; gap: 20px; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; flex-wrap: wrap; }
        .opt { display: flex; align-items: center; gap: 8px; }
        .opt label { margin: 0; font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        
        input[type="color"] { 
            -webkit-appearance: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; 
            width: 26px; height: 26px; padding: 0; cursor: pointer; overflow: hidden; background: none;
        }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 50%; }
        input[type="checkbox"] { cursor: pointer; width: 16px; height: 16px; }
      </style>
      <div class="card-config">
        <div class="group">
          <h3>Haupteinstellungen & Aussehen</h3>
          <div class="row">
            <div class="row-col">
              <label>Animations-Typ</label>
              <select id="animation_type">
                <option value="dots" ${this.getVal('animation_type') === 'dots' ? 'selected' : ''}>Klassische Punkte (Dots)</option>
                <option value="dash" ${this.getVal('animation_type') === 'dash' ? 'selected' : ''}>Dynamische Striche (Dash)</option>
                <option value="neon" ${this.getVal('animation_type') === 'neon' ? 'selected' : ''}>Neon Puls (Neon)</option>
                <option value="comet" ${this.getVal('animation_type', 'comet') === 'comet' ? 'selected' : ''}>Energie Komet (Elite)</option>
                <option value="stream" ${this.getVal('animation_type') === 'stream' ? 'selected' : ''}>Partikel Strom (Fast)</option>
                <option value="pulse" ${this.getVal('animation_type') === 'pulse' ? 'selected' : ''}>Atmosphärischer Puls (Slow)</option>
              </select>
            </div>
            <div class="row-col">
              <label>Geschwindigkeit (${this.getVal('animation_speed', '5')})</label>
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:9px; color:rgba(255,255,255,0.4);">Langsam</span>
                <input type="range" id="animation_speed" min="1" max="10" step="1" value="${this.getVal('animation_speed', '5')}">
                <span style="font-size:9px; color:rgba(255,255,255,0.4);">Schnell</span>
              </div>
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Energiequellen</h3>
          <div class="item-box">
            <div class="item-header"><label>Solarproduktion (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="solar_entity"></ha-icon></div>
            <div id="solar_entity_picker"></div>
          </div>
          <div class="item-box">
            <div class="item-header"><label>Netzbezug (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="grid_import_entity"></ha-icon></div>
            <div id="grid_import_entity_picker"></div>
          </div>
          <div class="item-box">
            <div class="item-header"><label>Netzeinspeisung (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="grid_export_entity"></ha-icon></div>
            <div id="grid_export_entity_picker"></div>
          </div>
          <div class="item-box">
            <div class="item-header"><label>Batterieleistung (W)</label><ha-icon icon="mdi:close" title="Löschen" class="clear-btn" data-id="battery_power_entity"></ha-icon></div>
            <div id="battery_power_entity_picker"></div>
          </div>
        </div>
      </div>
    `;

    const mountSelector = (key) => {
        const container = this.querySelector(`#${key}_picker`);
        if (!container) return;
        const sel = document.createElement('ha-selector');
        sel.hass = this._hass;
        sel.selector = { entity: {} };
        sel.value = this.getVal(key);
        sel.addEventListener('value-changed', (ev) => { this.updateConfig(key, ev.detail.value); });
        container.innerHTML = "";
        container.appendChild(sel);
    };

    ['solar_entity', 'grid_import_entity', 'grid_export_entity', 'battery_power_entity'].forEach(k => mountSelector(k));

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

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = Object.assign({}, config);
    this._layoutBuilt = false;
    this.setupDOM();
  }

  getValStr(key, def="") { return this._config && this._config[key] !== undefined ? this._config[key] : def; }

  setupDOM() {
    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600&display=swap');
        
        :host { --primary: #10b981; --warning: #f59e0b; --danger: #ef4444; }
        
        ha-card {
           background: radial-gradient(circle at center, rgba(16, 24, 48, 0.95), #06080f);
           border-radius: 28px; padding: 25px;
           backdrop-filter: blur(20px) saturate(180%);
           position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.8);
           overflow: hidden !important; border: 1px solid rgba(255,255,255,0.08);
           color: #fff; font-family: 'Inter', sans-serif;
        }

        .header {
           font-family: 'Orbitron', sans-serif; font-size: 0.8rem; color: var(--primary); 
           text-align: center; font-weight: 900; margin-bottom: 25px; letter-spacing: 5px; 
           text-shadow: 0 0 15px rgba(16, 185, 129, 0.3); text-transform: uppercase;
        }

        .main-container { 
           display: flex; flex-wrap: wrap; gap: 24px; 
           align-items: center; justify-content: center;
           position: relative; width: 100%; min-height: 520px;
        }

        .flow-container { 
           flex: 1 1 500px; position: relative; height: 520px;
           min-width: 400px; overflow: hidden;
        }

        .svg-layer { 
          position: absolute; top:0; left:0; width:100%; height:100%; 
          pointer-events:none; z-index: 1; display: block;
        }

        .svg-path-wire { fill: none; stroke-width: 1.2; stroke-linecap: round; opacity: 0.12; }
        .svg-path-aura { fill: none; stroke-width: 5; stroke-linecap: round; opacity: 0.04; filter: blur(4px); }
        .svg-path { fill: none; stroke-width: 2.5; stroke-linecap: round; opacity: 0; filter: url(#bloom-filter); }
        
        .anim-comet { stroke-dasharray: 2 120; animation: cometFlow linear infinite; stroke-width: 3.2; }
        .anim-stream { stroke-dasharray: 1 30; animation: dashFlow linear infinite; stroke-width: 2.6; }
        .anim-pulse { stroke-dasharray: 100 100; animation: pulseFlow 5s ease-in-out infinite; stroke-width: 4; }
        .anim-dots { stroke-dasharray: 2 15; animation: dashFlow linear infinite; }
        .anim-dash { stroke-dasharray: 15 25; animation: dashFlow linear infinite; }
        .anim-neon { stroke-dasharray: 20 150; animation: dashFlow 2s linear infinite; filter: url(#neon-glow); stroke-width: 3.5; }
        
        @keyframes dashFlow { to { stroke-dashoffset: -300; } }
        @keyframes cometFlow { 
          0% { stroke-dashoffset: 600; opacity: 0; }
          15%, 85% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes pulseFlow {
          0%, 100% { stroke-dashoffset: 400; opacity: 0.2; stroke-width: 2.5; }
          50% { opacity: 0.8; stroke-width: 5; stroke-dashoffset: 200; }
        }

        .node {
           position: absolute; width: 82px; height: 82px; border-radius: 50%;
           background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), rgba(0,0,0,0.85)); 
           border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column;
           justify-content: center; align-items: center; transform: translate(-50%, -50%); z-index: 10;
           box-shadow: 0 10px 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(255,255,255,0.02);
           backdrop-filter: blur(20px) saturate(180%);
           transition: 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .node.active { border: 1.5px solid currentColor; box-shadow: 0 0 25px currentColor; }
        .node-icon { --mdc-icon-size: 28px; margin-bottom: 4px; color: currentColor; opacity: 0.9; filter: drop-shadow(0 0 5px currentColor);}
        .node-value { font-family: 'Orbitron', sans-serif; font-size: 0.82rem; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);}
        .node-label { font-size: 0.58rem; text-transform: uppercase; color: rgba(255,255,255,0.5); letter-spacing: 1.2px; font-weight: 300; margin-top:1px;}

        .footer {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 15px; font-family: 'Orbitron', sans-serif; font-size: 0.5rem; 
          color: rgba(255,255,255,0.25); letter-spacing: 3px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 15px;
        }
        .footer ha-icon { --mdc-icon-size: 14px; color: #10b981; opacity: 0.5; }
      </style>
      <ha-card>
        <div class="header">Energy OS</div>
        <div class="main-container">
          <div class="flow-container" id="flow-container">
            <div class="svg-layer">
                <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <filter id="bloom-filter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.2" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                      </filter>
                      <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <g id="paths-container"></g>
                </svg>
            </div>
            <div id="nodes-container"></div>
          </div>
        </div>
        <div class="footer">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon> POWERED BY <span style="color:#10b981; font-weight:800; margin-left:3px;">OPENKAIRO OS</span>
        </div>
      </ha-card>
    `;
    this.content = true;
  }

  drawNode(id, icon, label, color, x, y) {
      return `<div class="node ${id}" id="node-${id}" style="left: ${x}%; top: ${y}%; border-color: ${color}; color: ${color};">
         <ha-icon class="node-icon" icon="${icon}"></ha-icon>
         <div class="node-value" id="val-${id}">0 W</div>
         <div class="node-label">${label}</div>
      </div>`;
  }

  drawPath(id, color, x1, y1, x2, y2) {
      const dy = y2 - y1;
      const dx = x2 - x1;
      const cy1 = y1 + (dy * 0.5);
      const cy2 = y1 + (dy * 0.5);
      const curveOffset = (Math.abs(dy) < 2) ? 4 : 0;
      const d = `M ${x1} ${y1} C ${x1 + (dx*0.2)} ${cy1 + curveOffset}, ${x2 - (dx*0.2)} ${cy2 + curveOffset}, ${x2} ${y2}`;
      return `
        <path id="wire-${id}" class="svg-path-wire" d="${d}" stroke="${color}"></path>
        <path id="aura-${id}" class="svg-path-aura" d="${d}" stroke="${color}"></path>
        <path id="path-${id}" class="svg-path" d="${d}" stroke="${color}"></path>
      `;
  }

  updateLayout() {
      const pContainer = this.querySelector('#paths-container');
      const nContainer = this.querySelector('#nodes-container');
      if (!pContainer || !nContainer) return;

      const cSolar = this.getValStr('solar_color', '#ffb800');
      const cGrid = this.getValStr('grid_color', '#ff4a4a');
      const cHome = this.getValStr('home_color', '#10b981');
      const cBatt = this.getValStr('battery_color', '#05f0a0');

      const nodes = [];
      const paths = [];
      const centerX = 50;
      const centerY = 45;

      nodes.push(this.drawNode('home', 'mdi:home', 'Haus', cHome, centerX, centerY));
      
      if (this.getValStr('solar_entity')) {
          nodes.push(this.drawNode('solar', 'mdi:white-balance-sunny', 'Solar', cSolar, centerX, 15));
          paths.push(this.drawPath('solar-home', cSolar, centerX, 15, centerX, centerY));
      }
      if (this.getValStr('grid_import_entity') || this.getValStr('grid_export_entity')) {
          nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'Netz', cGrid, 18, centerY));
          paths.push(this.drawPath('grid-home', cGrid, 18, centerY, centerX, centerY));
      }
      if (this.getValStr('battery_power_entity')) {
          nodes.push(this.drawNode('batt', 'mdi:battery-high', 'Akku', cBatt, 82, centerY));
          paths.push(this.drawPath('batt-home', cBatt, 82, centerY, centerX, centerY));
      }

      // Consumer Arc
      const consumers = [
        { key: 'pool_entity', name: 'pool_name', defName: 'Pool', icon: 'pool_icon', defIcon: 'mdi:pool', color: 'pool_color', defColor: '#00d1ff', x: 20, y: 72 },
        { key: 'miner_entity', name: 'miner_name', defName: 'Miner', icon: 'miner_icon', defIcon: 'mdi:bitcoin', color: 'miner_color', defColor: '#a855f7', x: 35, y: 82 },
        { key: 'heatpump_entity', name: 'heatpump_name', defName: 'Heizung', icon: 'heatpump_icon', defIcon: 'mdi:heat-pump', color: 'heatpump_color', defColor: '#3b82f6', x: 50, y: 86 },
        { key: 'ev_entity', name: 'ev_name', defName: 'Auto', icon: 'ev_icon', defIcon: 'mdi:car-electric', color: 'ev_color', defColor: '#eab308', x: 65, y: 82 },
        { key: 'ac_entity', name: 'ac_name', defName: 'Klima', icon: 'ac_icon', defIcon: 'mdi:air-conditioner', color: 'ac_color', defColor: '#3b82f6', x: 80, y: 72 }
      ];

      consumers.forEach(c => {
        if (this.getValStr(c.key)) {
            const color = this.getValStr(c.color, c.defColor);
            nodes.push(this.drawNode(c.key, this.getValStr(c.icon, c.defIcon), this.getValStr(c.name, c.defName), color, c.x, c.y));
            paths.push(this.drawPath(`home-${c.key}`, color, centerX, centerY, c.x, c.y));
        }
      });

      pContainer.innerHTML = paths.join('');
      nContainer.innerHTML = nodes.join('');
  }

  set hass(hass) {
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

    const animType = this.getValStr('animation_type', 'comet');
    const animSpeed = parseFloat(this.getValStr('animation_speed', '5'));
    const speedMult = 10 / Math.max(1, animSpeed);

    const animatePath = (pathId, flowW, reverse = false, colorOverride = null) => {
        const p = this.querySelector(`#path-${pathId}`);
        const wire = this.querySelector(`#wire-${pathId}`);
        const aura = this.querySelector(`#aura-${pathId}`);
        if (!p) return;

        if (Math.abs(flowW) < 5) {
            p.style.opacity = '0';
            p.style.animation = 'none';
            if (wire) wire.style.opacity = '0.06';
            if (aura) aura.style.opacity = '0';
        } else {
            p.style.opacity = '1';
            p.setAttribute('class', `svg-path anim-${animType}`);
            if (wire) wire.style.opacity = '0.2';
            if (aura) aura.style.opacity = '0.08';
            if (colorOverride) {
                p.setAttribute('stroke', colorOverride);
                if (wire) wire.setAttribute('stroke', colorOverride);
                if (aura) aura.setAttribute('stroke', colorOverride);
            }

            let duration = (8000 / Math.max(40, Math.abs(flowW))) * speedMult;
            p.style.animationDuration = Math.min(15, Math.max(0.4, duration)) + 's';
            p.style.animationDirection = reverse ? 'reverse' : 'normal';
        }
    };

    const updNode = (id, val, color = null) => {
        const el = this.querySelector(`#val-${id}`);
        const n = this.querySelector(`#node-${id}`);
        if (el) el.innerText = formatPower(val);
        if (n) {
            if (Math.abs(val) > 20) n.classList.add('active');
            else n.classList.remove('active');
            if (color) { n.style.color = color; n.style.borderColor = color; }
        }
    };

    let solarW = getPower(this._config.solar_entity, this._config.solar_entity_kw);
    let gridInW = getPower(this._config.grid_import_entity, this._config.grid_import_entity_kw);
    let gridOutW = getPower(this._config.grid_export_entity, this._config.grid_export_entity_kw);
    let battW = getPower(this._config.battery_power_entity, this._config.battery_power_entity_kw);

    updNode('solar', solarW);
    updNode('grid', gridInW || -gridOutW);
    updNode('batt', battW);

    animatePath('solar-home', solarW);
    animatePath('grid-home', gridInW || -gridOutW, gridInW < gridOutW);
    animatePath('batt-home', battW, battW < 0);

    // Consumers
    ['pool_entity', 'miner_entity', 'heatpump_entity', 'ev_entity', 'ac_entity', 'washer_entity'].forEach(key => {
        if (this._config[key]) {
            const val = getPower(this._config[key], this._config[`${key}_kw`]);
            updNode(key, val);
            animatePath(`home-${key}`, val);
        }
    });

    let houseW = solarW + gridInW - gridOutW + battW;
    updNode('home', houseW);
  }
}

if (!customElements.get("openkairo-solar-card")) {
  customElements.define("openkairo-solar-card", OpenKairoSolarCard);
}
