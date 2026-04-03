// POV-Ray Web - Main recursive descent parser
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { Scanner } from './scanner.js';
import { SymbolTable } from './symbol-table.js';
import * as T from './reserved-words.js';
import { createSceneData } from '../scene/scene-data.js';
import { parseObject } from './parse-objects.js';
import { parseCamera } from './parse-camera.js';
import { parseLightSource } from './parse-lights.js';
import { parseGlobalSettings, parseBackground, parseFog, parseSkysphere } from './parse-global.js';
import { handleDirective } from './parse-directives.js';
import { Preprocessor } from './preprocessor.js';

export class Parser {
    constructor(options = {}) {
        this.symbolTable = new SymbolTable();
        this.sceneData = createSceneData();
        this.clock = options.clock || 0;
        this.baseUrl = options.baseUrl || null;
        this.scanner = null;
        this._inVector = false;
        this._bundledIncludes = options.bundledIncludes || {};
        this._includeCache = options.includeCache || new Map();
        this._warnCounts = new Map();   // dedup: message -> count
        this._warnDedupLimit = 10;      // show first N, then suppress
        this._errorCount = 0;
        this._maxErrors = 50;
    }

    async parse(sceneText, fileName = '<scene>') {
        // Pass 1: Preprocess — resolve includes, conditionals, macros, loops
        const pp = new Preprocessor({
            includeCache: this._includeCache,
            bundledIncludes: this._bundledIncludes,
            clock: this.clock,
            sceneData: this.sceneData,
        });
        const flatTokens = pp.process(sceneText, fileName);
        this.sceneData.languageVersion = pp.version;

        // Pass 2: Parse flat token stream into scene graph
        this.scanner = new Scanner(flatTokens, this.symbolTable);
        this._parseStatements();

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

            // Hash directives (#declare/#local/#version/#undef survive Pass 1)
            if (tok.isDirective) {
                handleDirective(this, tok);
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

    handleDirective(tok) {
        handleDirective(this, tok);
    }

    expect(tokenId) {
        const tok = this.scanner.getToken();
        if (tok.id !== tokenId) {
            const location = `${tok.fileName}:${tok.line}:${tok.col}`;
            this._warnDedup(`Parse: expected token ${tokenId}, got ${tok.id} ('${tok.value}') at ${location}`);
            this._errorCount++;
            if (this._errorCount >= this._maxErrors) {
                throw new Error(`Too many parse errors (${this._maxErrors}), aborting`);
            }
        }
        return tok;
    }

    error(msg, tok) {
        const location = tok ? ` at ${tok.fileName}:${tok.line}:${tok.col}` : '';
        const err = new Error(`Parse error${location}: ${msg}`);
        this._errorCount++;
        if (this._strictMode) throw err;
        this._warnDedup(err.message);
        if (this._errorCount >= this._maxErrors) {
            throw new Error(`Too many parse errors (${this._maxErrors}), aborting`);
        }
        return null;
    }

    warn(msg, tok) {
        const location = tok ? ` at ${tok.fileName}:${tok.line}:${tok.col}` : '';
        this._warnDedup(`Parse warning${location}: ${msg}`);
    }

    _warnDedup(msg) {
        const count = (this._warnCounts.get(msg) || 0) + 1;
        this._warnCounts.set(msg, count);
        if (count <= this._warnDedupLimit) {
            console.warn(msg);
        } else if (count === this._warnDedupLimit + 1) {
            console.warn(`... suppressing further "${msg.slice(0, 80)}" warnings`);
        }
        // Beyond limit+1: silently suppressed
    }

    getWarningSummary() {
        const suppressed = [];
        for (const [msg, count] of this._warnCounts) {
            if (count > this._warnDedupLimit) {
                suppressed.push(`${msg.slice(0, 120)}... (${count} total, ${count - this._warnDedupLimit} suppressed)`);
            }
        }
        return suppressed;
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

}
