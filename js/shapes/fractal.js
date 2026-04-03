// POV-Ray Web - Julia fractal intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// 3D quaternion Julia set

import { vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';

export function createJuliaFractal(juliaParam, maxIter, precision, sliceType) {
    return {
        shapeType: 'julia_fractal',
        juliaParam: juliaParam || [-0.083, 0.0, -0.83, -0.025],
        maxIter: maxIter || 20,
        precision: precision || 20,
        sliceType: sliceType || 'quaternion'
    };
}

function quaternionMul(a, b) {
    return [
        a[0]*b[0] - a[1]*b[1] - a[2]*b[2] - a[3]*b[3],
        a[0]*b[1] + a[1]*b[0] + a[2]*b[3] - a[3]*b[2],
        a[0]*b[2] - a[1]*b[3] + a[2]*b[0] + a[3]*b[1],
        a[0]*b[3] + a[1]*b[2] - a[2]*b[1] + a[3]*b[0]
    ];
}

function quaternionSqLen(q) {
    return q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3];
}

function juliaDistance(point, jf) {
    let q = [point[0], point[1], point[2], 0];
    const c = jf.juliaParam;
    let dq = [1, 0, 0, 0]; // derivative

    for (let i = 0; i < jf.maxIter; i++) {
        // dq = 2 * q * dq
        dq = [2 * (q[0]*dq[0] - q[1]*dq[1] - q[2]*dq[2] - q[3]*dq[3]),
              2 * (q[0]*dq[1] + q[1]*dq[0]),
              2 * (q[0]*dq[2] + q[2]*dq[0]),
              2 * (q[0]*dq[3] + q[3]*dq[0])];
        // q = q^2 + c
        q = quaternionMul(q, q);
        q[0] += c[0]; q[1] += c[1]; q[2] += c[2]; q[3] += c[3];

        const r2 = quaternionSqLen(q);
        if (r2 > 4) break;
    }

    const r = Math.sqrt(quaternionSqLen(q));
    const dr = Math.sqrt(quaternionSqLen(dq));
    return dr > 0 ? 0.5 * r * Math.log(r) / dr : 0;
}

export function intersectJuliaFractal(ray, jf) {
    // Bounding sphere test (radius ~2)
    const oc = ray.origin;
    const a = ray.direction[0]**2 + ray.direction[1]**2 + ray.direction[2]**2;
    const b = 2*(oc[0]*ray.direction[0] + oc[1]*ray.direction[1] + oc[2]*ray.direction[2]);
    const c = oc[0]**2 + oc[1]**2 + oc[2]**2 - 4;
    const disc = b*b - 4*a*c;
    if (disc < 0) return null;

    const sqrtD = Math.sqrt(disc);
    let tStart = Math.max(1e-6, (-b - sqrtD) / (2*a));
    const tEnd = (-b + sqrtD) / (2*a);
    if (tEnd < 1e-6) return null;

    // Sphere tracing using distance estimator
    let t = tStart;
    for (let i = 0; i < 200; i++) {
        const p = vec3Add(ray.origin, vec3Scale(ray.direction, t));
        const d = juliaDistance(p, jf);
        if (d < 1e-4) {
            return { t, point: p };
        }
        t += d * 0.5; // conservative step
        if (t > tEnd) break;
    }
    return null;
}

export function normalJuliaFractal(point, jf) {
    const d = 1e-4;
    const v0 = juliaDistance(point, jf);
    return vec3Normalize([
        juliaDistance([point[0]+d, point[1], point[2]], jf) - v0,
        juliaDistance([point[0], point[1]+d, point[2]], jf) - v0,
        juliaDistance([point[0], point[1], point[2]+d], jf) - v0
    ]);
}

export function bboxJuliaFractal() {
    return { min: [-2, -2, -2], max: [2, 2, 2] };
}

export function insideJuliaFractal(point, jf) {
    return juliaDistance(point, jf) < 0;
}
