/**
 * Infinity Studio - Main Entry Point
 * Orchestrates the modular system and handles Home Assistant integration.
 */
import { InfinityHistory } from './history-manager.js';
import { InfinityInteraction } from './interaction-engine.js';
import { BlockRegistry } from './block-registry.js';
import { Renderer } from './renderer.js';
import { Templates } from './templates.js';
import { AIAgent } from './ai-agent.js';

class OpenKairoBuilder extends HTMLElement {
    set panel(panel) {
        this._panel = panel;
        if (!this.content) {
            this.setupDOM();
        }
    }

    set hass(hass) {
        this._hass = hass;
        if (this.content) {
            this._updateStates();
        }
    }

    setupDOM() {
        if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
        
        // Initial State
        this.state = {
            name: 'LIVING ROOM',
            blocks: [],
            style: { glow: 40, blur: 25, color: '#00f6ff', opacity: 0.3 }
        };

        // UI Helpers
        this.selectedBlockId = null;
        this.activeLeftTab = 'BLOCKS';
        this.activeRightTab = 'STYLES';

        // Modules
        this.history = new InfinityHistory();
        this.interaction = new InfinityInteraction({
            onTap: (id) => this.selectBlock(id),
            onDouble: (id) => this._handleAction(id, 'double'),
            onHold: (id) => this._handleAction(id, 'hold')
        });

        // Initialize UI
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

        // Header Actions
        root.querySelector('#btn-save').addEventListener('click', () => this.showExport());
        root.querySelector('#btn-import').addEventListener('click', () => {
            root.querySelector('#import-modal').style.display = 'flex';
        });

        // Modal Actions
        root.querySelector('#btn-close-export').addEventListener('click', () => {
            root.querySelector('#export-modal').style.display = 'none';
        });
        root.querySelector('#btn-close-import').addEventListener('click', () => {
            root.querySelector('#import-modal').style.display = 'none';
        });
        root.querySelector('#btn-do-import').addEventListener('click', () => this._handleImport());
        root.querySelector('#btn-copy-code').addEventListener('click', () => {
            const code = root.querySelector('#export-code-box').innerText;
            navigator.clipboard.writeText(code);
            root.querySelector('#btn-copy-code').innerText = 'KOPIERT!';
            setTimeout(() => root.querySelector('#btn-copy-code').innerText = 'KOPIEREN', 2000);
        });

        // Device Previews
        ['desktop', 'tablet', 'mobile'].forEach(d => {
            root.querySelector('#dev-' + d).addEventListener('click', () => this._setDevice(d));
        });

        // Canvas Events
        const target = root.querySelector('#drop-target');
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('drop', e => this._handleDrop(e));
        target.addEventListener('click', e => {
            if (e.target.id === 'drop-target') this.selectBlock(null);
        });

        // Sidebar Tabs
        root.querySelectorAll('.sidebar-left .s-tab').forEach(t => {
            t.addEventListener('click', () => {
                root.querySelectorAll('.sidebar-left .s-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.activeLeftTab = t.dataset.tab;
                this._renderSidebars();
            });
        });

        root.querySelectorAll('.sidebar-right .s-tab').forEach(t => {
            t.addEventListener('click', () => {
                root.querySelectorAll('.sidebar-right .s-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                this.activeRightTab = t.dataset.tab;
                this.selectBlock(this.selectedBlockId);
            });
        });

        // Keyboard Shortcuts
        window.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); this.undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); this.redo(); }
            if (e.key === 'Delete' && this.selectedBlockId) this._deleteSelected();
        });
    }

    _handleDrop(e) {
        e.preventDefault();
        const root = this.shadowRoot;
        const target = root.querySelector('#drop-target');
        const rect = target.getBoundingClientRect();
        
        const moveId = e.dataTransfer.getData('move_id');
        const type = e.dataTransfer.getData('source_type');

        this._saveHistory();

        if (moveId) {
            const b = this.state.blocks.find(x => x.id === moveId);
            const ox = parseFloat(e.dataTransfer.getData('offsetX')) || 0;
            const oy = parseFloat(e.dataTransfer.getData('offsetY')) || 0;
            b.x = Math.round((e.clientX - rect.left - ox) / 12) * 12;
            b.y = Math.round((e.clientY - rect.top - oy) / 12) * 12;
        } else if (type) {
            const x = Math.round((e.clientX - rect.left - 40) / 12) * 12;
            const y = Math.round((e.clientY - rect.top - 20) / 12) * 12;
            this._addBlock(type, x, y);
        }
        this._renderAll();
    }

    _addBlock(type, x, y) {
        const id = 'b' + Math.random().toString(36).substr(2, 9);
        const b = {
            id, type, x, y, w: 120, h: 40, color: this.state.style.color, text: type, 
            glow: 20, blur: 15, opacity: 1, fontSize: 13,
            tap_action: 'toggle', double_tap_action: 'more-info', hold_action: 'none'
        };
        if (type === 'Klima-Bogen') { b.w = 140; b.h = 140; b.color = '#10b981'; }
        this.state.blocks.push(b);
        this.selectBlock(id);
    }

    _renderAll() {
        this._renderCanvas();
        this._renderSidebars();
        this._updateGlobalStyles();
    }

    _renderCanvas() {
        const board = this.shadowRoot.querySelector('#drop-target');
        if (!board) return;
        
        // Preserve Header
        const header = board.querySelector('#card-header-text');
        board.innerHTML = '';
        if(header) board.appendChild(header);

        this.state.blocks.forEach(b => {
            const el = document.createElement('div');
            el.className = 'canvas-element' + (this.selectedBlockId === b.id ? ' selected' : '');
            el.id = b.id;
            el.style.cssText = `left:${b.x}px; top:${b.y}px; width:${b.w}px; height:${b.h}px; color:${b.color};`;
            
            if(b.glow) el.style.boxShadow = `0 0 ${b.glow}px ${b.color}40`;
            if(b.blur) el.style.backdropFilter = `blur(${b.blur}px)`;

            // Specialized Renderers
            if (b.type === 'Light') el.innerHTML = BlockRegistry.renderLight(b);
            else if (b.type === 'Fan') el.innerHTML = BlockRegistry.renderFan(b);
            else if (b.type === 'Sensor') el.innerHTML = BlockRegistry.renderSensor(b);
            else if (b.type === 'Klima-Bogen') el.innerHTML = BlockRegistry.renderClimateArc(b);
            else el.innerHTML = `<span>${b.text || b.type}</span>`;

            // Selection & Interaction
            el.addEventListener('mousedown', (e) => this.interaction.handleStart(e, b.id));
            el.addEventListener('mouseup', (e) => this.interaction.handleEnd(e, b.id));
            
            // Drag Support
            el.setAttribute('draggable', 'true');
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('move_id', b.id);
                const r = el.getBoundingClientRect();
                e.dataTransfer.setData('offsetX', e.clientX - r.left);
                e.dataTransfer.setData('offsetY', e.clientY - r.top);
            });

            // Resizers
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
            left.innerHTML = `
                <div class="block-category open">Standard Library</div>
                <div class="block-grid">
                    ${BlockRegistry.getStandardBlocks().map(b => `
                        <div class="block-item b-item" data-type="${b.type}">
                            <div class="block-preview">${b.preview}</div>
                            <span>${b.type}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            left.querySelectorAll('.b-item').forEach(i => {
                i.setAttribute('draggable', 'true');
                i.addEventListener('dragstart', e => e.dataTransfer.setData('source_type', i.dataset.type));
            });
        }
        // ... templates and layers would render here
    }

    selectBlock(id) {
        this.selectedBlockId = id;
        this._renderCanvas();
        this._renderRightSidebar();
    }

    _renderRightSidebar() {
        const right = this.shadowRoot.querySelector('#right-sidebar');
        const b = this.state.blocks.find(x => x.id === this.selectedBlockId);
        
        if (!b) {
            right.innerHTML = `
                <div class="prop-group">
                    <div class="prop-header">Global Settings</div>
                    <div class="prop-row"><span>Glow Intensity</span><input type="range" id="g-glow" value="${this.state.style.glow}"></div>
                </div>`;
            return;
        }

        right.innerHTML = `
            <div class="prop-group">
                <div class="prop-header">Block: ${b.type}</div>
                <div class="prop-row"><span>Label</span><input class="prop-input" type="text" id="p-text" value="${b.text}"></div>
                <div class="prop-row"><span>Entity</span><input class="prop-input" type="text" id="p-ent" value="${b.entity || ''}"></div>
            </div>
            <div class="prop-group">
                <div class="prop-header">Interaction</div>
                <div class="prop-row"><span>Tap Action</span><select id="p-tap" class="prop-input"><option value="toggle">Toggle</option><option value="more-info">More Info</option></select></div>
            </div>
            <div style="padding:24px;"><button class="btn-primary" id="btn-del" style="background:#ef4444; color:#fff; width:100%;">ENTFERNEN</button></div>
        `;

        this.shadowRoot.querySelector('#p-text').addEventListener('input', e => { b.text = e.target.value; this._renderCanvas(); });
        this.shadowRoot.querySelector('#btn-del').addEventListener('click', () => this._deleteSelected());
    }

    _deleteSelected() {
        this._saveHistory();
        this.state.blocks = this.state.blocks.filter(x => x.id !== this.selectedBlockId);
        this.selectBlock(null);
    }

    _saveHistory() {
        this.history.push(this.state);
    }

    undo() {
        const s = this.history.undo(this.state);
        if (s) { this.state = s; this._renderAll(); }
    }

    redo() {
        const s = this.history.redo(this.state);
        if (s) { this.state = s; this._renderAll(); }
    }

    showExport() {
        const root = this.shadowRoot;
        root.querySelector('#export-code-box').innerText = Templates.exportToYAML(this.state);
        root.querySelector('#export-modal').style.display = 'flex';
    }

    _handleImport() {
        const json = this.shadowRoot.querySelector('#import-code-box').value;
        const data = Templates.importFromJSON(json);
        if (data) {
            this._saveHistory();
            this.state = data;
            this._renderAll();
            this.shadowRoot.querySelector('#import-modal').style.display = 'none';
        }
    }

    _updateGlobalStyles() {
        const target = this.shadowRoot.querySelector('#drop-target');
        if(target) target.style.boxShadow = `0 50px 100px rgba(0,0,0,0.9), inset 0 0 50px ${this.state.style.color}20`;
    }

    _handleAction(id, type) {
        console.log(`Baukasten Preview Action: ${type} on ${id}`);
    }

    _setDevice(type) {
        const canvas = this.shadowRoot.querySelector('#drop-target');
        this.shadowRoot.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));
        this.shadowRoot.querySelector('#dev-' + type).classList.add('active');
        canvas.style.width = type === 'mobile' ? '320px' : (type === 'tablet' ? '600px' : '320px');
    }

    _bindResizers(el, b) {
        // Simple resizer logic...
    }
}

customElements.define("openkairo-panel", OpenKairoBuilder);
