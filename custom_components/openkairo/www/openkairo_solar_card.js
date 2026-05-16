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
          <h3>Design & Flow</h3>
          <div class="row">
            <div class="row-col">
              <label>Flow Typ</label>
              <select id="animation_type">
                <option value="dots" ${this.getVal('animation_type') === 'dots' ? 'selected' : ''}>Cyber Beads (Sharp)</option>
                <option value="comet" ${this.getVal('animation_type') === 'comet' ? 'selected' : ''}>Luxury Flow (Soft)</option>
              </select>
            </div>
            <div class="row-col">
              <label>Speed (1-10)</label>
              <input type="range" id="animation_speed" min="1" max="10" step="1" value="${this.getVal('animation_speed', '5')}">
            </div>
          </div>
        </div>
        <div class="group">
          <h3>Sensoren</h3>
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
           background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
           border-radius: 24px; padding: 25px; min-height: 540px;
           position: relative; overflow: hidden !important; border: 1px solid rgba(255,255,255,0.08);
           color: #fff; font-family: 'Inter', sans-serif;
           box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4);
        }

        .header-title {
           font-family: 'Orbitron', sans-serif; font-size: 0.8rem; color: #00ffff; 
           text-align: center; font-weight: 900; margin-bottom: 20px; letter-spacing: 5px; 
           text-transform: uppercase; opacity: 0.8;
        }

        .main-layout { display: flex; gap: 20px; align-items: stretch; }

        .sidebar { flex: 0 0 140px; display: flex; flex-direction: column; gap: 12px; }

        .gauge-match-card {
          background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; padding: 12px; display: flex; flex-direction: column;
          align-items: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .gauge-match-card ha-icon { --mdc-icon-size: 18px; color: #00ffff; margin-bottom: 4px; }
        .stat-lab { font-size: 8px; text-transform: uppercase; color: rgba(255,255,255,0.4); }
        .stat-val { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; font-weight: 800; }

        .flow-area { flex: 1; position: relative; height: 480px; overflow: hidden; }

        .svg-canvas { position: absolute; inset: 0; pointer-events:none; z-index: 1; }

        .path-wire { fill: none; stroke-width: 1.2; stroke: rgba(255,255,255,0.04); stroke-linecap: round; }
        .path-glow { fill: none; stroke-width: 2.2; stroke-linecap: round; filter: url(#neon-glow); opacity: 0; }
        
        .anim-dots { stroke-dasharray: 2 28; animation: flowMove linear infinite; opacity: 1 !important; }
        .anim-comet { stroke-dasharray: 60 200; animation: flowMove linear infinite; opacity: 1 !important; }
        
        @keyframes flowMove { to { stroke-dashoffset: -300; } }

        .node {
           position: absolute; display: flex; flex-direction: column; align-items: center;
           transform: translate(-50%, -50%); z-index: 10; transition: 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        
        .node-inner {
           width: 68px; height: 68px; border-radius: 50%; background: #0f172a;
           border: 2px solid currentColor; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 0 15px rgba(0,0,0,0.5); position: relative;
        }
        .node-inner.active { box-shadow: 0 0 25px currentColor; }
        
        .node-icon { --mdc-icon-size: 26px; color: currentColor; }
        .node-val { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 800; margin-top: 6px; }
        .node-lab { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.4; }

        .home-center {
           width: 100px; height: 100px; border: 3px solid #00ffff; 
           box-shadow: 0 0 35px rgba(0,255,255,0.15);
        }
        .home-center .node-icon { --mdc-icon-size: 36px; }

        .footer {
          text-align: center; font-family: 'Orbitron', sans-serif; font-size: 9px; 
          color: rgba(255,255,255,0.2); letter-spacing: 4px; margin-top: 15px;
        }
      </style>
      <ha-card>
        <div class="header-title">ELITE FLOW :: V5.6-GAUGE</div>
        <div class="main-layout">
          <div class="sidebar">
            <div class="gauge-match-card"><ha-icon icon="mdi:calendar-today"></ha-icon><span class="stat-lab">Heute</span><span class="stat-val" id="s-today">-- kWh</span></div>
            <div class="gauge-match-card"><ha-icon icon="mdi:calendar-week"></ha-icon><span class="stat-lab">Woche</span><span class="stat-val" id="s-week">-- kWh</span></div>
          </div>
          
          <div class="flow-area" id="flow-area">
            <svg class="svg-canvas" viewBox="0 0 100 100">
              <defs>
                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g id="p-layer"></g>
            </svg>
            <div id="n-layer"></div>
          </div>
        </div>
        <div class="footer">POWERED BY OPENKAIRO</div>
      </ha-card>
    `;
    this.content = true;
  }

  drawNode(id, icon, label, color, x, y, isHome = false) {
    return `
      <div class="node" style="left:${x}%; top:${y}%; color:${color};">
        <div class="node-inner ${isHome ? 'home-center' : ''}" id="node-${id}">
          <ha-icon class="node-icon" icon="${icon}"></ha-icon>
        </div>
        <div class="node-val" id="val-${id}">0W</div>
        <div class="node-lab">${label}</div>
      </div>`;
  }

  drawPath(id, color, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const cy = y1 + dy*0.5;
    // Stronger S-Curve to prevent overlapping with horizontal lines
    const cpX = dx * 0.45;
    const d = `M ${x1} ${y1} C ${x1 + cpX} ${y1}, ${x2 - cpX} ${y2}, ${x2} ${y2}`;
    return `
      <path class="path-wire" d="${d}"></path>
      <path id="path-${id}" class="path-glow" d="${d}" stroke="${color}"></path>
    `;
  }

  updateLayout() {
    const pLayer = this.querySelector('#p-layer');
    const nLayer = this.querySelector('#n-layer');
    if (!pLayer || !nLayer) return;

    const paths = [], nodes = [];
    const cX = 50, cY = 40;

    nodes.push(this.drawNode('home', 'mdi:home-lightning-bolt', 'SYSTEM', '#00ffff', cX, cY, true));
    
    // SOURCES: Farther out to leave room
    if (this.getVal('solar_entity')) {
      nodes.push(this.drawNode('solar', 'mdi:solar-power', 'SOLAR', '#ff9900', cX, 10));
      paths.push(this.drawPath('solar-home', '#ff9900', cX, 10, cX, cY));
    }
    if (this.getVal('grid_import_entity') || this.getVal('grid_export_entity')) {
      nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'NETZ', '#ff007f', 8, cY));
      paths.push(this.drawPath('grid-home', '#ff007f', 8, cY, cX, cY));
    }
    if (this.getVal('battery_power_entity')) {
      nodes.push(this.drawNode('batt', 'mdi:battery-high', 'AKKU', '#00ff00', 92, cY));
      paths.push(this.drawPath('batt-home', '#00ff00', 92, cY, cX, cY));
    }

    // CONSUMER ARC: Lower and wider
    const consumers = [
      { key: 'miner_entity', label: 'MINER', icon: 'mdi:bitcoin', color: '#a855f7', x: 20, y: 78 },
      { key: 'heatpump_entity', label: 'HEIZUNG', icon: 'mdi:heat-pump', color: '#3b82f6', x: 40, y: 88 },
      { key: 'ev_entity', label: 'AUTO', icon: 'mdi:car-electric', color: '#eab308', x: 60, y: 88 },
      { key: 'ac_entity', label: 'KLIMA', icon: 'mdi:air-conditioner', color: '#00d1ff', x: 80, y: 78 }
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
      const duration = (8500 / Math.max(40, Math.abs(val))) * (10/speed);
      p.style.animationDuration = Math.min(15, Math.max(0.4, duration)) + 's';
      p.style.animationDirection = rev ? 'reverse' : 'normal';
      p.setAttribute('class', `path-glow anim-${this.getVal('animation_type', 'dots')}`);
    };

    const updN = (id, v) => {
      const el = this.querySelector(`#val-${id}`);
      const circle = this.querySelector(`#node-${id}`);
      if (el) el.innerText = format(v);
      if (circle) {
        if (Math.abs(v) > 15) circle.classList.add('active');
        else circle.classList.remove('active');
      }
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

    const sToday = this.querySelector('#s-today');
    if (sToday) sToday.innerText = getP(this._config.solar_yield_today_entity).toFixed(1) + ' kWh';
    const sWeek = this.querySelector('#s-week');
    if (sWeek) sWeek.innerText = getP(this._config.solar_yield_week_entity).toFixed(1) + ' kWh';
  }
}

customElements.define("openkairo-solar-card", OpenKairoSolarCard);
