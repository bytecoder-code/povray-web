// POV-Ray Web - Axis-Aligned Bounding Box operations
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export function createAABB(min, max) {
    return { min: [...min], max: [...max] };
}

export function mergeAABB(a, b) {
    return {
        min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1]), Math.min(a.min[2], b.min[2])],
        max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1]), Math.max(a.max[2], b.max[2])]
    };
}

export function surfaceArea(box) {
    const dx = box.max[0] - box.min[0];
    const dy = box.max[1] - box.min[1];
    const dz = box.max[2] - box.min[2];
    return 2 * (dx * dy + dy * dz + dz * dx);
}

export function centroid(box) {
    return [
        (box.min[0] + box.max[0]) * 0.5,
        (box.min[1] + box.max[1]) * 0.5,
        (box.min[2] + box.max[2]) * 0.5
    ];
}

export function intersectAABB(ray, box, maxT) {
    let tMin = 0, tMax = maxT;
    for (let i = 0; i < 3; i++) {
        const invD = 1 / ray.direction[i];
        let t0 = (box.min[i] - ray.origin[i]) * invD;
        let t1 = (box.max[i] - ray.origin[i]) * invD;
        if (invD < 0) { const tmp = t0; t0 = t1; t1 = tmp; }
        tMin = Math.max(tMin, t0);
        tMax = Math.min(tMax, t1);
        if (tMax < tMin) return false;
    }
    return true;
}
