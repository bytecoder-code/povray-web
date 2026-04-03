// POV-Ray Web - Warp transforms for texture coordinates
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { turbulence } from './noise.js';

export function applyWarps(point, warps) {
    if (!warps || warps.length === 0) return point;
    let p = [...point];
    for (const warp of warps) {
        p = applyWarp(p, warp);
    }
    return p;
}

function applyWarp(point, warp) {
    switch (warp.type) {
        case 'turbulence': {
            const oct = warp.octaves || 6;
            const omega = warp.omega || 0.5;
            const lambda = warp.lambda || 2.0;
            const strength = warp.turbulence || [1, 1, 1];
            const sx = typeof strength === 'number' ? strength : strength[0];
            const sy = typeof strength === 'number' ? strength : strength[1];
            const sz = typeof strength === 'number' ? strength : strength[2];
            return [
                point[0] + sx * turbulence(point[0], point[1], point[2], omega, lambda, oct),
                point[1] + sy * turbulence(point[0]+1000, point[1]+1000, point[2]+1000, omega, lambda, oct),
                point[2] + sz * turbulence(point[0]+2000, point[1]+2000, point[2]+2000, omega, lambda, oct)
            ];
        }

        case 'repeat': {
            const axis = warp.axis || 0; // 0=x, 1=y, 2=z
            const width = warp.width || 1;
            const offset = warp.offset || [0, 0, 0];
            const flip = warp.flip || [0, 0, 0];
            const p = [...point];
            const cell = Math.floor(p[axis] / width);
            p[axis] = p[axis] - cell * width;
            // Apply offset for alternating cells
            if (cell % 2 !== 0) {
                p[0] += offset[0]; p[1] += offset[1]; p[2] += offset[2];
                if (flip[0]) p[0] = width - p[0];
                if (flip[1]) p[1] = width - p[1];
                if (flip[2]) p[2] = width - p[2];
            }
            return p;
        }

        case 'black_hole': {
            const center = warp.center || [0, 0, 0];
            const radius = warp.radius || 1;
            const strength = warp.strength || 1;
            const dx = point[0] - center[0];
            const dy = point[1] - center[1];
            const dz = point[2] - center[2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist < radius && dist > 0.001) {
                const factor = strength * (1 - dist / radius);
                return [
                    point[0] - dx * factor / dist,
                    point[1] - dy * factor / dist,
                    point[2] - dz * factor / dist
                ];
            }
            return point;
        }

        case 'cylindrical': {
            // Cylindrical mapping warp
            const r = Math.sqrt(point[0]*point[0] + point[2]*point[2]);
            const theta = Math.atan2(point[0], point[2]);
            return [theta / Math.PI, point[1], r - 1];
        }

        case 'spherical': {
            const r = Math.sqrt(point[0]*point[0] + point[1]*point[1] + point[2]*point[2]);
            if (r < 1e-10) return point;
            const theta = Math.acos(Math.max(-1, Math.min(1, point[1] / r)));
            const phi = Math.atan2(point[0], point[2]);
            return [phi / Math.PI, 1 - 2 * theta / Math.PI, r - 1];
        }

        case 'planar':
            return point;

        default:
            return point;
    }
}
