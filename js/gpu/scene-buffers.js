// POV-Ray Web - Pack scene graph into GPU-friendly typed arrays
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { packVec3 } from '../shapes/geometry-utils.js';

const OBJECT_STRIDE = 64; // floats per object (256 bytes)
const MATERIAL_STRIDE = 32; // floats per material (128 bytes)
const LIGHT_STRIDE = 16; // floats per light (64 bytes)

export function packScene(sceneData) {
    const objects = flattenObjects(sceneData.objects);
    const objectCount = objects.length;
    const lightCount = sceneData.lightSources.length;

    const objectBuffer = new Float32Array(objectCount * OBJECT_STRIDE);
    const materialBuffer = new Float32Array(objectCount * MATERIAL_STRIDE);
    const lightBuffer = new Float32Array(lightCount * LIGHT_STRIDE);

    // Pack objects
    for (let i = 0; i < objectCount; i++) {
        const obj = objects[i];
        const off = i * OBJECT_STRIDE;
        packObject(objectBuffer, off, obj, i);
        packMaterial(materialBuffer, i * MATERIAL_STRIDE, obj.texture);
        packNormalInfo(materialBuffer, i * MATERIAL_STRIDE, obj.texture);
    }

    // Pack lights
    for (let i = 0; i < lightCount; i++) {
        packLight(lightBuffer, i * LIGHT_STRIDE, sceneData.lightSources[i]);
    }

    // Pack camera
    const cam = sceneData.camera;
    const cameraBuffer = new Float32Array(32);
    packVec3(cameraBuffer, 0, cam.location);
    if (cam.lookAt) packVec3(cameraBuffer, 4, cam.lookAt);
    packVec3(cameraBuffer, 8, cam.direction);
    packVec3(cameraBuffer, 12, cam.up);
    packVec3(cameraBuffer, 16, cam.right);
    cameraBuffer[20] = cam.angle || 0;
    cameraBuffer[21] = cam.lookAt ? 1 : 0;

    // Pack globals
    const bg = sceneData.background;
    const globalsBuffer = new Float32Array(16);
    packVec3(globalsBuffer, 0, bg);
    packVec3(globalsBuffer, 4, sceneData.globalSettings.ambientLight);
    globalsBuffer[8] = sceneData.globalSettings.maxTraceLevel;

    return {
        objectBuffer,
        materialBuffer,
        lightBuffer,
        cameraBuffer,
        globalsBuffer,
        objectCount,
        lightCount,
        flatObjects: objects
    };
}

// Shape type IDs for GPU
const SHAPE_ID = {
    sphere: 1, box: 2, plane: 3, cylinder: 4, cone: 5,
    torus: 6, disc: 7, triangle: 8, quadric: 9, superellipsoid: 10,
};

function flattenObjects(objects) {
    const flat = [];
    for (const obj of objects) {
        if (obj.shapeData.shapeType === 'csg') {
            // Flatten CSG children (simple union flattening for now)
            for (const child of obj.shapeData.children) {
                // Inherit parent texture if child has none
                if (!child.texture && obj.texture) {
                    child.texture = obj.texture;
                }
                flat.push(child);
            }
        } else {
            flat.push(obj);
        }
    }
    return flat;
}

function packObject(buf, off, obj, materialIdx) {
    const sd = obj.shapeData;
    buf[off + 0] = SHAPE_ID[sd.shapeType] || 0;
    buf[off + 1] = materialIdx; // material index

    // Transform (identity if none)
    const m = obj.transform ? obj.transform.matrix : null;
    const mi = obj.transform ? obj.transform.inverse : null;
    for (let i = 0; i < 16; i++) {
        buf[off + 4 + i] = m ? m[i] : (i % 5 === 0 ? 1 : 0);
        buf[off + 20 + i] = mi ? mi[i] : (i % 5 === 0 ? 1 : 0);
    }

    // Shape-specific data starting at offset 36
    const d = off + 36;
    switch (sd.shapeType) {
        case 'sphere':
            packVec3(buf, d, sd.center); buf[d+3] = sd.radius;
            break;
        case 'box':
            packVec3(buf, d, sd.corner1); packVec3(buf, d+4, sd.corner2);
            break;
        case 'plane':
            packVec3(buf, d, sd.normal); buf[d+3] = sd.distance;
            break;
        case 'cylinder':
            packVec3(buf, d, sd.basePoint); packVec3(buf, d+4, sd.capPoint);
            buf[d+7] = sd.radius;
            break;
        case 'cone':
            packVec3(buf, d, sd.basePoint); buf[d+3] = sd.baseRadius;
            packVec3(buf, d+4, sd.capPoint); buf[d+7] = sd.capRadius;
            break;
        case 'disc':
            packVec3(buf, d, sd.center); packVec3(buf, d+4, sd.normal);
            buf[d+7] = sd.radius;
            break;
        case 'triangle':
            packVec3(buf, d, sd.p1); packVec3(buf, d+4, sd.p2); packVec3(buf, d+8, sd.p3);
            break;
        case 'torus':
            buf[d] = sd.majorRadius; buf[d+1] = sd.minorRadius;
            break;
        case 'quadric':
            // 10 coefficients: A,B,C,D,E,F,G,H,I,J
            buf[d] = sd.A; buf[d+1] = sd.B; buf[d+2] = sd.C; buf[d+3] = sd.D;
            buf[d+4] = sd.E; buf[d+5] = sd.F; buf[d+6] = sd.G; buf[d+7] = sd.H;
            buf[d+8] = sd.I; buf[d+9] = sd.J;
            break;
        case 'superellipsoid':
            buf[d] = sd.e; buf[d+1] = sd.n;
            break;
    }
}

function packMaterial(buf, off, texture) {
    const DEFAULT_AMBIENT = [0.1, 0.1, 0.1];

    if (!texture) {
        buf[off] = 0; // solid
        packVec3(buf, off + 1, [1, 1, 1]);
        buf[off + 8] = 0.6; buf[off + 9] = 1.0;
        packVec3(buf, off + 12, DEFAULT_AMBIENT);
        return;
    }

    packPigmentToBuffer(buf, off, texture.pigment);
    packFinishToBuffer(buf, off, texture.finish);
}

function packPigmentToBuffer(buf, off, pig) {
    if (!pig || pig.type === 'solid') {
        buf[off] = 0;
        packVec3(buf, off + 1, pig ? pig.color : [1, 1, 1]);
    } else if (pig.type === 'checker') {
        buf[off] = 1;
        packVec3(buf, off + 1, pig.colors[0]);
        packVec3(buf, off + 4, pig.colors[1]);
    } else if (pig.type === 'pattern' && pig.colorMap && pig.colorMap.length >= 2) {
        const pname = pig.patternType;
        buf[off] = pname === 'gradient' ? 2 : 3; // gradient or noise-based
        packVec3(buf, off + 1, pig.colorMap[0][1]);
        packVec3(buf, off + 4, pig.colorMap[pig.colorMap.length - 1][1]);
    } else {
        buf[off] = 0;
        packVec3(buf, off + 1, [1, 1, 1]);
    }
}

function packFinishToBuffer(buf, off, fin) {
    if (!fin) {
        buf[off + 8] = 0.6;
        packVec3(buf, off + 12, [0.1, 0.1, 0.1]);
        return;
    }
    buf[off + 8] = fin.diffuse || 0.6;
    buf[off + 9] = fin.brilliance || 1.0;
    buf[off + 10] = fin.specular || 0;
    buf[off + 11] = fin.roughness || 0.05;
    packVec3(buf, off + 12, fin.ambient || [0.1, 0.1, 0.1]);
    buf[off + 15] = fin.phong || 0;
    buf[off + 16] = fin.phongSize || 40;
    buf[off + 17] = fin.metallic || 0;
    if (fin.reflection) {
        packVec3(buf, off + 18, fin.reflection.max);
    }
}

// Pack normal/bump info into material buffer slot 21
export function packNormalInfo(buf, off, texture) {
    if (texture && texture.normal && texture.normal.type !== 'none') {
        buf[off + 21] = texture.normal.bumpSize || 1.0;
    }
}

function packLight(buf, off, light) {
    packVec3(buf, off, light.location);
    buf[off + 3] = light.type === 'spotlight' ? 1 : light.type === 'cylinder' ? 2 : 0;
    packVec3(buf, off + 4, light.color);
    buf[off + 7] = light.shadowless ? 0 : 1;
    if (light.pointAt) packVec3(buf, off + 8, light.pointAt);
    buf[off + 11] = light.radius || 30;
    buf[off + 12] = light.falloff || 45;
    buf[off + 13] = light.tightness || 0;
}
