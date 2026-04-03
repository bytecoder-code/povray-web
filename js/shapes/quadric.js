// POV-Ray Web - Quadric surface intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Ax^2 + Bxy + Cxz + Dx + Ey^2 + Fyz + Gy + Hz^2 + Iz + J = 0
// POV-Ray format: quadric { <A,B,C>, <D,E,F>, <G,H,I>, J }

import { vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';

export function createQuadric(a, b, c, d, e, f, g, h, ii, j) {
    return {
        shapeType: 'quadric',
        A: a, B: b, C: c, D: d, E: e, F: f, G: g, H: h, I: ii, J: j
    };
}

export function intersectQuadric(ray, q) {
    const ox = ray.origin[0], oy = ray.origin[1], oz = ray.origin[2];
    const dx = ray.direction[0], dy = ray.direction[1], dz = ray.direction[2];

    const a = q.A * dx*dx + q.E * dy*dy + q.H * dz*dz +
              q.B * dx*dy + q.C * dx*dz + q.F * dy*dz;

    const b = 2*(q.A*ox*dx + q.E*oy*dy + q.H*oz*dz) +
              q.B*(ox*dy + oy*dx) + q.C*(ox*dz + oz*dx) + q.F*(oy*dz + oz*dy) +
              q.D*dx + q.G*dy + q.I*dz;

    const c = q.A*ox*ox + q.E*oy*oy + q.H*oz*oz +
              q.B*ox*oy + q.C*ox*oz + q.F*oy*oz +
              q.D*ox + q.G*oy + q.I*oz + q.J;

    let t;
    if (Math.abs(a) < 1e-12) {
        if (Math.abs(b) < 1e-12) return null;
        t = -c / b;
    } else {
        const disc = b*b - 4*a*c;
        if (disc < 0) return null;
        const sqrtD = Math.sqrt(disc);
        const inv2a = 1 / (2 * a);
        t = (-b - sqrtD) * inv2a;
        if (t < 1e-6) t = (-b + sqrtD) * inv2a;
    }

    if (t < 1e-6) return null;
    const point = vec3Add(ray.origin, vec3Scale(ray.direction, t));
    return { t, point };
}

export function normalQuadric(point, q) {
    const x = point[0], y = point[1], z = point[2];
    return vec3Normalize([
        2*q.A*x + q.B*y + q.C*z + q.D,
        q.B*x + 2*q.E*y + q.F*z + q.G,
        q.C*x + q.F*y + 2*q.H*z + q.I
    ]);
}

export function bboxQuadric() {
    return { min: [-1e5, -1e5, -1e5], max: [1e5, 1e5, 1e5] };
}

export function insideQuadric(point, q) {
    const x = point[0], y = point[1], z = point[2];
    return (q.A*x*x + q.E*y*y + q.H*z*z +
            q.B*x*y + q.C*x*z + q.F*y*z +
            q.D*x + q.G*y + q.I*z + q.J) < 0;
}
