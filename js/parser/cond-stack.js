// POV-Ray Web - Conditional execution stack for preprocessor
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export const CondState = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DONE: 'done',
    WHILE_ACTIVE: 'while',
    FOR_ACTIVE: 'for',
    SWITCH_ACTIVE: 'switch',
    SWITCH_CASE_ACTIVE: 'case_active',
    SWITCH_CASE_INACTIVE: 'case_inactive',
    MACRO_DEF: 'macro_def',
};

const ACTIVE_STATES = new Set([
    CondState.ACTIVE, CondState.WHILE_ACTIVE, CondState.FOR_ACTIVE,
    CondState.SWITCH_ACTIVE, CondState.SWITCH_CASE_ACTIVE,
]);

export class CondStack {
    constructor() {
        this._stack = [];
        this._activeCache = true; // cached isActive result
    }

    push(state, meta = {}) {
        this._stack.push({ state, meta });
        this._updateCache();
    }

    pop() {
        const entry = this._stack.pop();
        this._updateCache();
        return entry;
    }

    top() {
        return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
    }

    isActive() {
        return this._activeCache;
    }

    setState(state) {
        if (this._stack.length > 0) {
            this._stack[this._stack.length - 1].state = state;
            this._updateCache();
        }
    }

    get depth() { return this._stack.length; }

    _updateCache() {
        this._activeCache = this._stack.every(e => ACTIVE_STATES.has(e.state));
    }
}
