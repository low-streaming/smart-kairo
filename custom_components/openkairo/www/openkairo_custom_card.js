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
           background: rgba(10, 20, 28, ${c.opacity || 0.45}); 
           border-radius: 28px;
           backdrop-filter: blur(${c.blur || 15}px) saturate(180%);
           -webkit-backdrop-filter: blur(${c.blur || 15}px) saturate(180%);
           position: relative; 
           box-shadow: ${c.glow > 0 ? `0 0 ${c.glow}px ${c.color || '#10b981'}` : '0 15px 45px rgba(0,0,0,0.7)'};
           overflow: hidden !important; 
           border: 1px solid ${c.glow > 0 ? (c.color || '#10b981') : 'rgba(255,255,255,0.1)'};
           color: #fff; font-family: 'Inter', sans-serif;
           min-height: ${c.height || 300}px;
        }
        
        .header { 
           font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #10b981; 
           text-align: center; font-weight: 800; margin-top: 20px; 
           opacity: 0.5; letter-spacing: 2px;
           text-transform: uppercase;
        }

        .canvas-area {
           position: relative;
           width: 100%;
           height: ${c.height || 300}px;
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

        #links-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; }
        .linking-path { fill: none; stroke: #10b981; stroke-width: 2; stroke-dasharray: 5,5; animation: flow 1s linear infinite; filter: drop-shadow(0 0 5px #10b981); }
        @keyframes flow { to { stroke-dashoffset: -10; } }
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
             <div style="position:relative; width:120px; height:120px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                <svg viewBox="0 0 100 100" style="position:absolute; top:0; left:0; width:100%; height:100%; transform:rotate(-90deg);">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="${accentColor}" stroke-width="4" 
                            stroke-dasharray="282" stroke-dashoffset="${282 - (282 * (Math.min(target, 35) / 35))}" 
                            style="transition:0.8s cubic-bezier(0.4, 0, 0.2, 1); filter:drop-shadow(0 0 8px ${accentColor});" />
                </svg>
                <div style="text-align:center; z-index:2;">
                    <div style="font-size:28px; font-weight:800; color:#fff; line-height:1; letter-spacing:-1px;">${temp}°</div>
                    <div style="font-size:9px; color:${accentColor}; text-transform:uppercase; margin-top:4px; letter-spacing:1px; font-weight:700;">${hvacAction}</div>
                </div>
             </div>
           `;
       } else if (b.type === 'Modus-Schalter') {
           const currentMode = stateObj ? stateObj.state : "auto";
           const modes = stateObj ? (stateObj.attributes.hvac_modes || ['heat', 'cool', 'auto']) : ['heat', 'cool', 'auto'];
           let modeHtml = modes.map(m => `
                <div style="padding:6px 12px; border-radius:8px; background:${currentMode === m ? '#10b981' : 'rgba(255,255,255,0.03)'}; color:${currentMode === m ? '#fff' : 'rgba(255,255,255,0.4)'}; font-size:10px; text-transform:uppercase; font-weight:800; transition:0.3s; cursor:pointer;">${m}</div>
           `).join('');
           el.innerHTML = `<div style="display:flex; gap:6px; background:rgba(0,0,0,0.3); padding:6px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(10px);">${modeHtml}</div>`;
       } else if (b.type === 'Energie-Ring') {
           const flowVal = parseFloat(val) || 0;
           metric = stateObj ? (stateObj.attributes.unit_of_measurement || "W") : "W";
           const flowColor = flowVal > 0 ? '#10b981' : '#f43f5e';
           el.innerHTML = `
             <div style="position:relative; width:90px; height:90px; display:flex; align-items:center; justify-content:center;">
                <div style="position:absolute; width:100%; height:100%; border-radius:50%; border:2px solid ${flowColor}; opacity:0.1; box-shadow:inset 0 0 20px ${flowColor}30;"></div>
                <svg viewBox="0 0 100 100" style="position:absolute; width:100%; height:100%; animation: rotate 10s linear infinite;">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="${flowColor}" stroke-width="1" stroke-dasharray="10, 20" opacity="0.4" />
                </svg>
                <div style="text-align:center; z-index:2;">
                    <div style="font-size:18px; font-weight:900; color:#fff; line-height:1;">${val}</div>
                    <div style="font-size:9px; color:${flowColor}; font-weight:bold; text-transform:uppercase; margin-top:2px;">${metric}</div>
                </div>
             </div>
             <style>@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
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
