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
      <style>
        .group { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; }
        h3 { margin: 0 0 15px 0; color: #00ffff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .row { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { display: block; font-size: 10px; margin-bottom: 4px; color: rgba(255,255,255,0.5); font-weight: bold; text-transform: uppercase; }
        select, input { background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box; }
        .item-box { background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; margin-bottom: 10px; }
      </style>
      <div class="card-config">
        <div class="group">
          <h3>UI & Animation</h3>
          <div class="row">
            <div class="row-col">
              <label>Typ</label>
              <select id="animation_type">
                <option value="dots" ${this.getVal('animation_type') === 'dots' ? 'selected' : ''}>Cyber Particles (Sharp)</option>
                <option value="comet" ${this.getVal('animation_type') === 'comet' ? 'selected' : ''}>Luxury Comet (Glow)</option>
                <option value="stream" ${this.getVal('animation_type') === 'stream' ? 'selected' : ''}>Data Stream (Dense)</option>
              </select>
            </div>
            <div class="row-col">
              <label>Speed (${this.getVal('animation_speed', '5')})</label>
              <input type="range" id="animation_speed" min="1" max="10" step="1" value="${this.getVal('animation_speed', '5')}">
            </div>
          </div>
        </div>
        <div class="group">
          <h3>Haupt-Sensoren</h3>
          <div class="item-box"><label>Solar (W)</label><div id="solar_entity_picker"></div></div>
          <div class="item-box"><label>Netz Import (W)</label><div id="grid_import_entity_picker"></div></div>
          <div class="item-box"><label>Netz Export (W)</label><div id="grid_export_entity_picker"></div></div>
          <div class="item-box"><label>Batterie (W)</label><div id="battery_power_entity_picker"></div></div>
          <div class="item-box"><label>Batterie (%)</label><div id="battery_level_entity_picker"></div></div>
        </div>
        <div class="group">
          <h3>Optionale Verbraucher</h3>
          <div class="item-box"><label>Miner</label><div id="miner_entity_picker"></div></div>
          <div class="item-box"><label>Heizung</label><div id="heatpump_entity_picker"></div></div>
          <div class="item-box"><label>E-Auto</label><div id="ev_entity_picker"></div></div>
          <div class="item-box"><label>Klima</label><div id="ac_entity_picker"></div></div>
        </div>
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

    ['solar_entity', 'grid_import_entity', 'grid_export_entity', 'battery_power_entity', 'battery_level_entity', 
     'miner_entity', 'heatpump_entity', 'ev_entity', 'ac_entity'].forEach(mount);
    
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
    this._layoutBuilt = false;
    this.setupDOM();
  }

  getVal(key, def="") { return this._config?.[key] !== undefined ? this._config[key] : def; }

  setupDOM() {
    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        :host { 
          --c-solar: #ff9900; --c-grid: #ff007f; --c-home: #00ffff; --c-batt: #00ff00;
        }
        
        ha-card {
           background: radial-gradient(circle at center, #0f172a, #06080f);
           border-radius: 28px; padding: 25px;
           position: relative; overflow: hidden !important; border: 1px solid rgba(255,255,255,0.05);
           color: #fff; font-family: 'Inter', sans-serif;
        }

        .header {
           font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: #00ffff; 
           text-align: center; font-weight: 900; margin-bottom: 25px; letter-spacing: 5px; 
           text-transform: uppercase; text-shadow: 0 0 10px rgba(0,255,255,0.3);
        }

        .main-container { 
           display: flex; flex-wrap: wrap; gap: 20px; 
           align-items: center; justify-content: center;
           position: relative; width: 100%; min-height: 520px;
        }

        .sidebar-stats {
          flex: 0 0 150px; display: flex; flex-direction: column; gap: 12px; z-index: 20;
        }

        .stat-box {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 10px; display: flex; flex-direction: column;
          align-items: center; backdrop-filter: blur(10px);
        }
        .stat-box ha-icon { --mdc-icon-size: 18px; color: #00ffff; opacity: 0.8; }
        .stat-label { font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: 800; color: #fff; }

        .flow-container { 
           flex: 1 1 450px; position: relative; height: 500px; min-width: 350px; overflow: hidden;
        }

        .svg-layer { 
          position: absolute; top:0; left:0; width:100%; height:100%; 
          pointer-events:none; z-index: 1;
        }

        .path-base { fill: none; stroke-width: 1.2; stroke: rgba(255,255,255,0.05); stroke-linecap: round; }
        .path-anim { fill: none; stroke-width: 2.5; stroke-linecap: round; filter: url(#glow); opacity: 0; }
        
        /* THE SHARP PARTICLES FLOW */
        .anim-dots { stroke-dasharray: 2 20; animation: flow linear infinite; opacity: 1 !important; }
        .anim-comet { stroke-dasharray: 60 180; animation: flow linear infinite; opacity: 1 !important; }
        .anim-stream { stroke-dasharray: 1 12; animation: flow linear infinite; opacity: 1 !important; }
        
        @keyframes flow { to { stroke-dashoffset: -300; } }

        .node {
           position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;
           transform: translate(-50%, -50%); z-index: 10; transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .node-box {
           width: 72px; height: 72px; border-radius: 20px; background: rgba(0,0,0,0.6);
           border: 2px solid currentColor; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 0 20px rgba(0,0,0,0.6); position: relative;
        }
        .node-box.active { box-shadow: 0 0 25px currentColor; }
        
        .node-icon { --mdc-icon-size: 26px; color: currentColor; }
        .node-value { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 800; margin-top: 6px; }
        .node-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.4; margin-top: 1px; }

        .home-center {
           width: 110px; height: 110px; border-radius: 30px; background: rgba(0,0,0,0.8);
           border: 3px solid #00ffff; box-shadow: 0 0 35px rgba(0,255,255,0.1);
        }
        .home-center .node-icon { --mdc-icon-size: 38px; }

        .footer {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 20px; font-family: 'Orbitron', sans-serif; font-size: 0.55rem; 
          color: rgba(255,255,255,0.2); letter-spacing: 3px;
        }
      </style>
      <ha-card>
        <div class="header">ENERGY FLOW :: OPENKAIRO OS</div>
        <div class="main-container">
          <div class="sidebar-stats" id="sidebar">
            <div class="stat-box"><ha-icon icon="mdi:calendar-today"></ha-icon><span class="stat-label">Heute</span><span class="stat-value" id="stat-today">-- kWh</span></div>
            <div class="stat-box"><ha-icon icon="mdi:calendar-week"></ha-icon><span class="stat-label">Woche</span><span class="stat-value" id="stat-week">-- kWh</span></div>
            <div class="stat-box"><ha-icon icon="mdi:weather-sunny"></ha-icon><span class="stat-label">Wetter</span><span class="stat-value" id="stat-weather">--</span></div>
          </div>
          
          <div class="flow-container" id="flow-container">
            <svg class="svg-layer">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g id="paths"></g>
            </svg>
            <div id="nodes"></div>
          </div>
        </div>
        <div class="footer">POWERED BY <span style="color:#00ffff; font-weight:800;">OPENKAIRO</span></div>
      </ha-card>
    `;
    this.content = true;
  }

  drawNode(id, icon, label, color, x, y, isHome = false) {
    return `
      <div class="node" style="left:${x}%; top:${y}%; color:${color};">
        <div class="node-box ${isHome ? 'home-center' : ''}" id="node-${id}">
          <ha-icon class="node-icon" icon="${icon}"></ha-icon>
        </div>
        <div class="node-value" id="val-${id}">0W</div>
        <div class="node-label">${label}</div>
      </div>`;
  }

  drawPath(id, color, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cy1 = y1 + dy*0.5;
    const curve = (Math.abs(dy) < 5) ? 5 : 0;
    const d = `M ${x1} ${y1} C ${x1 + dx*0.3} ${cy1+curve}, ${x2 - dx*0.3} ${cy1+curve}, ${x2} ${y2}`;
    return `
      <path class="path-base" d="${d}"></path>
      <path id="path-${id}" class="path-anim" d="${d}" stroke="${color}"></path>
    `;
  }

  updateLayout() {
    const pBox = this.querySelector('#paths');
    const nBox = this.querySelector('#nodes');
    if (!pBox || !nBox) return;

    const paths = [], nodes = [];
    const cX = 50, cY = 40;

    nodes.push(this.drawNode('home', 'mdi:home', 'HAUS', '#00ffff', cX, cY, true));
    
    if (this.getVal('solar_entity')) {
      nodes.push(this.drawNode('solar', 'mdi:solar-power', 'SOLAR', '#ff9900', cX, 12));
      paths.push(this.drawPath('solar-home', '#ff9900', cX, 12, cX, cY));
    }
    if (this.getVal('grid_import_entity') || this.getVal('grid_export_entity')) {
      nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'NETZ', '#ff007f', 15, cY));
      paths.push(this.drawPath('grid-home', '#ff007f', 15, cY, cX, cY));
    }
    if (this.getVal('battery_power_entity')) {
      nodes.push(this.drawNode('batt', 'mdi:battery-high', 'AKKU', '#00ff00', 85, cY));
      paths.push(this.drawPath('batt-home', '#00ff00', 85, cY, cX, cY));
    }

    const consumers = [
      { key: 'miner_entity', label: 'MINER', icon: 'mdi:bitcoin', color: '#a855f7', x: 22, y: 72 },
      { key: 'heatpump_entity', label: 'HEIZUNG', icon: 'mdi:heat-pump', color: '#3b82f6', x: 40, y: 84 },
      { key: 'ev_entity', label: 'AUTO', icon: 'mdi:car-electric', color: '#eab308', x: 60, y: 84 },
      { key: 'ac_entity', label: 'KLIMA', icon: 'mdi:air-conditioner', color: '#00d1ff', x: 78, y: 72 }
    ];

    consumers.forEach(c => {
      if (this.getVal(c.key)) {
        nodes.push(this.drawNode(c.key, c.icon, c.label, c.color, c.x, c.y));
        paths.push(this.drawPath(`home-${c.key}`, c.color, cX, cY, c.x, c.y));
      }
    });

    pBox.innerHTML = paths.join('');
    nBox.innerHTML = nodes.join('');
  }

  set hass(hass) {
    if (!this._config || !hass || !hass.states) return;
    if (!this._layoutBuilt) { this.updateLayout(); this._layoutBuilt = true; }

    const getP = (id, isKw=false) => {
      const s = hass.states[id];
      let v = s ? parseFloat(s.state) || 0 : 0;
      return isKw ? v * 1000 : v;
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
      const duration = (8000 / Math.max(50, Math.abs(val))) * (10/speed);
      p.style.animationDuration = Math.min(12, Math.max(0.4, duration)) + 's';
      p.style.animationDirection = rev ? 'reverse' : 'normal';
      p.setAttribute('class', `path-anim anim-${this.getVal('animation_type', 'dots')}`);
    };

    const upd = (id, v) => {
      const el = this.querySelector(`#val-${id}`);
      const box = this.querySelector(`#node-${id}`);
      if (el) el.innerText = format(v);
      if (box) {
        if (Math.abs(v) > 20) box.classList.add('active');
        else box.classList.remove('active');
      }
    };

    upd('solar', solarW); upd('grid', netzW); upd('batt', battW);
    upd('home', solarW + gridInW - gridOutW + battW);

    anim('solar-home', solarW);
    anim('grid-home', netzW, netzW < 0);
    anim('batt-home', battW, battW < 0);

    ['miner_entity', 'heatpump_entity', 'ev_entity', 'ac_entity'].forEach(key => {
        if (this._config[key]) {
            const val = getP(this._config[key]);
            const id = key.replace('_entity', '');
            upd(id, val);
            anim(`home-${id}`, val);
        }
    });

    const sToday = this.querySelector('#stat-today');
    if (sToday) sToday.innerText = getP(this._config.solar_yield_today_entity).toFixed(1) + ' kWh';
    const sWeek = this.querySelector('#stat-week');
    if (sWeek) sWeek.innerText = getP(this._config.solar_yield_week_entity).toFixed(1) + ' kWh';
    const sWeather = this.querySelector('#stat-weather');
    if (sWeather && this._config.weather_entity) sWeather.innerText = hass.states[this._config.weather_entity]?.state || '--';
  }
}

customElements.define("openkairo-solar-card", OpenKairoSolarCard);
