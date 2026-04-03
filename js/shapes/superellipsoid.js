// POV-Ray Web - Superellipsoid intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// |x|^(2/e) + |y|^(2/n) + |z|^(2/e) = 1
// where e = east-west exponent, n = north-south exponent

import { vec3Normalize } from '../math/vector.js';
import { rayBoxTest, rayMarch } from './geometry-utils.js';

export function createSuperellipsoid(e, n) {
    return {
        shapeType: 'superellipsoid',
        e, n
    };
}

// Newton's method ray-superellipsoid intersection
export function intersectSuperellipsoid(ray, se) {
    const e = se.e, n = se.n;

    // Bounding box test first
    const bbox = bboxSuperellipsoid(se);
    if (!rayBoxTest(ray, bbox.min, bbox.max)) return null;

    const evalFn = (p) => evaluate(p[0], p[1], p[2], e, n);
    const hit = rayMarch(ray, evalFn, 0, 20, { steps: 128, bisections: 20 });
    return hit;
}

function evaluate(x, y, z, e, n) {
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    const twoOverE = 2 / e;
    const twoOverN = 2 / n;
    const inner = Math.pow(ax, twoOverE) + Math.pow(az, twoOverE);
    return Math.pow(inner, e / n) + Math.pow(ay, twoOverN) - 1;
}

export function normalSuperellipsoid(point, se) {
    const x = point[0], y = point[1], z = point[2];
    const e = se.e, n = se.n;
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    const twoOverE = 2 / e;
    const twoOverN = 2 / n;

    const inner = Math.pow(ax, twoOverE) + Math.pow(az, twoOverE);
    const innerPow = Math.pow(inner, e / n - 1);

    const nx = (twoOverE) * Math.sign(x) * Math.pow(ax, twoOverE - 1) * innerPow;
    const ny = (twoOverN) * Math.sign(y) * Math.pow(ay, twoOverN - 1);
    const nz = (twoOverE) * Math.sign(z) * Math.pow(az, twoOverE - 1) * innerPow;

    return vec3Normalize([
        isFinite(nx) ? nx : 0,
        isFinite(ny) ? ny : 0,
        isFinite(nz) ? nz : 0
    ]);
}

export function bboxSuperellipsoid() {
    return { min: [-1, -1, -1], max: [1, 1, 1] };
}

export function insideSuperellipsoid(point, se) {
    return evaluate(point[0], point[1], point[2], se.e, se.n) < 0;
}
