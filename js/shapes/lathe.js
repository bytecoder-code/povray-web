// POV-Ray Web - Lathe (surface of revolution) intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Rotates a 2D profile around the y-axis

import { vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';
import { solveQuadratic } from '../math/polynomial-solver.js';
import { rayMarch } from './geometry-utils.js';

export function createLathe(splineType, points) {
    // points is array of [x, y] pairs defining the profile
    // Compute bounding cylinder
    let maxR = 0, minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        maxR = Math.max(maxR, Math.abs(p[0]));
        minY = Math.min(minY, p[1]);
        maxY = Math.max(maxY, p[1]);
    }

    return {
        shapeType: 'lathe',
        splineType: splineType || 'linear_spline',
        points,
        maxR,
        minY,
        maxY,
        segments: buildSegments(points, splineType)
    };
}

function buildSegments(points, splineType) {
    const segs = [];
    for (let i = 0; i < points.length - 1; i++) {
        segs.push({ p0: points[i], p1: points[i + 1] });
    }
    return segs;
}

export function intersectLathe(ray, lathe) {
    // Bounding cylinder test
    const ox = ray.origin[0], oy = ray.origin[1], oz = ray.origin[2];
    const dx = ray.direction[0], dy = ray.direction[1], dz = ray.direction[2];

    // Check against bounding cylinder (radius maxR, y from minY to maxY)
    const a = dx*dx + dz*dz;
    const b = 2*(ox*dx + oz*dz);
    const c = ox*ox + oz*oz - lathe.maxR * lathe.maxR;
    const disc = b*b - 4*a*c;
    if (disc < 0 && a > 1e-12) return null;

    // Implicit function: distance from point to profile surface of revolution
    const evalFn = (p) => {
        const py = p[1];
        if (py < lathe.minY || py > lathe.maxY) return 1; // outside
        const r = Math.sqrt(p[0]*p[0] + p[2]*p[2]);
        const profileR = sampleProfile(lathe, py);
        if (profileR < 0) return 1; // outside
        return r - profileR;
    };

    const hit = rayMarch(ray, evalFn, 0, 50, { steps: 200, bisections: 15 });
    return hit;
}

function sampleProfile(lathe, y) {
    for (const seg of lathe.segments) {
        const y0 = seg.p0[1], y1 = seg.p1[1];
        if ((y >= y0 && y <= y1) || (y >= y1 && y <= y0)) {
            const t = (y1 !== y0) ? (y - y0) / (y1 - y0) : 0;
            return seg.p0[0] + t * (seg.p1[0] - seg.p0[0]);
        }
    }
    return -1;
}

export function normalLathe(point, lathe) {
    const px = point[0], py = point[1], pz = point[2];
    const r = Math.sqrt(px*px + pz*pz);
    if (r < 1e-10) return [0, 1, 0];

    // Numerical gradient
    const d = 0.001;
    const rUp = sampleProfile(lathe, py + d);
    const rDown = sampleProfile(lathe, py - d);
    const profileR = sampleProfile(lathe, py);

    if (profileR < 0) return [px/r, 0, pz/r];

    const drdy = (rUp >= 0 && rDown >= 0) ? (rUp - rDown) / (2*d) : 0;
    // Outward radial direction + y component from profile slope
    const radial = [px/r, 0, pz/r];
    const n = vec3Normalize([radial[0], -drdy, radial[2]]);
    return n;
}

export function bboxLathe(lathe) {
    const r = lathe.maxR;
    return { min: [-r, lathe.minY, -r], max: [r, lathe.maxY, r] };
}

export function insideLathe(point, lathe) {
    const r = Math.sqrt(point[0]*point[0] + point[2]*point[2]);
    const profileR = sampleProfile(lathe, point[1]);
    return profileR >= 0 && r < profileR;
}
