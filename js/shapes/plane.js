// POV-Ray Web - Infinite plane intersection and normal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Dot, vec3Add, vec3Scale } from '../math/vector.js';

export function createPlane(normal, distance) {
    return {
        shapeType: 'plane',
        normal,
        distance
    };
}

export function intersectPlane(ray, plane) {
    const denom = vec3Dot(ray.direction, plane.normal);
    if (Math.abs(denom) < 1e-12) return null;

    const t = (plane.distance - vec3Dot(ray.origin, plane.normal)) / denom;
    if (t < 1e-6) return null;

    const point = vec3Add(ray.origin, vec3Scale(ray.direction, t));
    return { t, point };
}

export function normalPlane(point, plane) {
    return [...plane.normal];
}

export function bboxPlane() {
    // Infinite planes have no useful bounding box
    return {
        min: [-1e10, -1e10, -1e10],
        max: [1e10, 1e10, 1e10]
    };
}

export function insidePlane(point, plane) {
    return vec3Dot(point, plane.normal) < plane.distance;
}
