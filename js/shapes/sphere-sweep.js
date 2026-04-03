// POV-Ray Web - Sphere sweep intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Sweep a sphere along a spline path

import { vec3Add, vec3Sub, vec3Scale, vec3Normalize, vec3Dot, vec3Length } from '../math/vector.js';

export function createSphereSweep(splineType, spheres, tolerance) {
    // spheres: array of { center: [x,y,z], radius: number }
    let bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
    for (const s of spheres) {
        for (let i = 0; i < 3; i++) {
            bmin[i] = Math.min(bmin[i], s.center[i] - s.radius);
            bmax[i] = Math.max(bmax[i], s.center[i] + s.radius);
        }
    }

    return {
        shapeType: 'sphere_sweep',
        splineType: splineType || 'linear_spline',
        spheres,
        tolerance: tolerance || 1e-6,
        bbox: { min: bmin, max: bmax }
    };
}

export function intersectSphereSweep(ray, ss) {
    // Test each segment as a tapered cylinder + endcap spheres
    let bestT = Infinity;
    let bestPoint = null;
    let bestNormal = null;

    for (let i = 0; i < ss.spheres.length - 1; i++) {
        const s0 = ss.spheres[i], s1 = ss.spheres[i + 1];
        // Test endcap spheres
        for (const s of [s0, s1]) {
            const oc = vec3Sub(ray.origin, s.center);
            const a = vec3Dot(ray.direction, ray.direction);
            const b = 2 * vec3Dot(oc, ray.direction);
            const c = vec3Dot(oc, oc) - s.radius * s.radius;
            const disc = b*b - 4*a*c;
            if (disc >= 0) {
                const sqrtD = Math.sqrt(disc);
                let t = (-b - sqrtD) / (2*a);
                if (t < 1e-6) t = (-b + sqrtD) / (2*a);
                if (t > 1e-6 && t < bestT) {
                    bestT = t;
                    bestPoint = vec3Add(ray.origin, vec3Scale(ray.direction, t));
                    bestNormal = vec3Normalize(vec3Sub(bestPoint, s.center));
                }
            }
        }

        // Test cylinder segment between centers
        const axis = vec3Sub(s1.center, s0.center);
        const axisLen = vec3Length(axis);
        if (axisLen < 1e-10) continue;
        const axisDir = vec3Scale(axis, 1 / axisLen);
        const avgR = (s0.radius + s1.radius) / 2;

        const o = vec3Sub(ray.origin, s0.center);
        const dDotA = vec3Dot(ray.direction, axisDir);
        const oDotA = vec3Dot(o, axisDir);
        const dPerp = vec3Sub(ray.direction, vec3Scale(axisDir, dDotA));
        const oPerp = vec3Sub(o, vec3Scale(axisDir, oDotA));

        const a2 = vec3Dot(dPerp, dPerp);
        const b2 = 2 * vec3Dot(oPerp, dPerp);
        const c2 = vec3Dot(oPerp, oPerp) - avgR * avgR;
        const disc2 = b2*b2 - 4*a2*c2;
        if (disc2 < 0) continue;

        const sqrtD2 = Math.sqrt(disc2);
        for (const sign of [-1, 1]) {
            const t = (-b2 + sign * sqrtD2) / (2 * a2);
            if (t < 1e-6 || t >= bestT) continue;
            const h = oDotA + t * dDotA;
            if (h >= 0 && h <= axisLen) {
                bestT = t;
                bestPoint = vec3Add(ray.origin, vec3Scale(ray.direction, t));
                const onAxis = vec3Add(s0.center, vec3Scale(axisDir, h));
                bestNormal = vec3Normalize(vec3Sub(bestPoint, onAxis));
            }
        }
    }

    if (bestT === Infinity) return null;
    return { t: bestT, point: bestPoint, _normal: bestNormal };
}

export function normalSphereSweep(point, ss, hitData) {
    return hitData && hitData._normal ? hitData._normal : [0, 1, 0];
}

export function bboxSphereSweep(ss) { return ss.bbox; }

export function insideSphereSweep() { return false; }
