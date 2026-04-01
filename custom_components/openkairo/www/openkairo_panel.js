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
    this.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          background: #0d0d0d;
          color: #f5f5f5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
          --kairo-cyan: #00f6ff;
          --accent-blue: #3b82f6;
          --bg-sidebar: #151515;
          --bg-canvas: #0f0f0f;
          --border-color: rgba(255,255,255,0.06);
        }

        .builder-layout {
          display: grid;
          grid-template-rows: 56px 1fr;
          grid-template-columns: 260px 1fr 320px;
          grid-template-areas:
            "header header header"
            "left canvas right";
          height: 100%;
          width: 100%;
        }

        .header {
          grid-area: header;
          background: rgba(13, 13, 13, 0.8);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 24px;
          backdrop-filter: blur(20px);
          z-index: 100;
        }
        
        .header-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 15px;
          color: #fff;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .header-logo ha-icon { color: var(--kairo-cyan); --mdc-icon-size: 20px; }

        .header-toolbar { display: flex; gap: 4px; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 10px; }
        .tool-btn {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: 0.2s ease;
          text-transform: capitalize;
        }
        .tool-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .tool-btn.active { background: #fff; color: #000; font-weight: 700; }

        .left-sidebar {
          grid-area: left;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar-tabs { display: flex; border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.1); }
        .s-tab {
          flex: 1; text-align: center; padding: 14px; font-size: 10px;
          font-weight: 700; color: rgba(255,255,255,0.4); cursor: pointer;
          text-transform: uppercase; letter-spacing: 1px;
          transition: 0.2s;
        }
        .s-tab.active { color: #fff; border-bottom: 2px solid #fff; }

        .sidebar-content { padding: 16px; }
        .search-box {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border-color);
          color: white; padding: 10px 12px; border-radius: 8px; width: 100%; box-sizing: border-box;
          margin-bottom: 16px; outline: none; font-size: 12px;
          transition: 0.2s;
        }
        .search-box:focus { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
        
        .block-category { font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 10px; letter-spacing: 1px; font-weight: 800; display:flex; align-items:center; gap:8px; }
        .block-category::after { content:""; flex:1; height:1px; background: currentColor; opacity:0.1; }
        .block-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .block-item {
          background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);
          border-radius: 8px; padding: 12px 4px; display: flex; flex-direction: column; align-items: center; gap: 6px;
          cursor: grab; transition: 0.2s;
        }
        .block-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); transform: translateY(-1px); }
        .block-item ha-icon { color: rgba(255,255,255,0.3); --mdc-icon-size: 20px; transition: 0.2s; }
        .block-item:hover ha-icon { color: #fff; }
        .block-item span { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); }

        .canvas-area {
          grid-area: canvas;
          background: var(--bg-canvas);
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: 
            radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .canvas-area::before { content:""; position:absolute; inset:0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); opacity:0.1; pointer-events:none; mix-blend-mode: overlay; }

        .canvas-board {
          width: 400px;
          height: 600px;
          background: #000;
          border-radius: 16px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 24px;
          overflow: hidden;
        }

        .right-sidebar {
          grid-area: right;
          background: var(--bg-sidebar);
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .prop-group { border-bottom: 1px solid var(--border-color); padding: 20px; }
        .prop-header { display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.4); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
        .prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .prop-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .prop-input { background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); color: white; padding: 8px; border-radius: 6px; font-size: 11px; width: 140px; text-align: left; color-scheme: dark; }
        .prop-input:focus { border-color: rgba(255,255,255,0.2); outline: none; }
        .prop-input option { background: #111; color: white; padding: 8px; }
        
        input[type="range"] { height: 2px; accent-color: #fff; }
        
        .btn-primary { background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-primary:hover { opacity: 0.9; transform: scale(1.02); }

        .modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(20px); display:none; justify-content:center; align-items:center; z-index:1000; }
        .modal-content { background:#111; padding:32px; border-radius:16px; border:1px solid var(--border-color); width:560px; color:white; display:flex; flex-direction:column; gap:16px; position:relative; }
        .modal-code { background:#000; padding:16px; border-radius:8px; font-family: monospace; font-size:12px; color:#fff; overflow:auto; max-height:400px; border:1px solid var(--border-color); }
        .canvas-element {
          position: absolute;
          cursor: default;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
        }
        .canvas-element:hover { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); }
        .canvas-element.selected { 
          border: 1px solid #fff !important; 
          z-index: 100; 
        }
        
        /* Resize Handles */
        .resizer {
          width: 6px; height: 6px; background: #fff; border-radius: 50%;
          position: absolute; display: none;
        }
        .canvas-element.selected .resizer { display: block; }
        .resizer.nw { top: -3px; left: -3px; cursor: nw-resize; }
        .resizer.ne { top: -3px; right: -3px; cursor: ne-resize; }
        .resizer.sw { bottom: -3px; left: -3px; cursor: sw-resize; }
        .resizer.se { bottom: -3px; right: -3px; cursor: se-resize; }
      </style>

      <div class="builder-layout">
        <div class="header">
          <div class="header-logo"><ha-icon icon="mdi:flash"></ha-icon> KAIRO ARCHITECT</div>
          
          <div style="display:flex; gap:10px; align-items:center;">
             <span style="font-size:10px; font-weight:900; color:rgba(255,255,255,0.4);">THEME PREVIEW:</span>
             <select id="theme-selector" style="background:#000; border:1px solid var(--kairo-cyan); color:#fff; padding:5px 10px; border-radius:6px; font-size:11px; font-family:'Rajdhani'; font-weight:800; text-transform:uppercase;">
                <option value="cyan">Platinum Cyan</option>
                <option value="matrix">Matrix Green</option>
                <option value="synth">Synth Night</option>
                <option value="icarus">Icarus Gold</option>
                <option value="overdrive">Overdrive Hologram</option>
             </select>
          </div>

          <div class="header-toolbar">
            <div class="tool-btn active" data-mode="ENTITIES"><ha-icon icon="mdi:shape-outline"></ha-icon> Entities</div>
            <div class="tool-btn" data-mode="ACTIONS"><ha-icon icon="mdi:gesture-tap"></ha-icon> Actions</div>
            <div class="tool-btn" data-mode="LAYOUT"><ha-icon icon="mdi:card-outline"></ha-icon> Layout</div>
            <div class="tool-btn" data-mode="LINK"><ha-icon icon="mdi:vector-line"></ha-icon> Link</div>
          </div>
          <div class="header-actions" style="display:flex; gap:10px;">
            <button class="btn-primary" id="btn-save"><ha-icon icon="mdi:content-save"></ha-icon> CODE GENERIEREN</button>
          </div>
        </div>

        <div class="left-sidebar">
          <div class="sidebar-tabs">
            <div class="s-tab active" data-tab="BLOCKS">Blocks</div>
            <div class="s-tab" data-tab="TEMPLATES">Templates</div>
            <div class="s-tab" data-tab="LAYERS">Layers</div>
          </div>
          <div class="sidebar-content" id="left-sidebar-container"></div>
        </div>

        <div class="canvas-area">
          <div class="canvas-board" id="drop-target">
            <div id="card-header-text" style="text-align:center; font-family:sans-serif; color:#10b981; font-weight:900; opacity:0.8; font-size:18px; letter-spacing:4px; text-transform:uppercase; text-shadow: 0 0 10px currentColor; margin-top:10px;">LIVING ROOM</div>
            <svg id="links-overlay"></svg>
          </div>
        </div>

        <div class="right-sidebar">
          <div class="sidebar-tabs">
            <div class="s-tab" id="tab-props">Properties</div>
            <div class="s-tab active" id="tab-styles">Styles</div>
          </div>
          <div class="sidebar-content" id="right-sidebar-container"></div>
        </div>
      </div>

      <div class="modal-overlay" id="export-modal">
         <div class="modal-content">
            <div class="modal-header"><span>Export Code</span> <ha-icon class="modal-close" icon="mdi:close" id="btn-close-modal" style="cursor:pointer;"></ha-icon></div>
            <div class="modal-code" id="export-code-box"></div>
            <button class="btn-primary" id="btn-copy-code" style="justify-content:center;">Copy</button>
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
        const header = this.querySelector('#card-header-text');
        if(header) header.style.color = color;
        
        // Update variables for styles
        this.style.setProperty('--kairo-cyan', color);
    };

    const updateCardStyle = () => {
        const board = this.querySelector('#drop-target');
        if (!board) return;
        board.style.boxShadow = this.cardStyle.glow > 0 ? `0 30px 60px rgba(0,0,0,0.8), 0 0 ${this.cardStyle.glow}px ${this.cardStyle.color}` : '0 30px 60px rgba(0,0,0,0.8)';
        board.style.backdropFilter = `blur(${this.cardStyle.blur}px)`;
        board.style.border = `1px solid ${this.cardStyle.color}40`;
        const header = this.querySelector('#card-header-text');
        if(header) header.style.color = this.cardStyle.color;
    };
    this._updateCardStyle = updateCardStyle;



    const toolBtns = this.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (!mode) return;
        this.activeToolbarMode = mode;
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.linkMode = (mode === 'LINK');
        this.renderLeftSidebar();
        this.renderLinks();
      });
    });

    const leftTabs = this.querySelectorAll('.left-sidebar .s-tab');
    leftTabs.forEach(tab => {
        tab.addEventListener('click', () => {
           leftTabs.forEach(t => t.classList.remove('active'));
           tab.classList.add('active');
           this.activeLeftTab = tab.dataset.tab;
           this.renderLeftSidebar();
        });
    });

    const rightTabs = this.querySelectorAll('.right-sidebar .s-tab');
    rightTabs.forEach(tab => {
        tab.addEventListener('click', () => {
           rightTabs.forEach(t => t.classList.remove('active'));
           tab.classList.add('active');
           this.activeRightTab = tab.innerText.trim().toUpperCase();
           this.selectBlock(this.selectedBlockId);
        });
    });

    const canvas = this.querySelector('#drop-target');
    // Using the previously defined updateCardStyle via this._updateCardStyle if needed, 
    // but we can just use the reference from the top of the function.

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
        this.addBlockToCanvas('Container', cx, cy);
        const b = this.canvasBlocks[this.canvasBlocks.length-1];
        b.w = 120; b.h = 120; b.blur = 10;
        this.addBlockToCanvas('Hex-Power', cx + 20, cy + 15, null, b.id);
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
    const sourceEl = this.querySelector('#' + id);
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

    this.querySelector('#drop-target').appendChild(el);
    this.canvasBlocks.push(newBlock);
    this.selectBlock(newId);
  }

  moveLayer(id, dir) {
    const el = this.querySelector('#' + id);
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
    const right = this.querySelector('#right-sidebar-container');
    if(!right) return;

    if(id) {
      const el = this.querySelector('#' + id);
      el.classList.add('selected');
      const b = this.canvasBlocks.find(x => x.id === id);

      const updateUI = () => {
        if(!el) return;
        el.style.left = b.x + 'px';
        el.style.top = b.y + 'px';
        el.style.width = b.w + 'px';
        el.style.height = b.h + 'px';
        el.style.color = b.color;
        el.style.boxShadow = b.glow > 0 ? `0 0 ${b.glow}px ${b.color}` : 'none';
        el.style.textShadow = b.textGlow > 0 ? `0 0 ${b.textGlow}px ${b.color}` : 'none';
        el.style.backdropFilter = b.blur > 0 ? `blur(${b.blur}px)` : 'none';
        el.style.opacity = b.opacity !== undefined ? b.opacity : 1;
        if(el.querySelector('span')) {
            el.querySelector('span').innerText = b.text;
            el.querySelector('span').style.fontSize = b.fontSize + 'px';
        }
        
        // Update Labels
        this.querySelector('#l-x').innerText = `Abstand Links (${Math.round(b.x)}px)`;
        this.querySelector('#l-y').innerText = `Abstand Oben (${Math.round(b.y)}px)`;
        this.querySelector('#l-size').innerText = `Textgröße (${b.fontSize}px)`;
        this.querySelector('#l-glow').innerText = `Außen-Leuchten (${b.glow})`;
        this.querySelector('#l-tglow').innerText = `Text-Leuchten (${b.textGlow})`;
        this.querySelector('#l-blur').innerText = `Glas-Effekt (${b.blur})`;
        this.querySelector('#l-opacity').innerText = `Sichtbarkeit (${Math.round((b.opacity || 1)*100)}%)`;
        
        this.renderLinks();
      };

      let entityOptions = '<option value="">Keine</option>';
      if (this._hass && this._hass.states) {
          entityOptions += Object.keys(this._hass.states).sort().map(eid => 
              `<option value="${eid}" ${b.entity === eid ? 'selected' : ''}>${eid}</option>`
          ).join('');
      }

      right.innerHTML = `
        <div class="prop-group">
            <div class="prop-header">Abmessungen & Position</div>
            <div class="prop-row"><span class="prop-label" id="l-x">Abstand Links (${Math.round(b.x)}px)</span><input type="range" id="p-x" min="0" max="400" value="${b.x}"></div>
            <div class="prop-row"><span class="prop-label" id="l-y">Abstand Oben (${Math.round(b.y)}px)</span><input type="range" id="p-y" min="0" max="600" value="${b.y}"></div>
            <div class="prop-row"><span class="prop-label" id="l-size">Textgröße (${b.fontSize || 13}px)</span><input type="range" id="p-size" min="10" max="80" value="${b.fontSize || 13}"></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px;">
                <button class="btn-primary" id="btn-up" style="background:#222; font-size:9px; padding:6px; color:#fff;">NACH VORNE</button>
                <button class="btn-primary" id="btn-down" style="background:#222; font-size:9px; padding:6px; color:#fff;">NACH HINTEN</button>
            </div>
        </div>
        
        <div class="prop-group">
            <div class="prop-header">Optik & Effekte</div>
            <div class="prop-row"><span class="prop-label">Farbe</span><input type="color" id="p-color" value="${b.color}"></div>
            <div class="prop-row"><span class="prop-label" id="l-glow">Außen-Leuchten (${b.glow || 0})</span><input type="range" id="p-glow" min="0" max="100" value="${b.glow || 0}"></div>
            <div class="prop-row"><span class="prop-label" id="l-tglow">Text-Leuchten (${b.textGlow || 0})</span><input type="range" id="p-textglow" min="0" max="100" value="${b.textGlow || 0}"></div>
            <div class="prop-row"><span class="prop-label" id="l-blur">Glas-Effekt (${b.blur || 0})</span><input type="range" id="p-blur" min="0" max="50" value="${b.blur || 0}"></div>
            <div class="prop-row"><span class="prop-label" id="l-opacity">Sichtbarkeit (${Math.round((b.opacity !== undefined ? b.opacity : 1) * 100)}%)</span><input type="range" id="p-opacity" min="0" max="1" step="0.05" value="${b.opacity !== undefined ? b.opacity : 1}"></div>
        </div>

        <div class="prop-group">
            <div class="prop-header">Inhalt & Steuerung</div>
            <div class="prop-row"><span class="prop-label">Bezeichnung</span><input type="text" class="prop-input" id="p-text" value="${b.text || ''}" style="width:140px; text-align:left;"></div>
            <div class="prop-row"><span class="prop-label">Entität</span>
                <select class="prop-input" id="p-entity" style="width:140px; font-size:10px; text-align:left;">
                    ${entityOptions}
                </select>
            </div>
            <div class="prop-row"><span class="prop-label">Aktion</span>
                <select class="prop-input" id="p-action" style="width:140px; text-align:left;">
                    <option value="none" ${b.action === 'none' ? 'selected' : ''}>Keine</option>
                    <option value="more-info" ${(b.action === 'more-info' || !b.action) ? 'selected' : ''}>Info-Fenster</option>
                    <option value="toggle" ${b.action === 'toggle' ? 'selected' : ''}>Toggle (An/Aus)</option>
                </select>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px;">
                <button class="btn-primary" id="btn-dup" style="background:#222; color:#fff; font-size:11px;">
                    <ha-icon icon="mdi:content-copy" style="--mdc-icon-size:14px;"></ha-icon> KOPIEREN
                </button>
                <button class="btn-primary" id="btn-del" style="background:#f43f5e; color:#fff; font-size:11px;">
                    <ha-icon icon="mdi:delete" style="--mdc-icon-size:14px;"></ha-icon> LÖSCHEN
                </button>
            </div>
        </div>
      `;

      this.querySelector('#btn-dup').addEventListener('click', () => this.duplicateBlock(id));
      this.querySelector('#btn-up').addEventListener('click', () => this.moveLayer(id, 'up'));
      this.querySelector('#btn-down').addEventListener('click', () => this.moveLayer(id, 'down'));

      this.querySelector('#p-x').addEventListener('input', e => { b.x = parseInt(e.target.value); updateUI(); });
      this.querySelector('#p-y').addEventListener('input', e => { b.y = parseInt(e.target.value); updateUI(); });
      this.querySelector('#p-size').addEventListener('input', e => { b.fontSize = parseInt(e.target.value); updateUI(); });
      this.querySelector('#p-color').addEventListener('input', e => { b.color = e.target.value; updateUI(); });
      this.querySelector('#p-glow').addEventListener('input', e => { b.glow = parseInt(e.target.value); updateUI(); });
      this.querySelector('#p-textglow').addEventListener('input', e => { b.textGlow = parseInt(e.target.value); updateUI(); });
      this.querySelector('#p-blur').addEventListener('input', e => { b.blur = parseInt(e.target.value); updateUI(); });
      this.querySelector('#p-opacity').addEventListener('input', e => { b.opacity = parseFloat(e.target.value); updateUI(); });
      this.querySelector('#p-text').addEventListener('input', e => { 
            b.text = e.target.value; 
            updateUI();
      });
      this.querySelector('#p-entity').addEventListener('change', e => { 
            b.entity = e.target.value; 
            if(!b.text || b.text === b.type) {
                b.text = b.entity.split('.')[1];
                this.querySelector('#p-text').value = b.text;
                updateUI();
            }
      });
      this.querySelector('#p-action').addEventListener('change', e => { b.action = e.target.value; });
      this.querySelector('#btn-del').addEventListener('click', () => { 
            el.remove(); 
            this.canvasBlocks = this.canvasBlocks.filter(x => x.id !== id); 
            this.selectBlock(null); 
      });
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
      this.querySelector('#p-link-color').addEventListener('input', e => { l.color = e.target.value; this.renderLinks(); });
      this.querySelector('#p-link-anim').addEventListener('change', e => { l.animated = (e.target.value === 'true'); this.renderLinks(); });
      this.querySelector('#btn-del-link').addEventListener('click', () => {
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
        this.querySelector('#p-card-color').addEventListener('input', e => { this.cardStyle.color = e.target.value; this._updateCardStyle(); });
        this.querySelector('#p-card-glow').addEventListener('input', e => { this.cardStyle.glow = e.target.value; this._updateCardStyle(); });
        this.querySelector('#p-card-blur').addEventListener('input', e => { this.cardStyle.blur = e.target.value; this._updateCardStyle(); });
        this.querySelector('#p-card-opacity').addEventListener('input', e => { this.cardStyle.opacity = e.target.value; this._updateCardStyle(); });
        this.querySelector('#p-card-name').addEventListener('input', e => { 
            this.cardName = e.target.value; 
            const h = this.querySelector('#card-header-text');
            if(h) h.innerText = this.cardName;
        });
        this.querySelector('#btn-premium-look').addEventListener('click', () => {
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
    const svg = this.querySelector('#links-overlay');
    svg.innerHTML = '';
    this.canvasLinks.forEach((l, idx) => {
      const s = this.querySelector('#' + l.source);
      const t = this.querySelector('#' + l.target);
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
    const container = this.querySelector('#left-sidebar-container');
    if(!container) return;
    
    if (this.activeLeftTab === 'TEMPLATES') {
        let html = `<div class="block-category">Premium Vorlagen</div><div class="block-grid" style="grid-template-columns: 1fr; gap: 10px;">`;
        const templates = [
            { id: 'Climate', name: 'Klima & Komfort', desc: 'Raumtemperatur & Luftfeuchtigkeit' },
            { id: 'Energy', name: 'Energie-Zentrale', desc: 'Verbrauch & Solar-Produktion' },
            { id: 'Switch', name: 'Intelligenz-Schalter', desc: 'Kompakte Steuerung' }
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
      { name: 'Hex-Power', icon: 'mdi:hexagon-outline', cat: 'UI' },
      { name: 'Pulse-Chart', icon: 'mdi:chart-timeline-variant', cat: 'UI' },
      { name: 'Klima-Bogen', icon: 'mdi:circle-slice-8', cat: 'UI' },
      { name: 'Energie-Ring', icon: 'mdi:circle-slice-8', cat: 'UI' },
      { name: 'Modus-Schalter', icon: 'mdi:view-grid-outline', cat: 'UI' },
      { name: 'Weather-Card', icon: 'mdi:weather-sunny', cat: 'UI' },
      { name: 'Media-Player', icon: 'mdi:play-circle-outline', cat: 'UI' }
    ];

    if (this.activeLeftTab === 'LAYERS') {
        let html = `<div class="block-category">Ebenen & Struktur</div>`;
        const renderLayer = (parentId = null, level = 0) => {
            const children = this.canvasBlocks.filter(b => b.parentId === parentId);
            children.forEach(b => {
                const isSelected = this.selectedBlockId === b.id;
                const blockInfo = allBlocks.find(ab => ab.name === b.type) || { icon: 'mdi:cube-outline' };
                const label = b.text && b.text !== b.type ? b.text : b.type;
                html += `
                    <div class="layer-item ${isSelected ? 'active' : ''}" style="padding-left:${level * 15 + 10}px; display:flex; align-items:center; gap:8px;" id="layer-${b.id}">
                        <ha-icon icon="${blockInfo.icon}" style="--mdc-icon-size:12px; opacity:0.6; color:#fff;"></ha-icon>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-size:11px; font-weight:600; color:#fff;">${label}</span>
                        </div>
                    </div>
                `;
                renderLayer(b.id, level + 1);
            });
        };
        renderLayer(null, 0);
        if (this.canvasBlocks.length === 0) html += `<div style="padding:20px; opacity:0.3; font-size:11px;">Keine Elemente vorhanden</div>`;
        container.innerHTML = html;
        container.querySelectorAll('.layer-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.id.replace('layer-', '');
                this.selectBlock(id);
            });
        });
        return;
    }

    let html = `<input type="text" class="search-box" id="sidebar-search" placeholder="Bausteine suchen..." value="${this.sidebarSearchQuery}">`;
    const searchVal = (this.sidebarSearchQuery || '').toLowerCase();
    
    // 1. ALWAYS show BASIC blocks
    const basicBlocks = allBlocks.filter(b => b.cat === 'BASIC' || b.name === 'Card' || b.name === 'Container');
    html += `<div class="block-category">Bausteine</div><div class="block-grid">`;
    basicBlocks.forEach(b => {
      if (searchVal && !b.name.toLowerCase().includes(searchVal)) return;
      html += `<div class="block-item" data-type="${b.name}">
          <ha-icon icon="${b.icon}"></ha-icon>
          <span>${b.name}</span>
      </div>`;
    });
    html += `</div>`;

    // 2. Dynamic Section
    if (this.activeToolbarMode === 'ENTITIES') {
        html += `<div class="block-category" style="margin-top:20px;">Deine Geräte (Entities)</div><div class="block-grid" style="grid-template-columns: 1fr; gap: 4px;">`;
        if (this._hass && this._hass.states) {
            const eIds = Object.keys(this._hass.states)
                .filter(id => id.toLowerCase().includes(searchVal))
                .sort()
                .slice(0, 50);
            
            eIds.forEach(eid => {
                const name = eid.split('.')[1];
                html += `
                    <div class="block-item entity-item" data-type="Entity State" data-entity="${eid}" style="justify-content:flex-start; height:auto; padding:6px 10px; flex-direction:row; align-items:center; gap:10px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--border-color);">
                        <ha-icon icon="mdi:database" style="--mdc-icon-size:12px; color:rgba(255,255,255,0.4);"></ha-icon>
                        <div style="display:flex; flex-direction:column; overflow:hidden; flex:1;">
                            <span style="font-size:10px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#fff; text-transform:none;">${name}</span>
                        </div>
                    </div>
                `;
            });
        }
        html += `</div>`;
    } else {
        const modeLabel = this.activeToolbarMode === 'ACTIONS' ? 'Bedienung & UI' : this.activeToolbarMode;
        const filtered = allBlocks.filter(b => {
             if (this.activeToolbarMode === 'ACTIONS' && b.cat === 'UI') return true;
             if (this.activeToolbarMode === 'LAYOUT' && b.cat === 'LAYOUT') return true;
             return false;
        });

        if (filtered.length > 0) {
            html += `<div class="block-category" style="margin-top:20px;">${modeLabel}</div><div class="block-grid">`;
            filtered.forEach(b => {
                html += `<div class="block-item" data-type="${b.name}">
                    <ha-icon icon="${b.icon}"></ha-icon>
                    <span>${b.name}</span>
                </div>`;
            });
            html += `</div>`;
        }
    }

    container.innerHTML = html;
    container.querySelectorAll('.block-item').forEach(item => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('source_type', item.dataset.type);
        if(item.dataset.entity) e.dataTransfer.setData('source_entity', item.dataset.entity);
      });
    });
    container.querySelector('#sidebar-search').addEventListener('input', e => { this.sidebarSearchQuery = e.target.value; this.renderLeftSidebar(); });
  }
}
customElements.define("openkairo-panel", OpenKairoBuilder);
