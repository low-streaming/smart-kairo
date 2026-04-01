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
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); border:1px solid ${isOn ? b.color : 'rgba(255,255,255,0.1)'}; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: ${isOn ? '0 0 20px ' + b.color + '40' : 'none'};">
                <ha-icon icon="mdi:lightbulb" style="color:${isOn ? b.color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 5px ' + b.color + ')' : 'none'};"></ha-icon>
            </div>`;
    },
    renderFan: (b) => {
        const isOn = b.state === 'on';
        const speed = b.speed || 0;
        const dur = speed > 0 ? (100 / speed) : 2;
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <ha-icon icon="mdi:fan" class="${isOn ? 'anim-fan' : ''}" style="--fan-dur:${dur}s; color:${isOn ? b.color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 5px ' + b.color + ')' : 'none'};"></ha-icon>
            </div>`;
    },
    renderSensor: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
                <div style="font-size:9px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">${b.text || 'Sensor'}</div>
                <div style="font-size:18px; font-weight:900;">${b.state || '--'}<span style="font-size:10px; opacity:0.6; margin-left:2px;">${b.unit || ''}</span></div>
            </div>`;
    },
    renderClimateArc: (b) => {
        return `
            <div class="studio-pro-arc" style="background:rgba(0,0,0,0.6); border:1px solid ${b.color}20; box-shadow: 0 10px 40px rgba(0,0,0,0.4), inset 0 0 20px ${b.color}10;">
                <div class="val" style="color:#fff; text-shadow:0 0 15px ${b.color}80;">${b.text || '21°'}</div>
            </div>`;
    },
    getStandardBlocks: () => [
        { type: 'Light', icon: 'mdi:lightbulb', preview: '<ha-icon icon="mdi:lightbulb" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Sensor', icon: 'mdi:gauge', preview: '<div style="font-size:14px; font-weight:900;">24°</div>' },
        { type: 'Fan', icon: 'mdi:fan', preview: '<ha-icon icon="mdi:fan"></ha-icon>' },
        { type: 'Klima-Bogen', icon: 'mdi:circle-slice-8', preview: '<div style="width:24px; height:24px; border:2px solid var(--kairo-cyan); border-radius:50%; border-right-color:transparent;"></div>' },
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
                    <span style="font-weight:900; letter-spacing:3px; font-size:16px;">KAIRO <span style="color:var(--kairo-cyan); filter:drop-shadow(0 0 5px var(--kairo-cyan));">ARCHITECT</span></span>
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
                    <button class="btn-primary" id="btn-save"><ha-icon icon="mdi:code-braces"></ha-icon> CODE GENERIEREN</button>
                    <button class="btn-primary" id="btn-import" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1);"><ha-icon icon="mdi:upload"></ha-icon> IMPORT</button>
                </div>
            </header>

            <div class="main-layout">
                <div class="sidebar sidebar-left">
                    <div class="sidebar-tabs">
                        <div class="s-tab active" data-tab="BLOCKS" id="tab-left-blocks">Blocks</div>
                        <div class="s-tab" data-tab="TEMPLATES" id="tab-left-templates">Templates</div>
                        <div class="s-tab" data-tab="LAYERS" id="tab-left-layers">Layers</div>
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
                        <div class="s-tab active" data-tab="PROPS" id="tab-props">Properties</div>
                        <div class="s-tab" data-tab="STYLES" id="tab-styles">Styles</div>
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
            yaml += `  - id: ${b.id}\n    type: ${b.type}\n    x: ${b.x}\n    y: ${b.y}\n    w: ${b.w || 100}\n    h: ${b.h || 40}\n    text: '${b.text || ''}'\n`;
            if (b.entity) yaml += `    entity: ${b.entity}\n`;
            yaml += `    color: '${b.color || '#fff'}'\n`;
            if (b.glow) yaml += `    glow: ${b.glow}\n`;
            if (b.animation && b.animation !== 'none') { yaml += `    animation: ${b.animation}\n    animDuration: ${b.animDuration || 2}\n`; }
            if (b.tap_action) yaml += `    tap_action: ${b.tap_action}\n`;
        });
        return yaml;
    },
    importFromJSON: (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (!data.blocks || !Array.isArray(data.blocks)) throw new Error("Invalid structure.");
            return data;
        } catch (e) {
            console.error("Import Error:", e);
            return null;
        }
    }
};

// --- MODULE: AI-AGENT ---
const AIAgent = {
    generateFromPrompt: (prompt) => {
        const p = prompt.toLowerCase();
        const newBlocks = [];
        let startX = 100, startY = 100;
        if (p.includes('light') || p.includes('licht')) {
            const count = p.match(/\d+/) ? parseInt(p.match(/\d+/)[0]) : 1;
            for(let i=0; i<count; i++) { newBlocks.push({ type: 'Light', x: startX + (i*130), y: startY, text: 'Light ' + (i+1) }); }
            startY += 120;
        }
        if (p.includes('climate') || p.includes('klima')) { newBlocks.push({ type: 'Klima-Bogen', x: startX, y: startY, text: '21°' }); startY += 160; }
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
            <link rel="stylesheet" href="/local/openkairo/styles.css?v=${Date.now()}">
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
        this.state.blocks.push(b); this.selectBlock(id);
    }
    _renderAll() { this._renderCanvas(); this._renderSidebars(); this._updateGlobalStyles(); }
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
        if (this.activeLeftTab === 'BLOCKS') {
            left.innerHTML = `<div class="block-category open">Standard Library</div><div class="block-grid">${BlockRegistry.getStandardBlocks().map(b => `<div class="block-item b-item" data-type="${b.type}"><div class="block-preview">${b.preview}</div><span>${b.type}</span></div>`).join('')}</div>`;
            left.querySelectorAll('.b-item').forEach(i => { i.setAttribute('draggable', 'true'); i.addEventListener('dragstart', e => e.dataTransfer.setData('source_type', i.dataset.type)); });
        }
    }
    selectBlock(id) { this.selectedBlockId = id; this._renderCanvas(); this._renderRightSidebar(); }
    _renderRightSidebar() {
        const right = this.shadowRoot.querySelector('#right-sidebar'), b = this.state.blocks.find(x => x.id === this.selectedBlockId);
        if (!b) { right.innerHTML = `<div class="prop-group"><div class="prop-header">Global Settings</div><div class="prop-row"><span>Glow Intensity</span><input type="range" id="g-glow" value="${this.state.style.glow}" style="width:100%"></div></div>`; this.shadowRoot.querySelector('#g-glow').addEventListener('input', e => { this.state.style.glow = e.target.value; this._updateGlobalStyles(); }); return; }
        right.innerHTML = `<div class="prop-group"><div class="prop-header">Block: ${b.type}</div><div class="prop-row"><span>Label</span><input class="prop-input" type="text" id="p-text" value="${b.text}"></div></div><div style="padding:24px;"><button class="btn-primary" id="btn-del" style="background:#ef4444; color:#fff; width:100%;">ENTFERNEN</button></div>`;
        this.shadowRoot.querySelector('#p-text').addEventListener('input', e => { b.text = e.target.value; this._renderCanvas(); });
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
