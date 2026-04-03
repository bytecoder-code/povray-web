// POV-Ray Web - Preprocessor directives (#include, #declare, #if, #while, #macro, etc.)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import * as T from './reserved-words.js';
import { parseFloat, parseVector, parseColour, parseString } from './parse-expressions.js';
import { SYMBOL_TYPE } from './symbol-table.js';
import { parseObject } from './parse-objects.js';
import { parseTexture, parsePigment, parseFinish, parseNormal } from './parse-materials.js';
import { parseCamera } from './parse-camera.js';

// Pass 2 directive handler — only handles directives that survive preprocessing
export function handleDirective(parser, tok) {
    switch (tok.id) {
        case T.DECLARE_TOKEN: return handleDeclare(parser, false);
        case T.LOCAL_TOKEN: return handleDeclare(parser, true);
        case T.UNDEF_TOKEN: return handleUndef(parser);
        case T.VERSION_TOKEN: return handleVersion(parser);
        case T.WARNING_TOKEN: return handleMessage(parser, 'warning');
        case T.ERROR_TOKEN: return handleMessage(parser, 'error');
        case T.DEBUG_TOKEN: return handleMessage(parser, 'debug');
        case T.DEFAULT_TOKEN: return handleDefault(parser);
        default: return null;
    }
}

function handleDeclare(parser, isLocal) {
    const nameTok = parser.scanner.getToken();
    const name = nameTok.value || nameTok.name;
    parser.expect(T.EQUALS_TOKEN);

    // Determine what type of value follows
    const peek = parser.scanner.peek();

    // Function declaration: #declare Name = function { ... }
    if (peek.id === T.FUNCTION_TOKEN) {
        parser.scanner.getToken();
        // Skip function parameters if present: function(x,y,z) { ... }
        if (parser.scanner.peek().id === T.LEFT_PAREN_TOKEN) {
            parser.scanner.getToken();
            let depth = 1;
            while (depth > 0) {
                const t = parser.scanner.getToken();
                if (t.id === T.LEFT_PAREN_TOKEN) depth++;
                else if (t.id === T.RIGHT_PAREN_TOKEN) depth--;
                else if (t.id === T.END_OF_FILE_TOKEN) break;
            }
        }
        // Skip function body { ... }
        if (parser.scanner.peek().id === T.LEFT_CURLY_TOKEN) {
            parser.scanner.getToken();
            parser.skipBlock();
        }
        parser.symbolTable.declare(name, SYMBOL_TYPE.FUNCTION, null, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Object declaration
    const obj = parseObject(parser);
    if (obj) {
        parser.symbolTable.declare(name, SYMBOL_TYPE.OBJECT, obj, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Texture declaration
    if (peek.id === T.TEXTURE_TOKEN) {
        const tex = parseTexture(parser);
        parser.symbolTable.declare(name, SYMBOL_TYPE.TEXTURE, tex, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Pigment declaration
    if (peek.id === T.PIGMENT_TOKEN) {
        const pig = parsePigment(parser);
        parser.symbolTable.declare(name, SYMBOL_TYPE.PIGMENT, pig, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Finish declaration
    if (peek.id === T.FINISH_TOKEN) {
        const fin = parseFinish(parser);
        parser.symbolTable.declare(name, SYMBOL_TYPE.FINISH, fin, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Normal declaration
    if (peek.id === T.NORMAL_TOKEN) {
        const nrm = parseNormal(parser);
        parser.symbolTable.declare(name, SYMBOL_TYPE.NORMAL, nrm, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Camera declaration
    if (peek.id === T.CAMERA_TOKEN) {
        const cam = parseCamera(parser);
        parser.symbolTable.declare(name, SYMBOL_TYPE.CAMERA, cam, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Interior declaration
    if (peek.id === T.INTERIOR_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_CURLY_TOKEN);
        parser.skipBlock();
        parser.symbolTable.declare(name, SYMBOL_TYPE.INTERIOR, {}, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Material declaration
    if (peek.id === T.MATERIAL_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_CURLY_TOKEN);
        parser.skipBlock();
        parser.symbolTable.declare(name, SYMBOL_TYPE.MATERIAL, {}, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Media declaration
    if (peek.id === T.MEDIA_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_CURLY_TOKEN);
        parser.skipBlock();
        parser.symbolTable.declare(name, SYMBOL_TYPE.MEDIA, {}, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Color identifier (rgb, rgbf, etc.) or existing colour variable (White*0.5)
    if (peek.id === T.RGB_TOKEN || peek.id === T.RGBF_TOKEN || peek.id === T.RGBT_TOKEN ||
        peek.id === T.RGBFT_TOKEN || peek.id === T.COLOUR_TOKEN || peek.id === T.SRGB_TOKEN ||
        peek.id === T.COLOUR_ID_TOKEN) {
        const color = parseColour(parser);
        // Handle colour arithmetic: * scalar, + colour/vector, .red/.green/.blue
        let result = Array.isArray(color) ? [...color] : [0, 0, 0, 0, 0];
        while (result.length < 5) result.push(0);
        let done = false;
        while (!done) {
            const next = parser.scanner.peek();
            if (next.id === T.STAR_TOKEN) {
                parser.scanner.getToken();
                const s = parseSimpleFloat(parser);
                result = result.map(v => v * s);
            } else if (next.id === T.SLASH_TOKEN) {
                parser.scanner.getToken();
                const s = parseSimpleFloat(parser);
                if (s !== 0) result = result.map(v => v / s);
            } else if (next.id === T.PLUS_TOKEN) {
                parser.scanner.getToken();
                const v2 = parseVector(parser);
                for (let i = 0; i < Math.min(result.length, v2.length); i++) result[i] += v2[i];
            } else if (next.id === T.DASH_TOKEN) {
                parser.scanner.getToken();
                const v2 = parseVector(parser);
                for (let i = 0; i < Math.min(result.length, v2.length); i++) result[i] -= v2[i];
            } else if (next.id === T.PERIOD_TOKEN) {
                // Component access: .red, .green, .blue, .filter, .transmit
                parser.scanner.getToken();
                const comp = parser.scanner.getToken();
                const compName = comp.value || comp.name || '';
                let val = 0;
                if (compName === 'red' || compName === 'r' || compName === 'x' || compName === 'u') val = result[0];
                else if (compName === 'green' || compName === 'g' || compName === 'y' || compName === 'v') val = result[1];
                else if (compName === 'blue' || compName === 'b' || compName === 'z') val = result[2];
                else if (compName === 'filter' || compName === 'f') val = result[3];
                else if (compName === 'transmit' || compName === 't') val = result[4];
                // This becomes a float, not a colour
                parser.symbolTable.declare(name, SYMBOL_TYPE.FLOAT, val, isLocal);
                consumeOptionalSemicolon(parser);
                return;
            } else {
                done = true;
            }
        }
        parser.symbolTable.declare(name, SYMBOL_TYPE.COLOUR, result, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Vector (starts with <)
    if (peek.id === T.LEFT_ANGLE_TOKEN || peek.id === T.X_TOKEN ||
        peek.id === T.Y_TOKEN || peek.id === T.Z_TOKEN ||
        peek.id === T.VECTOR_ID_TOKEN) {
        const vec = parseVector(parser);
        parser.symbolTable.declare(name, SYMBOL_TYPE.VECTOR, vec, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // String
    if (peek.id === T.STRING_LITERAL_TOKEN || peek.id === T.CONCAT_TOKEN ||
        peek.id === T.STR_TOKEN || peek.id === T.STRING_ID_TOKEN) {
        const str = parseString(parser);
        parser.symbolTable.declare(name, SYMBOL_TYPE.STRING, str, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Colour map
    if (peek.id === T.COLOUR_MAP_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_CURLY_TOKEN);
        const map = [];
        while (parser.scanner.peek().id === T.LEFT_SQUARE_TOKEN) {
            parser.scanner.getToken();
            const val = parseFloat(parser);
            const color = parseColour(parser);
            parser.expect(T.RIGHT_SQUARE_TOKEN);
            map.push([val, color]);
        }
        parser.expect(T.RIGHT_CURLY_TOKEN);
        parser.symbolTable.declare(name, SYMBOL_TYPE.COLOUR_MAP, map, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Transform
    if (peek.id === T.TRANSFORM_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_CURLY_TOKEN);
        parser.skipBlock(); // TODO
        parser.symbolTable.declare(name, SYMBOL_TYPE.TRANSFORM, null, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Array
    if (peek.id === T.ARRAY_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_SQUARE_TOKEN);
        const size = parseFloat(parser);
        parser.expect(T.RIGHT_SQUARE_TOKEN);
        const arr = new Array(Math.floor(size));
        // Check for initializer { val, val, ... }
        if (parser.scanner.peek().id === T.LEFT_CURLY_TOKEN) {
            parser.scanner.getToken();
            let i = 0;
            while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
                   parser.scanner.peek().id !== T.END_OF_FILE_TOKEN && i < arr.length) {
                const elemPeek = parser.scanner.peek();
                if (elemPeek.id === T.STRING_LITERAL_TOKEN || elemPeek.id === T.STRING_ID_TOKEN) {
                    arr[i] = parseString(parser);
                } else if (elemPeek.id === T.LEFT_ANGLE_TOKEN || elemPeek.id === T.X_TOKEN ||
                           elemPeek.id === T.Y_TOKEN || elemPeek.id === T.Z_TOKEN ||
                           elemPeek.id === T.VECTOR_ID_TOKEN) {
                    arr[i] = parseVector(parser);
                } else if (elemPeek.id === T.RGB_TOKEN || elemPeek.id === T.COLOUR_TOKEN ||
                           elemPeek.id === T.COLOUR_ID_TOKEN) {
                    arr[i] = parseColour(parser);
                } else {
                    arr[i] = parseFloat(parser);
                }
                i++;
                if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        }
        parser.symbolTable.declare(name, SYMBOL_TYPE.ARRAY, arr, isLocal);
        consumeOptionalSemicolon(parser);
        return;
    }

    // Default: float expression
    const val = parseFloat(parser);
    parser.symbolTable.declare(name, SYMBOL_TYPE.FLOAT, val, isLocal);
    consumeOptionalSemicolon(parser);
}

// Parse a simple float value — number, identifier, or (expr) — without consuming +/-
function parseSimpleFloat(parser) {
    const tok = parser.scanner.getToken();
    if (tok.id === T.FLOAT_TOKEN) return tok.value;
    if (tok.id === T.FLOAT_ID_TOKEN) return typeof tok.value === 'number' ? tok.value : 0;
    if (tok.id === T.DASH_TOKEN) return -parseSimpleFloat(parser);
    if (tok.id === T.LEFT_PAREN_TOKEN) {
        const val = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return val;
    }
    // Unrecognized — put back and return 1
    parser.scanner.ungetToken();
    return 1;
}

function consumeOptionalSemicolon(parser) {
    if (parser.scanner.peek().id === T.SEMI_COLON_TOKEN) {
        parser.scanner.getToken();
    }
}

function handleInclude(parser) {
    const filename = parseString(parser);
    parser.includeFile(filename);
}

function handleIf(parser) {
    parser.expect(T.LEFT_PAREN_TOKEN);
    const condition = parseFloat(parser);
    parser.expect(T.RIGHT_PAREN_TOKEN);

    if (condition) {
        // Parse until #else or #end
        parser.parseUntilDirective(['else', 'elseif', 'end']);
        const endTok = parser.lastDirective;
        if (endTok === 'else' || endTok === 'elseif') {
            parser.skipUntilDirective(['end']);
        }
    } else {
        // Skip to #else or #elseif or #end
        parser.skipUntilDirective(['else', 'elseif', 'end']);
        const endTok = parser.lastDirective;
        if (endTok === 'else') {
            parser.parseUntilDirective(['end']);
        } else if (endTok === 'elseif') {
            handleIf(parser); // Recursive for elseif chain
        }
    }
}

function handleIfdef(parser, isNot) {
    parser.expect(T.LEFT_PAREN_TOKEN);
    const nameTok = parser.scanner.getToken();
    const name = nameTok.value || nameTok.name;
    parser.expect(T.RIGHT_PAREN_TOKEN);

    let defined = parser.symbolTable.isDefined(name);
    if (isNot) defined = !defined;

    if (defined) {
        parser.parseUntilDirective(['else', 'end']);
        if (parser.lastDirective === 'else') {
            parser.skipUntilDirective(['end']);
        }
    } else {
        parser.skipUntilDirective(['else', 'end']);
        if (parser.lastDirective === 'else') {
            parser.parseUntilDirective(['end']);
        }
    }
}

function handleWhile(parser) {
    // Capture condition tokens
    parser.expect(T.LEFT_PAREN_TOKEN);
    const condTokens = captureTokensUntil(parser, T.RIGHT_PAREN_TOKEN);

    // Capture body tokens until #end
    const bodyTokens = captureBodyTokens(parser);

    const MAX_ITERATIONS = 10000;
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
        // Evaluate condition by replaying condition tokens
        parser.scanner.pushTokens([...condTokens]);
        const condition = parseFloat(parser);
        if (!condition) break;

        // Replay body tokens
        parser.scanner.pushTokens([...bodyTokens]);
        iterations++;
    }

    if (iterations >= MAX_ITERATIONS) {
        console.warn('#while exceeded maximum iterations');
    }
}

function handleFor(parser) {
    parser.expect(T.LEFT_PAREN_TOKEN);
    const nameTok = parser.scanner.getToken();
    const name = nameTok.value;
    parser.expect(T.COMMA_TOKEN);
    const start = parseFloat(parser);
    parser.expect(T.COMMA_TOKEN);
    const end = parseFloat(parser);
    let step = 1;
    if (parser.scanner.peek().id === T.COMMA_TOKEN) {
        parser.scanner.getToken();
        step = parseFloat(parser);
    }
    parser.expect(T.RIGHT_PAREN_TOKEN);

    // Capture body tokens until #end
    const bodyTokens = captureBodyTokens(parser);

    // Replay body for each iteration
    const dir = step > 0 ? 1 : -1;
    for (let val = start; dir > 0 ? val <= end : val >= end; val += step) {
        parser.symbolTable.declare(name, SYMBOL_TYPE.FLOAT, val, false);
        parser.scanner.pushTokens([...bodyTokens]);
    }
}

function captureTokensUntil(parser, endTokenId) {
    const tokens = [];
    let depth = 0;
    while (true) {
        const tok = parser.scanner.getToken();
        if (tok.id === T.END_OF_FILE_TOKEN) break;
        if (tok.id === T.LEFT_PAREN_TOKEN) depth++;
        if (tok.id === endTokenId && depth === 0) break;
        if (tok.id === T.RIGHT_PAREN_TOKEN) depth--;
        tokens.push(tok);
    }
    return tokens;
}

function captureBodyTokens(parser) {
    const tokens = [];
    let depth = 0;
    while (true) {
        const tok = parser.scanner.getToken();
        if (tok.id === T.END_OF_FILE_TOKEN) break;
        if (tok.isDirective && (tok.value === 'while' || tok.value === 'for' ||
            tok.value === 'if' || tok.value === 'ifdef' || tok.value === 'ifndef' ||
            tok.value === 'switch' || tok.value === 'macro')) {
            depth++;
        }
        if (tok.isDirective && tok.value === 'end') {
            if (depth === 0) break;
            depth--;
        }
        tokens.push(tok);
    }
    return tokens;
}

function handleSwitch(parser) {
    parser.expect(T.LEFT_PAREN_TOKEN);
    const switchVal = parseFloat(parser);
    parser.expect(T.RIGHT_PAREN_TOKEN);

    // Capture all tokens until #end, then process case/range/break
    const allTokens = captureBodyTokens(parser);

    // Find matching case
    let matched = false;
    let i = 0;
    while (i < allTokens.length) {
        const tok = allTokens[i];
        if (tok.isDirective && tok.value === 'case') {
            i++;
            // Collect case value tokens until we hit the body
            // Simple: assume single token value
            if (i < allTokens.length) {
                const caseVal = typeof allTokens[i].value === 'number' ? allTokens[i].value : 0;
                i++;
                if (caseVal === switchVal) {
                    matched = true;
                    // Collect tokens until next #case, #range, #break, or end
                    const bodyTokens = [];
                    while (i < allTokens.length) {
                        const bt = allTokens[i];
                        if (bt.isDirective && (bt.value === 'case' || bt.value === 'range' || bt.value === 'break')) break;
                        bodyTokens.push(bt);
                        i++;
                    }
                    parser.scanner.pushTokens(bodyTokens);
                    return;
                }
            }
        } else if (tok.isDirective && tok.value === 'range') {
            i++;
            if (i + 1 < allTokens.length) {
                const lo = typeof allTokens[i].value === 'number' ? allTokens[i].value : 0;
                i++; // skip comma if present
                if (i < allTokens.length && allTokens[i].value === ',') i++;
                const hi = i < allTokens.length && typeof allTokens[i].value === 'number' ? allTokens[i].value : 0;
                i++;
                if (switchVal >= lo && switchVal <= hi) {
                    matched = true;
                    const bodyTokens = [];
                    while (i < allTokens.length) {
                        const bt = allTokens[i];
                        if (bt.isDirective && (bt.value === 'case' || bt.value === 'range' || bt.value === 'break')) break;
                        bodyTokens.push(bt);
                        i++;
                    }
                    parser.scanner.pushTokens(bodyTokens);
                    return;
                }
            }
        } else if (tok.isDirective && tok.value === 'break') {
            if (matched) return;
        }
        i++;
    }
    // No match — #else handling would go here
}

function handleMacroDef(parser) {
    const nameTok = parser.scanner.getToken();
    const name = nameTok.value;
    parser.expect(T.LEFT_PAREN_TOKEN);

    // Parse parameter list
    const params = [];
    while (parser.scanner.peek().id !== T.RIGHT_PAREN_TOKEN) {
        const paramTok = parser.scanner.getToken();
        params.push(paramTok.value);
        if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
    }
    parser.expect(T.RIGHT_PAREN_TOKEN);

    // Capture macro body text (everything until #end)
    const bodyTokens = [];
    let depth = 0;
    while (true) {
        const tok = parser.scanner.getToken();
        if (tok.isDirective && tok.value === 'end' && depth === 0) break;
        if (tok.isDirective && (tok.value === 'macro' || tok.value === 'if' ||
            tok.value === 'ifdef' || tok.value === 'ifndef' ||
            tok.value === 'while' || tok.value === 'for' || tok.value === 'switch')) {
            depth++;
        }
        if (tok.isDirective && tok.value === 'end' && depth > 0) depth--;
        bodyTokens.push(tok);
    }

    parser.symbolTable.declare(name, SYMBOL_TYPE.MACRO, { params, bodyTokens });
}

function handleUndef(parser) {
    const nameTok = parser.scanner.getToken();
    parser.symbolTable.undef(nameTok.value || nameTok.name);
}

function handleVersion(parser) {
    parser.sceneData.languageVersion = parseFloat(parser);
    consumeOptionalSemicolon(parser);
}

function handleMessage(parser, level) {
    const msg = parseString(parser);
    if (level === 'error') {
        throw new Error(`POV-Ray #error: ${msg}`);
    } else if (level === 'warning') {
        console.warn(`POV-Ray #warning: ${msg}`);
    } else {
        console.log(`POV-Ray #debug: ${msg}`);
    }
}

function handleDefault(parser) {
    parser.expect(T.LEFT_CURLY_TOKEN);
    parser.skipBlock(); // TODO: parse default texture
}
