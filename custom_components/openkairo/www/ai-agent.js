/**
 * Infinity Studio - AI-Agent
 * Natural language processing for automated design.
 */
export const AIAgent = {
    /**
     * Translates a natural language prompt into a list of block configurations.
     * @param {string} prompt - User instruction.
     * @returns {Array} List of block templates to add.
     */
    generateFromPrompt: (prompt) => {
        const p = prompt.toLowerCase();
        const newBlocks = [];
        let startX = 100;
        let startY = 100;

        // Basic keyword parsing
        if (p.includes('light') || p.includes('licht')) {
            const count = p.match(/\d+/) ? parseInt(p.match(/\d+/)[0]) : 1;
            for(let i=0; i<count; i++) {
                newBlocks.push({ type: 'Light', x: startX + (i*130), y: startY, text: 'Light ' + (i+1) });
            }
            startY += 120;
        }

        if (p.includes('climate') || p.includes('klima') || p.includes('temp')) {
            newBlocks.push({ type: 'Klima-Bogen', x: startX, y: startY, text: '21°' });
            startY += 160;
        }

        if (p.includes('sensor')) {
            newBlocks.push({ type: 'Sensor', x: startX, y: startY, text: 'Temp Sensor' });
        }

        if (p.includes('fan') || p.includes('lüfter')) {
            newBlocks.push({ type: 'Fan', x: startX + 130, y: startY - 120, text: 'Main Fan' });
        }

        return newBlocks;
    }
};
