// POV-Ray Web - Central scene data container
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export function createSceneData() {
    return {
        objects: [],
        lightSources: [],
        camera: createDefaultCamera(),
        globalSettings: {
            adcBailout: 1 / 255,
            maxTraceLevel: 5,
            ambientLight: [1, 1, 1],
            assumedGamma: 1.0,
            noiseGenerator: 2,
            numberOfWaves: 10,
            iridWavelength: [0.25, 0.18, 0.14],
            charset: 'ascii',
            radiositySettings: null,
            photonSettings: null,
            subsurfaceLight: null,
            mmPerUnit: 10
        },
        background: [0, 0, 0, 0, 0],
        fog: null,
        rainbow: null,
        skysphere: null,
        atmosphere: [],
        languageVersion: 3.8
    };
}

export function createDefaultCamera() {
    return {
        type: 'perspective',
        location: [0, 0, 0],
        direction: [0, 0, 1],
        up: [0, 1, 0],
        right: [1.33333, 0, 0],
        sky: [0, 1, 0],
        lookAt: null,
        angle: 0, // 0 means compute from direction length
        focalPoint: null,
        aperture: 0,
        blurSamples: 0,
        confidence: 0.9,
        variance: 1 / 128
    };
}

export function createDefaultFinish() {
    return {
        diffuse: 0.6,
        brilliance: 1.0,
        specular: 0.0,
        roughness: 0.05,
        phong: 0.0,
        phongSize: 40.0,
        metallic: 0.0,
        crand: 0.0,
        ambient: [0.1, 0.1, 0.1],
        emission: [0, 0, 0],
        reflection: { min: [0, 0, 0], max: [0, 0, 0], falloff: 1, fresnel: false, metallic: 0 },
        irid: { amount: 0, filmThickness: 0, turbulence: 0 },
        conserveEnergy: false
    };
}

export function createDefaultTexture() {
    return {
        pigment: { type: 'solid', color: [1, 1, 1, 0, 0] },
        normal: null,
        finish: createDefaultFinish(),
        transform: null
    };
}
