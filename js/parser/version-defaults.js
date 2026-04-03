// POV-Ray Web - Version-specific default values
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
//
// POV-Ray version differences:
// v3.5: noise generator = range-corrected (was original)
// v3.7: assumed_gamma forced 1.0, ambient→emission migration
// v3.8: default pigment white (was black), default ambient 0.0 (was 0.1)

export function initDefaults(version, sceneData) {
    // Noise generator
    if (version < 3.5) {
        sceneData.globalSettings.noiseGenerator = 1; // original
    } else {
        sceneData.globalSettings.noiseGenerator = 2; // range-corrected
    }

    // v3.7+: gamma handling changes
    if (version >= 3.7) {
        sceneData.globalSettings.assumedGamma = 1.0;
    }

    // v3.8+: default pigment and ambient changes
    if (version >= 3.8) {
        sceneData._defaultPigmentWhite = true;
        sceneData._defaultAmbient = 0.0;
        sceneData.globalSettings.charset = 'utf8';
    } else {
        sceneData._defaultPigmentWhite = false;
        sceneData._defaultAmbient = 0.1;
    }
}

export function getDefaultFinish(version) {
    const amb = version >= 3.8 ? 0.0 : 0.1;
    return {
        diffuse: 0.6,
        brilliance: 1.0,
        specular: 0.0,
        roughness: 0.05,
        phong: 0.0,
        phongSize: 40.0,
        metallic: 0.0,
        crand: 0.0,
        ambient: [amb, amb, amb],
        emission: [0, 0, 0],
        reflection: { min: [0, 0, 0], max: [0, 0, 0], falloff: 1, fresnel: false, metallic: 0 },
        irid: { amount: 0, filmThickness: 0, turbulence: 0 },
        conserveEnergy: false
    };
}

export function getDefaultPigmentColor(version) {
    // v3.8+: default pigment is white; pre-v3.8: black
    return version >= 3.8 ? [1, 1, 1, 0, 0] : [0, 0, 0, 0, 0];
}

export function getDefaultCamera(version) {
    const aspectRight = 1.333;
    return {
        type: 'perspective',
        location: [0, 0, 0],
        direction: [0, 0, 1],
        up: [0, 1, 0],
        right: [aspectRight, 0, 0],
        sky: [0, 1, 0],
        lookAt: null,
        angle: 0,
        focalPoint: null,
        aperture: 0,
        blurSamples: 0,
        confidence: 0.9,
        variance: 1 / 128
    };
}
