function fireEvent(node, type, detail, options) {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
}

class OpenKairoCustomCard extends HTMLElement {
  setConfig(config) {
    if (!config || !config.layout) {
      throw new Error("Bitte ein OpenKAIRO Layout im Editor definieren!");
    }
    this._config = config;
    if (!this.content) {
      this.setupDOM();
    }
  }

  static getConfigElement() {
    return document.createElement("openkairo-custom-card-editor");
  }

  static getStubConfig() {
    return {
      name: "CYBER HUB",
      glow: 40,
      blur: 25,
      color: "#00f6ff",
      opacity: 0.3,
      layout: [
        { type: "Text", id: "t1", x: 140, y: 40, text: "SYSTEM STATUS", color: "#00f6ff", glow: 20 }
      ]
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.setupDOM();
    }
    if (this._config && this._config.layout) {
       this.updateLiveStates();
    }
  }

  setupDOM() {
    const c = this._config;
    // Resolve Card Name Slot
    let cardName = c.name || 'LIVING ROOM';
    if (cardName.startsWith('[[') && cardName.endsWith(']]')) {
        const slotName = cardName.slice(2, -2);
        cardName = (c.slots && c.slots[slotName]) || slotName.toUpperCase();
    }
    this.innerHTML = `
      <style>
        ha-card {
           background: #000;
           border-radius: 12px;
           backdrop-filter: blur(${c.blur || 25}px);
           -webkit-backdrop-filter: blur(${c.blur || 25}px);
           position: relative; 
           box-shadow: 
             0 20px 80px rgba(0,0,0,0.9),
             inset 0 0 40px rgba(0, 0, 0, 0.5),
             ${c.glow > 0 ? `0 0 ${c.glow}px ${c.color || '#00f6ff'}40, 0 0 1px ${c.color || '#00f6ff'}` : '0 1px 1px rgba(255,255,255,0.1)'};
           overflow: hidden !important; 
           border: 1px solid ${c.glow > 0 ? (c.color || '#00f6ff') : 'rgba(255,255,255,0.05)'};
           color: #fff; font-family: 'Rajdhani', sans-serif;
           min-height: ${c.height || 400}px;
        }
        
        ha-card::before {
           content: "";
           position: absolute;
           top: 0; left: 0; right: 0; bottom: 0;
           background-image: 
             radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
           background-size: 24px 24px;
           opacity: 0.8;
           pointer-events: none;
           z-index: 0;
        }

        .header { 
          font-size: 18px; 
          font-weight: 900; 
          text-align: center; 
          margin-bottom: 30px; 
          color: var(--accent-color, #10b981); 
          letter-spacing: 4px; 
          text-transform: uppercase; 
          text-shadow: 0 0 10px currentColor; 
          opacity: 0.9;
        }

        .canvas-area {
           position: relative;
           width: 100%;
           height: ${c.height || 400}px;
           overflow: visible;
        }

        .canvas-element {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          box-sizing: border-box;
          transition: 0.3s;
        }

        #links-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; opacity: 0.6; }
        .linking-path { 
            fill: none; 
            stroke-width: 2; 
            stroke-dasharray: 4, 12; 
            animation: flow 3s linear infinite, glowPulse 2s ease-in-out infinite alternate; 
            stroke-linecap: round;
        }
        @keyframes flow { to { stroke-dashoffset: -48; } }
        @keyframes glowPulse { from { filter: drop-shadow(0 0 2px currentColor); opacity: 0.4; } to { filter: drop-shadow(0 0 10px currentColor); opacity: 0.9; } }
      </style>
      <ha-card>
        <div class="header">${cardName}</div>
        <div class="canvas-area" id="render-area">
           <svg id="links-overlay"></svg>
        </div>
      </ha-card>
    `;

    this.content = true;
    const renderArea = this.querySelector('#render-area');

    c.layout.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = 'canvas-element';
        el.id = block.id || ('block-' + index);
        el.style.left = (block.x || 0) + 'px';
        el.style.top = (block.y || 0) + 'px';
        
        // Resolve Entity Slot
        let entityId = block.entity;
        if (entityId && entityId.startsWith('[[') && entityId.endsWith(']]')) {
            const slotName = entityId.slice(2, -2);
            entityId = (c.slots && c.slots[slotName]) || null;
        }

        // Initial Styles from Config
        el.style.color = block.color || '#10b981';
        el.style.opacity = block.opacity !== undefined ? block.opacity : 1;
        el.style.fontSize = (block.fontSize || 13) + 'px';
        el.style.fontWeight = 'bold';
        
        const updateStyles = () => {
            el.style.boxShadow = block.glow > 0 ? `0 0 ${block.glow}px ${block.color}` : 'none';
            el.style.textShadow = block.textGlow > 0 ? `0 0 ${block.textGlow}px ${block.color}` : 'none';
            el.style.backdropFilter = block.blur > 0 ? `blur(${block.blur}px)` : 'none';
            if (block.blur > 0) el.style.background = `rgba(255,255,255,0.05)`;
        };
        updateStyles();

        if (block.action && block.action !== 'none' && entityId) {
            el.style.cursor = 'pointer';
            el.onclick = () => {
                if(block.action === 'toggle') this._hass.callService('homeassistant', 'toggle', { entity_id: entityId });
                else fireEvent(this, 'hass-more-info', { entityId: entityId });
            };
        }

        el._ok_cfg = { ...block, resolvedEntity: entityId };
        renderArea.appendChild(el);
    });

    this.renderLinks();
    this.updateLiveStates();
  }

  renderLinks() {
    const svg = this.querySelector('#links-overlay');
    if (!svg || !this._config.links) return;
    svg.innerHTML = '';
    
    this._config.links.forEach(link => {
        const sourceEl = this.querySelector('#' + link.source);
        const targetEl = this.querySelector('#' + link.target);
        
        if (sourceEl && targetEl) {
            const sRect = {
                x: parseInt(sourceEl.style.left) + sourceEl.offsetWidth / 2,
                y: parseInt(sourceEl.style.top) + sourceEl.offsetHeight / 2
            };
            const tRect = {
                x: parseInt(targetEl.style.left) + targetEl.offsetWidth / 2,
                y: parseInt(targetEl.style.top) + targetEl.offsetHeight / 2
            };
            
            // Bezier curve (Curvy link)
            const cp1x = sRect.x + (tRect.x - sRect.x) / 2;
            const cp1y = sRect.y;
            const cp2x = sRect.x + (tRect.x - sRect.x) / 2;
            const cp2y = tRect.y;
            
            const pathData = `M ${sRect.x} ${sRect.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tRect.x} ${tRect.y}`;
            
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            if (link.animated !== false) {
                path.setAttribute("class", "linking-path");
            }
            path.setAttribute("stroke", link.color || "#10b981");
            path.setAttribute("fill", "none");
            svg.appendChild(path);
        }
    });
  }

  updateLiveStates() {
    if(!this._hass) return;
    const elements = this.querySelectorAll('.canvas-element');
    
    elements.forEach(el => {
       const b = el._ok_cfg;
       const entityId = b.resolvedEntity;
       let val = "N/A", metric = "", stateObj = null;
       
       if (entityId && this._hass.states[entityId]) {
           stateObj = this._hass.states[entityId];
           val = stateObj.state;
           metric = stateObj.attributes.unit_of_measurement || '';
       }

       if (b.type === 'Klima-Bogen') {
           const temp = stateObj ? stateObj.attributes.current_temperature || val : "21";
           const target = stateObj ? stateObj.attributes.temperature || val : "22";
           const hvacAction = stateObj ? (stateObj.attributes.hvac_action || stateObj.state) : "idle";
           const accentColor = hvacAction === 'heating' ? '#f59e0b' : (hvacAction === 'cooling' ? '#3b82f6' : '#10b981');
           
           el.innerHTML = `
             <div style="position:relative; width:140px; height:140px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 0 15px ${accentColor}20;">
                <svg viewBox="0 0 100 100" style="position:absolute; top:0; left:0; width:100%; height:100%; transform:rotate(-90deg);">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="6" />
                    <circle cx="50" cy="50" r="46" fill="none" stroke="${accentColor}" stroke-width="6" 
                            stroke-dasharray="290" stroke-dashoffset="${290 - (290 * (Math.min(target, 35) / 35))}" 
                            style="transition:1s ease; filter:drop-shadow(0 0 12px ${accentColor});" />
                </svg>
                <div style="text-align:center; z-index:2;">
                    <div style="font-size:32px; font-weight:900; color:#fff; line-height:1; letter-spacing:-1px; text-shadow: 0 0 20px rgba(255,255,255,0.3);">${temp}°</div>
                    <div style="font-size:10px; color:${accentColor}; text-transform:uppercase; margin-top:6px; letter-spacing:2px; font-weight:800; opacity:0.8;">${hvacAction}</div>
                </div>
             </div>
           `;
       } else if (b.type === 'Hex-Power') {
           const isOn = stateObj ? stateObj.state === 'on' : true;
           const color = isOn ? (b.color || '#00f6ff') : 'rgba(255,255,255,0.2)';
           el.innerHTML = `
                <div style="width:80px; height:90px; background:${color}; clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; align-items:center; justify-content:center; opacity:0.8; box-shadow:0 0 20px ${color}; transition:0.3s;">
                   <div style="width:90%; height:90%; background:#000; clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                       <ha-icon icon="mdi:flash" style="--mdc-icon-size:20px; color:${color};"></ha-icon>
                       <div style="font-size:14px; font-weight:900; color:#fff;">${isOn ? 'ON' : 'OFF'}</div>
                   </div>
                </div>
           `;
       } else if (b.type === 'Pulse-Chart') {
           const flowVal = parseFloat(val) || 0;
           const color = b.color || '#00f6ff';
           el.innerHTML = `
                <div style="width:200px; height:80px; background:rgba(0,0,0,0.4); border-radius:12px; border:1px solid rgba(255,255,255,0.05); padding:10px; display:flex; flex-direction:column;">
                   <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                       <span style="font-size:9px; color:${color}; font-weight:900; letter-spacing:1px; text-transform:uppercase;">${b.text || 'System Load'}</span>
                       <span style="font-size:9px; color:#fff; font-weight:900;">${val}${metric}</span>
                   </div>
                   <div style="flex:1; display:flex; align-items:flex-end; gap:2px;">
                       <div style="flex:1; background:${color}; height:40%; opacity:0.3;"></div>
                       <div style="flex:1; background:${color}; height:60%; opacity:0.5;"></div>
                       <div style="flex:1; background:${color}; height:30%; opacity:0.3;"></div>
                       <div style="flex:1; background:${color}; height:80%; opacity:0.8; box-shadow:0 0 10px ${color};"></div>
                       <div style="flex:1; background:${color}; height:50%; opacity:0.5;"></div>
                   </div>
                </div>
           `;
       } else if (b.type === 'Glitch-Text') {
           el.innerHTML = `<span style="text-shadow: 2px 0 #ef4444, -2px 0 #3b82f6; font-weight:900; letter-spacing:2px; font-size:${b.fontSize || 18}px; color:#fff;">${b.text || val}</span>`;
       } else if (b.type === 'Modus-Schalter') {
           const currentMode = stateObj ? stateObj.state : "auto";
           const modes = stateObj ? (stateObj.attributes.hvac_modes || ['heat', 'cool', 'auto']) : ['heat', 'cool', 'auto'];
           let modeHtml = modes.map(m => `
                <div style="padding:8px 16px; border-radius:10px; background:${currentMode === m ? '#10b981' : 'transparent'}; box-shadow: ${currentMode === m ? '0 0 20px rgba(16,185,129,0.4)' : 'none'}; color:${currentMode === m ? '#fff' : 'rgba(255,255,255,0.4)'}; font-size:11px; text-transform:uppercase; font-weight:900; transition:0.4s; cursor:pointer; border:1px solid ${currentMode === m ? '#10b981' : 'transparent'};">${m}</div>
           `).join('');
           el.innerHTML = `<div style="display:flex; gap:8px; background:rgba(0,0,0,0.4); padding:8px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">${modeHtml}</div>`;
       } else if (b.type === 'Energie-Ring') {
           const flowVal = parseFloat(val) || 0;
           metric = stateObj ? (stateObj.attributes.unit_of_measurement || "W") : "W";
           const flowColor = flowVal > 0 ? '#06b6d4' : '#ec4899'; // Cyan vs Pink for energy
           el.innerHTML = `
             <div style="position:relative; width:100px; height:100px; display:flex; align-items:center; justify-content:center;">
                <div style="position:absolute; width:100%; height:100%; border-radius:50%; border:1px solid ${flowColor}; opacity:0.1; box-shadow:inset 0 0 20px ${flowColor}40;"></div>
                <svg viewBox="0 0 100 100" style="position:absolute; width:120%; height:120%; animation: rotate 12s linear infinite;">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="${flowColor}" stroke-width="1.5" stroke-dasharray="2, 15" opacity="0.6" stroke-linecap="round" />
                </svg>
                <div style="text-align:center; z-index:2;">
                    <div style="font-size:22px; font-weight:900; color:#fff; line-height:1; text-shadow: 0 0 15px ${flowColor}60;">${val}</div>
                    <div style="font-size:10px; color:${flowColor}; font-weight:900; text-transform:uppercase; margin-top:4px; letter-spacing:1px;">${metric}</div>
                </div>
             </div>
             <style>@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
           `;
       } else if (b.type === 'Weather-Card') {
           const condition = stateObj ? stateObj.state : "cloudy";
           const temp = stateObj ? stateObj.attributes.temperature : "18";
           const icon = condition === 'sunny' ? 'mdi:weather-sunny' : (condition === 'rainy' ? 'mdi:weather-pouring' : 'mdi:weather-cloudy');
           el.innerHTML = `
             <div style="padding:15px; background:rgba(255,255,255,0.03); border-radius:20px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:15px; backdrop-filter:blur(10px); box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <ha-icon icon="${icon}" style="--mdc-icon-size:40px; color:#fbbf24; filter:drop-shadow(0 0 10px #fbbf2460);"></ha-icon>
                <div>
                    <div style="font-size:24px; font-weight:900; color:#fff;">${temp}°</div>
                    <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px;">${condition}</div>
                </div>
             </div>
           `;
       } else if (b.type === 'Media-Player') {
           const title = stateObj ? stateObj.attributes.media_title || "Keine Wiedergabe" : "Cyberpunk 2077 OST";
           const artist = stateObj ? stateObj.attributes.media_artist || "Kein Künstler" : "Hyper";
           const isPlaying = stateObj ? stateObj.state === 'playing' : true;
           el.innerHTML = `
             <div style="width:250px; padding:15px; background:rgba(0,0,0,0.4); border-radius:24px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:12px; backdrop-filter:blur(15px); box-shadow:0 15px 40px rgba(0,0,0,0.6);">
                <div style="display:flex; gap:12px; align-items:center;">
                    <div style="width:50px; height:50px; background:linear-gradient(45deg, #7c3aed, #db2777); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.4);">
                        <ha-icon icon="mdi:music" style="color:#fff;"></ha-icon>
                    </div>
                    <div style="overflow:hidden; flex:1;">
                        <div style="font-size:13px; font-weight:900; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</div>
                        <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px;">${artist}</div>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:20px; align-items:center;">
                    <ha-icon icon="mdi:skip-previous" style="color:rgba(255,255,255,0.6); cursor:pointer;"></ha-icon>
                    <div style="width:40px; height:40px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#000; box-shadow:0 0 20px rgba(255,255,255,0.4); cursor:pointer;">
                        <ha-icon icon="${isPlaying ? 'mdi:pause' : 'mdi:play'}"></ha-icon>
                    </div>
                    <ha-icon icon="mdi:skip-next" style="color:rgba(255,255,255,0.6); cursor:pointer;"></ha-icon>
                </div>
             </div>
           `;
       } else {
           let displayContent = b.text || b.type;
           if (entityId && stateObj) displayContent = `${val}${metric}`;
           el.innerHTML = `<span style="text-shadow: 0 0 10px rgba(255,255,255,0.2);">${displayContent}</span>`;
       }
    });
  }

  getCardSize() {
    return 4;
  }
}

if (!customElements.get("openkairo-custom-card")) {
  customElements.define("openkairo-custom-card", OpenKairoCustomCard);
}

class OpenKairoCustomCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    if (!this._config) return;
    this.innerHTML = `
      <style>
        .editor-container { font-family: 'Rajdhani', sans-serif; color: #fff; display: flex; flex-direction: column; gap: 15px; padding: 10px; background: #000; border-radius: 12px; }
        .editor-row { display: flex; flex-direction: column; gap: 5px; }
        .editor-label { font-size: 11px; font-weight: 800; color: #00f6ff; text-transform: uppercase; letter-spacing: 1px; }
        .editor-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px; border-radius: 6px; font-family: 'Rajdhani'; font-size: 13px; outline: none; }
        .editor-input:focus { border-color: #00f6ff; }
        .architect-btn { background: #00f6ff; color: #000; border: none; padding: 12px; border-radius: 8px; font-weight: 900; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; transition: 0.3s; }
        .architect-btn:hover { box-shadow: 0 0 20px rgba(0, 246, 255, 0.4); transform: translateY(-2px); }
      </style>
      <div class="editor-container">
        <div class="editor-row">
            <span class="editor-label">Karten-Name</span>
            <input class="editor-input" id="name" type="text" value="${this._config.name || ''}">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="editor-row">
                <span class="editor-label">Glow-Intensität (${this._config.glow || 0})</span>
                <input class="editor-input" id="glow" type="range" min="0" max="100" value="${this._config.glow || 0}">
            </div>
            <div class="editor-row">
                <span class="editor-label">Blur-Effekt (${this._config.blur || 0})</span>
                <input class="editor-input" id="blur" type="range" min="0" max="50" value="${this._config.blur || 0}">
            </div>
        </div>
        <div class="editor-row">
            <span class="editor-label">Akzent-Farbe</span>
            <input class="editor-input" id="color" type="color" value="${this._config.color || '#00f6ff'}" style="height:40px; padding:2px;">
        </div>
        
        <div style="border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;"></div>
        
        <div class="editor-row">
            <span class="editor-label" style="opacity:0.6;">Visual Architect (Pro Modus)</span>
            <button class="architect-btn" id="open-builder">
                <ha-icon icon="mdi:view-dashboard-edit"></ha-icon> ARCHITECT ÖFFNEN
            </button>
            <span style="font-size:9px; color:rgba(255,255,255,0.3); margin-top:5px; text-align:center;">Nutze den Architect für Drag & Drop Layouts.</span>
        </div>
      </div>
    `;

    this.querySelectorAll('.editor-input').forEach(input => {
        input.addEventListener('change', (ev) => this._valueChanged(ev));
        if(input.type === 'range') input.addEventListener('input', (ev) => this._valueChanged(ev));
    });

    this.querySelector('#open-builder').addEventListener('click', () => {
        window.history.pushState(null, null, '/openkairo');
        window.dispatchEvent(new CustomEvent('location-changed'));
    });
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;
    const target = ev.target;
    const value = target.type === 'range' ? parseInt(target.value) : target.value;
    
    const newConfig = { ...this._config, [target.id]: value };
    
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

if (!customElements.get("openkairo-custom-card-editor")) {
  customElements.define("openkairo-custom-card-editor", OpenKairoCustomCardEditor);
}
