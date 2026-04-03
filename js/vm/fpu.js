// POV-Ray Web - Function VM (stack-based interpreter)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Evaluates user-defined functions for isosurfaces and patterns

export class POVFPU {
    constructor() {
        this.stack = [];
        this.vars = {};
    }

    execute(fn, params) {
        if (typeof fn === 'function') {
            return fn(...params);
        }
        if (fn && fn.type === 'compiled') {
            return this._executeCompiled(fn, params);
        }
        return 0;
    }

    _executeCompiled(fn, params) {
        this.stack = [];
        // Bind parameters
        for (let i = 0; i < fn.params.length; i++) {
            this.vars[fn.params[i]] = params[i] || 0;
        }

        for (const op of fn.ops) {
            this._executeOp(op);
        }

        return this.stack.length > 0 ? this.stack.pop() : 0;
    }

    _executeOp(op) {
        const s = this.stack;
        switch (op.type) {
            case 'push': s.push(op.value); break;
            case 'load': s.push(this.vars[op.name] || 0); break;
            case 'add': { const b = s.pop(), a = s.pop(); s.push(a + b); break; }
            case 'sub': { const b = s.pop(), a = s.pop(); s.push(a - b); break; }
            case 'mul': { const b = s.pop(), a = s.pop(); s.push(a * b); break; }
            case 'div': { const b = s.pop(), a = s.pop(); s.push(b !== 0 ? a / b : 0); break; }
            case 'neg': s.push(-s.pop()); break;
            case 'pow': { const b = s.pop(), a = s.pop(); s.push(Math.pow(a, b)); break; }
            case 'sin': s.push(Math.sin(s.pop())); break;
            case 'cos': s.push(Math.cos(s.pop())); break;
            case 'tan': s.push(Math.tan(s.pop())); break;
            case 'asin': s.push(Math.asin(s.pop())); break;
            case 'acos': s.push(Math.acos(s.pop())); break;
            case 'atan': s.push(Math.atan(s.pop())); break;
            case 'sqrt': s.push(Math.sqrt(Math.abs(s.pop()))); break;
            case 'abs': s.push(Math.abs(s.pop())); break;
            case 'floor': s.push(Math.floor(s.pop())); break;
            case 'ceil': s.push(Math.ceil(s.pop())); break;
            case 'exp': s.push(Math.exp(s.pop())); break;
            case 'ln': s.push(Math.log(Math.abs(s.pop()))); break;
            case 'mod': { const b = s.pop(), a = s.pop(); s.push(a % b); break; }
            case 'min': { const b = s.pop(), a = s.pop(); s.push(Math.min(a, b)); break; }
            case 'max': { const b = s.pop(), a = s.pop(); s.push(Math.max(a, b)); break; }
            case 'atan2': { const b = s.pop(), a = s.pop(); s.push(Math.atan2(a, b)); break; }
        }
    }
}

// Simple expression compiler for POV-Ray function bodies
export function compileFunction(paramNames, exprTokens) {
    // For now, return a JS function via simple expression parsing
    // This handles common patterns like: x*x + y*y + z*z - 1
    try {
        const expr = tokensToExpr(exprTokens, paramNames);
        const fn = new Function(...paramNames, `return ${expr};`);
        return fn;
    } catch (e) {
        console.warn('Function compilation failed:', e);
        return (...args) => args[0]*args[0] + args[1]*args[1] + args[2]*args[2] - 1;
    }
}

function tokensToExpr(tokens, params) {
    // Convert token stream to JS expression string
    let expr = '';
    for (const tok of tokens) {
        if (tok.id !== undefined) {
            // It's a classified token
            const val = tok.value || tok.name || '';
            if (params.includes(val)) {
                expr += val;
            } else if (typeof tok.value === 'number') {
                expr += tok.value;
            } else {
                // Map POV-Ray functions to Math
                const mathMap = {
                    'sin': 'Math.sin', 'cos': 'Math.cos', 'tan': 'Math.tan',
                    'asin': 'Math.asin', 'acos': 'Math.acos', 'atan': 'Math.atan',
                    'sqrt': 'Math.sqrt', 'abs': 'Math.abs', 'pow': 'Math.pow',
                    'exp': 'Math.exp', 'ln': 'Math.log', 'log': 'Math.log10',
                    'floor': 'Math.floor', 'ceil': 'Math.ceil',
                    'min': 'Math.min', 'max': 'Math.max', 'mod': '%',
                    'pi': 'Math.PI'
                };
                expr += mathMap[val] || val;
            }
        }
    }
    return expr || '0';
}
