// POV-Ray Web - Shape type registry: maps shape types to their functions
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { intersectSphere, normalSphere, bboxSphere, insideSphere } from './sphere.js';
import { intersectBox, normalBox, bboxBox, insideBox } from './box.js';
import { intersectPlane, normalPlane, bboxPlane, insidePlane } from './plane.js';
import { intersectCylinder, normalCylinder, bboxCylinder, insideCylinder } from './cylinder.js';
import { intersectCone, normalCone, bboxCone, insideCone } from './cone.js';
import { intersectDisc, normalDisc, bboxDisc, insideDisc } from './disc.js';
import { intersectTorus, normalTorus, bboxTorus, insideTorus } from './torus.js';
import { intersectTriangle, normalTriangle, bboxTriangle, insideTriangle } from './triangle.js';
import { intersectCSG, normalCSG, bboxCSG, insideCSG } from './csg.js';
import { intersectSuperellipsoid, normalSuperellipsoid, bboxSuperellipsoid, insideSuperellipsoid } from './superellipsoid.js';
import { intersectQuadric, normalQuadric, bboxQuadric, insideQuadric } from './quadric.js';
import { intersectMesh, normalMesh, bboxMesh, insideMesh } from './mesh.js';
import { intersectHeightfield, normalHeightfield, bboxHeightfield, insideHeightfield } from './heightfield.js';
import { intersectLathe, normalLathe, bboxLathe, insideLathe } from './lathe.js';
import { intersectBlob, normalBlob, bboxBlob, insideBlob } from './blob.js';
import { intersectPrism, normalPrism, bboxPrism, insidePrism } from './prism.js';
import { intersectIsosurface, normalIsosurface, bboxIsosurface, insideIsosurface } from './isosurface.js';
import { intersectSOR, normalSOR, bboxSOR, insideSOR } from './sor.js';
import { intersectSphereSweep, normalSphereSweep, bboxSphereSweep, insideSphereSweep } from './sphere-sweep.js';
import { intersectBicubicPatch, normalBicubicPatch, bboxBicubicPatch, insideBicubicPatch } from './bezier.js';
import { intersectJuliaFractal, normalJuliaFractal, bboxJuliaFractal, insideJuliaFractal } from './fractal.js';
import { intersectText, normalText, bboxText, insideText } from './text.js';
import { intersectParametric, normalParametric, bboxParametric, insideParametric } from './parametric.js';

const registry = new Map();

function register(type, fns) {
    registry.set(type, fns);
}

register('sphere', { intersect: intersectSphere, normal: normalSphere, bbox: bboxSphere, inside: insideSphere });
register('box', { intersect: intersectBox, normal: normalBox, bbox: bboxBox, inside: insideBox });
register('plane', { intersect: intersectPlane, normal: normalPlane, bbox: bboxPlane, inside: insidePlane });
register('cylinder', { intersect: intersectCylinder, normal: normalCylinder, bbox: bboxCylinder, inside: insideCylinder });
register('cone', { intersect: intersectCone, normal: normalCone, bbox: bboxCone, inside: insideCone });
register('disc', { intersect: intersectDisc, normal: normalDisc, bbox: bboxDisc, inside: insideDisc });
register('torus', { intersect: intersectTorus, normal: normalTorus, bbox: bboxTorus, inside: insideTorus });
register('triangle', { intersect: intersectTriangle, normal: normalTriangle, bbox: bboxTriangle, inside: insideTriangle });
register('csg', { intersect: intersectCSG, normal: normalCSG, bbox: bboxCSG, inside: insideCSG });
register('superellipsoid', { intersect: intersectSuperellipsoid, normal: normalSuperellipsoid, bbox: bboxSuperellipsoid, inside: insideSuperellipsoid });
register('quadric', { intersect: intersectQuadric, normal: normalQuadric, bbox: bboxQuadric, inside: insideQuadric });
register('mesh', { intersect: intersectMesh, normal: normalMesh, bbox: bboxMesh, inside: insideMesh });
register('heightfield', { intersect: intersectHeightfield, normal: normalHeightfield, bbox: bboxHeightfield, inside: insideHeightfield });
register('lathe', { intersect: intersectLathe, normal: normalLathe, bbox: bboxLathe, inside: insideLathe });
register('blob', { intersect: intersectBlob, normal: normalBlob, bbox: bboxBlob, inside: insideBlob });
register('prism', { intersect: intersectPrism, normal: normalPrism, bbox: bboxPrism, inside: insidePrism });
register('isosurface', { intersect: intersectIsosurface, normal: normalIsosurface, bbox: bboxIsosurface, inside: insideIsosurface });
register('sor', { intersect: intersectSOR, normal: normalSOR, bbox: bboxSOR, inside: insideSOR });
register('sphere_sweep', { intersect: intersectSphereSweep, normal: normalSphereSweep, bbox: bboxSphereSweep, inside: insideSphereSweep });
register('bicubic_patch', { intersect: intersectBicubicPatch, normal: normalBicubicPatch, bbox: bboxBicubicPatch, inside: insideBicubicPatch });
register('julia_fractal', { intersect: intersectJuliaFractal, normal: normalJuliaFractal, bbox: bboxJuliaFractal, inside: insideJuliaFractal });
register('text', { intersect: intersectText, normal: normalText, bbox: bboxText, inside: insideText });
register('parametric', { intersect: intersectParametric, normal: normalParametric, bbox: bboxParametric, inside: insideParametric });

export function getShapeFunctions(type) {
    return registry.get(type) || null;
}

export function registerShape(type, fns) {
    registry.set(type, fns);
}
