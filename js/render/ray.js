// POV-Ray Web - Ray structure and utilities
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export function createRay(origin, direction) {
    return { origin, direction };
}

export function rayPoint(ray, t) {
    return [
        ray.origin[0] + ray.direction[0] * t,
        ray.origin[1] + ray.direction[1] * t,
        ray.origin[2] + ray.direction[2] * t
    ];
}
