// POV-Ray Web - Float/vector/color expression parser
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Expressions are evaluated at parse time (POV-Ray semantics)

import * as T from './reserved-words.js';

export function parseFloat(parser) {
    return parseRelational(parser);
}

function parseRelational(parser) {
    let left = parseAdditive(parser);
    while (true) {
        const tok = parser.scanner.peek();
        // Inside vector brackets, < and > are delimiters not operators
        if (!parser._inVector && tok.id === T.LEFT_ANGLE_TOKEN) {
            parser.scanner.getToken();
            const right = parseAdditive(parser);
            left = (left < right) ? 1 : 0;
        } else if (!parser._inVector && tok.id === T.RIGHT_ANGLE_TOKEN) {
            parser.scanner.getToken();
            const right = parseAdditive(parser);
            left = (left > right) ? 1 : 0;
        } else if (tok.id === T.REL_LE_TOKEN) {
            parser.scanner.getToken();
            left = (left <= parseAdditive(parser)) ? 1 : 0;
        } else if (tok.id === T.REL_GE_TOKEN) {
            parser.scanner.getToken();
            left = (left >= parseAdditive(parser)) ? 1 : 0;
        } else if (tok.id === T.EQUALS_TOKEN) {
            parser.scanner.getToken();
            left = (left === parseAdditive(parser)) ? 1 : 0;
        } else if (tok.id === T.REL_NE_TOKEN) {
            parser.scanner.getToken();
            left = (left !== parseAdditive(parser)) ? 1 : 0;
        } else {
            break;
        }
    }
    return left;
}

function parseAdditive(parser) {
    let left = parseMultiplicative(parser);
    while (true) {
        const tok = parser.scanner.peek();
        if (tok.id === T.PLUS_TOKEN) {
            parser.scanner.getToken();
            left += parseMultiplicative(parser);
        } else if (tok.id === T.DASH_TOKEN) {
            parser.scanner.getToken();
            left -= parseMultiplicative(parser);
        } else {
            break;
        }
    }
    return left;
}

function parseMultiplicative(parser) {
    let left = parseUnary(parser);
    while (true) {
        const tok = parser.scanner.peek();
        if (tok.id === T.STAR_TOKEN) {
            parser.scanner.getToken();
            left *= parseUnary(parser);
        } else if (tok.id === T.SLASH_TOKEN) {
            parser.scanner.getToken();
            left /= parseUnary(parser);
        } else {
            break;
        }
    }
    return left;
}

function parseUnary(parser) {
    const tok = parser.scanner.peek();
    if (tok.id === T.DASH_TOKEN) {
        parser.scanner.getToken();
        return -parsePrimary(parser);
    }
    if (tok.id === T.PLUS_TOKEN) {
        parser.scanner.getToken();
        return parsePrimary(parser);
    }
    if (tok.id === T.EXCLAMATION_TOKEN) {
        parser.scanner.getToken();
        return parsePrimary(parser) === 0 ? 1 : 0;
    }
    return parsePrimary(parser);
}

function parsePrimary(parser) {
    const tok = parser.scanner.getToken();

    // Number literal
    if (tok.id === T.FLOAT_TOKEN) return tok.value;

    // Float identifier
    if (tok.id === T.FLOAT_ID_TOKEN) return typeof tok.value === 'number' ? tok.value : 0;

    // Colour identifier with component access: Color.red, Color.green, Color.blue
    if (tok.id === T.COLOUR_ID_TOKEN) {
        const color = Array.isArray(tok.value) ? tok.value : [0,0,0,0,0];
        if (parser.scanner.peek().id === T.PERIOD_TOKEN) {
            parser.scanner.getToken();
            const comp = parser.scanner.getToken();
            const cn = comp.value || '';
            if (cn === 'red' || cn === 'r') return color[0];
            if (cn === 'green' || cn === 'g') return color[1];
            if (cn === 'blue' || cn === 'b') return color[2];
            if (cn === 'filter' || cn === 'f') return color[3];
            if (cn === 'transmit' || cn === 't') return color[4];
            if (cn === 'gray' || cn === 'grey') return (color[0]+color[1]+color[2])/3;
        }
        // Colour used as float = grayscale average
        return (color[0] + color[1] + color[2]) / 3;
    }

    // Vector identifier with component access: Vec.x, Vec.y, Vec.z
    if (tok.id === T.VECTOR_ID_TOKEN) {
        const vec = Array.isArray(tok.value) ? tok.value : [0,0,0];
        if (parser.scanner.peek().id === T.PERIOD_TOKEN) {
            parser.scanner.getToken();
            const comp = parser.scanner.getToken();
            const cn = comp.value || '';
            if (cn === 'x' || cn === 'u' || cn === 'red') return vec[0];
            if (cn === 'y' || cn === 'v' || cn === 'green') return vec[1];
            if (cn === 'z' || cn === 'blue') return vec[2];
        }
        return vec[0]; // default: x component
    }

    // Parenthesized expression
    if (tok.id === T.LEFT_PAREN_TOKEN) {
        const val = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return val;
    }

    // Constants
    if (tok.id === T.PI_TOKEN) return Math.PI;
    if (tok.id === T.TAU_TOKEN) return Math.PI * 2;
    if (tok.id === T.TRUE_TOKEN || tok.id === T.YES_TOKEN || tok.id === T.ON_TOKEN) return 1;
    if (tok.id === T.FALSE_TOKEN || tok.id === T.NO_TOKEN || tok.id === T.OFF_TOKEN) return 0;
    if (tok.id === T.CLOCK_TOKEN) return parser.clock || 0;
    if (tok.id === T.VERSION_TOKEN) return 3.8;
    if (tok.id === T.NOW_TOKEN) return Date.now() / 1000;

    // Built-in math functions
    if (tok.id === T.SIN_TOKEN) return Math.sin(parseParenFloat(parser));
    if (tok.id === T.COS_TOKEN) return Math.cos(parseParenFloat(parser));
    if (tok.id === T.TAN_TOKEN) return Math.tan(parseParenFloat(parser));
    if (tok.id === T.ASIN_TOKEN) return Math.asin(parseParenFloat(parser));
    if (tok.id === T.ACOS_TOKEN) return Math.acos(parseParenFloat(parser));
    if (tok.id === T.ATAN_TOKEN) return Math.atan(parseParenFloat(parser));
    if (tok.id === T.SINH_TOKEN) return Math.sinh(parseParenFloat(parser));
    if (tok.id === T.COSH_TOKEN) return Math.cosh(parseParenFloat(parser));
    if (tok.id === T.TANH_TOKEN) return Math.tanh(parseParenFloat(parser));
    if (tok.id === T.ASINH_TOKEN) return Math.asinh(parseParenFloat(parser));
    if (tok.id === T.ACOSH_TOKEN) return Math.acosh(parseParenFloat(parser));
    if (tok.id === T.ATANH_TOKEN) return Math.atanh(parseParenFloat(parser));
    if (tok.id === T.ABS_TOKEN) return Math.abs(parseParenFloat(parser));
    if (tok.id === T.SQRT_TOKEN) return Math.sqrt(parseParenFloat(parser));
    if (tok.id === T.EXP_TOKEN) return Math.exp(parseParenFloat(parser));
    if (tok.id === T.LN_TOKEN) return Math.log(parseParenFloat(parser));
    if (tok.id === T.LOG_TOKEN) return Math.log10(parseParenFloat(parser));
    if (tok.id === T.FLOOR_TOKEN) return Math.floor(parseParenFloat(parser));
    if (tok.id === T.CEIL_TOKEN) return Math.ceil(parseParenFloat(parser));
    if (tok.id === T.INT_TOKEN) return Math.trunc(parseParenFloat(parser));
    if (tok.id === T.DEGREES_TOKEN) return parseParenFloat(parser) * 180 / Math.PI;
    if (tok.id === T.RADIANS_TOKEN) return parseParenFloat(parser) * Math.PI / 180;

    if (tok.id === T.ATAN2_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const y = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const x = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return Math.atan2(y, x);
    }

    if (tok.id === T.POW_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const base = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const exp = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return Math.pow(base, exp);
    }

    if (tok.id === T.MOD_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const a = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const b = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return a % b;
    }

    if (tok.id === T.MIN_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        let val = parseFloat(parser);
        while (parser.scanner.peek().id === T.COMMA_TOKEN) {
            parser.scanner.getToken();
            val = Math.min(val, parseFloat(parser));
        }
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return val;
    }

    if (tok.id === T.MAX_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        let val = parseFloat(parser);
        while (parser.scanner.peek().id === T.COMMA_TOKEN) {
            parser.scanner.getToken();
            val = Math.max(val, parseFloat(parser));
        }
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return val;
    }

    if (tok.id === T.DIV_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const a = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const b = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return Math.trunc(a / b);
    }

    if (tok.id === T.SELECT_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const cond = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const a = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const b = parseFloat(parser);
        let c;
        if (parser.scanner.peek().id === T.COMMA_TOKEN) {
            parser.scanner.getToken();
            c = parseFloat(parser);
        }
        parser.expect(T.RIGHT_PAREN_TOKEN);
        if (c !== undefined) {
            return cond < 0 ? a : cond === 0 ? b : c;
        }
        return cond < 0 ? a : b;
    }

    if (tok.id === T.RAND_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        parseFloat(parser); // stream id (ignored in web version)
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return Math.random();
    }

    if (tok.id === T.SEED_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return 0; // returns stream id
    }

    if (tok.id === T.DEFINED_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const nameTok = parser.scanner.getToken();
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return parser.symbolTable.isDefined(nameTok.value || nameTok.name) ? 1 : 0;
    }

    if (tok.id === T.STRCMP_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const a = parseString(parser);
        parser.expect(T.COMMA_TOKEN);
        const b = parseString(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return a < b ? -1 : a > b ? 1 : 0;
    }

    if (tok.id === T.STRLEN_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const s = parseString(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return s.length;
    }

    if (tok.id === T.VAL_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const s = parseString(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return Number.parseFloat(s) || 0;
    }

    if (tok.id === T.ASC_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const s = parseString(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return s.charCodeAt(0) || 0;
    }

    if (tok.id === T.VDOT_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const a = parseVector(parser);
        parser.expect(T.COMMA_TOKEN);
        const b = parseVector(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }

    if (tok.id === T.VLENGTH_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const v = parseVector(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    }

    // Component access from vector: try x, y, z tokens after dot
    if (tok.id === T.X_TOKEN) return tryComponentOr(parser, 0, 1);
    if (tok.id === T.Y_TOKEN) return tryComponentOr(parser, 1, 1);
    if (tok.id === T.Z_TOKEN) return tryComponentOr(parser, 2, 0);

    // Common built-in identifiers
    if (tok.id === T.IDENTIFIER_TOKEN) {
        const name = tok.value;
        if (name === 'image_width') return 640;
        if (name === 'image_height') return 480;
        if (name === 'clock_delta') return 0;
        if (name === 'frame_number') return 1;
        if (name === 'final_clock') return 1;
        if (name === 'final_frame') return 1;
        if (name === 'initial_clock') return 0;
        if (name === 'initial_frame') return 1;
    }

    parser.error(`Expected float expression, got '${tok.value}'`, tok);
    return 0;
}

function tryComponentOr(parser, index, defaultVal) {
    // x, y, z can be either unit vector components or standalone values
    return defaultVal;
}

function parseParenFloat(parser) {
    parser.expect(T.LEFT_PAREN_TOKEN);
    const val = parseFloat(parser);
    parser.expect(T.RIGHT_PAREN_TOKEN);
    return val;
}

export function parseVector(parser) {
    const tok = parser.scanner.peek();

    // Vector identifier
    if (tok.id === T.VECTOR_ID_TOKEN) {
        parser.scanner.getToken();
        const v = Array.isArray(tok.value) ? tok.value : [0, 0, 0];
        return applyVectorOps(parser, v);
    }

    // Unit vectors — may be followed by * / + - for vector arithmetic
    if (tok.id === T.X_TOKEN) { parser.scanner.getToken(); return applyVectorOps(parser, [1, 0, 0]); }
    if (tok.id === T.Y_TOKEN) { parser.scanner.getToken(); return applyVectorOps(parser, [0, 1, 0]); }
    if (tok.id === T.Z_TOKEN) { parser.scanner.getToken(); return applyVectorOps(parser, [0, 0, 1]); }

    // <x, y, z> literal
    if (tok.id === T.LEFT_ANGLE_TOKEN) {
        parser.scanner.getToken();
        const prevInVector = parser._inVector;
        parser._inVector = true;
        try {
            const x = parseFloat(parser);
            parser.expect(T.COMMA_TOKEN);
            const y = parseFloat(parser);

            // Could be 2D, 3D, 4D, or 5D vector
            if (parser.scanner.peek().id === T.COMMA_TOKEN) {
                parser.scanner.getToken();
                const z = parseFloat(parser);
                if (parser.scanner.peek().id === T.COMMA_TOKEN) {
                    parser.scanner.getToken();
                    const w = parseFloat(parser);
                    if (parser.scanner.peek().id === T.COMMA_TOKEN) {
                        parser.scanner.getToken();
                        const v = parseFloat(parser);
                        parser.expect(T.RIGHT_ANGLE_TOKEN);
                        return [x, y, z, w, v];
                    }
                    parser.expect(T.RIGHT_ANGLE_TOKEN);
                    return applyVectorOps(parser, [x, y, z, w]);
                }
                parser.expect(T.RIGHT_ANGLE_TOKEN);
                return applyVectorOps(parser, [x, y, z]);
            }
            parser.expect(T.RIGHT_ANGLE_TOKEN);
            return applyVectorOps(parser, [x, y, 0]);
        } finally {
            parser._inVector = prevInVector;
        }
    }

    // Scalar promotion: a single float becomes <f, f, f>
    const val = parseFloat(parser);
    return [val, val, val];
}

// Vector functions
// Apply vector arithmetic: vec * scalar, vec / scalar, vec + vec, vec - vec
function applyVectorOps(parser, vec) {
    while (true) {
        const next = parser.scanner.peek();
        if (next.id === T.STAR_TOKEN) {
            parser.scanner.getToken();
            const s = parseFloat(parser);
            vec = [vec[0]*s, vec[1]*s, vec[2]*s];
        } else if (next.id === T.SLASH_TOKEN) {
            parser.scanner.getToken();
            const s = parseFloat(parser);
            if (s !== 0) vec = [vec[0]/s, vec[1]/s, vec[2]/s];
        } else if (next.id === T.PLUS_TOKEN) {
            parser.scanner.getToken();
            const v2 = parseVector(parser);
            vec = [vec[0]+v2[0], vec[1]+v2[1], vec[2]+v2[2]];
        } else if (next.id === T.DASH_TOKEN) {
            parser.scanner.getToken();
            const v2 = parseVector(parser);
            vec = [vec[0]-v2[0], vec[1]-v2[1], vec[2]-v2[2]];
        } else {
            break;
        }
    }
    return vec;
}

export function parseVectorExpression(parser) {
    const tok = parser.scanner.peek();

    if (tok.id === T.VNORMALIZE_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_PAREN_TOKEN);
        const v = parseVector(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        return len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : [0, 0, 0];
    }

    if (tok.id === T.VCROSS_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_PAREN_TOKEN);
        const a = parseVector(parser);
        parser.expect(T.COMMA_TOKEN);
        const b = parseVector(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    }

    if (tok.id === T.VROTATE_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_PAREN_TOKEN);
        const v = parseVector(parser);
        parser.expect(T.COMMA_TOKEN);
        const angles = parseVector(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        // Rotate by XYZ Euler angles (degrees)
        let result = [...v];
        const deg = Math.PI / 180;
        if (angles[0] !== 0) result = rotateVecX(result, angles[0] * deg);
        if (angles[1] !== 0) result = rotateVecY(result, angles[1] * deg);
        if (angles[2] !== 0) result = rotateVecZ(result, angles[2] * deg);
        return result;
    }

    if (tok.id === T.VAXIS_ROTATE_TOKEN) {
        parser.scanner.getToken();
        parser.expect(T.LEFT_PAREN_TOKEN);
        const v = parseVector(parser);
        parser.expect(T.COMMA_TOKEN);
        const axis = parseVector(parser);
        parser.expect(T.COMMA_TOKEN);
        const angle = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        // Rodrigues' rotation formula
        const rad = angle * Math.PI / 180;
        const len = Math.sqrt(axis[0]**2 + axis[1]**2 + axis[2]**2);
        if (len < 1e-10) return v;
        const k = [axis[0]/len, axis[1]/len, axis[2]/len];
        const c = Math.cos(rad), s = Math.sin(rad);
        const dot = v[0]*k[0] + v[1]*k[1] + v[2]*k[2];
        const cross = [k[1]*v[2]-k[2]*v[1], k[2]*v[0]-k[0]*v[2], k[0]*v[1]-k[1]*v[0]];
        return [
            v[0]*c + cross[0]*s + k[0]*dot*(1-c),
            v[1]*c + cross[1]*s + k[1]*dot*(1-c),
            v[2]*c + cross[2]*s + k[2]*dot*(1-c)
        ];
    }

    return parseVector(parser);
}

export function parseColour(parser) {
    const tok = parser.scanner.peek();

    // Colour identifier
    if (tok.id === T.COLOUR_ID_TOKEN) {
        parser.scanner.getToken();
        const color = Array.isArray(tok.value) ? [...tok.value] : [0, 0, 0, 0, 0];
        while (color.length < 5) color.push(0);
        return applyColourModifiers(parser, color);
    }

    // rgb/rgbf/rgbt/rgbft/srgb variants
    if (tok.id === T.RGB_TOKEN || tok.id === T.RGBF_TOKEN || tok.id === T.RGBT_TOKEN ||
        tok.id === T.RGBFT_TOKEN || tok.id === T.SRGB_TOKEN || tok.id === T.SRGBF_TOKEN ||
        tok.id === T.SRGBT_TOKEN || tok.id === T.SRGBFT_TOKEN) {
        const colorType = tok.id;
        parser.scanner.getToken();
        const v = parseVector(parser);

        // Ensure 5-component color
        const color = [v[0] || 0, v[1] || 0, v[2] || 0, 0, 0];

        if (colorType === T.RGBF_TOKEN || colorType === T.SRGBF_TOKEN) {
            color[3] = v[3] || 0; // filter
        } else if (colorType === T.RGBT_TOKEN || colorType === T.SRGBT_TOKEN) {
            color[4] = v[3] || 0; // transmit
        } else if (colorType === T.RGBFT_TOKEN || colorType === T.SRGBFT_TOKEN) {
            color[3] = v[3] || 0;
            color[4] = v[4] || 0;
        }

        // sRGB to linear conversion
        if (colorType === T.SRGB_TOKEN || colorType === T.SRGBF_TOKEN ||
            colorType === T.SRGBT_TOKEN || colorType === T.SRGBFT_TOKEN) {
            for (let i = 0; i < 3; i++) {
                color[i] = srgbToLinear(color[i]);
            }
        }

        // Handle trailing filter/transmit modifiers (e.g., rgb <1,0,0> filter 0.5)
        return applyColourModifiers(parser, color);
    }

    // colour keyword followed by color spec
    if (tok.id === T.COLOUR_TOKEN) {
        parser.scanner.getToken();
        return parseColour(parser);
    }

    // color red X green Y blue Z [filter F] [transmit T] syntax
    if (tok.id === T.RED_TOKEN || tok.id === T.GREEN_TOKEN || tok.id === T.BLUE_TOKEN) {
        const color = [0, 0, 0, 0, 0];
        while (true) {
            const ct = parser.scanner.peek();
            if (ct.id === T.RED_TOKEN) { parser.scanner.getToken(); color[0] = parseFloat(parser); }
            else if (ct.id === T.GREEN_TOKEN) { parser.scanner.getToken(); color[1] = parseFloat(parser); }
            else if (ct.id === T.BLUE_TOKEN) { parser.scanner.getToken(); color[2] = parseFloat(parser); }
            else if (ct.id === T.FILTER_TOKEN) { parser.scanner.getToken(); color[3] = parseFloat(parser); }
            else if (ct.id === T.TRANSMIT_TOKEN) { parser.scanner.getToken(); color[4] = parseFloat(parser); }
            else break;
        }
        return color;
    }

    // Standalone color from vector
    const v = parseVector(parser);
    return [v[0] || 0, v[1] || 0, v[2] || 0, v[3] || 0, v[4] || 0];
}

// Consume optional trailing filter/transmit modifiers after a color specification
function applyColourModifiers(parser, color) {
    while (true) {
        const next = parser.scanner.peek();
        if (next.id === T.FILTER_TOKEN) {
            parser.scanner.getToken();
            color[3] = parseFloat(parser);
        } else if (next.id === T.TRANSMIT_TOKEN) {
            parser.scanner.getToken();
            color[4] = parseFloat(parser);
        } else {
            break;
        }
    }
    return color;
}

function srgbToLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function parseString(parser) {
    const tok = parser.scanner.getToken();
    if (tok.id === T.STRING_LITERAL_TOKEN) return tok.value;
    if (tok.id === T.STRING_ID_TOKEN) return tok.value || '';

    if (tok.id === T.CONCAT_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        let result = parseString(parser);
        while (parser.scanner.peek().id === T.COMMA_TOKEN) {
            parser.scanner.getToken();
            result += parseString(parser);
        }
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return result;
    }

    if (tok.id === T.STR_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const val = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const width = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const precision = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return val.toFixed(Math.max(0, precision));
    }

    if (tok.id === T.CHR_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const code = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return String.fromCharCode(code);
    }

    if (tok.id === T.SUBSTR_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const s = parseString(parser);
        parser.expect(T.COMMA_TOKEN);
        const start = parseFloat(parser);
        parser.expect(T.COMMA_TOKEN);
        const len = parseFloat(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return s.substring(start - 1, start - 1 + len);
    }

    if (tok.id === T.STRLWR_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const s = parseString(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return s.toLowerCase();
    }

    if (tok.id === T.STRUPR_TOKEN) {
        parser.expect(T.LEFT_PAREN_TOKEN);
        const s = parseString(parser);
        parser.expect(T.RIGHT_PAREN_TOKEN);
        return s.toUpperCase();
    }

    parser.error(`Expected string expression, got '${tok.value}'`, tok);
    return '';
}

// Vector rotation helpers
function rotateVecX(v, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c];
}
function rotateVecY(v, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [v[0]*c + v[2]*s, v[1], -v[0]*s + v[2]*c];
}
function rotateVecZ(v, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [v[0]*c - v[1]*s, v[0]*s + v[1]*c, v[2]];
}
