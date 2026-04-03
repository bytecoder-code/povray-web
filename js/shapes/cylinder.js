// POV-Ray Web - Finite cylinder intersection and normal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Sub, vec3Dot, vec3Add, vec3Scale, vec3Normalize, vec3LengthSq } from '../math/vector.js';

export function createCylinder(basePoint, capPoint, radius) {
    const axis = vec3Sub(capPoint, basePoint);
    const axisLenSq = vec3Dot(axis, axis);
    return {
        shapeType: 'cylinder',
        basePoint,
        capPoint,
        radius,
        radiusSq: radius * radius,
        axis,
        axisLenSq
    };
}

export function intersectCylinder(ray, cyl) {
    const d = ray.direction;
    const o = vec3Sub(ray.origin, cyl.basePoint);
    const axis = vec3Normalize(cyl.axis);
    const axisLen = Math.sqrt(cyl.axisLenSq);

    // Project ray direction and origin-base onto plane perpendicular to axis
    const dDotA = vec3Dot(d, axis);
    const oDotA = vec3Dot(o, axis);

    const dPerp = vec3Sub(d, vec3Scale(axis, dDotA));
    const oPerp = vec3Sub(o, vec3Scale(axis, oDotA));

    const a = vec3Dot(dPerp, dPerp);
    const b = 2 * vec3Dot(oPerp, dPerp);
    const c = vec3Dot(oPerp, oPerp) - cyl.radiusSq;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;

    const sqrtD = Math.sqrt(discriminant);
    const inv2a = 1 / (2 * a);
    const t1 = (-b - sqrtD) * inv2a;
    const t2 = (-b + sqrtD) * inv2a;

    let bestT = Infinity;
    let bestNormalType = 0; // 0=side, 1=base cap, 2=top cap

    // Check side hits
    for (const t of [t1, t2]) {
        if (t < 1e-6) continue;
        const h = oDotA + t * dDotA;
        if (h >= 0 && h <= axisLen && t < bestT) {
            bestT = t;
            bestNormalType = 0;
        }
    }

    // Check caps (if not open)
    if (!cyl.open) {
        // Base cap
        if (Math.abs(dDotA) > 1e-12) {
            const tBase = -oDotA / dDotA;
            if (tBase > 1e-6 && tBase < bestT) {
                const hit = vec3Add(o, vec3Scale(d, tBase));
                const perpDist = vec3LengthSq(vec3Sub(hit, vec3Scale(axis, vec3Dot(hit, axis))));
                if (perpDist <= cyl.radiusSq) {
                    bestT = tBase;
                    bestNormalType = 1;
                }
            }
            // Top cap
            const tTop = (axisLen - oDotA) / dDotA;
            if (tTop > 1e-6 && tTop < bestT) {
                const hit = vec3Add(o, vec3Scale(d, tTop));
                const hProj = vec3Sub(hit, vec3Scale(axis, axisLen));
                if (vec3Dot(hProj, hProj) <= cyl.radiusSq) {
                    bestT = tTop;
                    bestNormalType = 2;
                }
            }
        }
    }

    if (bestT === Infinity) return null;

    const point = vec3Add(ray.origin, vec3Scale(ray.direction, bestT));
    return { t: bestT, point, _normalType: bestNormalType };
}

export function normalCylinder(point, cyl, hitData) {
    const axis = vec3Normalize(cyl.axis);
    if (hitData && hitData._normalType === 1) return vec3Scale(axis, -1);
    if (hitData && hitData._normalType === 2) return [...axis];

    // Side normal: project point onto axis, subtract
    const v = vec3Sub(point, cyl.basePoint);
    const proj = vec3Dot(v, axis);
    const onAxis = vec3Add(cyl.basePoint, vec3Scale(axis, proj));
    return vec3Normalize(vec3Sub(point, onAxis));
}

export function bboxCylinder(cyl) {
    const r = cyl.radius;
    return {
        min: [
            Math.min(cyl.basePoint[0], cyl.capPoint[0]) - r,
            Math.min(cyl.basePoint[1], cyl.capPoint[1]) - r,
            Math.min(cyl.basePoint[2], cyl.capPoint[2]) - r
        ],
        max: [
            Math.max(cyl.basePoint[0], cyl.capPoint[0]) + r,
            Math.max(cyl.basePoint[1], cyl.capPoint[1]) + r,
            Math.max(cyl.basePoint[2], cyl.capPoint[2]) + r
        ]
    };
}

export function insideCylinder(point, cyl) {
    const v = vec3Sub(point, cyl.basePoint);
    const axis = vec3Normalize(cyl.axis);
    const proj = vec3Dot(v, axis);
    if (proj < 0 || proj > Math.sqrt(cyl.axisLenSq)) return false;
    const onAxis = vec3Scale(axis, proj);
    const perpSq = vec3LengthSq(vec3Sub(v, onAxis));
    return perpSq < cyl.radiusSq;
}
