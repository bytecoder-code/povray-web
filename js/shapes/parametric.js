// POV-Ray Web - Parametric surface intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Surface defined by x=f(u,v), y=g(u,v), z=h(u,v)

import { buildTriangle, intersectTriangleList, rayBoxTest } from './geometry-utils.js';

export function createParametric(fnX, fnY, fnZ, uRange, vRange, containedBy, accuracy, maxGradient) {
    return {
        shapeType: 'parametric',
        fnX: fnX || ((u, v) => Math.cos(u) * Math.cos(v)),
        fnY: fnY || ((u, v) => Math.sin(u) * Math.cos(v)),
        fnZ: fnZ || ((u, v) => Math.sin(v)),
        uMin: uRange ? uRange[0] : 0,
        uMax: uRange ? uRange[1] : 2 * Math.PI,
        vMin: vRange ? vRange[0] : -Math.PI / 2,
        vMax: vRange ? vRange[1] : Math.PI / 2,
        containedBy: containedBy || { type: 'box', corner1: [-2,-2,-2], corner2: [2,2,2] },
        accuracy: accuracy || 0.001,
        maxGradient: maxGradient || 10,
        _mesh: null
    };
}

// Tessellate the parametric surface into triangles for intersection
function tessellate(ps, uSteps, vSteps) {
    uSteps = uSteps || 30;
    vSteps = vSteps || 30;
    const tris = [];
    const grid = [];

    for (let i = 0; i <= uSteps; i++) {
        grid[i] = [];
        const u = ps.uMin + (ps.uMax - ps.uMin) * i / uSteps;
        for (let j = 0; j <= vSteps; j++) {
            const v = ps.vMin + (ps.vMax - ps.vMin) * j / vSteps;
            grid[i][j] = [ps.fnX(u, v), ps.fnY(u, v), ps.fnZ(u, v)];
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

function ensureMesh(ps) {
    if (!ps._mesh) {
        ps._mesh = tessellate(ps, 30, 30);
    }
    return ps._mesh;
}

export function intersectParametric(ray, ps) {
    // Bounding box test
    const cb = ps.containedBy;
    const bmin = cb.corner1 || [-2,-2,-2];
    const bmax = cb.corner2 || [2,2,2];
    if (!rayBoxTest(ray, bmin, bmax)) return null;

    const tris = ensureMesh(ps);
    const hit = intersectTriangleList(ray, tris);
    if (!hit) return null;
    return { t: hit.t, point: hit.point, _normal: hit.normal };
}

export function normalParametric(point, ps, hitData) {
    return hitData?._normal || [0, 1, 0];
}

export function bboxParametric(ps) {
    const cb = ps.containedBy;
    return { min: cb.corner1 || [-2,-2,-2], max: cb.corner2 || [2,2,2] };
}

export function insideParametric() { return false; }
