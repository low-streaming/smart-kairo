/**
 * OpenKairo Custom Card - Dashboard Part
 * This card renders the layouts created in Kairo Architect.
 * Version: 2.1 (Full UI/UX Design Sync)
 */

const BlockRegistry = {
    renderLight: (b) => {
        const isOn = b.state === 'on';
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); border:1px solid ${isOn ? color : 'rgba(255,255,255,0.08)'}; border-radius:16px; display:flex; align-items:center; justify-content:center; box-shadow: ${isOn ? '0 0 30px ' + color + '40, inset 0 0 10px ' + color + '20' : 'none'}; transition:0.4s ease;">
                <ha-icon icon="${isOn ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline'}" 
                         style="color:${isOn ? color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 10px ' + color + ')' : 'none'}; transform:${isOn ? 'scale(1.1)' : 'scale(1)'}; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></ha-icon>
            </div>`;
    },
    renderFan: (b) => {
        const isOn = b.state === 'on';
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.02); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.08); border-radius:18px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 0 15px rgba(255,255,255,0.02);">
                <ha-icon icon="mdi:fan" class="${isOn ? 'anim-fan' : ''}" style="--fan-dur:1.5s; color:${isOn ? color : 'rgba(255,255,255,0.3)'}; filter:${isOn ? 'drop-shadow(0 0 8px ' + color + ')' : 'none'};"></ha-icon>
            </div>`;
    },
    renderSensor: (b) => {
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); backdrop-filter:blur(15px); border:1px solid rgba(255,255,255,0.05); border-radius:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; position:relative;">
                <div style="position:absolute; width:100%; height:30%; top:0; background:linear-gradient(to bottom, ${color}15, transparent);"></div>
                <div style="font-size:8px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:2px; margin-bottom:4px; font-weight:900;">${b.text || 'Sensor'}</div>
                <div style="font-size:22px; font-weight:900; color:#fff; text-shadow:0 0 15px rgba(0,0,0,0.5);">${b.state || '--'}<span style="font-size:10px; opacity:0.6; margin-left:2px; font-weight:400;">${b.unit || ''}</span></div>
            </div>`;
    },
    renderClimateArc: (b) => {
        const color = b.color || '#10b981';
        return `
            <div class="studio-pro-arc" style="background:rgba(0,0,0,0.7); backdrop-filter:blur(20px); border:1px solid ${color}30; box-shadow: 0 15px 50px rgba(0,0,0,0.5), inset 0 0 30px ${color}10; width:100%; height:100%; border-radius:50%; position:relative; overflow:hidden;">
                <div style="position:absolute; inset:5px; border:1px dashed ${color}40; border-radius:50%; opacity:0.5;"></div>
                <div class="val" style="color:#fff; text-shadow:0 0 20px ${color}; font-size:28px; font-weight:900;">${b.text || '21°'}</div>
            </div>`;
    },
    renderHexPower: (b) => {
        const color = b.color || '#00f6ff';
        const isOn = b.state !== 'off' && b.state !== '0';
        return `
            <div style="width:100%; height:100%; background:linear-gradient(135deg, ${color}, ${color}80); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 0 15px ${color}40);">
                <div style="width:92%; height:92%; background:rgba(0,0,0,0.9); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <ha-icon icon="mdi:flash" style="--mdc-icon-size:22px; color:${color}; filter:${isOn ? 'drop-shadow(0 0 8px ' + color + ')' : 'none'};"></ha-icon>
                    <div style="font-size:9px; font-weight:900; color:#fff; letter-spacing:1px; margin-top:-2px;">${isOn ? 'AKTIV' : 'STANDBY'}</div>
                </div>
            </div>`;
    },
    renderPulseChart: (b) => {
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); border-radius:18px; border:1px solid rgba(255,255,255,0.06); padding:10px; display:flex; flex-direction:column; box-shadow:inset 0 0 20px rgba(0,0,0,0.4);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:9px; color:${color}; font-weight:900; text-transform:uppercase; letter-spacing:1px;">${b.text || 'System'}</span>
                    <span style="font-size:9px; color:#fff; font-weight:900; background:${color}30; padding:2px 6px; border-radius:10px; border:1px solid ${color}40;">85%</span>
                </div>
                <div style="flex:1; display:flex; align-items:flex-end; gap:3px; padding-bottom:4px;">
                    ${Array(12).fill(0).map((_,i) => `<div style="flex:1; background:linear-gradient(to top, ${color}20, ${color}); height:${[30,40,20,60,45,70,30,85,40,95,65,80][i]}%; border-radius:10px; opacity:${i === 9 ? 1 : 0.4}; box-shadow:${i === 9 ? '0 0 15px ' + color : 'none'}; transition:0.3s;"></div>`).join('')}
                </div>
            </div>`;
    },
    renderWeather: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); backdrop-filter:blur(10px); border-radius:16px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:10px; padding:0 12px;">
                <ha-icon icon="mdi:weather-partly-cloudy" style="color:#fbbf24; filter:drop-shadow(0 0 8px #fbbf24);"></ha-icon>
                <div style="font-size:18px; font-weight:900; color:#fff;">${b.state || '20'}°</div>
            </div>`;
    },
    renderMediaPlayer: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(15px); border-radius:20px; border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:10px; padding:10px;">
                <div style="width:34px; height:34px; background:linear-gradient(45deg, #7c3aed, #db2777); border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(124, 58, 237, 0.4);">
                    <ha-icon icon="mdi:music" style="--mdc-icon-size:18px; color:#fff;"></ha-icon>
                </div>
                <div style="overflow:hidden; flex:1;">
                    <div style="font-size:10px; font-weight:900; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.text || 'Night City'}</div>
                    <div style="font-size:8px; color:rgba(255,255,255,0.4);">REAKTOR</div>
                </div>
            </div>`;
    },
    renderNeonSwitch: (b) => {
        const color = b.color || '#a1ff10';
        const isOn = b.state === 'on';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter:blur(12px); border:1px solid ${isOn ? color : 'rgba(255,255,255,0.1)'}; border-radius:20px; display:flex; flex-direction:column; justify-content:space-between; padding:12px; box-shadow: ${isOn ? '0 0 25px ' + color + '30, inset 0 0 10px ' + color + '15' : '0 10px 30px rgba(0,0,0,0.3)'}; transition:0.4s ease;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <ha-icon icon="mdi:flash-circle" style="--mdc-icon-size:20px; color:${isOn ? color : 'rgba(255,255,255,0.2)'}; filter:${isOn ? 'drop-shadow(0 0 8px ' + color + ')' : 'none'}; transition:0.4s;"></ha-icon>
              <div style="width:34px; height:20px; background:${isOn ? color : 'rgba(255,255,255,0.1)'}; border-radius:12px; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                <div style="position:absolute; width:14px; height:14px; background:#fff; border-radius:50%; top:2px; left:${isOn ? '18px' : '2px'}; box-shadow:0 0 5px rgba(0,0,0,0.5); transition:0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);"></div>
              </div>
            </div>
            <div style="font-size:10px; font-weight:900; color:${isOn ? '#fff' : 'rgba(255,255,255,0.4)'}; text-transform:uppercase; letter-spacing:1px;">${b.text || 'Toggle'}</div>
          </div>`;
    },
    renderStatusPill: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.08); border-radius:25px; display:flex; align-items:center; justify-content:center; gap:8px; padding:0 15px; box-shadow:0 8px 30px rgba(0,0,0,0.3);">
            <div style="width:8px; height:8px; background:${color}; border-radius:50%; position:relative; box-shadow:0 0 12px ${color};">
                <div style="position:absolute; inset:-4px; background:${color}; border-radius:50%; opacity:0.4; animation:anim-pulse 2s infinite;"></div>
            </div>
            <div style="font-size:10px; font-weight:900; color:#fff; letter-spacing:2px;">${b.text || 'ONLINE'}</div>
          </div>`;
    },
    renderSliderDimmer: (b) => {
        const color = b.color || '#00f6ff';
        const rawVal = b.attributes && b.attributes.brightness ? b.attributes.brightness : 0;
        const pct = Math.round(rawVal / 255 * 100);
        return `
          <div style="width:100%; height:100%; background:rgba(255,255,255,0.02); backdrop-filter:blur(15px); border-radius:18px; border:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; justify-content:center; gap:8px; padding:0 12px; box-shadow:inset 0 0 20px rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:9px; font-weight:900; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1.5px;">${b.text || 'Dimmer'}</div>
                <div style="font-size:9px; font-weight:900; color:${color};">${pct}%</div>
            </div>
            <div style="height:10px; background:rgba(0,0,0,0.5); border-radius:5px; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                <div style="width:${pct}%; height:100%; background:linear-gradient(to right, ${color}40, ${color}); border-radius:5px; box-shadow:0 0 15px ${color}80; position:relative;">
                    <div style="position:absolute; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation:anim-glow-slide 2s infinite; opacity:0.3;"></div>
                </div>
            </div>
          </div>`;
    },
    renderEnergyRing: (b) => {
        const color = b.color || '#00f6ff';
        return `
          <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative; background:rgba(0,0,0,0.4); border-radius:50%; border:1px solid rgba(255,255,255,0.05);">
             <div style="position:absolute; inset:6px; border-radius:50%; border:2px solid ${color}20;"></div>
             <div style="position:absolute; inset:6px; border-radius:50%; border:2px solid ${color}; clip-path:polygon(50% 50%, 50% 0, 100% 0, 100% 40%, 50% 50%); filter:drop-shadow(0 0 8px ${color});"></div>
             <div style="font-size:14px; font-weight:900; color:#fff; text-shadow:0 0 10px ${color}80;">${b.state || '240W'}</div>
          </div>`;
    },
    renderGlitchText: (b) => {
        return `<div style="font-weight:900; letter-spacing:2px; text-shadow: 2px 0 #ff003c, -2px 0 #00f6ff; font-family:'Rajdhani'; font-size:18px;">${b.text || 'GLITCH'}</div>`;
    },
    renderModeSwitch: (b) => {
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); border-radius:14px; display:flex; gap:4px; padding:6px; border:1px solid rgba(255,255,255,0.05);">
             <div style="flex:1; background:var(--kairo-cyan, #00f6ff); border-radius:8px; box-shadow:0 0 15px rgba(0,246,255,0.4);"></div>
             <div style="flex:1; background:rgba(255,255,255,0.03); border-radius:8px;"></div>
             <div style="flex:1; background:rgba(255,255,255,0.03); border-radius:8px;"></div>
          </div>`;
    },
    renderGlassAction: (b) => {
        return `
          <div style="width:100%; height:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:16px; backdrop-filter:blur(15px); display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
             <ha-icon icon="mdi:gesture-tap" style="color:#fff; filter:drop-shadow(0 0 10px rgba(255,255,255,0.3));"></ha-icon>
          </div>`;
    }
};

class OpenKairoCustomCard extends HTMLElement {
  setConfig(config) {
    if (!config || !config.layout) {
      throw new Error("Bitte ein OpenKAIRO Layout im Editor definieren!");
    }
    this._config = config;
  }

  static getConfigElement() {
    return document.createElement("openkairo-custom-card-editor");
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) {
      this.setupDOM();
    }
    this.updateLiveStates();
  }

  setupDOM() {
    this.attachShadow({ mode: 'open' });
    const c = this._config;
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Rajdhani:wght@400;700&display=swap');
        
        ha-card {
           background: rgba(8, 8, 10, 0.9);
           border-radius: 32px;
           backdrop-filter: blur(${c.blur || 25}px);
           -webkit-backdrop-filter: blur(${c.blur || 25}px);
           position: relative; 
           box-shadow: 
             0 50px 100px rgba(0,0,0,0.9),
             inset 0 0 40px ${c.color || '#00f6ff'}15,
             ${c.glow > 0 ? `0 0 ${c.glow}px ${c.color || '#00f6ff'}30, 0 0 0 1px ${c.color || '#00f6ff'}30` : '0 0 0 1px rgba(255,255,255,0.1)'};
           overflow: hidden !important; 
           color: #fff; font-family: 'Outfit', 'Inter', sans-serif;
           min-height: ${c.height || 480}px;
           transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        ha-card::before {
           content: "";
           position: absolute;
           top: 0; left: 0; right: 0; bottom: 0;
           background-image: 
             radial-gradient(circle at 2px 2px, rgba(0, 246, 255, 0.05) 1.5px, transparent 0);
           background-size: 24px 24px;
           opacity: 0.8;
           pointer-events: none;
           z-index: 0;
        }

        .card-header-text { 
          text-align: center; 
          color: ${c.color || '#00f6ff'}; 
          font-weight: 900; 
          filter: drop-shadow(0 0 15px ${c.color || '#00f6ff'}80); 
          opacity: 0.9; 
          font-size: 24px; 
          letter-spacing: 6px; 
          padding-top: 50px; 
          margin-bottom: 20px;
          text-transform: uppercase; 
          pointer-events: none;
          position: relative;
          z-index: 10;
          font-family: 'Outfit';
        }

        #blocks-container { position: absolute; inset: 0; }
        .block-element { position: absolute; cursor: pointer; transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 20; }
        .block-element:hover { transform: scale(1.05); z-index: 100; }
        .block-element:active { transform: scale(0.95); }

        @keyframes fan-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes anim-pulse { 0% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.4); opacity: 0.1; } 100% { transform: scale(1); opacity: 0.4; } }
        @keyframes anim-glow-slide { 0% { left: -100%; } 100% { left: 100%; } }
        .anim-fan { animation: fan-spin var(--fan-dur, 2s) infinite linear; }
        .val { font-family: 'Outfit', sans-serif; }
      </style>
      <ha-card>
        <div class="card-header-text">${c.name || 'LIVING ROOM'}</div>
        <div id="blocks-container"></div>
      </ha-card>
    `;
  }

  updateLiveStates() {
    if (!this._hass || !this._config.layout || !this.shadowRoot) return;
    const container = this.shadowRoot.querySelector('#blocks-container');
    
    this._config.layout.forEach(b => {
      let el = container.querySelector(`[data-id="${b.id}"]`);
      if (!el) {
        el = document.createElement('div');
        el.className = 'block-element';
        el.dataset.id = b.id;
        el.style.left = b.x + 'px';
        el.style.top = b.y + 'px';
        el.style.width = b.w + 'px';
        el.style.height = b.h + 'px';
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleAction(b);
        });
        container.appendChild(el);
      }

      const stateObj = b.entity ? this._hass.states[b.entity] : null;
      const bWithState = { 
        ...b, 
        state: stateObj ? stateObj.state : 'off', 
        attributes: stateObj ? stateObj.attributes : {},
        unit: b.unit || (stateObj && stateObj.attributes.unit_of_measurement ? stateObj.attributes.unit_of_measurement : '')
      };
      
      // Select render function
      let html = '';
      switch(b.type) {
        case 'Light': html = BlockRegistry.renderLight(bWithState); break;
        case 'Fan': html = BlockRegistry.renderFan(bWithState); break;
        case 'Sensor': html = BlockRegistry.renderSensor(bWithState); break;
        case 'Klima-Bogen': html = BlockRegistry.renderClimateArc(bWithState); break;
        case 'Hex-Power': html = BlockRegistry.renderHexPower(bWithState); break;
        case 'Neon-Switch': html = BlockRegistry.renderNeonSwitch(bWithState); break;
        case 'Status-Pill': html = BlockRegistry.renderStatusPill(bWithState); break;
        case 'Slider-Dimmer': html = BlockRegistry.renderSliderDimmer(bWithState); break;
        case 'Pulse-Chart': html = BlockRegistry.renderPulseChart(bWithState); break;
        case 'Weather-Card': html = BlockRegistry.renderWeather(bWithState); break;
        case 'Media-Player': html = BlockRegistry.renderMediaPlayer(bWithState); break;
        case 'Glitch-Text': html = BlockRegistry.renderGlitchText(bWithState); break;
        case 'Modus-Schalter': html = BlockRegistry.renderModeSwitch(bWithState); break;
        case 'Glass-Action': html = BlockRegistry.renderGlassAction(bWithState); break;
        case 'Energie-Ring': html = BlockRegistry.renderEnergyRing(bWithState); break;
        default: html = `<div style="color:#fff; font-size:10px;">${b.text || b.type}</div>`;
      }
      
      if (el.innerHTML !== html) el.innerHTML = html;
    });
  }

  handleAction(b) {
    if (!b.entity) return;
    const action = b.tap_action || 'toggle';
    
    if (action === 'toggle') {
        const domain = b.entity.split('.')[0];
        this._hass.callService(domain, 'toggle', { entity_id: b.entity });
    } else if (action === 'more-info') {
        const event = new CustomEvent("hass-more-info", {
            detail: { entityId: b.entity },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
  }

  getCardSize() { return 8; }
}

if (!customElements.get("openkairo-custom-card")) {
  customElements.define("openkairo-custom-card", OpenKairoCustomCard);
}

// Editor Placeholder (Advanced Editor)
class OpenKairoCustomCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  render() { 
    this.innerHTML = `
      <div style="padding:24px; color:#fff; background:rgba(8,8,10,0.9); border-radius:18px; border:1px solid rgba(255,255,255,0.1); font-family:'Outfit', sans-serif;">
         <div style="font-weight:900; color:#00f6ff; letter-spacing:2px; margin-bottom:12px; font-size:14px;">KAIRO STUDIO - DASHBOARD EDITOR</div>
         <div style="font-size:12px; opacity:0.6; line-height:1.6;">Design-Änderungen und Layouts werden bequem im <b>Kairo Architect</b> (Seitenleiste) vorgenommen. Deine Änderungen werden hier automatisch übernommen.</div>
         <button style="margin-top:20px; width:100%; padding:12px; background:#00f6ff; border:none; border-radius:10px; font-weight:900; cursor:pointer;" onclick="window.top.location.href='/openkairo'">ARCHITECT ÖFFNEN</button>
      </div>`; 
  }
}
if (!customElements.get("openkairo-custom-card-editor")) {
  customElements.define("openkairo-custom-card-editor", OpenKairoCustomCardEditor);
}
