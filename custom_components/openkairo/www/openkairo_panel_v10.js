/**
 * Baukasten V10 'Infinity Studio' - Self-Contained Release
 * Resolves SyntaxError: Cannot use import statement outside a module.
 */

// --- MODULE: HISTORY MANAGER ---
class InfinityHistory {
    constructor(limit = 50) {
        this.stack = [];
        this.redoStack = [];
        this.limit = limit;
    }
    push(state) {
        this.stack.push(JSON.stringify(state));
        if (this.stack.length > this.limit) {
            this.stack.shift();
        }
        this.redoStack = [];
    }
    undo(currentState) {
        if (this.stack.length === 0) return null;
        this.redoStack.push(JSON.stringify(currentState));
        return JSON.parse(this.stack.pop());
    }
    redo(currentState) {
        if (this.redoStack.length === 0) return null;
        this.stack.push(JSON.stringify(currentState));
        return JSON.parse(this.redoStack.pop());
    }
    clear() {
        this.stack = [];
        this.redoStack = [];
    }
}

// --- MODULE: INTERACTION ENGINE ---
class InfinityInteraction {
    constructor(callbacks = {}) {
        this.onTap = callbacks.onTap || (() => {});
        this.onDouble = callbacks.onDouble || (() => {});
        this.onHold = callbacks.onHold || (() => {});
        this.tapTimer = null;
        this.holdTimer = null;
        this.isHold = false;
        this.tapThreshold = 250;
        this.holdThreshold = 600;
    }
    handleStart(e, id) {
        this.isHold = false;
        this.holdTimer = setTimeout(() => {
            this.isHold = true;
            this.onHold(id);
        }, this.holdThreshold);
    }
    handleEnd(e, id) {
        clearTimeout(this.holdTimer);
        if (this.isHold) return;
        if (this.tapTimer) {
            clearTimeout(this.tapTimer);
            this.tapTimer = null;
            this.onDouble(id);
        } else {
            this.tapTimer = setTimeout(() => {
                this.tapTimer = null;
                this.onTap(id);
            }, this.tapThreshold);
        }
    }
    cancel() {
        clearTimeout(this.tapTimer);
        clearTimeout(this.holdTimer);
        this.tapTimer = null;
    }
}

// --- MODULE: BLOCK REGISTRY ---
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
        const color = b.color || 'var(--kairo-cyan)';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); backdrop-filter:blur(15px); border:1px solid rgba(255,255,255,0.05); border-radius:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; position:relative;">
                <div style="position:absolute; width:100%; height:20%; top:0; background:linear-gradient(to bottom, ${color}10, transparent);"></div>
                <div style="font-size:8px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:2px; margin-bottom:4px; font-weight:900;">${b.text || 'Sensor'}</div>
                <div style="font-size:22px; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(0,0,0,0.5);">${b.state || '24'}<span style="font-size:10px; opacity:0.6; margin-left:2px; font-weight:400;">${b.unit || '°C'}</span></div>
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
        return `
            <div style="width:100%; height:100%; background:linear-gradient(135deg, ${color}, ${color}80); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 0 15px ${color}40);">
                <div style="width:92%; height:92%; background:rgba(0,0,0,0.9); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <ha-icon icon="mdi:flash" style="--mdc-icon-size:22px; color:${color}; filter:drop-shadow(0 0 5px ${color});"></ha-icon>
                    <div style="font-size:9px; font-weight:900; color:#fff; letter-spacing:1px; margin-top:-2px;">AKTIV</div>
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
                <ha-icon icon="mdi:weather-sunny" style="color:#fbbf24; filter:drop-shadow(0 0 8px #fbbf24);"></ha-icon>
                <div style="font-size:18px; font-weight:900; color:#fff;">18°</div>
            </div>`;
    },
    renderMediaPlayer: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(15px); border-radius:20px; border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:10px; padding:10px;">
                <div style="width:30px; height:30px; background:linear-gradient(45deg, #7c3aed, #db2777); border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(124, 58, 237, 0.4);">
                    <ha-icon icon="mdi:music" style="--mdc-icon-size:16px; color:#fff;"></ha-icon>
                </div>
                <div style="overflow:hidden; flex:1;">
                    <div style="font-size:10px; font-weight:900; color:#fff; white-space:nowrap;">Night City</div>
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
            <div style="font-size:10px; font-weight:900; color:#fff; letter-spacing:2px;">ONLINE</div>
          </div>`;
    },
    renderSliderDimmer: (b) => {
        const color = b.color || '#00f6ff';
        return `
          <div style="width:100%; height:100%; background:rgba(255,255,255,0.02); backdrop-filter:blur(15px); border-radius:18px; border:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; justify-content:center; gap:8px; padding:0 12px; box-shadow:inset 0 0 20px rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:9px; font-weight:900; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1.5px;">Intensität</div>
                <div style="font-size:9px; font-weight:900; color:${color};">65%</div>
            </div>
            <div style="height:10px; background:rgba(0,0,0,0.5); border-radius:5px; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                <div style="width:65%; height:100%; background:linear-gradient(to right, ${color}40, ${color}); border-radius:5px; box-shadow:0 0 15px ${color}80; position:relative;">
                    <div style="position:absolute; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation:anim-glow-slide 2s infinite; opacity:0.3;"></div>
                </div>
            </div>
          </div>`;
    },
    renderNeonSwitch: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); border:1px solid ${color}; border-radius:16px; display:flex; flex-direction:column; gap:4px; padding:8px; box-shadow: 0 0 15px ${color}30;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <ha-icon icon="mdi:lightbulb-on" style="--mdc-icon-size:16px; color:${color};"></ha-icon>
              <div style="width:24px; height:12px; background:${color}; border-radius:10px; position:relative;">
                <div style="position:absolute; width:8px; height:8px; background:#fff; border-radius:50%; top:2px; right:2px;"></div>
              </div>
            </div>
            <div style="font-size:8px; font-weight:900; color:#fff;">${b.text || 'Toggle'}</div>
          </div>`;
    },
    renderStatusPill: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:20px; display:flex; align-items:center; justify-content:center; gap:6px;">
            <div style="width:6px; height:6px; background:${color}; border-radius:50%; box-shadow:0 0 8px ${color};"></div>
            <div style="font-size:9px; font-weight:900; color:#fff;">ONLINE</div>
          </div>`;
    },
    renderSliderDimmer: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); border-radius:16px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:4px; padding:8px;">
            <div style="font-size:8px; font-weight:900; color:rgba(255,255,255,0.4);">DIMMER</div>
            <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; position:relative;">
                <div style="width:60%; height:100%; background:${color}; border-radius:3px; box-shadow:0 0 10px ${color}80;"></div>
            </div>
          </div>`;
    },
    renderEnergyRing: (b) => {
        const color = b.color || '#00f6ff';
        return `
          <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative;">
             <div style="position:absolute; width:80%; height:80%; border-radius:50%; border:1px solid ${color}; opacity:0.1;"></div>
             <div style="font-size:14px; font-weight:900; color:#fff;">240W</div>
          </div>`;
    },
    renderGlitchText: (b) => {
        return `<div style="font-weight:900; letter-spacing:2px; text-shadow: 2px 0 #ff003c, -2px 0 #00f6ff;">${b.text || 'GLITCH'}</div>`;
    },
    renderModeSwitch: (b) => {
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); border-radius:12px; display:flex; gap:4px; padding:4px;">
             <div style="flex:1; background:var(--kairo-cyan); border-radius:8px;"></div>
             <div style="flex:1;"></div>
             <div style="flex:1;"></div>
          </div>`;
    },
    renderGlassAction: (b) => {
        return `
          <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center;">
             <ha-icon icon="mdi:flash" style="color:#fff;"></ha-icon>
          </div>`;
    },
    getStandardBlocks: () => [
        { type: 'Light', icon: 'mdi:lightbulb', preview: '<ha-icon icon="mdi:lightbulb" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Sensor', icon: 'mdi:gauge', preview: '<div style="font-size:14px; font-weight:900;">24°</div>' },
        { type: 'Fan', icon: 'mdi:fan', preview: '<ha-icon icon="mdi:fan"></ha-icon>' },
        { type: 'Klima-Bogen', icon: 'mdi:circle-slice-8', preview: '<div style="width:24px; height:24px; border:2px solid var(--kairo-cyan); border-radius:50%; border-right-color:transparent;"></div>' },
        { type: 'Hex-Power', icon: 'mdi:hexagon-slice-6', preview: '<ha-icon icon="mdi:hexagon-slice-6" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Pulse-Chart', icon: 'mdi:chart-timeline-variant', preview: '<ha-icon icon="mdi:chart-timeline-variant"></ha-icon>' },
        { type: 'Weather-Card', icon: 'mdi:weather-partly-cloudy', preview: '<ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>' },
        { type: 'Media-Player', icon: 'mdi:music-box', preview: '<ha-icon icon="mdi:music-box"></ha-icon>' },
        { type: 'Neon-Switch', icon: 'mdi:toggle-switch', preview: '<ha-icon icon="mdi:toggle-switch" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Status-Pill', icon: 'mdi:pill', preview: '<div style="width:12px; height:12px; border-radius:50%; background:var(--kairo-cyan);"></div>' },
        { type: 'Slider-Dimmer', icon: 'mdi:tune-variant', preview: '<ha-icon icon="mdi:tune-variant"></ha-icon>' },
        { type: 'Energie-Ring', icon: 'mdi:progress-wrench', preview: '<ha-icon icon="mdi:loading" class="anim-fan" style="--fan-dur:4s;"></ha-icon>' },
        { type: 'Glitch-Text', icon: 'mdi:format-text', preview: '<span style="font-weight:900; text-shadow:1px 0 red, -1px 0 cyan;">TXT</span>' },
        { type: 'Modus-Schalter', icon: 'mdi:view-list', preview: '<ha-icon icon="mdi:view-list"></ha-icon>' },
        { type: 'Glass-Action', icon: 'mdi:gesture-tap', preview: '<div style="width:20px; height:20px; background:rgba(255,255,255,0.1); border:1px solid #fff; border-radius:4px;"></div>' },
        { type: 'Container', icon: 'mdi:crop-square', preview: '<div style="width:30px; height:20px; border:1px solid rgba(255,255,255,0.2); border-radius:4px;"></div>' }
    ]
};

// --- MODULE: RENDERER ---
const Renderer = {
    getMainTemplate: (state) => `
        <div id="builder-container">
            <header class="header">
                <div class="header-branding">
                    <ha-icon icon="mdi:lightning-bolt" style="color:var(--kairo-cyan); filter:drop-shadow(0 0 10px var(--kairo-cyan));"></ha-icon>
                    <span style="font-weight:900; letter-spacing:3px; font-size:16px;">KAIRO <span style="color:var(--kairo-cyan); filter:drop-shadow(0 0 5px var(--kairo-cyan));">ARCHITECT</span> <span style="font-size:10px; opacity:0.5; vertical-align:top; margin-left:5px;">BETA</span></span>
                </div>
                <div class="header-center">
                    <div class="header-breadcrumb" id="btn-rename-card">
                        <ha-icon icon="mdi:view-dashboard"></ha-icon>
                        <span id="breadcrumb-card-name">${state.name || 'LIVING ROOM'}</span>
                        <ha-icon icon="mdi:chevron-down"></ha-icon>
                    </div>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div class="dev-btn-group" style="display:flex; background:rgba(255,255,255,0.04); padding:4px; border-radius:10px; border:1px solid var(--border-color); margin-right:10px;">
                        <div class="dev-btn active" id="dev-desktop"><ha-icon icon="mdi:monitor"></ha-icon></div>
                        <div class="dev-btn" id="dev-tablet"><ha-icon icon="mdi:tablet-android"></ha-icon></div>
                        <div class="dev-btn" id="dev-mobile"><ha-icon icon="mdi:cellphone"></ha-icon></div>
                    </div>
                    <button class="btn-primary" id="btn-save-template" style="background:rgba(161,255,16,0.1); color:#a1ff10; border:1px solid rgba(161,255,16,0.2);"><ha-icon icon="mdi:content-save-outline"></ha-icon> ALS TEMPLATE SPEICHERN</button>
                    <button class="btn-primary" id="btn-save"><ha-icon icon="mdi:code-braces"></ha-icon> CODE GENERIEREN</button>
                    <button class="btn-primary" id="btn-import" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1);"><ha-icon icon="mdi:upload"></ha-icon> IMPORT</button>
                </div>
            </header>

            <div class="main-layout">
                <div class="sidebar sidebar-left">
                    <div class="sidebar-tabs">
                        <div class="s-tab active" data-tab="BLOCKS" id="tab-left-blocks">Komponenten</div>
                        <div class="s-tab" data-tab="TEMPLATES" id="tab-left-templates">Vorlagen</div>
                        <div class="s-tab" data-tab="LAYERS" id="tab-left-layers">Ebenen</div>
                        <div class="s-tab" data-tab="AI" id="tab-left-ai">KI Studio</div>
                    </div>
                    <div class="sidebar-content" id="left-sidebar-container"></div>
                </div>

                <div class="canvas-area">
                    <div id="drop-target">
                        <div id="card-header-text" style="text-align:center; color:var(--kairo-cyan); font-weight:900; filter:drop-shadow(0 0 20px var(--kairo-cyan)); opacity:0.9; font-size:24px; letter-spacing:6px; padding-top:30px; text-transform:uppercase; pointer-events:none;">${state.name || 'LIVING ROOM'}</div>
                        <svg id="links-overlay" style="position:absolute; inset:0; pointer-events:none;"></svg>
                    </div>
                </div>

                <div class="sidebar sidebar-right">
                    <div class="sidebar-tabs">
                        <div class="s-tab active" data-tab="PROPS" id="tab-props">Eigenschaften</div>
                        <div class="s-tab" data-tab="STYLES" id="tab-styles">Design</div>
                    </div>
                    <div class="sidebar-content" id="right-sidebar"></div>
                </div>
            </div>

            <div id="export-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">KARTE EXPORTIEREN</div>
                    <pre id="export-code-box" class="modal-code"></pre>
                    <div class="modal-actions">
                        <button class="btn-primary secondary" id="btn-close-export">Abbrechen</button>
                        <button class="btn-primary" id="btn-copy-code">Kopieren</button>
                    </div>
                </div>
            </div>

            <div id="import-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">KARTE IMPORTIEREN</div>
                    <textarea id="import-code-box" class="modal-code" placeholder="Paste your layout JSON here..." style="width:100%; height:250px; background:#000; color:#10b981; border-radius:12px; padding:15px; border:1px solid rgba(255,255,255,0.1); font-family:monospace;"></textarea>
                    <div class="modal-actions">
                        <button class="btn-primary secondary" id="btn-close-import">Abbrechen</button>
                        <button class="btn-primary" id="btn-do-import">Importieren</button>
                    </div>
                </div>
            </div>
        </div>`,
    getResizers: () => `
        <div class="resizer nw"></div><div class="resizer ne"></div>
        <div class="resizer sw"></div><div class="resizer se"></div>`
};

// --- MODULE: TEMPLATES ---
const Templates = {
    exportToYAML: (state) => {
        let yaml = `type: 'custom:openkairo-custom-card'\nname: '${state.name}'\nglow: ${state.style.glow}\nblur: ${state.style.blur}\ncolor: '${state.style.color}'\nopacity: ${state.style.opacity}\nlayout:\n`;
        state.blocks.forEach(b => {
            yaml += `  - id: ${b.id}\n    type: ${b.type}\n    x: ${b.x}\n    y: ${b.y}\n    w: ${b.w || 120}\n    h: ${b.h || 40}\n    text: '${b.text || ''}'\n`;
            if (b.entity) yaml += `    entity: ${b.entity}\n`;
            if (b.icon) yaml += `    icon: ${b.icon}\n`;
            yaml += `    color: '${b.color || '#fff'}'\n`;
            if (b.glow) yaml += `    glow: ${b.glow}\n`;
            if (b.animation && b.animation !== 'none') { yaml += `    animation: ${b.animation}\n    animDuration: ${b.animDuration || 2}\n`; }
            if (b.tap_action) yaml += `    tap_action: ${b.tap_action}\n`;
        });
        return yaml;
    },
    exportToJSON: (state) => JSON.stringify(state, null, 2),
    importFromJSON: (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (!data.blocks || !Array.isArray(data.blocks)) throw new Error("Invalid structure.");
            return data;
        } catch (e) {
            console.error("Import Error:", e);
            return null;
        }
    },
    loadTemplates: () => JSON.parse(localStorage.getItem('kairo_templates') || '{}'),
    saveTemplate: (name, state) => {
        const templates = JSON.parse(localStorage.getItem('kairo_templates') || '{}');
        templates[name] = state;
        localStorage.setItem('kairo_templates', JSON.stringify(templates));
    },
    getFactoryPresets: () => ({
        'Wohnzimmer Basis': {
            name: 'Living Room',
            style: { glow: 40, blur: 25, color: '#00f6ff', opacity: 0.3 },
            blocks: [
                { id: 'l1', type: 'Light', x: 20, y: 100, w: 100, h: 40, text: 'Decke', color: '#00f6ff', tap_action: 'toggle' },
                { id: 'l2', type: 'Light', x: 130, y: 100, w: 100, h: 40, text: 'Wand', color: '#00f6ff', tap_action: 'toggle' },
                { id: 'c1', type: 'Klima-Bogen', x: 75, y: 180, w: 140, h: 140, text: '22°', color: '#10b981' }
            ]
        },
        'Schlafzimmer': {
            name: 'Bedroom',
            style: { glow: 30, blur: 20, color: '#fca5a5', opacity: 0.2 },
            blocks: [
                { id: 'b1', type: 'Light', x: 20, y: 80, w: 100, h: 40, text: 'Nachtlicht', color: '#fca5a5', tap_action: 'toggle' },
                { id: 's1', type: 'Sensor', x: 130, y: 80, w: 100, h: 40, text: 'Temp', state: '19.5', unit: '°C' }
            ]
        }
    })
};

// --- MODULE: AI-AGENT ---
const AIAgent = {
    generateFromPrompt: (prompt) => {
        const p = prompt.toLowerCase();
        const newBlocks = [];
        let startX = 100, startY = 100;
        if (p.includes('light') || p.includes('licht')) {
            const count = p.match(/\d+/) ? parseInt(p.match(/\d+/)[0]) : 1;
            for(let i=0; i<count; i++) { 
                newBlocks.push({ id: 'gen_l_'+Math.random().toString(36).substr(2,4), type: 'Light', x: startX + (i*130), y: startY, w:120, h:40, text: 'Light ' + (i+1), color: '#00f6ff', glow:20, blur:15, tap_action: 'toggle' }); 
            }
            startY += 120;
        }
        if (p.includes('climate') || p.includes('klima')) { 
            newBlocks.push({ id: 'gen_c_'+Math.random().toString(36).substr(2,4), type: 'Klima-Bogen', x: startX, y: startY, w:140, h:140, text: '21°', color: '#10b981', glow:20, blur:15 }); 
            startY += 160; 
        }
        if (p.includes('chart') || p.includes('graph')) { 
            newBlocks.push({ id: 'gen_p_'+Math.random().toString(36).substr(2,4), type: 'Pulse-Chart', x: startX, y: startY, w:200, h:80, text: 'System', color: '#00f6ff', glow:20, blur:15 }); 
            startY += 100; 
        }
        return newBlocks;
    }
};

// --- MAIN BUILDER CLASS ---
class OpenKairoBuilder extends HTMLElement {
    set panel(panel) {
        this._panel = panel;
        if (!this.content) this.setupDOM();
    }
    set hass(hass) {
        this._hass = hass;
    }
    setupDOM() {
        if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
        this.state = {
            name: 'LIVING ROOM',
            blocks: [],
            style: { glow: 40, blur: 25, color: '#00f6ff', opacity: 0.3 }
        };
        this.selectedBlockId = null;
        this.activeLeftTab = 'BLOCKS';
        this.activeRightTab = 'STYLES';
        this.history = new InfinityHistory();
        this.interaction = new InfinityInteraction({
            onTap: (id) => this.selectBlock(id),
            onDouble: (id) => this._handleAction(id, 'double'),
            onHold: (id) => this._handleAction(id, 'hold')
        });
        this.shadowRoot.innerHTML = `
            <style>
                /**
                 * Infinity Studio - Professional Stylesheet
                 * Premium 'Vibrant Carbon & Glass' Visual System
                 */
                :host {
                    --bg-color: #08080a;
                    --sidebar-bg: rgba(20, 20, 25, 0.7);
                    --border-color: rgba(255, 255, 255, 0.1);
                    --accent-color: #00f6ff;
                    --kairo-cyan: #00f6ff;
                    --kairo-magenta: #ff00ff;
                    --text-primary: #ffffff;
                    --text-secondary: rgba(255, 255, 255, 0.5);
                    --input-bg: rgba(255, 255, 255, 0.05);
                    font-family: 'Outfit', 'Inter', sans-serif;
                    display: block; height: 100%; height: 100vh; width: 100%; background: var(--bg-color); color: #fff; overflow: hidden;
                }
                #builder-container { 
                    display: grid; grid-template-rows: 66px 1fr; 
                    height: 100%; width: 100%; overflow: hidden; position: relative;
                }
                .header { 
                    border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; 
                    background: #000; z-index: 100; height: 66px;
                }
                .header-branding { display: flex; align-items: center; gap: 12px; font-weight: 900; letter-spacing: 2px; font-size: 14px; text-transform: uppercase; color: #fff; }
                .header-center { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
                .header-breadcrumb { color: #fff; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: 0.2s; border: 1px solid transparent; }
                .header-breadcrumb:hover { background: rgba(255,255,255,0.05); border-color: var(--border-color); }
                .header-breadcrumb ha-icon { --mdc-icon-size: 14px; opacity: 0.6; }
                .main-layout { 
                    display: grid; grid-template-columns: 280px 1fr 340px; 
                    height: 100%; width: 100%; overflow: hidden; background: #000;
                }
                .sidebar { 
                    height: 100%; background: var(--sidebar-bg); 
                    backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px);
                    border-right: 1px solid var(--border-color); 
                    display: flex; flex-direction: column; overflow: hidden; position: relative; 
                    box-shadow: 20px 0 50px rgba(0,0,0,0.5);
                }
                .sidebar-right { border-left: 1px solid var(--border-color); border-right: none; }
                .sidebar-tabs { display: flex; background: rgba(0,0,0,0.5); border-radius: 14px; margin: 20px; padding: 5px; gap: 5px; border: 1px solid var(--border-color); }
                .s-tab { 
                    flex: 1; text-align: center; font-size: 10px; font-weight: 900; text-transform: uppercase; color: var(--text-secondary); 
                    cursor: pointer; padding: 10px 4px; border-radius: 10px; transition: 0.3s; letter-spacing: 1.5px; border: none;
                }
                .s-tab.active { background: var(--kairo-cyan); color: #000; box-shadow: 0 4px 15px rgba(0, 246, 255, 0.4); }
                .sidebar-content { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; align-items: stretch; }
                .canvas-area { 
                    height: 100%; background: #000; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;
                    background-image: 
                        radial-gradient(rgba(0, 246, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(rgba(0, 246, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 246, 255, 0.02) 1px, transparent 1px);
                    background-size: 100px 100px, 50px 50px, 50px 50px;
                    background-position: center center;
                    perspective: 1200px;
                }
                #drop-target {
                    background: rgba(10, 10, 15, 0.85);
                    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
                    width: 320px; min-height: 480px; border-radius: 32px;
                    position: relative; 
                    box-shadow: 
                        0 50px 100px rgba(0,0,0,0.95), 
                        inset 0 0 50px rgba(0, 246, 255, 0.1),
                        0 0 0 1px rgba(255,255,255,0.15);
                    transform: rotateX(8deg);
                    transform-origin: center center;
                    overflow: hidden;
                    transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-primary { 
                    background: var(--kairo-cyan); color: #000; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 900; font-size: 11px; text-transform: uppercase;
                    cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; letter-spacing: 1px;
                }
                .btn-primary:hover { box-shadow: 0 0 25px rgba(0,246,255,0.5); transform: translateY(-2px); }
                .btn-primary.secondary { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
                .prop-group { border-bottom: 1px solid var(--border-color); padding: 20px 24px; }
                .prop-header { font-size: 10px; font-weight: 900; color: #fff; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px; }
                .prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .prop-label { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 800; }
                .prop-input { background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: white; padding: 8px 10px; border-radius: 8px; font-size: 11px; width: 140px; }
                .canvas-element { 
                    position: absolute; cursor: grab; user-select: none; border: 1px solid transparent; transition: box-shadow 0.3s, border 0.3s;
                }
                .canvas-element:active { cursor: grabbing; }
                .canvas-element.selected { border: 1.5px solid #fff !important; z-index: 100; box-shadow: 0 0 40px rgba(0,246,255,0.4); }
                .resizer { width: 10px; height: 10px; background: #fff; border-radius: 50%; position: absolute; display: none; border: 2px solid var(--bg-color); }
                .canvas-element.selected .resizer { display: block; }
                .resizer.nw { top: -5px; left: -5px; cursor: nw-resize; }
                .resizer.ne { top: -5px; right: -5px; cursor: ne-resize; }
                .resizer.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
                .resizer.se { bottom: -5px; right: -5px; cursor: se-resize; }
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(20px); display: none; justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { background: #111; padding: 40px; border-radius: 32px; border: 1px solid var(--border-color); width: 600px; color: #fff; }
                .modal-header { font-size: 20px; font-weight: 900; letter-spacing: 2px; margin-bottom: 24px; }
                .modal-code { background: #000; padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px; font-family: monospace; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
                .block-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px 10px; display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: grab; transition: 0.3s; }
                .block-item:hover { background: rgba(255,255,255,0.06); border-color: var(--kairo-cyan); transform: scale(1.05); }
                @keyframes fan-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes anim-pulse { 0% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 0.1; } 100% { transform: scale(1); opacity: 0.4; } }
                @keyframes anim-glow-slide { 0% { left: -100%; } 100% { left: 100%; } }
                .anim-fan { animation: fan-spin var(--fan-dur, 2s) infinite linear; }
                .studio-pro-arc { 
                    position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:50%; 
                }
                .studio-pro-arc .val { font-size:42px; font-weight:900; font-family: 'Outfit'; }
            </style>
            ${Renderer.getMainTemplate(this.state)}
        `;
        this.content = true;
        this._bindEvents();
        this._renderAll();
    }
    _bindEvents() {
        const root = this.shadowRoot;
        root.querySelector('#btn-save').addEventListener('click', () => this.showExport());
        root.querySelector('#btn-import').addEventListener('click', () => { root.querySelector('#import-modal').style.display = 'flex'; });
        root.querySelector('#btn-close-export').addEventListener('click', () => { root.querySelector('#export-modal').style.display = 'none'; });
        root.querySelector('#btn-close-import').addEventListener('click', () => { root.querySelector('#import-modal').style.display = 'none'; });
        root.querySelector('#btn-do-import').addEventListener('click', () => this._handleImport());
        root.querySelector('#btn-save-template').addEventListener('click', () => {
            const name = prompt('Name für das Template:', this.state.name);
            if (name) {
                Templates.saveTemplate(name, JSON.parse(JSON.stringify(this.state)));
                this._renderSidebars();
                alert('Template gespeichert!');
            }
        });
        root.querySelector('#btn-rename-card').addEventListener('click', () => {
            const newName = prompt('Dashboard Name:', this.state.name);
            if (newName) {
                this.state.name = newName;
                this._renderAll();
            }
        });
        root.querySelector('#btn-copy-code').addEventListener('click', () => {
            const code = root.querySelector('#export-code-box').innerText;
            navigator.clipboard.writeText(code);
            root.querySelector('#btn-copy-code').innerText = 'KOPIERT!';
            setTimeout(() => root.querySelector('#btn-copy-code').innerText = 'KOPIEREN', 2000);
        });
        ['desktop', 'tablet', 'mobile'].forEach(d => { root.querySelector('#dev-' + d).addEventListener('click', () => this._setDevice(d)); });
        const target = root.querySelector('#drop-target');
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('drop', e => this._handleDrop(e));
        target.addEventListener('click', e => { if (e.target.id === 'drop-target') this.selectBlock(null); });
        root.querySelectorAll('.sidebar-left .s-tab').forEach(t => {
            t.addEventListener('click', () => {
                root.querySelectorAll('.sidebar-left .s-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active'); this.activeLeftTab = t.dataset.tab; this._renderSidebars();
            });
        });
        root.querySelectorAll('.sidebar-right .s-tab').forEach(t => {
            t.addEventListener('click', () => {
                root.querySelectorAll('.sidebar-right .s-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active'); this.activeRightTab = t.dataset.tab; this.selectBlock(this.selectedBlockId);
            });
        });
        window.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); this.undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); this.redo(); }
            if (e.key === 'Delete' && this.selectedBlockId) this._deleteSelected();
        });
    }
    _handleDrop(e) {
        e.preventDefault();
        const root = this.shadowRoot, target = root.querySelector('#drop-target'), rect = target.getBoundingClientRect();
        const moveId = e.dataTransfer.getData('move_id'), type = e.dataTransfer.getData('source_type');
        this._saveHistory();
        if (moveId) {
            const b = this.state.blocks.find(x => x.id === moveId);
            const ox = parseFloat(e.dataTransfer.getData('offsetX')) || 0, oy = parseFloat(e.dataTransfer.getData('offsetY')) || 0;
            b.x = Math.round((e.clientX - rect.left - ox) / 12) * 12;
            b.y = Math.round((e.clientY - rect.top - oy) / 12) * 12;
        } else if (type) {
            const x = Math.round((e.clientX - rect.left - 40) / 12) * 12, y = Math.round((e.clientY - rect.top - 20) / 12) * 12;
            this._addBlock(type, x, y);
        }
        this._renderAll();
    }
    _addBlock(type, x, y) {
        const id = 'b' + Math.random().toString(36).substr(2, 9);
        const b = { id, type, x, y, w: 120, h: 40, color: this.state.style.color, text: type, glow: 20, blur: 15, opacity: 1, fontSize: 13, tap_action: 'toggle' };
        if (type === 'Klima-Bogen') { b.w = 140; b.h = 140; b.color = '#10b981'; }
        else if (type === 'Hex-Power') { b.w = 80; b.h = 100; }
        else if (type === 'Pulse-Chart') { b.w = 200; b.h = 80; }
        else if (type === 'Weather-Card') { b.w = 150; b.h = 60; }
        else if (type === 'Media-Player') { b.w = 250; b.h = 80; }
        else if (type === 'Neon-Switch') { b.w = 120; b.h = 80; }
        else if (type === 'Status-Pill') { b.w = 120; b.h = 40; }
        else if (type === 'Slider-Dimmer') { b.w = 200; b.h = 80; }
        this.state.blocks.push(b); this.selectBlock(id);
    }
    _renderAll() { 
        this._renderCanvas(); 
        this._renderSidebars(); 
        this._renderRightSidebar(); 
        this._updateGlobalStyles(); 
    }
    _renderCanvas() {
        const board = this.shadowRoot.querySelector('#drop-target'); if (!board) return;
        const header = board.querySelector('#card-header-text'); board.innerHTML = ''; if(header) board.appendChild(header);
        this.state.blocks.forEach(b => {
            const el = document.createElement('div');
            el.className = 'canvas-element' + (this.selectedBlockId === b.id ? ' selected' : '');
            el.id = b.id; el.style.cssText = `left:${b.x}px; top:${b.y}px; width:${b.w}px; height:${b.h}px; color:${b.color};`;
            if(b.glow) el.style.boxShadow = `0 0 ${b.glow}px ${b.color}40`;
            if(b.blur) el.style.backdropFilter = `blur(${b.blur}px)`;
            if (b.type === 'Light') el.innerHTML = BlockRegistry.renderLight(b);
            else if (b.type === 'Fan') el.innerHTML = BlockRegistry.renderFan(b);
            else if (b.type === 'Sensor') el.innerHTML = BlockRegistry.renderSensor(b);
            else if (b.type === 'Klima-Bogen') el.innerHTML = BlockRegistry.renderClimateArc(b);
            else if (b.type === 'Hex-Power') el.innerHTML = BlockRegistry.renderHexPower(b);
            else if (b.type === 'Pulse-Chart') el.innerHTML = BlockRegistry.renderPulseChart(b);
            else if (b.type === 'Weather-Card') el.innerHTML = BlockRegistry.renderWeather(b);
            else if (b.type === 'Media-Player') el.innerHTML = BlockRegistry.renderMediaPlayer(b);
            else if (b.type === 'Neon-Switch') el.innerHTML = BlockRegistry.renderNeonSwitch(b);
            else if (b.type === 'Status-Pill') el.innerHTML = BlockRegistry.renderStatusPill(b);
            else if (b.type === 'Slider-Dimmer') el.innerHTML = BlockRegistry.renderSliderDimmer(b);
            else if (b.type === 'Energie-Ring') el.innerHTML = BlockRegistry.renderEnergyRing(b);
            else if (b.type === 'Glitch-Text') el.innerHTML = BlockRegistry.renderGlitchText(b);
            else if (b.type === 'Modus-Schalter') el.innerHTML = BlockRegistry.renderModeSwitch(b);
            else if (b.type === 'Glass-Action') el.innerHTML = BlockRegistry.renderGlassAction(b);
            else el.innerHTML = `<span>${b.text || b.type}</span>`;
            el.addEventListener('mousedown', (e) => this.interaction.handleStart(e, b.id));
            el.addEventListener('mouseup', (e) => this.interaction.handleEnd(e, b.id));
            el.setAttribute('draggable', 'true');
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('move_id', b.id);
                const r = el.getBoundingClientRect(); e.dataTransfer.setData('offsetX', e.clientX - r.left); e.dataTransfer.setData('offsetY', e.clientY - r.top);
            });
            if (this.selectedBlockId === b.id) { 
                el.innerHTML += Renderer.getResizers();
                setTimeout(() => this._bindResizers(el, b), 0);
            }
            board.appendChild(el);
        });
    }
    _renderSidebars() {
        const left = this.shadowRoot.querySelector('#left-sidebar-container');
        if (!left) return;
        
        if (this.activeLeftTab === 'BLOCKS') {
            const blocks = BlockRegistry.getStandardBlocks();
            left.innerHTML = `
                <div class="block-category-title" style="font-size: 10px; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; padding-left: 5px;">Standard Bibliothek</div>
                <div class="block-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    ${blocks.map(b => `
                        <div class="block-item b-item" data-type="${b.type}" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px 5px; display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: grab; transition: 0.3s;">
                            <div class="block-preview" style="--mdc-icon-size: 24px;">${b.preview}</div>
                            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.6);">${b.type}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            left.querySelectorAll('.b-item').forEach(i => { 
                i.setAttribute('draggable', 'true'); 
                i.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('source_type', i.dataset.type);
                    i.style.opacity = '0.5';
                });
                i.addEventListener('dragend', () => i.style.opacity = '1');
            });
        } else if (this.activeLeftTab === 'TEMPLATES') {
            const presets = Templates.getFactoryPresets();
            const saved = Templates.loadTemplates();
            left.innerHTML = `
                <div class="sidebar-section-title" style="font-size: 10px; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Werks-Vorlagen</div>
                ${Object.keys(presets).map(name => `
                    <div class="preset-item" data-name="${name}" style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:12px; padding:12px; margin-bottom:10px; cursor:pointer; transition:0.3s;">
                        <div style="font-weight:800; font-size:12px; margin-bottom:4px; color:var(--kairo-cyan);">${name}</div>
                        <div style="font-size:9px; opacity:0.6;">Hochwertiges Raum-Layout</div>
                    </div>
                `).join('')}
                ${Object.keys(saved).length > 0 ? `
                    <div class="sidebar-section-title" style="font-size: 10px; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 2px; margin: 20px 0 12px;">Deine Vorlagen</div>
                    ${Object.keys(saved).map(name => `
                        <div class="saved-item" data-name="${name}" style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:12px; padding:12px; margin-bottom:10px; cursor:pointer;">
                            <div style="font-weight:800; font-size:12px;">${name}</div>
                        </div>
                    `).join('')}
                ` : ''}
            `;
            left.querySelectorAll('.preset-item').forEach(p => {
                p.addEventListener('click', () => {
                    if (confirm(`Vorlage "${p.dataset.name}" laden? Aktueller Fortschritt geht verloren.`)) {
                        this._saveHistory();
                        this.state = JSON.parse(JSON.stringify(presets[p.dataset.name]));
                        this._renderAll();
                    }
                });
            });
        } else if (this.activeLeftTab === 'LAYERS') {
            left.innerHTML = `
                <div class="sidebar-section-title" style="font-size: 10px; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Aktive Blöcke</div>
                <div class="layer-list" style="display:flex; flex-direction:column; gap:8px;">
                    ${this.state.blocks.map(b => `
                        <div class="layer-item ${this.selectedBlockId === b.id ? 'active' : ''}" data-id="${b.id}" style="background:${this.selectedBlockId === b.id ? 'var(--kairo-cyan)' : 'rgba(255,255,255,0.03)'}; color:${this.selectedBlockId === b.id ? '#000' : '#fff'}; border:1px solid var(--border-color); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-weight:800; font-size:11px;">${b.text || b.type}</span>
                                <span style="font-size:9px; opacity:0.5;">${b.id.substr(0,4)}</span>
                            </div>
                            <ha-icon icon="mdi:delete-outline" class="btn-delete-layer" data-id="${b.id}" style="--mdc-icon-size:16px; opacity:0.6; cursor:pointer;"></ha-icon>
                        </div>
                    `).join('')}
                </div>
            `;
            left.querySelectorAll('.layer-item').forEach(l => {
                l.addEventListener('click', (e) => {
                    if (e.target.classList.contains('btn-delete-layer') || e.target.closest('.btn-delete-layer')) {
                        e.stopPropagation();
                        if (confirm('Block löschen?')) {
                            this._saveHistory();
                            this.state.blocks = this.state.blocks.filter(x => x.id === l.dataset.id ? false : true);
                            if (this.selectedBlockId === l.dataset.id) this.selectedBlockId = null;
                            this._renderAll();
                        }
                        return;
                    }
                    this.selectBlock(l.dataset.id);
                });
            });
        } else if (this.activeLeftTab === 'AI') {
            left.innerHTML = `
                <div class="sidebar-section-title" style="font-size: 10px; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">KI Layout Assistent</div>
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:12px; padding:15px; display:flex; flex-direction:column; gap:12px;">
                    <textarea id="ai-prompt-input" placeholder="z.B. 'Füge 3 Lichter und ein Diagramm hinzu'" style="width:100%; height:80px; background:#000; color:var(--kairo-cyan); border-radius:8px; padding:10px; border:1px solid var(--border-color); font-family:inherit; font-size:12px; outline:none; resize:none;"></textarea>
                    <button class="btn-primary" id="btn-run-ai" style="width:100%; padding:10px; background:var(--kairo-cyan); color:#000; font-weight:900;">GENERATOR STARTEN</button>
                    <div style="font-size:9px; opacity:0.4; line-height:1.4;">Tipp: Die KI kann Lichter, Klima-Bögen und Diagramme zu deinem Layout hinzufügen.</div>
                </div>
            `;
            left.querySelector('#btn-run-ai').addEventListener('click', () => {
                const prompt = left.querySelector('#ai-prompt-input').value;
                if (prompt) {
                    const newBlocks = AIAgent.generateFromPrompt(prompt);
                    if (newBlocks.length > 0) {
                        this._saveHistory();
                        this.state.blocks.push(...newBlocks);
                        this._renderAll();
                        left.querySelector('#ai-prompt-input').value = '';
                    } else {
                        alert("Ich konnte diesen Prompt nicht verstehen. Versuche es mit 'Füge 2 Lichter hinzu'.");
                    }
                }
            });
        }
    }
    selectBlock(id) { this.selectedBlockId = id; this._renderCanvas(); this._renderRightSidebar(); }
    _renderRightSidebar() {
        const right = this.shadowRoot.querySelector('#right-sidebar'), b = this.state.blocks.find(x => x.id === this.selectedBlockId);
        if (!b) { 
            right.innerHTML = `
                <div class="prop-group">
                    <div class="prop-header">Globale Einstellungen</div>
                    <div class="prop-row"><span>Leucht-Intensität</span><input type="range" id="g-glow" value="${this.state.style.glow}" style="width:100%"></div>
                    <div class="prop-row"><span>Globale Farbe</span><input type="color" id="g-color" value="${this.state.style.color}" style="width:100%; background:none; border:none; height:30px;"></div>
                </div>`; 
            this.shadowRoot.querySelector('#g-glow').addEventListener('input', e => { this.state.style.glow = e.target.value; this._renderAll(); }); 
            this.shadowRoot.querySelector('#g-color').addEventListener('input', e => { this.state.style.color = e.target.value; this._renderAll(); });
            return; 
        }
        const entities = this._hass ? Object.keys(this._hass.states).sort() : [];
        right.innerHTML = `
            <div class="prop-group">
                <div class="prop-header">Block: ${b.type}</div>
                <div class="prop-row"><span>Bezeichnung</span><input class="prop-input" type="text" id="p-text" value="${b.text || ''}"></div>
                <div class="prop-row"><span>Entität (ID)</span><input class="prop-input" type="text" id="p-entity" list="hass-entities" value="${b.entity || ''}"></div>
                <div class="prop-row"><span>Icon</span><input class="prop-input" type="text" id="p-icon" value="${b.icon || ''}" placeholder="mdi:lightbulb"></div>
            </div>
            <datalist id="hass-entities">
                ${entities.map(id => `<option value="${id}">`).join('')}
            </datalist>
            <div class="prop-group">
                <div class="prop-header">Design & Effekte</div>
                <div class="prop-row"><span>Akzentfarbe</span><input type="color" id="p-color" value="${b.color || '#ffffff'}" style="width:100%; background:none; border:none; height:30px;"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="prop-row"><span>Breite</span><input class="prop-input" type="number" id="p-w" value="${b.w}"></div>
                    <div class="prop-row"><span>Höhe</span><input class="prop-input" type="number" id="p-h" value="${b.h}"></div>
                </div>
                <div class="prop-row"><span>Animation</span>
                    <select class="prop-input" id="p-anim" style="background:#000; color:#fff;">
                        <option value="none" ${b.animation === 'none' ? 'selected' : ''}>Keine</option>
                        <option value="pulse" ${b.animation === 'pulse' ? 'selected' : ''}>Pulsieren</option>
                        <option value="breathe" ${b.animation === 'breathe' ? 'selected' : ''}>Atmen</option>
                        <option value="float" ${b.animation === 'float' ? 'selected' : ''}>Schweben</option>
                    </select>
                </div>
            </div>
            <div style="padding:24px;"><button class="btn-primary" id="btn-del" style="background:#ef4444; color:#fff; width:100%;">ENTFERNEN</button></div>`;
        
        const update = (key, val) => { b[key] = val; this._renderCanvas(); };
        this.shadowRoot.querySelector('#p-text').addEventListener('input', e => update('text', e.target.value));
        this.shadowRoot.querySelector('#p-entity').addEventListener('input', e => b.entity = e.target.value);
        this.shadowRoot.querySelector('#p-icon').addEventListener('input', e => update('icon', e.target.value));
        this.shadowRoot.querySelector('#p-color').addEventListener('input', e => update('color', e.target.value));
        this.shadowRoot.querySelector('#p-w').addEventListener('input', e => update('w', parseInt(e.target.value)));
        this.shadowRoot.querySelector('#p-h').addEventListener('input', e => update('h', parseInt(e.target.value)));
        this.shadowRoot.querySelector('#p-anim').addEventListener('change', e => { b.animation = e.target.value; this._renderCanvas(); });
        this.shadowRoot.querySelector('#btn-del').addEventListener('click', () => this._deleteSelected());
    }
    _deleteSelected() { this._saveHistory(); this.state.blocks = this.state.blocks.filter(x => x.id !== this.selectedBlockId); this.selectBlock(null); }
    _saveHistory() { this.history.push(this.state); }
    undo() { const s = this.history.undo(this.state); if (s) { this.state = s; this._renderAll(); } }
    redo() { const s = this.history.redo(this.state); if (s) { this.state = s; this._renderAll(); } }
    showExport() { const root = this.shadowRoot; root.querySelector('#export-code-box').innerText = Templates.exportToYAML(this.state); root.querySelector('#export-modal').style.display = 'flex'; }
    _handleImport() {
        const json = this.shadowRoot.querySelector('#import-code-box').value, data = Templates.importFromJSON(json);
        if (data) { this._saveHistory(); this.state = data; this._renderAll(); this.shadowRoot.querySelector('#import-modal').style.display = 'none'; }
    }
    _updateGlobalStyles() { const target = this.shadowRoot.querySelector('#drop-target'); if(target) target.style.boxShadow = `0 50px 100px rgba(0,0,0,0.9), inset 0 0 50px ${this.state.style.color}20`; }
    _handleAction(id, type) { console.log(`Action: ${type} on ${id}`); }
    _setDevice(type) {
        const canvas = this.shadowRoot.querySelector('#drop-target');
        this.shadowRoot.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));
        this.shadowRoot.querySelector('#dev-' + type).classList.add('active');
        canvas.style.width = type === 'mobile' ? '320px' : (type === 'tablet' ? '600px' : '320px');
    }
    _bindResizers(el, b) {
        const root = this.shadowRoot;
        el.querySelectorAll('.resizer').forEach(r => {
            r.addEventListener('mousedown', e => {
                e.preventDefault(); e.stopPropagation();
                const pos = r.className.split(' ')[1];
                const startX = e.clientX, startY = e.clientY, startW = b.w, startH = b.h, startXP = b.x, startYP = b.y;
                const onMouseMove = (me) => {
                    const dx = me.clientX - startX, dy = me.clientY - startY;
                    if (pos.includes('e')) b.w = Math.max(20, startW + dx);
                    if (pos.includes('s')) b.h = Math.max(20, startH + dy);
                    if (pos.includes('w')) { b.w = Math.max(20, startW - dx); b.x = startXP + dx; }
                    if (pos.includes('n')) { b.h = Math.max(20, startH - dy); b.y = startYP + dy; }
                    this._renderCanvas();
                };
                const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
                window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);
            });
        });
    }
}
customElements.define("openkairo-panel", OpenKairoBuilder);
