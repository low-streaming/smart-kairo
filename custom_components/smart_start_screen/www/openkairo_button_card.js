class OpenKairoButtonCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (this._hass && !this._initialized) {
        this.renderForm();
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
        .group { background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px; }
        h3 { margin-top: 0; margin-bottom: 15px; color: #05f0a0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; font-family: sans-serif; font-size: 12px; text-transform: uppercase; }
        .row { margin-bottom: 12px; display: flex; gap: 15px; align-items: center; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { display: block; font-size: 10px; margin-bottom: 4px; color: rgba(255,255,255,0.5); font-weight: bold; text-transform: uppercase; }
        ha-selector { width: 100%; }
        input[type="color"] { -webkit-appearance: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; width: 32px; height: 32px; padding: 0; cursor: pointer; overflow: hidden; background: none;}
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 50%; }
        input[type="text"], select { background: rgba(0,0,0,0.2); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; width: 100%; box-sizing: border-box; }
        input[type="checkbox"] { cursor: pointer; width: 16px; height: 16px; }
      </style>
      <div class="card-config">
        <div class="group">
          <h3>Button Einstellungen</h3>
          
          <div class="row">
            <div class="row-col">
              <label>Entität (Licht, Schalter, Skript...)</label>
              <div id="entity_picker"></div>
            </div>
          </div>
          
          <div class="row">
            <div class="row-col">
              <label>Anzeigename Oberschrift</label>
              <input type="text" id="card_name" value="${this.getVal('name', '')}" placeholder="Optionaler Name">
            </div>
          </div>

          <div class="row">
            <div class="row-col" style="flex:2;">
              <label>Icon</label>
              <div id="icon_picker"></div>
            </div>
            <div class="row-col" style="align-items:center; max-width:60px;">
              <label>Farbe</label>
              <input type="color" id="card_color" value="${this.getVal('color', '#05f0a0')}">
            </div>
            <div class="row-col" style="align-items:center; max-width:90px;">
              <label>Nur Puls?</label>
              <input type="checkbox" id="card_pulse" ${this.getVal('pulse_only') ? 'checked' : ''} title="Wenn aktiv, hat der Button keinen vollen Leuchthintergrund, sondern pulsiert nur dezent im Ring.">
            </div>
          </div>

        </div>
      </div>
    `;

    const elEntity = document.createElement("ha-selector");
    elEntity.selector = { entity: {} };
    elEntity.hass = this._hass;
    elEntity.value = this.getVal('entity');
    elEntity.addEventListener('value-changed', (e) => this.updateConfig('entity', e.detail.value));
    this.querySelector('#entity_picker').appendChild(elEntity);

    const elIcon = document.createElement("ha-selector");
    elIcon.selector = { icon: {} };
    elIcon.hass = this._hass;
    elIcon.value = this.getVal('icon');
    elIcon.addEventListener('value-changed', (e) => this.updateConfig('icon', e.detail.value));
    this.querySelector('#icon_picker').appendChild(elIcon);

    this.querySelector('#card_name').addEventListener('input', (e) => this.updateConfig('name', e.target.value));
    this.querySelector('#card_color').addEventListener('input', (e) => this.updateConfig('color', e.target.value));
    this.querySelector('#card_pulse').addEventListener('change', (e) => this.updateConfig('pulse_only', e.target.checked));
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && !this._initialized) {
      this.renderForm();
      this._initialized = true;
    }
  }
}
customElements.define("openkairo-button-editor", OpenKairoButtonCardEditor);


class OpenKairoButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._isActive = false;
  }

  static getConfigElement() { return document.createElement("openkairo-button-editor"); }

  static getStubConfig() {
    return {
      type: "custom:openkairo-button-card",
      entity: "",
      name: "",
      icon: "",
      color: "#05f0a0",
      pulse_only: false
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Du musst eine Entität für den Button auswählen!");
    }
    this._config = Object.assign({}, OpenKairoButtonCard.getStubConfig(), config);
    if (!this._rendered) {
        this.render();
        this._rendered = true;
    }
  }

  getValStr(key, def="") { return this._config && this._config[key] !== undefined ? this._config[key] : def; }

  hexToRgba(hex, alpha) {
      if(!hex) return 'rgba(5, 240, 160, 0.4)';
      if (hex.length === 4) hex = '#' + hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
      let r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  render() {
    const cStr = this.getValStr('color', '#05f0a0');
    const pulseOnly = this.getValStr('pulse_only', false);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          cursor: pointer;
        }
        ha-card {
           background: rgba(10, 20, 28, 0.45);
           backdrop-filter: blur(15px) saturate(180%);
           -webkit-backdrop-filter: blur(15px) saturate(180%);
           border-radius: 20px;
           border: 1px solid rgba(255, 255, 255, 0.08);
           box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(255,255,255,0.02);
           padding: 22px;
           position: relative;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
           overflow: hidden;
        }
        
        ha-card::after {
           content: ''; position: absolute; inset: -1px; border-radius: 20px;
           border: 2px solid ${cStr}; opacity: 0; pointer-events: none;
           transition: opacity 0.4s, border-width 0.4s;
        }

        /* Hover Effect */
        ha-card:hover {
            transform: translateY(-3px);
            background: rgba(20, 30, 38, 0.55);
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(255,255,255,0.05);
        }
        ha-card:active {
            transform: scale(0.96);
        }

        /* Glow Background Layer */
        .glow-bg {
            position: absolute;
            top: 50%; left: 50%;
            width: 0%; height: 0%;
            background: radial-gradient(circle, ${this.hexToRgba(cStr, pulseOnly ? 0.15 : 0.35)} 0%, transparent 70%);
            transform: translate(-50%, -50%);
            border-radius: 50%;
            transition: width 0.5s ease-out, height 0.5s ease-out, opacity 0.5s;
            opacity: 0;
            z-index: 0;
        }

        .icon-container {
            position: relative;
            z-index: 2;
            width: 55px;
            height: 55px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            transition: all 0.4s;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        }

        ha-icon {
            --mdc-icon-size: 28px;
            color: rgba(255,255,255,0.6);
            transition: all 0.4s;
        }

        .name {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.75rem;
            color: #fff;
            letter-spacing: 1.5px;
            font-weight: 700;
            z-index: 2;
            text-align: center;
            transition: text-shadow 0.4s, color 0.4s;
        }

        .state-text {
            font-family: sans-serif;
            font-size: 0.6rem;
            color: rgba(255,255,255,0.4);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
            z-index: 2;
            transition: color 0.4s;
        }

        /* ACTIVE STATE CLASSES */
        ha-card.state-on {
            border-color: ${this.hexToRgba(cStr, 0.4)};
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 0 20px ${this.hexToRgba(cStr, 0.1)};
        }
        ha-card.state-on::after {
            opacity: ${pulseOnly ? '0.4' : '0.8'};
            animation: ${pulseOnly ? 'glowPulse 2s infinite' : 'none'};
        }
        ha-card.state-on .glow-bg {
            width: 250%; height: 250%;
            opacity: 1;
        }
        ha-card.state-on .icon-container {
            background: ${this.hexToRgba(cStr, pulseOnly ? 0.1 : 0.2)};
            border-color: ${cStr};
            box-shadow: 0 0 20px ${this.hexToRgba(cStr, 0.5)}, inset 0 0 10px ${this.hexToRgba(cStr, 0.3)};
        }
        ha-card.state-on ha-icon {
            color: ${cStr};
            filter: drop-shadow(0 0 8px ${cStr});
            transform: scale(1.1);
        }
        ha-card.state-on .name {
            color: ${cStr};
            text-shadow: 0 0 10px ${this.hexToRgba(cStr, 0.6)};
        }
        ha-card.state-on .state-text {
            color: rgba(255,255,255,0.8);
        }

        @keyframes glowPulse {
            0% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.02); }
            100% { opacity: 0.3; transform: scale(1); }
        }
      </style>
      
      <ha-card id="button-card">
         <div class="glow-bg"></div>
         <div class="icon-container">
            <ha-icon id="button-icon" icon="mdi:help-circle-outline"></ha-icon>
         </div>
         <div class="name" id="button-name">LÄDT...</div>
         <div class="state-text" id="button-state">--</div>
      </ha-card>
    `;

    this.shadowRoot.querySelector('ha-card').addEventListener('click', () => {
        if (!this._config.entity || !this._hass) return;
        
        // Let's do a beautiful ripple/click animation
        const card = this.shadowRoot.querySelector('ha-card');
        card.style.transform = 'scale(0.92)';
        setTimeout(() => { card.style.transform = ''; }, 150);

        this._hass.callService("homeassistant", "toggle", {
            entity_id: this._config.entity
        });
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config || !this._config.entity) return;

    const stateObj = hass.states[this._config.entity];
    if (!stateObj) return;

    const cardName = this.shadowRoot.getElementById('button-name');
    const cardIcon = this.shadowRoot.getElementById('button-icon');
    const cardState = this.shadowRoot.getElementById('button-state');
    const cardWrap = this.shadowRoot.getElementById('button-card');

    if (!cardName || !cardIcon || !cardState || !cardWrap) return;

    // Resolve Name
    cardName.innerText = this._config.name || stateObj.attributes.friendly_name || this._config.entity.split('.')[1];

    // Resolve Icon
    let icon = this._config.icon;
    if (!icon) {
        icon = stateObj.attributes.icon; 
        if (!icon) {
             const domain = this._config.entity.split('.')[0];
             if (domain === 'light') icon = 'mdi:lightbulb';
             else if (domain === 'switch') icon = 'mdi:power-socket-eu';
             else if (domain === 'script') icon = 'mdi:script-text-outline';
             else icon = 'mdi:power';
        }
    }
    cardIcon.setAttribute('icon', icon);

    // Resolve State
    let isActive = false;
    const s = stateObj.state.toLowerCase();
    if (['on', 'playing', 'active', 'home', 'open'].includes(s)) {
        isActive = true;
    } else if (!isNaN(s) && parseFloat(s) > 0) {
        // z.B. bei Helligkeit oder Lautstärke
        isActive = true;
    }

    // Locale/Translating State loosely
    if (s === 'on') cardState.innerText = 'An';
    else if (s === 'off') cardState.innerText = 'Aus';
    else if (s === 'playing') cardState.innerText = 'Spielt';
    else if (s === 'paused') cardState.innerText = 'Pausiert';
    else if (s === 'unavailable') cardState.innerText = 'Offline';
    else cardState.innerText = stateObj.state;

    // Apply Active Classes
    if (isActive !== this._isActive) {
        this._isActive = isActive;
        if (isActive) {
            cardWrap.classList.add('state-on');
        } else {
            cardWrap.classList.remove('state-on');
        }
    }
  }
}

customElements.define("openkairo-button-card", OpenKairoButtonCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-button-card",
  name: "OpenKAIRO Button Card",
  preview: true,
  description: "Ein luxuriöser, interaktiver Button im OpenKAIRO Design für Lichter und Schalter."
});
