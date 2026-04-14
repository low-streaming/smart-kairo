class OpenKairoCard extends HTMLElement {
  _initGlobalOS() {
    console.error(">>> OPENKAIRO OS KERNEL INJECTED! <<<");
    if (window.KairoOS) return;

    window.KairoOS = {
      idleTime: 0,
      locked: false,
      launchpad: null,
      showToast: (title, message, type = 'info') => {
        const container = document.getElementById('kairo-toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `kairo-toast kairo-toast-${type}`;
        toast.innerHTML = `
          <div class="toast-icon">${type === 'error' ? '!' : (type === 'success' ? '✓' : 'i')}</div>
          <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
          </div>
        `;
        container.appendChild(toast);
        
        try {
          const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
          audio.volume = 0.2;
          audio.play();
        } catch(e) {}

        requestAnimationFrame(() => toast.style.transform = 'translateY(0)');
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(20px)';
          setTimeout(() => toast.remove(), 400);
        }, 5000);
      }
    };

    const style = document.createElement('style');
    style.innerHTML = `
      #kairo-toast-container {
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        display: flex; flex-direction: column; gap: 10px; pointer-events: none;
      }
      .kairo-toast {
        background: rgba(5, 12, 18, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 15px; padding: 15px 20px;
        color: white; display: flex; align-items: center; gap: 15px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.8);
        transform: translateY(-20px); opacity: 1; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-family: 'Inter', sans-serif; pointer-events: auto; min-width: 250px;
      }
      .kairo-toast-error { border-color: rgba(255, 74, 74, 0.5); }
      .kairo-toast-success { border-color: rgba(5, 240, 160, 0.5); }
      .toast-icon {
        width: 30px; height: 30px; border-radius: 50%; background: rgba(16,185,129,0.1);
        display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'Orbitron'; font-size: 1.1rem;
      }
      .kairo-toast-error .toast-icon { background: rgba(255, 74, 74, 0.1); color: #ff4a4a; }
      .kairo-toast-success .toast-icon { background: rgba(5, 240, 160, 0.1); color: #05f0a0; }
      .toast-title { font-weight: 800; font-size: 0.9rem; margin-bottom: 3px; font-family: 'Orbitron'; letter-spacing: 1px;}
      .toast-message { font-size: 0.8rem; opacity: 0.7; }

      #kairo-lock-screen {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10001;
        background: radial-gradient(circle at center, rgba(5,16,20,0.95) 0%, rgba(1,3,5,0.98) 100%);
        backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
        display: none; flex-direction: column; align-items: center; justify-content: center;
        color: white; font-family: 'Orbitron', sans-serif;
        opacity: 0; transition: opacity 0.8s ease; cursor: pointer;
      }
      .lock-time { font-size: 6rem; font-weight: 900; background: linear-gradient(180deg, #ffffff 30%, #5caaa0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 50px rgba(16,185,129,0.2); margin: 0; line-height: 1.1;}
      .lock-date { font-size: 1.5rem; font-weight: 300; font-family: 'Inter'; opacity: 0.6; margin-top: 5px; }
      .lock-hint { position: absolute; bottom: 50px; font-size: 0.8rem; letter-spacing: 4px; color: var(--primary); opacity: 0.8; animation: pulseHint 2s infinite; }
      @keyframes pulseHint { 0%, 100% { opacity: 0.4; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-5px); text-shadow: 0 0 10px var(--primary); } }

      #kairo-fab {
        position: fixed; bottom: 30px; right: 30px; z-index: 10002;
        width: 60px; height: 60px; border-radius: 30px;
        background: rgba(5,12,18,0.8); backdrop-filter: blur(20px); border: 1px solid rgba(16,185,129,0.4);
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(16,185,129,0.2);
        color: #10b981; font-family: 'Orbitron'; font-weight: 900; font-size: 0.9rem; letter-spacing: 1px;
        transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      #kairo-fab:hover { transform: scale(1.1) translateY(-5px); background: rgba(16,185,129,0.15); border-color: #10b981; box-shadow: 0 15px 40px rgba(16,185,129,0.3); }
    `;
    document.head.appendChild(style);

    const toasts = document.createElement('div');
    toasts.id = 'kairo-toast-container';
    document.body.appendChild(toasts);

    const lock = document.createElement('div');
    lock.id = 'kairo-lock-screen';
    lock.innerHTML = `
      <div class="lock-time">--:--</div>
      <div class="lock-date">KAIRO OS</div>
      <div class="lock-hint">CLICK TO UNLOCK</div>
    `;
    document.body.appendChild(lock);

    const fab = document.createElement('div');
    fab.id = 'kairo-fab';
    fab.innerHTML = 'SYS';
    document.body.appendChild(fab);

    setInterval(() => {
      window.KairoOS.idleTime++;
      if (window.KairoOS.idleTime > 60 && !window.KairoOS.locked) { // 60s idle timeout
        window.KairoOS.locked = true;
        lock.style.display = 'flex';
        void lock.offsetWidth;
        lock.style.opacity = '1';
      }
      
      if (window.KairoOS.locked) {
        const now = new Date();
        lock.querySelector('.lock-time').innerText = now.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        lock.querySelector('.lock-date').innerText = now.toLocaleDateString('de-DE', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
      }
    }, 1000);

    const resetIdle = () => {
      if (window.KairoOS.locked) return;
      window.KairoOS.idleTime = 0;
    };

    ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(evt => 
      window.addEventListener(evt, resetIdle, {passive: true})
    );

    lock.addEventListener('click', () => {
      lock.style.opacity = '0';
      setTimeout(() => {
        lock.style.display = 'none';
        window.KairoOS.locked = false;
        window.KairoOS.idleTime = 0;
      }, 800);
    });

    fab.addEventListener('click', () => {
       if (window.KairoOS.launchpad) {
         window.KairoOS.launchpad.style.display = 'flex';
         setTimeout(() => {
             window.KairoOS.launchpad.style.opacity = '1';
             window.KairoOS.launchpad.style.transform = 'scale(1)';
             window.KairoOS.launchpad.style.pointerEvents = 'auto';
         }, 10);
       } else {
         window.KairoOS.showToast('Achtung', 'Das Launchpad ist gerade nicht im DOM gemounted.', 'error');
       }
    });

    setTimeout(() => {
      window.KairoOS.showToast('OS Initialisiert', 'Das OpenKAIRO System-Level ist bereit.', 'success');
    }, 2000);
  }

  set hass(hass) {
    if (!this.initialized) {
      console.error(">>> OPENKAIRO CARD INIT STARTED! <<<");
      this.initialized = true;
      this._initGlobalOS();
      this.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@300;400;800&display=swap');
          
          :host {
            --primary: #10b981;
          }

          .kairo-os {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at center, #051014 0%, #010305 100%);
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            overflow: hidden;
            z-index: 9999;
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          
          .kairo-os::before {
            content: '';
            position: absolute;
            width: 900px;
            height: 900px;
            background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(0,0,0,0) 65%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulseOrb 12s infinite alternate ease-in-out;
            z-index: 0;
            pointer-events: none;
          }

          @keyframes pulseOrb {
             0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
             100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          }

          .grid {
            position: absolute;
            width: 200%; height: 200%;
            background-image: 
              linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            transform: perspective(600px) rotateX(60deg);
            animation: moveGrid 30s linear infinite;
            z-index: 1;
          }

          @keyframes moveGrid {
            from { transform: perspective(600px) rotateX(60deg) translateY(0); }
            to { transform: perspective(600px) rotateX(60deg) translateY(50px); }
          }

          .content-shell {
            position: relative;
            z-index: 10;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 0 20px;
            box-sizing: border-box;
            margin-bottom: 80px; 
            animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes slideUpFade {
             0% { opacity: 0; transform: translateY(40px); }
             100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideUpFadeDock {
             0% { opacity: 0; transform: translate(-50%, 40px); }
             100% { opacity: 1; transform: translate(-50%, 0); }
          }

          .top-bar {
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 20;
          }

          .logo {
            width: 90px;
            filter: drop-shadow(0 0 20px var(--primary));
            margin-bottom: 10px;
            animation: pulse 4s infinite ease-in-out;
          }

          @keyframes pulse {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.4)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 40px rgba(16, 185, 129, 0.8)); transform: scale(1.05); }
          }

          h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 3.0rem;
            font-weight: 900;
            margin: 0;
            letter-spacing: -1px;
            background: linear-gradient(180deg, #ffffff 30%, #5caaa0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
          }

          .glass-panel {
            background: rgba(5, 12, 18, 0.55);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 40px;
            padding: 35px;
            margin-top: 25px;
            width: 100%;
            max-width: 680px;
            box-shadow: 0 40px 100px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(255,255,255,0.02);
          }
          
          .hub-badge {
             display: inline-flex;
             align-items: center;
             gap: 8px;
             font-family: 'Orbitron', sans-serif;
             font-size: 0.65rem;
             font-weight: 900;
             letter-spacing: 4px;
             color: var(--primary);
             background: rgba(16, 185, 129, 0.1);
             border: 1px solid rgba(16, 185, 129, 0.3);
             padding: 8px 18px;
             border-radius: 50px;
             margin-bottom: 25px;
             box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
          }
          
          .pulse-dot {
             width: 6px;
             height: 6px;
             background: var(--primary);
             border-radius: 50%;
             box-shadow: 0 0 10px var(--primary);
             animation: dotPulse 2s infinite;
          }
          
          @keyframes dotPulse {
             0%, 100% { opacity: 1; transform: scale(1); }
             50% { opacity: 0.4; transform: scale(1.5); }
          }
          
          .news-text {
            font-size: 1.2rem;
            font-weight: 300;
            line-height: 1.5;
            margin-bottom: 25px;
            color: rgba(255,255,255,0.9);
            min-height: 55px; /* keep height so it doesn't jump */
          }

          .social-container {
             display: flex;
             gap: 15px;
             width: 100%;
             margin-bottom: 25px;
          }
          .social-btn {
             flex: 1;
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 10px;
             padding: 15px;
             border-radius: 15px;
             font-family: 'Orbitron', sans-serif;
             font-weight: 900;
             font-size: 0.9rem;
             letter-spacing: 2px;
             cursor: pointer;
             transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
             border: 1px solid rgba(255,255,255,0.05);
             background: rgba(0,0,0,0.3);
             color: white;
          }
          .social-btn:hover {
             transform: translateY(-5px) scale(1.02);
          }
          .tiktok-btn:hover {
             background: rgba(255, 0, 80, 0.15);
             border-color: rgba(255, 0, 80, 0.5);
             text-shadow: 0 0 15px rgba(255,0,80,0.8);
             box-shadow: 0 10px 20px rgba(255, 0, 80, 0.2), inset 0 0 15px rgba(255,0,80,0.1);
          }
          .youtube-btn:hover {
             background: rgba(255, 0, 0, 0.15);
             border-color: rgba(255, 0, 0, 0.5);
             text-shadow: 0 0 15px rgba(255,0,0,0.8);
             box-shadow: 0 10px 20px rgba(255, 0, 0, 0.2), inset 0 0 15px rgba(255,0,0,0.1);
          }
          .tiktok-btn ha-icon { color: #ff0050; --mdc-icon-size: 26px; }
          .youtube-btn ha-icon { color: #ff0000; --mdc-icon-size: 26px; }

          .system-stats {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 30px;
          }

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            cursor: pointer;
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 20px 10px;
            border-radius: 20px;
            position: relative;
            overflow: hidden;
          }
          
          .stat-item::before {
             content: '';
             position: absolute;
             top: 0; left: 0; right: 0; height: 1px;
             background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
             opacity: 0;
             transition: 0.4s;
          }

          .stat-item:hover {
            transform: translateY(-8px);
            background: rgba(16, 185, 129, 0.05);
            border-color: rgba(16, 185, 129, 0.3);
            box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 20px rgba(16, 185, 129, 0.1);
          }
          
          .stat-item:hover::before { opacity: 1; }

          .stat-icon {
            color: var(--primary);
            margin-bottom: 12px;
            opacity: 0.8;
            transition: 0.4s;
          }
          
          .stat-item:hover .stat-icon {
             color: #fff;
             opacity: 1;
             text-shadow: 0 0 15px var(--primary);
             transform: scale(1.2);
          }

          .stat-value {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.4rem;
            font-weight: 900;
            color: white;
            margin-bottom: 4px;
            text-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
          }

          .stat-label {
            font-size: 0.65rem;
            color: rgba(255,255,255,0.4);
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .start-btn {
            background: linear-gradient(135deg, #10b981 0%, #05f0a0 50%, #10b981 100%);
            background-size: 200% auto;
            color: #000;
            padding: 18px 40px;
            border-radius: 20px;
            font-weight: 900;
            font-size: 1.15rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3), inset 0 2px 2px rgba(255,255,255,0.6);
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 2px;
            width: 100%;
            position: relative;
            overflow: hidden;
            animation: gradientShine 4s linear infinite;
          }
          
          @keyframes gradientShine {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }

          .start-btn:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 20px 40px rgba(16, 185, 129, 0.6), inset 0 2px 5px rgba(255,255,255,0.8);
          }

          .footer {
            margin-top: 20px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.65rem;
            opacity: 0.2;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .dock-container {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            background: rgba(255,255,255,0.03);
            backdrop-filter: blur(35px);
            -webkit-backdrop-filter: blur(35px);
            border: 1px solid rgba(255,255,255,0.05);
            border-top: 1px solid rgba(255,255,255,0.25);
            padding: 15px 35px;
            border-radius: 40px;
            max-width: 90vw;
            overflow-x: auto;
            z-index: 100;
            box-shadow: 0 30px 60px rgba(0,0,0,0.9), inset 0 0 10px rgba(255,255,255,0.05);
            animation: slideUpFadeDock 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .dock-container::-webkit-scrollbar { display: none; }
          .dock-container { -ms-overflow-style: none; scrollbar-width: none; }

          .dock-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.5);
            cursor: pointer;
            transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            min-width: 70px;
          }
          
          .dock-item:hover {
            color: var(--primary);
            transform: translateY(-10px) scale(1.15);
          }

          .dock-icon {
            --mdc-icon-size: 32px;
            margin-bottom: 8px;
            filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5));
          }

          .dock-label {
            font-family: 'Inter', sans-serif;
            font-size: 0.7rem;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            transition: 0.3s;
            transform: translateY(5px);
          }
          
          .dock-item:hover .dock-label {
            opacity: 1;
            transform: translateY(0);
          }

          @media (max-width: 768px) {
            .content-shell {
              padding: 0 15px;
              margin-bottom: 90px;
            }
            .logo {
              width: 70px;
            }
            h1 {
              font-size: 2.2rem;
            }
            .top-bar {
              top: 15px;
              left: 20px;
              right: 20px;
            }
            .glass-panel {
              padding: 25px 15px;
              margin-top: 15px;
              border-radius: 25px;
            }
            .hub-badge {
              font-size: 0.55rem;
              letter-spacing: 2px;
              padding: 6px 14px;
              margin-bottom: 20px;
            }
            .news-text {
              font-size: 1rem;
              margin-bottom: 20px;
              min-height: 45px;
            }
            .social-container {
              flex-direction: column;
              gap: 10px;
            }
            .system-stats {
              gap: 8px;
            }
            .stat-item {
              padding: 15px 5px;
              border-radius: 12px;
            }
            .stat-value {
              font-size: 1.1rem;
            }
            .stat-label {
              font-size: 0.55rem;
              letter-spacing: 1px;
            }
            .start-btn {
              padding: 15px 20px;
              font-size: 1rem;
            }
            .dock-container {
              padding: 10px 15px;
              gap: 12px;
              bottom: 15px;
              width: 90vw;
              box-sizing: border-box;
            }
            .dock-item {
              min-width: 55px;
            }
            .dock-icon {
              --mdc-icon-size: 26px;
            }
            .dock-label {
              font-size: 0.6rem;
            }
          }
        </style>
        
        <div class="kairo-os" id="os-container">
          <div class="grid"></div>
          
          <div class="top-bar">
            <div style="color: var(--primary); font-family: 'Orbitron'; font-size: 1rem; font-weight: 900; letter-spacing: 4px;">OK<span style="opacity:0.5">_SYS</span></div>
            <div style="color: white; opacity: 0.5; font-family: 'Orbitron'; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px;">ONLINE</div>
          </div>

          <div class="content-shell">
            <img src="https://openkairo.de/assets/openkairo-logo-D19s90KS.png" class="logo">
            <h1>OPENKAIRO <span style="color:var(--primary)">OS</span></h1>
            
            <div class="glass-panel">
              <div class="hub-badge"><span class="pulse-dot"></span> INTELLIGENCE HUB</div>
              <div id="update-banner"></div>
              <div class="news-text" id="news">Stelle Verbindung her...</div>

              <div class="social-container">
                 <div class="social-btn tiktok-btn" onclick="window.open('https://www.tiktok.com/@openkairo', '_blank')">
                    <ha-icon icon="mdi:video-vintage"></ha-icon>
                    <span>TIKTOK</span>
                 </div>
                 <div class="social-btn youtube-btn" onclick="window.open('https://www.youtube.com/@openkairo', '_blank')">
                    <ha-icon icon="mdi:youtube"></ha-icon>
                    <span>YOUTUBE</span>
                 </div>
              </div>

              <div class="system-stats">
                <div class="stat-item" id="dev-btn">
                  <div class="stat-icon"><ha-icon icon="mdi:devices"></ha-icon></div>
                  <div class="stat-value" id="dev-val">0</div>
                  <div class="stat-label">GERÄTE</div>
                </div>

                <div class="stat-item" id="auto-btn">
                  <div class="stat-icon"><ha-icon icon="mdi:robot"></ha-icon></div>
                  <div class="stat-value" id="auto-val">0</div>
                  <div class="stat-label">ROUTINEN</div>
                </div>

                <div class="stat-item" id="ent-btn">
                  <div class="stat-icon"><ha-icon icon="mdi:cube-outline"></ha-icon></div>
                  <div class="stat-value" id="ent-val">0</div>
                  <div class="stat-label">ENTITÄTEN</div>
                </div>
              </div>
              
              <button class="start-btn" id="go">DASHBOARD AUFRUFEN</button>
            </div>
            
            <div class="footer" id="foot">CORE: 4.1.2 | NODE_ID: UNKNOWN | STATUS: CONNECTING</div>
          </div>
          
          <div class="dock-container" id="auto-dock"></div>
        </div>
      `;
      this.cardContent = this.querySelector('#news');
      this.cardFooter = this.querySelector('#foot');
      this.devVal = this.querySelector('#dev-val');
      this.autoVal = this.querySelector('#auto-val');
      this.entVal = this.querySelector('#ent-val');


      this.querySelector('#go').onclick = () => {
        const osLayer = this.querySelector('#os-container');
        osLayer.style.opacity = '0';
        osLayer.style.pointerEvents = 'none';
        osLayer.style.transform = 'scale(1.05)';
        setTimeout(() => { osLayer.style.display = 'none'; }, 600);
      };
      
      if (window.KairoOS) {
         window.KairoOS.launchpad = this.querySelector('#os-container');
      }
      
      // Shortcuts to meaningful pages
      this.querySelector('#dev-btn').onclick = () => { window.location.href = '/config/devices/dashboard'; };
      this.querySelector('#auto-btn').onclick = () => { window.location.href = '/config/automation/dashboard'; };
      this.querySelector('#ent-btn').onclick = () => { window.location.href = '/config/entities'; };
    }

    // --- Update Checker & Sci-Fi Logs ---
    this._hass = hass; // Save the reference so the interval always grabs the LIVE data and not a stale first-render object

    const updateBanner = this.querySelector('#update-banner');
    const updateEntities = Object.keys(this._hass.states).filter(k => k.startsWith('update.') && this._hass.states[k].state === 'on');
    
    if (updateEntities.length > 0) {
      // Update is available! Show banner.
      const up = this._hass.states[updateEntities[0]]; // Gets the first available update
      const title = up.attributes.title || up.attributes.friendly_name || "System";
      if (updateBanner) {
        updateBanner.innerHTML = `<div id="update-click-btn" style="cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); background: rgba(255, 0, 80, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 0, 80, 0.3); border-top: 1px solid rgba(255,0,80,0.6); border-radius: 20px; padding: 15px; margin-bottom: 25px; color:#ff4a4a; display:flex; flex-direction:column; align-items:center; box-shadow: 0 10px 20px rgba(255,0,80,0.1), inset 0 0 20px rgba(255,0,80,0.05);" onmouseover="this.style.background='rgba(255,0,80,0.1)';this.style.transform='scale(1.02)'" onmouseout="this.style.background='rgba(255,0,80,0.05)';this.style.transform='scale(1)'">
           <div style="font-family:'Orbitron'; font-weight:900; letter-spacing:2px; font-size:0.75rem; margin-bottom:8px; display:flex; align-items:center; gap:8px;"><span style="display:inline-block;width:6px;height:6px;background:#ff4a4a;border-radius:50%;box-shadow:0 0 10px #ff4a4a; animation: dotPulse 2s infinite;"></span>SYSTEM-UPDATE VERFÜGBAR</div>
           <span style="color:rgba(255,255,255,0.8); font-size: 0.85rem; font-weight:600; font-family:'Inter',sans-serif;">${title} <span style="opacity:0.5; font-weight:400;">(v${up.attributes.latest_version})</span></span>
        </div>`;
        const clickBanner = updateBanner.querySelector('#update-click-btn');
        if (clickBanner) {
            clickBanner.onclick = () => {
                const event = new Event('hass-more-info', { bubbles: true, cancelable: false, composed: true });
                event.detail = { entityId: updateEntities[0] };
                this.dispatchEvent(event);
            };
        }
      }
    } else {
       if (updateBanner) updateBanner.innerHTML = '';
    }
    
    // Self-contained resilient interval loop for Sci-Fi logs
    if (!this._logInterval) {
       this._logInterval = setInterval(() => {
           try {
               if (!this._hass || !this._hass.states) return;

               const liveStates = Object.values(this._hass.states);
               const lDevs = this._hass.devices ? Object.keys(this._hass.devices).length : (this._hass.entities ? new Set(Object.values(this._hass.entities).map(e => e.device_id).filter(id => id)).size : "UNBEKANNT");
               const lAutos = liveStates.filter(s => s.entity_id.startsWith('automation.')).length;
               const lEnts = liveStates.length;

               const dynamicLogs = [
                  `ÜBERWACHE <span style="color:var(--primary); text-shadow: 0 0 10px var(--primary); font-weight:900;">${lEnts}</span> ENTITÄTEN...`,
                  `<span style="color:var(--primary); text-shadow: 0 0 10px var(--primary); font-weight:900;">${lDevs}</span> GERÄTE SIND VERBUNDEN.`,
                  `<span style="color:var(--primary); text-shadow: 0 0 10px var(--primary); font-weight:900;">${lAutos}</span> ROUTINEN SIND <span style="color:#05f0a0">ONLINE</span>.`,
                  'Lokaler OpenKairo-Core <span style="color:#05f0a0">STABIL</span>.',
                  'Lokales Neural-Netzwerk <span style="color:#05f0a0">KALIBRIERT</span>.',
                  'Sicherheitsprotokolle <span style="color:var(--primary)">AKTIV</span>.',
                  'Subroutinen arbeiten <span style="color:#ff0050">FEHLERFREI</span>.'
               ];
               
               // Read update states strictly dynamically inside the interval
               const currentUpdates = Object.keys(this._hass.states).filter(k => k.startsWith('update.') && this._hass.states[k].state === 'on');
               if (currentUpdates.length > 0) {
                   dynamicLogs.push('<span style="color:#ff4a4a; font-weight:900; text-shadow: 0 0 10px #ff4a4a;">SYSTEM-UPDATE ERFORDERLICH!</span>');
               }

               const nextLog = dynamicLogs[Math.floor(Math.random() * dynamicLogs.length)];
               if (this.cardContent) {
                   this.cardContent.innerHTML = `<i>"${nextLog}"</i>`;
               }
           } catch (err) {
               if (this.cardContent) {
                   this.cardContent.innerHTML = `<i>[SYS-ERROR]: ${err.message}</i>`;
               }
           }
       }, 5000); 
       
       // Instant kickstart so it doesn't wait 5 seconds initially!
       if (this.cardContent) {
           this.cardContent.innerHTML = `<i>"Neural-Core synchronisiert..."</i>`;
       }
    }

    if (this.cardFooter) {
      this.cardFooter.innerText = `LOKALER CORE: VERIFIED | NODE: OK-${Math.floor(Math.random()*9000)+1000} | STATUS: CONNECTED`;
    }

    // --- Smart Home Intelligence Summary ---
    const states = Object.values(hass.states);
    
    // Count devices safely from hass.devices or hass.entities
    let totalDevices = 0;
    if (hass.devices) {
        totalDevices = Object.keys(hass.devices).length;
    } else if (hass.entities) {
        totalDevices = new Set(Object.values(hass.entities).map(e => e.device_id).filter(id => id)).size;
    }
    
    // Count active automations
    const automations = states.filter(s => s.entity_id.startsWith('automation.')).length;
    
    // Total connected entities
    const totalEntities = states.length;

    if(this.devVal) this.devVal.innerText = totalDevices > 0 ? totalDevices.toString() : "-";
    if(this.autoVal) this.autoVal.innerText = automations.toString();
    if(this.entVal) this.entVal.innerText = totalEntities.toString();

    // Dynamically update the dock if panels or sidebar config changes
    const sidebarStateStr = localStorage.getItem('sidebarSavedState') || '';
    const panelStateHash = Object.keys(hass.panels || {}).join(',') + sidebarStateStr;
    
    if (this._panelStateHash !== panelStateHash) {
      this._panelStateHash = panelStateHash;
      const dock = this.querySelector('#auto-dock');
      if (dock && hass.panels) {
        let hiddenPanels = [];
        try {
          const sidebarState = JSON.parse(sidebarStateStr);
          if (sidebarState && sidebarState.hidden) {
            hiddenPanels = sidebarState.hidden;
          }
        } catch(e) {}

        let dockHtml = '';
        for (const [path, panel] of Object.entries(hass.panels)) {
           // Skip hidden panels from the HA sidebar
           if (hiddenPanels.includes(path)) continue;

           // Only show true lovelace dashboards
           if (panel.title && panel.component_name === 'lovelace') {
              dockHtml += `
                <div class="dock-item" data-path="/${path}">
                  <ha-icon icon="${panel.icon || 'mdi:view-dashboard'}" class="dock-icon"></ha-icon>
                  <span class="dock-label">${panel.title}</span>
                </div>
              `;
           }
        }
        dockHtml += `
          <div class="dock-item" data-path="/config">
             <ha-icon icon="mdi:cog" class="dock-icon"></ha-icon>
             <span class="dock-label">System</span>
          </div>
        `;
        dock.innerHTML = dockHtml;
        
        this.querySelectorAll('.dock-item').forEach(item => {
           item.onclick = () => {
             item.style.transform = 'scale(0.9)';
             setTimeout(() => {
                window.location.href = item.getAttribute('data-path');
             }, 150);
           };
        });
      }
    }
  }

  setConfig(config) {}
  getCardSize() { return 10; }
}

if (!customElements.get('openkairo-card')) {
  customElements.define('openkairo-card', OpenKairoCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "openkairo-card",
    name: "OpenKairo OS Launchpad",
    description: "Advanced custom Launchpad for OpenKairo Hardware with Dock and System Stats."
  });
}
