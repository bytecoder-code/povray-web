// POV-Ray Web - Polynomial root solvers (quadratic, cubic, quartic)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

const EPSILON = 1e-10;

export function solveQuadratic(a, b, c) {
    if (Math.abs(a) < EPSILON) {
        if (Math.abs(b) < EPSILON) return [];
        return [-c / b];
    }
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    if (disc < EPSILON) return [-b / (2 * a)];
    const sqrtD = Math.sqrt(disc);
    const inv2a = 1 / (2 * a);
    return [(-b - sqrtD) * inv2a, (-b + sqrtD) * inv2a];
}

export function solveCubic(a, b, c, d) {
    if (Math.abs(a) < EPSILON) return solveQuadratic(b, c, d);

    // Normalize: x^3 + px^2 + qx + r = 0
    const p = b / a, q = c / a, r = d / a;
    const p3 = p / 3;

    // Depressed cubic: t^3 + pt + q = 0
    const A = q - p * p / 3;
    const B = r - p * q / 3 + 2 * p * p * p / 27;

    const A3 = A / 3;
    const B2 = B / 2;
    const disc = B2 * B2 + A3 * A3 * A3;

    const roots = [];

    if (disc > EPSILON) {
        // One real root
        const sqrtDisc = Math.sqrt(disc);
        const u = Math.cbrt(-B2 + sqrtDisc);
        const v = Math.cbrt(-B2 - sqrtDisc);
        roots.push(u + v - p3);
    } else if (disc < -EPSILON) {
        // Three real roots (casus irreducibilis)
        const m = 2 * Math.sqrt(-A / 3);
        const theta = Math.acos(3 * B / (A * m)) / 3;
        roots.push(m * Math.cos(theta) - p3);
        roots.push(m * Math.cos(theta - 2 * Math.PI / 3) - p3);
        roots.push(m * Math.cos(theta - 4 * Math.PI / 3) - p3);
    } else {
        // Double or triple root
        if (Math.abs(B) < EPSILON) {
            roots.push(-p3);
        } else {
            const u = Math.cbrt(-B2);
            roots.push(2 * u - p3);
            roots.push(-u - p3);
        }
    }

    return roots;
}

export function solveQuartic(a, b, c, d, e) {
    if (Math.abs(a) < EPSILON) return solveCubic(b, c, d, e);

    // Normalize: x^4 + Bx^3 + Cx^2 + Dx + E = 0
    const B = b / a, C = c / a, D = d / a, E = e / a;
    const B4 = B / 4;

    // Depressed quartic: y^4 + py^2 + qy + r = 0 where x = y - B/4
    const p = C - 6 * B4 * B4;
    const q = D - 2 * C * B4 + 8 * B4 * B4 * B4;
    const r = E - D * B4 + C * B4 * B4 - 3 * B4 * B4 * B4 * B4;

    if (Math.abs(q) < EPSILON) {
        // Biquadratic: y^4 + py^2 + r = 0
        const quadRoots = solveQuadratic(1, p, r);
        const roots = [];
        for (const root of quadRoots) {
            if (root >= 0) {
                const s = Math.sqrt(root);
                roots.push(s - B4);
                roots.push(-s - B4);
            } else if (root > -EPSILON) {
                roots.push(-B4);
            }
        }
        return roots;
    }

    // Ferrari's method: solve resolvent cubic
    // z^3 - p/2 * z^2 - r*z + (p*r/2 - q^2/8) = 0
    const cubicRoots = solveCubic(1, -p / 2, -r, p * r / 2 - q * q / 8);

    // Find a real root of the resolvent cubic that gives positive discriminant
    let z = null;
    for (const root of cubicRoots) {
        if (2 * root - p > -EPSILON) {
            z = root;
            break;
        }
    }

    if (z === null) {
        // Fallback: use largest root
        z = cubicRoots.length > 0 ? Math.max(...cubicRoots) : 0;
    }

    const u = Math.sqrt(Math.max(0, 2 * z - p));
    const roots = [];

    if (u > EPSILON) {
        const v = q / (2 * u);
        const roots1 = solveQuadratic(1, u, z - v);
        const roots2 = solveQuadratic(1, -u, z + v);
        for (const root of roots1) roots.push(root - B4);
        for (const root of roots2) roots.push(root - B4);
    } else {
        const disc = z * z - r;
        if (disc >= 0) {
            const s = Math.sqrt(disc);
            const roots1 = solveQuadratic(1, 0, z - s);
            const roots2 = solveQuadratic(1, 0, z + s);
            for (const root of roots1) roots.push(root - B4);
            for (const root of roots2) roots.push(root - B4);
        }
    }

    return roots;
}
