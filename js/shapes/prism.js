// POV-Ray Web - Prism (linear sweep of 2D shape along y-axis)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';

export function createPrism(sweepType, splineType, height1, height2, points) {
    // points: array of [x, z] pairs defining the cross-section
    let maxR = 0;
    for (const p of points) {
        const r = Math.sqrt(p[0]*p[0] + p[1]*p[1]);
        maxR = Math.max(maxR, r);
    }

    return {
        shapeType: 'prism',
        sweepType: sweepType || 'linear_sweep',
        splineType: splineType || 'linear_spline',
        height1: Math.min(height1, height2),
        height2: Math.max(height1, height2),
        points,
        maxR
    };
}

// Point-in-polygon test (2D, xz plane)
function pointInPolygon(x, z, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0], zi = points[i][1];
        const xj = points[j][0], zj = points[j][1];
        if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

export function intersectPrism(ray, prism) {
    const ox = ray.origin[0], oy = ray.origin[1], oz = ray.origin[2];
    const dx = ray.direction[0], dy = ray.direction[1], dz = ray.direction[2];

    let bestT = Infinity;
    let bestNormal = null;

    // Test top and bottom caps
    if (Math.abs(dy) > 1e-12) {
        for (const h of [prism.height1, prism.height2]) {
            const t = (h - oy) / dy;
            if (t > 1e-6 && t < bestT) {
                const px = ox + dx * t;
                const pz = oz + dz * t;
                if (pointInPolygon(px, pz, prism.points)) {
                    bestT = t;
                    bestNormal = h === prism.height1 ? [0, -1, 0] : [0, 1, 0];
                }
            }
        }
    }

    // Test side walls (each edge of the polygon extruded vertically)
    for (let i = 0; i < prism.points.length; i++) {
        const j = (i + 1) % prism.points.length;
        const x1 = prism.points[i][0], z1 = prism.points[i][1];
        const x2 = prism.points[j][0], z2 = prism.points[j][1];

        const ex = x2 - x1, ez = z2 - z1;
        const denom = dx * ez - dz * ex;
        if (Math.abs(denom) < 1e-12) continue;

        const t = ((x1 - ox) * ez - (z1 - oz) * ex) / denom;
        if (t < 1e-6 || t >= bestT) continue;

        const s = ((x1 - ox) * (-dz) - (z1 - oz) * (-dx)) / denom;
        if (s < 0 || s > 1) continue;

        const py = oy + dy * t;
        if (py < prism.height1 || py > prism.height2) continue;

        bestT = t;
        // Normal perpendicular to edge, horizontal
        const len = Math.sqrt(ez * ez + ex * ex);
        bestNormal = vec3Normalize([ez / len, 0, -ex / len]);
    }

    if (bestT === Infinity) return null;
    const point = vec3Add(ray.origin, vec3Scale(ray.direction, bestT));
    return { t: bestT, point, _normal: bestNormal };
}

export function normalPrism(point, prism, hitData) {
    return hitData && hitData._normal ? hitData._normal : [0, 1, 0];
}

export function bboxPrism(prism) {
    const r = prism.maxR;
    return { min: [-r, prism.height1, -r], max: [r, prism.height2, r] };
}

export function insidePrism(point, prism) {
    if (point[1] < prism.height1 || point[1] > prism.height2) return false;
    return pointInPolygon(point[0], point[2], prism.points);
}
