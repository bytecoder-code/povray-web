// POV-Ray Web - Height field intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Uses a grid of heights, interpolated bilinearly
// Default bounding box is <0,0,0> to <1,1,1>

import { vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';

export function createHeightfield(heights, width, depth) {
    return {
        shapeType: 'heightfield',
        heights,
        gridW: width,
        gridD: depth,
        maxHeight: findMax(heights)
    };
}

function findMax(arr) {
    let max = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

export function intersectHeightfield(ray, hf) {
    // March through the grid
    // Heightfield occupies <0,0,0> to <1, maxHeight, 1>
    const ox = ray.origin[0], oy = ray.origin[1], oz = ray.origin[2];
    const dx = ray.direction[0], dy = ray.direction[1], dz = ray.direction[2];

    // Find entry/exit with bounding box
    let tMin = 0, tMax = 100;
    for (let i = 0; i < 3; i++) {
        const bmin = [0, 0, 0][i];
        const bmax = [1, hf.maxHeight, 1][i];
        if (Math.abs(ray.direction[i]) < 1e-12) {
            if (ray.origin[i] < bmin || ray.origin[i] > bmax) return null;
        } else {
            const invD = 1 / ray.direction[i];
            let t1 = (bmin - ray.origin[i]) * invD;
            let t2 = (bmax - ray.origin[i]) * invD;
            if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
            tMin = Math.max(tMin, t1);
            tMax = Math.min(tMax, t2);
            if (tMin > tMax) return null;
        }
    }

    // Step through at grid resolution
    const steps = Math.max(hf.gridW, hf.gridD) * 2;
    const dt = (tMax - tMin) / steps;

    let prevY = null;
    for (let i = 0; i <= steps; i++) {
        const t = tMin + i * dt;
        const px = ox + dx * t;
        const py = oy + dy * t;
        const pz = oz + dz * t;

        if (px < 0 || px > 1 || pz < 0 || pz > 1) continue;

        const gx = px * (hf.gridW - 1);
        const gz = pz * (hf.gridD - 1);
        const ix = Math.min(Math.floor(gx), hf.gridW - 2);
        const iz = Math.min(Math.floor(gz), hf.gridD - 2);
        const fx = gx - ix, fz = gz - iz;

        // Bilinear interpolation
        const h00 = hf.heights[iz * hf.gridW + ix];
        const h10 = hf.heights[iz * hf.gridW + ix + 1];
        const h01 = hf.heights[(iz + 1) * hf.gridW + ix];
        const h11 = hf.heights[(iz + 1) * hf.gridW + ix + 1];
        const h = h00 * (1-fx) * (1-fz) + h10 * fx * (1-fz) + h01 * (1-fx) * fz + h11 * fx * fz;

        if (prevY !== null && prevY > h && py <= h) {
            // Crossed the surface — bisect for precision
            let tLo = tMin + (i - 1) * dt, tHi = t;
            for (let j = 0; j < 10; j++) {
                const tm = (tLo + tHi) * 0.5;
                const mx = ox + dx * tm, my = oy + dy * tm, mz = oz + dz * tm;
                const mgx = mx * (hf.gridW - 1), mgz = mz * (hf.gridD - 1);
                const mix = Math.min(Math.floor(mgx), hf.gridW - 2);
                const miz = Math.min(Math.floor(mgz), hf.gridD - 2);
                const mfx = mgx - mix, mfz = mgz - miz;
                const mh = hf.heights[miz*hf.gridW+mix]*(1-mfx)*(1-mfz) + hf.heights[miz*hf.gridW+mix+1]*mfx*(1-mfz) +
                           hf.heights[(miz+1)*hf.gridW+mix]*(1-mfx)*mfz + hf.heights[(miz+1)*hf.gridW+mix+1]*mfx*mfz;
                if (my > mh) tLo = tm; else tHi = tm;
            }
            const ft = (tLo + tHi) * 0.5;
            if (ft < 1e-6) { prevY = py - h; continue; }
            const point = vec3Add(ray.origin, vec3Scale(ray.direction, ft));
            return { t: ft, point };
        }
        prevY = py - h;
    }
    return null;
}

export function normalHeightfield(point, hf) {
    const px = Math.max(0, Math.min(1, point[0]));
    const pz = Math.max(0, Math.min(1, point[2]));
    const gx = px * (hf.gridW - 1);
    const gz = pz * (hf.gridD - 1);
    const ix = Math.min(Math.floor(gx), hf.gridW - 2);
    const iz = Math.min(Math.floor(gz), hf.gridD - 2);

    // Central differences for normal
    const d = 1.0 / hf.gridW;
    const hL = sampleHeight(hf, px - d, pz);
    const hR = sampleHeight(hf, px + d, pz);
    const hD = sampleHeight(hf, px, pz - d);
    const hU = sampleHeight(hf, px, pz + d);

    return vec3Normalize([hL - hR, 2 * d, hD - hU]);
}

function sampleHeight(hf, px, pz) {
    px = Math.max(0, Math.min(1, px));
    pz = Math.max(0, Math.min(1, pz));
    const gx = px * (hf.gridW - 1);
    const gz = pz * (hf.gridD - 1);
    const ix = Math.min(Math.floor(gx), hf.gridW - 2);
    const iz = Math.min(Math.floor(gz), hf.gridD - 2);
    const fx = gx - ix, fz = gz - iz;
    return hf.heights[iz*hf.gridW+ix]*(1-fx)*(1-fz) + hf.heights[iz*hf.gridW+ix+1]*fx*(1-fz) +
           hf.heights[(iz+1)*hf.gridW+ix]*(1-fx)*fz + hf.heights[(iz+1)*hf.gridW+ix+1]*fx*fz;
}

export function bboxHeightfield(hf) {
    return { min: [0, 0, 0], max: [1, hf.maxHeight, 1] };
}

export function insideHeightfield(point, hf) {
    if (point[0] < 0 || point[0] > 1 || point[2] < 0 || point[2] > 1) return false;
    return point[1] < sampleHeight(hf, point[0], point[2]);
}
