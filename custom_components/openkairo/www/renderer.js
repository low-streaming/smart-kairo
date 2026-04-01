/**
 * Infinity Studio - Renderer
 * Core UI template generation for the Architect panel.
 */
export const Renderer = {
    /**
     * Generates the main builder HTML structure.
     * @param {Object} state - The current card state.
     * @returns {string} The HTML string.
     */
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
                    <div class="dev-btn-group">
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

            <!-- Modals -->
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
                    <textarea id="import-code-box" class="modal-code" placeholder="Paste your layout JSON here..." style="width:100%; height:250px; background:#000; color:#10b981; border-radius:12px; padding:15px; border:1px solid rgba(255,255,255,0.1);"></textarea>
                    <div class="modal-actions">
                        <button class="btn-primary secondary" id="btn-close-import">Abbrechen</button>
                        <button class="btn-primary" id="btn-do-import">Importieren</button>
                    </div>
                </div>
            </div>
        </div>`,

    /**
     * Renders the resizer handles for a selected block.
     * @returns {string} The HTML string.
     */
    getResizers: () => `
        <div class="resizer nw"></div>
        <div class="resizer ne"></div>
        <div class="resizer sw"></div>
        <div class="resizer se"></div>`
};
