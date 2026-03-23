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
    this.innerHTML = `
      <style>
        ha-card {
           background: rgba(10, 20, 28, 0.45); border-radius: 28px;
           backdrop-filter: blur(15px) saturate(180%); -webkit-backdrop-filter: blur(15px) saturate(180%);
           position: relative; box-shadow: 0 15px 45px rgba(0,0,0,0.7);
           overflow: hidden !important; border: 1px solid rgba(255,255,255,0.1);
           color: #fff; font-family: 'Inter', sans-serif;
        }
        
        .header { 
           font-family: 'Orbitron', sans-serif; font-size: 1.1rem; color: #10b981; 
           text-align: center; font-weight: 900; margin-top: 25px; margin-bottom: 20px; letter-spacing: 5px; 
           text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
           text-transform: uppercase;
        }

        .canvas-area {
           position: relative;
           width: 100%;
           height: ${this._config.height || 300}px;
           overflow: hidden;
        }

        .canvas-element {
          position: absolute;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          user-select: none;
          flex-direction: column;
          text-align: center;
          box-sizing: border-box;
          transition: background 0.3s, color 0.3s, box-shadow 0.3s;
        }

        /* SVG Links Overlay */
        #links-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }
        .linking-path {
          fill: none;
          stroke: #10b981;
          stroke-width: 2;
          stroke-dasharray: 5,5;
          animation: flow 1s linear infinite;
        }
        @keyframes flow {
          to { stroke-dashoffset: -10; }
        }
      </style>
      <ha-card>
        <div class="header">${this._config.title || 'OPENKAIRO OS'}</div>
        <div class="canvas-area" id="render-area">
           <svg id="links-overlay"></svg>
        </div>
      </ha-card>
    `;

    this.content = true;
    const renderArea = this.querySelector('#render-area');

    this._config.layout.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = 'canvas-element';
        el.id = block.id || ('block-' + index);
        
        el.style.left = (block.x || 0) + 'px';
        el.style.top = (block.y || 0) + 'px';
        el.style.width = (block.width || 100) + 'px';
        el.style.height = (block.height || 40) + 'px';
        
        let activeColor = block.color || '#10b981';
        
        // Dynamic Logic State Evaluation
        if (block.logicState && block.entity && this._hass && this._hass.states[block.entity]) {
            const currentState = this._hass.states[block.entity].state;
            if (currentState.toString().toLowerCase() === block.logicState.toLowerCase()) {
                activeColor = block.logicColor || '#f43f5e';
            }
        }
        
        el.style.color = activeColor;
        el.style.fontSize = (block.fontSize || 13) + 'px';
        el.style.fontWeight = block.fontWeight || 'bold';
        const radius = block.borderRadius !== undefined ? block.borderRadius : ((block.type === 'Card' || block.type === 'Container') ? 20 : 8);
        el.style.borderRadius = radius + 'px';
        
        if (block.type === 'Card' || block.type === 'Container') {
            // Dynamic bg logic for containers
            el.style.background = block.backgroundColor || 'transparent';
            if (block.backgroundColor && block.backgroundColor !== 'transparent') {
                el.style.backdropFilter = 'blur(15px)';
            }
            if (block.backgroundImage) {
                el.style.backgroundImage = `url('${block.backgroundImage}')`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
            }
        } else if (block.type !== 'Text') {
            el.style.background = `${activeColor}25`;
            el.style.boxShadow = `0 0 10px ${activeColor}40`;
        } else {
            el.style.background = 'transparent';
            el.style.boxShadow = 'none';
        }

        // Setup Actions (Once per block)
        if (block.action && block.action !== 'none' && block.entity) {
            el.style.cursor = 'pointer';
            el.onclick = () => {
                if(block.action === 'toggle') {
                    this._hass.callService('homeassistant', 'toggle', { entity_id: block.entity });
                } else if (block.action === 'more-info') {
                    fireEvent(this, 'hass-more-info', { entityId: block.entity });
                }
            };
        }

        // Store configuration logically
        el._ok_type = block.type;
        el._ok_entity = block.entity;
        el._ok_text = block.text;
        el._ok_img = block.imageUrl;
        
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
            
            // Bezier curve
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
       const type = el._ok_type;
       
       const entityId = el._ok_entity;
       let val = "N/A", metric = "", stateObj = null;
       
       if (entityId && this._hass && this._hass.states[entityId]) {
           stateObj = this._hass.states[entityId];
           val = stateObj.state;
           metric = stateObj.attributes.unit_of_measurement || '';
       }

       if (type === 'Slider') {
           let numVal = parseFloat(val) || 0;
           el.innerHTML = `
              <div style="font-size:10px; margin-bottom:5px;">${el._ok_text || entityId || 'Slider'}</div>
              <input type="range" min="0" max="100" value="${numVal}" style="width:80%;" disabled />
           `;
       }
       else if (type === 'Image') {
           if (el._ok_img) {
               el.innerHTML = `<img src="${el._ok_img}" style="width:100%; height:100%; object-fit:cover; pointer-events:none; border-radius:${el.style.borderRadius};" />`;
           } else {
               el.innerHTML = `<ha-icon icon="mdi:image" style="--mdc-icon-size:24px; opacity:0.3;"></ha-icon>`;
           }
       }
       else if (type === 'Energie-Ring') {
           let numVal = parseFloat(val) || 0;
           el.innerHTML = `
              <div style="width: 40px; height: 40px; border-radius: 50%; border: 4px solid currentColor; border-top-color: transparent; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">
                 <span style="font-size:10px; font-weight:bold;">${numVal}</span>
              </div>
           `;
       }
       else if (type === 'Text' || type === 'Button') {
           const iconMap = type === 'Text' ? 'mdi:format-text' : 'mdi:gesture-tap-button';
           let displayContent = entityId && stateObj ? `<b>${val} ${metric}</b>` : (el._ok_text || type);
           el.innerHTML = `<ha-icon icon="${iconMap}" style="--mdc-icon-size:16px; margin-bottom: 2px;"></ha-icon> ${displayContent}`;
       } 
       else if (type === 'Entity State' || type === 'Badge') {
           if (stateObj) {
               el.innerHTML = `<ha-icon icon="mdi:thermometer" style="--mdc-icon-size:16px; margin-bottom: 2px;"></ha-icon> <b>${val} ${metric}</b>`;
           } else {
               el.innerHTML = `<ha-icon icon="mdi:alert-circle-outline" style="--mdc-icon-size:16px; margin-bottom: 2px; opacity:0.6;"></ha-icon> <span style="font-size:10px; opacity:0.6">N/A</span>`;
           }
       }
       else if (type === 'Icon') {
           el.innerHTML = `<ha-icon icon="mdi:star-four-points-outline" style="--mdc-icon-size:24px;"></ha-icon>`;
       }
       else if (entityId && stateObj && type !== 'Card' && type !== 'Container') {
           // Universal fallback for anything with an entity attached
           el.innerHTML = `<b>${val} ${metric}</b>`;
       }
       else if (type !== 'Card' && type !== 'Container') {
           // Fallback for structural blocks or blocks without entity so they aren't invisible
           let icon = 'mdi:cube-outline';
           if(type==='Grid') icon = 'mdi:grid';
           if(type==='Stack') icon = 'mdi:format-list-bulleted';
           el.innerHTML = `<ha-icon icon="${icon}" style="--mdc-icon-size:16px; margin-right:5px; vertical-align:middle;"></ha-icon> ${type}`;
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
