
class OpenKairoButtonCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (!this._config.layout) this._config.layout = 'vertical';
    if (!this._config.glow_style) this._config.glow_style = 'full';
    if (this._config.show_state === undefined) this._config.show_state = true;
    if (!this._config.click_action) this._config.click_action = 'toggle';

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
        input[type="checkbox"] { cursor: pointer; width: 18px; height: 18px; margin-top: 5px; }
      </style>
      <div class="card-config">
        
        <div class="group">
          <h3>Basis-Angaben</h3>
          <div class="row">
            <div class="row-col" style="flex:2;">
              <label>Entität (Licht, Schalter, Skript...)</label>
              <div id="entity_picker"></div>
            </div>
            <div class="row-col" style="flex:1;">
               <label>Klick-Aktion</label>
               <select id="card_click_action">
                 <option value="toggle" ${this.getVal('click_action') === 'toggle' ? 'selected' : ''}>Umschalten</option>
                 <option value="more-info" ${this.getVal('click_action') === 'more-info' ? 'selected' : ''}>Details (More-Info)</option>
               </select>
            </div>
          </div>
          
          <div class="row">
            <div class="row-col" style="flex:2;">
              <label>Überschrift</label>
              <input type="text" id="card_name" value="${this.getVal('name', '')}" placeholder="Optionaler Name">
            </div>
            <div class="row-col" style="flex:1;">
               <label>Zustand ("An/Aus")?</label>
               <div style="display:flex; align-items:center; gap:8px; height: 38px;">
                 <input type="checkbox" id="card_show_state" ${this.getVal('show_state') ? 'checked' : ''}>
               </div>
            </div>
          </div>
          
          <div class="row">
            <div class="row-col" style="flex:2;">
              <label>Icon überschreiben</label>
              <div id="icon_picker"></div>
            </div>
            <div class="row-col" style="flex:1; align-items:center;">
              <label>Leucht-Farbe</label>
              <input type="color" id="card_color" value="${this.getVal('color', '#05f0a0')}">
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Aussehen (Layout)</h3>
          <div class="row">
            <div class="row-col">
              <label>Karten-Format</label>
              <select id="card_layout">
                <option value="vertical" ${this.getVal('layout') === 'vertical' ? 'selected' : ''}>Quadratisch (Icon Oben, Text Unten)</option>
                <option value="horizontal" ${this.getVal('layout') === 'horizontal' ? 'selected' : ''}>Breite Listen-Ansicht (Icon Links)</option>
              </select>
            </div>
            <div class="row-col">
              <label>Leucht-Dynamik (Aktiv-Status)</label>
              <select id="card_glow_style">
                <option value="full" ${this.getVal('glow_style') === 'full' ? 'selected' : ''}>Voller Fokus-Glow (Neon)</option>
                <option value="minimal" ${this.getVal('glow_style') === 'minimal' ? 'selected' : ''}>Dezent (Nur Icon & weicher Rahmen)</option>
                <option value="pulse" ${this.getVal('glow_style') === 'pulse' ? 'selected' : ''}>Nur kurzer Puls beim Klick</option>
              </select>
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
    this.querySelector('#card_layout').addEventListener('change', (e) => this.updateConfig('layout', e.target.value));
    this.querySelector('#card_glow_style').addEventListener('change', (e) => this.updateConfig('glow_style', e.target.value));
    this.querySelector('#card_show_state').addEventListener('change', (e) => this.updateConfig('show_state', e.target.checked));
    this.querySelector('#card_click_action').addEventListener('change', (e) => this.updateConfig('click_action', e.target.value));
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
      layout: "vertical",
      glow_style: "full",
      show_state: true,
      click_action: "toggle"
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
    } else {
        this.render(); 
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

  fireHAEvent(type, detail) {
      const evt = new Event(type, { bubbles: true, cancelable: false, composed: true });
      evt.detail = detail;
      this.dispatchEvent(evt);
  }

  render() {
    const cStr = this.getValStr('color', '#05f0a0');
    const layout = this.getValStr('layout', 'vertical');
    const glowStyle = this.getValStr('glow_style', 'full');
    const showState = this.getValStr('show_state', true);
    
    // Layout specifics
    const isHoriz = layout === 'horizontal';
    const flexDir = isHoriz ? 'row' : 'column';
    const alignItems = isHoriz ? 'center' : 'center';
    const justifyContent = isHoriz ? 'flex-start' : 'center';
    const textAlign = isHoriz ? 'left' : 'center';
    const nameMargin = isHoriz ? '0 0 0 16px' : '12px 0 0 0';
    const iconMargin = isHoriz ? '0' : '0 0 4px 0';
    const padding = isHoriz ? '16px 22px' : '22px 18px';
    const wrapperFlex = isHoriz ? '1' : 'none';
    const cardRadius = isHoriz ? '18px' : '22px';

    // Spotlight Gradient Origin
    const spotOrigin = isHoriz ? 'left center' : 'top center';
    const gradientType = isHoriz ? 'element at 0% 50%' : 'ellipse at 50% 0%';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          cursor: pointer;
        }
        ha-card {
           background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), rgba(0,0,0,0.6));
           backdrop-filter: blur(15px) saturate(180%);
           -webkit-backdrop-filter: blur(15px) saturate(180%);
           border-radius: ${cardRadius};
           border: 1px solid rgba(255, 255, 255, 0.06);
           box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 15px rgba(255,255,255,0.03);
           padding: ${padding};
           position: relative;
           display: flex;
           flex-direction: ${flexDir};
           align-items: ${alignItems};
           justify-content: ${justifyContent};
           transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
           overflow: hidden;
           text-align: ${textAlign};
           box-sizing: border-box;
        }

        /* Hover Effect */
        ha-card:hover {
            transform: translateY(-2px);
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(0,0,0,0.6));
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 14px 35px rgba(0,0,0,0.7), inset 0 0 20px rgba(255,255,255,0.05);
        }
        ha-card:active {
            transform: scale(0.97);
        }

        /* Seamless Spotlight Layer (replaces the old ugly circle) */
        .glow-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(${isHoriz ? 'ellipse at 0% 50%' : 'ellipse at 50% 0%'}, ${this.hexToRgba(cStr, glowStyle === 'full' ? 0.25 : 0.08)} 0%, transparent ${isHoriz ? '70%' : '75%'});
            opacity: 0;
            transition: opacity 0.6s ease-in-out;
            pointer-events: none;
            z-index: 0;
        }

        .icon-container {
            position: relative;
            z-index: 2;
            width: ${isHoriz ? '46px' : '52px'};
            height: ${isHoriz ? '46px' : '52px'};
            border-radius: 50%;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: ${iconMargin};
            transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
            box-shadow: inset 0 2px 10px rgba(255,255,255,0.05);
            flex-shrink: 0;
        }

        ha-icon {
            --mdc-icon-size: ${isHoriz ? '22px' : '26px'};
            color: rgba(255,255,255,0.7);
            transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .text-wrapper {
            display: flex;
            flex-direction: column;
            margin: ${nameMargin};
            flex: ${wrapperFlex};
            z-index: 2;
            justify-content: center;
        }

        .name {
            font-family: 'Orbitron', 'Inter', sans-serif;
            font-size: ${isHoriz ? '0.8rem' : '0.75rem'};
            color: #fff;
            letter-spacing: 1px;
            font-weight: 700;
            transition: text-shadow 0.4s, color 0.4s;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .state-text {
            font-family: 'Inter', sans-serif;
            font-size: 0.6rem;
            color: rgba(255,255,255,0.4);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            margin-top: ${isHoriz ? '3px' : '6px'};
            transition: color 0.4s, text-shadow 0.4s;
            display: ${showState ? 'block' : 'none'};
        }

        /* ACTIVE STATE PROFILES */
        
        ha-card.state-on {
            border-color: ${glowStyle === 'pulse' ? 'rgba(255, 255, 255, 0.15)' : this.hexToRgba(cStr, 0.35)};
            box-shadow: 0 15px 40px ${this.hexToRgba(cStr, 0.15)}, inset 0 0 25px ${this.hexToRgba(cStr, glowStyle==='full'?0.12:0.02)};
        }
        
        ha-card.state-on .glow-bg {
            opacity: ${glowStyle === 'pulse' ? '0' : '1'};
        }
        
        ha-card.state-on .icon-container {
            background: ${glowStyle === 'pulse' ? 'rgba(255,255,255,0.05)' : this.hexToRgba(cStr, 0.15)};
            border-color: ${glowStyle === 'pulse' ? 'rgba(255,255,255,0.2)' : cStr};
            box-shadow: 0 0 25px ${glowStyle !== 'pulse' ? this.hexToRgba(cStr, 0.6) : 'rgba(0,0,0,0)'}, inset 0 0 15px ${glowStyle !== 'pulse' ? this.hexToRgba(cStr, 0.4) : 'rgba(255,255,255,0.1)'};
            transform: ${glowStyle === 'pulse' ? 'scale(1)' : 'scale(1.05)'};
        }
        
        ha-card.state-on ha-icon {
            color: ${glowStyle === 'pulse' ? 'rgba(255,255,255,0.9)' : cStr};
            filter: ${glowStyle === 'pulse' ? 'none' : `drop-shadow(0 0 8px ${cStr}) drop-shadow(0 0 2px #fff)`};
        }
        
        ha-card.state-on .name {
            color: ${glowStyle === 'full' ? '#fff' : (glowStyle === 'pulse' ? '#fff' : cStr)};
            text-shadow: ${glowStyle === 'pulse' ? 'none' : `0 0 12px ${this.hexToRgba(cStr, 0.6)}`};
        }
        
        ha-card.state-on .state-text {
            color: ${glowStyle === 'pulse' ? 'rgba(255,255,255,0.6)' : this.hexToRgba(cStr, 0.9)};
            text-shadow: ${glowStyle === 'pulse' ? 'none' : `0 0 8px ${this.hexToRgba(cStr, 0.5)}`};
        }
        
        /* PULSE ANIMATION OVERRIDE */
        .pulse-anim .glow-bg {
             animation: spotlightPulse 1s ease-out;
             opacity: 1 !important;
        }

        @keyframes spotlightPulse {
            0% { opacity: 0; }
            20% { opacity: 0.8; }
            100% { opacity: 0; }
        }
      </style>
      
      <ha-card id="button-card">
         <div class="glow-bg" id="glow-anim"></div>
         <div class="icon-container">
            <ha-icon id="button-icon" icon="mdi:help-circle-outline"></ha-icon>
         </div>
         <div class="text-wrapper">
             <div class="name" id="button-name">LÄDT...</div>
             <div class="state-text" id="button-state">--</div>
         </div>
      </ha-card>
    `;

    const card = this.shadowRoot.querySelector('ha-card');
    let timer = null;

    card.addEventListener('pointerdown', () => {
        timer = setTimeout(() => {
            if (this.getValStr('click_action', 'toggle') !== 'more-info') {
                 this.fireHAEvent('hass-more-info', { entityId: this._config.entity });
            }
            timer = null;
        }, 500); 
    });

    card.addEventListener('pointerup', () => {
        if (timer) {
            clearTimeout(timer);
            this.executeAction();
            timer = null;
        }
    });
    
    card.addEventListener('pointerleave', () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    });
  }

  executeAction() {
        if (!this._config.entity || !this._hass) return;
        
        const card = this.shadowRoot.querySelector('ha-card');
        card.style.transform = 'scale(0.94)';
        setTimeout(() => { card.style.transform = ''; }, 120);

        if (this.getValStr('glow_style', 'full') === 'pulse') {
             const animDiv = this.shadowRoot.getElementById('glow-anim');
             card.classList.remove('pulse-anim');
             void animDiv.offsetWidth; 
             card.classList.add('pulse-anim');
             setTimeout(() => { card.classList.remove('pulse-anim') }, 1000);
        }

        const action = this.getValStr('click_action', 'toggle');
        if (action === 'more-info') {
             this.fireHAEvent('hass-more-info', { entityId: this._config.entity });
        } else {
             this._hass.callService("homeassistant", "toggle", {
                 entity_id: this._config.entity
             });
        }
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

    cardName.innerText = this._config.name || stateObj.attributes.friendly_name || this._config.entity.split('.')[1];

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

    let isActive = false;
    const s = stateObj.state.toLowerCase();
    if (['on', 'playing', 'active', 'home', 'open'].includes(s)) {
        isActive = true;
    } else if (!isNaN(s) && parseFloat(s) > 0) {
        isActive = true;
    }

    if (s === 'on') cardState.innerText = 'Eingeschaltet';
    else if (s === 'off') cardState.innerText = 'Ausgeschaltet';
    else if (s === 'playing') cardState.innerText = 'Spielt';
    else if (s === 'paused') cardState.innerText = 'Pausiert';
    else if (s === 'unavailable') cardState.innerText = 'Offline';
    else {
         let u = stateObj.attributes.unit_of_measurement || '';
         cardState.innerText = stateObj.state + (u ? ' ' + u : '');
    }

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
  description: "Ein luxuriöser, hoch anpassbarer Button im OpenKAIRO OS Design für Lichter, Schalter und mehr."
});
