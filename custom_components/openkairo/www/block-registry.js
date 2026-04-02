/**
 * Infinity Studio - Block Registry
 * Definitions and rendering logic for various Home Assistant entity blocks.
 * Modern UI Edition: Neon-Glow, Glassmorphism, and Micro-Animations.
 */
export const BlockRegistry = {
    renderLight: (b) => {
        const isOn = b.state === 'on';
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); border:1px solid ${isOn ? color : 'rgba(255,255,255,0.08)'}; border-radius:16px; display:flex; align-items:center; justify-content:center; box-shadow: ${isOn ? '0 0 30px ' + color + '40, inset 0 0 10px ' + color + '20' : 'none'}; transition:0.4s ease;">
                <ha-icon icon="${isOn ? 'mdi:lightbulb-on' : 'mdi:lightbulb-outline'}" 
                         style="color:${isOn ? color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 10px ' + color + ')' : 'none'}; transform:${isOn ? 'scale(1.1)' : 'scale(1)'}; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></ha-icon>
            </div>`;
    },

    renderFan: (b) => {
        const isOn = b.state === 'on';
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.02); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.08); border-radius:18px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 0 15px rgba(255,255,255,0.02);">
                <ha-icon icon="mdi:fan" class="${isOn ? 'anim-fan' : ''}" style="--fan-dur:1.5s; color:${isOn ? color : 'rgba(255,255,255,0.3)'}; filter:${isOn ? 'drop-shadow(0 0 8px ' + color + ')' : 'none'};"></ha-icon>
            </div>`;
    },

    renderSensor: (b) => {
        const color = b.color || 'var(--kairo-cyan)';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); backdrop-filter:blur(15px); border:1px solid rgba(255,255,255,0.05); border-radius:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; position:relative;">
                <div style="position:absolute; width:100%; height:20%; top:0; background:linear-gradient(to bottom, ${color}10, transparent);"></div>
                <div style="font-size:8px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:2px; margin-bottom:4px; font-weight:900;">${b.text || 'Sensor'}</div>
                <div style="font-size:22px; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(0,0,0,0.5);">${b.state || '24'}<span style="font-size:10px; opacity:0.6; margin-left:2px; font-weight:400;">${b.unit || '°C'}</span></div>
            </div>`;
    },

    renderClimateArc: (b) => {
        const color = b.color || '#10b981';
        return `
            <div class="studio-pro-arc" style="background:rgba(0,0,0,0.7); backdrop-filter:blur(20px); border:1px solid ${color}30; box-shadow: 0 15px 50px rgba(0,0,0,0.5), inset 0 0 30px ${color}10; width:100%; height:100%; border-radius:50%; position:relative; overflow:hidden;">
                <div style="position:absolute; inset:5px; border:1px dashed ${color}40; border-radius:50%; opacity:0.5;"></div>
                <div class="val" style="color:#fff; text-shadow:0 0 20px ${color}; font-size:28px; font-weight:900;">${b.text || '21°'}</div>
            </div>`;
    },

    renderHexPower: (b) => {
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:linear-gradient(135deg, ${color}, ${color}80); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 0 15px ${color}40);">
                <div style="width:92%; height:92%; background:rgba(0,0,0,0.9); clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <ha-icon icon="mdi:flash" style="--mdc-icon-size:22px; color:${color}; filter:drop-shadow(0 0 5px ${color});"></ha-icon>
                    <div style="font-size:9px; font-weight:900; color:#fff; letter-spacing:1px; margin-top:-2px;">AKTIV</div>
                </div>
            </div>`;
    },

    renderPulseChart: (b) => {
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); border-radius:18px; border:1px solid rgba(255,255,255,0.06); padding:10px; display:flex; flex-direction:column; box-shadow:inset 0 0 20px rgba(0,0,0,0.4);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:9px; color:${color}; font-weight:900; text-transform:uppercase; letter-spacing:1px;">${b.text || 'System'}</span>
                    <span style="font-size:9px; color:#fff; font-weight:900; background:${color}30; padding:2px 6px; border-radius:10px; border:1px solid ${color}40;">85%</span>
                </div>
                <div style="flex:1; display:flex; align-items:flex-end; gap:3px; padding-bottom:4px;">
                    ${Array(12).fill(0).map((_,i) => `<div style="flex:1; background:linear-gradient(to top, ${color}20, ${color}); height:${[30,40,20,60,45,70,30,85,40,95,65,80][i]}%; border-radius:10px; opacity:${i === 9 ? 1 : 0.4}; box-shadow:${i === 9 ? '0 0 15px ' + color : 'none'}; transition:0.3s;"></div>`).join('')}
                </div>
            </div>`;
    },

    renderNeonSwitch: (b) => {
        const color = b.color || '#a1ff10';
        const isOn = b.state === 'on';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter:blur(12px); border:1px solid ${isOn ? color : 'rgba(255,255,255,0.1)'}; border-radius:20px; display:flex; flex-direction:column; justify-content:space-between; padding:12px; box-shadow: ${isOn ? '0 0 25px ' + color + '30, inset 0 0 10px ' + color + '15' : '0 10px 30px rgba(0,0,0,0.3)'}; transition:0.4s ease;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <ha-icon icon="mdi:flash-circle" style="--mdc-icon-size:20px; color:${isOn ? color : 'rgba(255,255,255,0.2)'}; filter:${isOn ? 'drop-shadow(0 0 8px ' + color + ')' : 'none'}; transition:0.4s;"></ha-icon>
              <div style="width:34px; height:20px; background:${isOn ? color : 'rgba(255,255,255,0.1)'}; border-radius:12px; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                <div style="position:absolute; width:14px; height:14px; background:#fff; border-radius:50%; top:2px; left:${isOn ? '18px' : '2px'}; box-shadow:0 0 5px rgba(0,0,0,0.5); transition:0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);"></div>
              </div>
            </div>
            <div style="font-size:10px; font-weight:900; color:${isOn ? '#fff' : 'rgba(255,255,255,0.4)'}; text-transform:uppercase; letter-spacing:1px;">${b.text || 'Toggle'}</div>
          </div>`;
    },

    renderStatusPill: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.08); border-radius:25px; display:flex; align-items:center; justify-content:center; gap:8px; padding:0 15px; box-shadow:0 8px 30px rgba(0,0,0,0.3);">
            <div style="width:8px; height:8px; background:${color}; border-radius:50%; position:relative; box-shadow:0 0 12px ${color};">
                <div style="position:absolute; inset:-4px; background:${color}; border-radius:50%; opacity:0.4; animation:anim-pulse 2s infinite;"></div>
            </div>
            <div style="font-size:10px; font-weight:900; color:#fff; letter-spacing:2px;">ONLINE</div>
          </div>`;
    },

    renderSliderDimmer: (b) => {
        const color = b.color || '#00f6ff';
        return `
          <div style="width:100%; height:100%; background:rgba(255,255,255,0.02); backdrop-filter:blur(15px); border-radius:18px; border:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; justify-content:center; gap:8px; padding:0 12px; box-shadow:inset 0 0 20px rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:9px; font-weight:900; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1.5px;">Intensität</div>
                <div style="font-size:9px; font-weight:900; color:${color};">65%</div>
            </div>
            <div style="height:10px; background:rgba(0,0,0,0.5); border-radius:5px; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05);">
                <div style="width:65%; height:100%; background:linear-gradient(to right, ${color}40, ${color}); border-radius:5px; box-shadow:0 0 15px ${color}80; position:relative;">
                    <div style="position:absolute; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation:anim-glow-slide 2s infinite; opacity:0.3;"></div>
                </div>
            </div>
          </div>`;
    },

    getStandardBlocks: () => [
        { type: 'Light', icon: 'mdi:lightbulb', preview: '<ha-icon icon="mdi:lightbulb" style="color:var(--kairo-cyan); filter:drop-shadow(0 0 5px var(--kairo-cyan));"></ha-icon>' },
        { type: 'Sensor', icon: 'mdi:gauge', preview: '<div style="font-size:14px; font-weight:900; color:white;">24.5</div>' },
        { type: 'Fan', icon: 'mdi:fan', preview: '<ha-icon icon="mdi:fan" style="animation:anim-fan 1.5s infinite linear"></ha-icon>' },
        { type: 'Klima-Bogen', icon: 'mdi:circle-slice-8', preview: '<div style="width:24px; height:24px; border:2px solid var(--kairo-cyan); border-radius:50%; border-right-color:transparent; filter:drop-shadow(0 0 8px var(--kairo-cyan));"></div>' },
        { type: 'Hex-Power', icon: 'mdi:hexagon-slice-6', preview: '<ha-icon icon="mdi:hexagon-slice-6" style="color:var(--kairo-cyan); filter:drop-shadow(0 0 5px var(--kairo-cyan));"></ha-icon>' },
        { type: 'Pulse-Chart', icon: 'mdi:chart-timeline-variant', preview: '<ha-icon icon="mdi:chart-timeline-variant" style="color:#00f6ff;"></ha-icon>' },
        { type: 'Weather-Card', icon: 'mdi:weather-partly-cloudy', preview: '<ha-icon icon="mdi:weather-partly-cloudy" style="color:#fbbf24;"></ha-icon>' },
        { type: 'Media-Player', icon: 'mdi:music-box', preview: '<ha-icon icon="mdi:music-box" style="color:#7c3aed;"></ha-icon>' },
        { type: 'Neon-Switch', icon: 'mdi:toggle-switch', preview: '<ha-icon icon="mdi:toggle-switch" style="color:#a1ff10;"></ha-icon>' },
        { type: 'Status-Pill', icon: 'mdi:pill', preview: '<div style="width:12px; height:12px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></div>' },
        { type: 'Slider-Dimmer', icon: 'mdi:tune-variant', preview: '<ha-icon icon="mdi:tune-variant" style="color:#00f6ff;"></ha-icon>' },
        { type: 'Container', icon: 'mdi:crop-square', preview: '<div style="width:30px; height:20px; border:2px solid rgba(255,255,255,0.4); border-radius:6px; background:rgba(0,0,0,0.2);"></div>' }
    ]
};
