// POV-Ray Web - Light source parser
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import * as T from './reserved-words.js';
import { parseFloat, parseVector, parseColour } from './parse-expressions.js';

export function parseLightSource(parser) {
    parser.scanner.getToken(); // consume 'light_source'
    parser.expect(T.LEFT_CURLY_TOKEN);

    const location = parseVector(parser);
    // Comma between location and color is optional in POV-Ray
    if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
    const color = parseColour(parser);

    const light = {
        type: 'point',
        location,
        color: color.slice(0, 3),
        spotlight: false,
        pointAt: [0, 0, 0],
        radius: 30,
        falloff: 45,
        tightness: 0,
        areaLight: null,
        parallel: false,
        shadowless: false,
        mediaAttenuation: false,
        mediaInteraction: true,
        looksLike: null,
        projectedThrough: null
    };

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.getToken();

        switch (tok.id) {
            case T.SPOTLIGHT_TOKEN:
                light.type = 'spotlight';
                light.spotlight = true;
                break;
            case T.CYLINDRICAL_TOKEN:
                light.type = 'cylinder';
                break;
            case T.PARALLEL_TOKEN:
                light.parallel = true;
                break;
            case T.POINT_AT_TOKEN:
                light.pointAt = parseVector(parser);
                break;
            case T.RADIUS_TOKEN:
                light.radius = parseFloat(parser);
                break;
            case T.FALLOFF_TOKEN:
                light.falloff = parseFloat(parser);
                break;
            case T.TIGHTNESS_TOKEN:
                light.tightness = parseFloat(parser);
                break;
            case T.AREA_LIGHT_TOKEN: {
                const axis1 = parseVector(parser);
                parser.expect(T.COMMA_TOKEN);
                const axis2 = parseVector(parser);
                parser.expect(T.COMMA_TOKEN);
                const size1 = parseFloat(parser);
                parser.expect(T.COMMA_TOKEN);
                const size2 = parseFloat(parser);
                light.areaLight = { axis1, axis2, size1, size2, adaptive: 0, jitter: false, circular: false, orient: false };
                break;
            }
            case T.ADAPTIVE_TOKEN:
                if (light.areaLight) light.areaLight.adaptive = parseFloat(parser);
                break;
            case T.JITTER_TOKEN:
                if (light.areaLight) light.areaLight.jitter = true;
                break;
            case T.CIRCULAR_TOKEN:
                if (light.areaLight) light.areaLight.circular = true;
                break;
            case T.ORIENT_TOKEN:
                if (light.areaLight) light.areaLight.orient = true;
                break;
            case T.AREA_ILLUMINATION_TOKEN:
                light.areaIllumination = true;
                const next = parser.scanner.peek();
                if (next.id === T.ON_TOKEN || next.id === T.OFF_TOKEN ||
                    next.id === T.TRUE_TOKEN || next.id === T.FALSE_TOKEN) {
                    light.areaIllumination = parseFloat(parser) !== 0;
                }
                break;
            case T.SHADOWLESS_TOKEN:
                light.shadowless = true;
                break;
            case T.MEDIA_ATTENUATION_TOKEN:
                light.mediaAttenuation = true;
                const maNext = parser.scanner.peek();
                if (maNext.id === T.ON_TOKEN || maNext.id === T.OFF_TOKEN) {
                    light.mediaAttenuation = parseFloat(parser) !== 0;
                }
                break;
            case T.MEDIA_INTERACTION_TOKEN:
                light.mediaInteraction = true;
                const miNext = parser.scanner.peek();
                if (miNext.id === T.ON_TOKEN || miNext.id === T.OFF_TOKEN) {
                    light.mediaInteraction = parseFloat(parser) !== 0;
                }
                break;
            case T.LOOKS_LIKE_TOKEN: {
                parser.expect(T.LEFT_CURLY_TOKEN);
                parser.skipBlock(); // TODO: parse looks_like object
                break;
            }
            case T.PROJECTED_THROUGH_TOKEN: {
                parser.expect(T.LEFT_CURLY_TOKEN);
                parser.skipBlock();
                break;
            }
            case T.PHOTONS_TOKEN: {
                parser.expect(T.LEFT_CURLY_TOKEN);
                parser.skipBlock();
                break;
            }
            case T.TRANSLATE_TOKEN: {
                const v = parseVector(parser);
                light.location[0] += v[0];
                light.location[1] += v[1];
                light.location[2] += v[2];
                break;
            }
            case T.ROTATE_TOKEN:
            case T.SCALE_TOKEN:
            case T.MATRIX_TOKEN:
                parseVector(parser); // TODO: proper transform
                break;
            case T.FADE_DISTANCE_TOKEN:
                light.fadeDistance = parseFloat(parser);
                break;
            case T.FADE_POWER_TOKEN:
                light.fadePower = parseFloat(parser);
                break;
            default:
                parser.scanner.ungetToken();
                return light;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return light;
}
