/**
 * Infinity Studio - Block Registry
 * Definitions and rendering logic for various Home Assistant entity blocks.
 */
export const BlockRegistry = {
    renderLight: (b) => {
        const isOn = b.state === 'on';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); border:1px solid ${isOn ? b.color : 'rgba(255,255,255,0.1)'}; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: ${isOn ? '0 0 20px ' + b.color + '40' : 'none'};">
                <ha-icon icon="mdi:lightbulb" style="color:${isOn ? b.color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 5px ' + b.color + ')' : 'none'};"></ha-icon>
            </div>`;
    },

    renderFan: (b) => {
        const isOn = b.state === 'on';
        const speed = b.speed || 0;
        const dur = speed > 0 ? (100 / speed) : 2;
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <ha-icon icon="mdi:fan" class="${isOn ? 'anim-fan' : ''}" style="--fan-dur:${dur}s; color:${isOn ? b.color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 5px ' + b.color + ')' : 'none'};"></ha-icon>
            </div>`;
    },

    renderSensor: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
                <div style="font-size:9px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">${b.text || 'Sensor'}</div>
                <div style="font-size:18px; font-weight:900;">${b.state || '24'}<span style="font-size:10px; opacity:0.6; margin-left:2px;">${b.unit || '°C'}</span></div>
            </div>`;
    },

    renderClimateArc: (b) => {
        const color = b.color || '#10b981';
        return `
            <div class="studio-pro-arc" style="background:rgba(0,0,0,0.6); border:1px solid ${color}20; box-shadow: 0 10px 40px rgba(0,0,0,0.4), inset 0 0 20px ${color}10;">
                <div class="val" style="color:#fff; text-shadow:0 0 15px ${color}80;">${b.text || '21°'}</div>
            </div>`;
    },

    renderHexPower: (b) => {
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:${color}; clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; align-items:center; justify-content:center; opacity:0.8;">
                <div style="width:90%; height:90%; background:#000; clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <ha-icon icon="mdi:flash" style="--mdc-icon-size:18px; color:${color};"></ha-icon>
                    <div style="font-size:10px; font-weight:900; color:#fff;">ON</div>
                </div>
            </div>`;
    },

    renderPulseChart: (b) => {
        const color = b.color || '#00f6ff';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); border-radius:12px; border:1px solid rgba(255,255,255,0.05); padding:8px; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-size:8px; color:${color}; font-weight:900; text-transform:uppercase;">${b.text || 'Load'}</span>
                    <span style="font-size:8px; color:#fff; font-weight:900;">85%</span>
                </div>
                <div style="flex:1; display:flex; align-items:flex-end; gap:2px;">
                    <div style="flex:1; background:${color}; height:40%; opacity:0.3;"></div>
                    <div style="flex:1; background:${color}; height:70%; opacity:0.6;"></div>
                    <div style="flex:1; background:${color}; height:30%; opacity:0.3;"></div>
                    <div style="flex:1; background:${color}; height:90%; opacity:0.9; box-shadow:0 0 10px ${color};"></div>
                </div>
            </div>`;
    },

    renderWeather: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border-radius:16px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:10px; padding:0 12px;">
                <ha-icon icon="mdi:weather-sunny" style="color:#fbbf24; filter:drop-shadow(0 0 8px #fbbf24);"></ha-icon>
                <div style="font-size:18px; font-weight:900; color:#fff;">18°</div>
            </div>`;
    },

    renderMediaPlayer: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); border-radius:20px; border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:10px; padding:10px;">
                <div style="width:30px; height:30px; background:linear-gradient(45deg, #7c3aed, #db2777); border-radius:8px; display:flex; align-items:center; justify-content:center;">
                    <ha-icon icon="mdi:music" style="--mdc-icon-size:16px; color:#fff;"></ha-icon>
                </div>
                <div style="overflow:hidden; flex:1;">
                    <div style="font-size:10px; font-weight:900; color:#fff; white-space:nowrap;">Night City</div>
                    <div style="font-size:8px; color:rgba(255,255,255,0.4);">REAKTOR</div>
                </div>
            </div>`;
    },

    renderNeonSwitch: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); border:1px solid ${color}; border-radius:16px; display:flex; flex-direction:column; gap:4px; padding:8px; box-shadow: 0 0 15px ${color}30;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <ha-icon icon="mdi:lightbulb-on" style="--mdc-icon-size:16px; color:${color};"></ha-icon>
              <div style="width:24px; height:12px; background:${color}; border-radius:10px; position:relative;">
                <div style="position:absolute; width:8px; height:8px; background:#fff; border-radius:50%; top:2px; right:2px;"></div>
              </div>
            </div>
            <div style="font-size:8px; font-weight:900; color:#fff;">${b.text || 'Toggle'}</div>
          </div>`;
    },

    renderStatusPill: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:20px; display:flex; align-items:center; justify-content:center; gap:6px;">
            <div style="width:6px; height:6px; background:${color}; border-radius:50%; box-shadow:0 0 8px ${color};"></div>
            <div style="font-size:9px; font-weight:900; color:#fff;">ONLINE</div>
          </div>`;
    },

    renderSliderDimmer: (b) => {
        const color = b.color || '#10b981';
        return `
          <div style="width:100%; height:100%; background:rgba(0,0,0,0.4); border-radius:16px; border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:4px; padding:8px;">
            <div style="font-size:8px; font-weight:900; color:rgba(255,255,255,0.4);">DIMMER</div>
            <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; position:relative;">
                <div style="width:60%; height:100%; background:${color}; border-radius:3px; box-shadow:0 0 10px ${color}80;"></div>
            </div>
          </div>`;
    },

    getStandardBlocks: () => [
        { type: 'Light', icon: 'mdi:lightbulb', preview: '<ha-icon icon="mdi:lightbulb" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Sensor', icon: 'mdi:gauge', preview: '<div style="font-size:14px; font-weight:900;">24°</div>' },
        { type: 'Fan', icon: 'mdi:fan', preview: '<ha-icon icon="mdi:fan"></ha-icon>' },
        { type: 'Klima-Bogen', icon: 'mdi:circle-slice-8', preview: '<div style="width:24px; height:24px; border:2px solid var(--kairo-cyan); border-radius:50%; border-right-color:transparent;"></div>' },
        { type: 'Hex-Power', icon: 'mdi:hexagon-slice-6', preview: '<ha-icon icon="mdi:hexagon-slice-6" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Pulse-Chart', icon: 'mdi:chart-timeline-variant', preview: '<ha-icon icon="mdi:chart-timeline-variant"></ha-icon>' },
        { type: 'Weather-Card', icon: 'mdi:weather-partly-cloudy', preview: '<ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>' },
        { type: 'Media-Player', icon: 'mdi:music-box', preview: '<ha-icon icon="mdi:music-box"></ha-icon>' },
        { type: 'Neon-Switch', icon: 'mdi:toggle-switch', preview: '<ha-icon icon="mdi:toggle-switch" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Status-Pill', icon: 'mdi:pill', preview: '<div style="width:12px; height:12px; border-radius:50%; background:var(--kairo-cyan);"></div>' },
        { type: 'Slider-Dimmer', icon: 'mdi:tune-variant', preview: '<ha-icon icon="mdi:tune-variant"></ha-icon>' },
        { type: 'Container', icon: 'mdi:crop-square', preview: '<div style="width:30px; height:20px; border:1px solid rgba(255,255,255,0.2); border-radius:4px;"></div>' }
    ]
};
