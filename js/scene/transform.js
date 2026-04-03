// POV-Ray Web - Scene-level transform management
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import * as mat from '../math/matrix.js';

export function createTransform() {
    return {
        matrix: mat.identity(),
        inverse: mat.identity()
    };
}

export function applyTranslate(transform, v) {
    const t = mat.translate(v[0], v[1], v[2]);
    const ti = mat.translate(-v[0], -v[1], -v[2]);
    transform.matrix = mat.multiply(t, transform.matrix);
    transform.inverse = mat.multiply(transform.inverse, ti);
}

export function applyRotate(transform, v) {
    const deg = Math.PI / 180;
    let r = mat.identity();
    let ri = mat.identity();
    if (v[0] !== 0) {
        r = mat.multiply(mat.rotateX(v[0] * deg), r);
        ri = mat.multiply(ri, mat.rotateX(-v[0] * deg));
    }
    if (v[1] !== 0) {
        r = mat.multiply(mat.rotateY(v[1] * deg), r);
        ri = mat.multiply(ri, mat.rotateY(-v[1] * deg));
    }
    if (v[2] !== 0) {
        r = mat.multiply(mat.rotateZ(v[2] * deg), r);
        ri = mat.multiply(ri, mat.rotateZ(-v[2] * deg));
    }
    transform.matrix = mat.multiply(r, transform.matrix);
    transform.inverse = mat.multiply(transform.inverse, ri);
}

export function applyScale(transform, v) {
    const s = mat.scale(v[0], v[1], v[2]);
    const si = mat.scale(1 / v[0], 1 / v[1], 1 / v[2]);
    transform.matrix = mat.multiply(s, transform.matrix);
    transform.inverse = mat.multiply(transform.inverse, si);
}

export function applyMatrix(transform, vals) {
    const m = mat.fromPovMatrix(...vals);
    const mi = mat.invert(m);
    transform.matrix = mat.multiply(m, transform.matrix);
    transform.inverse = mat.multiply(transform.inverse, mi);
}

export function composeTransforms(outer, inner) {
    return {
        matrix: mat.multiply(outer.matrix, inner.matrix),
        inverse: mat.multiply(inner.inverse, outer.inverse)
    };
}
