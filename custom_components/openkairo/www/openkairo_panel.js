class OpenKairoBuilder extends HTMLElement {
  set panel(panel) {
    this._panel = panel;
    if (!this.content) {
      this.setupDOM();
    }
  }

  set hass(hass) {
    this._hass = hass;
    // Hier könnten Entitäten geladen werden
  }

  setupDOM() {
    // Premium Dark Mode / Glassmorphism Styles passend zu OpenKAIRO
    this.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          background: #0b1121; /* Sehr dunkler Premium Hintergrund */
          color: white;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* --- LAYOUT GRID --- */
        .builder-layout {
          display: grid;
          grid-template-rows: 60px 1fr;
          grid-template-columns: 240px 1fr 300px; /* Layout repariert, Platz für alle Panels */
          grid-template-areas:
            "header header header"
            "left canvas right";
          height: 100%;
          width: 100%;
        }

        /* --- HEADER --- */
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

        .header-toolbar {
          display: flex;
          gap: 15px;
        }
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
        .btn-primary:hover { background: #05f0a0; }

        /* --- LEFT SIDEBAR (Blocks / Layers) --- */
        .left-sidebar {
          grid-area: left;
          background: rgba(15, 23, 42, 0.6);
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
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

        /* --- CANVAS --- */
        .canvas-area {
          grid-area: canvas;
          background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), #0f172a;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          /* Raster Hintergrund */
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
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

        /* --- RIGHT SIDEBAR (Props / Styles / Actions) --- */
        .right-sidebar {
          grid-area: right;
          background: rgba(15, 23, 42, 0.6);
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .prop-group { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px; }
        .prop-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 10px; }
        .prop-header ha-icon { --mdc-icon-size: 16px; color: rgba(255,255,255,0.5); }
        
        .prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .prop-label { font-size: 11px; color: rgba(255,255,255,0.6); }
        .prop-input { 
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); 
          color: white; padding: 6px; border-radius: 4px; font-size: 11px; width: 60px; text-align: right;
        }
        select.prop-input { width: 100%; text-align: left; }

        .btn-style { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 4px 8px; cursor: pointer; color: #fff;}
        .btn-style.active { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #10b981; }

        /* Draggable Elements on Canvas */
        .canvas-element {
          position: absolute;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: grab;
          min-width: 60px;
          text-align: center;
          user-select: none;
          backdrop-filter: blur(5px);
          font-size: 13px;
          font-weight: 500;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .canvas-element:active { cursor: grabbing; }
        .canvas-element:hover { border-color: #10b981; }
        .canvas-element.selected {
          border-color: #05f0a0;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
          background: rgba(16, 185, 129, 0.25);
          z-index: 100; /* Bring to front */
        }
        .placeholder-text {
          border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; height: 100px; display:flex; justify-content:center; align-items:center; color:rgba(255,255,255,0.3); font-size:12px; margin-top: 20px;
        }

      </style>

      <div class="builder-layout">
        
        <!-- HEADER -->
        <div class="header">
          <div class="header-logo">
            <ha-icon icon="mdi:flash"></ha-icon> OpenKAIRO Builder
          </div>
          
          <div class="header-toolbar">
            <div class="tool-btn active"><ha-icon icon="mdi:shape-outline"></ha-icon> Entities</div>
            <div class="tool-btn"><ha-icon icon="mdi:gesture-tap"></ha-icon> Actions</div>
            <div class="tool-btn"><ha-icon icon="mdi:image-outline"></ha-icon> Media</div>
            <div class="tool-btn"><ha-icon icon="mdi:card-outline"></ha-icon> Container Selector</div>
            <div class="tool-btn"><ha-icon icon="mdi:vector-line"></ha-icon> Link</div>
            <div class="tool-btn"><ha-icon icon="mdi:toggle-switch-outline"></ha-icon> Toggles</div>
          </div>

          <div class="header-actions">
            <div class="tool-btn"><ha-icon icon="mdi:undo"></ha-icon></div>
            <div class="tool-btn"><ha-icon icon="mdi:redo"></ha-icon></div>
            <button class="btn-primary"><ha-icon icon="mdi:content-save"></ha-icon> Speichern</button>
          </div>
        </div>

        <!-- LEFT SIDEBAR -->
        <div class="left-sidebar">
          <div class="sidebar-tabs">
            <div class="s-tab active">Blocks</div>
            <div class="s-tab">Layers</div>
          </div>
          <div class="sidebar-content">
            <input type="text" class="search-box" placeholder="Search blocks...">
            
            <div class="block-category">Basic</div>
            <div class="block-grid">
              <div class="block-item"><ha-icon icon="mdi:format-text"></ha-icon><span>Text</span></div>
              <div class="block-item"><ha-icon icon="mdi:star-outline"></ha-icon><span>Icon</span></div>
              <div class="block-item"><ha-icon icon="mdi:image"></ha-icon><span>Image</span></div>
              <div class="block-item"><ha-icon icon="mdi:badge-account-outline"></ha-icon><span>Badge</span></div>
            </div>

            <div class="block-category">Layout</div>
            <div class="block-grid">
              <div class="block-item"><ha-icon icon="mdi:crop-square"></ha-icon><span>Container</span></div>
              <div class="block-item"><ha-icon icon="mdi:grid"></ha-icon><span>Grid</span></div>
              <div class="block-item"><ha-icon icon="mdi:format-list-bulleted"></ha-icon><span>Stack</span></div>
              <div class="block-item"><ha-icon icon="mdi:card"></ha-icon><span>Card</span></div>
            </div>

            <div class="block-category">Entities & UI</div>
            <div class="block-grid">
              <div class="block-item"><ha-icon icon="mdi:thermometer"></ha-icon><span>Entity State</span></div>
              <div class="block-item"><ha-icon icon="mdi:gesture-tap-button"></ha-icon><span>Button</span></div>
              <div class="block-item"><ha-icon icon="mdi:tune-variant"></ha-icon><span>Slider</span></div>
              <div class="block-item"><ha-icon icon="mdi:circle-slice-8"></ha-icon><span>Energie-Ring</span></div>
            </div>
          </div>
        </div>

        <!-- CANVAS -->
        <div class="canvas-area">
          <div class="canvas-board" id="drop-target">
            <div style="text-align:center; font-family:'Orbitron', sans-serif; color: #10b981; font-weight:800; font-size:1.2rem; text-shadow: 0 0 10px rgba(16, 185, 129, 0.4); pointer-events:none;">
              LIVING ROOM
            </div>
            <!-- Placeholder for dragged blocks -->
            <div class="placeholder-text" id="canvas-placeholder" style="pointer-events:none;">
              Block hier ablegen
            </div>
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <div class="right-sidebar">
          <div class="sidebar-tabs">
            <div class="s-tab">Properties</div>
            <div class="s-tab active">Styles</div>
            <div class="s-tab">Actions</div>
          </div>

          <div class="sidebar-content" style="padding:0;">
            <div class="prop-group">
              <div class="prop-header">Layout <ha-icon icon="mdi:chevron-up"></ha-icon></div>
              <div class="prop-row">
                <span class="prop-label">Position</span>
                <div style="display:flex; gap:5px;">
                  <button class="btn-style"><ha-icon icon="mdi:format-align-left" style="--mdc-icon-size:14px;"></ha-icon></button>
                  <button class="btn-style active"><ha-icon icon="mdi:format-align-center" style="--mdc-icon-size:14px;"></ha-icon></button>
                  <button class="btn-style"><ha-icon icon="mdi:format-align-right" style="--mdc-icon-size:14px;"></ha-icon></button>
                </div>
              </div>
              <div class="prop-row">
                <span class="prop-label">Breite (W)</span>
                <input type="text" class="prop-input" value="300" />
              </div>
              <div class="prop-row">
                <span class="prop-label">Höhe (H)</span>
                <input type="text" class="prop-input" value="Auto" />
              </div>
            </div>

            <div class="prop-group">
              <div class="prop-header">Appearance <ha-icon icon="mdi:chevron-up"></ha-icon></div>
              <div class="prop-row">
                <span class="prop-label">Background</span>
                <select class="prop-input" style="width:120px;">
                  <option>Color</option>
                  <option>Gradient</option>
                  <option>Blur</option>
                </select>
              </div>
              <div class="prop-row">
                <span class="prop-label">Border Radius</span>
                <div style="display:flex; gap:5px; align-items:center;">
                  <input type="text" class="prop-input" value="16" style="width:40px;" /> <span style="font-size:10px; color:rgba(255,255,255,0.4);">px</span>
                </div>
              </div>
              <div class="prop-row">
                <span class="prop-label">Padding</span>
                <div style="display:flex; gap:5px;">
                  <input type="text" class="prop-input" value="10" style="width:30px;" />
                  <input type="text" class="prop-input" value="15" style="width:30px;" />
                </div>
              </div>
            </div>
            
            <div class="prop-group">
              <div class="prop-header" style="color:#10b981;">Bindings / Templates <ha-icon icon="mdi:chevron-up"></ha-icon></div>
              <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-bottom:10px; line-height:1.4;">
                Verbinde diese Eigenschaft mit einer Home Assistant Entität, um sie dynamisch zu animieren.
              </div>
              <button class="btn-primary" style="width:100%; justify-content:center; background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); color:#10b981;">
                <ha-icon icon="mdi:plus"></ha-icon> Entity Binding hinzufügen
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    this.content = true;

    // --- DRAG & DROP LOGIC ---
    this.canvasBlocks = [];
    this.selectedBlockId = null;

    const blocks = this.querySelectorAll('.block-item');
    const canvas = this.querySelector('#drop-target');

    // 1. Sidebar Blocks (Source)
    blocks.forEach(block => {
      block.setAttribute('draggable', 'true');
      block.addEventListener('dragstart', (e) => {
        const blockType = block.querySelector('span').innerText;
        e.dataTransfer.setData('source_type', blockType);
        block.style.opacity = '0.5';
      });
      block.addEventListener('dragend', (e) => {
        block.style.opacity = '1';
      });
    });

    // 2. Canvas Drop Zone
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault(); // Berechtigt zum Droppen
      canvas.style.borderColor = '#10b981';
      canvas.style.boxShadow = '0 15px 45px rgba(16,185,129,0.3)';
    });

    canvas.addEventListener('dragleave', (e) => {
      canvas.style.borderColor = 'rgba(255,255,255,0.1)';
      canvas.style.boxShadow = '0 15px 45px rgba(0,0,0,0.7)';
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      canvas.style.borderColor = 'rgba(255,255,255,0.1)';
      canvas.style.boxShadow = '0 15px 45px rgba(0,0,0,0.7)';
      
      const moveId = e.dataTransfer.getData('move_id');
      const canvasRect = canvas.getBoundingClientRect();

      if (moveId) {
        // Block wird innerhalb des Canvas verschoben
        const el = this.querySelector('#' + moveId);
        const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
        const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));
        
        let dropX = e.clientX - canvasRect.left - offsetX;
        let dropY = e.clientY - canvasRect.top - offsetY;

        el.style.left = dropX + 'px';
        el.style.top = dropY + 'px';
        this.selectBlock(moveId);

      } else {
        // Neuer Block wird aus Sidebar aufs Canvas gezogen
        const blockType = e.dataTransfer.getData('source_type');
        if (blockType) {
          // Ungefähre Mitte der Maus auf dem Block
          const dropX = e.clientX - canvasRect.left - 40;
          const dropY = e.clientY - canvasRect.top - 20;
          this.addBlockToCanvas(blockType, dropX, dropY);
        }
      }
    });

    // Klick ins Leere auf dem Canvas hebt die Auswahl auf
    canvas.addEventListener('click', () => {
      this.selectBlock(null);
    });
  }

  addBlockToCanvas(type, x, y) {
    const canvas = this.querySelector('#drop-target');
    const placeholder = canvas.querySelector('#canvas-placeholder');
    if (placeholder) placeholder.remove();

    const blockId = 'block_' + Date.now() + Math.floor(Math.random() * 100);
    const el = document.createElement('div');
    el.className = 'canvas-element';
    el.id = blockId;
    
    // Icondarstellung passend zum Baustein (Optional erweiterbar)
    let icon = 'mdi:cube-outline';
    if(type === 'Text') icon = 'mdi:format-text';
    if(type === 'Entity State') icon = 'mdi:thermometer';
    if(type === 'Image') icon = 'mdi:image';
    if(type === 'Button') icon = 'mdi:gesture-tap-button';
    if(type === 'Icon') icon = 'mdi:star-outline';
    
    el.innerHTML = `<ha-icon icon="${icon}" style="--mdc-icon-size:16px; margin-right:5px; vertical-align:middle;"></ha-icon> ${type}`;
    
    el.style.left = x + 'px';
    el.style.top = Math.max(0, y) + 'px'; // Verhindern, dass Blöcke nach oben verschwinden

    // Klick auf Block -> Rechte Sidebar Properties anzeigen
    el.addEventListener('click', (e) => {
        e.stopPropagation(); // Verhindert, dass Canvas-Click auslöst
        this.selectBlock(blockId);
    });

    // Block Drag-Logik (Verschieben auf dem Canvas)
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        e.dataTransfer.setData('move_id', blockId);
        
        // Maus-Position relativ zum Element für weiches, akkurates Dropping
        const elRect = el.getBoundingClientRect();
        e.dataTransfer.setData('offsetX', e.clientX - elRect.left);
        e.dataTransfer.setData('offsetY', e.clientY - elRect.top);
        
        el.style.opacity = '0.5';
    });
    
    el.addEventListener('dragend', (e) => {
        el.style.opacity = '1';
    });

    canvas.appendChild(el);
    this.canvasBlocks.push({ id: blockId, type: type, x: x, y: y });
    this.selectBlock(blockId);
  }

  selectBlock(blockId) {
    this.selectedBlockId = blockId;
    
    // Alle Markierungen resetten
    this.querySelectorAll('.canvas-element').forEach(el => el.classList.remove('selected'));
    
    // UI-Update rechts (Right Sidebar elements)
    const rightContent = this.querySelector('.right-sidebar .sidebar-content');
    
    if (blockId) {
      const el = this.querySelector('#' + blockId);
      const blockObj = this.canvasBlocks.find(b => b.id === blockId);
      if (el) el.classList.add('selected');

      // Generate properties HTML
      let specificProps = '';
      
      // HA Entities ermitteln (Live-Ansicht)
      let entityOptions = '<option value="">Keine Entität</option>';
      if (this._hass && this._hass.states) {
          Object.keys(this._hass.states).sort().forEach(eId => {
              entityOptions += `<option value="${eId}" ${blockObj.entity === eId ? 'selected' : ''}>${eId}</option>`;
          });
      }

      if (blockObj.type === 'Text' || blockObj.type === 'Button') {
          specificProps = `
            <div class="prop-row">
              <span class="prop-label">Inhalt (Text)</span>
              <input type="text" class="prop-input" id="prop-text" value="${blockObj.text || blockObj.type}" style="width:140px;" />
            </div>
          `;
      } else if (blockObj.type === 'Entity State' || blockObj.type === 'Badge') {
          specificProps = `
            <div class="prop-row" style="flex-direction:column; align-items:flex-start; gap:5px;">
              <span class="prop-label" style="color:#10b981;">Home Assistant Entität</span>
              <select class="prop-input" id="prop-entity" style="width:100%; border-color:#10b981; background:rgba(16,185,129,0.1);">${entityOptions}</select>
            </div>
          `;
      }

      rightContent.innerHTML = `
        <div class="prop-group">
          <div class="prop-header">Eigenschaften: <span style="color:#10b981">${blockObj.type}</span></div>
          ${specificProps}
        </div>
        <div class="prop-group">
          <div class="prop-header">Abmessungen & Farben</div>
          <div class="prop-row">
             <span class="prop-label">Breite (px)</span>
             <input type="number" class="prop-input" id="prop-width" value="${el.offsetWidth || 100}" />
          </div>
          <div class="prop-row">
             <span class="prop-label">Höhe (px)</span>
             <input type="number" class="prop-input" id="prop-height" value="${el.offsetHeight || 40}" />
          </div>
          <div class="prop-row">
             <span class="prop-label">Leucht-Farbe</span>
             <input type="color" class="prop-input" id="prop-color" value="${blockObj.color || '#10b981'}" style="padding:0; width:40px; border-radius:15px; cursor:pointer;" />
          </div>
        </div>
        <div class="prop-group">
           <div style="font-size:11px; color:rgba(255,255,255,0.4); text-align:center;">
             ${blockId}
           </div>
        </div>
      `;

      // Event Listeners für dynamische Eingaben

      const iptText = this.querySelector('#prop-text');
      if (iptText) {
          iptText.addEventListener('input', (e) => {
              blockObj.text = e.target.value;
              el.innerHTML = `<ha-icon icon="mdi:format-text" style="--mdc-icon-size:16px; margin-right:5px; vertical-align:middle;"></ha-icon> ${blockObj.text}`;
          });
      }
      
      const iptEntity = this.querySelector('#prop-entity');
      if (iptEntity) {
          iptEntity.addEventListener('change', (e) => {
              blockObj.entity = e.target.value;
              if(this._hass && this._hass.states[blockObj.entity]) {
                const stateObj = this._hass.states[blockObj.entity];
                const displayVal = stateObj.state + (stateObj.attributes.unit_of_measurement ? ' ' + stateObj.attributes.unit_of_measurement : '');
                el.innerHTML = `<ha-icon icon="mdi:thermometer" style="--mdc-icon-size:16px; margin-right:5px; vertical-align:middle;"></ha-icon> <b>${displayVal}</b> <br><span style="font-size:10px; opacity:0.8">${blockObj.entity}</span>`;
              }
          });
      }

      const iptWidth = this.querySelector('#prop-width');
      if (iptWidth) iptWidth.addEventListener('input', (e) => { el.style.width = e.target.value + 'px'; el.style.minWidth = 'unset'; });
      
      const iptHeight = this.querySelector('#prop-height');
      if (iptHeight) iptHeight.addEventListener('input', (e) => { 
        el.style.height = e.target.value + 'px'; 
        el.style.display = 'flex'; 
        el.style.alignItems = 'center'; 
        el.style.justifyContent = 'center'; 
        el.style.flexDirection = 'column';
      });

      const iptColor = this.querySelector('#prop-color');
      if (iptColor) iptColor.addEventListener('input', (e) => {
          blockObj.color = e.target.value;
          el.style.color = blockObj.color;
          el.style.borderColor = blockObj.color;
          el.style.boxShadow = `0 0 15px ${blockObj.color}80`;
          el.style.background = `${blockObj.color}20`;
      });

    } else {
       rightContent.innerHTML = `
         <div class="prop-group">
            <div class="prop-header">Layout (Board)</div>
            <div style="font-size:11px; color:rgba(255,255,255,0.5);">Klicke auf einen Block im Canvas, um ihn zu bearbeiten.</div>
         </div>
       `;
    }
  }
}

customElements.define("openkairo-panel", OpenKairoBuilder);
