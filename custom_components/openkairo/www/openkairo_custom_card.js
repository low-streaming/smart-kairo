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
      </style>
      <ha-card>
        <div class="header">${this._config.title || 'OPENKAIRO OS'}</div>
        <div class="canvas-area" id="render-area"></div>
      </ha-card>
    `;

    this.content = true;
    const renderArea = this.querySelector('#render-area');

    this._config.layout.forEach((block, index) => {
        const el = document.createElement('div');
        el.className = 'canvas-element';
        el.id = 'block-' + index;
        
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
        
        renderArea.appendChild(el);
    });

    this.updateLiveStates();
  }

  updateLiveStates() {
    if(!this._hass) return;
    const elements = this.querySelectorAll('.canvas-element');
    
    elements.forEach(el => {
       const type = el._ok_type;
       
       if (type === 'Text' || type === 'Button') {
           const iconMap = type === 'Text' ? 'mdi:format-text' : 'mdi:gesture-tap-button';
           el.innerHTML = `<ha-icon icon="${iconMap}" style="--mdc-icon-size:16px; margin-bottom: 2px;"></ha-icon> ${el._ok_text || type}`;
       } 
       else if (type === 'Entity State' || type === 'Badge') {
           const entityId = el._ok_entity;
           if (entityId && this._hass.states[entityId]) {
               const stateObj = this._hass.states[entityId];
               const val = stateObj.state;
               const metric = stateObj.attributes.unit_of_measurement || '';
               el.innerHTML = `<ha-icon icon="mdi:thermometer" style="--mdc-icon-size:16px; margin-bottom: 2px;"></ha-icon> <b>${val} ${metric}</b>`;
           } else {
               el.innerHTML = `<ha-icon icon="mdi:alert-circle-outline" style="--mdc-icon-size:16px; margin-bottom: 2px; opacity:0.6;"></ha-icon> <span style="font-size:10px; opacity:0.6">N/A</span>`;
           }
       }
       else if (type === 'Icon') {
           el.innerHTML = `<ha-icon icon="mdi:star-four-points-outline" style="--mdc-icon-size:24px;"></ha-icon>`;
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
