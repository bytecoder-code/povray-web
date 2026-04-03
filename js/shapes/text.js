// POV-Ray Web - Text primitive
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Simplified: creates extruded rectangular blocks for each character
// Full implementation would parse TTF outlines

import { vec3Sub } from '../math/vector.js';
import { buildTriangle, intersectTriangleList } from './geometry-utils.js';

export function createText(fontFile, textString, thickness, offset) {
    // Generate a simple mesh for the text by creating boxes for each character
    const depth = thickness || 1;
    const charWidth = 0.6;
    const charHeight = 1.0;
    const charSpacing = 0.1;
    const offsetVec = offset || [0, 0, 0];

    const triangles = [];
    let xPos = 0;

    for (let i = 0; i < textString.length; i++) {
        const ch = textString[i];
        if (ch === ' ') {
            xPos += charWidth + charSpacing;
            continue;
        }

        // Get simplified glyph paths for the character
        const glyphTris = generateGlyphTriangles(ch, xPos, depth, charWidth, charHeight);
        triangles.push(...glyphTris);
        xPos += charWidth + charSpacing + offsetVec[0];
    }

    // Compute bounding box
    let bmin = [Infinity, Infinity, Infinity], bmax = [-Infinity, -Infinity, -Infinity];
    for (const tri of triangles) {
        for (const p of [tri.p1, tri.p2, tri.p3]) {
            for (let j = 0; j < 3; j++) {
                bmin[j] = Math.min(bmin[j], p[j]);
                bmax[j] = Math.max(bmax[j], p[j]);
            }
        }
    }
    if (triangles.length === 0) {
        bmin = [0, 0, 0]; bmax = [1, 1, 1];
    }

    return {
        shapeType: 'text',
        triangles,
        bbox: { min: bmin, max: bmax }
    };
}

function generateGlyphTriangles(ch, xOff, depth, w, h) {
    // Create an extruded box for each character
    // A real implementation would use TTF outlines
    const tris = [];
    const x0 = xOff, x1 = xOff + w;
    const y0 = 0, y1 = h;
    const z0 = 0, z1 = depth;

    // Front face
    addQuad(tris, [x0,y0,z0], [x1,y0,z0], [x1,y1,z0], [x0,y1,z0], [0,0,-1]);
    // Back face
    addQuad(tris, [x1,y0,z1], [x0,y0,z1], [x0,y1,z1], [x1,y1,z1], [0,0,1]);
    // Top
    addQuad(tris, [x0,y1,z0], [x1,y1,z0], [x1,y1,z1], [x0,y1,z1], [0,1,0]);
    // Bottom
    addQuad(tris, [x0,y0,z1], [x1,y0,z1], [x1,y0,z0], [x0,y0,z0], [0,-1,0]);
    // Left
    addQuad(tris, [x0,y0,z1], [x0,y0,z0], [x0,y1,z0], [x0,y1,z1], [-1,0,0]);
    // Right
    addQuad(tris, [x1,y0,z0], [x1,y0,z1], [x1,y1,z1], [x1,y1,z0], [1,0,0]);

    return tris;
}

function addQuad(tris, p1, p2, p3, p4, normal) {
    const tri1 = buildTriangle([...p1], [...p2], [...p3]);
    tri1.normal = [...normal];
    tris.push(tri1);
    const tri2 = buildTriangle([...p1], [...p3], [...p4]);
    tri2.normal = [...normal];
    tris.push(tri2);
}

export function intersectText(ray, text) {
    const hit = intersectTriangleList(ray, text.triangles, text.bbox);
    if (!hit) return null;
    return { t: hit.t, point: hit.point, _normal: hit.normal };
}

export function normalText(point, text, hitData) {
    return hitData?._normal || [0, 0, -1];
}

export function bboxText(text) { return text.bbox; }
export function insideText() { return false; }
