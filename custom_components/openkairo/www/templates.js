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
        yaml += `name: '${state.name}'\n`;
        yaml += `glow: ${state.style.glow}\n`;
        yaml += `blur: ${state.style.blur}\n`;
        yaml += `color: '${state.style.color}'\n`;
        yaml += `opacity: ${state.style.opacity}\n`;
        yaml += `layout:\n`;
        
        state.blocks.forEach(b => {
            yaml += `  - id: ${b.id}\n`;
            yaml += `    type: ${b.type}\n`;
            yaml += `    x: ${b.x}\n`;
            yaml += `    y: ${b.y}\n`;
            yaml += `    w: ${b.w || 100}\n`;
            yaml += `    h: ${b.h || 40}\n`;
            yaml += `    text: '${b.text || ''}'\n`;
            if (b.entity) yaml += `    entity: ${b.entity}\n`;
            yaml += `    color: '${b.color || '#fff'}'\n`;
            if (b.glow) yaml += `    glow: ${b.glow}\n`;
            if (b.animation && b.animation !== 'none') {
                yaml += `    animation: ${b.animation}\n`;
                yaml += `    animDuration: ${b.animDuration || 2}\n`;
            }
            if (b.tap_action) yaml += `    tap_action: ${b.tap_action}\n`;
            if (b.double_tap_action) yaml += `    double_tap_action: ${b.double_tap_action}\n`;
            if (b.hold_action) yaml += `    hold_action: ${b.hold_action}\n`;
        });
        
        return yaml;
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
    loadTemplates: () => JSON.parse(localStorage.getItem('kairo_templates') || '{}')
};
