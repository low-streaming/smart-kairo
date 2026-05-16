class OpenKairoSolarCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._config.animation_type) this._config.animation_type = 'dots';
    if (!this._config.animation_speed) this._config.animation_speed = '5';
    if (this._hass && !this._initialized) this.renderForm();
  }

  configChanged() {
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: this._config };
    this.dispatchEvent(event);
  }

  getVal(key, def = "") { return this._config?.[key] !== undefined ? this._config[key] : def; }

  updateConfig(key, value) {
    this._config = Object.assign({}, this._config);
    this._config[key] = value;
    this.configChanged();
  }

  renderForm() {
    this._initialized = true;
    this.innerHTML = `
      <div style="padding: 10px; color: #fff;">
        <h3 style="color: #10b981;">Flow Einstellungen</h3>
        <label>Animation Typ</label>
        <select id="animation_type" style="width:100%; padding:8px; background:#111; color:white; border:1px solid #333; border-radius:5px;">
          <option value="dots" ${this.getVal('animation_type') === 'dots' ? 'selected' : ''}>Cyber Particles (Sharp)</option>
          <option value="comet" ${this.getVal('animation_type') === 'comet' ? 'selected' : ''}>Luxury Comet</option>
          <option value="dash" ${this.getVal('animation_type') === 'dash' ? 'selected' : ''}>Digital Stream</option>
        </select>
        <br><br>
        <label>Geschwindigkeit (1-10)</label>
        <input type="range" id="animation_speed" min="1" max="10" step="1" value="${this.getVal('animation_speed', '5')}" style="width:100%;">
        <br><br>
        <h3 style="color: #10b981;">Sensoren</h3>
        <div id="solar_entity_picker"></div><br>
        <div id="grid_import_entity_picker"></div><br>
        <div id="grid_export_entity_picker"></div><br>
        <div id="battery_power_entity_picker"></div><br>
        <div id="battery_level_entity_picker"></div>
      </div>
    `;

    const mount = (key) => {
        const container = this.querySelector(`#${key}_picker`);
        if (!container) return;
        const sel = document.createElement('ha-selector');
        sel.hass = this._hass; sel.selector = { entity: {} }; sel.value = this.getVal(key);
        sel.addEventListener('value-changed', (ev) => { this.updateConfig(key, ev.detail.value); });
        container.appendChild(sel);
    };

    ['solar_entity', 'grid_import_entity', 'grid_export_entity', 'battery_power_entity', 'battery_level_entity'].forEach(mount);
    this.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', () => this.updateConfig(el.id, el.value));
    });
  }

  set hass(hass) { this._hass = hass; if (this._config && !this._initialized) this.renderForm(); }
}

customElements.define("openkairo-solar-editor", OpenKairoSolarCardEditor);

class OpenKairoSolarCard extends HTMLElement {
  static getConfigElement() { return document.createElement("openkairo-solar-editor"); }

  setConfig(config) {
    this._config = Object.assign({}, config);
    this.setupDOM();
  }

  getVal(key, def="") { return this._config?.[key] !== undefined ? this._config[key] : def; }

  setupDOM() {
    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;700&display=swap');
        
        ha-card {
           background: rgba(10, 20, 28, 0.45); border-radius: 28px; padding: 25px;
           backdrop-filter: blur(15px) saturate(180%); position: relative;
           border: 1px solid rgba(255,255,255,0.1); color: #fff; font-family: 'Inter', sans-serif;
        }

        .header { 
           font-family: 'Orbitron', sans-serif; font-size: 1rem; color: #10b981; 
           text-align: center; font-weight: 900; margin-bottom: 25px; letter-spacing: 5px; 
           text-shadow: 0 0 10px rgba(16, 185, 129, 0.3); text-transform: uppercase;
        }
        
        .main-container { display: flex; gap: 20px; align-items: stretch; position: relative; }

        .sidebar { flex: 0 0 150px; display: flex; flex-direction: column; gap: 12px; }

        .stat-box {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 12px; display: flex; flex-direction: column; align-items: center;
        }
        .stat-box ha-icon { --mdc-icon-size: 20px; color: #10b981; margin-bottom: 4px; }
        .stat-label { font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,0.4); }
        .stat-value { font-size: 0.75rem; font-weight: 800; color: #fff; }

        .flow-container { flex: 1; position: relative; height: 500px; overflow: hidden; }

        .svg-layer { position: absolute; inset: 0; pointer-events:none; z-index: 1; }

        .path-base { fill: none; stroke-width: 1.5; stroke: rgba(255,255,255,0.05); stroke-linecap: round; }
        .path-anim { fill: none; stroke-width: 3; stroke-linecap: round; filter: url(#neon-glow); }
        
        /* SHARP NEON FLOW */
        .anim-dots { stroke-dasharray: 2 24; animation: flowMove linear infinite; }
        .anim-comet { stroke-dasharray: 50 180; animation: flowMove linear infinite; }
        .anim-dash { stroke-dasharray: 15 30; animation: flowMove linear infinite; }
        
        @keyframes flowMove { to { stroke-dashoffset: -300; } }

        .node {
           position: absolute; display: flex; flex-direction: column; align-items: center;
           transform: translate(-50%, -50%); z-index: 10; transition: 0.5s;
        }
        
        .node-circle {
           width: 75px; height: 75px; border-radius: 50%; background: #000;
           border: 2px solid currentColor; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 0 15px rgba(0,0,0,0.5);
        }
        
        .node-icon { --mdc-icon-size: 28px; color: currentColor; }
        .node-val { font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: 800; margin-top: 8px; }
        .node-lab { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.5; }

        .center-node { width: 95px; height: 95px; border: 3px solid #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.2); }

        .footer {
          text-align: center; font-family: 'Orbitron', sans-serif; font-size: 9px; 
          color: rgba(255,255,255,0.2); letter-spacing: 4px; margin-top: 20px;
        }
      </style>
      <ha-card>
        <div class="header">ENERGY OS :: CLASSIC FLOW</div>
        <div class="main-container">
          <div class="sidebar">
            <div class="stat-box"><ha-icon icon="mdi:calendar-today"></ha-icon><span class="stat-label">Heute</span><span class="stat-value" id="s-today">-- kWh</span></div>
            <div class="stat-box"><ha-icon icon="mdi:calendar-week"></ha-icon><span class="stat-label">Woche</span><span class="stat-value" id="s-week">-- kWh</span></div>
            <div class="stat-box"><ha-icon icon="mdi:calendar-month"></ha-icon><span class="stat-label">Monat</span><span class="stat-value" id="s-month">-- kWh</span></div>
          </div>
          
          <div class="flow-container" id="flow-container">
            <svg class="svg-layer">
              <defs>
                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g id="path-layer"></g>
            </svg>
            <div id="node-layer"></div>
          </div>
        </div>
        <div class="footer">POWERED BY OPENKAIRO</div>
      </ha-card>
    `;
    this._initialized = true;
  }

  drawNode(id, icon, label, color, x, y, isCenter = false) {
    return `
      <div class="node" style="left:${x}%; top:${y}%; color:${color};">
        <div class="node-circle ${isCenter ? 'center-node' : ''}" id="node-${id}">
          <ha-icon class="node-icon" icon="${icon}"></ha-icon>
        </div>
        <div class="node-val" id="val-${id}">0W</div>
        <div class="node-lab">${label}</div>
      </div>`;
  }

  drawPath(id, color, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const cy = y1 + dy*0.5;
    const d = `M ${x1} ${y1} C ${x1 + dx*0.3} ${cy}, ${x2 - dx*0.3} ${cy}, ${x2} ${y2}`;
    return `
      <path class="path-base" d="${d}"></path>
      <path id="path-${id}" class="path-anim" d="${d}" stroke="${color}"></path>
    `;
  }

  updateLayout() {
    const pLayer = this.querySelector('#path-layer');
    const nLayer = this.querySelector('#node-layer');
    if (!pLayer || !nLayer) return;

    const paths = [], nodes = [];
    const cX = 50, cY = 40;

    nodes.push(this.drawNode('home', 'mdi:home', 'SYSTEM', '#10b981', cX, cY, true));
    
    if (this.getVal('solar_entity')) {
      nodes.push(this.drawNode('solar', 'mdi:solar-power', 'SOLAR', '#ff9900', cX, 12));
      paths.push(this.drawPath('solar-home', '#ff9900', cX, 12, cX, cY));
    }
    if (this.getVal('grid_import_entity') || this.getVal('grid_export_entity')) {
      nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'NETZ', '#ff007f', 12, cY));
      paths.push(this.drawPath('grid-home', '#ff007f', 12, cY, cX, cY));
    }
    if (this.getVal('battery_power_entity')) {
      nodes.push(this.drawNode('batt', 'mdi:battery-high', 'AKKU', '#00ff00', 88, cY));
      paths.push(this.drawPath('batt-home', '#00ff00', 88, cY, cX, cY));
    }

    // Classic Consumers
    const consumers = [
      { key: 'miner_entity', label: 'MINER', icon: 'mdi:bitcoin', color: '#a855f7', x: 22, y: 78 },
      { key: 'heatpump_entity', label: 'HEIZUNG', icon: 'mdi:heat-pump', color: '#3b82f6', x: 40, y: 88 },
      { key: 'ev_entity', label: 'AUTO', icon: 'mdi:car-electric', color: '#eab308', x: 60, y: 88 },
      { key: 'ac_entity', label: 'KLIMA', icon: 'mdi:air-conditioner', color: '#00d1ff', x: 78, y: 78 }
    ];

    consumers.forEach(c => {
      if (this.getVal(c.key)) {
        nodes.push(this.drawNode(c.key, c.icon, c.label, c.color, c.x, c.y));
        paths.push(this.drawPath(`home-${c.key}`, c.color, cX, cY, c.x, c.y));
      }
    });

    pLayer.innerHTML = paths.join('');
    nLayer.innerHTML = nodes.join('');
  }

  set hass(hass) {
    if (!this._config || !hass || !hass.states) return;
    if (!this._layoutBuilt) { this.updateLayout(); this._layoutBuilt = true; }

    const getP = (id) => {
      const s = hass.states[id];
      return s ? parseFloat(s.state) || 0 : 0;
    };
    const format = (v) => Math.abs(v) >= 1000 ? (v/1000).toFixed(1) + 'kW' : Math.round(v) + 'W';

    const solarW = getP(this._config.solar_entity);
    const gridInW = getP(this._config.grid_import_entity);
    const gridOutW = getP(this._config.grid_export_entity);
    const battW = getP(this._config.battery_power_entity);
    const netzW = gridInW - gridOutW;

    const anim = (id, val, rev=false) => {
      const p = this.querySelector(`#path-${id}`);
      if (!p) return;
      if (Math.abs(val) < 5) { p.style.opacity = '0'; return; }
      p.style.opacity = '1';
      const speed = parseFloat(this.getVal('animation_speed', '5'));
      const duration = (9000 / Math.max(50, Math.abs(val))) * (10/speed);
      p.style.animationDuration = Math.min(15, Math.max(0.4, duration)) + 's';
      p.style.animationDirection = rev ? 'reverse' : 'normal';
      p.setAttribute('class', `path-anim anim-${this.getVal('animation_type', 'dots')}`);
    };

    const updN = (id, v) => {
      const el = this.querySelector(`#val-${id}`);
      if (el) el.innerText = format(v);
    };

    updN('solar', solarW); updN('grid', netzW); updN('batt', battW);
    updN('home', solarW + gridInW - gridOutW + battW);

    anim('solar-home', solarW);
    anim('grid-home', netzW, netzW < 0);
    anim('batt-home', battW, battW < 0);

    ['miner', 'heatpump', 'ev', 'ac'].forEach(id => {
        if (this._config[id + '_entity']) {
            const v = getP(this._config[id + '_entity']);
            updN(id, v); anim(`home-${id}`, v);
        }
    });

    const sT = this.querySelector('#s-today');
    if (sT) sT.innerText = getP(this._config.solar_yield_today_entity).toFixed(1) + ' kWh';
    const sW = this.querySelector('#s-week');
    if (sW) sW.innerText = getP(this._config.solar_yield_week_entity).toFixed(1) + ' kWh';
    const sM = this.querySelector('#s-month');
    if (sM) sM.innerText = getP(this._config.solar_yield_month_entity).toFixed(1) + ' kWh';
  }
}

customElements.define("openkairo-solar-card", OpenKairoSolarCard);
