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
          background: rgba(16, 185, 129, 0.1);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          backdrop-filter: blur(5px);
          user-select: none;
          flex-direction: column;
          text-align: center;
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
        
        const color = block.color || '#10b981';
        el.style.color = color;
        el.style.borderColor = color;
        el.style.border = `1px solid ${color}80`;
        el.style.boxShadow = `0 0 10px ${color}40`;
        el.style.background = `${color}15`;

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
