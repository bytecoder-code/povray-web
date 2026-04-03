// POV-Ray Web - Mesh and Mesh2 intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// mesh2 { vertex_vectors { N, v1, v2, ... } face_indices { N, <i1,i2,i3>, ... } }

import { vec3Sub, vec3Normalize, vec3Cross, vec3Min, vec3Max } from '../math/vector.js';
import { intersectTriangleList } from './geometry-utils.js';

export function createMesh(vertices, normals, faces, uvs) {
    // Pre-compute edges and face normals
    const triangles = [];
    for (const face of faces) {
        const i0 = face[0], i1 = face[1], i2 = face[2];
        const p1 = vertices[i0], p2 = vertices[i1], p3 = vertices[i2];
        const e1 = vec3Sub(p2, p1);
        const e2 = vec3Sub(p3, p1);
        const faceNormal = vec3Normalize(vec3Cross(e1, e2));

        const tri = {
            p1, p2, p3, e1, e2,
            normal: faceNormal,
            n1: normals ? normals[i0] : null,
            n2: normals ? normals[i1] : null,
            n3: normals ? normals[i2] : null,
            smooth: !!normals
        };
        triangles.push(tri);
    }

    // Compute bounding box
    let bmin = [Infinity, Infinity, Infinity];
    let bmax = [-Infinity, -Infinity, -Infinity];
    for (const v of vertices) {
        bmin = vec3Min(bmin, v);
        bmax = vec3Max(bmax, v);
    }

    return {
        shapeType: 'mesh',
        triangles,
        vertices,
        bbox: { min: bmin, max: bmax }
    };
}

export function intersectMesh(ray, mesh) {
    const hit = intersectTriangleList(ray, mesh.triangles, mesh.bbox);
    if (!hit) return null;
    return { t: hit.t, point: hit.point, _normal: hit.normal };
}

export function normalMesh(point, mesh, hitData) {
    return hitData && hitData._normal ? hitData._normal : [0, 1, 0];
}

export function bboxMesh(mesh) {
    return mesh.bbox;
}

export function insideMesh() {
    return false; // TODO: point-in-mesh via ray counting
}
