// POV-Ray Web - Blob (metaball) intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Field function: sum of component contributions, threshold crossing

import { vec3Add, vec3Scale, vec3Sub, vec3Dot } from '../math/vector.js';
import { rayBoxTest, rayMarch, numericalGradient } from './geometry-utils.js';

export function createBlob(threshold, components) {
    // components: array of { type: 'sphere'|'cylinder', center, radius, strength, ... }
    let maxR = 0;
    let bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
    for (const c of components) {
        const r = c.radius || 1;
        if (c.type === 'sphere') {
            for (let i = 0; i < 3; i++) {
                bmin[i] = Math.min(bmin[i], c.center[i] - r);
                bmax[i] = Math.max(bmax[i], c.center[i] + r);
            }
        } else if (c.type === 'cylinder') {
            for (let i = 0; i < 3; i++) {
                bmin[i] = Math.min(bmin[i], c.end1[i] - r, c.end2[i] - r);
                bmax[i] = Math.max(bmax[i], c.end1[i] + r, c.end2[i] + r);
            }
        }
        maxR = Math.max(maxR, r);
    }

    return {
        shapeType: 'blob',
        threshold,
        components,
        bbox: { min: bmin, max: bmax }
    };
}

function fieldValue(blob, point) {
    let total = 0;
    for (const c of blob.components) {
        if (c.type === 'sphere') {
            const d = vec3Sub(point, c.center);
            const r2 = c.radius * c.radius;
            const d2 = vec3Dot(d, d);
            if (d2 < r2) {
                const x = d2 / r2;
                total += c.strength * (1 - x) * (1 - x);
            }
        } else if (c.type === 'cylinder') {
            const axis = vec3Sub(c.end2, c.end1);
            const axisLen2 = vec3Dot(axis, axis);
            const v = vec3Sub(point, c.end1);
            const t = vec3Dot(v, axis) / axisLen2;
            if (t >= 0 && t <= 1) {
                const proj = vec3Add(c.end1, vec3Scale(axis, t));
                const perp = vec3Sub(point, proj);
                const d2 = vec3Dot(perp, perp);
                const r2 = c.radius * c.radius;
                if (d2 < r2) {
                    const x = d2 / r2;
                    total += c.strength * (1 - x) * (1 - x);
                }
            }
        }
    }
    return total;
}

export function intersectBlob(ray, blob) {
    if (!rayBoxTest(ray, blob.bbox.min, blob.bbox.max)) return null;

    const evalFn = (p) => fieldValue(blob, p) - blob.threshold;
    const hit = rayMarch(ray, evalFn, 0, 30, { steps: 200, bisections: 15 });
    return hit;
}

export function normalBlob(point, blob) {
    const evalFn = (p) => fieldValue(blob, p);
    return numericalGradient(evalFn, point, 0.001);
}

export function bboxBlob(blob) { return blob.bbox; }

export function insideBlob(point, blob) {
    return fieldValue(blob, point) >= blob.threshold;
}
