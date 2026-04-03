// POV-Ray Web - Cone/truncated cone intersection and normal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Sub, vec3Dot, vec3Add, vec3Scale, vec3Normalize, vec3LengthSq } from '../math/vector.js';

export function createCone(basePoint, baseRadius, capPoint, capRadius) {
    const axis = vec3Sub(capPoint, basePoint);
    const axisLen = Math.sqrt(vec3Dot(axis, axis));
    return {
        shapeType: 'cone',
        basePoint,
        capPoint,
        baseRadius,
        capRadius,
        axis,
        axisLen
    };
}

export function intersectCone(ray, cone) {
    const d = ray.direction;
    const o = vec3Sub(ray.origin, cone.basePoint);
    const axisDir = vec3Scale(cone.axis, 1 / cone.axisLen);
    const h = cone.axisLen;
    const r0 = cone.baseRadius;
    const r1 = cone.capRadius;
    const dr = r1 - r0;

    const dDotA = vec3Dot(d, axisDir);
    const oDotA = vec3Dot(o, axisDir);

    const dPerp = vec3Sub(d, vec3Scale(axisDir, dDotA));
    const oPerp = vec3Sub(o, vec3Scale(axisDir, oDotA));

    // r(t_axis) = r0 + (r1 - r0) * t_axis / h
    // Solve |P_perp|^2 = r(P_axis)^2
    const k = dr / h;
    const rAtO = r0 + k * oDotA;

    const a = vec3Dot(dPerp, dPerp) - k * k * dDotA * dDotA;
    const b = 2 * (vec3Dot(oPerp, dPerp) - k * rAtO * dDotA);
    const c = vec3Dot(oPerp, oPerp) - rAtO * rAtO;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;

    const sqrtD = Math.sqrt(discriminant);
    const inv2a = 1 / (2 * a);

    let bestT = Infinity;
    let bestNormalType = 0;

    for (const t of [(-b - sqrtD) * inv2a, (-b + sqrtD) * inv2a]) {
        if (t < 1e-6 || t >= bestT) continue;
        const axisPos = oDotA + t * dDotA;
        if (axisPos >= 0 && axisPos <= h) {
            bestT = t;
            bestNormalType = 0;
        }
    }

    // Check caps
    if (!cone.open && Math.abs(dDotA) > 1e-12) {
        const tBase = -oDotA / dDotA;
        if (tBase > 1e-6 && tBase < bestT) {
            const hitPerp = vec3Add(oPerp, vec3Scale(dPerp, tBase));
            if (vec3Dot(hitPerp, hitPerp) <= r0 * r0) {
                bestT = tBase;
                bestNormalType = 1;
            }
        }
        const tCap = (h - oDotA) / dDotA;
        if (tCap > 1e-6 && tCap < bestT) {
            const hitPerp = vec3Add(oPerp, vec3Scale(dPerp, tCap));
            if (vec3Dot(hitPerp, hitPerp) <= r1 * r1) {
                bestT = tCap;
                bestNormalType = 2;
            }
        }
    }

    if (bestT === Infinity) return null;
    const point = vec3Add(ray.origin, vec3Scale(ray.direction, bestT));
    return { t: bestT, point, _normalType: bestNormalType };
}

export function normalCone(point, cone, hitData) {
    const axisDir = vec3Scale(cone.axis, 1 / cone.axisLen);
    if (hitData && hitData._normalType === 1) return vec3Scale(axisDir, -1);
    if (hitData && hitData._normalType === 2) return [...axisDir];

    const v = vec3Sub(point, cone.basePoint);
    const proj = vec3Dot(v, axisDir);
    const onAxis = vec3Add(cone.basePoint, vec3Scale(axisDir, proj));
    const radial = vec3Normalize(vec3Sub(point, onAxis));

    // Tilt normal by cone angle
    const dr = cone.capRadius - cone.baseRadius;
    const slopeAngle = Math.atan2(dr, cone.axisLen);
    const n = vec3Normalize(vec3Add(
        vec3Scale(radial, Math.cos(slopeAngle)),
        vec3Scale(axisDir, -Math.sin(slopeAngle))
    ));
    return n;
}

export function bboxCone(cone) {
    const r = Math.max(cone.baseRadius, cone.capRadius);
    return {
        min: [
            Math.min(cone.basePoint[0], cone.capPoint[0]) - r,
            Math.min(cone.basePoint[1], cone.capPoint[1]) - r,
            Math.min(cone.basePoint[2], cone.capPoint[2]) - r
        ],
        max: [
            Math.max(cone.basePoint[0], cone.capPoint[0]) + r,
            Math.max(cone.basePoint[1], cone.capPoint[1]) + r,
            Math.max(cone.basePoint[2], cone.capPoint[2]) + r
        ]
    };
}

export function insideCone(point, cone) {
    const v = vec3Sub(point, cone.basePoint);
    const axisDir = vec3Scale(cone.axis, 1 / cone.axisLen);
    const proj = vec3Dot(v, axisDir);
    if (proj < 0 || proj > cone.axisLen) return false;
    const rAt = cone.baseRadius + (cone.capRadius - cone.baseRadius) * proj / cone.axisLen;
    const onAxis = vec3Scale(axisDir, proj);
    const perpSq = vec3LengthSq(vec3Sub(v, onAxis));
    return perpSq < rAt * rAt;
}
