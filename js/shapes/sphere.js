// POV-Ray Web - Sphere intersection and normal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Sub, vec3Dot, vec3Normalize, vec3Scale, vec3Add } from '../math/vector.js';

export function createSphere(center, radius) {
    return {
        shapeType: 'sphere',
        center,
        radius,
        radiusSq: radius * radius
    };
}

export function intersectSphere(ray, sphere) {
    const oc = vec3Sub(ray.origin, sphere.center);
    const a = vec3Dot(ray.direction, ray.direction);
    const b = 2 * vec3Dot(oc, ray.direction);
    const c = vec3Dot(oc, oc) - sphere.radiusSq;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return null;

    const sqrtD = Math.sqrt(discriminant);
    const inv2a = 1 / (2 * a);
    let t = (-b - sqrtD) * inv2a;
    if (t < 1e-6) {
        t = (-b + sqrtD) * inv2a;
        if (t < 1e-6) return null;
    }

    const point = vec3Add(ray.origin, vec3Scale(ray.direction, t));
    return { t, point };
}

export function normalSphere(point, sphere) {
    return vec3Normalize(vec3Sub(point, sphere.center));
}

export function bboxSphere(sphere) {
    const r = sphere.radius;
    const c = sphere.center;
    return {
        min: [c[0] - r, c[1] - r, c[2] - r],
        max: [c[0] + r, c[1] + r, c[2] + r]
    };
}

export function insideSphere(point, sphere) {
    const d = vec3Sub(point, sphere.center);
    return vec3Dot(d, d) < sphere.radiusSq;
}
