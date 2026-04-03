// POV-Ray Web - Preprocessor expression evaluator
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
//
// Lightweight evaluator for #if conditions during Pass 1.
// Operates on raw tokens + ppSymbols map. Handles arithmetic,
// comparisons, logical ops, defined(), string functions, clock.

import { RAW_TOKEN } from './tokenizer.js';

export class PPEvaluator {
    constructor(ppSymbols, macroTable, clock) {
        this.ppSymbols = ppSymbols;
        this.macroTable = macroTable;
        this.clock = clock || 0;
        this._tokens = [];
        this._pos = 0;
    }

    // Evaluate a token array to a float
    evalFloat(tokens) {
        this._tokens = tokens;
        this._pos = 0;
        return this._parseOr();
    }

    // Evaluate a token array to a string
    evalString(tokens) {
        this._tokens = tokens;
        this._pos = 0;
        return this._parseStringPrimary();
    }

    _peek() {
        return this._pos < this._tokens.length ? this._tokens[this._pos] : null;
    }

    _next() {
        return this._pos < this._tokens.length ? this._tokens[this._pos++] : null;
    }

    _expect(value) {
        const tok = this._next();
        if (!tok || tok.value !== value) {
            console.warn(`PP evaluator: expected '${value}', got '${tok?.value}'`);
        }
        return tok;
    }

    // Operator precedence: || → && → comparison → add/sub → mul/div → unary → primary
    _parseOr() {
        let left = this._parseAnd();
        while (this._peek()?.value === '|') {
            this._next();
            left = (left || this._parseAnd()) ? 1 : 0;
        }
        return left;
    }

    _parseAnd() {
        let left = this._parseComparison();
        while (this._peek()?.value === '&') {
            this._next();
            left = (left && this._parseComparison()) ? 1 : 0;
        }
        return left;
    }

    _parseComparison() {
        let left = this._parseAdditive();
        const tok = this._peek();
        if (!tok) return left;
        if (tok.value === '=') { this._next(); return left === this._parseAdditive() ? 1 : 0; }
        if (tok.value === '!=') { this._next(); return left !== this._parseAdditive() ? 1 : 0; }
        if (tok.value === '<') { this._next(); return left < this._parseAdditive() ? 1 : 0; }
        if (tok.value === '>') { this._next(); return left > this._parseAdditive() ? 1 : 0; }
        if (tok.value === '<=') { this._next(); return left <= this._parseAdditive() ? 1 : 0; }
        if (tok.value === '>=') { this._next(); return left >= this._parseAdditive() ? 1 : 0; }
        return left;
    }

    _parseAdditive() {
        let left = this._parseMultiplicative();
        while (true) {
            const tok = this._peek();
            if (tok?.value === '+') { this._next(); left += this._parseMultiplicative(); }
            else if (tok?.value === '-') { this._next(); left -= this._parseMultiplicative(); }
            else break;
        }
        return left;
    }

    _parseMultiplicative() {
        let left = this._parseUnary();
        while (true) {
            const tok = this._peek();
            if (tok?.value === '*') { this._next(); left *= this._parseUnary(); }
            else if (tok?.value === '/') { this._next(); const d = this._parseUnary(); left = d ? left / d : 0; }
            else break;
        }
        return left;
    }

    _parseUnary() {
        const tok = this._peek();
        if (tok?.value === '-') { this._next(); return -this._parsePrimary(); }
        if (tok?.value === '+') { this._next(); return this._parsePrimary(); }
        if (tok?.value === '!') { this._next(); return this._parsePrimary() ? 0 : 1; }
        return this._parsePrimary();
    }

    _parsePrimary() {
        const tok = this._next();
        if (!tok) return 0;

        // Number literal
        if (tok.type === RAW_TOKEN.NUMBER) return tok.value;

        // Parenthesized expression
        if (tok.value === '(') {
            const val = this._parseOr();
            this._expect(')');
            return val;
        }

        // String literal (in numeric context → 0)
        if (tok.type === RAW_TOKEN.STRING) return 0;

        // Identifier
        if (tok.type === RAW_TOKEN.IDENTIFIER) {
            const name = tok.value;

            // Built-in constants — check ppSymbols first so #version updates take effect
            const sym = this.ppSymbols.get(name);
            if (sym !== undefined) {
                if (typeof sym === 'number') return sym;
                if (Array.isArray(sym)) return sym[0] || 0;
                if (typeof sym === 'object' && sym !== null) return 1; // deferred = exists
                return 0;
            }

            if (name === 'true' || name === 'yes' || name === 'on') return 1;
            if (name === 'false' || name === 'no' || name === 'off') return 0;
            if (name === 'pi') return Math.PI;
            if (name === 'tau') return Math.PI * 2;
            if (name === 'clock') return this.clock;
            if (name === 'image_width') return 640;
            if (name === 'image_height') return 480;
            if (name === 'frame_number') return 1;
            if (name === 'final_frame') return 1;
            if (name === 'initial_frame') return 1;
            if (name === 'final_clock') return 1;
            if (name === 'initial_clock') return 0;
            if (name === 'clock_delta') return 0;

            // Built-in functions
            if (name === 'defined') {
                this._expect('(');
                const id = this._next();
                const idName = id?.value || '';
                this._expect(')');
                return (this.ppSymbols.has(idName) || this.macroTable.isDefined(idName)) ? 1 : 0;
            }

            // Single-arg math functions
            const MATH_1 = { abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
                asin: Math.asin, acos: Math.acos, atan: Math.atan, sqrt: Math.sqrt,
                exp: Math.exp, ln: Math.log, log: Math.log10,
                floor: Math.floor, ceil: Math.ceil, int: Math.trunc,
                degrees: v => v * 180 / Math.PI, radians: v => v * Math.PI / 180,
                sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh };
            if (MATH_1[name]) {
                this._expect('('); const v = this._parseOr(); this._expect(')');
                return MATH_1[name](v);
            }
            if (name === 'mod') {
                this._expect('(');
                const a = this._parseOr(); this._expect(',');
                const b = this._parseOr(); this._expect(')');
                return b ? a % b : 0;
            }
            if (name === 'pow') {
                this._expect('(');
                const a = this._parseOr(); this._expect(',');
                const b = this._parseOr(); this._expect(')');
                return Math.pow(a, b);
            }
            if (name === 'min') {
                this._expect('(');
                let v = this._parseOr();
                while (this._peek()?.value === ',') { this._next(); v = Math.min(v, this._parseOr()); }
                this._expect(')');
                return v;
            }
            if (name === 'max') {
                this._expect('(');
                let v = this._parseOr();
                while (this._peek()?.value === ',') { this._next(); v = Math.max(v, this._parseOr()); }
                this._expect(')');
                return v;
            }
            if (name === 'strcmp') {
                this._expect('(');
                const a = this._parseStringPrimary(); this._expect(',');
                const b = this._parseStringPrimary(); this._expect(')');
                return a < b ? -1 : a > b ? 1 : 0;
            }
            if (name === 'strlen') {
                this._expect('(');
                const s = this._parseStringPrimary();
                this._expect(')');
                return s.length;
            }
            if (name === 'val') {
                this._expect('(');
                const s = this._parseStringPrimary();
                this._expect(')');
                return Number.parseFloat(s) || 0;
            }

            // Unknown identifier — treat as 0
            return 0;
        }

        return 0;
    }

    _parseStringPrimary() {
        const tok = this._next();
        if (!tok) return '';
        if (tok.type === RAW_TOKEN.STRING) return tok.value;
        if (tok.type === RAW_TOKEN.IDENTIFIER) {
            if (tok.value === 'concat') {
                this._expect('(');
                let result = this._parseStringPrimary();
                while (this._peek()?.value === ',') {
                    this._next();
                    result += this._parseStringPrimary();
                }
                this._expect(')');
                return result;
            }
            if (tok.value === 'str') {
                this._expect('(');
                const val = this._parseOr(); this._expect(',');
                const width = this._parseOr(); this._expect(',');
                const prec = this._parseOr(); this._expect(')');
                return val.toFixed(Math.max(0, prec));
            }
            // PP string symbol
            const sym = this.ppSymbols.get(tok.value);
            if (typeof sym === 'string') return sym;
        }
        return '';
    }
}
