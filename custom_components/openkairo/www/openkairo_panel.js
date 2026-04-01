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
          background: #000;
          color: white;
          font-family: 'Rajdhani', sans-serif;
          overflow: hidden;
          --kairo-cyan: #00f6ff;
          --kairo-amber: #ffb000;
          --kairo-magenta: #ec4899;
          --kairo-gold: #c6a34f;
        }

        .builder-layout {
          display: grid;
          grid-template-rows: 60px 1fr;
          grid-template-columns: 280px 1fr 310px;
          grid-template-areas:
            "header header header"
            "left canvas right";
          height: 100%;
          width: 100%;
          background-image: 
             linear-gradient(rgba(18,18,18,0.5) 1px, transparent 1px),
             linear-gradient(90deg, rgba(18,18,18,0.5) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .header {
          grid-area: header;
          background: #000;
          border-bottom: 2px solid rgba(0, 246, 255, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          backdrop-filter: blur(20px);
          z-index: 100;
          box-shadow: 0 5px 20px rgba(0,0,0,0.8);
        }
        
        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          font-size: 20px;
          color: var(--kairo-cyan);
          letter-spacing: 2px;
          text-transform: uppercase;
          text-shadow: 0 0 10px rgba(0, 246, 255, 0.4);
        }
        .header-logo ha-icon { color: #fff; --mdc-icon-size: 24px; }

        .header-toolbar { display: flex; gap: 8px; background: rgba(255,255,255,0.03); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .tool-btn {
          background: transparent;
          color: rgba(255,255,255,0.4);
          border: 1px solid transparent;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .tool-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .tool-btn.active { background: var(--kairo-cyan); color: #000; font-weight: 900; box-shadow: 0 0 15px rgba(0,246,255,0.3); }

        .left-sidebar {
          grid-area: left;
          background: rgba(8, 8, 8, 0.95);
          border-right: 1px solid rgba(0, 246, 255, 0.15);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          position: relative;
        }
        .left-sidebar::after { content:""; position:absolute; inset:0; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px); pointer-events:none; }

        .sidebar-tabs { display: flex; border-bottom: 2px solid rgba(255,255,255,0.03); background: rgba(0,0,0,0.2); }
        .s-tab {
          flex: 1; text-align: center; padding: 16px; font-size: 11px;
          font-weight: 800; color: rgba(255,255,255,0.3); cursor: pointer;
          text-transform: uppercase; letter-spacing: 2px;
          transition: 0.3s;
        }
        .s-tab.active { color: var(--kairo-cyan); border-bottom: 2px solid var(--kairo-cyan); background: rgba(0, 246, 255, 0.05); text-shadow: 0 0 10px rgba(0, 246, 255, 0.3); }

        .sidebar-content { padding: 20px; z-index: 2; }
        .search-box {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          color: white; padding: 12px; border-radius: 8px; width: 100%; box-sizing: border-box;
          margin-bottom: 20px; outline: none; font-family: 'Rajdhani', sans-serif; font-weight: 600;
          transition: 0.3s;
        }
        .search-box:focus { border-color: var(--kairo-cyan); background: rgba(255,255,255,0.05); box-shadow: 0 0 15px rgba(0,246,255,0.1); }
        
        .block-category { font-size: 10px; text-transform: uppercase; color: var(--kairo-cyan); margin-bottom: 12px; letter-spacing: 2px; font-weight: 900; display:flex; align-items:center; gap:8px; opacity:0.6; }
        .block-category::after { content:""; flex:1; height:1px; background: currentColor; opacity:0.2; }
        .block-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
        .block-item {
          background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px; padding: 15px 5px; display: flex; flex-direction: column; align-items: center; gap: 8px;
          cursor: grab; transition: 0.3s; border-left: 2px solid transparent;
        }
        .block-item:hover { background: rgba(0, 246, 255, 0.05); border-color: var(--kairo-cyan); border-left: 2px solid var(--kairo-cyan); transform: translateX(2px); }
        .block-item ha-icon { color: rgba(255,255,255,0.4); --mdc-icon-size: 24px; transition: 0.3s; }
        .block-item:hover ha-icon { color: var(--kairo-cyan); filter: drop-shadow(0 0 5px var(--kairo-cyan)); }
        .block-item span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.6); }

        .canvas-area {
          grid-area: canvas;
          background: 
            radial-gradient(circle at 50% 50%, rgba(0, 246, 255, 0.02) 0%, transparent 70%),
            conic-gradient(from 180deg at 50% 50%, #080808 0deg, #000 180deg, #080808 360deg);
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .canvas-area::before { content:""; position:absolute; inset:0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); opacity:0.1; pointer-events:none; mix-blend-mode: overlay; }

        .canvas-board {
          width: 400px;
          height: 600px;
          background: rgba(18, 18, 18, 0.9);
          border-radius: 12px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 40px rgba(0, 246, 255, 0.1);
          border: 1px solid rgba(0, 246, 255, 0.2);
          backdrop-filter: blur(25px);
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 24px;
          overflow: hidden;
        }
        .canvas-board::before { content:""; position:absolute; top:0; left:0; width:100%; height:40px; background: linear-gradient(var(--kairo-cyan) 1px, transparent 1px); opacity:0.2; }

        .right-sidebar {
          grid-area: right;
          background: rgba(8, 8, 8, 0.95);
          border-left: 1px solid rgba(0, 246, 255, 0.15);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          position: relative;
        }
        .right-sidebar::before { content:""; position:absolute; inset:0; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px); pointer-events:none; }

        .prop-group { border-bottom: 2px solid rgba(255,255,255,0.03); padding: 25px 20px; z-index: 2; position:relative; }
        .prop-header { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 800; color: var(--kairo-cyan); margin-bottom: 18px; text-transform: uppercase; letter-spacing: 2px; }
        .prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .prop-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
        .prop-input { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px; border-radius: 6px; font-size: 11px; width: 100px; text-align: right; font-family: 'Rajdhani', sans-serif; font-weight: 600; }
        .prop-input:focus { border-color: var(--kairo-cyan); outline: none; }
        
        input[type="range"] { height: 4px; border-radius: 4px; accent-color: var(--kairo-cyan); }
        
        .btn-primary { background: var(--kairo-cyan); color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 900; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 10px; box-shadow: 0 0 15px rgba(0,246,255,0.2); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 25px rgba(0,246,255,0.4); }

        .modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.9); backdrop-filter:blur(30px); display:none; justify-content:center; align-items:center; z-index:1000; }
        .modal-content { background:#0a0a0a; padding:40px; border-radius:12px; border:1px solid var(--kairo-cyan); width:600px; color:white; display:flex; flex-direction:column; gap:20px; box-shadow: 0 0 50px rgba(0, 246, 255, 0.2); position:relative; }
        .modal-content::before { content:"EXPORT CODE"; position:absolute; top:-12px; left:20px; background:#000; padding:4px 15px; color:var(--kairo-cyan); font-size:10px; font-weight:900; border:1px solid var(--kairo-cyan); letter-spacing:2px; }
        .modal-code { background:#000; padding:20px; border-radius:8px; font-family: 'Rajdhani', monospace; font-size:13px; color:#fff; overflow:auto; max-height:400px; border:1px solid rgba(255,255,255,0.05); }
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
      let yaml = `type: custom:openkairo-custom-card\nname: "${this.cardName}"\nglow: ${this.cardStyle.glow}\nblur: ${this.cardStyle.blur}\nopacity: ${this.cardStyle.opacity}\nlayout:\n`;
      this.canvasBlocks.forEach(b => {
        yaml += `  - type: ${b.type}\n    id: ${b.id}\n    x: ${b.x}\n    y: ${b.y}\n    color: "${b.color}"\n`;
        if(b.entity) yaml += `    entity: ${b.entity}\n`;
        if(b.text) yaml += `    text: "${b.text}"\n`;
        if(b.glow) yaml += `    glow: ${b.glow}\n`;
        if(b.textGlow) yaml += `    textGlow: ${b.textGlow}\n`;
        if(b.blur) yaml += `    blur: ${b.blur}\n`;
        if(b.opacity) yaml += `    opacity: ${b.opacity}\n`;
        if(b.action && b.action !== 'none') yaml += `    action: ${b.action}\n`;
        if(b.parentId) yaml += `    parentId: ${b.parentId}\n`;
      });
      this.querySelector('#export-code-box').innerText = yaml;
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
      e.dataTransfer.setData('move_id', blockId);
      const r = el.getBoundingClientRect();
      e.dataTransfer.setData('offsetX', e.clientX - r.left);
      e.dataTransfer.setData('offsetY', e.clientY - r.top);
    });

    this.querySelector('#drop-target').appendChild(el);
    this.canvasBlocks.push({
        id: blockId, type: type, x: x, y: y, color: '#10b981', entity: entityId, 
        text: type === 'Text' ? 'Dein Text' : (entityId ? entityId.split('.')[1] : type),
        glow: 0, textGlow: 0, blur: 0, opacity: 1, fontSize: 13,
        action: 'none', parentId: parentId
    });
    this.selectBlock(blockId);
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
          el.style.color = b.color;
          el.style.opacity = b.opacity;
          el.style.boxShadow = b.glow > 0 ? `0 0 ${b.glow}px ${b.color}` : 'none';
          el.style.textShadow = b.textGlow > 0 ? `0 0 ${b.textGlow}px ${b.color}` : 'none';
          el.style.backdropFilter = b.blur > 0 ? `blur(${b.blur}px)` : 'none';
          if (b.blur > 0) el.style.background = `rgba(255,255,255,0.05)`;
          if (el.querySelector('span')) el.querySelector('span').innerText = b.text;
          if (el.querySelector('span')) el.querySelector('span').style.fontSize = b.fontSize + 'px';
      };

      if(this.activeRightTab === 'STYLES') {
          right.innerHTML = `
            <div class="prop-group">
                <div class="prop-header">Neon & Glow</div>
                <div class="prop-row"><span class="prop-label">Farbe</span><input type="color" id="p-color" value="${b.color}"></div>
                <div class="prop-row"><span class="prop-label">Glow (Border)</span><input type="range" id="p-glow" min="0" max="60" value="${b.glow}"></div>
                <div class="prop-row"><span class="prop-label">Glow (Text)</span><input type="range" id="p-tglow" min="0" max="30" value="${b.textGlow}"></div>
            </div>
            <div class="prop-group">
                <div class="prop-header">Glassmorphism</div>
                <div class="prop-row"><span class="prop-label">Blur (Pixel)</span><input type="range" id="p-blur" min="0" max="40" value="${b.blur}"></div>
                <div class="prop-row"><span class="prop-label">Deckkraft</span><input type="range" id="p-opacity" min="0.1" max="1" step="0.1" value="${b.opacity}"></div>
            </div>
          `;
          this.querySelector('#p-color').addEventListener('input', e => { b.color = e.target.value; updateUI(); });
          this.querySelector('#p-glow').addEventListener('input', e => { b.glow = e.target.value; updateUI(); });
          this.querySelector('#p-tglow').addEventListener('input', e => { b.textGlow = e.target.value; updateUI(); });
          this.querySelector('#p-blur').addEventListener('input', e => { b.blur = e.target.value; updateUI(); });
          this.querySelector('#p-opacity').addEventListener('input', e => { b.opacity = e.target.value; updateUI(); });
      } else {
          // Generate entity list for dropdown
          let entityOptions = '<option value="">Keine Entität</option>';
          if(this._hass && this._hass.states) {
            Object.keys(this._hass.states).sort().forEach(eid => {
                entityOptions += `<option value="${eid}" ${b.entity === eid ? 'selected' : ''}>${eid}</option>`;
            });
          }

          right.innerHTML = `
            <div class="prop-group">
                <div class="prop-header">Element Properties</div>
                <div class="prop-row"><span class="prop-label">ANZEIGE-TEXT</span><input type="text" class="prop-input" id="p-text" value="${b.text || ''}" style="width:140px;"></div>
                <div class="prop-row"><span class="prop-label">SCHRIFTGRÖSSE</span><input type="number" class="prop-input" id="p-size" value="${b.fontSize || 13}"></div>
                <div class="prop-row"><span class="prop-label">ENTITÄT</span>
                    <select class="prop-input" id="p-entity" style="width:140px; font-size:10px;">
                        ${entityOptions}
                    </select>
                </div>
            </div>
            <div class="prop-group">
                <div class="prop-header">Interaktion (Actions)</div>
                <div class="prop-row"><span class="prop-label">Action</span>
                    <select class="prop-input" id="p-action" style="width:120px;">
                        <option value="none" ${b.action === 'none' ? 'selected' : ''}>Keine</option>
                        <option value="toggle" ${b.action === 'toggle' ? 'selected' : ''}>Umschalten (Toggle)</option>
                        <option value="more-info" ${b.action === 'more-info' ? 'selected' : ''}>Mehr Info</option>
                        <option value="navigate" ${b.action === 'navigate' ? 'selected' : ''}>Navigieren</option>
                    </select>
                </div>
            </div>
            <div class="prop-group" style="border:none;">
                <button class="btn-primary" id="btn-del" style="background:#f43f5e; color:#fff; width:100%;">Element löschen</button>
            </div>
          `;
          this.querySelector('#p-text').addEventListener('input', e => { b.text = e.target.value; updateUI(); });
          this.querySelector('#p-size').addEventListener('input', e => { b.fontSize = e.target.value; updateUI(); });
          this.querySelector('#p-entity').addEventListener('change', e => { 
                b.entity = e.target.value; 
                if(!b.text || b.text === b.type) b.text = b.entity.split('.')[1];
                updateUI(); 
          });
          this.querySelector('#p-action').addEventListener('change', e => { b.action = e.target.value; });
          this.querySelector('#btn-del').addEventListener('click', () => { el.remove(); this.canvasBlocks = this.canvasBlocks.filter(x => x.id !== id); this.selectBlock(null); });
      }
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
              <div class="prop-header">Card Styling (Global)</div>
              <div class="prop-row"><span class="prop-label">Glow Farbe</span><input type="color" id="p-card-color" value="${this.cardStyle.color}"></div>
              <div class="prop-row"><span class="prop-label">Card Glow</span><input type="range" id="p-card-glow" min="0" max="100" value="${this.cardStyle.glow}"></div>
              <div class="prop-row"><span class="prop-label">Card Blur</span><input type="range" id="p-card-blur" min="0" max="50" value="${this.cardStyle.blur}"></div>
              <div class="prop-row"><span class="prop-label">Transparenz</span><input type="range" id="p-card-opacity" min="0" max="1" step="0.05" value="${this.cardStyle.opacity}"></div>
              <button class="btn-primary" id="btn-premium-look" style="width:100%; margin-top:10px; background: linear-gradient(135deg, #10b981, #3b82f6); border:none;">✨ Premium Look anwenden</button>
          </div>
          <div class="prop-group">
              <div class="prop-header">Karten-Navigation</div>
              <div class="prop-row"><span class="prop-label">Karten-Name</span><input type="text" class="prop-input" id="p-card-name" value="${this.cardName}" style="width:120px;"></div>
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
            this.cardStyle = { glow: 40, blur: 25, color: '#10b981', opacity: 0.3 };
            this._updateCardStyle();
            this.selectBlock(null);
        });
      } else {
        right.innerHTML = `
          <div class="prop-group">
              <div class="prop-header">Karten-Info</div>
              <div class="prop-row"><span class="prop-label">Name</span><span>${this.cardName}</span></div>
              <div style="font-size:10px; opacity:0.5; margin-top:10px;">Wähle ein Element aus, um dessen Eigenschaften zu bearbeiten.</div>
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
        let html = `<div class="block-category">Struktur & Ebenen</div>`;
        const renderLayer = (parentId = null, level = 0) => {
            const children = this.canvasBlocks.filter(b => b.parentId === parentId);
            children.forEach(b => {
                const isSelected = this.selectedBlockId === b.id;
                const blockInfo = allBlocks.find(ab => ab.name === b.type) || { icon: 'mdi:cube-outline' };
                const label = b.text && b.text !== b.type ? b.text : b.type;
                html += `
                    <div class="layer-item ${isSelected ? 'active' : ''}" style="padding-left:${level * 15 + 10}px; display:flex; align-items:center; gap:8px;" id="layer-${b.id}">
                        <ha-icon icon="${blockInfo.icon}" style="--mdc-icon-size:14px; opacity:0.6; color:#10b981;"></ha-icon>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-size:11px; font-weight:bold; color:#fff;">${label}</span>
                            <span style="font-size:9px; opacity:0.4; text-transform:uppercase;">${b.type}</span>
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

    let html = `<input type="text" class="search-box" id="sidebar-search" placeholder="Search..." value="${this.sidebarSearchQuery}">`;
    const searchVal = (this.sidebarSearchQuery || '').toLowerCase();
    
    // 1. ALWAYS show BASIC blocks (persistent tools)
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

    // 2. Dynamic Section based on Toolbar Mode
    if (this.activeToolbarMode === 'ENTITIES') {
        html += `<div class="block-category" style="margin-top:20px; color:#10b981;">Home Assistant Entitäten</div><div class="block-grid" style="grid-template-columns: 1fr; gap: 6px;">`;
        if (this._hass && this._hass.states) {
            const eIds = Object.keys(this._hass.states)
                .filter(id => id.toLowerCase().includes(searchVal))
                .sort()
                .slice(0, 50);
            
            if (eIds.length === 0) {
                html += `<div style="padding:20px; text-align:center; color:rgba(255,255,255,0.3); font-size:11px;">Keine Entitäten gefunden</div>`;
            }

            eIds.forEach(eid => {
                const name = eid.split('.')[1];
                html += `
                    <div class="block-item entity-item" data-type="Entity State" data-entity="${eid}" style="justify-content:flex-start; height:auto; padding:8px; flex-direction:row; align-items:center; gap:10px; background:rgba(255,255,255,0.03); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                        <ha-icon icon="mdi:database-outline" style="--mdc-icon-size:14px; color:#10b981; opacity:0.7;"></ha-icon>
                        <div style="display:flex; flex-direction:column; overflow:hidden; flex:1;">
                            <span style="font-size:10px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#fff;">${name}</span>
                            <span style="font-size:8px; color:rgba(255,255,255,0.4); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${eid}</span>
                        </div>
                    </div>
                `;
            });
        }
        html += `</div>`;
    } else {
        const modeLabel = this.activeToolbarMode === 'ACTIONS' ? 'Bedienung & UI' : this.activeToolbarMode;
        const filtered = allBlocks.filter(b => {
             if (this.activeToolbarMode === 'MEDIA' && b.name === 'Image') return true;
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
