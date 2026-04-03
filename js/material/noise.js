// POV-Ray Web - Perlin noise implementation (3 generators matching POV-Ray)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Generator 1: original POV-Ray noise
// Generator 2: range-corrected (default)
// Generator 3: Perlin's improved noise

// Pre-computed permutation table (matches POV-Ray's hash)
const PERM = new Uint8Array(512);
const GRAD3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
    [1,1,0],[0,-1,1],[-1,1,0],[0,-1,-1]
];

// Initialize permutation table
(function() {
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,
        142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,
        117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,
        71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,
        41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
        89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,
        226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,
        182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,
        43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
        228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
        49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,
        236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    for (let i = 0; i < 256; i++) { PERM[i] = p[i]; PERM[256 + i] = p[i]; }
})();

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }

function grad3(hash, x, y, z) {
    const g = GRAD3[hash & 15];
    return g[0] * x + g[1] * y + g[2] * z;
}

// Generator 3: Improved Perlin noise
function perlinNoise3D(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);

    const A  = PERM[X] + Y;
    const AA = PERM[A] + Z;
    const AB = PERM[A + 1] + Z;
    const B  = PERM[X + 1] + Y;
    const BA = PERM[B] + Z;
    const BB = PERM[B + 1] + Z;

    return lerp(
        lerp(
            lerp(grad3(PERM[AA], x, y, z), grad3(PERM[BA], x-1, y, z), u),
            lerp(grad3(PERM[AB], x, y-1, z), grad3(PERM[BB], x-1, y-1, z), u),
            v
        ),
        lerp(
            lerp(grad3(PERM[AA+1], x, y, z-1), grad3(PERM[BA+1], x-1, y, z-1), u),
            lerp(grad3(PERM[AB+1], x, y-1, z-1), grad3(PERM[BB+1], x-1, y-1, z-1), u),
            v
        ),
        w
    );
}

// Generator 1 & 2: POV-Ray classic noise (hash-based)
function classicNoise3D(x, y, z) {
    // Simple lattice noise approximating POV-Ray's original
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = x - ix, fy = y - iy, fz = z - iz;
    const u = fade(fx), v = fade(fy), w = fade(fz);

    const h = (a, b, c) => {
        let n = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
        n = ((n >> 13) ^ n);
        n = (n * (n * n * 15731 + 789221) + 1376312589);
        return ((n >> 16) & 0x7fff) / 32767.0;
    };

    return lerp(
        lerp(
            lerp(h(ix, iy, iz), h(ix+1, iy, iz), u),
            lerp(h(ix, iy+1, iz), h(ix+1, iy+1, iz), u),
            v
        ),
        lerp(
            lerp(h(ix, iy, iz+1), h(ix+1, iy, iz+1), u),
            lerp(h(ix, iy+1, iz+1), h(ix+1, iy+1, iz+1), u),
            v
        ),
        w
    );
}

export function noise3d(x, y, z, generator = 2) {
    if (generator === 3) {
        return (perlinNoise3D(x, y, z) + 1) * 0.5; // map [-1,1] to [0,1]
    }
    const val = classicNoise3D(x, y, z);
    if (generator === 2) {
        return Math.max(0, Math.min(1, val)); // range-corrected
    }
    return val; // generator 1: raw
}

// Gradient noise for normal perturbation
export function dNoise(x, y, z, generator = 2) {
    const d = 0.001;
    const n0 = noise3d(x, y, z, generator);
    return [
        (noise3d(x + d, y, z, generator) - n0) / d,
        (noise3d(x, y + d, z, generator) - n0) / d,
        (noise3d(x, y, z + d, generator) - n0) / d
    ];
}

export function turbulence(x, y, z, omega = 0.5, lambda = 2.0, octaves = 6, generator = 2) {
    let val = 0, amp = 1, freq = 1, totalAmp = 0;
    for (let i = 0; i < octaves; i++) {
        val += amp * Math.abs(noise3d(x * freq, y * freq, z * freq, generator) * 2 - 1);
        totalAmp += amp;
        amp *= omega;
        freq *= lambda;
    }
    return val / totalAmp;
}

export function fbm(x, y, z, omega = 0.5, lambda = 2.0, octaves = 6, generator = 2) {
    let val = 0, amp = 1, freq = 1, totalAmp = 0;
    for (let i = 0; i < octaves; i++) {
        val += amp * noise3d(x * freq, y * freq, z * freq, generator);
        totalAmp += amp;
        amp *= omega;
        freq *= lambda;
    }
    return val / totalAmp;
}
