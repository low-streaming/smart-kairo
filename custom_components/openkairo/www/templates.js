/**
 * Infinity Studio - Templates
 * Persistence and data management for layouts and templates.
 */
export const Templates = {
    /**
     * Exports the current layout to a YAML format for Home Assistant.
     * @param {Object} state - The full application state.
     * @returns {string} The YAML string.
     */
    exportToYAML: (state) => {
        let yaml = `type: 'custom:openkairo-custom-card'\n`;
        yaml += `name: '${state.name || 'OpenKairo'}'\n`;
        yaml += `glow: ${state.style.glow || 40}\n`;
        yaml += `blur: ${state.style.blur || 25}\n`;
        yaml += `color: '${state.style.color || '#00f6ff'}'\n`;
        yaml += `opacity: ${state.style.opacity || 0.3}\n`;
        yaml += `layout:\n`;
        
        if (state.blocks && Array.isArray(state.blocks)) {
            state.blocks.forEach(b => {
                yaml += `  - id: '${b.id}'\n`;
                yaml += `    type: '${b.type}'\n`;
                yaml += `    x: ${b.x}\n`;
                yaml += `    y: ${b.y}\n`;
                yaml += `    w: ${b.w || 100}\n`;
                yaml += `    h: ${b.h || 40}\n`;
                if (b.text) yaml += `    text: '${b.text}'\n`;
                if (b.entity) yaml += `    entity: '${b.entity}'\n`;
                if (b.color) yaml += `    color: '${b.color}'\n`;
                if (b.glow) yaml += `    glow: ${b.glow}\n`;
                if (b.animation && b.animation !== 'none') {
                    yaml += `    animation: '${b.animation}'\n`;
                }
                if (b.tap_action) yaml += `    tap_action: '${b.tap_action}'\n`;
            });
        }
        
        return yaml.trim();
    },

    /**
     * Exports the state as a clean JSON for portability.
     * @param {Object} state - Current state.
     * @returns {string} JSON string.
     */
    exportToJSON: (state) => JSON.stringify(state, null, 2),

    /**
     * Validates and imports a JSON layout.
     * @param {string} jsonStr - JSON string from the user.
     * @returns {Object|null} The imported state or null if invalid.
     */
    importFromJSON: (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (!data.blocks || !Array.isArray(data.blocks)) {
                throw new Error("Invalid structure: missing blocks array.");
            }
            return data;
        } catch (e) {
            console.error("Import Error:", e);
            return null;
        }
    },

    /**
     * Saves a layout as a named template in local storage.
     * @param {string} name - Template name.
     * @param {Object} state - The layout state.
     */
    saveTemplate: (name, state) => {
        const templates = JSON.parse(localStorage.getItem('kairo_templates') || '{}');
        templates[name] = state;
        localStorage.setItem('kairo_templates', JSON.stringify(templates));
    },

    /**
     * Loads all saved templates.
     * @returns {Object} All saved templates.
     */
    loadTemplates: () => JSON.parse(localStorage.getItem('kairo_templates') || '{}'),

    /**
     * Factory presets for common rooms.
     * @returns {Object} Predefined high-quality layouts.
     */
    getFactoryPresets: () => ({
        'Wohnzimmer Basis': {
            name: 'Living Room',
            style: { glow: 40, blur: 25, color: '#00f6ff', opacity: 0.3 },
            blocks: [
                { id: 'l1', type: 'Light', x: 20, y: 100, w: 100, h: 40, text: 'Decke', color: '#00f6ff', tap_action: 'toggle' },
                { id: 'l2', type: 'Light', x: 130, y: 100, w: 100, h: 40, text: 'Wand', color: '#00f6ff', tap_action: 'toggle' },
                { id: 'c1', type: 'Klima-Bogen', x: 75, y: 180, w: 140, h: 140, text: '22°', color: '#10b981' }
            ]
        },
        'Schlafzimmer': {
            name: 'Bedroom',
            style: { glow: 30, blur: 20, color: '#fca5a5', opacity: 0.2 },
            blocks: [
                { id: 'b1', type: 'Light', x: 20, y: 80, w: 100, h: 40, text: 'Nachtlicht', color: '#fca5a5', tap_action: 'toggle' },
                { id: 's1', type: 'Sensor', x: 130, y: 80, w: 100, h: 40, text: 'Temp', state: '19.5', unit: '°C' }
            ]
        },
        'Klima-Zentrum': {
            name: 'Climate Pro',
            style: { glow: 50, blur: 30, color: '#10b981', opacity: 0.4 },
            blocks: [
                { id: 'ca1', type: 'Klima-Bogen', x: 80, y: 100, w: 160, h: 160, text: '23.5°', color: '#10b981' },
                { id: 'f1', type: 'Fan', x: 110, y: 300, w: 100, h: 40, text: 'Lüftung', color: '#10b981', state: 'on', speed: 50 }
            ]
        }
    })
};
