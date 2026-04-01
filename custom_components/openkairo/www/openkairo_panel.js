class OpenKairoBuilder extends HTMLElement {
  set panel(panel) {
    this._panel = panel;
    if (!this.content) {
      this.setupDOM();
    }
  }

  set hass(hass) {
    this._hass = hass;
  }

  setupDOM() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --bg-color: #09090b;
          --sidebar-bg: #111114;
          --border-color: #27272a;
          --accent-color: #3b82f6;
          --kairo-cyan: #00f6ff;
          --text-primary: #ffffff;
          --text-secondary: rgba(255,255,255,0.4);
          --input-bg: #18181b;
          font-family: 'Inter', sans-serif;
          display: flex; flex-direction: column; height: 100%; min-height: 100vh; width: 100%; overflow: hidden; background: #000; color: var(--text-primary);
        }
        
        #builder-container { display: flex; flex-direction: column; flex: 1; height: 100%; width: 100%; overflow: hidden; background: #000; position: relative; }
        
        .header { 
          height: 100%; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; 
          background: #000; z-index: 100;
        }
        header { height: 56px; }

        .header-branding { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: 0.5px; font-size: 13px; text-transform: uppercase; color: #fff; }
        .header-branding ha-icon { color: var(--kairo-cyan); filter: drop-shadow(0 0 5px var(--kairo-cyan)); --mdc-icon-size: 20px; }
        
        .header-center { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        .header-breadcrumb { color: #fff; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: 0.2s; border: 1px solid transparent; }
        .header-breadcrumb:hover { background: rgba(255,255,255,0.05); border-color: var(--border-color); }
        .header-breadcrumb ha-icon { --mdc-icon-size: 14px; opacity: 0.6; }

        .main-layout { 
          display: grid; 
          grid-template-columns: 260px 1fr 300px; 
          flex: 1; min-height: 500px; height: calc(100vh - 60px); width: 100%; 
          overflow: hidden; background: #000; border-top: 1px solid var(--border-color); 
        }
        
        .sidebar { height: 100%; background: #111114 !important; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .sidebar-right { border-left: 1px solid var(--border-color); border-right: none; }
        
        .sidebar-tabs { display: flex; border-bottom: 1px solid var(--border-color); height: 44px; min-height: 44px; align-items: center; padding: 0 10px; gap: 10px; background: rgba(0,0,0,0.3); }
        .s-tab { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); cursor: pointer; padding: 12px 10px; border-bottom: 2px solid transparent; transition: 0.3s; letter-spacing: 1px; }
        .s-tab.active { color: #fff; border-color: var(--kairo-cyan); }
        .s-tab:hover { color: #fff; }

        .sidebar-content { flex: 1; overflow-y: auto; padding: 20px; min-height: 100%; }
        
        .canvas-area { 
          height: 100%; background: #09090b; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;
          background-image: radial-gradient(circle at 1.5px 1.5px, #27272a 1px, transparent 0);
          background-size: 24px 24px;
        }
        
        #drop-target {
          background: #000;
          width: 320px; min-height: 480px; border-radius: 16px;
          position: relative; box-shadow: 0 50px 100px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.2);
          transform-origin: center center;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .btn-primary { 
          background: var(--kairo-cyan); color: #000; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 900; font-size: 10px; text-transform: uppercase;
          cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; font-family: 'Rajdhani'; letter-spacing: 0.5px;
        }
        .btn-primary:hover { box-shadow: 0 0 20px rgba(0,246,255,0.4); transform: translateY(-1px); }
        .btn-primary ha-icon { --mdc-icon-size: 16px; }

        .search-box { background: var(--input-bg); border: 1px solid var(--border-color); color: white; padding: 10px 12px; border-radius: 8px; width: 100%; box-sizing: border-box; margin-bottom: 10px; outline: none; font-size: 11px; }
        .search-box:focus { border-color: var(--kairo-cyan); }
        
        .block-category { 
          font-size: 10px; text-transform: uppercase; color: var(--text-secondary); margin: 4px 0; letter-spacing: 1.5px; font-weight: 800; 
          display:flex; align-items:center; justify-content: space-between; cursor: pointer; padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03); transition: 0.2s;
        }
        .block-category:hover { color: #fff; }
        .block-category ha-icon { --mdc-icon-size: 14px; transition: 0.3s; }
        .block-category.open ha-icon { transform: rotate(180deg); color: var(--kairo-cyan); }
        
        .block-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; height: auto; overflow: hidden; transition: 0.3s ease-out; }
        .block-grid.collapsed { height: 0; margin-bottom: 0px; opacity: 0; pointer-events: none; }
        
        .block-item { background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 4px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: grab; transition: 0.2s; }
        .block-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
        .block-item ha-icon { color: var(--text-secondary); --mdc-icon-size: 18px; }
        .block-item:hover ha-icon { color: var(--kairo-cyan); }
        .block-item span { font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); }

        .canvas-element { 
            position: absolute; cursor: default; user-select: none; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; 
            transition: box-shadow 0.3s, backdrop-filter 0.3s;
        }
        .canvas-element.selected { border: 1px solid #fff !important; z-index: 100; }
        .resizer { width: 6px; height: 6px; background: #fff; border-radius: 50%; position: absolute; display: none; border: 1.5px solid var(--bg-color); }
        .canvas-element.selected .resizer { display: block; }
        .resizer.nw { top: -3px; left: -3px; cursor: nw-resize; }
        .resizer.ne { top: -3px; right: -3px; cursor: ne-resize; }
        .resizer.sw { bottom: -3px; left: -3px; cursor: sw-resize; }
        .resizer.se { bottom: -3px; right: -3px; cursor: se-resize; }
        
        .prop-group { border-bottom: 1px solid var(--border-color); padding: 20px; }
        .prop-header { display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 800; color: var(--text-secondary); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
        .prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .prop-label { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .prop-input { background: var(--input-bg); border: 1px solid var(--border-color); color: white; padding: 8px; border-radius: 6px; font-size: 11px; width: 140px; text-align: left; color-scheme: dark; }
        .prop-input:focus { border-color: var(--kairo-cyan); outline: none; }
        
        .modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(20px); display:none; justify-content:center; align-items:center; z-index:1000; }
        .modal-content { background:#111; padding:32px; border-radius:24px; border:1px solid var(--border-color); width:560px; color:white; display:flex; flex-direction:column; gap:20px; position:relative; }
        .modal-code { background:#000; padding:20px; border-radius:12px; font-family: monospace; font-size:12px; color:#10b981; overflow:auto; max-height:400px; border:1px solid var(--border-color); }

        .dev-btn { padding: 6px; cursor: pointer; border-radius: 6px; color: var(--text-secondary); transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .dev-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .dev-btn.active { background: var(--kairo-cyan); color: #000; box-shadow: 0 0 10px var(--kairo-cyan); }
        .dev-btn ha-icon { --mdc-icon-size: 16px; }

        /* Studio Animations */
        @keyframes kairo-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes kairo-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes kairo-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes kairo-glitch { 
            0% { transform: translate(0); } 
            20% { transform: translate(-2px, 2px); } 
            40% { transform: translate(-2px, -2px); } 
            60% { transform: translate(2px, 2px); } 
            80% { transform: translate(2px, -2px); } 
            100% { transform: translate(0); } 
        }
        .anim-pulse { animation: kairo-pulse var(--dur, 2s) infinite ease-in-out; }
        .anim-breathe { animation: kairo-breathe var(--dur, 3s) infinite ease-in-out; }
        .anim-float { animation: kairo-float var(--dur, 3s) infinite ease-in-out; }
        .anim-glitch { animation: kairo-glitch var(--dur, 0.3s) infinite; }

        /* Component Styles */
        .studio-pro-arc { 
            position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:50%; 
            background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 0 15px #10b98120;
        }
        .studio-pro-arc .val { font-size:32px; font-weight:900; color:#fff; line-height:1; }
      </style>

      <div id="builder-container">
        <header class="header">
          <div class="header-branding">
            <ha-icon icon="mdi:lightning-bolt"></ha-icon> KAIRO ARCHITECT
          </div>
          <div class="header-center">
            <div class="header-breadcrumb" id="btn-rename-card">
              <ha-icon icon="mdi:view-dashboard"></ha-icon>
              <span id="breadcrumb-card-name">LIVING ROOM</span>
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </div>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
             <div style="display:flex; background:rgba(255,255,255,0.04); padding:4px; border-radius:10px; border:1px solid var(--border-color); margin-right:10px;">
                <div class="dev-btn active" id="dev-desktop"><ha-icon icon="mdi:monitor"></ha-icon></div>
                <div class="dev-btn" id="dev-tablet"><ha-icon icon="mdi:tablet-android"></ha-icon></div>
                <div class="dev-btn" id="dev-mobile"><ha-icon icon="mdi:cellphone"></ha-icon></div>
             </div>
             <button class="btn-primary" id="btn-save"><ha-icon icon="mdi:code-braces"></ha-icon> CODE GENERIEREN</button>
          </div>
        </header>

        <div class="main-layout">
          <div class="sidebar sidebar-left">
            <div class="sidebar-tabs">
              <div class="s-tab active" data-tab="BLOCKS" id="tab-left-blocks">Blocks</div>
              <div class="s-tab" data-tab="TEMPLATES" id="tab-left-templates">Templates</div>
              <div class="s-tab" data-tab="LAYERS" id="tab-left-layers">Layers</div>
            </div>
            <div class="sidebar-content" id="left-sidebar-container">STUDIO INITIALISIERUNG...</div>
          </div>

          <div class="canvas-area">
             <div id="drop-target">
                <div id="card-header-text" style="text-align:center; color:var(--kairo-cyan); font-weight:900; filter:drop-shadow(0 0 10px var(--kairo-cyan)); opacity:0.8; font-size:20px; letter-spacing:4px; padding-top:20px;">LIVING ROOM</div>
                <svg id="links-overlay" style="position:absolute; inset:0; pointer-events:none;"></svg>
             </div>
          </div>

          <div class="sidebar sidebar-right">
             <div class="sidebar-tabs">
                <div class="s-tab active" data-tab="PROPS" id="tab-props">Properties</div>
                <div class="s-tab" data-tab="STYLES" id="tab-styles">Styles</div>
             </div>
             <div class="sidebar-content" id="right-sidebar">EIGENSCHAFTEN LADEN...</div>
          </div>
        </div>

        <div id="export-modal" class="modal-overlay">
           <div class="modal-content">
              <div style="font-size:18px; font-weight:900;">KARTE EXPORTIEREN</div>
              <pre id="export-code-box" class="modal-code"></pre>
              <div style="display:flex; justify-content:flex-end; gap:12px;">
                <button class="btn-primary" style="background:rgba(255,255,255,0.05); color:#fff;" id="btn-close-modal">Abbrechen</button>
                <button class="btn-primary" id="btn-copy-code">Kopieren</button>
              </div>
           </div>
        </div>
      </div>
    `;

    this.content = true;
    this.canvasBlocks = [];
    this.canvasLinks = [];
    this.selectedBlockId = null;
    this.selectedLinkId = null;
    this.sidebarSearchQuery = '';
    this.activeRightTab = 'STYLES';
    this.cardName = 'LIVING ROOM';
    this.activeLeftTab = 'BLOCKS';
    this.cardStyle = { glow: 40, blur: 25, color: '#00f6ff', opacity: 0.3 };

    // Register Event Listeners
    this.shadowRoot.querySelector('#btn-save').addEventListener('click', () => this.showExport());
    this.shadowRoot.querySelector('#btn-close-modal').addEventListener('click', () => { this.shadowRoot.querySelector('#export-modal').style.display = 'none'; });
    this.shadowRoot.querySelector('#btn-copy-code').addEventListener('click', () => {
        const code = this.shadowRoot.querySelector('#export-code-box').innerText;
        navigator.clipboard.writeText(code);
        const btn = this.shadowRoot.querySelector('#btn-copy-code');
        btn.innerText = 'KOPIERT!';
        setTimeout(() => btn.innerText = 'KOPIEREN', 2000);
    });

    const setDevice = (type) => {
        const canvas = this.shadowRoot.querySelector('#drop-target');
        this.shadowRoot.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));
        if (type === 'desktop') canvas.style.width = '320px';
        if (type === 'tablet') canvas.style.width = '600px';
        if (type === 'mobile') canvas.style.width = '320px';
        this.shadowRoot.querySelector('#dev-' + type).classList.add('active');
        this.renderLinks();
    };
    ['desktop', 'tablet', 'mobile'].forEach(d => this.shadowRoot.querySelector('#dev-' + d).addEventListener('click', () => setDevice(d)));

    const dropTarget = this.shadowRoot.querySelector('#drop-target');
    dropTarget.addEventListener('dragover', e => e.preventDefault());
    dropTarget.addEventListener('drop', e => { e.preventDefault(); this._handleDrop(e); });
    dropTarget.addEventListener('click', e => { if(e.target.id === 'drop-target') this.selectBlock(null); });

    this.shadowRoot.querySelectorAll('.sidebar-right .s-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            this.shadowRoot.querySelectorAll('.sidebar-right .s-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.activeRightTab = tab.innerText.toUpperCase();
            this.selectBlock(this.selectedBlockId);
        });
    });

    this.shadowRoot.querySelector('#btn-rename-card').addEventListener('click', () => {
        const newName = prompt('Enter Card Name:', this.cardName);
        if (newName) {
            this.cardName = newName;
            this.shadowRoot.querySelector('#breadcrumb-card-name').innerText = newName;
            const header = this.shadowRoot.querySelector('#card-header-text');
            if (header) header.innerText = newName;
            this.selectBlock(null); // Refresh Global sidebar if open
        }
    });

    this.shadowRoot.querySelectorAll('.sidebar-left .s-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (!tab.dataset.tab) return;
            this.shadowRoot.querySelectorAll('.sidebar-left .s-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.activeLeftTab = tab.dataset.tab;
            this.renderLeftSidebar();
        });
    });

    // 5. Finalize Setup with micro-delay for HA readiness
    setTimeout(() => {
      try {
        if (this.shadowRoot) {
            this.renderCanvas();
            this.renderLeftSidebar();
            this.selectBlock(null);
        }
      } catch (e) { console.error("OpenKairo Architect Init Error:", e); }
    }, 200);
  }

  _handleDrop(e) {
    const canvas = this.shadowRoot.querySelector('#drop-target');
    const rect = canvas.getBoundingClientRect();
    const moveId = e.dataTransfer.getData('move_id');
    const type = e.dataTransfer.getData('source_type');

    if (moveId) {
        const b = this.canvasBlocks.find(x => x.id === moveId);
        const ox = parseFloat(e.dataTransfer.getData('offsetX')) || 0;
        const oy = parseFloat(e.dataTransfer.getData('offsetY')) || 0;
        b.x = Math.round((e.clientX - rect.left - ox) / 12) * 12;
        b.y = Math.round((e.clientY - rect.top - oy) / 12) * 12;
        this.renderCanvas();
        this.selectBlock(moveId);
    } else if (type) {
        const x = Math.round((e.clientX - rect.left - 40) / 12) * 12;
        const y = Math.round((e.clientY - rect.top - 20) / 12) * 12;
        this.addBlockToCanvas(type, x, y);
    }
  }

  addBlockToCanvas(type, x, y, entityId = null, parentId = null) {
    const id = 'b' + Math.random().toString(36).substr(2, 9);
    const b = {
        id, type, x, y, w: 100, h: 40, color: '#ffffff', text: type, 
        glow:0, blur:0, opacity:1, fontSize:13, animation:'none', animDuration:2, animDelay:0
    };
    if (type === 'Klima-Bogen') { b.w = 140; b.h = 140; b.color = '#10b981'; }
    this.canvasBlocks.push(b);
    this.renderCanvas();
    this.selectBlock(id);
  }

  renderCanvas() {
    const board = this.shadowRoot.querySelector('#drop-target');
    if (!board) return;
    
    // Clear and redraw
    const header = board.querySelector('#card-header-text');
    const svg = board.querySelector('#links-overlay');
    board.innerHTML = '';
    if(header) board.appendChild(header);
    if(svg) board.appendChild(svg);

    this.canvasBlocks.forEach(b => {
        const el = document.createElement('div');
        el.className = 'canvas-element' + (this.selectedBlockId === b.id ? ' selected' : '');
        el.id = b.id;
        el.style.left = b.x + 'px';
        el.style.top = b.y + 'px';
        el.style.width = (b.w || 100) + 'px';
        el.style.height = (b.h || 40) + 'px';
        el.style.color = b.color || '#fff';
        el.style.opacity = b.opacity !== undefined ? b.opacity : 1;
        el.style.fontSize = (b.fontSize || 13) + 'px';
        
        if(b.glow) el.style.boxShadow = `0 0 ${b.glow}px ${b.color}`;
        if(b.textGlow) el.style.textShadow = `0 0 ${b.textGlow}px ${b.color}`;
        if(b.blur) {
            el.style.backdropFilter = `blur(${b.blur}px)`;
            el.style.background = 'rgba(255,255,255,0.05)';
            el.style.borderRadius = '8px';
        }
        
        if (b.animation && b.animation !== 'none') {
            el.classList.add('anim-' + b.animation);
            el.style.setProperty('--dur', (b.animDuration || 2) + 's');
            el.style.setProperty('--delay', (b.animDelay || 0) + 's');
        }

        // Specialized rendering for Studio blocks
        if (b.type === 'Klima-Bogen') {
            el.innerHTML = `<div class="studio-pro-arc"><div class="val">${b.text || '21°'}</div></div>`;
        } else if (b.type === 'Neon-Switch') {
            el.innerHTML = `<div style="border:1px solid ${b.color}; border-radius:10px; padding:4px 8px; font-size:10px; font-weight:900;">SWITCH</div>`;
        } else {
            el.innerHTML = `<span>${b.text || b.type}</span>`;
        }

        el.addEventListener('click', (e) => { e.stopPropagation(); this.selectBlock(b.id); });
        el.setAttribute('draggable', 'true');
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('move_id', b.id);
            const r = el.getBoundingClientRect();
            e.dataTransfer.setData('offsetX', e.clientX - r.left);
            e.dataTransfer.setData('offsetY', e.clientY - r.top);
        });

        // Resizers
        ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const r = document.createElement('div');
            r.className = `resizer ${pos}`;
            el.appendChild(r);
            r.addEventListener('mousedown', e => { e.stopPropagation(); this._startResizing(e, b.id, pos); });
        });

        board.appendChild(el);
    });
    this.renderLinks();
  }

  _startResizing(e, id, pos) {
    const b = this.canvasBlocks.find(x => x.id === id);
    const sX = e.clientX, sY = e.clientY, sW = b.w, sH = b.h, sXP = b.x, sYP = b.y;
    const move = (me) => {
        const dx = me.clientX - sX, dy = me.clientY - sY;
        if(pos.includes('e')) b.w = Math.max(20, sW + dx);
        if(pos.includes('s')) b.h = Math.max(20, sH + dy);
        if(pos.includes('w')) { b.w = Math.max(20, sW - dx); b.x = sXP + dx; }
        if(pos.includes('n')) { b.h = Math.max(20, sH - dy); b.y = sYP + dy; }
        this.renderCanvas();
    };
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  selectBlock(id) {
    this.selectedBlockId = id;
    this.shadowRoot.querySelectorAll('.canvas-element').forEach(el => el.classList.toggle('selected', el.id === id));
    const right = this.shadowRoot.querySelector('#right-sidebar');
    if (!right) return;
    right.innerHTML = '';
    
    const b = this.canvasBlocks.find(x => x.id === id);
    if (!b) {
        if(this.activeRightTab === 'STYLES') {
            right.innerHTML = `
                <div class="prop-group">
                    <div class="prop-header">Global Studio Styles</div>
                    <div class="prop-row"><span class="prop-label">Karten-Name</span><input class="prop-input" type="text" id="g-name" value="${this.cardName}"></div>
                    <div class="prop-row"><span class="prop-label">Glow</span><input type="range" id="g-glow" min="0" max="100" value="${this.cardStyle.glow}"></div>
                    <div class="prop-row"><span class="prop-label">Blur</span><input type="range" id="g-blur" min="0" max="50" value="${this.cardStyle.blur}"></div>
                    <div class="prop-row"><span class="prop-label">Opacity</span><input type="range" id="g-opacity" min="0" max="1" step="0.1" value="${this.cardStyle.opacity}"></div>
                </div>
            `;
            this.shadowRoot.querySelector('#g-name').addEventListener('input', e => { 
                this.cardName = e.target.value; 
                this.shadowRoot.querySelector('#breadcrumb-card-name').innerText = e.target.value;
                this.shadowRoot.querySelector('#card-header-text').innerText = e.target.value;
            });
            ['glow', 'blur', 'opacity'].forEach(p => {
                this.shadowRoot.querySelector('#g-' + p).addEventListener('input', e => { 
                    this.cardStyle[p] = e.target.value; 
                    this.updateGlobalStyle(); 
                });
            });
        } else {
            right.innerHTML = '<div style="padding:40px 20px; text-align:center; opacity:0.3; font-size:11px; font-weight:700; letter-spacing:1px;">WÄHLE EIN ELEMENT AUF DEM CANVAS</div>';
        }
        return;
    }

    if (this.activeRightTab === 'STYLES') {
        right.innerHTML = `
            <div class="prop-group">
                <div class="prop-header">Layout</div>
                <div class="prop-row"><span class="prop-label">X</span><input class="prop-input" type="number" id="p-x" value="${b.x}"></div>
                <div class="prop-row"><span class="prop-label">Y</span><input class="prop-input" type="number" id="p-y" value="${b.y}"></div>
                <div class="prop-row"><span class="prop-label">W</span><input class="prop-input" type="number" id="p-w" value="${b.w}"></div>
                <div class="prop-row"><span class="prop-label">H</span><input class="prop-input" type="number" id="p-h" value="${b.h}"></div>
            </div>
            <div class="prop-group">
                <div class="prop-header">Branding</div>
                <div class="prop-row"><span class="prop-label">Farbe</span><input class="prop-input" type="color" id="p-color" value="${b.color}"></div>
                <div class="prop-row"><span class="prop-label">Glow (Outer)</span><input type="range" id="p-glow" min="0" max="100" value="${b.glow || 0}"></div>
                <div class="prop-row"><span class="prop-label">Glow (Text)</span><input type="range" id="p-tglow" min="0" max="100" value="${b.textGlow || 0}"></div>
                <div class="prop-row"><span class="prop-label">Glas-Blur</span><input type="range" id="p-blur" min="0" max="50" value="${b.blur || 0}"></div>
            </div>
            <div class="prop-group">
                <div class="prop-header">Animation</div>
                <select id="p-anim" class="prop-input" style="width:100%;">
                    <option value="none" ${b.animation === 'none' ? 'selected' : ''}>Keine</option>
                    <option value="pulse" ${b.animation === 'pulse' ? 'selected' : ''}>Pulsieren</option>
                    <option value="breathe" ${b.animation === 'breathe' ? 'selected' : ''}>Atmen</option>
                    <option value="float" ${b.animation === 'float' ? 'selected' : ''}>Schweben</option>
                    <option value="glitch" ${b.animation === 'glitch' ? 'selected' : ''}>Glitch</option>
                </select>
                <div class="prop-row" style="margin-top:10px;"><span class="prop-label">Dauer (s)</span><input type="range" id="p-adur" min="0.1" max="10" step="0.1" value="${b.animDuration || 2}"></div>
            </div>
            <div style="padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button class="btn-primary" id="btn-dup" style="background:#18181b; color:#fff;">DUPLIZIEREN</button>
                <button class="btn-primary" id="btn-del" style="background:#ef4444; color:#fff;">LÖSCHEN</button>
            </div>
        `;
        const bind = (id, field, isInt=true) => {
            const el = this.shadowRoot.querySelector(id);
            if(el) el.addEventListener('input', e => { 
                b[field] = isInt ? (id.includes('opacity') ? parseFloat(e.target.value) : parseInt(e.target.value)) : e.target.value; 
                this.renderCanvas(); 
            });
        };
        bind('#p-x', 'x'); bind('#p-y', 'y'); bind('#p-w', 'w'); bind('#p-h', 'h');
        bind('#p-color', 'color', false); bind('#p-glow', 'glow'); bind('#p-tglow', 'textGlow'); bind('#p-blur', 'blur');
        this.shadowRoot.querySelector('#p-anim').addEventListener('change', e => { b.animation = e.target.value; this.renderCanvas(); });
        this.shadowRoot.querySelector('#p-adur').addEventListener('input', e => { b.animDuration = parseFloat(e.target.value); this.renderCanvas(); });
        this.shadowRoot.querySelector('#btn-del').addEventListener('click', () => { 
            this.canvasBlocks = this.canvasBlocks.filter(x => x.id !== id); 
            this.renderCanvas(); this.selectBlock(null); 
        });
        this.shadowRoot.querySelector('#btn-dup').addEventListener('click', () => { 
            const newB = JSON.parse(JSON.stringify(b));
            newB.id = 'b' + Math.random().toString(36).substr(2, 9);
            newB.x += 20; newB.y += 20;
            this.canvasBlocks.push(newB);
            this.renderCanvas(); this.selectBlock(newB.id);
        });
    } else {
        right.innerHTML = `
            <div class="prop-group">
                <div class="prop-header">Content</div>
                <div class="prop-row"><span class="prop-label">Text</span><input class="prop-input" type="text" id="p-text" value="${b.text}"></div>
                <div class="prop-row"><span class="prop-label">Entität</span><input class="prop-input" type="text" id="p-ent" value="${b.entity || ''}" placeholder="sensor.xyz"></div>
            </div>
            <div class="prop-group">
                <div class="prop-header">Interaktion</div>
                <div class="prop-row"><span class="prop-label">Tap Action</span>
                    <select id="p-tap" class="prop-input">
                        <option value="none" ${b.tapAction === 'none' ? 'selected' : ''}>Keine</option>
                        <option value="toggle" ${b.tapAction === 'toggle' ? 'selected' : ''}>Sichtbar/Toggle</option>
                        <option value="more-info" ${b.tapAction === 'more-info' ? 'selected' : ''}>Info-Fenster</option>
                    </select>
                </div>
            </div>
        `;
        this.shadowRoot.querySelector('#p-text').addEventListener('input', e => { b.text = e.target.value; this.renderCanvas(); });
        this.shadowRoot.querySelector('#p-ent').addEventListener('input', e => { b.entity = e.target.value; });
        this.shadowRoot.querySelector('#p-tap').addEventListener('change', e => { b.tapAction = e.target.value; b.action = b.tapAction; });
    }
  }

  updateGlobalStyle() {
    const board = this.shadowRoot.querySelector('#drop-target');
    board.style.boxShadow = `0 0 ${this.cardStyle.glow}px ${this.cardStyle.color}`;
  }

  renderLinks() {
    const svg = this.shadowRoot.querySelector('#links-overlay');
    if(svg) svg.innerHTML = '';
  }

  showExport() {
    const modal = this.shadowRoot.querySelector('#export-modal');
    const box = this.shadowRoot.querySelector('#export-code-box');
    
    let yaml = `type: 'custom:openkairo-custom-card'\n`;
    yaml += `name: '${this.cardName}'\n`;
    yaml += `glow: ${this.cardStyle.glow}\n`;
    yaml += `blur: ${this.cardStyle.blur}\n`;
    yaml += `color: '${this.cardStyle.color}'\n`;
    yaml += `opacity: ${this.cardStyle.opacity}\n`;
    yaml += `layout:\n`;
    
    this.canvasBlocks.forEach(b => {
        yaml += `  - id: ${b.id}\n`;
        yaml += `    type: ${b.type}\n`;
        yaml += `    x: ${b.x}\n`;
        yaml += `    y: ${b.y}\n`;
        yaml += `    w: ${b.w || 100}\n`;
        yaml += `    h: ${b.h || 40}\n`;
        yaml += `    text: '${b.text || ''}'\n`;
        if (b.entity) yaml += `    entity: ${b.entity}\n`;
        yaml += `    color: '${b.color || '#fff'}'\n`;
        if (b.glow) yaml += `    glow: ${b.glow}\n`;
        if (b.textGlow) yaml += `    textGlow: ${b.textGlow}\n`;
        if (b.blur) yaml += `    blur: ${b.blur}\n`;
        if (b.animation && b.animation !== 'none') {
            yaml += `    animation: ${b.animation}\n`;
            yaml += `    animDuration: ${b.animDuration || 2}\n`;
        }
        if (b.tapAction) yaml += `    tapAction: ${b.tapAction}\n`;
    });
    
    box.innerText = yaml;
    modal.style.display = 'flex';
  }

  renderLeftSidebar() {
    const container = this.shadowRoot.querySelector('#left-sidebar-container');
    if (!container) return;

    if (this.activeLeftTab === 'TEMPLATES') {
        const temps = [
            { id: 'Climate', name: 'Climate Suite', icon: 'mdi:thermostat' },
            { id: 'Energy', name: 'Energy Hub', icon: 'mdi:flash' }
        ];
        container.innerHTML = `
            <div class="block-category open">Studio Templates</div>
            <div class="block-grid">
               ${temps.map(t => `
                   <div class="block-item t-item" data-id="${t.id}">
                       <ha-icon icon="${t.icon}"></ha-icon>
                       <span>${t.name}</span>
                   </div>
               `).join('')}
            </div>
        `;
        container.querySelectorAll('.t-item').forEach(item => {
            item.addEventListener('click', () => this._injectTemplate(item.dataset.id));
        });
        return;
    }

    if (this.activeLeftTab === 'LAYERS') {
        container.innerHTML = `
            <div class="block-category open">Struktur</div>
            ${this.canvasBlocks.map(b => `
                <div class="block-item layer-item ${this.selectedBlockId === b.id ? 'active' : ''}" 
                     style="flex-direction:row; justify-content:flex-start; padding:8px 12px; gap:12px; width:100%; box-sizing:border-box; margin-bottom:4px; ${this.selectedBlockId === b.id ? 'border-color:var(--kairo-cyan);' : ''}" 
                     data-id="${b.id}">
                    <ha-icon icon="mdi:layers-outline" style="--mdc-icon-size:14px;"></ha-icon>
                    <span style="text-transform:none; font-size:11px;">${b.text || b.type}</span>
                </div>
            `).join('')}
        `;
        container.querySelectorAll('.layer-item').forEach(item => {
            item.addEventListener('click', () => this.selectBlock(item.dataset.id));
        });
        return;
    }

    const blocks = [
        { name: 'Box', icon: 'mdi:square-outline' },
        { name: 'Text', icon: 'mdi:format-text' },
        { name: 'Container', icon: 'mdi:crop-square' },
        { name: 'Card', icon: 'mdi:card-outline' },
        { name: 'Neon-Switch', icon: 'mdi:toggle-switch' },
        { name: 'Klima-Bogen', icon: 'mdi:circle-slice-8' },
        { name: 'Energie-Ring', icon: 'mdi:circle-outline' },
        { name: 'Media-Player', icon: 'mdi:play-circle' }
    ];
    container.innerHTML = `
        <input type="text" class="search-box" placeholder="Suche..." id="s-search" value="${this.sidebarSearchQuery || ''}">
        <div class="block-category open">Standard Blocks</div>
        <div class="block-grid">
            ${blocks.filter(b => b.name.toLowerCase().includes((this.sidebarSearchQuery || '').toLowerCase())).map(b => `
                <div class="block-item b-item" data-type="${b.name}">
                    <ha-icon icon="${b.icon}"></ha-icon>
                    <span>${b.name}</span>
                </div>
            `).join('')}
        </div>
    `;
    container.querySelectorAll('.b-item').forEach(item => {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', e => e.dataTransfer.setData('source_type', item.dataset.type));
    });
    const src = container.querySelector('#s-search');
    if (src) {
        src.addEventListener('input', e => { this.sidebarSearchQuery = e.target.value; this.renderLeftSidebar(); });
    }
  }
}
customElements.define("openkairo-panel", OpenKairoBuilder);
