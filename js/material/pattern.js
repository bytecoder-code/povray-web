// POV-Ray Web - All pattern types
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { noise3d, turbulence, fbm } from './noise.js';

export function evaluatePattern(patternType, point, params = {}) {
    const x = point[0], y = point[1], z = point[2];
    const turb = params.turbulence;
    let px = x, py = y, pz = z;

    // Apply turbulence if specified
    if (turb) {
        const t = typeof turb === 'number' ? turb : (turb[0] + turb[1] + turb[2]) / 3;
        if (t > 0) {
            const omega = params.omega || 0.5;
            const lambda = params.lambda || 2.0;
            const octaves = params.octaves || 6;
            px += t * turbulence(x, y, z, omega, lambda, octaves);
            py += t * turbulence(x + 1000, y + 1000, z + 1000, omega, lambda, octaves);
            pz += t * turbulence(x + 2000, y + 2000, z + 2000, omega, lambda, octaves);
        }
    }

    let val = 0;

    switch (patternType) {
        case 'checker': {
            const ix = Math.floor(px + 1e-5);
            const iy = Math.floor(py + 1e-5);
            const iz = Math.floor(pz + 1e-5);
            return ((ix + iy + iz) % 2 + 2) % 2;
        }

        case 'gradient': {
            const axis = params.gradientAxis || [0, 1, 0];
            val = px * axis[0] + py * axis[1] + pz * axis[2];
            val = val - Math.floor(val);
            break;
        }

        case 'bozo':
            val = noise3d(px, py, pz);
            break;

        case 'granite':
            val = noise3d(px * 4, py * 4, pz * 4);
            // Granite uses turbulence-like accumulation
            val = 1 - Math.sqrt(Math.abs(val * 2 - 1));
            break;

        case 'marble': {
            val = px;
            // Marble uses turbulence on the coordinate then takes sine
            const t = params.turbulence;
            const tAmt = t ? (typeof t === 'number' ? t : (t[0] + t[1] + t[2]) / 3) : 0.5;
            if (tAmt > 0) {
                val += tAmt * turbulence(x, y, z);
            }
            val = (Math.sin(val * Math.PI) + 1) * 0.5;
            break;
        }

        case 'wood': {
            const dx = px, dz = pz;
            val = Math.sqrt(dx * dx + dz * dz);
            // Wood rings with noise perturbation
            const noiseAmt = noise3d(px * 0.1, py * 0.1, pz * 0.1) * 0.2;
            val = (val + noiseAmt) - Math.floor(val + noiseAmt);
            break;
        }

        case 'agate': {
            val = noise3d(px * 0.5, py * 0.5, pz * 0.5);
            const agateTurb = params.agateTurb || 1.0;
            val = (Math.sin(val * Math.PI * 2 * agateTurb) + 1) * 0.5;
            break;
        }

        case 'spotted':
            val = noise3d(px, py, pz);
            break;

        case 'onion': {
            const d = Math.sqrt(px * px + py * py + pz * pz);
            val = d - Math.floor(d);
            break;
        }

        case 'leopard': {
            const sx = Math.sin(px * Math.PI * 2);
            const sy = Math.sin(py * Math.PI * 2);
            const sz = Math.sin(pz * Math.PI * 2);
            val = (sx * sx + sy * sy + sz * sz) / 3;
            break;
        }

        case 'radial':
            val = Math.atan2(pz, px) / (2 * Math.PI) + 0.5;
            break;

        case 'crackle': {
            // Simplified Voronoi
            const fx = Math.floor(px), fy = Math.floor(py), fz = Math.floor(pz);
            let minDist = 10;
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    for (let dk = -1; dk <= 1; dk++) {
                        const cx = fx + di + noise3d((fx+di)*17.3, (fy+dj)*13.7, (fz+dk)*11.1);
                        const cy = fy + dj + noise3d((fx+di)*23.1, (fy+dj)*29.3, (fz+dk)*37.7);
                        const cz = fz + dk + noise3d((fx+di)*43.3, (fy+dj)*47.1, (fz+dk)*53.9);
                        const dx2 = px - cx, dy2 = py - cy, dz2 = pz - cz;
                        const dist = Math.sqrt(dx2*dx2 + dy2*dy2 + dz2*dz2);
                        minDist = Math.min(minDist, dist);
                    }
                }
            }
            val = Math.min(1, minDist);
            break;
        }

        case 'cells': {
            const fx = Math.floor(px), fy = Math.floor(py), fz = Math.floor(pz);
            val = noise3d(fx * 37.17, fy * 53.31, fz * 97.13);
            break;
        }

        case 'spiral1': {
            const angle = Math.atan2(pz, px);
            val = (angle / (2 * Math.PI) + 0.5 + py * 0.5);
            val = val - Math.floor(val);
            break;
        }

        case 'spiral2': {
            const angle = Math.atan2(pz, px);
            const r = Math.sqrt(px * px + pz * pz);
            val = (angle / (2 * Math.PI) + 0.5 + r * 0.5);
            val = val - Math.floor(val);
            break;
        }

        case 'hexagon': {
            // Simplified hexagonal pattern
            const s = Math.round(px / 1.5);
            const t2 = Math.round((py - s * 0.5) / 0.866);
            return ((s + t2) % 3 + 3) % 3 / 2;
        }

        case 'brick': {
            const brickWidth = params.brickSize ? params.brickSize[0] : 8;
            const brickHeight = params.brickSize ? params.brickSize[1] : 3;
            const mortar = params.mortar || 0.5;
            const row = Math.floor(py / brickHeight);
            const offset = (row % 2) * brickWidth * 0.5;
            const bx = (px + offset) % brickWidth;
            const by = py % brickHeight;
            if (bx < mortar || by < mortar) return 0; // mortar
            return 1; // brick
        }

        case 'waves': {
            const d = Math.sqrt(px * px + pz * pz);
            const freq = params.frequency || 1;
            val = (Math.sin(d * freq * Math.PI * 2) + 1) * 0.5;
            break;
        }

        case 'ripples': {
            const d = Math.sqrt(px * px + pz * pz);
            const freq = params.frequency || 1;
            val = (Math.cos(d * freq * Math.PI * 2) + 1) * 0.5;
            break;
        }

        case 'bumps':
            val = noise3d(px, py, pz);
            break;

        case 'dents':
            val = noise3d(px, py, pz);
            val = val * val * val;
            break;

        case 'wrinkles': {
            val = turbulence(px, py, pz, 0.5, 2.0, 6);
            break;
        }

        case 'boxed':
            val = Math.max(Math.abs(px), Math.abs(py), Math.abs(pz));
            val = Math.max(0, Math.min(1, 1 - val));
            break;

        case 'cylindrical':
            val = Math.sqrt(px * px + pz * pz);
            val = Math.max(0, Math.min(1, 1 - val));
            break;

        case 'spherical': {
            const d = Math.sqrt(px * px + py * py + pz * pz);
            val = Math.max(0, Math.min(1, 1 - d));
            break;
        }

        case 'planar':
            val = Math.max(0, Math.min(1, Math.abs(py)));
            break;

        default:
            val = 0.5;
    }

    // Apply wave type
    val = applyWaveType(val, params.waveType);

    // Apply frequency and phase
    if (params.frequency && params.frequency !== 1) {
        val = val * params.frequency;
        val = val - Math.floor(val);
    }
    if (params.phase) {
        val = val + params.phase;
        val = val - Math.floor(val);
    }

    return Math.max(0, Math.min(1, val));
}

function applyWaveType(val, waveType) {
    switch (waveType) {
        case 'ramp_wave': return val - Math.floor(val);
        case 'sine_wave': return (Math.sin(val * Math.PI * 2) + 1) * 0.5;
        case 'triangle_wave': {
            val = val - Math.floor(val);
            return val < 0.5 ? val * 2 : 2 - val * 2;
        }
        case 'scallop_wave': return Math.abs(Math.sin(val * Math.PI));
        case 'cubic_wave': return val * val * (3 - 2 * val);
        case 'poly_wave': return val; // default exponent 1
        default: return val; // raw
    }
}

export function sampleColorMap(colorMap, value) {
    if (!colorMap || colorMap.length === 0) return [1, 1, 1, 0, 0];
    if (value <= colorMap[0][0]) return [...colorMap[0][1]];
    if (value >= colorMap[colorMap.length - 1][0]) return [...colorMap[colorMap.length - 1][1]];

    for (let i = 0; i < colorMap.length - 1; i++) {
        const [v0, c0] = colorMap[i];
        const [v1, c1] = colorMap[i + 1];
        if (value >= v0 && value <= v1) {
            const t = (v1 - v0) > 0 ? (value - v0) / (v1 - v0) : 0;
            return [
                c0[0] + (c1[0] - c0[0]) * t,
                c0[1] + (c1[1] - c0[1]) * t,
                c0[2] + (c1[2] - c0[2]) * t,
                (c0[3]||0) + ((c1[3]||0) - (c0[3]||0)) * t,
                (c0[4]||0) + ((c1[4]||0) - (c0[4]||0)) * t
            ];
        }
    }
    return [...colorMap[colorMap.length - 1][1]];
}
