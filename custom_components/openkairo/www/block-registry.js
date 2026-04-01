/**
 * Infinity Studio - Block Registry
 * Definitions and rendering logic for various Home Assistant entity blocks.
 */
export const BlockRegistry = {
    /**
     * Renders a light block.
     * @param {Object} b - The block state.
     * @returns {string} The HTML string.
     */
    renderLight: (b) => {
        const isOn = b.state === 'on';
        return `
            <div style="width:100%; height:100%; background:rgba(0,0,0,0.5); border:1px solid ${isOn ? b.color : 'rgba(255,255,255,0.1)'}; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow: ${isOn ? '0 0 20px ' + b.color + '40' : 'none'};">
                <ha-icon icon="mdi:lightbulb" style="color:${isOn ? b.color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 5px ' + b.color + ')' : 'none'};"></ha-icon>
            </div>`;
    },

    /**
     * Renders a fan block.
     * @param {Object} b - The block state.
     * @returns {string} The HTML string.
     */
    renderFan: (b) => {
        const isOn = b.state === 'on';
        const speed = b.speed || 0;
        const dur = speed > 0 ? (100 / speed) : 2;
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <ha-icon icon="mdi:fan" class="${isOn ? 'anim-fan' : ''}" style="--fan-dur:${dur}s; color:${isOn ? b.color : '#fff'}; filter:${isOn ? 'drop-shadow(0 0 5px ' + b.color + ')' : 'none'};"></ha-icon>
            </div>`;
    },

    /**
     * Renders a sensor block.
     * @param {Object} b - The block state.
     * @returns {string} The HTML string.
     */
    renderSensor: (b) => {
        return `
            <div style="width:100%; height:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
                <div style="font-size:9px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">${b.text || 'Sensor'}</div>
                <div style="font-size:18px; font-weight:900;">${b.state || '--'}<span style="font-size:10px; opacity:0.6; margin-left:2px;">${b.unit || ''}</span></div>
            </div>`;
    },

    /**
     * Renders a custom climate arc (Klima-Bogen).
     * @param {Object} b - The block state.
     * @returns {string} The HTML string.
     */
    renderClimateArc: (b) => {
        return `
            <div class="studio-pro-arc" style="background:rgba(0,0,0,0.6); border:1px solid ${b.color}20; box-shadow: 0 10px 40px rgba(0,0,0,0.4), inset 0 0 20px ${b.color}10;">
                <div class="val" style="color:#fff; text-shadow:0 0 15px ${b.color}80;">${b.text || '21°'}</div>
            </div>`;
    },

    /**
     * Lists all available standard blocks for the sidebar.
     * @returns {Array} List of block templates.
     */
    getStandardBlocks: () => [
        { type: 'Light', icon: 'mdi:lightbulb', preview: '<ha-icon icon="mdi:lightbulb" style="color:var(--kairo-cyan)"></ha-icon>' },
        { type: 'Sensor', icon: 'mdi:gauge', preview: '<div style="font-size:14px; font-weight:900;">24°</div>' },
        { type: 'Fan', icon: 'mdi:fan', preview: '<ha-icon icon="mdi:fan"></ha-icon>' },
        { type: 'Klima-Bogen', icon: 'mdi:circle-slice-8', preview: '<div style="width:24px; height:24px; border:2px solid var(--kairo-cyan); border-radius:50%; border-right-color:transparent;"></div>' },
        { type: 'Container', icon: 'mdi:crop-square', preview: '<div style="width:30px; height:20px; border:1px solid rgba(255,255,255,0.2); border-radius:4px;"></div>' }
    ]
};
