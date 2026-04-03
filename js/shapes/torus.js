// POV-Ray Web - Torus intersection and normal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Torus centered at origin, lying in xz-plane (y is up)

import { vec3Sub, vec3Dot, vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';
import { solveQuartic } from '../math/polynomial-solver.js';

export function createTorus(majorRadius, minorRadius) {
    return {
        shapeType: 'torus',
        majorRadius,
        minorRadius,
        R: majorRadius,
        r: minorRadius
    };
}

export function intersectTorus(ray, torus) {
    const o = ray.origin;
    const d = ray.direction;
    const R = torus.R;
    const r = torus.r;
    const R2 = R * R;
    const r2 = r * r;

    const ox = o[0], oy = o[1], oz = o[2];
    const dx = d[0], dy = d[1], dz = d[2];

    const dDotd = dx*dx + dy*dy + dz*dz;
    const oDotd = ox*dx + oy*dy + oz*dz;
    const oDoto = ox*ox + oy*oy + oz*oz;

    const k = oDoto - R2 - r2;

    // Quartic coefficients: at^4 + bt^3 + ct^2 + dt + e = 0
    const a = dDotd * dDotd;
    const b = 4 * dDotd * oDotd;
    const c = 2 * dDotd * k + 4 * oDotd * oDotd + 4 * R2 * dy * dy;
    const dd = 4 * k * oDotd + 8 * R2 * oy * dy;
    const e = k * k - 4 * R2 * (r2 - oy * oy);

    const roots = solveQuartic(a, b, c, dd, e);
    if (!roots || roots.length === 0) return null;

    let bestT = Infinity;
    for (const t of roots) {
        if (t > 1e-6 && t < bestT) bestT = t;
    }

    if (bestT === Infinity) return null;

    const point = vec3Add(ray.origin, vec3Scale(ray.direction, bestT));
    return { t: bestT, point };
}

export function normalTorus(point, torus) {
    const x = point[0], y = point[1], z = point[2];
    const R = torus.R;

    // Distance from point to the ring center
    const distXZ = Math.sqrt(x * x + z * z);
    if (distXZ < 1e-12) return [0, 1, 0];

    // Point on the major ring closest to the surface point
    const ringX = R * x / distXZ;
    const ringZ = R * z / distXZ;

    return vec3Normalize([x - ringX, y, z - ringZ]);
}

export function bboxTorus(torus) {
    const R = torus.R + torus.r;
    const h = torus.r;
    return {
        min: [-R, -h, -R],
        max: [R, h, R]
    };
}

export function insideTorus(point, torus) {
    const x = point[0], y = point[1], z = point[2];
    const R = torus.R, r = torus.r;
    const distXZ = Math.sqrt(x * x + z * z);
    const dx = distXZ - R;
    return (dx * dx + y * y) < r * r;
}
