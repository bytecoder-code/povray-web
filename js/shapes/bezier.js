// POV-Ray Web - Bicubic patch intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// 16 control points defining a 4x4 Bezier surface patch

import { vec3Min, vec3Max } from '../math/vector.js';
import { buildTriangle, intersectTriangleList } from './geometry-utils.js';

export function createBicubicPatch(type, flatness, uSteps, vSteps, points) {
    // points: 16 control points as array of [x,y,z]
    let bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
    for (const p of points) {
        bmin = vec3Min(bmin, p);
        bmax = vec3Max(bmax, p);
    }
    // Tessellate into triangles for ray intersection
    const triangles = tessellate(points, uSteps || 4, vSteps || 4);
    return {
        shapeType: 'bicubic_patch',
        points, type, flatness, uSteps, vSteps,
        triangles,
        bbox: { min: bmin, max: bmax }
    };
}

function bernstein(t) {
    const s = 1 - t;
    return [s*s*s, 3*s*s*t, 3*s*t*t, t*t*t];
}

function evalPatch(points, u, v) {
    const bu = bernstein(u), bv = bernstein(v);
    let x = 0, y = 0, z = 0;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const w = bu[i] * bv[j];
            const p = points[i * 4 + j];
            x += w * p[0]; y += w * p[1]; z += w * p[2];
        }
    }
    return [x, y, z];
}

function tessellate(points, uSteps, vSteps) {
    const tris = [];
    const grid = [];
    for (let i = 0; i <= uSteps; i++) {
        grid[i] = [];
        for (let j = 0; j <= vSteps; j++) {
            grid[i][j] = evalPatch(points, i / uSteps, j / vSteps);
        }
    }
    for (let i = 0; i < uSteps; i++) {
        for (let j = 0; j < vSteps; j++) {
            const p00 = grid[i][j], p10 = grid[i+1][j];
            const p01 = grid[i][j+1], p11 = grid[i+1][j+1];
            tris.push(buildTriangle(p00, p10, p11));
            tris.push(buildTriangle(p00, p11, p01));
        }
    }
    return tris;
}

export function intersectBicubicPatch(ray, bp) {
    const hit = intersectTriangleList(ray, bp.triangles, bp.bbox);
    if (!hit) return null;
    return { t: hit.t, point: hit.point, _normal: hit.normal };
}

export function normalBicubicPatch(point, bp, hitData) {
    return hitData?._normal || [0, 1, 0];
}

export function bboxBicubicPatch(bp) { return bp.bbox; }
export function insideBicubicPatch() { return false; }
