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

        /* Draggable Elements on Canvas (WYSIWYG Mode) */
        .canvas-element {
          position: absolute;
          color: white; /* Default text color */
          padding: 8px;
          border-radius: 8px;
          cursor: grab;
          min-width: 30px;
          text-align: center;
          user-select: none;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          box-sizing: border-box;
          border: 1px solid transparent; /* No ugly border in live mode */
          transition: box-shadow 0.2s;
        }
        .canvas-element:active { cursor: grabbing; }
        .canvas-element.selected {
          border: 1px dashed rgba(16, 185, 129, 0.8) !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3) !important;
          z-index: 100; /* Bring to front */
        }
        .placeholder-text {
          border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; height: 100px; display:flex; justify-content:center; align-items:center; color:rgba(255,255,255,0.3); font-size:12px; margin-top: 20px;
        }
        
        /* Modal for Export / Speichern */
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
          display: none; justify-content: center; align-items: center; z-index: 1000;
        }
        .modal-content {
          background: #0f172a; padding: 30px; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.4);
          width: 500px; max-width: 90%; color: white; display: flex; flex-direction: column; gap: 15px;
        }
        .modal-header { font-size: 18px; font-weight: 800; color: #10b981; display:flex; justify-content: space-between;}
        .modal-code { background: #000; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #a4b1cd; overflow-x: auto; white-space: pre-wrap; user-select: text !important; cursor: text;}
        .modal-close { cursor: pointer; color: rgba(255,255,255,0.5); }
        .modal-close:hover { color: #f43f5e; }

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
            <button class="btn-primary" id="btn-save"><ha-icon icon="mdi:content-save"></ha-icon> Speichern / Export</button>
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
            <div class="s-tab" data-tab="PROPERTIES">Properties</div>
            <div class="s-tab active" data-tab="STYLES">Styles</div>
            <div class="s-tab" data-tab="ACTIONS">Actions</div>
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
      
      <!-- MODAL OVERLAY -->
      <div class="modal-overlay" id="export-modal">
         <div class="modal-content">
            <div class="modal-header">
               <span><ha-icon icon="mdi:code-json"></ha-icon> Card Export Code</span>
               <ha-icon class="modal-close" icon="mdi:close" id="btn-close-modal"></ha-icon>
            </div>
            <div style="font-size:12px; color:rgba(255,255,255,0.6);">
               Kopiere diesen Code und füge ihn als "Manuelle Karte" in Home Assistant ein! (Es wird automatisch die neue 'OpenKAIRO Custom Card' verwendet).
            </div>
            <div class="modal-code" id="export-code-box"></div>
            <button class="btn-primary" style="justify-content:center;" id="btn-copy-code">Code kopieren</button>
         </div>
      </div>
    `;

    this.content = true;

    // --- DRAG & DROP LOGIC ---
    this.canvasBlocks = [];
    this.selectedBlockId = null;

    // --- RIGHT SIDEBAR TAB NAVIGATION ---
    this.activeRightTab = 'STYLES';
    const rightTabs = this.querySelectorAll('.right-sidebar .s-tab');
    rightTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            rightTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.activeRightTab = tab.dataset.tab;
            if(this.selectedBlockId) {
                this.selectBlock(this.selectedBlockId);
            }
        });
    });

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

    // --- SAVE / EXPORT LOGIC ---
    this.querySelector('#btn-save').addEventListener('click', () => {
      const modal = this.querySelector('#export-modal');
      const codeBox = this.querySelector('#export-code-box');
      
      // Generate Layout Array
      const layoutData = [];
      this.canvasBlocks.forEach(b => {
          const el = this.querySelector('#' + b.id);
          if(!el) return;
          layoutData.push({
             type: b.type,
             entity: b.entity || "",
             text: b.text || "",
             x: parseInt(el.style.left) || 0,
             y: parseInt(el.style.top) || 0,
             width: el.offsetWidth,
             height: el.offsetHeight,
             color: b.color || "#10b981"
          });
      });

      const yamlObj = {
         type: "custom:openkairo-custom-card",
         title: "LIVING ROOM",
         height: canvas.offsetHeight,
         layout: layoutData
      };

      // Simple YAML builder string
      let yamlStr = `type: custom:openkairo-custom-card\ntitle: LIVING ROOM\nheight: ${canvas.offsetHeight}\nlayout:\n`;
      this.canvasBlocks.forEach(b => {
          const el = this.querySelector('#' + b.id);
          if(!el) return;
          
          yamlStr += `  - type: ${b.type}\n`;
          if (b.entity) yamlStr += `    entity: ${b.entity}\n`;
          if (b.text) yamlStr += `    text: "${b.text}"\n`;
          
          const curX = parseInt(el.style.left) || 0;
          const curY = parseInt(el.style.top) || 0;
          const curW = el.offsetWidth;
          const curH = el.offsetHeight;
          yamlStr += `    x: ${curX}\n    y: ${curY}\n    width: ${curW}\n    height: ${curH}\n`;
          
          const finalColor = b.color || "#10b981";
          yamlStr += `    color: "${finalColor}"\n`;
          
          if (b.fontSize) yamlStr += `    fontSize: ${b.fontSize}\n`;
          if (b.fontWeight) yamlStr += `    fontWeight: "${b.fontWeight}"\n`;
          if (b.borderRadius !== undefined) yamlStr += `    borderRadius: ${b.borderRadius}\n`;
          if (b.backgroundColor) yamlStr += `    backgroundColor: "${b.backgroundColor}"\n`;
          if (b.backgroundImage) yamlStr += `    backgroundImage: "${b.backgroundImage}"\n`;
          if (b.imageUrl) yamlStr += `    imageUrl: "${b.imageUrl}"\n`;
          if (b.action && b.action !== 'none') yamlStr += `    action: "${b.action}"\n`;
          if (b.logicState) yamlStr += `    logicState: "${b.logicState}"\n`;
          if (b.logicColor) yamlStr += `    logicColor: "${b.logicColor}"\n`;
      });
      
      codeBox.innerText = yamlStr;
      modal.style.display = 'flex';
    });

    this.querySelector('#btn-close-modal').addEventListener('click', () => {
       this.querySelector('#export-modal').style.display = 'none';
    });
    
    this.querySelector('#btn-copy-code').addEventListener('click', () => {
       const txt = this.querySelector('#export-code-box').innerText;
       
       // Fallback for local HTTP connections (which block modern Clipboard API)
       try {
           if (navigator.clipboard && window.isSecureContext) {
               navigator.clipboard.writeText(txt).then(() => {
                   alert("YAML erfolgreich kopiert!");
                   this.querySelector('#export-modal').style.display = 'none';
               });
           } else {
               const textArea = document.createElement("textarea");
               textArea.value = txt;
               textArea.style.position = "fixed";
               textArea.style.opacity = "0";
               document.body.appendChild(textArea);
               textArea.focus();
               textArea.select();
               document.execCommand('copy');
               document.body.removeChild(textArea);
               alert("YAML erfolgreich kopiert (HTTP Fallback)!");
               this.querySelector('#export-modal').style.display = 'none';
           }
       } catch (err) {
           alert("Browser blockiert das Kopieren! Bitte markiere den YAML-Text manuell und drücke Strg+C.");
       }
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
    
    // Render UI Logic 
    let bgTransparency = '15'; // Hex for small opacity 
    if(type === 'Text') {
        el.style.background = 'transparent';
    } else if(type === 'Card' || type === 'Container') {
        el.style.background = 'rgba(20, 30, 40, 0.5)';
        el.style.width = '120px';
        el.style.height = '120px';
        el.style.borderRadius = '20px';
        el.style.backdropFilter = 'blur(15px)';
        el.innerHTML = `<ha-icon icon="${icon}" style="--mdc-icon-size:16px; margin-bottom:5px; opacity:0.3;"></ha-icon> <span style="opacity:0.3">${type}</span>`;
    } else {
        el.style.background = `rgba(16, 185, 129, 0.15)`;
        el.innerHTML = `<ha-icon icon="${icon}" style="--mdc-icon-size:16px; margin-right:5px; vertical-align:middle;"></ha-icon> ${type}`;
    }

    el.style.left = x + 'px';
    el.style.top = Math.max(0, y) + 'px';

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
    // Initialize default CSS properties on logical model
    let defColor = '#10b981';
    let defText = type;
    if(type === 'Card' || type === 'Container') { defColor = '#ffffff'; defText = ''; }
    
    this.canvasBlocks.push({ 
      id: blockId, 
      type: type, 
      x: x, 
      y: y, 
      color: defColor, 
      text: defText,
      fontSize: 13,
      fontWeight: 'bold',
      borderRadius: (type === 'Card' || type === 'Container') ? 20 : 8,
      backgroundColor: (type === 'Card' || type === 'Container') ? '#141e28' : '',
      bgOpacity: (type === 'Card' || type === 'Container') ? 0.5 : 0.15
    });
    
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

      let textProp = '';
      if (blockObj.type === 'Text' || blockObj.type === 'Button') {
          textProp = `
            <div class="prop-row">
              <span class="prop-label">Inhalt (Text)</span>
              <input type="text" class="prop-input" id="prop-text" value="${blockObj.text || blockObj.type}" style="width:140px;" />
            </div>
          `;
      }

      specificProps = `
        ${textProp}
        <div class="prop-row" style="flex-direction:column; align-items:flex-start; gap:5px; margin-top:10px;">
          <span class="prop-label" style="color:#10b981;">Home Assistant Entität (Smart Binding)</span>
          <select class="prop-input" id="prop-entity" style="width:100%; border-color:#10b981; background:rgba(16,185,129,0.1);">${entityOptions}</select>
        </div>
      `;

      // General typography & appearance for ALL block types
      const extraProps = `
          <div class="prop-row">
             <span class="prop-label">Schriftgröße (px)</span>
             <input type="number" class="prop-input" id="prop-font-size" value="${blockObj.fontSize || 13}" />
          </div>
          <div class="prop-row">
             <span class="prop-label">Schrift-Dicke</span>
             <select class="prop-input" id="prop-font-weight">
                <option value="normal" ${blockObj.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="bold" ${blockObj.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                <option value="900" ${blockObj.fontWeight === '900' ? 'selected' : ''}>Heavy</option>
             </select>
          </div>
          <div class="prop-row">
             <span class="prop-label">Eckenabrundung (px)</span>
             <input type="number" class="prop-input" id="prop-radius" value="${blockObj.borderRadius || 8}" />
          </div>
      `;

      let bgProps = '';
      if(blockObj.type === 'Card' || blockObj.type === 'Container') {
          bgProps = `
          <div class="prop-row">
             <span class="prop-label">Hintergrundfarbe (Hex/rgba)</span>
             <input type="text" class="prop-input" id="prop-bg-color" value="${blockObj.backgroundColor || 'transparent'}" style="width:120px;" />
          </div>
          <div class="prop-row">
             <span class="prop-label">Hintergrundbild (URL)</span>
             <input type="text" class="prop-input" id="prop-bg-image" value="${blockObj.backgroundImage || ''}" placeholder="/local/..." style="width:120px;" />
          </div>`;
      } else if (blockObj.type === 'Image') {
          bgProps = `
          <div class="prop-row">
             <span class="prop-label">Bildquelle (URL)</span>
             <input type="text" class="prop-input" id="prop-image-url" value="${blockObj.imageUrl || ''}" placeholder="/local/..." style="width:120px;" />
          </div>`;
      }

      let htmlOutput = '';
      if (this.activeRightTab === 'PROPERTIES') {
          htmlOutput = `
            <div class="prop-group">
              <div class="prop-header">Eigenschaften: <span style="color:#10b981">${blockObj.type}</span></div>
              ${specificProps}
            </div>
            <div class="prop-group">
              <div class="prop-header">Layout</div>
              <div class="prop-row">
                 <span class="prop-label">Breite (px)</span>
                 <input type="number" class="prop-input" id="prop-width" value="${el.offsetWidth || 100}" />
              </div>
              <div class="prop-row">
                 <span class="prop-label">Höhe (px)</span>
                 <input type="number" class="prop-input" id="prop-height" value="${el.offsetHeight || 40}" />
              </div>
            </div>
          `;
      } else if (this.activeRightTab === 'STYLES') {
          htmlOutput = `
            <div class="prop-group">
              <div class="prop-header">Typografie</div>
              ${extraProps}
            </div>
            <div class="prop-group">
              <div class="prop-header">Appearance</div>
              <div class="prop-row">
                 <span class="prop-label">Leucht-/Füll-Farbe</span>
                 <input type="color" class="prop-input" id="prop-color" value="${(blockObj.color.length===7 ? blockObj.color : '#10b981')}" style="padding:0; width:40px; border-radius:15px; cursor:pointer;" />
              </div>
              ${bgProps}
            </div>
          `;
      } else if (this.activeRightTab === 'ACTIONS') {
          htmlOutput = `
            <div class="prop-group">
              <div class="prop-header" style="color:#f43f5e"><ha-icon icon="mdi:flash"></ha-icon> Aktionen & Logik</div>
              <div class="prop-row">
                 <span class="prop-label">Klick-Aktion</span>
                 <select class="prop-input" id="prop-action" style="width:120px;">
                    <option value="none" ${blockObj.action === 'none' || !blockObj.action ? 'selected' : ''}>Keine</option>
                    <option value="toggle" ${blockObj.action === 'toggle' ? 'selected' : ''}>Umschalten</option>
                    <option value="more-info" ${blockObj.action === 'more-info' ? 'selected' : ''}>Mehr Infos</option>
                 </select>
              </div>
              <div class="prop-row">
                 <span class="prop-label">Farbe ändern, wenn Status =</span>
                 <input type="text" class="prop-input" id="prop-logic-state" value="${blockObj.logicState || ''}" placeholder="z.B. on" style="width:50px;" />
              </div>
              <div class="prop-row">
                 <span class="prop-label">↳ Aktiv-Farbe</span>
                 <input type="color" class="prop-input" id="prop-logic-color" value="${(blockObj.logicColor || '#f43f5e')}" style="padding:0; width:40px; border-radius:15px; cursor:pointer;" />
              </div>
            </div>
          `;
      }

      htmlOutput += `
        <div class="prop-group">
           <div style="font-size:11px; color:rgba(255,255,255,0.4); text-align:center;">
             ${blockId}
           </div>
        </div>
      `;

      rightContent.innerHTML = htmlOutput;

      // Central styling applicator for WYSIWYG
      const applyBlockCSS = () => {
         el.style.fontSize = (blockObj.fontSize || 13) + 'px';
         el.style.fontWeight = blockObj.fontWeight || 'bold';
         el.style.borderRadius = (blockObj.borderRadius || 8) + 'px';
         
         if(blockObj.type === 'Card' || blockObj.type === 'Container') {
             el.style.backgroundColor = blockObj.backgroundColor || 'transparent';
             if (blockObj.backgroundImage) {
                 el.style.backgroundImage = `url('${blockObj.backgroundImage}')`;
                 el.style.backgroundSize = 'cover';
                 el.style.backgroundPosition = 'center';
                 el.innerHTML = '';
             } else {
                 el.style.backgroundImage = 'none';
             }
         } else if (blockObj.type !== 'Text') {
             el.style.background = `${blockObj.color}25`; // Soft tint for buttons/badges
         } else {
             el.style.background = 'transparent';
         }
      };

      // INIT existing styles
      applyBlockCSS();

      // Event Listeners für dynamische Eingaben
      const iptText = this.querySelector('#prop-text');
      if (iptText) {
          iptText.addEventListener('input', (e) => {
              blockObj.text = e.target.value;
              el.innerHTML = `<ha-icon icon="mdi:format-text" style="--mdc-icon-size:16px; margin-bottom:5px;"></ha-icon> ${blockObj.text}`;
          });
      }
      
      const iptEntity = this.querySelector('#prop-entity');
      if (iptEntity) {
          iptEntity.addEventListener('change', (e) => {
              blockObj.entity = e.target.value;
              if(this._hass && this._hass.states[blockObj.entity]) {
                const stateObj = this._hass.states[blockObj.entity];
                const displayVal = stateObj.state + (stateObj.attributes.unit_of_measurement ? ' ' + stateObj.attributes.unit_of_measurement : '');
                el.innerHTML = `<ha-icon icon="mdi:thermometer" style="--mdc-icon-size:16px; margin-bottom:5px;"></ha-icon> <b>${displayVal}</b>`;
              }
          });
      }

      const iptWidth = this.querySelector('#prop-width');
      if (iptWidth) iptWidth.addEventListener('input', (e) => { el.style.width = e.target.value + 'px'; el.style.minWidth = 'unset'; });
      
      const iptHeight = this.querySelector('#prop-height');
      if (iptHeight) iptHeight.addEventListener('input', (e) => { el.style.height = e.target.value + 'px'; });

      // Typography Listeners
      const iptFontSize = this.querySelector('#prop-font-size');
      if(iptFontSize) iptFontSize.addEventListener('input', e => { blockObj.fontSize = e.target.value; applyBlockCSS(); });
      
      const iptFontWeight = this.querySelector('#prop-font-weight');
      if(iptFontWeight) iptFontWeight.addEventListener('change', e => { blockObj.fontWeight = e.target.value; applyBlockCSS(); });
      
      const iptRadius = this.querySelector('#prop-radius');
      if(iptRadius) iptRadius.addEventListener('input', e => { blockObj.borderRadius = e.target.value; applyBlockCSS(); });

      // Appearance Listeners
      const iptColor = this.querySelector('#prop-color');
      if (iptColor) iptColor.addEventListener('input', (e) => {
          blockObj.color = e.target.value;
          el.style.color = blockObj.color;
          applyBlockCSS();
      });

      const iptBgColor = this.querySelector('#prop-bg-color');
      if(iptBgColor) iptBgColor.addEventListener('input', e => { blockObj.backgroundColor = e.target.value; applyBlockCSS(); });

      const iptBgImage = this.querySelector('#prop-bg-image');
      if(iptBgImage) iptBgImage.addEventListener('input', e => { blockObj.backgroundImage = e.target.value; applyBlockCSS(); });

      const iptImageUrl = this.querySelector('#prop-image-url');
      if(iptImageUrl) iptImageUrl.addEventListener('input', e => { 
          blockObj.imageUrl = e.target.value; 
          if (blockObj.imageUrl) {
              el.innerHTML = `<img src="${blockObj.imageUrl}" style="width:100%; height:100%; object-fit:cover; pointer-events:none; border-radius:${blockObj.borderRadius||8}px;" />`;
          } else {
              el.innerHTML = `<ha-icon icon="mdi:image" style="--mdc-icon-size:16px; margin-right:5px; vertical-align:middle; pointer-events:none;"></ha-icon> Image`;
          }
      });

      // Actions & Logic Listeners
      const iptAction = this.querySelector('#prop-action');
      if(iptAction) iptAction.addEventListener('change', e => { blockObj.action = e.target.value; });
      
      const iptLogicState = this.querySelector('#prop-logic-state');
      if(iptLogicState) iptLogicState.addEventListener('input', e => { blockObj.logicState = e.target.value; });
      
      const iptLogicColor = this.querySelector('#prop-logic-color');
      if(iptLogicColor) iptLogicColor.addEventListener('input', e => { blockObj.logicColor = e.target.value; });

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
