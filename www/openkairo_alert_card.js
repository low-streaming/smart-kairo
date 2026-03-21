
class OpenKairoAlertCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._config.operator) this._config.operator = '==';
    if (!this._config.color) this._config.color = '#f43f5e';

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
        .row { margin-bottom: 15px; display: flex; gap: 15px; align-items: flex-start; }
        .row-col { display: flex; flex-direction: column; flex: 1; }
        label { display: block; font-size: 10px; margin-bottom: 6px; color: rgba(255,255,255,0.6); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;}
        ha-selector { width: 100%; }
        input[type="color"] { -webkit-appearance: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; width: 32px; height: 32px; padding: 0; cursor: pointer; overflow: hidden; background: none;}
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 50%; }
        input[type="text"], select { background: rgba(0,0,0,0.2); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; width: 100%; box-sizing: border-box; font-family: sans-serif; }
      </style>
      <div class="card-config">
        
        <div class="group">
          <h3>Auslöse-Bedingung (Trigger)</h3>
          <div class="row">
            <div class="row-col" style="flex:2;">
              <label>Überwachte Entität</label>
              <div id="entity_picker"></div>
            </div>
          </div>
          <div class="row">
            <div class="row-col">
               <label>Wann soll Alarm auslösen?</label>
               <select id="card_operator">
                 <option value="==" ${this.getVal('operator') === '==' ? 'selected' : ''}>Ist genau (==)</option>
                 <option value="!=" ${this.getVal('operator') === '!=' ? 'selected' : ''}>Ist NICHT (!=)</option>
                 <option value="<" ${this.getVal('operator') === '<' ? 'selected' : ''}>Kleiner als (<)</option>
                 <option value=">" ${this.getVal('operator') === '>' ? 'selected' : ''}>Größer als (>)</option>
                 <option value="<=" ${this.getVal('operator') === '<=' ? 'selected' : ''}>Kleiner oder gleich (<=)</option>
                 <option value=">=" ${this.getVal('operator') === '>=' ? 'selected' : ''}>Größer oder gleich (>=)</option>
               </select>
            </div>
            <div class="row-col">
               <label>Zielwert (Zahl oder Text)</label>
               <input type="text" id="card_target_value" value="${this.getVal('target_value', '10')}" placeholder="z.B. 10 oder on">
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Inhalt des Banners</h3>
          <div class="row">
            <div class="row-col">
              <label>Haupt-Warntext (Fett)</label>
              <input type="text" id="card_title" value="${this.getVal('title', 'ACHTUNG')}" placeholder="z.B. Akku Kritisch">
            </div>
          </div>
          <div class="row">
            <div class="row-col">
              <label>Untertext (Optional Info)</label>
              <input type="text" id="card_subtitle" value="${this.getVal('subtitle', 'Bitte prüfen.')}" placeholder="Weitere Details...">
            </div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:2;">
              <label>Alarm-Icon</label>
              <div id="icon_picker"></div>
            </div>
            <div class="row-col" style="flex:1; align-items:center;">
              <label>Alert Farbe</label>
              <input type="color" id="card_color" value="${this.getVal('color', '#f43f5e')}">
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
    elIcon.value = this.getVal('icon', 'mdi:alert-circle');
    elIcon.addEventListener('value-changed', (e) => this.updateConfig('icon', e.detail.value));
    this.querySelector('#icon_picker').appendChild(elIcon);

    this.querySelector('#card_target_value').addEventListener('input', (e) => this.updateConfig('target_value', e.target.value));
    this.querySelector('#card_operator').addEventListener('change', (e) => this.updateConfig('operator', e.target.value));
    this.querySelector('#card_title').addEventListener('input', (e) => this.updateConfig('title', e.target.value));
    this.querySelector('#card_subtitle').addEventListener('input', (e) => this.updateConfig('subtitle', e.target.value));
    this.querySelector('#card_color').addEventListener('input', (e) => this.updateConfig('color', e.target.value));
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && !this._initialized) {
      this.renderForm();
      this._initialized = true;
    }
  }
}
customElements.define("openkairo-alert-editor", OpenKairoAlertCardEditor);


class OpenKairoAlertCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._isActive = false;      // The internal boolean state
    this._firstRender = true;
  }

  static getConfigElement() { return document.createElement("openkairo-alert-editor"); }

  static getStubConfig() {
    return {
      type: "custom:openkairo-alert-card",
      entity: "",
      operator: "<",
      target_value: "15",
      title: "BATTERIE WARNUNG",
      subtitle: "Die Batteriekapazität ist unter 15% gefallen.",
      icon: "mdi:battery-alert",
      color: "#f43f5e"
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Du musst eine Entität zur Überwachung auswählen!");
    }
    this._config = Object.assign({}, OpenKairoAlertCard.getStubConfig(), config);
    if (!this._rendered) {
        this.render();
        this._rendered = true;
    } else {
        this.updateContent();
    }
  }

  getValStr(key, def="") { return this._config && this._config[key] !== undefined ? this._config[key] : def; }

  hexToRgba(hex, alpha) {
      if(!hex) return 'rgba(244, 63, 94, 0.4)';
      if (hex.length === 4) hex = '#' + hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
      let r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  evaluateCondition(stateObj) {
      if (!stateObj) return false;
      const state = stateObj.state;
      const target = this.getValStr('target_value', '');
      const op = this.getValStr('operator', '==');
      
      const numState = parseFloat(state);
      const numTarget = parseFloat(target);
      const isNum = !isNaN(numState) && !isNaN(numTarget);

      const sL = state.toLowerCase();
      const tL = target.toLowerCase();

      if (op === '==') return (isNum && numState === numTarget) || sL === tL;
      if (op === '!=') return (isNum && numState !== numTarget) || sL !== tL;
      if (op === '>') return isNum ? numState > numTarget : false;
      if (op === '<') return isNum ? numState < numTarget : false;
      if (op === '>=') return isNum ? numState >= numTarget : false;
      if (op === '<=') return isNum ? numState <= numTarget : false;
      return false;
  }

  render() {
    const cStr = this.getValStr('color', '#f43f5e');
    const title = this.getValStr('title', 'ALARM');
    const subtitle = this.getValStr('subtitle', '');
    const icon = this.getValStr('icon', 'mdi:alert-circle');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          /* Important: Outer wrapper transitions height smoothly so other cards shift gracefully down */
          transition: height 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), margin-bottom 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease;
          overflow: hidden;
          height: 0px;
          opacity: 0;
          margin-bottom: 0;
        }

        :host(.is-active) {
            height: 90px;
            opacity: 1;
            margin-bottom: 15px; /* Spacing below the alert card when active */
        }

        ha-card {
           /* Dynamic Island Glassmorphism */
           background: rgba(10, 20, 28, 0.55);
           backdrop-filter: blur(20px) saturate(180%);
           -webkit-backdrop-filter: blur(20px) saturate(180%);
           border-radius: 45px;
           border: 1px solid rgba(255, 255, 255, 0.15);
           box-shadow: 0 15px 40px ${this.hexToRgba(cStr, 0.25)}, inset 0 0 20px rgba(255,255,255,0.05);
           padding: 15px 25px;
           position: relative;
           display: flex;
           flex-direction: row;
           align-items: center;
           justify-content: flex-start;
           box-sizing: border-box;
           height: 90px;
           transform: translateY(-30px) scale(0.95);
           transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        :host(.is-active) ha-card {
           transform: translateY(0px) scale(1);
        }

        ha-card::after {
            content: ''; position: absolute; inset: -1px; border-radius: 45px;
            border: 1px solid ${cStr}; opacity: 0.3;
            pointer-events: none;
        }

        /* Ambient spotlight gradient anchored behind the icon */
        .spotlight {
            position: absolute;
            top: 0; bottom: 0; left: 0; width: 200px;
            background: radial-gradient(ellipse at 15% 50%, ${this.hexToRgba(cStr, 0.35)} 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
            border-radius: 45px;
        }

        .icon-container {
            position: relative;
            z-index: 2;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.5));
            border: 1px solid rgba(255,255,255,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            box-shadow: 0 5px 25px ${this.hexToRgba(cStr, 0.5)}, inset 0 0 15px ${this.hexToRgba(cStr, 0.2)};
            flex-shrink: 0;
            /* Constant slight pulse for the alert ring */
            animation: ringPulse 2.5s infinite ease-in-out;
        }

        .icon-container::after {
            content: ''; position: absolute; inset: -1px; border-radius: 50%;
            border: 1px solid ${cStr}; opacity: 0.7; pointer-events: none;
        }

        @keyframes ringPulse {
            0% { box-shadow: 0 5px 25px ${this.hexToRgba(cStr, 0.3)}, inset 0 0 15px ${this.hexToRgba(cStr, 0.2)}; transform: scale(1); }
            50% { box-shadow: 0 5px 40px ${this.hexToRgba(cStr, 0.8)}, inset 0 0 20px ${this.hexToRgba(cStr, 0.3)}; transform: scale(1.03); }
            100% { box-shadow: 0 5px 25px ${this.hexToRgba(cStr, 0.3)}, inset 0 0 15px ${this.hexToRgba(cStr, 0.2)}; transform: scale(1); }
        }

        ha-icon {
            --mdc-icon-size: 26px;
            color: ${cStr};
            filter: drop-shadow(0 0 8px ${cStr}) drop-shadow(0 0 2px #fff);
        }

        .text-wrapper {
            display: flex;
            flex-direction: column;
            flex: 1;
            z-index: 2;
            justify-content: center;
        }

        .name {
            font-family: 'Orbitron', 'Inter', sans-serif;
            font-size: 0.85rem;
            color: #fff;
            letter-spacing: 1px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 2px 4px rgba(0,0,0,0.9);
        }

        .subtitle {
            font-family: 'Inter', sans-serif;
            font-size: 0.65rem;
            color: rgba(255,255,255,0.65);
            margin-top: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }
        
        /* Optional Dismiss logic on click */
        ha-card { cursor: pointer; }
      </style>
      
      <ha-card id="alert-card">
         <div class="spotlight"></div>
         <div class="icon-container">
            <ha-icon id="alert-icon" icon="${icon}"></ha-icon>
         </div>
         <div class="text-wrapper">
             <div class="name" id="alert-title">${title}</div>
             <div class="subtitle" id="alert-subtitle">${subtitle}</div>
         </div>
      </ha-card>
    `;

    // Click to dismiss functionality
    const card = this.shadowRoot.querySelector('ha-card');
    card.addEventListener('click', () => {
        // Manually collapse the card permanently until next condition trigger
        this.classList.remove('is-active');
        // We set a flag preventing it from re-appearing until the state toggles false->true again
        this._userDismissed = true;
    });
  }

  updateContent() {
      // Allows fast re-renders on config updates
      const nameEl = this.shadowRoot.getElementById('alert-title');
      const subEl = this.shadowRoot.getElementById('alert-subtitle');
      const iconEl = this.shadowRoot.getElementById('alert-icon');
      
      if(nameEl) nameEl.innerText = this.getValStr('title', 'ALARM');
      if(subEl) subEl.innerText = this.getValStr('subtitle', '');
      if(iconEl) iconEl.setAttribute('icon', this.getValStr('icon', 'mdi:alert-circle'));
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config || !this._config.entity) return;

    if (this._firstRender) {
        // Evaluate immediately exactly once to bypass animations if already active
        const stateObj = hass.states[this._config.entity];
        const isActive = this.evaluateCondition(stateObj);
        
        if (isActive) {
            this.classList.add('is-active');
            this._isActive = true;
        }
        // Force height CSS immediately by disabling transition
        this.style.transition = 'none';
        setTimeout(() => { this.style.transition = ''; }, 50);
        this._firstRender = false;
        return;
    }

    const stateObj = hass.states[this._config.entity];
    const isActive = this.evaluateCondition(stateObj);

    if (isActive !== this._isActive) {
        this._isActive = isActive;
        
        if (isActive) {
            // New trigger - reset dismiss flag and show
            this._userDismissed = false;
            this.classList.add('is-active');
        } else {
            // Condition no longer met, hide
            this._userDismissed = false;
            this.classList.remove('is-active');
        }
    } else if (isActive && !this._userDismissed) {
        // It's still active, make sure class is there
        this.classList.add('is-active');
    }
  }
}

customElements.define("openkairo-alert-card", OpenKairoAlertCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-alert-card",
  name: "OpenKAIRO Smart Alert Card",
  preview: true,
  description: "Ein dynamisches, unsichtbares Benachrichtigungsbanner ('Dynamic Island'), das bei Erfüllung einer Bedingung auftaucht."
});
