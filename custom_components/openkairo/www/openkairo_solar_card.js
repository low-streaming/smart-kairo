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
                <option value="dots" ${this.getVal('animation_type') === 'dots' ? 'selected' : ''}>Cyber Particles</option>
                <option value="dash" ${this.getVal('animation_type') === 'dash' ? 'selected' : ''}>Digital Stream</option>
                <option value="neon" ${this.getVal('animation_type') === 'neon' ? 'selected' : ''}>Neon Pulse</option>
              </select>
            </div>
            <div class="row-col">
              <label>Speed (${this.getVal('animation_speed', '5')})</label>
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
           background: #06080f; border-radius: 24px; padding: 30px;
           position: relative; overflow: hidden !important; border: 1px solid rgba(255,255,255,0.05);
           color: #fff; font-family: 'Inter', sans-serif; min-height: 540px;
        }

        .header {
           font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: #00ffff; 
           text-align: center; font-weight: 900; margin-bottom: 30px; letter-spacing: 6px; 
           text-transform: uppercase; opacity: 0.7;
        }

        .flow-container { 
           position: relative; width: 100%; height: 460px; overflow: hidden;
        }

        .svg-layer { 
          position: absolute; top:0; left:0; width:100%; height:100%; 
          pointer-events:none; z-index: 1;
        }

        .path-base { fill: none; stroke-width: 1.5; stroke: rgba(255,255,255,0.05); stroke-linecap: round; }
        .path-anim { fill: none; stroke-width: 2.5; stroke-linecap: round; filter: url(#glow); }
        
        /* SHARP CYBER DOTS */
        .anim-dots { stroke-dasharray: 2 18; animation: flow linear infinite; }
        .anim-dash { stroke-dasharray: 12 30; animation: flow linear infinite; }
        .anim-neon { stroke-dasharray: 40 100; animation: flow 2s linear infinite; }
        
        @keyframes flow { to { stroke-dashoffset: -300; } }

        /* NEON NODES */
        .node {
           position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center;
           transform: translate(-50%, -50%); z-index: 10; transition: 0.4s;
        }
        
        .node-box {
           width: 70px; height: 70px; border-radius: 18px; background: rgba(0,0,0,0.6);
           border: 2px solid currentColor; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 0 15px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.05);
           position: relative;
        }
        .node-box::before {
           content: ''; position: absolute; inset: -8px; border-radius: 24px;
           border: 1px solid currentColor; opacity: 0.15; pointer-events: none;
        }
        
        .center-box {
           width: 180px; height: 180px; border-radius: 35px; background: rgba(0,0,0,0.8);
           border: 3px solid #00ffff; flex-direction: column; gap: 5px;
           box-shadow: 0 0 40px rgba(0,255,255,0.15);
        }

        .node-icon { --mdc-icon-size: 26px; color: currentColor; filter: drop-shadow(0 0 5px currentColor); }
        .node-value { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; margin-top: 5px; }
        .node-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.5; margin-top: 2px; }
        
        .center-label { font-family: 'Orbitron', sans-serif; font-size: 10px; letter-spacing: 2px; opacity: 0.6; }
        .center-value { font-family: 'JetBrains Mono', monospace; font-size: 2.2rem; font-weight: 800; color: #fff; }
        
        .batt-percent { 
          position: absolute; top: -15px; right: -15px; background: #00ff00; color: #000;
          font-size: 10px; font-weight: 900; padding: 3px 6px; border-radius: 6px;
        }

        .footer {
          text-align: center; font-family: 'Orbitron', sans-serif; font-size: 9px; 
          color: rgba(255,255,255,0.2); letter-spacing: 4px; margin-top: 20px;
        }
      </style>
      <ha-card>
        <div class="header">SYSTEM FLOW :: V5.4</div>
        <div class="flow-container" id="flow-container">
          <svg class="svg-layer">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g id="paths"></g>
          </svg>
          <div id="nodes"></div>
        </div>
        <div class="footer">POWERED BY OPENKAIRO</div>
      </ha-card>
    `;
    this.content = true;
  }

  drawNode(id, icon, label, color, x, y, isCenter = false) {
    if (isCenter) {
      return `
        <div class="node" style="left:${x}%; top:${y}%;">
          <div class="node-box center-box" id="node-${id}">
            <div class="center-label">NETZ-BILANZ</div>
            <div class="center-value" id="val-${id}">0W</div>
            <div style="font-size:8px; opacity:0.4; letter-spacing:2px;">LIMIT: --</div>
          </div>
        </div>`;
    }
    return `
      <div class="node" style="left:${x}%; top:${y}%; color:${color};">
        <div class="node-box" id="node-${id}">
          ${id === 'batt' ? '<div class="batt-percent" id="perc-batt">0%</div>' : ''}
          <ha-icon class="node-icon" icon="${icon}"></ha-icon>
        </div>
        <div class="node-value" id="val-${id}">0W</div>
        <div class="node-label">${label}</div>
      </div>`;
  }

  drawPath(id, color, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const d = `M ${x1} ${y1} C ${x1 + dx*0.4} ${y1}, ${x2 - dx*0.4} ${y2}, ${x2} ${y2}`;
    return `
      <path class="path-base" d="${d}"></path>
      <path id="path-${id}" class="path-anim" d="${d}" stroke="${color}"></path>
    `;
  }

  updateLayout() {
    const pBox = this.querySelector('#paths');
    const nBox = this.querySelector('#nodes');
    if (!pBox || !nBox) return;

    const paths = [];
    const nodes = [];
    const cX = 50, cY = 48;

    // Center Piece
    nodes.push(this.drawNode('home', '', '', '#00ffff', cX, cY, true));

    // Top Source
    if (this.getVal('solar_entity')) {
      nodes.push(this.drawNode('solar', 'mdi:solar-power', 'SOLAR', '#ff9900', 30, 22));
      paths.push(this.drawPath('solar-home', '#ff9900', 30, 22, cX, cY));
    }
    
    // Bottom Source
    if (this.getVal('grid_import_entity') || this.getVal('grid_export_entity')) {
      nodes.push(this.drawNode('grid', 'mdi:transmission-tower', 'NETZ', '#ff007f', 30, 74));
      paths.push(this.drawPath('grid-home', '#ff007f', 30, 74, cX, cY));
    }

    // Consumer (Right)
    nodes.push(this.drawNode('house', 'mdi:home-lightning-bolt', 'HAUS', '#00ffff', 70, 28));
    paths.push(this.drawPath('home-house', '#00ffff', cX, cY, 70, 28));

    // Battery (Right Bottom)
    if (this.getVal('battery_power_entity')) {
      nodes.push(this.drawNode('batt', 'mdi:battery-high', 'AKKU', '#00ff00', 70, 68));
      paths.push(this.drawPath('home-batt', '#00ff00', cX, cY, 70, 68));
    }

    pBox.innerHTML = paths.join('');
    nBox.innerHTML = nodes.join('');
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
    const netzBilanz = gridInW - gridOutW;

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
      if (el) el.innerText = format(v);
    };

    upd('home', netzBilanz);
    upd('solar', solarW);
    upd('grid', netzBilanz);
    upd('house', solarW + gridInW - gridOutW + battW);
    upd('batt', battW);

    const bPerc = this.querySelector('#perc-batt');
    if (bPerc) bPerc.innerText = Math.round(getP(this._config.battery_level_entity)) + '%';

    anim('solar-home', solarW);
    anim('grid-home', netzBilanz, netzBilanz < 0);
    anim('home-house', solarW + gridInW - gridOutW + battW);
    anim('home-batt', battW, battW < 0);
  }
}

customElements.define("openkairo-solar-card", OpenKairoSolarCard);
