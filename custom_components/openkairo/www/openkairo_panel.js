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
          background: #0b1121;
          color: white;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        .builder-layout {
          display: grid;
          grid-template-rows: 60px 1fr;
          grid-template-columns: 240px 1fr 300px;
          grid-template-areas:
            "header header header"
            "left canvas right";
          height: 100%;
          width: 100%;
        }

        .header {
          grid-area: header;
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          backdrop-filter: blur(10px);
          z-index: 10;
        }
        
        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          font-size: 18px;
          color: #fff;
          letter-spacing: 1px;
        }
        .header-logo ha-icon { color: #10b981; }

        .header-toolbar { display: flex; gap: 10px; }
        .tool-btn {
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: 1px solid transparent;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: 0.2s;
        }
        .tool-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .tool-btn.active { background: rgba(16, 185, 129, 0.15); color: #10b981; border-color: rgba(16, 185, 129, 0.3); }

        .left-sidebar {
          grid-area: left;
          background: rgba(15, 23, 42, 0.6);
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .s-tab {
          flex: 1; text-align: center; padding: 12px; font-size: 12px;
          font-weight: 600; color: rgba(255,255,255,0.5); cursor: pointer;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .s-tab.active { color: #10b981; border-bottom: 2px solid #10b981; background: rgba(16, 185, 129, 0.05); }

        .sidebar-content { padding: 15px; }
        .search-box {
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 10px; border-radius: 6px; width: 100%; box-sizing: border-box;
          margin-bottom: 15px; outline: none;
        }
        
        .block-category { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px; letter-spacing: 1px; font-weight: bold; }
        .block-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .block-item {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 6px; padding: 12px 5px; display: flex; flex-direction: column; align-items: center; gap: 5px;
          cursor: grab; transition: 0.2s;
        }
        .block-item:hover { background: rgba(16, 185, 129, 0.1); border-color: #10b981; }
        .block-item ha-icon { color: rgba(255,255,255,0.7); --mdc-icon-size: 20px; }
        .block-item span { font-size: 11px; font-weight: 500; }

        .layer-item { padding: 8px 10px; display: flex; align-items: center; gap: 8px; cursor: pointer; border-radius: 4px; border: 1px solid transparent; color: rgba(255,255,255,0.7); transition: 0.2s; }
        .layer-item:hover { background: rgba(255,255,255,0.03); }
        .layer-item.active { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }

        .linking-path.active { stroke-width: 4 !important; filter: drop-shadow(0 0 8px currentColor); }

        .canvas-area {
          grid-area: canvas;
          background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), #0f172a;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .canvas-board {
          width: 400px;
          height: 600px;
          background: linear-gradient(135deg, rgba(14, 25, 44, 0.8) 0%, rgba(10, 15, 28, 0.95) 100%);
          border-radius: 32px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(25px);
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 24px;
          background-image: 
            radial-gradient(circle at 10px 10px, rgba(255,255,255,0.03) 1px, transparent 0);
          background-size: 24px 24px;
        }

        #links-overlay { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:100; opacity:0.6; }
        .linking-path { 
           fill:none; 
           stroke-width:2; 
           stroke-dasharray:4, 12; 
           animation: flow 3s linear infinite, glowPulse 2s ease-in-out infinite alternate; 
           stroke-linecap: round;
        }
        @keyframes flow { to { stroke-dashoffset: -48; } }
        @keyframes glowPulse { from { filter: drop-shadow(0 0 2px currentColor); opacity: 0.4; } to { filter: drop-shadow(0 0 10px currentColor); opacity: 0.9; } }

        .right-sidebar {
          grid-area: right;
          background: rgba(15, 23, 42, 0.6);
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .prop-group { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 20px 15px; }
        .prop-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 12px; }
        .prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .prop-label { font-size: 11px; color: rgba(255,255,255,0.6); }
        .prop-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 6px; border-radius: 4px; font-size: 11px; width: 80px; text-align: right; }
        input[type="range"] { width: 120px; accent-color: #10b981; }

        .canvas-element {
          position: absolute;
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          user-select: none;
          box-sizing: border-box;
          transition: transform 0.1s;
        }
        .canvas-element.selected { border: 1px dashed #10b981 !important; box-shadow: 0 0 15px rgba(16,185,129,0.3); z-index: 100; }

        #links-overlay { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5; }
        .linking-path { fill:none; stroke:#10b981; stroke-width:2; stroke-dasharray:5,5; animation: flow 1s linear infinite; filter: drop-shadow(0 0 5px #10b981); }
        @keyframes flow { to { stroke-dashoffset: -10; } }

        .modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); display:none; justify-content:center; align-items:center; z-index:1000; }
        .modal-content { background:#0f172a; padding:30px; border-radius:16px; border:1px solid rgba(16,185,129,0.4); width:500px; color:white; display:flex; flex-direction:column; gap:15px; }
        .modal-code { background:#000; padding:15px; border-radius:8px; font-family:monospace; font-size:12px; color:#a4b1cd; overflow-x:auto; white-space:pre-wrap; }
      </style>

      <div class="builder-layout">
        <div class="header">
          <div class="header-logo"><ha-icon icon="mdi:flash"></ha-icon> OpenKAIRO Builder</div>
          <div class="header-toolbar">
            <div class="tool-btn active" data-mode="ENTITIES"><ha-icon icon="mdi:shape-outline"></ha-icon> Entities</div>
            <div class="tool-btn" data-mode="ACTIONS"><ha-icon icon="mdi:gesture-tap"></ha-icon> Actions</div>
            <div class="tool-btn" data-mode="MEDIA"><ha-icon icon="mdi:image-outline"></ha-icon> Media</div>
            <div class="tool-btn" data-mode="LAYOUT"><ha-icon icon="mdi:card-outline"></ha-icon> Layout</div>
            <div class="tool-btn" data-mode="LINK"><ha-icon icon="mdi:vector-line"></ha-icon> Link</div>
          </div>
          <div class="header-actions" style="display:flex; gap:10px;">
            <button class="tool-btn" id="btn-preset-climate" style="background:rgba(59,130,246,0.1); color:#3b82f6;"><ha-icon icon="mdi:thermostat"></ha-icon> Klima</button>
            <button class="tool-btn" id="btn-preset-cyber" style="background:rgba(168,85,247,0.1); color:#a855f7;"><ha-icon icon="mdi:robot"></ha-icon> Cyan-Cyber</button>
            <button class="btn-primary" id="btn-save"><ha-icon icon="mdi:content-save"></ha-icon> Speichern</button>
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
            <div id="card-header-text" style="text-align:center; font-family:sans-serif; color:#10b981; font-weight:800; opacity:0.5;">LIVING ROOM</div>
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
    this.cardStyle = { glow: 20, blur: 15, color: '#10b981', opacity: 0.45 };

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

    this.querySelector('#btn-preset-climate').addEventListener('click', () => {
        if(!confirm("Aktuelles Layout verwerfen und Klima-Preset laden?")) return;
        this.canvasBlocks = [];
        this.canvasLinks = [];
        
        // Add Climate Arc
        this.addBlockToCanvas('Klima-Bogen', 140, 80, null);
        const arcId = this.canvasBlocks[0].id;
        this.canvasBlocks[0].entity = '[[klima_entitaet]]';
        
        // Add Mode Switch
        this.addBlockToCanvas('Modus-Schalter', 100, 220, null);
        
        // Add some info badges
        this.addBlockToCanvas('Badge', 60, 320, null);
        this.canvasBlocks[this.canvasBlocks.length-1].text = "Luftfeuchtigkeit";
        this.canvasBlocks[this.canvasBlocks.length-1].entity = '[[feuchtigkeit_entitaet]]';
        
        this.addBlockToCanvas('Badge', 220, 320, null);
        this.canvasBlocks[this.canvasBlocks.length-1].text = "Außentemp";
        this.canvasBlocks[this.canvasBlocks.length-1].entity = '[[aussen_temp]]';

        this.cardName = "WOHNZIMMER KLIMA";
        const h = this.querySelector('#card-header-text');
        if(h) h.innerText = this.cardName;
        
        this.selectBlock(null);
    });

    this.querySelector('#btn-preset-cyber').addEventListener('click', () => {
        if(!confirm("Aktuelles Layout verwerfen und Cyberpunk-Preset laden?")) return;
        this.canvasBlocks = [];
        this.canvasLinks = [];
        
        // Setup Styles
        this.cardStyle = { glow: 40, blur: 25, color: '#06b6d4', opacity: 0.8 };
        this.cardName = "NEON TERMINAL";
        const h = this.querySelector('#card-header-text');
        if(h) { h.innerText = this.cardName; h.style.color = '#06b6d4'; }
        
        // Add Blocks
        this.addBlockToCanvas('Weather-Card', 20, 50, 'weather.home');
        this.addBlockToCanvas('Media-Player', 20, 160, 'media_player.spotify');
        this.addBlockToCanvas('Klima-Bogen', 180, 50, 'climate.living_room');
        this.addBlockToCanvas('Energie-Ring', 280, 160, 'sensor.solar_production');
        
        // Add some links for data flow
        setTimeout(() => {
            const b0 = this.canvasBlocks[0].id;
            const b1 = this.canvasBlocks[1].id;
            const b2 = this.canvasBlocks[2].id;
            const b3 = this.canvasBlocks[3].id;
            this.canvasLinks.push({source: b0, target: b1, color: '#06b6d4', animated: true});
            this.canvasLinks.push({source: b2, target: b3, color: '#ec4899', animated: true});
            this.renderLinks();
        }, 100);

        this._updateCardStyle();
        this.selectBlock(null);
    });

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
      const canvasRect = canvas.getBoundingClientRect();
      const gridSize = 20;

      if (moveId) {
        const el = this.querySelector('#' + moveId);
        const ox = parseFloat(e.dataTransfer.getData('offsetX'));
        const oy = parseFloat(e.dataTransfer.getData('offsetY'));
        let dropX = Math.round((e.clientX - canvasRect.left - ox) / gridSize) * gridSize;
        let dropY = Math.round((e.clientY - canvasRect.top - oy) / gridSize) * gridSize;
        
        const b = this.canvasBlocks.find(x => x.id === moveId);
        if(b) {
          const dx = dropX - b.x;
          const dy = dropY - b.y;
          b.x = dropX; b.y = dropY;
          el.style.left = dropX + 'px';
          el.style.top = dropY + 'px';
          
          // Move children
          this.canvasBlocks.filter(x => x.parentId === moveId).forEach(child => {
            child.x += dx; child.y += dy;
            const childEl = this.querySelector('#' + child.id);
            if(childEl) { childEl.style.left = child.x + 'px'; childEl.style.top = child.y + 'px'; }
          });
        }
        this.selectBlock(moveId);
      } else {
        const type = e.dataTransfer.getData('source_type');
        const entity = e.dataTransfer.getData('source_entity');
        let dropX = Math.round((e.clientX - canvasRect.left - 40) / gridSize) * gridSize;
        let dropY = Math.round((e.clientY - canvasRect.top - 20) / gridSize) * gridSize;
        
        // Find potential parent container
        const targetBlock = e.target.closest('.canvas-element');
        let pId = null;
        if (targetBlock) {
          const tb = this.canvasBlocks.find(x => x.id === targetBlock.id);
          if (tb && (tb.type === 'Container' || tb.type === 'Card')) pId = tb.id;
        }
        
        this.addBlockToCanvas(type, dropX, dropY, entity, pId);
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
        if(b.blur) yaml += `    blur: ${b.blur}\n`;
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

    this.renderLeftSidebar();
    this.selectBlock(null);
    updateCardStyle();
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
          right.innerHTML = `
            <div class="prop-group">
                <div class="prop-header">Element Properties</div>
                <div class="prop-row"><span class="prop-label">Anzeige-Text</span><input type="text" class="prop-input" id="p-text" value="${b.text || ''}" style="width:120px;"></div>
                <div class="prop-row"><span class="prop-label">Schriftgröße</span><input type="number" class="prop-input" id="p-size" value="${b.fontSize || 13}"></div>
                <div class="prop-row"><span class="prop-label">HA-Entität</span><input type="text" class="prop-input" id="p-entity" value="${b.entity || ''}" style="width:120px;"></div>
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
          this.querySelector('#p-entity').addEventListener('input', e => { b.entity = e.target.value; updateUI(); });
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
        path.setAttribute("d", `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
        
        // Selection hit area (invisible thick path)
        const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        hitPath.setAttribute("d", pathData);
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
    
    if (this.activeLeftTab === 'LAYERS') {
        let html = `<div class="block-category">Struktur & Ebenen</div>`;
        const renderLayer = (parentId = null, level = 0) => {
            const children = this.canvasBlocks.filter(b => b.parentId === parentId);
            children.forEach(b => {
                const isSelected = this.selectedBlockId === b.id;
                html += `
                    <div class="layer-item ${isSelected ? 'active' : ''}" style="padding-left:${level * 15 + 10}px;" id="layer-${b.id}">
                        <ha-icon icon="${b.type === 'Container' ? 'mdi:folder-outline' : 'mdi:cube-outline'}" style="--mdc-icon-size:14px; opacity:0.6;"></ha-icon>
                        <span style="font-size:11px;">${b.text || b.type}</span>
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
    
    const allBlocks = [
      { name: 'Box', icon: 'mdi:square-outline', cat: 'BASIC' },
      { name: 'Circle', icon: 'mdi:circle-outline', cat: 'BASIC' },
      { name: 'Badge', icon: 'mdi:badge-account-outline', cat: 'BASIC' },
      { name: 'Icon', icon: 'mdi:star-outline', cat: 'BASIC' },
      { name: 'Text', icon: 'mdi:format-text', cat: 'BASIC' },
      { name: 'Container', icon: 'mdi:crop-square', cat: 'LAYOUT' },
      { name: 'Card', icon: 'mdi:card', cat: 'LAYOUT' },
      { name: 'Button', icon: 'mdi:gesture-tap-button', cat: 'UI' },
      { name: 'Klima-Bogen', icon: 'mdi:circle-slice-8', cat: 'UI' },
      { name: 'Modus-Schalter', icon: 'mdi:view-grid-outline', cat: 'UI' },
      { name: 'Slider', icon: 'mdi:tune-variant', cat: 'UI' },
      { name: 'Energie-Ring', icon: 'mdi:circle-slice-8', cat: 'UI' }
    ];

    const searchVal = (this.sidebarSearchQuery || '').toLowerCase();
    
    // 1. ALWAYS show BASIC blocks (persistent tools)
    const basicBlocks = allBlocks.filter(b => b.cat === 'BASIC' || b.name === 'Card' || b.name === 'Container');
    html += `<div class="block-category">Bausteine</div><div class="block-grid">`;
    basicBlocks.slice(0, 4).forEach(b => {
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
