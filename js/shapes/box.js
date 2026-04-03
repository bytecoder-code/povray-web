// POV-Ray Web - Box (axis-aligned) intersection and normal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Add, vec3Scale } from '../math/vector.js';

export function createBox(corner1, corner2) {
    return {
        shapeType: 'box',
        corner1,
        corner2
    };
}

export function intersectBox(ray, box) {
    let tMin = -Infinity, tMax = Infinity;
    let normalAxis = 0, normalSign = 1;

    for (let i = 0; i < 3; i++) {
        if (Math.abs(ray.direction[i]) < 1e-12) {
            if (ray.origin[i] < box.corner1[i] || ray.origin[i] > box.corner2[i]) {
                return null;
            }
        } else {
            const invD = 1 / ray.direction[i];
            let t1 = (box.corner1[i] - ray.origin[i]) * invD;
            let t2 = (box.corner2[i] - ray.origin[i]) * invD;
            let sign = -1;
            if (t1 > t2) {
                const tmp = t1; t1 = t2; t2 = tmp;
                sign = 1;
            }
            if (t1 > tMin) {
                tMin = t1;
                normalAxis = i;
                normalSign = sign;
            }
            if (t2 < tMax) tMax = t2;
            if (tMin > tMax) return null;
        }
    }

    let t = tMin;
    if (t < 1e-6) {
        t = tMax;
        if (t < 1e-6) return null;
        // Inside the box - flip normal
        normalSign = -normalSign;
    }

    const point = vec3Add(ray.origin, vec3Scale(ray.direction, t));
    return { t, point, _normalAxis: normalAxis, _normalSign: normalSign };
}

export function normalBox(point, box, hitData) {
    if (hitData && hitData._normalAxis !== undefined) {
        const n = [0, 0, 0];
        n[hitData._normalAxis] = hitData._normalSign;
        return n;
    }
    // Fallback: determine normal from closest face
    const n = [0, 0, 0];
    let minDist = Infinity;
    for (let i = 0; i < 3; i++) {
        const d1 = Math.abs(point[i] - box.corner1[i]);
        const d2 = Math.abs(point[i] - box.corner2[i]);
        if (d1 < minDist) { minDist = d1; n[0] = n[1] = n[2] = 0; n[i] = -1; }
        if (d2 < minDist) { minDist = d2; n[0] = n[1] = n[2] = 0; n[i] = 1; }
    }
    return n;
}

export function bboxBox(box) {
    return { min: [...box.corner1], max: [...box.corner2] };
}

export function insideBox(point, box) {
    return point[0] >= box.corner1[0] && point[0] <= box.corner2[0] &&
           point[1] >= box.corner1[1] && point[1] <= box.corner2[1] &&
           point[2] >= box.corner1[2] && point[2] <= box.corner2[2];
}
