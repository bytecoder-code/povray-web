// POV-Ray Web - Triangle and smooth triangle intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Sub, vec3Dot, vec3Cross, vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';

export function createTriangle(p1, p2, p3) {
    const e1 = vec3Sub(p2, p1);
    const e2 = vec3Sub(p3, p1);
    const normal = vec3Normalize(vec3Cross(e1, e2));
    return {
        shapeType: 'triangle',
        p1, p2, p3, e1, e2, normal,
        smooth: false
    };
}

export function createSmoothTriangle(p1, p2, p3, n1, n2, n3) {
    const e1 = vec3Sub(p2, p1);
    const e2 = vec3Sub(p3, p1);
    const normal = vec3Normalize(vec3Cross(e1, e2));
    return {
        shapeType: 'triangle',
        p1, p2, p3, e1, e2, normal,
        n1: vec3Normalize(n1),
        n2: vec3Normalize(n2),
        n3: vec3Normalize(n3),
        smooth: true
    };
}

// Moller-Trumbore intersection
export function intersectTriangle(ray, tri) {
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

    const point = vec3Add(ray.origin, vec3Scale(ray.direction, t));
    return { t, point, u, v };
}

export function normalTriangle(point, tri, hitData) {
    if (tri.smooth && hitData) {
        const u = hitData.u, v = hitData.v;
        const w = 1 - u - v;
        return vec3Normalize([
            w * tri.n1[0] + u * tri.n2[0] + v * tri.n3[0],
            w * tri.n1[1] + u * tri.n2[1] + v * tri.n3[1],
            w * tri.n1[2] + u * tri.n2[2] + v * tri.n3[2]
        ]);
    }
    return [...tri.normal];
}

export function bboxTriangle(tri) {
    return {
        min: [
            Math.min(tri.p1[0], tri.p2[0], tri.p3[0]),
            Math.min(tri.p1[1], tri.p2[1], tri.p3[1]),
            Math.min(tri.p1[2], tri.p2[2], tri.p3[2])
        ],
        max: [
            Math.max(tri.p1[0], tri.p2[0], tri.p3[0]),
            Math.max(tri.p1[1], tri.p2[1], tri.p3[1]),
            Math.max(tri.p1[2], tri.p2[2], tri.p3[2])
        ]
    };
}

export function insideTriangle() {
    return false; // Triangles are infinitely thin
}
