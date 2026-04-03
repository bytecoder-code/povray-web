// POV-Ray Web - Scoped symbol table for #declare, #local, #macro
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export const SYMBOL_TYPE = {
    FLOAT: 'float',
    VECTOR: 'vector',
    COLOUR: 'colour',
    STRING: 'string',
    OBJECT: 'object',
    TEXTURE: 'texture',
    PIGMENT: 'pigment',
    NORMAL: 'normal',
    FINISH: 'finish',
    INTERIOR: 'interior',
    MEDIA: 'media',
    CAMERA: 'camera',
    LIGHT: 'light',
    MATERIAL: 'material',
    TRANSFORM: 'transform',
    ARRAY: 'array',
    DICTIONARY: 'dictionary',
    MACRO: 'macro',
    FUNCTION: 'function',
    SPLINE: 'spline',
    FOG: 'fog',
    RAINBOW: 'rainbow',
    SKYSPHERE: 'skysphere',
    COLOUR_MAP: 'colour_map',
    PIGMENT_MAP: 'pigment_map',
    NORMAL_MAP: 'normal_map',
    TEXTURE_MAP: 'texture_map',
    DENSITY_MAP: 'density_map',
    SLOPE_MAP: 'slope_map'
};

export class SymbolTable {
    constructor() {
        this._scopes = [new Map()]; // Start with global scope
    }

    pushScope() {
        this._scopes.push(new Map());
    }

    popScope() {
        if (this._scopes.length <= 1) {
            throw new Error('Cannot pop global scope');
        }
        this._scopes.pop();
    }

    declare(name, type, value, isLocal = false) {
        const scope = isLocal ? this._scopes[this._scopes.length - 1] : this._scopes[0];
        scope.set(name, { type, value });
    }

    lookup(name) {
        // Search from innermost to outermost scope
        for (let i = this._scopes.length - 1; i >= 0; i--) {
            const entry = this._scopes[i].get(name);
            if (entry) return entry;
        }
        return null;
    }

    isDefined(name) {
        return this.lookup(name) !== null;
    }

    undef(name) {
        for (let i = this._scopes.length - 1; i >= 0; i--) {
            if (this._scopes[i].has(name)) {
                this._scopes[i].delete(name);
                return true;
            }
        }
        return false;
    }

    get scopeDepth() {
        return this._scopes.length;
    }
}
