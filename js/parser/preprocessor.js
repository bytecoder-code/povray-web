// POV-Ray Web - Two-pass preprocessor (Pass 1)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
//
// Handles all # directives: #include, #if/#ifdef/#ifndef, #while/#for,
// #macro, #declare (simple values), #version, #switch/#case.
// Emits a flat token stream with SOURCE_MARKER tokens for Pass 2.

import { Tokenizer, RAW_TOKEN } from './tokenizer.js';
import { CondStack, CondState } from './cond-stack.js';
import { MacroTable } from './macro-table.js';
import { PPEvaluator } from './pp-evaluator.js';
import { initDefaults } from './version-defaults.js';

// Scene keywords that signal a complex #declare (emit verbatim for Pass 2)
const SCENE_KEYWORDS = new Set([
    'sphere', 'box', 'plane', 'cylinder', 'cone', 'torus', 'disc',
    'triangle', 'smooth_triangle', 'mesh', 'mesh2', 'blob', 'lathe',
    'prism', 'sor', 'superellipsoid', 'quadric', 'heightfield',
    'isosurface', 'parametric', 'julia_fractal', 'sphere_sweep',
    'bicubic_patch', 'text', 'ovus', 'lemon', 'polygon', 'poly',
    'cubic', 'quartic',
    'union', 'intersection', 'difference', 'merge', 'object',
    'texture', 'pigment', 'normal', 'finish', 'interior', 'media',
    'material', 'camera', 'light_source', 'light_group',
    'array', 'dictionary', 'spline', 'transform',
    'colour_map', 'color_map', 'pigment_map', 'normal_map',
    'texture_map', 'density_map', 'slope_map',
    'fog', 'rainbow', 'sky_sphere',
]);

// Color keywords that signal a simple colour #declare
const COLOR_KEYWORDS = new Set(['rgb', 'rgbf', 'rgbt', 'rgbft', 'srgb', 'srgbf', 'srgbt', 'srgbft', 'color', 'colour']);

export class Preprocessor {
    constructor(options = {}) {
        this.condStack = new CondStack();
        this.macroTable = new MacroTable();
        this.ppSymbols = new Map();
        this.evaluator = new PPEvaluator(this.ppSymbols, this.macroTable, options.clock || 0);
        this.output = [];
        this.version = 3.8;
        this.includeCache = options.includeCache || new Map();
        this.bundledIncludes = options.bundledIncludes || {};
        this.sceneData = options.sceneData || null;
        this.warnings = [];
        this._warnCounts = new Map();
        this._warnDedupLimit = 10;
        this._tokenizer = null;
        this._includeDepth = 0;
        this._maxIncludeDepth = 32;
    }

    process(sourceText, fileName = '<scene>') {
        this._tokenizer = new Tokenizer(sourceText, fileName);
        this._processTokens();
        return this.output;
    }

    _processTokens() {
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) {
                // If we have source stack entries, the tokenizer auto-pops
                // and continues. A true EOF means all sources are exhausted.
                break;
            }

            if (tok.type === RAW_TOKEN.HASH_DIRECTIVE) {
                this._handleDirective(tok);
                continue;
            }

            // Check if identifier is a macro invocation
            if (tok.type === RAW_TOKEN.IDENTIFIER && this.macroTable.isDefined(tok.value)) {
                if (this.condStack.isActive()) {
                    this._expandMacro(tok.value);
                }
                continue;
            }

            // Check if identifier is a pp symbol (substitute value)
            if (tok.type === RAW_TOKEN.IDENTIFIER && this.ppSymbols.has(tok.value)) {
                if (this.condStack.isActive()) {
                    const val = this.ppSymbols.get(tok.value);
                    if (typeof val === 'number') {
                        this._emit({ type: RAW_TOKEN.NUMBER, value: val, line: tok.line, col: tok.col, fileName: tok.fileName });
                    } else if (typeof val === 'string') {
                        this._emit({ type: RAW_TOKEN.STRING, value: val, line: tok.line, col: tok.col, fileName: tok.fileName });
                    } else if (val && val.type === 'deferred') {
                        // Deferred declaration — emit the identifier as-is for Pass 2
                        this._emit(tok);
                    } else if (Array.isArray(val)) {
                        // Vector/color — emit as < components >
                        this._emit({ type: RAW_TOKEN.PUNCT, value: '<', line: tok.line, col: tok.col, fileName: tok.fileName });
                        for (let i = 0; i < val.length; i++) {
                            if (i > 0) this._emit({ type: RAW_TOKEN.PUNCT, value: ',', line: tok.line, col: tok.col, fileName: tok.fileName });
                            this._emit({ type: RAW_TOKEN.NUMBER, value: val[i], line: tok.line, col: tok.col, fileName: tok.fileName });
                        }
                        this._emit({ type: RAW_TOKEN.PUNCT, value: '>', line: tok.line, col: tok.col, fileName: tok.fileName });
                    } else {
                        this._emit(tok);
                    }
                }
                continue;
            }

            // Regular token — emit if active
            if (this.condStack.isActive()) {
                this._emit(tok);
            }
        }
    }

    _emit(tok) {
        this.output.push(tok);
    }

    _emitSourceMarker(fileName, line) {
        this.output.push({ type: 'SOURCE_MARKER', fileName, line });
    }

    _warn(msg) {
        this.warnings.push(msg);
        const count = (this._warnCounts.get(msg) || 0) + 1;
        this._warnCounts.set(msg, count);
        if (count <= this._warnDedupLimit) {
            console.warn(`Preprocessor: ${msg}`);
        } else if (count === this._warnDedupLimit + 1) {
            console.warn(`Preprocessor: ... suppressing further "${msg.slice(0, 80)}" warnings`);
        }
    }

    // --- Directive Dispatch ---

    _handleDirective(tok) {
        const dir = tok.value;

        // When skipping (inactive conditional), only handle nesting-relevant directives
        if (!this.condStack.isActive()) {
            if (dir === 'if' || dir === 'ifdef' || dir === 'ifndef' ||
                dir === 'while' || dir === 'for' || dir === 'switch' || dir === 'macro') {
                this.condStack.push(CondState.INACTIVE);
            } else if (dir === 'end') {
                this.condStack.pop();
            } else if (dir === 'else') {
                const top = this.condStack.top();
                if (top && top.state === CondState.INACTIVE) {
                    top.state = CondState.ACTIVE;
                } else if (top && top.state === CondState.DONE) {
                    // Already matched, skip
                }
            } else if (dir === 'elseif') {
                const top = this.condStack.top();
                if (top && top.state === CondState.INACTIVE) {
                    // Evaluate condition
                    const condTokens = this._collectUntilParen();
                    const val = this.evaluator.evalFloat(condTokens);
                    if (val) top.state = CondState.ACTIVE;
                }
            }
            return;
        }

        // Active context — full directive handling
        switch (dir) {
            case 'include': this._handleInclude(); break;
            case 'declare': this._handleDeclare(false, tok); break;
            case 'local': this._handleDeclare(true, tok); break;
            case 'if': this._handleIf(); break;
            case 'ifdef': this._handleIfdef(false); break;
            case 'ifndef': this._handleIfdef(true); break;
            case 'else': this._handleElse(); break;
            case 'elseif': this._handleElseif(); break;
            case 'end': this._handleEnd(); break;
            case 'while': this._handleWhile(); break;
            case 'for': this._handleFor(); break;
            case 'macro': this._handleMacroDef(); break;
            case 'switch': this._handleSwitch(); break;
            case 'version': this._handleVersion(); break;
            case 'undef': this._handleUndef(); break;
            case 'warning': this._handleMessage('warning'); break;
            case 'error': this._handleMessage('error'); break;
            case 'debug': this._handleMessage('debug'); break;
            case 'default':
                // Skip default block — emit verbatim for Pass 2
                this._emit({ type: RAW_TOKEN.HASH_DIRECTIVE, value: 'default', line: 0, col: 0, fileName: '' });
                break;
            default:
                // Unknown directive — emit verbatim
                this._emit({ type: RAW_TOKEN.HASH_DIRECTIVE, value: dir, line: 0, col: 0, fileName: '' });
                break;
        }
    }

    // --- Include ---

    _handleInclude() {
        const filenameTok = this._tokenizer.next();
        const filename = filenameTok.value;

        if (this._includeDepth >= this._maxIncludeDepth) {
            this._warn(`Include depth exceeded for "${filename}"`);
            return;
        }

        // Resolve include content
        let content = null;
        if (this.includeCache.has(filename)) {
            content = this.includeCache.get(filename);
        } else if (this.bundledIncludes[filename]) {
            content = this.bundledIncludes[filename];
        } else if (this.bundledIncludes[filename.toLowerCase()]) {
            content = this.bundledIncludes[filename.toLowerCase()];
        }

        if (!content) {
            this._warn(`Could not resolve #include "${filename}"`);
            return;
        }

        this._emitSourceMarker(filename, 1);
        this._includeDepth++;
        this._tokenizer.pushSource(content, filename);
        // Processing continues naturally — tokenizer reads from new source
    }

    // --- Conditionals ---

    _handleIf() {
        const condTokens = this._collectUntilParen();
        const val = this.evaluator.evalFloat(condTokens);
        this.condStack.push(val ? CondState.ACTIVE : CondState.INACTIVE);
    }

    _handleIfdef(negate) {
        // #ifdef(Name) or #ifndef(Name) — may include array index: #ifdef(Name[I])
        this._expectRaw('(');
        const nameTok = this._tokenizer.next();
        const name = nameTok.value;
        // Consume any remaining tokens until ) (handles array index syntax)
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF || tok.value === ')') break;
        }

        let defined = this.ppSymbols.has(name) || this.macroTable.isDefined(name);
        if (negate) defined = !defined;
        this.condStack.push(defined ? CondState.ACTIVE : CondState.INACTIVE);
    }

    _handleElse() {
        const top = this.condStack.top();
        if (!top) return;
        if (top.state === CondState.ACTIVE) {
            top.state = CondState.DONE; // already matched, skip rest
        } else if (top.state === CondState.INACTIVE) {
            top.state = CondState.ACTIVE; // first time matching
        }
    }

    _handleElseif() {
        const top = this.condStack.top();
        if (!top) return;
        const condTokens = this._collectUntilParen();
        if (top.state === CondState.ACTIVE || top.state === CondState.DONE) {
            top.state = CondState.DONE;
        } else if (top.state === CondState.INACTIVE) {
            const val = this.evaluator.evalFloat(condTokens);
            top.state = val ? CondState.ACTIVE : CondState.INACTIVE;
        }
    }

    _handleEnd() {
        this.condStack.pop();
    }

    // --- Loops ---

    _handleWhile() {
        const condTokens = this._collectUntilParen();
        const bodyTokens = this._captureBody();

        let iterations = 0;
        const MAX = 100000;
        while (iterations < MAX) {
            const val = this.evaluator.evalFloat(condTokens);
            if (!val) break;
            this._injectTokens(bodyTokens);
            iterations++;
        }
        if (iterations >= MAX) this._warn(`#while exceeded ${MAX} iterations`);
    }

    _handleFor() {
        this._expectRaw('(');
        const nameTok = this._tokenizer.next();
        const name = nameTok.value;
        this._expectRaw(',');
        const startTokens = this._collectUntilCommaOrParen();
        const start = this.evaluator.evalFloat(startTokens);
        const endTokens = this._collectUntilCommaOrParen();
        const end = this.evaluator.evalFloat(endTokens);
        let step = 1;
        // Check if there's a step parameter (next char is comma, not paren)
        // Already consumed by collectUntilCommaOrParen

        const bodyTokens = this._captureBody();

        const dir = step > 0 ? 1 : -1;
        for (let val = start; dir > 0 ? val <= end : val >= end; val += step) {
            this.ppSymbols.set(name, val);
            this._injectTokens(bodyTokens);
        }
    }

    // --- Macros ---

    _handleMacroDef() {
        const nameTok = this._tokenizer.next();
        const name = nameTok.value;
        this._expectRaw('(');

        const params = [];
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.value === ')') break;
            if (tok.type === RAW_TOKEN.IDENTIFIER) params.push(tok.value);
            // Skip commas
        }

        const bodyTokens = this._captureBody();
        this.macroTable.define(name, params, bodyTokens);
    }

    _expandMacro(name) {
        const macro = this.macroTable.get(name);
        if (!macro) return;

        this._macroDepth = (this._macroDepth || 0) + 1;
        if (this._macroDepth > 64) {
            this._warn(`Macro recursion depth exceeded for "${name}"`);
            this._macroDepth--;
            return;
        }

        // Parse arguments
        const nextTok = this._tokenizer.next();
        if (nextTok.value !== '(') {
            this._tokenizer.unget(nextTok);
            // If macro has parameters but no '(' follows, this is not an invocation
            if (macro.params.length > 0) {
                this._emit({ type: RAW_TOKEN.IDENTIFIER, value: name, line: 0, col: 0, fileName: '' });
                this._macroDepth--;
                return;
            }
            // Zero-param macro — expand
            const expanded = this.macroTable.expand(name, []);
            this._injectTokens(expanded);
            this._macroDepth--;
            return;
        }

        const argTokens = [];
        let depth = 0;
        let currentArg = [];
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) break;
            if (tok.value === '(' ) { depth++; currentArg.push(tok); }
            else if (tok.value === ')' && depth > 0) { depth--; currentArg.push(tok); }
            else if (tok.value === ')' && depth === 0) { argTokens.push(currentArg); break; }
            else if (tok.value === ',' && depth === 0) { argTokens.push(currentArg); currentArg = []; }
            else { currentArg.push(tok); }
        }

        const expanded = this.macroTable.expand(name, argTokens);
        this._injectTokens(expanded);
        this._macroDepth--;
    }

    // --- Declare ---

    _handleDeclare(isLocal, directiveTok) {
        let nameTok = this._tokenizer.next();

        // Handle #declare deprecated [once] "message" Name = ...
        if (nameTok.value === 'deprecated') {
            const next = this._tokenizer.next();
            if (next.value === 'once') {
                const msg = this._tokenizer.next(); // skip message string
                nameTok = this._tokenizer.next(); // actual name
            } else if (next.type === RAW_TOKEN.STRING) {
                nameTok = this._tokenizer.next(); // actual name after message
            } else {
                nameTok = next; // no message, this is the name
            }
        }

        const name = nameTok.value;

        // Expect =
        const eqTok = this._tokenizer.next();
        if (eqTok.value !== '=') {
            this._tokenizer.unget(eqTok);
        }

        // Peek at what follows to decide: simple value (evaluate in PP) or complex (emit verbatim)
        const peekTok = this._tokenizer.next();

        // Function declaration — skip body, mark as deferred
        if (peekTok.value === 'function') {
            this._skipFunctionBody();
            this.ppSymbols.set(name, { type: 'deferred' });
            this._consumeOptionalSemicolon();
            return;
        }

        // Scene keyword — emit verbatim for Pass 2
        if (SCENE_KEYWORDS.has(peekTok.value)) {
            this._tokenizer.unget(peekTok);
            this._emitDeclareVerbatim(directiveTok, nameTok, isLocal);
            this.ppSymbols.set(name, { type: 'deferred' });
            return;
        }

        // Color keyword — simple colour, evaluate in PP
        if (COLOR_KEYWORDS.has(peekTok.value)) {
            this._tokenizer.unget(peekTok);
            const colorTokens = this._collectUntilSemicolon();
            // For now, store as deferred — full color eval is complex
            this.ppSymbols.set(name, { type: 'deferred' });
            // Also emit verbatim for Pass 2
            this._emitDeclareVerbatimFromTokens(directiveTok, nameTok, isLocal, colorTokens);
            return;
        }

        // Expression starting with unary -, +, or (
        if (peekTok.type === RAW_TOKEN.PUNCT && (peekTok.value === '-' || peekTok.value === '+' || peekTok.value === '(')) {
            this._tokenizer.unget(peekTok);
            const allTokens = this._collectUntilSemicolon();
            const hasVectorSyntax = allTokens.some(t => t.value === '<' || t.value === '{');
            if (!hasVectorSyntax) {
                try {
                    const val = this.evaluator.evalFloat(allTokens);
                    this.ppSymbols.set(name, val);
                    return;
                } catch { /* fall through */ }
            }
            this.ppSymbols.set(name, { type: 'deferred' });
            this._emitDeclareVerbatimFromTokens(directiveTok, nameTok, isLocal, allTokens);
            return;
        }

        // Number literal or numeric expression
        if (peekTok.type === RAW_TOKEN.NUMBER) {
            const rest = this._collectUntilSemicolon();
            if (rest.length === 0) {
                this.ppSymbols.set(name, peekTok.value);
                return;
            }
            const allTokens = [peekTok, ...rest];
            // Try to evaluate if all identifiers are resolvable ppSymbols (not deferred)
            const hasVectorSyntax = allTokens.some(t => t.value === '<' || t.value === '{');
            const hasUnresolvable = allTokens.some(t =>
                t.type === RAW_TOKEN.IDENTIFIER &&
                !this._isResolvableIdentifier(t.value));
            if (!hasVectorSyntax && !hasUnresolvable) {
                try {
                    this.ppSymbols.set(name, this.evaluator.evalFloat(allTokens));
                    return;
                } catch { /* fall through to verbatim */ }
            }
            // Complex numeric expression — emit verbatim
            this.ppSymbols.set(name, { type: 'deferred' });
            this._emitDeclareVerbatimFromTokens(directiveTok, nameTok, isLocal, allTokens);
            return;
        }

        // String literal
        if (peekTok.type === RAW_TOKEN.STRING) {
            this.ppSymbols.set(name, peekTok.value);
            this._consumeOptionalSemicolon();
            return;
        }

        // Identifier that might be a simple constant or known pp value
        if (peekTok.type === RAW_TOKEN.IDENTIFIER) {
            const rest = this._collectUntilSemicolon();
            const allTokens = [peekTok, ...rest];
            const hasVectorSyntax = allTokens.some(t => t.value === '<' || t.value === '{');
            const hasUnresolvable = allTokens.some(t =>
                t.type === RAW_TOKEN.IDENTIFIER &&
                !this._isResolvableIdentifier(t.value));
            if (!hasVectorSyntax && !hasUnresolvable) {
                try {
                    const val = this.evaluator.evalFloat(allTokens);
                    this.ppSymbols.set(name, val);
                    return;
                } catch { /* fall through */ }
            }
            // Complex identifier expression — emit verbatim
            this.ppSymbols.set(name, { type: 'deferred' });
            this._emitDeclareVerbatimFromTokens(directiveTok, nameTok, isLocal, allTokens);
            return;
        }

        // Everything else — emit verbatim for Pass 2's full expression evaluator
        this._tokenizer.unget(peekTok);
        this._emitDeclareVerbatim(directiveTok, nameTok, isLocal);
        this.ppSymbols.set(name, { type: 'deferred' });
    }

    // Check if an identifier can be resolved to a numeric value by the PP evaluator
    _isResolvableIdentifier(name) {
        const sym = this.ppSymbols.get(name);
        if (typeof sym === 'number') return true;
        // Built-in constants the evaluator knows
        if (['true','false','yes','no','on','off','pi','tau','clock',
             'image_width','image_height','frame_number','final_frame',
             'initial_frame','final_clock','initial_clock','clock_delta'
        ].includes(name)) return true;
        // Math functions the evaluator handles
        if (['sin','cos','tan','asin','acos','atan','atan2','sqrt','abs',
             'ceil','floor','int','mod','pow','exp','log','min','max',
             'defined','strcmp','strlen','val','concat','str','rand','seed'
        ].includes(name)) return true;
        return false;
    }

    _emitDeclareVerbatim(directiveTok, nameTok, isLocal) {
        this._emit({ type: RAW_TOKEN.HASH_DIRECTIVE, value: isLocal ? 'local' : 'declare',
                      line: directiveTok.line, col: directiveTok.col, fileName: directiveTok.fileName });
        this._emit(nameTok);
        this._emit({ type: RAW_TOKEN.PUNCT, value: '=', line: nameTok.line, col: nameTok.col, fileName: nameTok.fileName });
        // Emit remaining tokens until semicolon or next statement
        this._emitUntilStatementEnd();
    }

    _emitDeclareVerbatimFromTokens(directiveTok, nameTok, isLocal, tokens) {
        this._emit({ type: RAW_TOKEN.HASH_DIRECTIVE, value: isLocal ? 'local' : 'declare',
                      line: directiveTok.line, col: directiveTok.col, fileName: directiveTok.fileName });
        this._emit(nameTok);
        this._emit({ type: RAW_TOKEN.PUNCT, value: '=', line: nameTok.line, col: nameTok.col, fileName: nameTok.fileName });
        for (const t of tokens) {
            if (t.type === RAW_TOKEN.IDENTIFIER && this.ppSymbols.has(t.value)) {
                const val = this.ppSymbols.get(t.value);
                if (typeof val === 'number') {
                    this._emit({ ...t, type: RAW_TOKEN.NUMBER, value: val });
                    continue;
                }
            }
            this._emit(t);
        }
    }

    _emitUntilStatementEnd() {
        let depth = 0;
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) break;

            // Handle preprocessor directives embedded in deferred bodies
            if (tok.type === RAW_TOKEN.HASH_DIRECTIVE) {
                const dir = tok.value;
                if (dir === 'if') {
                    const condTokens = this._collectUntilParen();
                    const val = this.evaluator.evalFloat(condTokens);
                    this._emitConditionalBlock(depth, val);
                    continue;
                } else if (dir === 'ifdef' || dir === 'ifndef') {
                    const condTokens = this._collectUntilParen();
                    const name = condTokens[0]?.value || '';
                    const defined = this.ppSymbols.has(name) || this.macroTable.isDefined(name);
                    this._emitConditionalBlock(depth, dir === 'ifndef' ? !defined : defined);
                    continue;
                } else if (dir === 'declare' || dir === 'local') {
                    // Nested #declare/#local inside a deferred body — emit verbatim
                    this._emit(tok);
                    // Continue so the rest of the body is emitted normally
                    continue;
                }
                // Other directives (#undef, #version, etc.) — emit verbatim
                this._emit(tok);
                continue;
            }

            // Substitute known ppSymbols in verbatim emission
            if (tok.type === RAW_TOKEN.IDENTIFIER && this.ppSymbols.has(tok.value)) {
                const val = this.ppSymbols.get(tok.value);
                if (typeof val === 'number') {
                    this._emit({ ...tok, type: RAW_TOKEN.NUMBER, value: val });
                } else {
                    this._emit(tok);
                }
            } else {
                this._emit(tok);
            }
            if (tok.value === '{') depth++;
            if (tok.value === '}') { depth--; if (depth <= 0) break; }
            if (tok.value === ';' && depth === 0) break;
        }
    }

    // Process a conditional block (#if/#ifdef/#ifndef) inside a deferred body,
    // emitting only the active branch's tokens directly to output.
    _emitConditionalBlock(outerBraceDepth, conditionTrue) {
        let active = conditionTrue;
        let done = conditionTrue;  // if first branch matched, subsequent ones are done
        let ifDepth = 0;

        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) break;

            if (tok.type === RAW_TOKEN.HASH_DIRECTIVE) {
                const dir = tok.value;
                // Nested #if inside this conditional block
                if (dir === 'if' || dir === 'ifdef' || dir === 'ifndef' ||
                    dir === 'while' || dir === 'for' || dir === 'switch' || dir === 'macro') {
                    if (active) {
                        // Process nested #if recursively if active
                        if (dir === 'if') {
                            const condTokens = this._collectUntilParen();
                            const val = this.evaluator.evalFloat(condTokens);
                            this._emitConditionalBlock(outerBraceDepth, val);
                        } else if (dir === 'ifdef' || dir === 'ifndef') {
                            const cTokens = this._collectUntilParen();
                            const nm = cTokens[0]?.value || '';
                            const def = this.ppSymbols.has(nm) || this.macroTable.isDefined(nm);
                            this._emitConditionalBlock(outerBraceDepth, dir === 'ifndef' ? !def : def);
                        } else {
                            // Other nesting directives in active branch — skip body
                            ifDepth++;
                            this._emit(tok);
                        }
                    } else {
                        ifDepth++;
                    }
                    continue;
                }

                if (dir === 'end') {
                    if (ifDepth > 0) {
                        ifDepth--;
                        if (active) this._emit(tok);
                        continue;
                    }
                    // This #end closes our conditional block
                    return;
                }

                if (dir === 'else' && ifDepth === 0) {
                    if (active) {
                        active = false;
                        done = true;
                    } else if (!done) {
                        active = true;
                    }
                    continue;
                }

                if (dir === 'elseif' && ifDepth === 0) {
                    if (active) {
                        active = false;
                        done = true;
                    }
                    const condTokens = this._collectUntilParen();
                    if (!done) {
                        const val = this.evaluator.evalFloat(condTokens);
                        if (val) {
                            active = true;
                            done = true;
                        }
                    }
                    continue;
                }

                // Other directives in active branch
                if (active) this._emit(tok);
                continue;
            }

            // Regular tokens — emit if active, with ppSymbol substitution
            if (active) {
                if (tok.type === RAW_TOKEN.IDENTIFIER && this.ppSymbols.has(tok.value)) {
                    const val = this.ppSymbols.get(tok.value);
                    if (typeof val === 'number') {
                        this._emit({ ...tok, type: RAW_TOKEN.NUMBER, value: val });
                    } else {
                        this._emit(tok);
                    }
                } else {
                    this._emit(tok);
                }
            }
        }
    }

    // --- Version ---

    _handleVersion() {
        const tok = this._tokenizer.next();
        this.version = tok.type === RAW_TOKEN.NUMBER ? tok.value : 3.8;
        this._consumeOptionalSemicolon();

        if (this.sceneData) {
            this.sceneData.languageVersion = this.version;
            initDefaults(this.version, this.sceneData);
        }

        this.ppSymbols.set('version', this.version);
    }

    // --- Switch ---

    _handleSwitch() {
        const condTokens = this._collectUntilParen();
        const switchVal = this.evaluator.evalFloat(condTokens);
        // Capture all tokens until #end, emit matching case body
        const bodyTokens = this._captureBody();
        // Scan body tokens for #case/#range/#else/#break, emit matching case body
        let matched = false;
        let i = 0;
        while (i < bodyTokens.length) {
            const tok = bodyTokens[i];

            if (tok.type === RAW_TOKEN.HASH_DIRECTIVE && tok.value === 'case') {
                i++;
                // Read case value — may be (expr) or plain number
                let caseVal = 0;
                if (bodyTokens[i]?.value === '(') {
                    i++; // skip (
                    const caseTokens = [];
                    let d = 0;
                    while (i < bodyTokens.length) {
                        if (bodyTokens[i].value === '(' ) { d++; caseTokens.push(bodyTokens[i]); }
                        else if (bodyTokens[i].value === ')' && d > 0) { d--; caseTokens.push(bodyTokens[i]); }
                        else if (bodyTokens[i].value === ')' && d === 0) { i++; break; }
                        else caseTokens.push(bodyTokens[i]);
                        i++;
                    }
                    caseVal = this.evaluator.evalFloat(caseTokens);
                } else if (bodyTokens[i]?.type === RAW_TOKEN.NUMBER) {
                    caseVal = bodyTokens[i].value; i++;
                } else { i++; }

                if (!matched && caseVal === switchVal) {
                    matched = true;
                    // Emit tokens until #break or next #case/#range/#else
                    while (i < bodyTokens.length) {
                        const bt = bodyTokens[i];
                        if (bt.type === RAW_TOKEN.HASH_DIRECTIVE &&
                            (bt.value === 'break' || bt.value === 'case' || bt.value === 'range' || bt.value === 'else')) break;
                        this._injectTokens([bt]);
                        i++;
                    }
                }
            } else if (tok.type === RAW_TOKEN.HASH_DIRECTIVE && tok.value === 'range') {
                i++;
                // Read range: (lo, hi)
                let lo = 0, hi = 0;
                if (bodyTokens[i]?.value === '(') {
                    i++; // skip (
                    const loTokens = [];
                    while (i < bodyTokens.length && bodyTokens[i].value !== ',') { loTokens.push(bodyTokens[i]); i++; }
                    if (bodyTokens[i]?.value === ',') i++;
                    const hiTokens = [];
                    let d = 0;
                    while (i < bodyTokens.length) {
                        if (bodyTokens[i].value === '(' ) d++;
                        if (bodyTokens[i].value === ')' && d === 0) { i++; break; }
                        if (bodyTokens[i].value === ')') d--;
                        hiTokens.push(bodyTokens[i]); i++;
                    }
                    lo = this.evaluator.evalFloat(loTokens);
                    hi = this.evaluator.evalFloat(hiTokens);
                } else {
                    lo = bodyTokens[i]?.type === RAW_TOKEN.NUMBER ? bodyTokens[i].value : 0; i++;
                    if (bodyTokens[i]?.value === ',') i++;
                    hi = bodyTokens[i]?.type === RAW_TOKEN.NUMBER ? bodyTokens[i].value : 0; i++;
                }

                if (!matched && switchVal >= lo && switchVal <= hi) {
                    matched = true;
                    while (i < bodyTokens.length) {
                        const bt = bodyTokens[i];
                        if (bt.type === RAW_TOKEN.HASH_DIRECTIVE &&
                            (bt.value === 'break' || bt.value === 'case' || bt.value === 'range' || bt.value === 'else')) break;
                        this._injectTokens([bt]);
                        i++;
                    }
                }
            } else if (tok.type === RAW_TOKEN.HASH_DIRECTIVE && tok.value === 'else') {
                i++;
                if (!matched) {
                    matched = true;
                    while (i < bodyTokens.length) {
                        const bt = bodyTokens[i];
                        if (bt.type === RAW_TOKEN.HASH_DIRECTIVE && bt.value === 'break') break;
                        this._injectTokens([bt]);
                        i++;
                    }
                }
            } else if (tok.type === RAW_TOKEN.HASH_DIRECTIVE && tok.value === 'break') {
                i++;
                if (matched) break; // done
            } else {
                i++;
            }
        }
    }

    // --- Undef / Messages ---

    _handleUndef() {
        const tok = this._tokenizer.next();
        this.ppSymbols.delete(tok.value);
        this.macroTable.undef(tok.value);
    }

    _handleMessage(level) {
        const tok = this._tokenizer.next();
        const msg = tok.type === RAW_TOKEN.STRING ? tok.value : String(tok.value);
        if (level === 'error') throw new Error(`#error: ${msg}`);
        if (level === 'warning') this._warn(msg);
        // debug: silent
    }

    // --- Helpers ---

    _expectRaw(value) {
        const tok = this._tokenizer.next();
        if (tok.value !== value) {
            this._warn(`Expected '${value}', got '${tok.value}'`);
        }
    }

    _consumeOptionalSemicolon() {
        const tok = this._tokenizer.next();
        if (tok.value !== ';') this._tokenizer.unget(tok);
    }

    // Collect tokens inside parentheses: ( ... )
    _collectUntilParen() {
        this._expectRaw('(');
        const tokens = [];
        let depth = 0;
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) break;
            if (tok.value === '(' ) { depth++; tokens.push(tok); }
            else if (tok.value === ')' && depth > 0) { depth--; tokens.push(tok); }
            else if (tok.value === ')' && depth === 0) break;
            else tokens.push(tok);
        }
        return tokens;
    }

    _collectUntilCommaOrParen() {
        const tokens = [];
        let depth = 0;
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) break;
            if (tok.value === '(') { depth++; tokens.push(tok); }
            else if (tok.value === ')' && depth > 0) { depth--; tokens.push(tok); }
            else if ((tok.value === ',' || tok.value === ')') && depth === 0) break;
            else tokens.push(tok);
        }
        return tokens;
    }

    _collectUntilSemicolon() {
        const tokens = [];
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) break;
            if (tok.value === ';') break;
            tokens.push(tok);
        }
        return tokens;
    }

    // Capture body tokens until matching #end (respects nesting)
    _captureBody() {
        const tokens = [];
        let depth = 0;
        while (true) {
            const tok = this._tokenizer.next();
            if (tok.type === RAW_TOKEN.EOF) break;
            if (tok.type === RAW_TOKEN.HASH_DIRECTIVE) {
                if (tok.value === 'if' || tok.value === 'ifdef' || tok.value === 'ifndef' ||
                    tok.value === 'while' || tok.value === 'for' || tok.value === 'switch' ||
                    tok.value === 'macro') {
                    depth++;
                    tokens.push(tok);
                } else if (tok.value === 'end') {
                    if (depth === 0) break;
                    depth--;
                    tokens.push(tok);
                } else {
                    tokens.push(tok);
                }
            } else {
                tokens.push(tok);
            }
        }
        return tokens;
    }

    _skipFunctionBody() {
        // Skip optional (params)
        const peek = this._tokenizer.next();
        if (peek.value === '(') {
            let depth = 1;
            while (depth > 0) {
                const t = this._tokenizer.next();
                if (t.type === RAW_TOKEN.EOF) return;
                if (t.value === '(') depth++;
                if (t.value === ')') depth--;
            }
            // Now expect {
            const brace = this._tokenizer.next();
            if (brace.value === '{') {
                let d = 1;
                while (d > 0) {
                    const t = this._tokenizer.next();
                    if (t.type === RAW_TOKEN.EOF) return;
                    if (t.value === '{') d++;
                    if (t.value === '}') d--;
                }
            }
        } else if (peek.value === '{') {
            let d = 1;
            while (d > 0) {
                const t = this._tokenizer.next();
                if (t.type === RAW_TOKEN.EOF) return;
                if (t.value === '{') d++;
                if (t.value === '}') d--;
            }
        } else {
            this._tokenizer.unget(peek);
        }
    }

    // Inject tokens back into the processing stream
    // (These tokens will be processed by _processTokens on next iteration)
    _injectTokens(tokens) {
        if (tokens.length === 0) return;
        // Process tokens through a temporary tokenizer so that #if/#else/#end
        // directives inside macro/loop bodies are resolved rather than leaked.
        const savedTokenizer = this._tokenizer;
        this._tokenizer = new _ArrayTokenizer(tokens);
        this._processTokens();
        this._tokenizer = savedTokenizer;
    }
}

// Minimal tokenizer that feeds from a pre-captured token array.
// Used by _injectTokens to reprocess macro/loop bodies through _processTokens.
class _ArrayTokenizer {
    constructor(tokens) {
        this._tokens = tokens;
        this._pos = 0;
        this._putback = null;
    }
    next() {
        if (this._putback) {
            const t = this._putback;
            this._putback = null;
            return t;
        }
        if (this._pos < this._tokens.length) return this._tokens[this._pos++];
        return { type: RAW_TOKEN.EOF, value: null, line: 0, col: 0, fileName: '' };
    }
    unget(token) { this._putback = token; }
    pushSource() {}
    popSource() { return false; }
}
