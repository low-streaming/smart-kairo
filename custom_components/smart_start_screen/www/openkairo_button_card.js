class OpenKairoButtonCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({}, config);
    if (this._config.show_state === undefined) this._config.show_state = true;
    if (this._config.show_switch === undefined) this._config.show_switch = false;
    if (!this._config.click_action) this._config.click_action = 'toggle';
    if (!this._config.double_tap_action) this._config.double_tap_action = 'none';
    if (!this._config.hold_action) this._config.hold_action = 'more-info';
    if (this._config.hold_to_unlock === undefined) this._config.hold_to_unlock = false;
    if (this._config.live_animation === undefined) this._config.live_animation = true;
    if (this._config.slide_to_dim === undefined) this._config.slide_to_dim = false;

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
          <h3>Basis Setup</h3>
          <div class="row">
            <div class="row-col" style="flex:2;">
              <label>Haupt-Entität (Licht, Schalter...)</label>
              <div id="entity_picker"></div>
            </div>
          </div>
          <div class="row">
            <div class="row-col" style="flex:2;"><label>Name</label><input type="text" id="card_name" value="${this.getVal('name', '')}" placeholder="Optionaler Name"></div>
            <div class="row-col" style="flex:2;"><label>Icon</label><div id="icon_picker"></div></div>
            <div class="row-col" style="flex:1;"><label>Farbe</label><input type="color" id="card_color" value="${this.getVal('color', '#05f0a0')}"></div>
          </div>
          <div class="row">
             <div class="row-col"><label>Format</label>
               <select id="card_layout">
                  <option value="vertical" ${this.getVal('layout') === 'vertical' ? 'selected' : ''}>Vertikal (Quadrat)</option>
                  <option value="horizontal" ${this.getVal('layout') === 'horizontal' ? 'selected' : ''}>Horizontal (Liste)</option>
               </select>
             </div>
             <div class="row-col"><label>Glow Style</label>
               <select id="card_glow_style">
                  <option value="full" ${this.getVal('glow_style') === 'full' ? 'selected' : ''}>Full Glow</option>
                  <option value="minimal" ${this.getVal('glow_style') === 'minimal' ? 'selected' : ''}>Minimal</option>
                  <option value="pulse" ${this.getVal('glow_style') === 'pulse' ? 'selected' : ''}>Only Pulse</option>
               </select>
             </div>
          </div>
        </div>

        <div class="group">
          <h3>Aktionen & Sicherheit</h3>
          <div class="row">
            <div class="row-col">
              <label>1-Klick (Tap)</label>
              <select id="card_click_action">
                <option value="toggle" ${this.getVal('click_action') === 'toggle' ? 'selected' : ''}>Umschalten (Toggle)</option>
                <option value="more-info" ${this.getVal('click_action') === 'more-info' ? 'selected' : ''}>More Info</option>
              </select>
            </div>
            <div class="row-col">
              <label>2-Klick (Double Tap)</label>
              <select id="card_double_tap_action">
                <option value="none" ${this.getVal('double_tap_action') === 'none' ? 'selected' : ''}>Keine</option>
                <option value="toggle" ${this.getVal('double_tap_action') === 'toggle' ? 'selected' : ''}>Umschalten</option>
                <option value="more-info" ${this.getVal('double_tap_action') === 'more-info' ? 'selected' : ''}>More Info</option>
              </select>
            </div>
            <div class="row-col">
              <label>Halten (Hold)</label>
              <select id="card_hold_action">
                <option value="none" ${this.getVal('hold_action') === 'none' ? 'selected' : ''}>Keine</option>
                <option value="toggle" ${this.getVal('hold_action') === 'toggle' ? 'selected' : ''}>Umschalten</option>
                <option value="more-info" ${this.getVal('hold_action') === 'more-info' ? 'selected' : ''}>More Info</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div style="display:flex; gap:10px; align-items:center;">
               <input type="checkbox" id="card_hold_to_unlock" ${this.getVal('hold_to_unlock') ? 'checked' : ''}>
               <div style="font-size:12px; color:white;"><b>Sicherheitssperre:</b> Button muss 1,5s gehalten werden, um Klick auszulösen.</div>
            </div>
          </div>
        </div>

        <div class="group">
          <h3>Super-Funktionen (Extras)</h3>
          <div class="row">
             <div class="row-col" style="flex:1;">
               <label>Sensor Badge (Watt, Temp...)</label>
               <div id="badge_entity_picker"></div>
             </div>
          </div>
          <div class="row" style="flex-wrap: wrap; gap: 20px;">
             <div style="display:flex; gap:10px; align-items:center; width:100%;">
               <input type="checkbox" id="card_show_state" ${this.getVal('show_state') ? 'checked' : ''}>
               <div style="font-size:12px; color:white;">Status-Text anzeigen (An/Aus)</div>
             </div>
             <div style="display:flex; gap:10px; align-items:center; width:100%;">
               <input type="checkbox" id="card_show_switch" ${this.getVal('show_switch') ? 'checked' : ''}>
               <div style="font-size:12px; color:white;">Sci-Fi Schalter-Toggle rechts anzeigen</div>
             </div>
             <div style="display:flex; gap:10px; align-items:center; width:100%;">
               <input type="checkbox" id="card_live_animation" ${this.getVal('live_animation') ? 'checked' : ''}>
               <div style="font-size:12px; color:white;"><b>Live-Icon Animation:</b> Ventilatoren drehen sich, wenn eingeschaltet.</div>
             </div>
             <div style="display:flex; gap:10px; align-items:center; width:100%;">
               <input type="checkbox" id="card_slide_to_dim" ${this.getVal('slide_to_dim') ? 'checked' : ''}>
               <div style="font-size:12px; color:white;"><b>Wisch-Gesten:</b> Nach links/rechts wischen, um z.B. Helligkeit von Lampen zu dimmen.</div>
             </div>
          </div>
        </div>

      </div>
    `;

    const createSel = (id, type) => {
       const el = document.createElement("ha-selector");
       el.selector = type === 'entity' ? { entity: {} } : { icon: {} };
       el.hass = this._hass;
       el.value = this.getVal(id);
       el.addEventListener('value-changed', (e) => this.updateConfig(id, e.detail.value));
       this.querySelector(`#${id}_picker`).appendChild(el);
    };

    createSel('entity', 'entity');
    createSel('badge_entity', 'entity');
    createSel('icon', 'icon');

    const binds = ['card_name', 'card_color', 'card_layout', 'card_glow_style', 'card_click_action', 'card_double_tap_action', 'card_hold_action'];
    binds.forEach(id => {
       const el = this.querySelector(`#${id}`);
       if(el) el.addEventListener(el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change', (e) => this.updateConfig(id.replace('card_', ''), e.target.value));
    });

    const checks = ['card_show_state', 'card_show_switch', 'card_hold_to_unlock', 'card_live_animation', 'card_slide_to_dim'];
    checks.forEach(id => {
       const el = this.querySelector(`#${id}`);
       if(el) el.addEventListener('change', (e) => this.updateConfig(id.replace('card_', ''), e.target.checked));
    });
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
    this._touchOriginX = null;
    this._clickCount = 0;
    this._clickTimer = null;
    this._holdTimer = null;
    this._unlocking = false;
    this._isSliding = false;
    this._currentBrightness = 0;
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
      show_switch: false,
      click_action: "toggle",
      double_tap_action: "none",
      hold_action: "more-info",
      hold_to_unlock: false,
      live_animation: true,
      slide_to_dim: false,
      badge_entity: ""
    };
  }

  setConfig(config) {
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
    const showSwitch = this.getValStr('show_switch', false);
    
    // Layout specifics
    const isHoriz = layout === 'horizontal';
    const flexDir = isHoriz ? 'row' : 'column';
    const alignItems = isHoriz ? 'center' : 'center';
    const justifyContent = isHoriz ? 'flex-start' : 'center';
    const textAlign = isHoriz ? 'left' : 'center';
    const nameMargin = isHoriz ? '0 0 0 16px' : '15px 0 0 0';
    const padding = isHoriz ? '16px 22px' : '22px 18px';
    const wrapperFlex = isHoriz ? '1' : 'none';
    const cardRadius = isHoriz ? '20px' : '24px';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: pan-y; }
        
        ha-card {
           background: rgba(10, 20, 28, 0.45);
           backdrop-filter: blur(15px) saturate(180%);
           -webkit-backdrop-filter: blur(15px) saturate(180%);
           border-radius: ${cardRadius};
           border: 1px solid rgba(255, 255, 255, 0.1);
           box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6);
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

        /* Progress Bar for Dimmer Slider */
        .slider-bg {
            position: absolute; left: 0; bottom: 0; top: 0; width: 0%;
            background: linear-gradient(90deg, ${this.hexToRgba(cStr, 0.05)}, ${this.hexToRgba(cStr, 0.25)});
            pointer-events: none; z-index: 1; transition: width 0.1s linear; opacity: 0;
        }

        /* Unlock Progress Ring Layer */
        .unlock-ring {
            position: absolute; inset: -4px; border-radius: 50%;
            border: 3px solid transparent; 
            border-top-color: ${cStr}; border-right-color: ${cStr};
            opacity: 0; transform: rotate(0deg); pointer-events: none;
            transition: opacity 0.3s; z-index: 5;
        }
        .unlocking .unlock-ring {
            opacity: 1; animation: spinUnlock 1.5s linear forwards;
        }
        @keyframes spinUnlock { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        ha-card::after {
            content: ''; position: absolute; inset: -1px; border-radius: ${cardRadius};
            border: 1px solid ${cStr}; opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
        }

        ha-card:hover { transform: translateY(-2px); background: rgba(20, 30, 38, 0.55); border-color: rgba(255, 255, 255, 0.15); }
        ha-card:active:not(.is-sliding) { transform: scale(0.97); }
        ha-card.is-sliding { transform: scale(1.02); box-shadow: 0 15px 40px rgba(0,0,0,0.8); }

        .icon-container {
            position: relative; z-index: 2; width: ${isHoriz ? '46px' : '56px'}; height: ${isHoriz ? '46px' : '56px'};
            border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(0,0,0,0.5));
            border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
            transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); box-shadow: 0 5px 15px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.05);
            flex-shrink: 0;
        }
        .icon-container::after {
            content: ''; position: absolute; inset: -1px; border-radius: 50%; border: 1px solid ${cStr}; opacity: 0; 
            pointer-events: none; transition: opacity 0.5s ease-in-out;
        }

        /* Badge Styling */
        .sensor-badge {
            position: absolute; top: -5px; right: -10px; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
            border: 1px solid ${this.hexToRgba(cStr, 0.5)}; color: white; font-family: 'Orbitron', sans-serif;
            font-size: 0.55rem; font-weight: 900; padding: 2px 6px; border-radius: 10px; z-index: 10;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5), 0 0 10px ${this.hexToRgba(cStr, 0.3)}; display: none;
        }

        ha-icon {
            --mdc-icon-size: ${isHoriz ? '22px' : '28px'}; color: rgba(255,255,255,0.4); transition: all 0.5s;
        }

        /* LIVE ANIMATIONS */
        @keyframes animFan { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes animShake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes animPulse { 0% { transform: scale(1); opacity:1;} 50% { transform: scale(1.1); opacity:0.8;} 100% { transform: scale(1); opacity:1;} }
        
        .live-anim-fan { animation: animFan 1.5s linear infinite; }
        .live-anim-shake { animation: animShake 0.4s ease-in-out infinite; }
        .live-anim-pulse { animation: animPulse 2s ease-in-out infinite; }

        .text-wrapper { display: flex; flex-direction: column; margin: ${nameMargin}; flex: ${wrapperFlex}; z-index: 2; justify-content: center; min-width: 0; }
        .name { font-family: 'Orbitron', 'Inter', sans-serif; font-size: 0.8rem; color: #fff; letter-spacing: 1px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
        .state-text { font-family: 'Inter', sans-serif; font-size: 0.6rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: ${isHoriz ? '3px' : '6px'}; transition: color 0.4s; display: ${showState ? 'block' : 'none'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* ACTIVE STATE PROFILES */
        ha-card.state-on { box-shadow: 0 15px 40px ${glowStyle === 'full' ? this.hexToRgba(cStr, 0.18) : '0 8px 32px 0 rgba(0, 0, 0, 0.6)'}; border-color: rgba(255, 255, 255, 0.15); }
        ha-card.state-on::after { opacity: ${glowStyle === 'full' ? '0.2' : '0'}; }
        
        ha-card.state-on .icon-container { box-shadow: 0 5px 25px ${glowStyle !== 'pulse' ? this.hexToRgba(cStr, 0.5) : 'rgba(0,0,0,0.5)'}, inset 0 0 15px ${glowStyle !== 'pulse' ? this.hexToRgba(cStr, 0.2) : 'rgba(255,255,255,0.05)'}; transform: ${glowStyle === 'pulse' ? 'scale(1)' : 'scale(1.05)'}; }
        ha-card.state-on .icon-container::after { opacity: ${glowStyle === 'pulse' ? '0' : '0.5'}; }
        ha-card.state-on ha-icon { color: ${glowStyle === 'pulse' ? 'rgba(255,255,255,0.8)' : cStr}; filter: ${glowStyle === 'pulse' ? 'none' : `drop-shadow(0 0 8px ${cStr}) drop-shadow(0 0 2px #fff)`}; }
        ha-card.state-on .state-text { color: ${glowStyle === 'pulse' ? 'rgba(255,255,255,0.6)' : this.hexToRgba(cStr, 0.9)}; text-shadow: ${glowStyle === 'pulse' ? 'none' : `0 0 8px ${this.hexToRgba(cStr, 0.4)}`}; }
        ha-card.state-on .slider-bg { opacity: 1; }

        /* SCI-FI SWITCH TOGGLE */
        .kairo-switch {
           position: relative; width: 44px; height: 24px; border-radius: 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);
           box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); transition: all 0.3s; flex-shrink: 0; display: ${showSwitch ? 'block' : 'none'};
           margin: ${isHoriz ? '0 0 0 auto' : '15px auto 0 auto'}; z-index: 3;
        }
        .kairo-switch::after {
           content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%;
           background: rgba(255,255,255,0.3); box-shadow: 0 2px 4px rgba(0,0,0,0.5); transition: all 0.3s;
        }
        ha-card.state-on .kairo-switch { background: ${this.hexToRgba(cStr, 0.15)}; border-color: ${this.hexToRgba(cStr, 0.5)}; }
        ha-card.state-on .kairo-switch::after { left: 22px; background: ${cStr}; box-shadow: 0 0 10px ${cStr}, 0 0 5px #fff; }
        
        /* OVERRIDE FOR SECURITY SUCCESS */
        ha-card.unlock-success .icon-container { background: rgba(5, 240, 160, 0.3) !important; border-color: #05f0a0 !important; }
        ha-card.unlock-success ha-icon { color: #05f0a0 !important; filter: drop-shadow(0 0 10px #05f0a0) !important; }

        /* LIGHT MODE OVERRIDES */
        ha-card.light-mode {
            background: rgba(255, 255, 255, 0.65);
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }
        ha-card.light-mode .name {
            color: #1a1a1a;
            text-shadow: none;
            font-weight: 900;
        }
        ha-card.light-mode .state-text {
            color: rgba(0,0,0,0.6);
        }
        ha-card.light-mode .icon-container {
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(0,0,0,0.03));
            border: 1px solid rgba(0,0,0,0.1);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1), inset 0 0 10px rgba(255,255,255,1);
        }
        ha-card.light-mode ha-icon {
            color: rgba(0,0,0,0.4);
        }
        ha-card.light-mode .kairo-switch {
            background: rgba(0,0,0,0.1);
            border-color: rgba(0,0,0,0.15);
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
        }
        ha-card.light-mode.state-on .kairo-switch {
            background: ${this.hexToRgba(cStr, 0.15)};
            border-color: ${this.hexToRgba(cStr, 0.5)};
        }
        ha-card.light-mode.state-on .state-text {
            color: ${glowStyle === 'pulse' ? 'rgba(0,0,0,0.6)' : cStr};
        }
        ha-card.light-mode.state-on .icon-container {
            box-shadow: 0 5px 25px ${this.hexToRgba(cStr, 0.3)}, inset 0 0 15px ${this.hexToRgba(cStr, 0.1)};
            border-color: ${this.hexToRgba(cStr, 0.3)};
        }
        ha-card.light-mode .slider-bg {
            background: linear-gradient(90deg, ${this.hexToRgba(cStr, 0.1)}, ${this.hexToRgba(cStr, 0.4)});
        }
        ha-card.light-mode .sensor-badge {
            background: rgba(255,255,255,0.9);
            color: #1a1a1a;
            border-color: rgba(0,0,0,0.1);
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            text-shadow: none;
        }
      </style>
      
      <ha-card id="button-card">
         <div class="slider-bg" id="slider-bg"></div>
         <div class="icon-container" id="icon-anim">
            <div class="unlock-ring"></div>
            <div class="sensor-badge" id="sensor-badge"></div>
            <ha-icon id="button-icon" icon="mdi:help-circle-outline"></ha-icon>
         </div>
         <div class="text-wrapper">
             <div class="name" id="button-name">LÄDT...</div>
             <div class="state-text" id="button-state">--</div>
         </div>
         <div class="kairo-switch" id="button-switch"></div>
      </ha-card>
    `;

    this._setupInteractions();
  }

  _setupInteractions() {
      const card = this.shadowRoot.querySelector('ha-card');
      const holdToUnlock = this.getValStr('hold_to_unlock', false);
      const slideToDim = this.getValStr('slide_to_dim', false);

      card.addEventListener('pointerdown', (e) => {
          this._touchOriginX = e.clientX;
          this._isSliding = false;
          
          if (holdToUnlock) {
              this._unlocking = true;
              card.classList.add('unlocking');
              this._holdTimer = setTimeout(() => {
                  if (this._unlocking) {
                      this._unlockSuccess();
                  }
              }, 1500); // 1.5s hold to unlock
          } else {
              this._holdTimer = setTimeout(() => {
                  this._isSliding = false;
                  if (!this._isSliding) this._fireAction('hold');
                  this._holdTimer = null;
              }, 600);
          }
      });

      card.addEventListener('pointermove', (e) => {
          if (!this._touchOriginX) return;
          const deltaX = e.clientX - this._touchOriginX;
          
          if (Math.abs(deltaX) > 15) {
              if (holdToUnlock && this._unlocking) {
                   this._cancelHold(); // cancel if sliding during unlock
              }
              if (slideToDim && !holdToUnlock) {
                  this._isSliding = true;
                  card.classList.add('is-sliding');
                  this._handleSlide(e.clientX, card);
                  if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
              }
          }
      });

      card.addEventListener('pointerup', (e) => {
          const wasSliding = this._isSliding;
          if (holdToUnlock) {
              this._cancelHold(); // If user released before 1.5s, it cancels.
          } else {
              if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
              if (wasSliding) {
                   this._commitSlide();
              } else {
                   this._handleClick();
              }
          }
          this._touchOriginX = null;
          this._isSliding = false;
          card.classList.remove('is-sliding');
      });

      card.addEventListener('pointerleave', (e) => {
          this._cancelHold();
          if (this._isSliding) {
              this._commitSlide();
          }
          this._touchOriginX = null;
          this._isSliding = false;
          card.classList.remove('is-sliding');
      });
  }

  _cancelHold() {
      this._unlocking = false;
      const card = this.shadowRoot.querySelector('ha-card');
      if (card) card.classList.remove('unlocking');
      if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
  }

  _unlockSuccess() {
      if (!this._unlocking) return;
      this._cancelHold();
      
      const card = this.shadowRoot.querySelector('ha-card');
      card.classList.add('unlock-success');
      navigator.vibrate && navigator.vibrate(50);
      
      this._fireAction('tap'); // execute primary action instantly
      
      setTimeout(() => {
          const c = this.shadowRoot.querySelector('ha-card');
          if (c) c.classList.remove('unlock-success');
      }, 500);
  }

  _handleSlide(clientX, card) {
      if (!this._config.entity || !this._hass) return;
      const domain = this._config.entity.split('.')[0];
      if (domain !== 'light') return; // only lights support robust brightness pct

      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      let pct = Math.round((x / rect.width) * 100);
      if (pct < 5) pct = 0;
      if (pct > 95) pct = 100;
      
      this._currentBrightness = pct;
      const sliderBg = this.shadowRoot.getElementById('slider-bg');
      if (sliderBg) {
          sliderBg.style.width = pct + '%';
          sliderBg.style.opacity = '1';
      }
      
      const stateEl = this.shadowRoot.getElementById('button-state');
      if (stateEl) stateEl.innerText = `Dimmer: ${pct}%`;
  }

  _commitSlide() {
      if (!this._config.entity || !this._hass) return;
      const domain = this._config.entity.split('.')[0];
      if (domain !== 'light') return;

      if (this._currentBrightness === 0) {
          this._hass.callService("light", "turn_off", { entity_id: this._config.entity });
      } else {
          this._hass.callService("light", "turn_on", { entity_id: this._config.entity, brightness_pct: this._currentBrightness });
      }
  }

  _handleClick() {
      this._clickCount++;
      if (this._clickCount === 1) {
          this._clickTimer = setTimeout(() => {
              this._clickCount = 0;
              this._fireAction('tap');
          }, 250); 
      } else if (this._clickCount === 2) {
          clearTimeout(this._clickTimer);
          this._clickCount = 0;
          this._fireAction('double_tap');
      }
  }

  _fireAction(type) {
      if (!this._config.entity || !this._hass) return;

      let actionConf = 'none';
      if (type === 'tap') actionConf = this.getValStr('click_action', 'toggle');
      else if (type === 'double_tap') actionConf = this.getValStr('double_tap_action', 'none');
      else if (type === 'hold') actionConf = this.getValStr('hold_action', 'more-info');

      if (actionConf === 'none') return;
      
      if (actionConf === 'more-info') {
          this.fireHAEvent('hass-more-info', { entityId: this._config.entity });
      } else if (actionConf === 'toggle') {
          this._hass.callService("homeassistant", "toggle", { entity_id: this._config.entity });
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
    const badgeEl = this.shadowRoot.getElementById('sensor-badge');
    const sliderBg = this.shadowRoot.getElementById('slider-bg');

    if (!cardName || !cardIcon || !cardState || !cardWrap) return;

    const domain = this._config.entity.split('.')[0];

    cardName.innerText = this._config.name || stateObj.attributes.friendly_name || this._config.entity.split('.')[1];

    let icon = this._config.icon || stateObj.attributes.icon;
    if (!icon) {
         if (domain === 'light') icon = 'mdi:lightbulb';
         else if (domain === 'switch') icon = 'mdi:power-socket-eu';
         else if (domain === 'fan') icon = 'mdi:fan';
         else if (domain === 'script') icon = 'mdi:script-text-outline';
         else icon = 'mdi:power';
    }
    cardIcon.setAttribute('icon', icon);

    let isActive = false;
    const s = stateObj.state.toLowerCase();
    if (['on', 'playing', 'active', 'home', 'open', 'unlocked'].includes(s)) {
        isActive = true;
    } else if (!isNaN(s) && parseFloat(s) > 0) {
        isActive = true;
    }

    // Set State Text
    if (!this._isSliding) {
        if (s === 'on') cardState.innerText = 'Eingeschaltet';
        else if (s === 'off') cardState.innerText = 'Ausgeschaltet';
        else if (s === 'playing') cardState.innerText = 'Spielt';
        else if (s === 'paused') cardState.innerText = 'Pausiert';
        else if (s === 'unavailable') cardState.innerText = 'Offline';
        else if (s === 'locked') cardState.innerText = 'Verriegelt';
        else if (s === 'unlocked') cardState.innerText = 'Entriegelt';
        else {
             let u = stateObj.attributes.unit_of_measurement || '';
             cardState.innerText = stateObj.state + (u ? ' ' + u : '');
        }

        // Set Slider background if light
        if (domain === 'light' && sliderBg) {
             if (isActive && stateObj.attributes.brightness) {
                 const pct = Math.round((stateObj.attributes.brightness / 255) * 100);
                 sliderBg.style.width = pct + '%';
                 if (this.getValStr('show_state')) cardState.innerText = pct + '%';
             } else {
                 sliderBg.style.width = '0%';
             }
        }
    }

    // Badge Handling
    const bEnt = this.getValStr('badge_entity');
    if (bEnt && hass.states[bEnt] && badgeEl) {
        const bState = hass.states[bEnt];
        const val = parseFloat(bState.state);
        const unit = bState.attributes.unit_of_measurement || '';
        if (!isNaN(val)) {
             badgeEl.innerText = (val % 1 === 0 ? val : val.toFixed(1)) + unit;
             badgeEl.style.display = 'block';
        } else {
             badgeEl.style.display = 'none';
        }
    } else if (badgeEl) {
        badgeEl.style.display = 'none';
    }

    if (isActive !== this._isActive) {
        this._isActive = isActive;
        if (isActive) {
            cardWrap.classList.add('state-on');
        } else {
            cardWrap.classList.remove('state-on');
        }
    }

    // Dynamic Layout (Light/Dark Mode) Detection
    if (hass.themes) {
        const isDark = hass.themes.darkMode === undefined ? true : hass.themes.darkMode;
        if (isDark) {
            cardWrap.classList.remove('light-mode');
        } else {
            cardWrap.classList.add('light-mode');
        }
    }

    // Live Animation logic
    if (this.getValStr('live_animation', true)) {
        cardIcon.classList.remove('live-anim-fan', 'live-anim-shake', 'live-anim-pulse');
        if (isActive) {
            if (icon.indexOf('fan') !== -1 || icon.indexOf('propeller') !== -1) {
                cardIcon.classList.add('live-anim-fan');
            } else if (icon.indexOf('washing-machine') !== -1) {
                cardIcon.classList.add('live-anim-shake');
            } else if (domain === 'script' || icon.indexOf('radar') !== -1) {
                cardIcon.classList.add('live-anim-pulse');
            }
        }
    }
  }
}

customElements.define("openkairo-button-card", OpenKairoButtonCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "openkairo-button-card",
  name: "OpenKAIRO Button Card V2",
  preview: true,
  description: "Ein luxuriöser Multi-Action Button mit Slidern, Badges, Animationen und Sicherheitsschlössern."
});
