// POV-Ray Web - 4x4 matrix operations (column-major Float64Array)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export function identity() {
    return new Float64Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

export function multiply(a, b) {
    const r = new Float64Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            r[j * 4 + i] =
                a[0 * 4 + i] * b[j * 4 + 0] +
                a[1 * 4 + i] * b[j * 4 + 1] +
                a[2 * 4 + i] * b[j * 4 + 2] +
                a[3 * 4 + i] * b[j * 4 + 3];
        }
    }
    return r;
}

export function translate(tx, ty, tz) {
    const m = identity();
    m[12] = tx;
    m[13] = ty;
    m[14] = tz;
    return m;
}

export function scale(sx, sy, sz) {
    const m = new Float64Array(16);
    m[0] = sx;
    m[5] = sy;
    m[10] = sz;
    m[15] = 1;
    return m;
}

export function rotateX(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = identity();
    m[5] = c; m[6] = s;
    m[9] = -s; m[10] = c;
    return m;
}

export function rotateY(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = identity();
    m[0] = c; m[2] = -s;
    m[8] = s; m[10] = c;
    return m;
}

export function rotateZ(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = identity();
    m[0] = c; m[1] = s;
    m[4] = -s; m[5] = c;
    return m;
}

export function rotateXYZ(rx, ry, rz) {
    const deg = Math.PI / 180;
    let m = identity();
    if (rx !== 0) m = multiply(rotateX(rx * deg), m);
    if (ry !== 0) m = multiply(rotateY(ry * deg), m);
    if (rz !== 0) m = multiply(rotateZ(rz * deg), m);
    return m;
}

// POV-Ray matrix { a, b, c, d, e, f, g, h, i, j, k, l }
export function fromPovMatrix(a, b, c, d, e, f, g, h, i, j, k, l) {
    return new Float64Array([
        a, b, c, 0,
        d, e, f, 0,
        g, h, i, 0,
        j, k, l, 1
    ]);
}

export function invert(m) {
    const inv = new Float64Array(16);
    inv[0] = m[5]*m[10]*m[15] - m[5]*m[11]*m[14] - m[9]*m[6]*m[15] + m[9]*m[7]*m[14] + m[13]*m[6]*m[11] - m[13]*m[7]*m[10];
    inv[4] = -m[4]*m[10]*m[15] + m[4]*m[11]*m[14] + m[8]*m[6]*m[15] - m[8]*m[7]*m[14] - m[12]*m[6]*m[11] + m[12]*m[7]*m[10];
    inv[8] = m[4]*m[9]*m[15] - m[4]*m[11]*m[13] - m[8]*m[5]*m[15] + m[8]*m[7]*m[13] + m[12]*m[5]*m[11] - m[12]*m[7]*m[9];
    inv[12] = -m[4]*m[9]*m[14] + m[4]*m[10]*m[13] + m[8]*m[5]*m[14] - m[8]*m[6]*m[13] - m[12]*m[5]*m[10] + m[12]*m[6]*m[9];
    inv[1] = -m[1]*m[10]*m[15] + m[1]*m[11]*m[14] + m[9]*m[2]*m[15] - m[9]*m[3]*m[14] - m[13]*m[2]*m[11] + m[13]*m[3]*m[10];
    inv[5] = m[0]*m[10]*m[15] - m[0]*m[11]*m[14] - m[8]*m[2]*m[15] + m[8]*m[3]*m[14] + m[12]*m[2]*m[11] - m[12]*m[3]*m[10];
    inv[9] = -m[0]*m[9]*m[15] + m[0]*m[11]*m[13] + m[8]*m[1]*m[15] - m[8]*m[3]*m[13] - m[12]*m[1]*m[11] + m[12]*m[3]*m[9];
    inv[13] = m[0]*m[9]*m[14] - m[0]*m[10]*m[13] - m[8]*m[1]*m[14] + m[8]*m[2]*m[13] + m[12]*m[1]*m[10] - m[12]*m[2]*m[9];
    inv[2] = m[1]*m[6]*m[15] - m[1]*m[7]*m[14] - m[5]*m[2]*m[15] + m[5]*m[3]*m[14] + m[13]*m[2]*m[7] - m[13]*m[3]*m[6];
    inv[6] = -m[0]*m[6]*m[15] + m[0]*m[7]*m[14] + m[4]*m[2]*m[15] - m[4]*m[3]*m[14] - m[12]*m[2]*m[7] + m[12]*m[3]*m[6];
    inv[10] = m[0]*m[5]*m[15] - m[0]*m[7]*m[13] - m[4]*m[1]*m[15] + m[4]*m[3]*m[13] + m[12]*m[1]*m[7] - m[12]*m[3]*m[5];
    inv[14] = -m[0]*m[5]*m[14] + m[0]*m[6]*m[13] + m[4]*m[1]*m[14] - m[4]*m[2]*m[13] - m[12]*m[1]*m[6] + m[12]*m[2]*m[5];
    inv[3] = -m[1]*m[6]*m[11] + m[1]*m[7]*m[10] + m[5]*m[2]*m[11] - m[5]*m[3]*m[10] - m[9]*m[2]*m[7] + m[9]*m[3]*m[6];
    inv[7] = m[0]*m[6]*m[11] - m[0]*m[7]*m[10] - m[4]*m[2]*m[11] + m[4]*m[3]*m[10] + m[8]*m[2]*m[7] - m[8]*m[3]*m[6];
    inv[11] = -m[0]*m[5]*m[11] + m[0]*m[7]*m[9] + m[4]*m[1]*m[11] - m[4]*m[3]*m[9] - m[8]*m[1]*m[7] + m[8]*m[3]*m[5];
    inv[15] = m[0]*m[5]*m[10] - m[0]*m[6]*m[9] - m[4]*m[1]*m[10] + m[4]*m[2]*m[9] + m[8]*m[1]*m[6] - m[8]*m[2]*m[5];

    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    if (Math.abs(det) < 1e-20) return identity();
    det = 1.0 / det;
    for (let i = 0; i < 16; i++) inv[i] *= det;
    return inv;
}

export function transformPoint(m, p) {
    return [
        m[0] * p[0] + m[4] * p[1] + m[8]  * p[2] + m[12],
        m[1] * p[0] + m[5] * p[1] + m[9]  * p[2] + m[13],
        m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]
    ];
}

export function transformDirection(m, d) {
    return [
        m[0] * d[0] + m[4] * d[1] + m[8]  * d[2],
        m[1] * d[0] + m[5] * d[1] + m[9]  * d[2],
        m[2] * d[0] + m[6] * d[1] + m[10] * d[2]
    ];
}

export function transformNormal(invM, n) {
    // Normal transforms by inverse transpose
    return [
        invM[0] * n[0] + invM[1] * n[1] + invM[2]  * n[2],
        invM[4] * n[0] + invM[5] * n[1] + invM[6]  * n[2],
        invM[8] * n[0] + invM[9] * n[1] + invM[10] * n[2]
    ];
}

export function transpose(m) {
    return new Float64Array([
        m[0], m[4], m[8],  m[12],
        m[1], m[5], m[9],  m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ]);
}
