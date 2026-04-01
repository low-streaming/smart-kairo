/**
 * Infinity Studio - Interaction Engine
 * Advanced gesture recognition for block-based UI.
 */
export class InfinityInteraction {
    /**
     * @param {Object} callbacks - OnTap, OnDouble, OnHold.
     */
    constructor(callbacks = {}) {
        this.onTap = callbacks.onTap || (() => {});
        this.onDouble = callbacks.onDouble || (() => {});
        this.onHold = callbacks.onHold || (() => {});
        
        this.tapTimer = null;
        this.holdTimer = null;
        this.isHold = false;
        this.tapThreshold = 250; // ms
        this.holdThreshold = 600; // ms
    }

    /**
     * Handles the start of a pointer/mouse interaction.
     * @param {Event} e - The native event.
     * @param {string} id - The unique block ID.
     */
    handleStart(e, id) {
        this.isHold = false;
        // Start hold timer
        this.holdTimer = setTimeout(() => {
            this.isHold = true;
            this.onHold(id);
        }, this.holdThreshold);
    }

    /**
     * Handles the end of a pointer/mouse interaction.
     * @param {Event} e - The native event.
     * @param {string} id - The unique block ID.
     */
    handleEnd(e, id) {
        clearTimeout(this.holdTimer);
        
        if (this.isHold) return;

        if (this.tapTimer) {
            // Second tap -> Double Tap
            clearTimeout(this.tapTimer);
            this.tapTimer = null;
            this.onDouble(id);
        } else {
            // First tap -> Start potential double tap timer
            this.tapTimer = setTimeout(() => {
                this.tapTimer = null;
                this.onTap(id);
            }, this.tapThreshold);
        }
    }

    /**
     * Cancels all timers.
     */
    cancel() {
        clearTimeout(this.tapTimer);
        clearTimeout(this.holdTimer);
        this.tapTimer = null;
    }
}
