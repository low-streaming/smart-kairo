/**
 * Infinity Studio - History Manager
 * Tracks all state changes for Undo/Redo functionality.
 */
export class InfinityHistory {
    constructor(limit = 50) {
        this.stack = [];
        this.redoStack = [];
        this.limit = limit;
    }

    /**
     * Pushes a new state to the history stack.
     * @param {Object} state - The current application state.
     */
    push(state) {
        this.stack.push(JSON.stringify(state));
        if (this.stack.length > this.limit) {
            this.stack.shift();
        }
        // Clear redo stack on new action
        this.redoStack = [];
    }

    /**
     * Moves back in history.
     * @param {Object} currentState - The state before undoing.
     * @returns {Object|null} The previous state or null.
     */
    undo(currentState) {
        if (this.stack.length === 0) return null;
        this.redoStack.push(JSON.stringify(currentState));
        return JSON.parse(this.stack.pop());
    }

    /**
     * Moves forward in history.
     * @param {Object} currentState - The state before redoing.
     * @returns {Object|null} The next state or null.
     */
    redo(currentState) {
        if (this.redoStack.length === 0) return null;
        this.stack.push(JSON.stringify(currentState));
        return JSON.parse(this.redoStack.pop());
    }

    /**
     * Clears the entire history.
     */
    clear() {
        this.stack = [];
        this.redoStack = [];
    }
}
