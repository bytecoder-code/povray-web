// POV-Ray Web - Material parser (texture/pigment/normal/finish)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import * as T from './reserved-words.js';
import { parseFloat, parseVector, parseColour } from './parse-expressions.js';
import { createDefaultFinish } from '../scene/scene-data.js';

export function parseTexture(parser) {
    parser.scanner.getToken(); // consume 'texture'
    parser.expect(T.LEFT_CURLY_TOKEN);

    const texture = { pigment: null, normal: null, finish: null, transform: null };

    // Check for texture identifier
    const peek = parser.scanner.peek();
    if (peek.id === T.TEXTURE_ID_TOKEN) {
        parser.scanner.getToken();
        Object.assign(texture, JSON.parse(JSON.stringify(peek.value)));
    }

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.peek();
        if (tok.id === T.PIGMENT_TOKEN) {
            texture.pigment = parsePigment(parser);
        } else if (tok.id === T.NORMAL_TOKEN) {
            texture.normal = parseNormal(parser);
        } else if (tok.id === T.FINISH_TOKEN) {
            texture.finish = parseFinish(parser);
        } else if (tok.id === T.TRANSLATE_TOKEN || tok.id === T.ROTATE_TOKEN || tok.id === T.SCALE_TOKEN) {
            // Texture-level transforms (skip for now, apply to pattern evaluation)
            parser.scanner.getToken();
            parseVector(parser);
        } else {
            break;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return texture;
}

export function parsePigment(parser) {
    parser.scanner.getToken(); // consume 'pigment'
    parser.expect(T.LEFT_CURLY_TOKEN);

    const pigment = { type: 'solid', color: [1, 1, 1, 0, 0] };

    // Check for pigment identifier
    const peek = parser.scanner.peek();
    if (peek.id === T.PIGMENT_ID_TOKEN) {
        parser.scanner.getToken();
        Object.assign(pigment, JSON.parse(JSON.stringify(peek.value)));
    }

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.peek();

        // Color specification
        if (tok.id === T.COLOUR_TOKEN || tok.id === T.RGB_TOKEN || tok.id === T.RGBF_TOKEN ||
            tok.id === T.RGBT_TOKEN || tok.id === T.RGBFT_TOKEN || tok.id === T.SRGB_TOKEN ||
            tok.id === T.SRGBF_TOKEN || tok.id === T.SRGBT_TOKEN || tok.id === T.SRGBFT_TOKEN ||
            tok.id === T.COLOUR_ID_TOKEN) {
            pigment.type = 'solid';
            pigment.color = parseColour(parser);
        }
        // Pattern types
        else if (tok.id === T.CHECKER_TOKEN) {
            parser.scanner.getToken();
            pigment.type = 'checker';
            pigment.colors = [parseColour(parser)];
            if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            pigment.colors.push(parseColour(parser));
        }
        else if (tok.id === T.BOZO_TOKEN || tok.id === T.GRANITE_TOKEN || tok.id === T.MARBLE_TOKEN ||
                 tok.id === T.WOOD_TOKEN || tok.id === T.AGATE_TOKEN || tok.id === T.SPOTTED_TOKEN ||
                 tok.id === T.GRADIENT_TOKEN || tok.id === T.RADIAL_TOKEN || tok.id === T.LEOPARD_TOKEN ||
                 tok.id === T.ONION_TOKEN || tok.id === T.CRACKLE_TOKEN || tok.id === T.CELLS_TOKEN ||
                 tok.id === T.RIPPLES_TOKEN || tok.id === T.WAVES_TOKEN || tok.id === T.BUMPS_TOKEN ||
                 tok.id === T.DENTS_TOKEN || tok.id === T.WRINKLES_TOKEN || tok.id === T.SPIRAL1_TOKEN ||
                 tok.id === T.SPIRAL2_TOKEN || tok.id === T.HEXAGON_TOKEN || tok.id === T.BRICK_TOKEN ||
                 tok.id === T.BOXED_TOKEN || tok.id === T.CYLINDRICAL_TOKEN || tok.id === T.SPHERICAL_TOKEN ||
                 tok.id === T.PLANAR_TOKEN) {
            parser.scanner.getToken();
            pigment.type = 'pattern';
            pigment.patternType = tok.value;
            if (tok.id === T.GRADIENT_TOKEN) {
                pigment.gradientAxis = parseVector(parser);
            }
        }
        // Color map
        else if (tok.id === T.COLOUR_MAP_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            // Check for colour_map identifier reference: color_map { MapName }
            const cmPeek = parser.scanner.peek();
            if (cmPeek.id === T.COLOUR_MAP_ID_TOKEN) {
                parser.scanner.getToken();
                pigment.colorMap = Array.isArray(cmPeek.value) ? cmPeek.value : [];
            } else if (cmPeek.id === T.IDENTIFIER_TOKEN) {
                // Unknown identifier — skip it, use empty map
                parser.scanner.getToken();
                pigment.colorMap = [];
            } else {
                pigment.colorMap = [];
                while (parser.scanner.peek().id === T.LEFT_SQUARE_TOKEN) {
                    parser.scanner.getToken();
                    const val = parseFloat(parser);
                    const color = parseColour(parser);
                    parser.expect(T.RIGHT_SQUARE_TOKEN);
                    pigment.colorMap.push([val, color]);
                }
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        }
        // Frequency, phase, turbulence
        else if (tok.id === T.FREQUENCY_TOKEN) {
            parser.scanner.getToken();
            pigment.frequency = parseFloat(parser);
        }
        else if (tok.id === T.PHASE_TOKEN) {
            parser.scanner.getToken();
            pigment.phase = parseFloat(parser);
        }
        else if (tok.id === T.TURBULENCE_TOKEN) {
            parser.scanner.getToken();
            pigment.turbulence = parseVector(parser);
        }
        else if (tok.id === T.OCTAVES_TOKEN) {
            parser.scanner.getToken();
            pigment.octaves = parseFloat(parser);
        }
        else if (tok.id === T.LAMBDA_TOKEN) {
            parser.scanner.getToken();
            pigment.lambda = parseFloat(parser);
        }
        else if (tok.id === T.OMEGA_TOKEN) {
            parser.scanner.getToken();
            pigment.omega = parseFloat(parser);
        }
        else if (tok.id === T.TRANSLATE_TOKEN || tok.id === T.ROTATE_TOKEN || tok.id === T.SCALE_TOKEN) {
            parser.scanner.getToken();
            parseVector(parser); // TODO: apply to pigment transform
        }
        else if (tok.id === T.WARP_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            parser.skipBlock();
        }
        // Quick color
        else if (tok.id === T.QUICK_COLOUR_TOKEN) {
            parser.scanner.getToken();
            parseColour(parser); // discard
        }
        else if (tok.id === T.IMAGE_MAP_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            pigment.type = 'image_map';
            // Read image type and filename
            const imgTypeTok = parser.scanner.getToken();
            pigment.imageType = imgTypeTok.value;
            pigment.imageFile = parseString(parser);
            // Read modifiers
            while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN) {
                const mod = parser.scanner.getToken();
                if (mod.id === T.MAP_TYPE_TOKEN) pigment.mapType = parseFloat(parser);
                else if (mod.id === T.INTERPOLATE_TOKEN) pigment.interpolate = parseFloat(parser);
                else if (mod.id === T.ONCE_TOKEN) pigment.once = true;
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        }
        else {
            break;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return pigment;
}

function parseString(parser) {
    const tok = parser.scanner.getToken();
    return tok.value || '';
}

export function parseNormal(parser) {
    parser.scanner.getToken(); // consume 'normal'
    parser.expect(T.LEFT_CURLY_TOKEN);

    const normal = { type: 'none', bumpSize: 1.0 };

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.peek();
        if (tok.id === T.BUMPS_TOKEN || tok.id === T.DENTS_TOKEN || tok.id === T.GRANITE_TOKEN ||
            tok.id === T.RIPPLES_TOKEN || tok.id === T.WAVES_TOKEN || tok.id === T.WRINKLES_TOKEN ||
            tok.id === T.BOZO_TOKEN || tok.id === T.MARBLE_TOKEN || tok.id === T.AGATE_TOKEN) {
            parser.scanner.getToken();
            normal.type = tok.value;
            // Check for bump size
            const next = parser.scanner.peek();
            if (next.id === T.FLOAT_TOKEN || next.id === T.FLOAT_ID_TOKEN || next.id === T.DASH_TOKEN) {
                normal.bumpSize = parseFloat(parser);
            }
        } else if (tok.id === T.BUMP_SIZE_TOKEN) {
            parser.scanner.getToken();
            normal.bumpSize = parseFloat(parser);
        } else if (tok.id === T.BUMP_MAP_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            normal.type = 'bump_map';
            parser.skipBlock();
        } else if (tok.id === T.TURBULENCE_TOKEN) {
            parser.scanner.getToken();
            normal.turbulence = parseVector(parser);
        } else if (tok.id === T.FREQUENCY_TOKEN) {
            parser.scanner.getToken();
            normal.frequency = parseFloat(parser);
        } else if (tok.id === T.PHASE_TOKEN) {
            parser.scanner.getToken();
            normal.phase = parseFloat(parser);
        } else if (tok.id === T.TRANSLATE_TOKEN || tok.id === T.ROTATE_TOKEN || tok.id === T.SCALE_TOKEN) {
            parser.scanner.getToken();
            parseVector(parser);
        } else {
            break;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return normal;
}

export function parseFinish(parser) {
    parser.scanner.getToken(); // consume 'finish'
    parser.expect(T.LEFT_CURLY_TOKEN);

    const finish = createDefaultFinish();

    // Check for finish identifier
    if (parser.scanner.peek().id === T.FINISH_ID_TOKEN) {
        const tok = parser.scanner.getToken();
        Object.assign(finish, JSON.parse(JSON.stringify(tok.value)));
    }

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.getToken();

        if (tok.id === T.AMBIENT_TOKEN) {
            const val = parseColourOrFloat(parser);
            finish.ambient = typeof val === 'number' ? [val, val, val] : val.slice(0, 3);
        } else if (tok.id === T.DIFFUSE_TOKEN) {
            if (parser.scanner.peek().id === T.ALBEDO_TOKEN) {
                parser.scanner.getToken();
            }
            finish.diffuse = parseFloat(parser);
        } else if (tok.id === T.BRILLIANCE_TOKEN) {
            finish.brilliance = parseFloat(parser);
        } else if (tok.id === T.SPECULAR_TOKEN) {
            if (parser.scanner.peek().id === T.ALBEDO_TOKEN) {
                parser.scanner.getToken();
            }
            finish.specular = parseFloat(parser);
        } else if (tok.id === T.ROUGHNESS_TOKEN) {
            finish.roughness = parseFloat(parser);
        } else if (tok.id === T.PHONG_TOKEN) {
            if (parser.scanner.peek().id === T.ALBEDO_TOKEN) {
                parser.scanner.getToken();
            }
            finish.phong = parseFloat(parser);
        } else if (tok.id === T.PHONG_SIZE_TOKEN) {
            finish.phongSize = parseFloat(parser);
        } else if (tok.id === T.METALLIC_TOKEN) {
            const next = parser.scanner.peek();
            if (next.id === T.FLOAT_TOKEN || next.id === T.FLOAT_ID_TOKEN) {
                finish.metallic = parseFloat(parser);
            } else {
                finish.metallic = 1.0;
            }
        } else if (tok.id === T.EMISSION_TOKEN) {
            const val = parseColourOrFloat(parser);
            finish.emission = typeof val === 'number' ? [val, val, val] : val.slice(0, 3);
        } else if (tok.id === T.CRAND_TOKEN) {
            finish.crand = parseFloat(parser);
        } else if (tok.id === T.REFLECTION_TOKEN) {
            const next = parser.scanner.peek();
            if (next.id === T.LEFT_CURLY_TOKEN) {
                parser.scanner.getToken();
                const minColor = parseColourOrFloat(parser);
                finish.reflection.min = typeof minColor === 'number' ? [minColor, minColor, minColor] : minColor.slice(0, 3);
                if (parser.scanner.peek().id === T.COMMA_TOKEN) {
                    parser.scanner.getToken();
                    const maxColor = parseColourOrFloat(parser);
                    finish.reflection.max = typeof maxColor === 'number' ? [maxColor, maxColor, maxColor] : maxColor.slice(0, 3);
                } else {
                    finish.reflection.max = [...finish.reflection.min];
                }
                // Modifiers inside reflection block
                while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN) {
                    const mod = parser.scanner.getToken();
                    if (mod.id === T.FRESNEL_TOKEN) finish.reflection.fresnel = true;
                    else if (mod.id === T.METALLIC_TOKEN) finish.reflection.metallic = parseFloat(parser);
                    else if (mod.id === T.FALLOFF_TOKEN) finish.reflection.falloff = parseFloat(parser);
                }
                parser.expect(T.RIGHT_CURLY_TOKEN);
            } else {
                const val = parseColourOrFloat(parser);
                const c = typeof val === 'number' ? [val, val, val] : val.slice(0, 3);
                finish.reflection.min = c;
                finish.reflection.max = [...c];
            }
        } else if (tok.id === T.IRID_TOKEN) {
            parser.expect(T.LEFT_CURLY_TOKEN);
            finish.irid.amount = parseFloat(parser);
            while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN) {
                const mod = parser.scanner.getToken();
                if (mod.id === T.THICKNESS_TOKEN) finish.irid.filmThickness = parseFloat(parser);
                else if (mod.id === T.TURBULENCE_TOKEN) finish.irid.turbulence = parseFloat(parser);
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.CONSERVE_ENERGY_TOKEN) {
            finish.conserveEnergy = true;
        } else if (tok.id === T.FRESNEL_TOKEN) {
            const next = parser.scanner.peek();
            if (next.id === T.FLOAT_TOKEN || next.id === T.FLOAT_ID_TOKEN ||
                next.id === T.TRUE_TOKEN || next.id === T.ON_TOKEN) {
                const val = parseFloat(parser);
                finish.fresnel = val;
            } else {
                finish.fresnel = 1;
            }
        } else {
            // Unknown modifier, put it back
            parser.scanner.ungetToken();
            break;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return finish;
}

function parseColourOrFloat(parser) {
    const tok = parser.scanner.peek();
    if (tok.id === T.RGB_TOKEN || tok.id === T.RGBF_TOKEN || tok.id === T.RGBT_TOKEN ||
        tok.id === T.RGBFT_TOKEN || tok.id === T.COLOUR_TOKEN || tok.id === T.COLOUR_ID_TOKEN ||
        tok.id === T.SRGB_TOKEN) {
        return parseColour(parser);
    }
    return parseFloat(parser);
}
