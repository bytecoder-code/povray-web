// POV-Ray Web - Main recursive descent parser
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { Tokenizer } from './tokenizer.js';
import { Scanner } from './scanner.js';
import { SymbolTable } from './symbol-table.js';
import * as T from './reserved-words.js';
import { createSceneData } from '../scene/scene-data.js';
import { parseObject } from './parse-objects.js';
import { parseCamera } from './parse-camera.js';
import { parseLightSource } from './parse-lights.js';
import { parseGlobalSettings, parseBackground, parseFog, parseSkysphere } from './parse-global.js';
import { handleDirective } from './parse-directives.js';
import { resolveInclude, loadBundledIncludes } from './include-resolver.js';
import { parseFloat as parseFloatExpr, parseVector, parseString } from './parse-expressions.js';
import { SYMBOL_TYPE } from './symbol-table.js';

export class Parser {
    constructor(options = {}) {
        this.symbolTable = new SymbolTable();
        this.sceneData = createSceneData();
        this.clock = options.clock || 0;
        this.baseUrl = options.baseUrl || null;
        this.onProgress = options.onProgress || null;
        this.tokenizer = null;
        this.scanner = null;
        this.lastDirective = null;
        this._includeCache = new Map();
        this._inVector = false;
        // Accept bundled includes passed from caller (avoids dynamic import issues)
        this._bundledIncludes = options.bundledIncludes || {};
    }

    async parse(sceneText, fileName = '<scene>') {
        await loadBundledIncludes();

        this.tokenizer = new Tokenizer(sceneText, fileName);
        this.scanner = new Scanner(this.tokenizer, this.symbolTable);

        console.log(`Parser: include cache has ${this._includeCache.size} entries: [${[...this._includeCache.keys()].join(', ')}]`);
        console.log(`Parser: bundled includes has ${Object.keys(this._bundledIncludes).length} entries`);
        this._parseStatements();

        console.log(`Parser done: ${this.sceneData.objects.length} objects, ${this.sceneData.lightSources.length} lights`);
        return this.sceneData;
    }

    _parseStatements() {
        while (true) {
            const tok = this.scanner.getToken();
            if (tok.id === T.END_OF_FILE_TOKEN) break;
            this.scanner.ungetToken();
            this._parseOneStatement();
        }
    }

    _parseOneStatement() {
            const tok = this.scanner.getToken();
            if (tok.id === T.END_OF_FILE_TOKEN) return;

            // Hash directives
            if (tok.isDirective) {
                const result = handleDirective(this, tok);
                return;
            }

            // Macro invocation
            if (tok.id === T.MACRO_ID_TOKEN) {
                this._invokeMacro(tok);
                return;
            }

            // Scene-level statements
            switch (tok.id) {
                case T.CAMERA_TOKEN:
                    this.scanner.ungetToken();
                    this.sceneData.camera = parseCamera(this);
                    break;

                case T.LIGHT_SOURCE_TOKEN:
                    this.scanner.ungetToken();
                    this.sceneData.lightSources.push(parseLightSource(this));
                    break;

                case T.GLOBAL_SETTINGS_TOKEN:
                    this.scanner.ungetToken();
                    parseGlobalSettings(this, this.sceneData);
                    break;

                case T.BACKGROUND_TOKEN:
                    this.scanner.ungetToken();
                    parseBackground(this, this.sceneData);
                    break;

                case T.FOG_TOKEN:
                    this.scanner.ungetToken();
                    this.sceneData.fog = parseFog(this);
                    break;

                case T.SKYSPHERE_TOKEN:
                    this.scanner.ungetToken();
                    this.sceneData.skysphere = parseSkysphere(this);
                    break;

                // Object primitives
                case T.SPHERE_TOKEN:
                case T.BOX_TOKEN:
                case T.PLANE_TOKEN:
                case T.CYLINDER_TOKEN:
                case T.CONE_TOKEN:
                case T.TORUS_TOKEN:
                case T.UNION_TOKEN:
                case T.INTERSECTION_TOKEN:
                case T.DIFFERENCE_TOKEN:
                case T.MERGE_TOKEN:
                case T.OBJECT_TOKEN:
                case T.BLOB_TOKEN:
                case T.BICUBIC_PATCH_TOKEN:
                case T.DISC_TOKEN:
                case T.HEIGHT_FIELD_TOKEN:
                case T.ISOSURFACE_TOKEN:
                case T.JULIA_FRACTAL_TOKEN:
                case T.LATHE_TOKEN:
                case T.LEMON_TOKEN:
                case T.MESH_TOKEN:
                case T.MESH2_TOKEN:
                case T.OVUS_TOKEN:
                case T.PARAMETRIC_TOKEN:
                case T.POLYGON_TOKEN:
                case T.POLY_TOKEN:
                case T.PRISM_TOKEN:
                case T.QUADRIC_TOKEN:
                case T.QUARTIC_TOKEN:
                case T.SOR_TOKEN:
                case T.SPHERE_SWEEP_TOKEN:
                case T.SUPERELLIPSOID_TOKEN:
                case T.TEXT_TOKEN:
                case T.TRIANGLE_TOKEN:
                case T.SMOOTH_TRIANGLE_TOKEN:
                case T.LIGHT_GROUP_TOKEN:
                    this.scanner.ungetToken();
                    const obj = parseObject(this);
                    if (obj) this.sceneData.objects.push(obj);
                    break;

                // Object identifier
                case T.OBJECT_ID_TOKEN:
                    this.scanner.ungetToken();
                    const objRef = parseObject(this);
                    if (objRef) this.sceneData.objects.push(objRef);
                    break;

                // Semicolons are allowed as statement separators
                case T.SEMI_COLON_TOKEN:
                    break;

                // Skip unknown tokens with a warning
                default:
                    if (tok.id !== T.IDENTIFIER_TOKEN) {
                        // Silently skip for now
                    }
                    break;
            }
    }

    expect(tokenId) {
        const tok = this.scanner.getToken();
        if (tok.id !== tokenId) {
            const location = `${tok.fileName}:${tok.line}:${tok.col}`;
            console.warn(`Parse: expected token ${tokenId}, got ${tok.id} ('${tok.value}') at ${location}`);
            // Don't consume the unexpected token — put it back for recovery
            this.scanner.ungetToken();
        }
        return tok;
    }

    error(msg, tok) {
        const location = tok ? ` at ${tok.fileName}:${tok.line}:${tok.col}` : '';
        const err = new Error(`Parse error${location}: ${msg}`);
        if (this._strictMode) throw err;
        console.warn(err.message);
        // Try to recover by skipping to next statement
        return null;
    }

    warn(msg, tok) {
        const location = tok ? ` at ${tok.fileName}:${tok.line}:${tok.col}` : '';
        console.warn(`Parse warning${location}: ${msg}`);
    }

    _invokeMacro(tok) {
        const macro = tok.value; // { params, bodyTokens }
        if (!macro || !macro.params || !macro.bodyTokens) {
            this.warn(`Invalid macro invocation: ${tok.name}`, tok);
            return;
        }

        // Parse arguments
        this.expect(T.LEFT_PAREN_TOKEN);
        const args = [];
        for (let i = 0; i < macro.params.length; i++) {
            if (i > 0) this.expect(T.COMMA_TOKEN);
            // Try to parse as float first, then vector, then string
            const peek = this.scanner.peek();
            if (peek.id === T.STRING_LITERAL_TOKEN || peek.id === T.CONCAT_TOKEN) {
                args.push(parseString(this));
            } else if (peek.id === T.LEFT_ANGLE_TOKEN || peek.id === T.X_TOKEN ||
                       peek.id === T.Y_TOKEN || peek.id === T.Z_TOKEN) {
                args.push(parseVector(this));
            } else {
                args.push(parseFloatExpr(this));
            }
        }
        this.expect(T.RIGHT_PAREN_TOKEN);

        // Push scope and bind parameters
        this.symbolTable.pushScope();
        for (let i = 0; i < macro.params.length; i++) {
            const val = args[i];
            const type = Array.isArray(val) ? SYMBOL_TYPE.VECTOR :
                         typeof val === 'string' ? SYMBOL_TYPE.STRING : SYMBOL_TYPE.FLOAT;
            this.symbolTable.declare(macro.params[i], type, val, true);
        }

        // Replay body tokens via the scanner queue
        this.scanner.pushTokens([...macro.bodyTokens]);
    }

    _popMacroScope() {
        this.symbolTable.popScope();
    }

    skipBlock() {
        let depth = 1;
        while (depth > 0) {
            const tok = this.scanner.getToken();
            if (tok.id === T.LEFT_CURLY_TOKEN) depth++;
            else if (tok.id === T.RIGHT_CURLY_TOKEN) depth--;
            else if (tok.id === T.END_OF_FILE_TOKEN) {
                this.error('Unexpected end of file while skipping block');
            }
        }
    }

    includeFile(filename) {
        // Check preloaded cache first
        if (this._includeCache.has(filename)) {
            const content = this._includeCache.get(filename);
            console.log(`#include "${filename}" from cache (${content ? content.length : 0} chars)`);
            if (content) this.tokenizer.pushSource(content, filename);
            return;
        }
        // Try loading from bundled includes synchronously
        console.log(`#include "${filename}" — not in cache, checking bundled (${Object.keys(this._bundledIncludes).length} entries)`);
        if (this._bundledIncludes && this._bundledIncludes[filename]) {
            this._includeCache.set(filename, this._bundledIncludes[filename]);
            this.tokenizer.pushSource(this._bundledIncludes[filename], filename);
            return;
        }
        // Try lowercase
        const lower = filename.toLowerCase();
        if (this._bundledIncludes && this._bundledIncludes[lower]) {
            this._includeCache.set(filename, this._bundledIncludes[lower]);
            this.tokenizer.pushSource(this._bundledIncludes[lower], filename);
            return;
        }
        console.warn(`#include "${filename}" not available`);
    }

    async preloadIncludes(sceneText) {
        // Quick scan for #include directives and preload non-bundled ones
        const includeRegex = /#include\s+"([^"]+)"/g;
        let match;
        while ((match = includeRegex.exec(sceneText)) !== null) {
            const filename = match[1];
            // Skip if already cached or available in bundled includes
            if (this._includeCache.has(filename)) continue;
            if (this._bundledIncludes[filename]) continue;
            if (this._bundledIncludes[filename.toLowerCase()]) continue;

            const content = await resolveInclude(filename, this.baseUrl);
            if (content) {
                this._includeCache.set(filename, content);
                await this.preloadIncludes(content);
            }
        }
    }

    // For directive handling: parse until we hit one of the specified directives
    parseUntilDirective(directives) {
        while (true) {
            const tok = this.scanner.getToken();
            if (tok.id === T.END_OF_FILE_TOKEN) break;
            if (tok.isDirective && directives.includes(tok.value)) {
                this.lastDirective = tok.value;
                return;
            }
            // Process ONE statement, then check for directive again
            this.scanner.ungetToken();
            this._parseOneStatement();
            break; // After parseStatements returns, check again
        }
    }

    skipUntilDirective(directives) {
        let depth = 0;
        while (true) {
            const tok = this.scanner.getToken();
            if (tok.id === T.END_OF_FILE_TOKEN) break;
            if (tok.isDirective) {
                if ((tok.value === 'if' || tok.value === 'ifdef' || tok.value === 'ifndef' ||
                     tok.value === 'while' || tok.value === 'for' || tok.value === 'switch' ||
                     tok.value === 'macro') && !directives.includes(tok.value)) {
                    depth++;
                } else if (tok.value === 'end') {
                    if (depth > 0) {
                        depth--;
                    } else if (directives.includes('end')) {
                        this.lastDirective = 'end';
                        return;
                    }
                } else if (depth === 0 && directives.includes(tok.value)) {
                    this.lastDirective = tok.value;
                    return;
                }
            }
        }
    }

    savePosition() {
        return {
            srcIndex: this.tokenizer._sources.length - 1,
            pos: this.tokenizer._src.pos,
            line: this.tokenizer._src.line,
            col: this.tokenizer._src.col
        };
    }

    restorePosition(saved, pos) {
        // Simplified position restore for while loops
        const s = this.tokenizer._sources[saved.srcIndex];
        if (s) {
            s.pos = saved.pos;
            s.line = saved.line;
            s.col = saved.col;
        }
    }
}
