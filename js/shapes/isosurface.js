// POV-Ray Web - Isosurface intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Defined by function f(x,y,z) = 0 with containment box

import { vec3Add, vec3Scale } from '../math/vector.js';
import { rayMarch, numericalGradient } from './geometry-utils.js';

export function createIsosurface(evalFn, threshold, containedBy, maxGradient, accuracy) {
    return {
        shapeType: 'isosurface',
        evalFn: (typeof evalFn === 'function') ? evalFn : defaultFunction,
        threshold: threshold || 0,
        containedBy: containedBy || { type: 'box', corner1: [-1,-1,-1], corner2: [1,1,1] },
        maxGradient: maxGradient || 5,
        accuracy: accuracy || 0.001
    };
}

function defaultFunction(x, y, z) {
    return x*x + y*y + z*z - 1; // unit sphere
}

function getEvalFn(iso) {
    return (typeof iso.evalFn === 'function') ? iso.evalFn : defaultFunction;
}

export function intersectIsosurface(ray, iso) {
    // Bounding box test
    const cb = iso.containedBy;
    let bmin, bmax;
    if (cb.type === 'sphere') {
        const r = cb.radius || 1;
        bmin = [-r + (cb.center?.[0]||0), -r + (cb.center?.[1]||0), -r + (cb.center?.[2]||0)];
        bmax = [r + (cb.center?.[0]||0), r + (cb.center?.[1]||0), r + (cb.center?.[2]||0)];
    } else {
        bmin = cb.corner1 || [-1,-1,-1];
        bmax = cb.corner2 || [1,1,1];
    }

    // Ray-box intersection for entry/exit
    let tEntry = 0, tExit = 100;
    for (let i = 0; i < 3; i++) {
        if (Math.abs(ray.direction[i]) < 1e-12) {
            if (ray.origin[i] < bmin[i] || ray.origin[i] > bmax[i]) return null;
        } else {
            const invD = 1 / ray.direction[i];
            let t1 = (bmin[i] - ray.origin[i]) * invD;
            let t2 = (bmax[i] - ray.origin[i]) * invD;
            if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
            tEntry = Math.max(tEntry, t1);
            tExit = Math.min(tExit, t2);
            if (tEntry > tExit) return null;
        }
    }

    tEntry = Math.max(tEntry, 1e-6);

    // Wrap evalFn to accept a point array and subtract threshold
    const fn = getEvalFn(iso);
    const evalFnWrapped = (p) => fn(p[0], p[1], p[2]) - iso.threshold;

    // Compute steps from accuracy/maxGradient to match original step size
    const stepSize = iso.accuracy / iso.maxGradient;
    const steps = Math.max(1, Math.ceil((tExit - tEntry) / stepSize));

    return rayMarch(ray, evalFnWrapped, tEntry, tExit, { steps, bisections: 20 });
}

export function normalIsosurface(point, iso) {
    const fn = getEvalFn(iso);
    const evalFn = (p) => fn(p[0], p[1], p[2]);
    return numericalGradient(evalFn, point, 0.0001);
}

export function bboxIsosurface(iso) {
    const cb = iso.containedBy;
    if (cb.type === 'sphere') {
        const r = cb.radius || 1;
        const c = cb.center || [0,0,0];
        return { min: [c[0]-r, c[1]-r, c[2]-r], max: [c[0]+r, c[1]+r, c[2]+r] };
    }
    return { min: cb.corner1 || [-1,-1,-1], max: cb.corner2 || [1,1,1] };
}

export function insideIsosurface(point, iso) {
    return (getEvalFn(iso)(point[0], point[1], point[2]) - iso.threshold) < 0;
}
