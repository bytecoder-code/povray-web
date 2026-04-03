// POV-Ray Web - Shared geometry utilities
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Eliminates duplication of rayBoxTest, triangle intersection, and ray marching

import { vec3Sub, vec3Dot, vec3Cross, vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';

// AABB ray test with raw min/max arrays — used by shapes that store their own bbox
export function rayBoxTest(ray, bmin, bmax) {
    let tMin = -Infinity, tMax = Infinity;
    for (let i = 0; i < 3; i++) {
        if (Math.abs(ray.direction[i]) < 1e-12) {
            if (ray.origin[i] < bmin[i] || ray.origin[i] > bmax[i]) return false;
        } else {
            const invD = 1 / ray.direction[i];
            let t1 = (bmin[i] - ray.origin[i]) * invD;
            let t2 = (bmax[i] - ray.origin[i]) * invD;
            if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
            tMin = Math.max(tMin, t1);
            tMax = Math.min(tMax, t2);
            if (tMin > tMax) return false;
        }
    }
    return tMax > 0;
}

// Moller-Trumbore ray-triangle intersection
// tri must have: p1, e1 (p2-p1), e2 (p3-p1), normal
// Returns null or { t, point, u, v, normal }
export function intersectTriangleMT(ray, tri) {
    const h = vec3Cross(ray.direction, tri.e2);
    const a = vec3Dot(tri.e1, h);
    if (Math.abs(a) < 1e-12) return null;

    const f = 1 / a;
    const s = vec3Sub(ray.origin, tri.p1);
    const u = f * vec3Dot(s, h);
    if (u < 0 || u > 1) return null;

    const q = vec3Cross(s, tri.e1);
    const v = f * vec3Dot(ray.direction, q);
    if (v < 0 || u + v > 1) return null;

    const t = f * vec3Dot(tri.e2, q);
    if (t < 1e-6) return null;

    return {
        t,
        point: vec3Add(ray.origin, vec3Scale(ray.direction, t)),
        u, v,
        normal: tri.normal
    };
}

// Find closest intersection among an array of pre-computed triangles
// Each triangle needs: p1, e1, e2, normal, and optionally n1/n2/n3 + smooth
export function intersectTriangleList(ray, triangles, bbox) {
    if (bbox && !rayBoxTest(ray, bbox.min, bbox.max)) return null;

    let bestT = Infinity, bestHit = null;
    for (const tri of triangles) {
        const hit = intersectTriangleMT(ray, tri);
        if (hit && hit.t < bestT) {
            bestT = hit.t;
            // Smooth normal interpolation if available
            if (tri.smooth && tri.n1) {
                const w = 1 - hit.u - hit.v;
                hit.normal = vec3Normalize([
                    w * tri.n1[0] + hit.u * tri.n2[0] + hit.v * tri.n3[0],
                    w * tri.n1[1] + hit.u * tri.n2[1] + hit.v * tri.n3[1],
                    w * tri.n1[2] + hit.u * tri.n2[2] + hit.v * tri.n3[2]
                ]);
            }
            bestHit = hit;
        }
    }
    return bestHit;
}

// Generic ray march with bisection refinement
// evalFn(point) returns signed distance (negative = inside surface)
// Returns null or { t, point }
export function rayMarch(ray, evalFn, tEntry, tExit, options = {}) {
    const steps = options.steps || 200;
    const bisections = options.bisections || 15;
    const dt = (tExit - tEntry) / steps;

    let prevVal = evalFn(vec3Add(ray.origin, vec3Scale(ray.direction, tEntry)));

    for (let i = 1; i <= steps; i++) {
        const t = tEntry + i * dt;
        const p = vec3Add(ray.origin, vec3Scale(ray.direction, t));
        const val = evalFn(p);

        if (prevVal * val < 0) {
            // Sign change — bisect to refine
            let tLo = tEntry + (i - 1) * dt, tHi = t;
            for (let j = 0; j < bisections; j++) {
                const tm = (tLo + tHi) * 0.5;
                const mp = vec3Add(ray.origin, vec3Scale(ray.direction, tm));
                if (evalFn(mp) * val > 0) tHi = tm;
                else tLo = tm;
            }
            const ft = (tLo + tHi) * 0.5;
            if (ft < 1e-6) { prevVal = val; continue; }
            return { t: ft, point: vec3Add(ray.origin, vec3Scale(ray.direction, ft)) };
        }
        prevVal = val;
    }
    return null;
}

// Compute numerical gradient (for normals on implicit surfaces)
export function numericalGradient(evalFn, point, delta = 0.001) {
    const v0 = evalFn(point);
    return vec3Normalize([
        evalFn([point[0] + delta, point[1], point[2]]) - v0,
        evalFn([point[0], point[1] + delta, point[2]]) - v0,
        evalFn([point[0], point[1], point[2] + delta]) - v0
    ]);
}

// Helper: build pre-computed triangle with edges and normal
export function buildTriangle(p1, p2, p3) {
    const e1 = vec3Sub(p2, p1);
    const e2 = vec3Sub(p3, p1);
    return { p1, p2, p3, e1, e2, normal: vec3Normalize(vec3Cross(e1, e2)) };
}

// Pack a vec3 into a Float32Array at offset
export function packVec3(buf, offset, v) {
    buf[offset] = v[0]; buf[offset + 1] = v[1]; buf[offset + 2] = v[2];
}
