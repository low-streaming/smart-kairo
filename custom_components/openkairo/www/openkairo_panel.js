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

        .header-actions { display: flex; gap: 10px; }
        .btn-primary {
          background: #10b981; color: #0b1121;
          border: none; padding: 8px 16px; border-radius: 6px;
          font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px;
        }

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

        .canvas-area {
          grid-area: canvas;
          background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), #0f172a;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .canvas-board {
          width: 400px;
          height: 500px;
          background: rgba(10, 20, 28, 0.45);
          border-radius: 28px;
          box-shadow: 0 15px 45px rgba(0,0,0,0.7);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(15px);
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .right-sidebar {
          grid-area: right;
          background: rgba(15, 23, 42, 0.6);
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .prop-group { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 20px 15px; }
        .prop-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 10px; }
        .prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .prop-label { font-size: 11px; color: rgba(255,255,255,0.6); }
        .prop-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 6px; border-radius: 4px; font-size: 11px; width: 80px; text-align: right; }

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
        }
        .canvas-element.selected { border: 1px dashed #10b981 !important; box-shadow: 0 0 15px rgba(16,185,129,0.3); z-index: 100; }

        #links-overlay { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:5; }
        .linking-path { 
          fill:none; 
          stroke:#10b981; 
          stroke-width:2; 
          stroke-dasharray:5,5; 
          animation: flow 1s linear infinite; 
          filter: drop-shadow(0 0 5px #10b981);
        }
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
          <div class="header-actions">
            <button class="btn-primary" id="btn-save"><ha-icon icon="mdi:content-save"></ha-icon> Speichern</button>
          </div>
        </div>

        <div class="left-sidebar">
          <div class="sidebar-tabs">
            <div class="s-tab active">Blocks</div>
            <div class="s-tab">Layers</div>
          </div>
          <div class="sidebar-content" id="left-sidebar-container"></div>
        </div>

        <div class="canvas-area">
          <div class="canvas-board" id="drop-target">
            <div style="text-align:center; font-family:sans-serif; color:#10b981; font-weight:800; opacity:0.5;">LIVING ROOM</div>
            <svg id="links-overlay"></svg>
          </div>
        </div>

        <div class="right-sidebar">
          <div class="sidebar-tabs">
            <div class="s-tab active">Styles</div>
          </div>
          <div class="sidebar-content"></div>
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
    // --- RIGHT SIDEBAR TAB NAVIGATION ---
    this.activeRightTab = 'STYLES';
    const rightTabs = this.querySelectorAll('.right-sidebar .s-tab');
    rightTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            rightTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.activeRightTab = tab.innerText.trim().toUpperCase(); // Sync with data-tab if needed
            if(this.selectedBlockId) {
                this.selectBlock(this.selectedBlockId);
            }
        });
    });
    this.activeToolbarMode = 'ENTITIES';
    this.sidebarSearchQuery = '';

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

    const canvas = this.querySelector('#drop-target');
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
      e.preventDefault();
      const moveId = e.dataTransfer.getData('move_id');
      const canvasRect = canvas.getBoundingClientRect();
      if (moveId) {
        const el = this.querySelector('#' + moveId);
        const ox = parseFloat(e.dataTransfer.getData('offsetX'));
        const oy = parseFloat(e.dataTransfer.getData('offsetY'));
        el.style.left = (e.clientX - canvasRect.left - ox) + 'px';
        el.style.top = (e.clientY - canvasRect.top - oy) + 'px';
        const b = this.canvasBlocks.find(x => x.id === moveId);
        if(b) { b.x = parseInt(el.style.left); b.y = parseInt(el.style.top); }
        this.selectBlock(moveId);
      } else {
        const type = e.dataTransfer.getData('source_type');
        const entity = e.dataTransfer.getData('source_entity');
        this.addBlockToCanvas(type, e.clientX - canvasRect.left - 40, e.clientY - canvasRect.top - 20, entity);
      }
      this.renderLinks();
    });

    canvas.addEventListener('click', () => this.selectBlock(null));

    this.querySelector('#btn-save').addEventListener('click', () => {
      let yaml = `type: custom:openkairo-custom-card\nheight: ${canvas.offsetHeight}\nlayout:\n`;
      this.canvasBlocks.forEach(b => {
        yaml += `  - type: ${b.type}\n    x: ${b.x}\n    y: ${b.y}\n    color: "${b.color}"\n`;
        if(b.entity) yaml += `    entity: ${b.entity}\n`;
      });
      this.querySelector('#export-code-box').innerText = yaml;
      this.querySelector('#export-modal').style.display = 'flex';
    });

    this.querySelector('#btn-close-modal').addEventListener('click', () => this.querySelector('#export-modal').style.display = 'none');
    this.querySelector('#btn-copy-code').addEventListener('click', () => {
      navigator.clipboard.writeText(this.querySelector('#export-code-box').innerText);
      alert("Copied!");
    });

    this.renderLeftSidebar();
  }

  addBlockToCanvas(type, x, y, entityId = null) {
    const blockId = 'b' + Date.now();
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.id = blockId;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.background = 'rgba(16,185,129,0.2)';

    let icon;
    if(type === 'Text') icon = 'mdi:format-text';
    if(type === 'Entity State') icon = 'mdi:thermometer';
    if(type === 'Image') icon = 'mdi:image';
    if(type === 'Button') icon = 'mdi:gesture-tap-button';
    if(type === 'Icon') icon = 'mdi:star-outline';
    if(type === 'Klima-Bogen') icon = 'mdi:circle-slice-8';
    if(type === 'Modus-Schalter') icon = 'mdi:view-grid-outline';
    
    // Render UI Logic 
    if(type === 'Text') {
        el.style.background = 'transparent';
        el.innerHTML = `Text`;
    } else if(type === 'Modus-Schalter') {
        el.style.width = '240px';
        el.style.height = '60px';
        el.style.background = 'rgba(255,255,255,0.03)';
        el.style.borderRadius = '12px';
        el.style.display = 'flex';
        el.style.gap = '5px';
        el.style.padding = '5px';
        el.innerHTML = `
          <div style="flex:1; background:rgba(16,185,129,0.2); border:1px solid #10b981; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;">
            <ha-icon icon="mdi:fire" style="--mdc-icon-size:14px; color:#10b981;"></ha-icon>
            <span style="font-size:9px; color:#10b981; font-weight:bold;">Heat</span>
          </div>
          <div style="flex:1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; opacity:0.5;">
            <ha-icon icon="mdi:snowflake" style="--mdc-icon-size:14px;"></ha-icon>
            <span style="font-size:9px;">Cool</span>
          </div>
          <div style="flex:1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; opacity:0.5;">
            <ha-icon icon="mdi:auto-fix" style="--mdc-icon-size:14px;"></ha-icon>
            <span style="font-size:9px;">Auto</span>
          </div>
          <div style="flex:1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; opacity:0.5;">
            <ha-icon icon="mdi:power" style="--mdc-icon-size:14px;"></ha-icon>
            <span style="font-size:9px;">Off</span>
          </div>
        `;
    } else if(type === 'Klima-Bogen') {
        el.style.width = '160px';
        el.style.height = '160px';
        el.style.background = 'transparent';
        el.innerHTML = `
          <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
            <path d="M 20 80 A 40 40 0 1 1 80 80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8" stroke-linecap="round" />
            <path d="M 20 80 A 40 40 0 0 1 50 20" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round" style="filter: drop-shadow(0 0 5px #10b981);" />
            <circle cx="50" cy="20" r="5" fill="white" />
            <text x="50" y="60" text-anchor="middle" fill="white" style="font-size:18px; font-weight:bold;">22°</text>
            <text x="50" y="75" text-anchor="middle" fill="rgba(255,255,255,0.5)" style="font-size:8px;">Ist: 20°</text>
          </svg>
        `;
    } else if(type === 'Card' || type === 'Container') {
        // No specific innerHTML provided for Card/Container in the instruction,
        // so it will fall through to the default or be handled by other styles.
        el.innerHTML = `<span>${entityId || type}</span>`;
    } else {
        el.innerHTML = `<span>${entityId || type}</span>`;
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
      id: blockId, 
      type: type, 
      x: x, 
      y: y, 
      color: '#10b981', 
      entity: entityId,
      glow: 0,
      textGlow: 0,
      blur: 0,
      opacity: 1
    });
    this.selectBlock(blockId);
  }

  selectBlock(id) {
    this.selectedBlockId = id;
    this.querySelectorAll('.canvas-element').forEach(el => el.classList.remove('selected'));
    const right = this.querySelector('.right-sidebar .sidebar-content');
    if(id) {
      const el = this.querySelector('#' + id);
      el.classList.add('selected');
      const b = this.canvasBlocks.find(x => x.id === id);
      
      if (this.activeRightTab === 'STYLES') {
        right.innerHTML = `
          <div class="prop-group">
            <div class="prop-header">Farbe & Transparenz</div>
            <div class="prop-row"><span class="prop-label">Farbe</span><input type="color" id="p-color" value="${b.color}"></div>
            <div class="prop-row"><span class="prop-label">Deckkraft</span><input type="range" id="p-opacity" min="0" max="1" step="0.1" value="${b.opacity || 1}"></div>
          </div>
          <div class="prop-group">
            <div class="prop-header">Neon & Glow</div>
            <div class="prop-row"><span class="prop-label">Glow (Border)</span><input type="range" id="p-glow" min="0" max="50" value="${b.glow || 0}"></div>
            <div class="prop-row"><span class="prop-label">Glow (Text)</span><input type="range" id="p-tglow" min="0" max="20" value="${b.textGlow || 0}"></div>
          </div>
          <div class="prop-group">
            <div class="prop-header">Glassmorphism</div>
            <div class="prop-row"><span class="prop-label">Blur (Pixel)</span><input type="range" id="p-blur" min="0" max="50" value="${b.blur || 0}"></div>
          </div>
          <div class="prop-group">
            <button class="btn-primary" id="btn-del" style="background:#f43f5e; color:#fff; width:100%; margin-top:10px;">Löschen</button>
          </div>
        `;

        const updateStyle = () => {
          el.style.color = b.color;
          el.style.opacity = b.opacity;
          el.style.boxShadow = b.glow > 0 ? `0 0 ${b.glow}px ${b.color}` : 'none';
          el.style.textShadow = b.textGlow > 0 ? `0 0 ${b.textGlow}px ${b.color}` : 'none';
          el.style.backdropFilter = b.blur > 0 ? `blur(${b.blur}px)` : 'none';
          if (b.blur > 0) el.style.background = `rgba(255,255,255,0.05)`;
        };

        this.querySelector('#p-color').addEventListener('input', e => { b.color = e.target.value; updateStyle(); });
        this.querySelector('#p-opacity').addEventListener('input', e => { b.opacity = e.target.value; updateStyle(); });
        this.querySelector('#p-glow').addEventListener('input', e => { b.glow = e.target.value; updateStyle(); });
        this.querySelector('#p-tglow').addEventListener('input', e => { b.textGlow = e.target.value; updateStyle(); });
        this.querySelector('#p-blur').addEventListener('input', e => { b.blur = e.target.value; updateStyle(); });
        this.querySelector('#btn-del').addEventListener('click', () => { el.remove(); this.canvasBlocks = this.canvasBlocks.filter(x => x.id !== id); this.selectBlock(null); });
        
        updateStyle(); // Apply on load
      } else {
         right.innerHTML = `<div style="padding:20px; color:rgba(255,255,255,0.3);">${this.activeRightTab}-Eigenschaften (In Arbeit)</div>`;
      }
    } else {
      right.innerHTML = '<div style="padding:20px; color:rgba(255,255,255,0.3);">No selection</div>';
    }
  }

  renderLinks() {
    const svg = this.querySelector('#links-overlay');
    svg.innerHTML = '';
    this.canvasLinks.forEach(l => {
      const s = this.querySelector('#' + l.source);
      const t = this.querySelector('#' + l.target);
      if(s && t) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const x1 = s.offsetLeft + s.offsetWidth/2, y1 = s.offsetTop + s.offsetHeight/2;
        const x2 = t.offsetLeft + t.offsetWidth/2, y2 = t.offsetTop + t.offsetHeight/2;
        path.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
        path.setAttribute("class", "linking-path");
        svg.appendChild(path);
      }
    });
  }

  renderLeftSidebar() {
    const container = this.querySelector('#left-sidebar-container');
    if(!container) return;
    let html = `<input type="text" class="search-box" id="sidebar-search" placeholder="Search..." value="${this.sidebarSearchQuery}">`;
    
    const allBlocks = [
      { name: 'Text', icon: 'mdi:format-text', cat: 'BASIC' },
      { name: 'Icon', icon: 'mdi:star-outline', cat: 'BASIC' },
      { name: 'Image', icon: 'mdi:image', cat: 'BASIC' },
      { name: 'Badge', icon: 'mdi:badge-account-outline', cat: 'BASIC' },
      { name: 'Container', icon: 'mdi:crop-square', cat: 'LAYOUT' },
      { name: 'Card', icon: 'mdi:card', cat: 'LAYOUT' },
      { name: 'Entity State', icon: 'mdi:thermometer', cat: 'UI' },
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
        // Filter based on other modes
        const catMap = { 'ACTIONS': 'UI', 'LAYOUT': 'LAYOUT', 'MEDIA': 'BASIC' };
        const modeLabel = this.activeToolbarMode === 'ACTIONS' ? 'Bedienung & UI' : this.activeToolbarMode;
        
        const filtered = allBlocks.filter(b => {
             // Avoid double entry in "Media" if it's already in basic
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
