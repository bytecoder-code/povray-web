// POV-Ray Web - Disc (finite plane) intersection and normal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Dot, vec3Add, vec3Scale, vec3Sub, vec3LengthSq } from '../math/vector.js';

export function createDisc(center, normal, radius, holeRadius = 0) {
    return {
        shapeType: 'disc',
        center,
        normal,
        radius,
        radiusSq: radius * radius,
        holeRadius,
        holeRadiusSq: holeRadius * holeRadius
    };
}

export function intersectDisc(ray, disc) {
    const denom = vec3Dot(ray.direction, disc.normal);
    if (Math.abs(denom) < 1e-12) return null;

    const t = vec3Dot(vec3Sub(disc.center, ray.origin), disc.normal) / denom;
    if (t < 1e-6) return null;

    const point = vec3Add(ray.origin, vec3Scale(ray.direction, t));
    const v = vec3Sub(point, disc.center);
    const distSq = vec3LengthSq(v);

    if (distSq > disc.radiusSq) return null;
    if (distSq < disc.holeRadiusSq) return null;

    return { t, point };
}

export function normalDisc(point, disc) {
    return [...disc.normal];
}

export function bboxDisc(disc) {
    const r = disc.radius;
    const c = disc.center;
    return {
        min: [c[0] - r, c[1] - r, c[2] - r],
        max: [c[0] + r, c[1] + r, c[2] + r]
    };
}

export function insideDisc() {
    return false; // Disc is infinitely thin
}
