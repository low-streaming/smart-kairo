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
    this.attachShadow({ mode: 'open' });
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
          display: flex; flex-direction: column; height: 100vh; width: 100%; overflow: hidden; background: var(--bg-color); color: var(--text-primary);
        }
        
        #builder-container { display: flex; flex-direction: column; height: 100%; width: 100%; }
        
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

        .main-layout { display: flex; flex: 1; overflow: hidden; position: relative; }
        
        .sidebar { width: 260px; background: var(--sidebar-bg); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; }
        .sidebar-right { border-left: 1px solid var(--border-color); border-right: none; width: 300px; }
        
        .sidebar-tabs { display: flex; border-bottom: 1px solid var(--border-color); height: 44px; align-items: center; padding: 0 10px; gap: 10px; background: rgba(0,0,0,0.2); }
        .s-tab { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); cursor: pointer; padding: 12px 10px; border-bottom: 2px solid transparent; transition: 0.3s; letter-spacing: 1px; }
        .s-tab.active { color: #fff; border-color: var(--kairo-cyan); }
        .s-tab:hover { color: #fff; }

        .sidebar-content { flex: 1; overflow-y: auto; padding: 20px; }
        
        .canvas-area { 
          flex: 1; background: var(--bg-color); overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center;
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

        .canvas-element { position: absolute; cursor: default; user-select: none; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; }
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
      </style>

      <div id="builder-container">
        <header class="header">
          <div class="header-branding">
            <ha-icon icon="mdi:lightning-bolt"></ha-icon> KAIRO ARCHITECT
          </div>
          
          <div class="header-center">
            <div class="header-breadcrumb" id="btn-rename-card">
              <ha-icon icon="mdi:view-dashboard"></ha-icon>
              <span id="breadcrumb-card-name">${this.cardName}</span>
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </div>
          </div>
          
          <div style="display:flex; gap:16px; align-items:center;">
             <div style="display:flex; gap:10px; align-items:center; background:rgba(255,255,255,0.04); padding:4px 10px; border-radius:8px; border:1px solid var(--border-color);">
                <span style="font-size:9px; font-weight:900; color:var(--text-secondary);">PREVIEW</span>
                <select id="theme-selector" style="background:transparent; border:none; color:#fff; font-size:10px; font-weight:800; text-transform:uppercase; outline:none; cursor:pointer;">
                    <option value="cyan">Platinum Cyan</option>
                    <option value="matrix">Matrix Green</option>
                    <option value="synth">Synth Night</option>
                    <option value="icarus">Icarus Gold</option>
                    <option value="overdrive">Overdrive Hologram</option>
                </select>
             </div>
             <button class="btn-primary" id="btn-save">
                <ha-icon icon="mdi:code-braces"></ha-icon> CODE GENERIEREN
             </button>
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
                <div id="card-header-text" style="text-align:center; font-family:'Inter'; color:var(--kairo-cyan); font-weight:900; filter:drop-shadow(0 0 10px var(--kairo-cyan)); opacity:0.8; font-size:20px; letter-spacing:4px; text-transform:uppercase; margin-top:20px;">LIVING ROOM</div>
                <svg id="links-overlay" style="position:absolute; inset:0; pointer-events:none;"></svg>
             </div>
          </div>

          <div class="sidebar sidebar-right">
             <div class="sidebar-tabs">
                <div class="s-tab active" id="tab-props">Properties</div>
                <div class="s-tab" id="tab-styles">Styles</div>
             </div>
             <div class="sidebar-content" id="right-sidebar"></div>
          </div>
        </div>
        
        <div id="export-modal" class="modal-overlay">
           <div class="modal-content">
              <div style="font-size:18px; font-weight:900; color:#fff;">KARTE EXPORTIEREN</div>
              <div style="font-size:11px; color:var(--text-secondary);">Kopiere diesen YAML-Code in dein Home Assistant Dashboard.</div>
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

    this._updateTheme = (theme) => {
        const colors = {
           cyan: '#00f6ff',
           amber: '#ffb000',
           magenta: '#ec4899',
           gold: '#c6a34f',
           matrix: '#00ff41'
        };
        const color = colors[theme.toLowerCase()] || colors.cyan;
        this.cardStyle.color = color;
        this.cardStyle.glow = theme === 'overdrive' ? 60 : 40;
        this._updateCardStyle();
        
        // Update header color
        const header = this.shadowRoot.querySelector('#card-header-text');
        if(header) header.style.color = color;
        
        // Update variables for styles
        this.style.setProperty('--kairo-cyan', color);
    };

    const updateCardStyle = () => {
        const board = this.shadowRoot.querySelector('#drop-target');
        if (!board) return;
        board.style.boxShadow = this.cardStyle.glow > 0 ? `0 30px 60px rgba(0,0,0,0.8), 0 0 ${this.cardStyle.glow}px ${this.cardStyle.color}` : '0 30px 60px rgba(0,0,0,0.8)';
        board.style.backdropFilter = `blur(${this.cardStyle.blur}px)`;
        board.style.border = `1px solid ${this.cardStyle.color}40`;
        const header = this.shadowRoot.querySelector('#card-header-text');
        if(header) header.style.color = this.cardStyle.color;
    };
    this._updateCardStyle = updateCardStyle;


    // Tab Handlers Right
    const rightTabs = this.shadowRoot.querySelectorAll('.sidebar-right .s-tab');
    rightTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            rightTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.activeRightTab = tab.innerText.toUpperCase();
            this.selectBlock(this.selectedBlockId);
        });
    });

    const leftTabs = this.shadowRoot.querySelectorAll('.sidebar-left .s-tab');
    leftTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            leftTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.activeLeftTab = tab.dataset.tab;
            this.renderLeftSidebar();
        });
    });

    // Other Handlers
    this.shadowRoot.querySelector('#btn-save').addEventListener('click', () => this.showExport());
    this.shadowRoot.querySelector('#btn-close-modal').addEventListener('click', () => { this.shadowRoot.querySelector('#export-modal').style.display = 'none'; });
    this.shadowRoot.querySelector('#btn-copy-code').addEventListener('click', () => {
        const code = this.shadowRoot.querySelector('#export-code-box').innerText;
        navigator.clipboard.writeText(code);
        const btn = this.shadowRoot.querySelector('#btn-copy-code');
        btn.innerText = 'KOPIERT!';
        setTimeout(() => btn.innerText = 'KOPIEREN', 2000);
    });

    this.shadowRoot.querySelector('#theme-selector').addEventListener('change', e => {
        this._updateTheme(e.target.value);
    });

    this.shadowRoot.querySelector('#drop-target').addEventListener('click', (e) => {
        if(e.target.id === 'drop-target') this.selectBlock(null);
    });

    const canvas = this.shadowRoot.querySelector('#drop-target');
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
      e.preventDefault();
      const moveId = e.dataTransfer.getData('move_id');
      const sourceType = e.dataTransfer.getData('source_type');
      const sourceEntity = e.dataTransfer.getData('source_entity');
      const canvasRect = canvas.getBoundingClientRect();
      const gridSize = 20;

      // 1. MOVE EXISTING BLOCK
      if (moveId) {
        const el = this.querySelector('#' + moveId);
        const ox = parseFloat(e.dataTransfer.getData('offsetX')) || 0;
        const oy = parseFloat(e.dataTransfer.getData('offsetY')) || 0;
        let dropX = Math.round((e.clientX - canvasRect.left - ox) / 12) * 12;
        let dropY = Math.round((e.clientY - canvasRect.top - oy) / 12) * 12;
        
        const b = this.canvasBlocks.find(x => x.id === moveId);
        if(b) {
          const dx = dropX - b.x;
          const dy = dropY - b.y;
          b.x = dropX; b.y = dropY;
          el.style.left = dropX + 'px';
          el.style.top = dropY + 'px';
          
          this.canvasBlocks.filter(x => x.parentId === moveId).forEach(child => {
            child.x += dx; child.y += dy;
            const childEl = this.querySelector('#' + child.id);
            if(childEl) { childEl.style.left = child.x + 'px'; childEl.style.top = child.y + 'px'; }
          });
        }
        this.selectBlock(moveId);
      } 
      // 2. ASSIGN ENTITY TO EXISTING BLOCK
      else if (sourceEntity && e.target.closest('.canvas-element')) {
        const targetEl = e.target.closest('.canvas-element');
        const b = this.canvasBlocks.find(x => x.id === targetEl.id);
        if(b) {
            b.entity = sourceEntity;
            if(!b.text || b.text === b.type) b.text = sourceEntity.split('.')[1];
            this.selectBlock(b.id);
        }
      }
      // 3. ADD NEW BLOCK
      else if (sourceType) {
        let dropX = Math.round((e.clientX - canvasRect.left - 40) / 12) * 12;
        let dropY = Math.round((e.clientY - canvasRect.top - 20) / 12) * 12;
        
        const targetBlock = e.target.closest('.canvas-element');
        let pId = null;
        if (targetBlock) {
          const tb = this.canvasBlocks.find(x => x.id === targetBlock.id);
          if (tb && (tb.type === 'Container' || tb.type === 'Card')) pId = tb.id;
        }
        
        const type = sourceType === 'Entity State' ? 'Badge' : sourceType;
        this.addBlockToCanvas(type, dropX, dropY, sourceEntity, pId);
      }
      this.renderLinks();
    });

    canvas.addEventListener('click', () => {
      this.selectedLinkId = null;
      this.selectBlock(null);
    });

    this.querySelector('#btn-save').addEventListener('click', () => {
      let exportObj = {
          type: 'custom:openkairo-custom-card',
          name: this.cardName,
          glow: parseInt(this.cardStyle.glow),
          blur: parseInt(this.cardStyle.blur),
          opacity: parseFloat(this.cardStyle.opacity),
          layout: this.canvasBlocks.map(b => {
              let item = {
                  type: b.type,
                  id: b.id,
                  x: b.x,
                  y: b.y,
                  color: b.color
              };
              if (b.w !== undefined) item.w = b.w;
              if (b.h !== undefined) item.h = b.h;
              if (b.entity) item.entity = b.entity;
              if (b.text) item.text = b.text;
              if (b.glow) item.glow = parseInt(b.glow);
              if (b.textGlow) item.textGlow = parseInt(b.textGlow);
              if (b.blur) item.blur = parseInt(b.blur);
              if (b.opacity !== undefined) item.opacity = parseFloat(b.opacity);
              if (b.action && b.action !== 'none') item.action = b.action;
              if (b.parentId) item.parentId = b.parentId;
              if (b.fontSize) item.fontSize = parseInt(b.fontSize);
              return item;
          })
      };

      // Simple YAML stringifier
      const toYaml = (obj, indent = 0) => {
          let res = '';
          const spaces = ' '.repeat(indent);
          for (let key in obj) {
              const val = obj[key];
              if (Array.isArray(val)) {
                  res += `${spaces}${key}:\n`;
                  val.forEach(item => {
                      res += `${spaces}  - `;
                      let first = true;
                      for (let subKey in item) {
                          const subVal = item[subKey];
                          if (!first) res += `${spaces}    `;
                          res += `${subKey}: ${typeof subVal === 'string' ? `"${subVal}"` : subVal}\n`;
                          first = false;
                      }
                  });
              } else {
                  res += `${spaces}${key}: ${typeof val === 'string' ? `"${val}"` : val}\n`;
              }
          }
          return res;
      };

      this.querySelector('#export-code-box').innerText = toYaml(exportObj);
      this.querySelector('#export-modal').style.display = 'flex';
    });
    
    // Add global updateCardStyle to be accessible in selectBlock
    this._updateCardStyle = updateCardStyle;

    this.querySelector('#btn-close-modal').addEventListener('click', () => this.querySelector('#export-modal').style.display = 'none');
    this.querySelector('#btn-copy-code').addEventListener('click', () => {
      navigator.clipboard.writeText(this.querySelector('#export-code-box').innerText);
      alert("Copied!");
    });

    this.querySelector('#theme-selector').addEventListener('change', e => {
        this._updateTheme(e.target.value);
    });

    window.addEventListener('keydown', (e) => {
        if (!this.selectedBlockId) return;
        const b = this.canvasBlocks.find(x => x.id === this.selectedBlockId);
        if (!b) return;

        // Skip if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        const snap = 1;
        if (e.key === 'ArrowLeft') b.x -= snap;
        else if (e.key === 'ArrowRight') b.x += snap;
        else if (e.key === 'ArrowUp') b.y -= snap;
        else if (e.key === 'ArrowDown') b.y += snap;
        else if (e.key === 'Delete') {
            const el = this.querySelector('#' + b.id);
            if(el) el.remove();
            this.canvasBlocks = this.canvasBlocks.filter(x => x.id !== b.id);
            this.selectBlock(null);
            this.renderLinks();
            return;
        } else return;

        e.preventDefault();
        this.selectBlock(b.id);
    });

    this.querySelector('#drop-target').addEventListener('dragover', e => e.preventDefault());
    this.querySelector('#drop-target').addEventListener('drop', e => {
      e.preventDefault();
      const moveId = e.dataTransfer.getData('move_id');
      const type = e.dataTransfer.getData('block_type');
      const r = this.querySelector('#drop-target').getBoundingClientRect();

      if (moveId) {
        const b = this.canvasBlocks.find(x => x.id === moveId);
        const offsetX = e.dataTransfer.getData('offsetX');
        const offsetY = e.dataTransfer.getData('offsetY');
        // Snapping: 12px
        b.x = Math.round((e.clientX - r.left - offsetX) / 12) * 12;
        b.y = Math.round((e.clientY - r.top - offsetY) / 12) * 12;
        this.selectBlock(moveId);
      } else if (type) {
        const x = Math.round((e.clientX - r.left - 20) / 12) * 12;
        const y = Math.round((e.clientY - r.top - 20) / 12) * 12;
        this.addBlockToCanvas(type, x, y);
      }
    });
  }

  addBlockToCanvas(type, x, y, entityId = null, parentId = null) {
    const blockId = 'b' + Date.now();
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.id = blockId;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.zIndex = parentId ? '20' : '10';
    if(type === 'Container' || type === 'Card') el.style.zIndex = '5';
    
    el.style.background = 'rgba(16,185,129,0.15)';
    
    let label = entityId || type;
    if (type === 'Klima-Bogen') {
        el.style.width = '140px'; el.style.height = '140px'; el.style.background = 'transparent';
        el.innerHTML = `
             <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 0 15px #10b98120;">
                <svg viewBox="0 0 100 100" style="position:absolute; top:0; left:0; width:100%; height:100%; transform:rotate(-90deg);">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="6" />
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" stroke-width="6" stroke-dasharray="290" stroke-dashoffset="70" />
                </svg>
                <div style="text-align:center; z-index:2;">
                    <div style="font-size:32px; font-weight:900; color:#fff; line-height:1;">21°</div>
                    <div style="font-size:10px; color:#10b981; text-transform:uppercase; margin-top:6px; letter-spacing:2px; font-weight:800;">HEAT</div>
                </div>
             </div>
        `;
    } else if (type === 'Modus-Schalter') {
        el.innerHTML = `<div style="display:flex; gap:8px; background:rgba(0,0,0,0.4); padding:8px; border-radius:16px; border:1px solid rgba(255,255,255,0.08); box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
             <div style="padding:8px 16px; border-radius:10px; background:#10b981; color:#fff; font-size:11px; text-transform:uppercase; font-weight:900; box-shadow: 0 0 20px rgba(16,185,129,0.4);">HEAT</div>
             <div style="padding:8px 16px; border-radius:10px; background:transparent; color:rgba(255,255,255,0.4); font-size:11px; text-transform:uppercase; font-weight:900;">AUTO</div>
        </div>`;
    } else if (type === 'Energie-Ring') {
        el.style.width = '100px'; el.style.height = '100px'; el.style.background = 'transparent';
        el.innerHTML = `
             <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                <div style="position:absolute; width:100%; height:100%; border-radius:50%; border:1px solid #06b6d4; opacity:0.1; box-shadow:inset 0 0 20px #06b6d440;"></div>
                <div style="text-align:center; z-index:2;">
                    <div style="font-size:22px; font-weight:900; color:#fff; line-height:1; text-shadow: 0 0 15px #06b6d460;">450</div>
                    <div style="font-size:10px; color:#06b6d4; font-weight:900; text-transform:uppercase; margin-top:4px; letter-spacing:1px;">W</div>
                </div>
             </div>
        `;
    } else if (type === 'Weather-Card') {
        el.innerHTML = `
             <div style="padding:15px; background:rgba(255,255,255,0.03); border-radius:20px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:15px; backdrop-filter:blur(10px);">
                <ha-icon icon="mdi:weather-sunny" style="--mdc-icon-size:40px; color:#fbbf24; filter:drop-shadow(0 0 10px #fbbf2460);"></ha-icon>
                <div>
                    <div style="font-size:24px; font-weight:900; color:#fff;">18°</div>
                    <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase;">Sunny</div>
                </div>
             </div>
        `;
    } else if (type === 'Media-Player') {
        el.innerHTML = `
             <div style="width:250px; padding:15px; background:rgba(0,0,0,0.4); border-radius:24px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:12px; backdrop-filter:blur(15px);">
                <div style="display:flex; gap:12px; align-items:center;">
                    <div style="width:50px; height:50px; background:linear-gradient(45deg, #7c3aed, #db2777); border-radius:12px; display:flex; align-items:center; justify-content:center;">
                        <ha-icon icon="mdi:music" style="color:#fff;"></ha-icon>
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:900; color:#fff;">Cyberpunk 2077 OST</div>
                        <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase;">Hyper</div>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:20px; align-items:center;">
                    <ha-icon icon="mdi:skip-previous" style="color:rgba(255,255,255,0.6);"></ha-icon>
                    <div style="width:40px; height:40px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#000; box-shadow:0 0 20px rgba(255,255,255,0.4);">
                        <ha-icon icon="mdi:pause"></ha-icon>
                    </div>
                    <ha-icon icon="mdi:skip-next" style="color:rgba(255,255,255,0.6);"></ha-icon>
                </div>
             </div>
        `;
    } else if (type === 'Hex-Power') {
        el.style.width = '80px'; el.style.height = '90px'; el.style.background = 'transparent';
        el.innerHTML = `
             <div style="width:100%; height:100%; background:var(--kairo-cyan); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; align-items:center; justify-content:center; opacity:0.8; box-shadow:0 0 20px var(--kairo-cyan);">
                <div style="width:90%; height:90%; background:#000; clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <ha-icon icon="mdi:flash" style="--mdc-icon-size:20px; color:var(--kairo-cyan);"></ha-icon>
                    <div style="font-size:14px; font-weight:900; color:#fff;">ON</div>
                </div>
             </div>
        `;
    } else if (type === 'Pulse-Chart') {
        el.style.width = '200px'; el.style.height = '80px'; el.style.background = 'rgba(0,0,0,0.4)';
        el.style.borderRadius = '12px'; el.style.border = '1px solid rgba(255,255,255,0.05)';
        el.innerHTML = `
             <div style="width:100%; height:100%; padding:10px; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-size:9px; color:var(--kairo-cyan); font-weight:900; letter-spacing:1px; text-transform:uppercase;">Network Load</span>
                    <span style="font-size:9px; color:#fff; font-weight:900;">2.4 MB/s</span>
                </div>
                <div style="flex:1; display:flex; align-items:flex-end; gap:2px;">
                    <div style="flex:1; background:var(--kairo-cyan); height:40%; opacity:0.3;"></div>
                    <div style="flex:1; background:var(--kairo-cyan); height:60%; opacity:0.5;"></div>
                    <div style="flex:1; background:var(--kairo-cyan); height:30%; opacity:0.3;"></div>
                    <div style="flex:1; background:var(--kairo-cyan); height:80%; opacity:0.8; box-shadow:0 0 10px var(--kairo-cyan);"></div>
                    <div style="flex:1; background:var(--kairo-cyan); height:50%; opacity:0.5;"></div>
                </div>
             </div>
        `;
    } else if (type === 'Glitch-Text') {
        el.innerHTML = `<span style="text-shadow: 2px 0 red, -2px 0 blue; font-weight:900; letter-spacing:2px; font-size:18px;">${label}</span>`;
    } else {
        el.innerHTML = `<span style="text-shadow: 0 0 10px rgba(255,255,255,0.2);">${label}</span>`;
    }
    
    el.addEventListener('click', e => {
      e.stopPropagation();
      if(this.linkMode) {
        if(!this.linkSourceId) { this.linkSourceId = blockId; el.style.outline = '2px solid #10b981'; }
        else { this.canvasLinks.push({source:this.linkSourceId, target:blockId}); this.linkSourceId=null; this.renderLinks(); }
      } else { this.selectBlock(blockId); }
    });

    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => {
      if (e.target.classList.contains('resizer')) { e.preventDefault(); return; }
      e.dataTransfer.setData('move_id', blockId);
      const r = el.getBoundingClientRect();
      e.dataTransfer.setData('offsetX', e.clientX - r.left);
      e.dataTransfer.setData('offsetY', e.clientY - r.top);
    });

    // Add Resizers
    const resizers = ['nw','ne','sw','se'];
    resizers.forEach(pos => {
        const r = document.createElement('div');
        r.className = `resizer ${pos}`;
        el.appendChild(r);
        r.addEventListener('mousedown', e => {
            e.stopPropagation();
            this._startResizing(e, blockId, pos);
        });
    });

    // Inline Editing
    if (el.querySelector('span')) {
        const span = el.querySelector('span');
        span.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.value = b.text;
            input.style.cssText = `background: #000; color: #fff; border: 1px solid #fff; font-family: inherit; font-size: ${b.fontSize}px; width: 100%; text-align: center; outline: none; z-index: 1000;`;
            span.replaceWith(input);
            input.focus();
            const finish = () => {
                b.text = input.value;
                input.replaceWith(span);
                this.selectBlock(blockId);
            };
            input.addEventListener('blur', finish);
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(); });
        });
    }

    this.querySelector('#drop-target').appendChild(el);
    this.canvasBlocks.push({
        id: blockId, type: type, x: x, y: y, w: el.offsetWidth || 100, h: el.offsetHeight || 40,
        color: '#ffffff', entity: entityId, 
        text: type === 'Text' ? 'Dein Text' : (entityId ? entityId.split('.')[1] : type),
        glow: 0, textGlow: 0, blur: 0, opacity: 1, fontSize: 13,
        action: 'none', parentId: parentId
    });
    this.selectBlock(blockId);
  }

  _injectTemplate(type) {
    const r = this.querySelector('#drop-target').getBoundingClientRect();
    const cx = 100, cy = 100;
    
    if (type === 'Climate') {
        const cId = 'b' + Date.now();
        this.addBlockToCanvas('Container', cx, cy);
        const b = this.canvasBlocks[this.canvasBlocks.length-1];
        b.w = 280; b.h = 180; b.blur = 20; b.opacity = 0.3;
        this.addBlockToCanvas('Klima-Bogen', cx + 70, cy + 20, null, cId);
        this.addBlockToCanvas('Text', cx + 10, cy + 10, null, cId);
        this.canvasBlocks[this.canvasBlocks.length-1].text = "WOHNZIMMER";
    } else if (type === 'Energy') {
        this.addBlockToCanvas('Card', cx, cy);
        const b = this.canvasBlocks[this.canvasBlocks.length-1];
        b.w = 320; b.h = 240; b.color = '#00f6ff'; b.glow = 30;
        const cId = b.id;
        this.addBlockToCanvas('Pulse-Chart', cx + 20, cy + 60, null, cId);
        this.addBlockToCanvas('Hex-Power', cx + 230, cy + 100, null, cId);
    } else if (type === 'Switch') {
        const cId = 'b' + Date.now();
        this.addBlockToCanvas('Container', cx, cy);
        const b = this.canvasBlocks[this.canvasBlocks.length-1];
        b.w = 120; b.h = 120; b.blur = 10;
        this.addBlockToCanvas('Hex-Power', cx + 20, cy + 15, null, b.id);
    } else if (type === 'SmartSuite') {
        const cId = 'b' + Date.now();
        this.addBlockToCanvas('Card', cx, cy);
        const b = this.canvasBlocks[this.canvasBlocks.length-1];
        b.w = 340; b.h = 300; b.color = '#7c3aed'; b.glow = 40;
        this.addBlockToCanvas('Status-Pill', cx + 20, cy + 20, null, b.id);
        this.addBlockToCanvas('Neon-Switch', cx + 20, cy + 60, null, b.id);
        this.addBlockToCanvas('Slider-Dimmer', cx + 20, cy + 180, null, b.id);
        this.addBlockToCanvas('Glass-Action', cx + 180, cy + 60, null, b.id);
    }
  }

  _startResizing(e, id, pos) {
    const b = this.canvasBlocks.find(x => x.id === id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = b.w;
    const startH = b.h;
    const startPosX = b.x;
    const startPosY = b.y;

    const onMouseMove = (moveE) => {
        const dx = moveE.clientX - startX;
        const dy = moveE.clientY - startY;

        if (pos.includes('e')) b.w = Math.max(20, startW + dx);
        if (pos.includes('w')) {
            const newW = Math.max(20, startW - dx);
            if (newW > 20) { b.w = newW; b.x = startPosX + dx; }
        }
        if (pos.includes('s')) b.h = Math.max(20, startH + dy);
        if (pos.includes('n')) {
            const newH = Math.max(20, startH - dy);
            if (newH > 20) { b.h = newH; b.y = startPosY + dy; }
        }
        this.selectBlock(id); // Updatet HUD-UI
    };

    const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  duplicateBlock(id) {
    const b = this.canvasBlocks.find(x => x.id === id);
    if (!b) return;
    const newId = 'b' + Date.now();
    const newBlock = JSON.parse(JSON.stringify(b));
    newId = 'b' + Math.random().toString(36).substr(2, 9);
    newBlock.id = newId;
    newBlock.x += 20;
    newBlock.y += 20;
    
    // Create DOM element
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.id = newId;
    el.style.left = newBlock.x + 'px';
    el.style.top = newBlock.y + 'px';
    el.style.zIndex = newBlock.parentId ? '20' : '10';
    
    // Copy innerHTML from source
    const sourceEl = this.shadowRoot.querySelector('#' + id);
    if(sourceEl) el.innerHTML = sourceEl.innerHTML;
    
    el.addEventListener('click', e => {
      e.stopPropagation();
      this.selectBlock(newId);
    });

    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('move_id', newId);
      const r = el.getBoundingClientRect();
      e.dataTransfer.setData('offsetX', e.clientX - r.left);
      e.dataTransfer.setData('offsetY', e.clientY - r.top);
    });

    this.shadowRoot.querySelector('#drop-target').appendChild(el);
    this.canvasBlocks.push(newBlock);
    this.selectBlock(newId);
  }

  moveLayer(id, dir) {
    const el = this.shadowRoot.querySelector('#' + id);
    if(!el) return;
    const currentZ = parseInt(el.style.zIndex) || 10;
    const newZ = dir === 'up' ? currentZ + 1 : Math.max(1, currentZ - 1);
    el.style.zIndex = newZ;
    const b = this.canvasBlocks.find(x => x.id === id);
    if(b) b.zIndex = newZ;
  }

  selectBlock(id) {
    this.selectedBlockId = id;
    if (id) this.selectedLinkId = null;
    this.querySelectorAll('.canvas-element').forEach(el => el.classList.remove('selected'));
    const right = this.shadowRoot.querySelector('#right-sidebar');
    if(!right) return;

    if(id) {
      const el = this.shadowRoot.querySelector('#' + id);
      el.classList.add('selected');
      const b = this.canvasBlocks.find(x => x.id === id);

      const updateUI = () => {
        if(!el) return;
        el.style.left = b.x + 'px'; el.style.top = b.y + 'px';
        el.style.width = b.w + 'px'; el.style.height = b.h + 'px';
        el.style.color = b.color;
        el.style.boxShadow = b.glow > 0 ? `0 0 ${b.glow}px ${b.color}` : 'none';
        el.style.textShadow = b.textGlow > 0 ? `0 0 ${b.textGlow}px ${b.color}` : 'none';
        el.style.backdropFilter = b.blur > 0 ? `blur(${b.blur}px)` : 'none';
        el.style.opacity = b.opacity !== undefined ? b.opacity : 1;
        if(el.querySelector('span')) {
            el.querySelector('span').innerText = b.text;
            el.querySelector('span').style.fontSize = (b.fontSize || 13) + 'px';
        }
        this.renderLinks();
      };

      if (!this._openedProps) this._openedProps = new Set(['LAYOUT', 'APPEARANCE', 'CONTENT']);

      let html = '';
      if (this.activeRightTab === 'STYLES') {
          html = `
            <div class="block-category ${this._openedProps.has('LAYOUT') ? 'open' : ''}" data-prop="LAYOUT">Layout <ha-icon icon="mdi:chevron-down"></ha-icon></div>
            <div class="block-grid ${this._openedProps.has('LAYOUT') ? '' : 'collapsed'}" style="grid-template-columns: 1fr; gap: 12px; padding: 10px 0;">
                <div class="prop-row"><span class="prop-label">Horizontal (X)</span><input type="range" id="p-x" min="0" max="400" value="${b.x}"></div>
                <div class="prop-row"><span class="prop-label">Vertikal (Y)</span><input type="range" id="p-y" min="0" max="600" value="${b.y}"></div>
                <div class="prop-row"><span class="prop-label">Breite (W)</span><input type="range" id="p-w" min="10" max="400" value="${b.w || 100}"></div>
                <div class="prop-row"><span class="prop-label">Höhe (H)</span><input type="range" id="p-h" min="10" max="600" value="${b.h || 100}"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
                    <button class="btn-primary" id="btn-up" style="background:var(--input-bg); color:#fff; font-size:9px;">VORNE</button>
                    <button class="btn-primary" id="btn-down" style="background:var(--input-bg); color:#fff; font-size:9px;">HINTEN</button>
                </div>
            </div>

            <div class="block-category ${this._openedProps.has('APPEARANCE') ? 'open' : ''}" data-prop="APPEARANCE">Appearance <ha-icon icon="mdi:chevron-down"></ha-icon></div>
            <div class="block-grid ${this._openedProps.has('APPEARANCE') ? '' : 'collapsed'}" style="grid-template-columns: 1fr; gap: 12px; padding: 10px 0;">
                <div class="prop-row"><span class="prop-label">Farbe</span><input type="color" id="p-color" value="${b.color}" style="background:none; border:none; width:40px; height:24px;"></div>
                <div class="prop-row"><span class="prop-label">Glanz (Outer)</span><input type="range" id="p-glow" min="0" max="100" value="${b.glow || 0}"></div>
                <div class="prop-row"><span class="prop-label">Glanz (Text)</span><input type="range" id="p-textglow" min="0" max="100" value="${b.textGlow || 0}"></div>
                <div class="prop-row"><span class="prop-label">Glas-Effekt</span><input type="range" id="p-blur" min="0" max="50" value="${b.blur || 0}"></div>
                <div class="prop-row"><span class="prop-label">Deckkraft</span><input type="range" id="p-opacity" min="0" max="1" step="0.05" value="${b.opacity !== undefined ? b.opacity : 1}"></div>
            </div>
          `;
      } else {
          let entityOptions = '<option value="">Keine</option>';
          if (this._hass && this._hass.states) {
              entityOptions += Object.keys(this._hass.states).sort().map(eid => 
                  `<option value="${eid}" ${b.entity === eid ? 'selected' : ''}>${eid}</option>`
              ).join('');
          }
          html = `
            <div class="block-category ${this._openedProps.has('CONTENT') ? 'open' : ''}" data-prop="CONTENT">Content & Actions <ha-icon icon="mdi:chevron-down"></ha-icon></div>
            <div class="block-grid ${this._openedProps.has('CONTENT') ? '' : 'collapsed'}" style="grid-template-columns: 1fr; gap: 12px; padding: 10px 0;">
                <div class="prop-row"><span class="prop-label">Text</span><input type="text" class="prop-input" id="p-text" value="${b.text || ''}"></div>
                <div class="prop-row"><span class="prop-label">Text-Größe</span><input type="range" id="p-size" min="8" max="60" value="${b.fontSize || 13}"></div>
                <div class="prop-row"><span class="prop-label">Entität</span><select class="prop-input" id="p-entity">${entityOptions}</select></div>
                <div class="prop-row"><span class="prop-label">Aktion</span>
                    <select class="prop-input" id="p-action">
                        <option value="none" ${b.action === 'none' ? 'selected' : ''}>Keine</option>
                        <option value="more-info" ${(b.action === 'more-info' || !b.action) ? 'selected' : ''}>Info-Fenster</option>
                        <option value="toggle" ${b.action === 'toggle' ? 'selected' : ''}>Toggle (An/Aus)</option>
                    </select>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px; border-top:1px solid var(--border-color); padding-top:20px;">
                <button class="btn-primary" id="btn-dup" style="background:var(--input-bg); color:#fff; font-size:10px;">DUPLIZIEREN</button>
                <button class="btn-primary" id="btn-del" style="background:#ef4444; color:#fff; font-size:10px;">LÖSCHEN</button>
            </div>
          `;
      }
      right.innerHTML = html;

      // Listeners
      right.querySelectorAll('.block-category').forEach(header => {
          header.addEventListener('click', () => {
              const p = header.dataset.prop;
              if (this._openedProps.has(p)) this._openedProps.delete(p);
              else this._openedProps.add(p);
              this.selectBlock(id);
          });
      });

      const bind = (id, field, isInt = true, isFloat = false) => {
          const el = this.shadowRoot.querySelector(id);
          if (el) el.addEventListener('input', e => {
              let val = e.target.value;
              if (isInt) b[field] = parseInt(val);
              else if (isFloat) b[field] = parseFloat(val);
              else b[field] = val;
              updateUI();
          });
      };

      bind('#p-x', 'x'); bind('#p-y', 'y'); bind('#p-w', 'w'); bind('#p-h', 'h');
      bind('#p-size', 'fontSize'); bind('#p-color', 'color', false);
      bind('#p-glow', 'glow'); bind('#p-textglow', 'textGlow');
      bind('#p-blur', 'blur'); bind('#p-opacity', 'opacity', false, true);
      bind('#p-text', 'text', false);

      if (this.shadowRoot.querySelector('#btn-up')) this.shadowRoot.querySelector('#btn-up').addEventListener('click', () => this.moveLayer(id, 'up'));
      if (this.shadowRoot.querySelector('#btn-down')) this.shadowRoot.querySelector('#btn-down').addEventListener('click', () => this.moveLayer(id, 'down'));
      if (this.shadowRoot.querySelector('#btn-dup')) this.shadowRoot.querySelector('#btn-dup').addEventListener('click', () => this.duplicateBlock(id));
      if (this.shadowRoot.querySelector('#btn-del')) this.shadowRoot.querySelector('#btn-del').addEventListener('click', () => { el.remove(); this.canvasBlocks = this.canvasBlocks.filter(x => x.id !== id); this.selectBlock(null); });
      
      const pEntity = this.shadowRoot.querySelector('#p-entity');
      if (pEntity) pEntity.addEventListener('change', e => { 
          b.entity = e.target.value; 
          if(!b.text || b.text === b.type) { 
              b.text = b.entity.split('.')[1]; 
              if (this.shadowRoot.querySelector('#p-text')) this.shadowRoot.querySelector('#p-text').value = b.text;
              updateUI();
          } 
      });
      const pAction = this.shadowRoot.querySelector('#p-action');
      if (pAction) pAction.addEventListener('change', e => { b.action = e.target.value; });

      updateUI();
    } else if (this.selectedLinkId !== null) {
      const l = this.canvasLinks[this.selectedLinkId];
      right.innerHTML = `
        <div class="prop-group">
            <div class="prop-header">Link Einstellungen</div>
            <div class="prop-row"><span class="prop-label">Farbe</span><input type="color" id="p-link-color" value="${l.color || '#10b981'}"></div>
            <div class="prop-row"><span class="prop-label">Animation</span>
                <select class="prop-input" id="p-link-anim" style="width:120px;">
                    <option value="true" ${l.animated !== false ? 'selected' : ''}>Fließen</option>
                    <option value="false" ${l.animated === false ? 'selected' : ''}>Statisch</option>
                </select>
            </div>
            <button class="btn-primary" id="btn-del-link" style="background:#f43f5e; color:#fff; width:100%; margin-top:10px;">Link löschen</button>
        </div>
      `;
      this.shadowRoot.querySelector('#p-link-color').addEventListener('input', e => { l.color = e.target.value; this.renderLinks(); });
      this.shadowRoot.querySelector('#p-link-anim').addEventListener('change', e => { l.animated = (e.target.value === 'true'); this.renderLinks(); });
      this.shadowRoot.querySelector('#btn-del-link').addEventListener('click', () => {
          this.canvasLinks.splice(this.selectedLinkId, 1);
          this.selectedLinkId = null;
          this.selectBlock(null);
          this.renderLinks();
      });
    } else {
      if(this.activeRightTab === 'STYLES') {
        right.innerHTML = `
          <div class="prop-group">
              <div class="prop-header">Design & Atmosphäre</div>
              <div class="prop-row"><span class="prop-label">Hauptfarbe</span><input type="color" id="p-card-color" value="${this.cardStyle.color}"></div>
              <div class="prop-row"><span class="prop-label">Leucht-Intensität</span><input type="range" id="p-card-glow" min="0" max="100" value="${this.cardStyle.glow}"></div>
              <div class="prop-row"><span class="prop-label">Glas-Effekt (Blur)</span><input type="range" id="p-card-blur" min="0" max="50" value="${this.cardStyle.blur}"></div>
              <div class="prop-row"><span class="prop-label">Sichtbarkeit</span><input type="range" id="p-card-opacity" min="0" max="1" step="0.05" value="${this.cardStyle.opacity}"></div>
              <button class="btn-primary" id="btn-premium-look" style="width:100%; margin-top:20px; background: #fff; color:#000;">✨ Premium Look anwenden</button>
          </div>
          <div class="prop-group">
              <div class="prop-header">Karten-Identität</div>
              <div class="prop-row"><span class="prop-label">Name der Karte</span><input type="text" class="prop-input" id="p-card-name" value="${this.cardName}" style="width:140px; text-align:left;"></div>
          </div>
        `;
        this.shadowRoot.querySelector('#p-card-color').addEventListener('input', e => { this.cardStyle.color = e.target.value; this._updateCardStyle(); });
        this.shadowRoot.querySelector('#p-card-glow').addEventListener('input', e => { this.cardStyle.glow = e.target.value; this._updateCardStyle(); });
        this.shadowRoot.querySelector('#p-card-blur').addEventListener('input', e => { this.cardStyle.blur = e.target.value; this._updateCardStyle(); });
        this.shadowRoot.querySelector('#p-card-opacity').addEventListener('input', e => { this.cardStyle.opacity = e.target.value; this._updateCardStyle(); });
        this.shadowRoot.querySelector('#p-card-name').addEventListener('input', e => { 
            this.cardName = e.target.value; 
            const h = this.shadowRoot.querySelector('#card-header-text');
            if(h) h.innerText = this.cardName;
        });
        this.shadowRoot.querySelector('#btn-premium-look').addEventListener('click', () => {
            this.cardStyle = { glow: 40, blur: 25, color: '#00f6ff', opacity: 0.3 };
            this._updateCardStyle();
            this.selectBlock(null);
        });
      } else {
        right.innerHTML = `
          <div class="prop-group">
              <div class="prop-header">Geführter Editor</div>
              <div style="font-size:12px; color:rgba(255,255,255,0.4); line-height:1.6; margin-top:10px;">
                Wähle ein Element auf der Karte aus, um seine Eigenschaften wie Farbe, Größe oder Verbindung zu bearbeiten.<br><br>
                Tipp: Doppelklicke auf Texte, um sie direkt zu ändern.
              </div>
          </div>
        `;
      }
    }
  }

  renderLinks() {
    const svg = this.shadowRoot.querySelector('#links-overlay');
    if(!svg) return;
    svg.innerHTML = '';
    this.canvasLinks.forEach((l, idx) => {
      const s = this.shadowRoot.querySelector('#' + l.source);
      const t = this.shadowRoot.querySelector('#' + l.target);
      if(s && t) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const x1 = s.offsetLeft + s.offsetWidth/2, y1 = s.offsetTop + s.offsetHeight/2;
        const x2 = t.offsetLeft + t.offsetWidth/2, y2 = t.offsetTop + t.offsetHeight/2;
        
        // Curvy path
        const cp1x = x1 + (x2 - x1) / 2, cp1y = y1;
        const cp2x = x1 + (x2 - x1) / 2, cp2y = y2;
        const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        path.setAttribute("d", d);
        
        // Selection hit area (invisible thick path)
        const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        hitPath.setAttribute("d", d);
        hitPath.style.fill = 'none';
        hitPath.style.stroke = 'transparent';
        hitPath.style.strokeWidth = '20px';
        hitPath.style.pointerEvents = 'auto';
        hitPath.style.cursor = 'pointer';
        
        hitPath.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectedLinkId = idx;
            this.selectedBlockId = null;
            this.selectBlock(null);
            this.renderLinks();
        });
        svg.appendChild(hitPath);
        
        path.setAttribute("class", "linking-path" + (this.selectedLinkId === idx ? ' active' : ''));
        path.style.stroke = l.color || '#10b981';
        path.style.pointerEvents = 'none'; // Click hits the hitPath instead
        
        svg.appendChild(path);
      }
    });
  }

  renderLeftSidebar() {
    const container = this.shadowRoot.querySelector('#left-sidebar-container');
    if (!container) return;
    if(!container) return;
    
    if (this.activeLeftTab === 'TEMPLATES') {
        let html = `<div class="block-category">Premium Vorlagen</div><div class="block-grid" style="grid-template-columns: 1fr; gap: 10px;">`;
        const templates = [
            { id: 'Climate', name: 'Klima & Komfort', desc: 'Raumtemperatur & Luftfeuchtigkeit' },
            { id: 'Energy', name: 'Energie-Zentrale', desc: 'Verbrauch & Solar-Produktion' },
            { id: 'Switch', name: 'Intelligenz-Schalter', desc: 'Kompakte Steuerung' },
            { id: 'SmartSuite', name: 'Smart Scene Suite', desc: 'Premium Schalter-Bundle' }
        ];
        templates.forEach(t => {
            html += `
                <div class="block-item template-item" data-id="${t.id}" style="height:auto; padding:16px; align-items:flex-start; text-align:left; background:rgba(255,255,255,0.02);">
                    <ha-icon icon="mdi:auto-fix" style="--mdc-icon-size:18px; color:var(--kairo-cyan); margin-bottom:8px;"></ha-icon>
                    <span style="font-size:12px; font-weight:700; color:#fff;">${t.name}</span>
                    <span style="font-size:9px; opacity:0.4; text-transform:none; margin-top:4px;">${t.desc}</span>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
        container.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => this._injectTemplate(item.dataset.id));
        });
        return;
    }

    const allBlocks = [
      { name: 'Box', icon: 'mdi:square-outline', cat: 'BASIC' },
      { name: 'Circle', icon: 'mdi:circle-outline', cat: 'BASIC' },
      { name: 'Badge', icon: 'mdi:badge-account-outline', cat: 'BASIC' },
      { name: 'Icon', icon: 'mdi:star-outline', cat: 'BASIC' },
      { name: 'Text', icon: 'mdi:format-text', cat: 'BASIC' },
      { name: 'Glitch-Text', icon: 'mdi:format-text-variant-outline', cat: 'BASIC' },
      { name: 'Container', icon: 'mdi:crop-square', cat: 'LAYOUT' },
      { name: 'Card', icon: 'mdi:card', cat: 'LAYOUT' },
      { name: 'Grid', icon: 'mdi:grid', cat: 'LAYOUT' },
      { name: 'Stack', icon: 'mdi:layers-outline', cat: 'LAYOUT' },
      { name: 'Neon-Switch', icon: 'mdi:toggle-switch-outline', cat: 'UI' },
      { name: 'Status-Pill', icon: 'mdi:pill', cat: 'UI' },
      { name: 'Glass-Action', icon: 'mdi:gesture-tap-button', cat: 'UI' },
      { name: 'Slider-Dimmer', icon: 'mdi:tune-variant', cat: 'UI' },
      { name: 'Hex-Power', icon: 'mdi:hexagon-outline', cat: 'UI' },
      { name: 'Pulse-Chart', icon: 'mdi:chart-timeline-variant', cat: 'UI' },
      { name: 'Klima-Bogen', icon: 'mdi:circle-slice-8', cat: 'UI' },
      { name: 'Energie-Ring', icon: 'mdi:circle-slice-8', cat: 'UI' },
      { name: 'Media-Player', icon: 'mdi:play-circle-outline', cat: 'UI' },
      { name: 'Weather-Card', icon: 'mdi:weather-sunny', cat: 'UI' }
    ];

    if (!this._openedCats) this._openedCats = new Set(['BASIC', 'UI']);

    if (this.activeLeftTab === 'LAYERS') {
        let html = `<div class="block-category open">Ebenen & Struktur <ha-icon icon="mdi:layers"></ha-icon></div>`;
        const renderLayer = (parentId = null, level = 0) => {
            const children = this.canvasBlocks.filter(b => b.parentId === parentId);
            children.forEach(b => {
                const isSelected = this.selectedBlockId === b.id;
                const blockInfo = allBlocks.find(ab => ab.name === b.type) || { icon: 'mdi:cube-outline' };
                const label = b.text && b.text !== b.type ? b.text : b.type;
                html += `
                    <div class="layer-item ${isSelected ? 'active' : ''}" style="padding-left:${level * 15 + 10}px; padding-top:8px; padding-bottom:8px; display:flex; align-items:center; gap:8px; cursor:pointer;" id="layer-${b.id}">
                        <ha-icon icon="${blockInfo.icon}" style="--mdc-icon-size:12px; opacity:0.6; color:#fff;"></ha-icon>
                        <span style="font-size:11px; font-weight:600; color:#fff;">${label}</span>
                    </div>
                `;
                renderLayer(b.id, level + 1);
            });
        };
        renderLayer(null, 0);
        if (this.canvasBlocks.length === 0) html += `<div style="padding:20px; opacity:0.3; font-size:11px;">Keine Elemente vorhanden</div>`;
        container.innerHTML = html;
        container.querySelectorAll('.layer-item').forEach(item => {
            item.addEventListener('click', () => this.selectBlock(item.id.replace('layer-', '')));
        });
        return;
    }

    let html = `<input type="text" class="search-box" id="sidebar-search" placeholder="Suche..." value="${this.sidebarSearchQuery}">`;
    const searchVal = (this.sidebarSearchQuery || '').toLowerCase();

    const categories = [
        { id: 'BASIC', label: 'Basics' },
        { id: 'LAYOUT', label: 'Layout' },
        { id: 'UI', label: 'Premium UI' },
        { id: 'ENTITIES', label: 'Entitäten' }
    ];

    categories.forEach(cat => {
        const title = cat.label;
        const isOpen = this._openedCats.has(cat.id) || searchVal;
        
        let catBlocks = [];
        if (cat.id === 'ENTITIES') {
            if (this._hass && this._hass.states) {
                catBlocks = Object.keys(this._hass.states)
                    .filter(eid => eid.toLowerCase().includes(searchVal))
                    .sort().slice(0, searchVal ? 50 : 20)
                    .map(eid => ({ name: eid.split('.')[1], icon: 'mdi:database', entity: eid }));
            }
        } else {
            catBlocks = allBlocks.filter(b => b.cat === cat.id);
            if (searchVal) catBlocks = catBlocks.filter(b => b.name.toLowerCase().includes(searchVal));
        }

        if (catBlocks.length > 0) {
            html += `<div class="block-category ${isOpen ? 'open' : ''}" data-cat="${cat.id}">
                        ${title} <ha-icon icon="mdi:chevron-down"></ha-icon>
                     </div>`;
            html += `<div class="block-grid ${isOpen ? '' : 'collapsed'}" id="grid-${cat.id}">`;
            catBlocks.forEach(b => {
                html += `
                    <div class="block-item" data-type="${b.entity ? 'Entity State' : b.name}" ${b.entity ? `data-entity="${b.entity}"` : ''} style="${b.entity ? 'height:auto; padding:8px 4px;' : ''}">
                        <ha-icon icon="${b.icon}"></ha-icon>
                        <span style="${b.entity ? 'text-transform:none; font-size:8px; line-height:1.2; text-align:center;' : ''}">${b.name}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }
    });

    container.innerHTML = html;
    
    // Handlers
    container.querySelectorAll('.block-category').forEach(header => {
        header.addEventListener('click', () => {
            const catId = header.dataset.cat;
            if (this._openedCats.has(catId)) this._openedCats.delete(catId);
            else this._openedCats.add(catId);
            this.renderLeftSidebar();
        });
    });

    container.querySelectorAll('.block-item').forEach(item => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('source_type', item.dataset.type);
        if(item.dataset.entity) e.dataTransfer.setData('source_entity', item.dataset.entity);
      });
    });

    container.querySelector('#sidebar-search').addEventListener('input', e => { 
        this.sidebarSearchQuery = e.target.value; 
        this.renderLeftSidebar(); 
    });
  }
}
customElements.define("openkairo-panel", OpenKairoBuilder);
