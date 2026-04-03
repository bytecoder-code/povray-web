// POV-Ray Web - Surface of Revolution (SOR)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Similar to lathe but uses cubic spline through control points

import { vec3Add, vec3Scale, vec3Normalize } from '../math/vector.js';

export function createSOR(points) {
    let maxR = 0, minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        maxR = Math.max(maxR, Math.abs(p[0]));
        minY = Math.min(minY, p[1]);
        maxY = Math.max(maxY, p[1]);
    }

    return {
        shapeType: 'sor',
        points, // [radius, height] pairs
        maxR, minY, maxY
    };
}

export function intersectSOR(ray, sor) {
    const ox = ray.origin[0], oy = ray.origin[1], oz = ray.origin[2];
    const dx = ray.direction[0], dy = ray.direction[1], dz = ray.direction[2];

    // Bounding cylinder check
    const a = dx*dx + dz*dz;
    const b = 2*(ox*dx + oz*dz);
    const c = ox*ox + oz*oz - sor.maxR * sor.maxR;
    if (a > 1e-12 && b*b - 4*a*c < 0) return null;

    // Ray march
    const steps = 200;
    const tMax = 40;
    const dt = tMax / steps;
    let prevDiff = null;

    for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        const px = ox + dx * t, py = oy + dy * t, pz = oz + dz * t;
        if (py < sor.minY || py > sor.maxY) { prevDiff = null; continue; }

        const r = Math.sqrt(px*px + pz*pz);
        const profileR = sampleSOR(sor, py);
        if (profileR < 0) { prevDiff = null; continue; }

        const diff = r - profileR;
        if (prevDiff !== null && prevDiff * diff < 0) {
            let tLo = (i-1) * dt, tHi = t;
            for (let j = 0; j < 15; j++) {
                const tm = (tLo + tHi) * 0.5;
                const mx = ox+dx*tm, my = oy+dy*tm, mz = oz+dz*tm;
                const mr = Math.sqrt(mx*mx + mz*mz);
                const mpr = sampleSOR(sor, my);
                if (mpr < 0 || (mr - mpr) * diff > 0) tHi = tm; else tLo = tm;
            }
            const ft = (tLo + tHi) * 0.5;
            if (ft > 1e-6) {
                return { t: ft, point: vec3Add(ray.origin, vec3Scale(ray.direction, ft)) };
            }
        }
        prevDiff = diff;
    }
    return null;
}

function sampleSOR(sor, y) {
    const pts = sor.points;
    for (let i = 0; i < pts.length - 1; i++) {
        const y0 = pts[i][1], y1 = pts[i+1][1];
        if ((y >= y0 && y <= y1) || (y >= y1 && y <= y0)) {
            const t = (y1 !== y0) ? (y - y0) / (y1 - y0) : 0;
            return pts[i][0] + t * (pts[i+1][0] - pts[i][0]);
        }
    }
    return -1;
}

export function normalSOR(point, sor) {
    const r = Math.sqrt(point[0]*point[0] + point[2]*point[2]);
    if (r < 1e-10) return [0, 1, 0];
    const d = 0.001;
    const rUp = sampleSOR(sor, point[1] + d);
    const rDown = sampleSOR(sor, point[1] - d);
    const drdy = (rUp >= 0 && rDown >= 0) ? (rUp - rDown) / (2*d) : 0;
    return vec3Normalize([point[0]/r, -drdy, point[2]/r]);
}

export function bboxSOR(sor) {
    const r = sor.maxR;
    return { min: [-r, sor.minY, -r], max: [r, sor.maxY, r] };
}

export function insideSOR(point, sor) {
    const r = Math.sqrt(point[0]*point[0] + point[2]*point[2]);
    const pr = sampleSOR(sor, point[1]);
    return pr >= 0 && r < pr;
}
