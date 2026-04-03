// POV-Ray Web - Macro storage and expansion for preprocessor
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export class MacroTable {
    constructor() {
        this._macros = new Map();
    }

    define(name, params, bodyTokens) {
        // Pre-build param index map for O(1) lookup during expansion
        const paramMap = new Map();
        params.forEach((p, i) => paramMap.set(p, i));
        this._macros.set(name, { params, paramMap, bodyTokens });
    }

    isDefined(name) { return this._macros.has(name); }
    get(name) { return this._macros.get(name) || null; }
    undef(name) { this._macros.delete(name); }

    // Expand macro, substituting parameter identifiers with argument tokens
    expand(name, argTokens) {
        const macro = this._macros.get(name);
        if (!macro) return [];

        const expanded = [];
        for (const tok of macro.bodyTokens) {
            if (tok.type === 'IDENTIFIER') {
                const paramIdx = macro.paramMap.get(tok.value);
                if (paramIdx !== undefined && paramIdx < argTokens.length) {
                    const arg = argTokens[paramIdx];
                    if (Array.isArray(arg)) {
                        for (const at of arg) expanded.push(at);
                    } else {
                        expanded.push(arg);
                    }
                    continue;
                }
            }
            expanded.push(tok);
        }
        return expanded;
    }
}
