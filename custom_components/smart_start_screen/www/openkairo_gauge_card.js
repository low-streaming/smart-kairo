class OpenKairoGaugeCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._initialized && this._hass) {
        this.renderForm();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
        this.renderForm();
    } else {
        this.updateSelectors();
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
        .group { 
            background: rgba(10, 20, 28, 0.4); 
            border: 1px solid rgba(5, 240, 160, 0.1); 
            padding: 18px; 
            border-radius: 16px; 
            margin-bottom: 25px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .row { margin-bottom: 15px; display: flex; gap: 12px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { 
            display: block; 
            font-size: 10px; 
            margin-bottom: 6px; 
            color: rgba(255,255,255,0.5); 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 1.5px;
            font-family: 'Orbitron', sans-serif;
        }
        h3 { 
            margin-top: 0; 
            margin-bottom: 20px; 
            color: #05f0a0; 
            font-family: 'Orbitron', sans-serif; 
            font-size: 0.9rem; 
            letter-spacing: 2px;
            text-transform: uppercase;
            border-bottom: 1px solid rgba(5, 240, 160, 0.2); 
            padding-bottom: 10px; 
            text-shadow: 0 0 10px rgba(5, 240, 160, 0.3);
        }
        input, select { 
            background: rgba(0,0,0,0.2) !important; 
            color: white !important; 
            border: 1px solid rgba(255,255,255,0.1) !important; 
            padding: 10px !important; 
            border-radius: 8px !important; 
            width: 100%;
            box-sizing: border-box;
        }
        input[type="color"] {
            padding: 2px !important;
            height: 40px;
            cursor: pointer;
        }
        ha-selector { width: 100%; }
      </style>
      <div class="card-config">
        <div class="group">
          <h3>Gauge Einstellungen</h3>
          <div class="row">
            <div class="row-col">
              <label>Titel (z.B. AKKU LADUNG)</label>
              <input type="text" id="card_title" value="${this.getVal('name', 'AKKU LADUNG')}">
            </div>
            <div class="row-col">
              <label>Einheit (z.B. % oder W)</label>
              <input type="text" id="card_unit" value="${this.getVal('unit', '%')}">
            </div>
          </div>
          
          <div class="row">
            <div class="row-col">
              <label>Sensor Entität</label>
              <div id="entity_picker"></div>
            </div>
          </div>

          <div class="row">
            <div class="row-col">
              <label>Min. Wert</label>
              <input type="number" id="card_min" value="${this.getVal('min', '0')}">
            </div>
            <div class="row-col">
              <label>Max. Wert</label>
              <input type="number" id="card_max" value="${this.getVal('max', '100')}">
            </div>
          </div>
          
          <div class="row">
            <div class="row-col" style="justify-content:center;">
               <label>Mehrfarbig? (Segmente)</label>
               <input type="checkbox" id="card_use_segments" ${this.getVal('use_segments') ? 'checked' : ''}>
            </div>
            <div class="row-col main-color-col" style="${this.getVal('use_segments') ? 'display:none;' : ''}">
              <label>Farbe (Einfarbig, Hex)</label>
              <input type="color" id="card_color" value="${this.getVal('color', '#05f0a0')}">
            </div>
          </div>
          
          <div id="segments_config" style="${this.getVal('use_segments') ? 'display:block;' : 'display:none;'} margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
            <h4 style="font-size:11px; margin-top:0; color:rgba(255,255,255,0.6); font-family:sans-serif; text-transform:uppercase;">Segment-Farben (von Unten nach Oben)</h4>
            <div class="row">
              <div class="row-col"><label>Startwert 1</label><input type="number" id="card_seg1_from" value="${this.getVal('seg1_from', 0)}"></div>
              <div class="row-col"><label>Farbe 1</label><input type="color" id="card_seg1_color" value="${this.getVal('seg1_color', '#f43f5e')}"></div>
            </div>
            <div class="row">
              <div class="row-col"><label>Startwert 2</label><input type="number" id="card_seg2_from" value="${this.getVal('seg2_from', 20)}"></div>
              <div class="row-col"><label>Farbe 2</label><input type="color" id="card_seg2_color" value="${this.getVal('seg2_color', '#05f0a0')}"></div>
            </div>
            <div class="row">
              <div class="row-col"><label>Startwert 3</label><input type="number" id="card_seg3_from" value="${this.getVal('seg3_from', 80)}"></div>
              <div class="row-col"><label>Farbe 3</label><input type="color" id="card_seg3_color" value="${this.getVal('seg3_color', '#a855f7')}"></div>
            </div>
          </div>

        </div>
      </div>
    `;

    this.updateSelectors();
    
    this.querySelector('#card_title').addEventListener('change', (e) => this.updateConfig('name', e.target.value));
    this.querySelector('#card_unit').addEventListener('change', (e) => this.updateConfig('unit', e.target.value));
    this.querySelector('#card_min').addEventListener('change', (e) => this.updateConfig('min', Number(e.target.value)));
    this.querySelector('#card_max').addEventListener('change', (e) => this.updateConfig('max', Number(e.target.value)));
    this.querySelector('#card_color').addEventListener('change', (e) => this.updateConfig('color', e.target.value));
    
    this.querySelector('#card_use_segments').addEventListener('change', (e) => {
        this.updateConfig('use_segments', e.target.checked);
        this.querySelector('#segments_config').style.display = e.target.checked ? 'block' : 'none';
        this.querySelector('.main-color-col').style.display = e.target.checked ? 'none' : 'flex';
    });
    this.querySelector('#card_seg1_from').addEventListener('change', (e) => this.updateConfig('seg1_from', Number(e.target.value)));
    this.querySelector('#card_seg1_color').addEventListener('change', (e) => this.updateConfig('seg1_color', e.target.value));
    this.querySelector('#card_seg2_from').addEventListener('change', (e) => this.updateConfig('seg2_from', Number(e.target.value)));
    this.querySelector('#card_seg2_color').addEventListener('change', (e) => this.updateConfig('seg2_color', e.target.value));
    this.querySelector('#card_seg3_from').addEventListener('change', (e) => this.updateConfig('seg3_from', Number(e.target.value)));
    this.querySelector('#card_seg3_color').addEventListener('change', (e) => this.updateConfig('seg3_color', e.target.value));
  }

  updateSelectors() {
    if (!this._hass) return;
    
    const div = this.querySelector('#entity_picker');
    if (!div) return;
    
    let sel = div.querySelector('ha-selector');
    if (!sel) {
        sel = document.createElement("ha-selector");
        sel.selector = { entity: {} };
        sel.addEventListener("value-changed", (e) => this.updateConfig('entity', e.detail.value));
        div.appendChild(sel);
    }
    
    sel.hass = this._hass;
    sel.value = this.getVal('entity');
  }
}

customElements.define("openkairo-gauge-card-editor", OpenKairoGaugeCardEditor);

class OpenKairoGaugeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getConfigElement() {
    return document.createElement("openkairo-gauge-card-editor");
  }

  static getStubConfig() {
    return {
      name: "AKKU LADUNG",
      entity: "",
      unit: "%",
      min: 0,
      max: 100,
      color: "#05f0a0",
      use_segments: false,
      seg1_from: 0,
      seg1_color: "#f43f5e",
      seg2_from: 20,
      seg2_color: "#05f0a0",
      seg3_from: 80,
      seg3_color: "#a855f7"
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Bitte wähle eine Entität aus');
    }
    this._config = Object.assign({}, OpenKairoGaugeCard.getStubConfig(), config);
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._gaugeObj) {
        this._gaugeObj.hass = hass;
    }
    this.updateDynamicColor();
  }

  updateDynamicColor() {
     if (!this._config || !this._hass) return;
     const stateObj = this._hass.states[this._config.entity];
     const val = stateObj ? parseFloat(stateObj.state) || 0 : 0;
     
     let c = this._config.color || '#05f0a0';
     if (this._config.use_segments) {
         const sf3 = this._config.seg3_from !== undefined ? this._config.seg3_from : 80;
         const sf2 = this._config.seg2_from !== undefined ? this._config.seg2_from : 20;
         if (val >= sf3) c = this._config.seg3_color || '#a855f7';
         else if (val >= sf2) c = this._config.seg2_color || '#05f0a0';
         else c = this._config.seg1_color || '#f43f5e';
     }

     const container = this.shadowRoot.getElementById('gauge-container-wrap');
     if (container) {
         container.style.setProperty('--dynamic-color', c);
         container.style.setProperty('--dynamic-glow-color', this.hexToRgba(c, 0.4));
     }
  }

  async render() {
    if (!this._config) return;

    const colorStr = this._config.color || '#05f0a0';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .container {
           background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(0,0,0,0.6));
           backdrop-filter: blur(15px) saturate(180%);
           -webkit-backdrop-filter: blur(15px) saturate(180%);
           border-radius: 28px;
           border: 1px solid rgba(255, 255, 255, 0.15);
           box-shadow: 0 12px 30px rgba(0,0,0,0.65), inset 0 0 15px rgba(255,255,255,0.05);
           padding: 20px;
           position: relative;
           transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .container::after {
           content: ''; position: absolute; inset: -1px; border-radius: 28px;
           border: 1px solid var(--dynamic-color); opacity: 0.25; pointer-events: none;
           transition: border-color 0.5s ease-in-out;
        }
        /* Override internal styles of gauge card via CSS variables */
        .wrapper {
           --ha-card-background: transparent !important;
           --ha-card-border-width: 0 !important;
           --ha-card-box-shadow: none !important;
           --gauge-color: var(--dynamic-color) !important;
           --primary-text-color: #fff !important;
        }
      </style>
      <div class="container" id="gauge-container-wrap" style="--dynamic-color: ${colorStr}; --dynamic-glow-color: ${this.hexToRgba(colorStr, 0.4)};">
         <div class="wrapper" id="gauge-container"></div>
      </div>
    `;

    const gaugeConfig = {
      type: 'gauge',
      entity: this._config.entity,
      name: this._config.name,
      unit: this._config.unit,
      min: this._config.min !== undefined ? this._config.min : 0,
      max: this._config.max !== undefined ? this._config.max : 100,
      needle: true
    };
    
    if (this._config.use_segments) {
         gaugeConfig.segments = [
            { from: this._config.seg1_from !== undefined ? this._config.seg1_from : 0, color: this._config.seg1_color || '#f43f5e' },
            { from: this._config.seg2_from !== undefined ? this._config.seg2_from : 20, color: this._config.seg2_color || '#05f0a0' },
            { from: this._config.seg3_from !== undefined ? this._config.seg3_from : 80, color: this._config.seg3_color || '#a855f7' }
         ];
    }

    const containerDiv = this.shadowRoot.getElementById('gauge-container');

    try {
        let card;
        if (window.loadCardHelpers) {
            const helpers = await window.loadCardHelpers();
            card = await helpers.createCardElement(gaugeConfig);
        } else {
            card = document.createElement('hui-gauge-card');
            card.setConfig(gaugeConfig);
        }
        
        // Dynamically inject styles into the shadow DOM of the ha-card inside the hui-gauge-card
        const checkShadowAndInject = () => {
             const haCard = card.shadowRoot ? card.shadowRoot.querySelector('ha-card') : null;
             if (haCard && !haCard.dataset.styledOpenKairo) {
                  haCard.dataset.styledOpenKairo = "true";
                  const style = document.createElement('style');
                  style.textContent = `
                      ha-card {
                          background: transparent !important;
                          border: none !important;
                          box-shadow: none !important;
                      }
                      svg {
                          filter: drop-shadow(0 0 8px var(--dynamic-glow-color));
                          transition: filter 0.5s ease-in-out;
                      }
                      .name {
                          font-family: 'Orbitron', sans-serif !important;
                          color: var(--dynamic-color) !important;
                          letter-spacing: 2px !important;
                          text-shadow: 0 0 10px var(--dynamic-glow-color);
                          font-size: 0.85rem !important;
                          font-weight: 700 !important;
                          padding-top: 10px;
                          transition: color 0.5s ease-in-out, text-shadow 0.5s ease-in-out;
                      }
                  `;
                  haCard.appendChild(style);
             } else if (!haCard) {
                  setTimeout(checkShadowAndInject, 50);
             }
        };
        checkShadowAndInject();

        if(this._hass) card.hass = this._hass;
        this._gaugeObj = card;

        containerDiv.appendChild(card);
    } catch (e) {
        containerDiv.innerHTML = '<div style="color:red; text-align:center;">Gauge Card Ladefehler</div>';
    }
  }

  hexToRgba(hex, alpha) {
      if(!hex) return 'rgba(5, 240, 160, 0.4)';
      let r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

customElements.define("openkairo-gauge-card", OpenKairoGaugeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-gauge-card",
  name: "OpenKAIRO Gauge Card",
  preview: true,
  description: "Futuristische Gauge Karte im OpenKAIRO Design."
});
