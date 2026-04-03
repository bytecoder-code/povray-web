// POV-Ray Web - Vector math operations
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Uses plain Float64Arrays for performance

export function vec3(x = 0, y = 0, z = 0) {
    return [x, y, z];
}

export function vec3Add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function vec3Sub(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function vec3Mul(a, b) {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}

export function vec3Scale(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

export function vec3Dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vec3Cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

export function vec3Length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export function vec3LengthSq(v) {
    return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

export function vec3Normalize(v) {
    const len = vec3Length(v);
    if (len === 0) return [0, 0, 0];
    const inv = 1 / len;
    return [v[0] * inv, v[1] * inv, v[2] * inv];
}

export function vec3Negate(v) {
    return [-v[0], -v[1], -v[2]];
}

export function vec3Lerp(a, b, t) {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t
    ];
}

export function vec3Min(a, b) {
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2])];
}

export function vec3Max(a, b) {
    return [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];
}

export function vec3Reflect(v, n) {
    const d = 2 * vec3Dot(v, n);
    return [v[0] - d * n[0], v[1] - d * n[1], v[2] - d * n[2]];
}

export function vec3AxisRotate(v, axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const ax = axis[0], ay = axis[1], az = axis[2];
    return [
        (t * ax * ax + c)      * v[0] + (t * ax * ay - s * az) * v[1] + (t * ax * az + s * ay) * v[2],
        (t * ax * ay + s * az) * v[0] + (t * ay * ay + c)      * v[1] + (t * ay * az - s * ax) * v[2],
        (t * ax * az - s * ay) * v[0] + (t * ay * az + s * ax) * v[1] + (t * az * az + c)      * v[2]
    ];
}

export function vec5(r = 0, g = 0, b = 0, f = 0, t = 0) {
    return [r, g, b, f, t];
}

export function colorAdd(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4] + b[4]];
}

export function colorScale(c, s) {
    return [c[0] * s, c[1] * s, c[2] * s, c[3] * s, c[4] * s];
}

export function colorMul(a, b) {
    return [a[0] * b[0], a[1] * b[1], a[2] * b[2], a[3], a[4]];
}
