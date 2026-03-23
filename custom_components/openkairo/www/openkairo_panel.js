class OpenKairoPanel extends HTMLElement {
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
          display: block;
          height: 100vh;
          width: 100%;
          background: #0f172a; /* Premium Dark Background */
          color: white;
          font-family: 'Inter', sans-serif;
          overflow-y: auto;
        }
        .header {
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #10b981;
        }
        .subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
        }
        .container {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 32px;
        }
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .card:hover {
          background: rgba(255,255,255,0.05);
          border-color: #10b981;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.4);
        }
        .card-icon {
          --mdc-icon-size: 48px;
          color: #10b981;
          margin-bottom: 8px;
        }
        .card-title {
          font-size: 18px;
          font-weight: 600;
        }
        .card-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
          flex-grow: 1;
        }
        .btn {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 10px 16px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          transition: 0.2s;
        }
        .card:hover .btn {
          background: #10b981;
          color: #0f172a;
        }
      </style>

      <div class="header">
        <div>
          <div class="title">OpenKAIRO OS</div>
          <div class="subtitle">Custom Integrations & Visual Card Builder</div>
        </div>
      </div>

      <div class="container">
        <h2>Willkommen im OpenKAIRO Control Center</h2>
        <p style="color: rgba(255,255,255,0.6); max-width: 600px; line-height: 1.6;">
          Von hier aus kannst du alle exklusiven OpenKAIRO Cards verwalten und mit dem visuellen Card Builder dein Home Assistant Dashboard perfektionieren.
        </p>

        <div class="grid">
          <div class="card" id="btn-builder">
            <ha-icon class="card-icon" icon="mdi:pencil-ruler"></ha-icon>
            <div class="card-title">Card Builder (Neu)</div>
            <div class="card-desc">Visueller Editor zum Erstellen und Anpassen deiner eigenen Custom Lovelace Cards per Drag-and-Drop.</div>
            <div class="btn">Start Builder</div>
          </div>

          <div class="card" id="btn-solar">
            <ha-icon class="card-icon" icon="mdi:solar-power"></ha-icon>
            <div class="card-title">Solar Dashboard</div>
            <div class="card-desc">Konfiguriere das animierte Energiefluss-Dashboard inkl. Hausverbrauch, Netz, Akku und Sonderverbrauchern.</div>
            <div class="btn">Dokumentation</div>
          </div>

          <div class="card" id="btn-system">
            <ha-icon class="card-icon" icon="mdi:server-network"></ha-icon>
            <div class="card-title">System Status</div>
            <div class="card-desc">Überwache die Ressourcen (CPU, RAM, Temperatur) deines Smart-Kairo oder Home Assistant Systems.</div>
            <div class="btn">Einstellungen</div>
          </div>
        </div>
      </div>
    `;

    this.content = true;

    // EVENT LISTENERS
    this.querySelector('#btn-builder').addEventListener('click', () => {
      alert("Der Visual Card Builder wird geladen...");
      // Here we will mount the sophisticated builder interface natively!
    });
  }
}

customElements.define("openkairo-panel", OpenKairoPanel);
