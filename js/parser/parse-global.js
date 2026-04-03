// POV-Ray Web - Global settings, background, atmosphere parser
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import * as T from './reserved-words.js';
import { parseFloat, parseVector, parseColour } from './parse-expressions.js';
import { parsePigment } from './parse-materials.js';

export function parseGlobalSettings(parser, sceneData) {
    parser.scanner.getToken(); // consume 'global_settings'
    parser.expect(T.LEFT_CURLY_TOKEN);

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.getToken();

        switch (tok.id) {
            case T.ADC_BAILOUT_TOKEN:
                sceneData.globalSettings.adcBailout = parseFloat(parser);
                break;
            case T.MAX_TRACE_LEVEL_TOKEN:
                sceneData.globalSettings.maxTraceLevel = parseFloat(parser);
                break;
            case T.ASSUMED_GAMMA_TOKEN:
                sceneData.globalSettings.assumedGamma = parseFloat(parser);
                break;
            case T.AMBIENT_LIGHT_TOKEN:
                sceneData.globalSettings.ambientLight = parseColour(parser).slice(0, 3);
                break;
            case T.NOISE_GENERATOR_TOKEN:
                sceneData.globalSettings.noiseGenerator = parseFloat(parser);
                break;
            case T.IRID_WAVELENGTH_TOKEN:
                sceneData.globalSettings.iridWavelength = parseColour(parser).slice(0, 3);
                break;
            case T.CHARSET_TOKEN:
                const charsetTok = parser.scanner.getToken();
                sceneData.globalSettings.charset = charsetTok.value;
                break;
            case T.NUMBER_OF_WAVES_TOKEN:
                sceneData.globalSettings.numberOfWaves = parseFloat(parser);
                break;
            case T.MM_PER_UNIT_TOKEN:
                sceneData.globalSettings.mmPerUnit = parseFloat(parser);
                break;
            case T.RADIOSITY_TOKEN:
                parser.expect(T.LEFT_CURLY_TOKEN);
                sceneData.globalSettings.radiositySettings = parseRadiosity(parser);
                parser.expect(T.RIGHT_CURLY_TOKEN);
                break;
            case T.PHOTONS_TOKEN:
                parser.expect(T.LEFT_CURLY_TOKEN);
                parser.skipBlock(); // TODO
                break;
            case T.SUBSURFACE_TOKEN:
                parser.expect(T.LEFT_CURLY_TOKEN);
                parser.skipBlock(); // TODO
                break;
            default:
                parser.scanner.ungetToken();
                parser.expect(T.RIGHT_CURLY_TOKEN);
                return;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
}

function parseRadiosity(parser) {
    const settings = {
        count: 35,
        nearestCount: 5,
        errorBound: 1.8,
        recursionLimit: 3,
        lowErrorFactor: 0.5,
        grayThreshold: 0.0,
        minimumReuse: 0.015,
        maximumReuse: 0.2,
        brightness: 1.0,
        pretraceStart: 0.08,
        pretraceEnd: 0.04,
        alwaysSample: false,
        normal: false
    };

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN) {
        const tok = parser.scanner.getToken();
        switch (tok.id) {
            case T.COUNT_TOKEN: settings.count = parseFloat(parser); break;
            case T.NEAREST_COUNT_TOKEN: settings.nearestCount = parseFloat(parser); break;
            case T.ERROR_BOUND_TOKEN: settings.errorBound = parseFloat(parser); break;
            case T.RECURSION_LIMIT_TOKEN: settings.recursionLimit = parseFloat(parser); break;
            case T.LOW_ERROR_FACTOR_TOKEN: settings.lowErrorFactor = parseFloat(parser); break;
            case T.GRAY_THRESHOLD_TOKEN: settings.grayThreshold = parseFloat(parser); break;
            case T.MINIMUM_REUSE_TOKEN: settings.minimumReuse = parseFloat(parser); break;
            case T.MAXIMUM_REUSE_TOKEN: settings.maximumReuse = parseFloat(parser); break;
            case T.BRIGHTNESS_TOKEN: settings.brightness = parseFloat(parser); break;
            case T.PRETRACE_START_TOKEN: settings.pretraceStart = parseFloat(parser); break;
            case T.PRETRACE_END_TOKEN: settings.pretraceEnd = parseFloat(parser); break;
            case T.ALWAYS_SAMPLE_TOKEN: settings.alwaysSample = parseFloat(parser) !== 0; break;
            case T.NORMAL_TOKEN: settings.normal = parseFloat(parser) !== 0; break;
            default:
                parser.scanner.ungetToken();
                return settings;
        }
    }

    return settings;
}

export function parseBackground(parser, sceneData) {
    parser.scanner.getToken(); // consume 'background'
    parser.expect(T.LEFT_CURLY_TOKEN);
    sceneData.background = parseColour(parser);
    parser.expect(T.RIGHT_CURLY_TOKEN);
}

export function parseFog(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    const fog = {
        type: 1,
        distance: 0,
        colour: [0.5, 0.5, 0.5, 0, 0],
        turbulence: 0,
        turbDepth: 0.5,
        omega: 0.5,
        lambda: 2.0,
        octaves: 6,
        fogOffset: 0,
        fogAlt: 0,
        up: [0, 1, 0]
    };

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN) {
        const tok = parser.scanner.getToken();
        switch (tok.id) {
            case T.FOG_TYPE_TOKEN: fog.type = parseFloat(parser); break;
            case T.DISTANCE_TOKEN: fog.distance = parseFloat(parser); break;
            case T.COLOUR_TOKEN: fog.colour = parseColour(parser); break;
            case T.TURBULENCE_TOKEN: fog.turbulence = parseFloat(parser); break;
            case T.TURB_DEPTH_TOKEN: fog.turbDepth = parseFloat(parser); break;
            case T.OMEGA_TOKEN: fog.omega = parseFloat(parser); break;
            case T.LAMBDA_TOKEN: fog.lambda = parseFloat(parser); break;
            case T.OCTAVES_TOKEN: fog.octaves = parseFloat(parser); break;
            case T.FOG_OFFSET_TOKEN: fog.fogOffset = parseFloat(parser); break;
            case T.FOG_ALT_TOKEN: fog.fogAlt = parseFloat(parser); break;
            case T.UP_TOKEN: fog.up = parseVector(parser); break;
            case T.ROTATE_TOKEN:
            case T.TRANSLATE_TOKEN:
            case T.SCALE_TOKEN:
                parseVector(parser);
                break;
            default:
                parser.scanner.ungetToken();
                parser.expect(T.RIGHT_CURLY_TOKEN);
                return fog;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return fog;
}

export function parseSkysphere(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    const skysphere = { pigments: [] };

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN) {
        const tok = parser.scanner.peek();
        if (tok.id === T.PIGMENT_TOKEN) {
            skysphere.pigments.push(parsePigment(parser));
        } else if (tok.id === T.EMISSION_TOKEN) {
            parser.scanner.getToken();
            skysphere.emission = parseColour(parser);
        } else if (tok.id === T.TRANSLATE_TOKEN || tok.id === T.ROTATE_TOKEN || tok.id === T.SCALE_TOKEN) {
            parser.scanner.getToken();
            parseVector(parser);
        } else {
            break;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return skysphere;
}
