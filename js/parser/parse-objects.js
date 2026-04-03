// POV-Ray Web - Geometric primitive parser
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import * as T from './reserved-words.js';
import { parseFloat, parseVector, parseColour } from './parse-expressions.js';
import { parseTexture, parsePigment, parseFinish, parseNormal } from './parse-materials.js';
import { createSphere } from '../shapes/sphere.js';
import { createBox } from '../shapes/box.js';
import { createPlane } from '../shapes/plane.js';
import { createCylinder } from '../shapes/cylinder.js';
import { createCone } from '../shapes/cone.js';
import { createTorus } from '../shapes/torus.js';
import { createSuperellipsoid } from '../shapes/superellipsoid.js';
import { createQuadric } from '../shapes/quadric.js';
import { createTriangle, createSmoothTriangle } from '../shapes/triangle.js';
import { createDisc } from '../shapes/disc.js';
import { createMesh } from '../shapes/mesh.js';
import { createLathe } from '../shapes/lathe.js';
import { createBlob } from '../shapes/blob.js';
import { createPrism } from '../shapes/prism.js';
import { createIsosurface } from '../shapes/isosurface.js';
import { createSOR } from '../shapes/sor.js';
import { createSphereSweep } from '../shapes/sphere-sweep.js';
import { createBicubicPatch } from '../shapes/bezier.js';
import { createJuliaFractal } from '../shapes/fractal.js';
import { createText } from '../shapes/text.js';
import { createTransform, applyTranslate, applyRotate, applyScale, applyMatrix } from '../scene/transform.js';

export function parseObject(parser) {
    const tok = parser.scanner.peek();

    switch (tok.id) {
        case T.SPHERE_TOKEN: return parseSphere(parser);
        case T.BOX_TOKEN: return parseBox(parser);
        case T.PLANE_TOKEN: return parsePlane(parser);
        case T.CYLINDER_TOKEN: return parseCylinder(parser);
        case T.CONE_TOKEN: return parseCone(parser);
        case T.TORUS_TOKEN: return parseTorus(parser);
        case T.UNION_TOKEN: return parseCSG(parser, 'union');
        case T.INTERSECTION_TOKEN: return parseCSG(parser, 'intersection');
        case T.DIFFERENCE_TOKEN: return parseCSG(parser, 'difference');
        case T.MERGE_TOKEN: return parseCSG(parser, 'merge');
        case T.DISC_TOKEN: return parseDisc(parser);
        case T.SUPERELLIPSOID_TOKEN: return parseSuperellipsoid(parser);
        case T.QUADRIC_TOKEN: return parseQuadricObj(parser);
        case T.TRIANGLE_TOKEN: return parseTriangleObj(parser);
        case T.SMOOTH_TRIANGLE_TOKEN: return parseSmoothTriangleObj(parser);
        case T.MESH2_TOKEN: return parseMesh2(parser);
        case T.LATHE_TOKEN: return parseLatheObj(parser);
        case T.BLOB_TOKEN: return parseBlobObj(parser);
        case T.PRISM_TOKEN: return parsePrismObj(parser);
        case T.ISOSURFACE_TOKEN: return parseIsosurfaceObj(parser);
        case T.SOR_TOKEN: return parseSORObj(parser);
        case T.SPHERE_SWEEP_TOKEN: return parseSphereSweepObj(parser);
        case T.BICUBIC_PATCH_TOKEN: return parseBicubicPatchObj(parser);
        case T.JULIA_FRACTAL_TOKEN: return parseJuliaFractalObj(parser);
        case T.TEXT_TOKEN: return parseTextObj(parser);
        case T.OBJECT_TOKEN: return parseObjectRef(parser);
        case T.OBJECT_ID_TOKEN: {
            parser.scanner.getToken();
            // Clone the referenced object
            const obj = JSON.parse(JSON.stringify(tok.value));
            parseObjectModifiers(parser, obj);
            return obj;
        }
        default: return null;
    }
}

function parseSphere(parser) {
    parser.scanner.getToken(); // consume 'sphere'
    parser.expect(T.LEFT_CURLY_TOKEN);
    const center = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const radius = parseFloat(parser);

    const obj = {
        shapeData: createSphere(center, radius),
        texture: null,
        transform: null,
        flags: {}
    };

    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseBox(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const corner1 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const corner2 = parseVector(parser);

    const obj = {
        shapeData: createBox(corner1, corner2),
        texture: null,
        transform: null,
        flags: {}
    };

    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parsePlane(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const normal = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const distance = parseFloat(parser);

    const obj = {
        shapeData: createPlane(normal, distance),
        texture: null,
        transform: null,
        flags: {}
    };

    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseCylinder(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const basePoint = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const capPoint = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const radius = parseFloat(parser);

    const shapeData = createCylinder(basePoint, capPoint, radius);
    shapeData.open = false;
    const obj = { shapeData, texture: null, transform: null, flags: {} };

    if (parser.scanner.peek().id === T.OPEN_TOKEN) {
        parser.scanner.getToken();
        shapeData.open = true;
    }

    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseCone(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const basePoint = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const baseRadius = parseFloat(parser);
    parser.expect(T.COMMA_TOKEN);
    const capPoint = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const capRadius = parseFloat(parser);

    const shapeData = createCone(basePoint, baseRadius, capPoint, capRadius);
    shapeData.open = false;
    const obj = { shapeData, texture: null, transform: null, flags: {} };

    if (parser.scanner.peek().id === T.OPEN_TOKEN) {
        parser.scanner.getToken();
        shapeData.open = true;
    }

    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseTorus(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const majorRadius = parseFloat(parser);
    parser.expect(T.COMMA_TOKEN);
    const minorRadius = parseFloat(parser);

    const obj = {
        shapeData: createTorus(majorRadius, minorRadius),
        texture: null,
        transform: null,
        flags: {}
    };

    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseDisc(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const center = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const normal = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const radius = parseFloat(parser);
    let holeRadius = 0;
    if (parser.scanner.peek().id === T.COMMA_TOKEN) {
        parser.scanner.getToken();
        holeRadius = parseFloat(parser);
    }
    const obj = { shapeData: createDisc(center, normal, radius, holeRadius), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseSuperellipsoid(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const exponents = parseVector(parser); // <e, n>
    const obj = { shapeData: createSuperellipsoid(exponents[0], exponents[1]), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseQuadricObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const v1 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const v2 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const v3 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const j = parseFloat(parser);
    const obj = {
        shapeData: createQuadric(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2], j),
        texture: null, transform: null, flags: {}
    };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseTriangleObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const p1 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const p2 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const p3 = parseVector(parser);
    const obj = { shapeData: createTriangle(p1, p2, p3), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseSmoothTriangleObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const p1 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const n1 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const p2 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const n2 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const p3 = parseVector(parser);
    parser.expect(T.COMMA_TOKEN);
    const n3 = parseVector(parser);
    const obj = { shapeData: createSmoothTriangle(p1, p2, p3, n1, n2, n3), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseBlobObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    let threshold = 0.65;
    const components = [];

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.peek();
        if (tok.id === T.THRESHOLD_TOKEN) {
            parser.scanner.getToken();
            threshold = parseFloat(parser);
        } else if (tok.id === T.SPHERE_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            const center = parseVector(parser);
            parser.expect(T.COMMA_TOKEN);
            const radius = parseFloat(parser);
            parser.expect(T.COMMA_TOKEN);
            const strength = parseFloat(parser);
            components.push({ type: 'sphere', center, radius, strength });
            // Skip inner modifiers
            while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
                   parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
                const inner = parser.scanner.peek();
                if (inner.id === T.TRANSLATE_TOKEN || inner.id === T.ROTATE_TOKEN || inner.id === T.SCALE_TOKEN) {
                    parser.scanner.getToken(); parseVector(parser);
                } else break;
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.CYLINDER_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            const end1 = parseVector(parser);
            parser.expect(T.COMMA_TOKEN);
            const end2 = parseVector(parser);
            parser.expect(T.COMMA_TOKEN);
            const radius = parseFloat(parser);
            parser.expect(T.COMMA_TOKEN);
            const strength = parseFloat(parser);
            components.push({ type: 'cylinder', end1, end2, radius, strength });
            while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
                   parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
                const inner = parser.scanner.peek();
                if (inner.id === T.TRANSLATE_TOKEN || inner.id === T.ROTATE_TOKEN || inner.id === T.SCALE_TOKEN) {
                    parser.scanner.getToken(); parseVector(parser);
                } else break;
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.COMPONENT_TOKEN) {
            parser.scanner.getToken();
            const strength = parseFloat(parser);
            parser.expect(T.COMMA_TOKEN);
            const radius = parseFloat(parser);
            parser.expect(T.COMMA_TOKEN);
            const center = parseVector(parser);
            components.push({ type: 'sphere', center, radius, strength });
        } else break;
    }

    const obj = { shapeData: createBlob(threshold, components), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parsePrismObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    let sweepType = 'linear_sweep';
    let splineType = 'linear_spline';

    // Optional sweep/spline type
    let peek = parser.scanner.peek();
    if (peek.id === T.LINEAR_SWEEP_TOKEN || peek.id === T.CONIC_SWEEP_TOKEN) {
        parser.scanner.getToken();
        sweepType = peek.value;
        peek = parser.scanner.peek();
    }
    if (peek.id === T.LINEAR_SPLINE_TOKEN || peek.id === T.QUADRATIC_SPLINE_TOKEN ||
        peek.id === T.CUBIC_SPLINE_TOKEN || peek.id === T.BEZIER_SPLINE_TOKEN) {
        parser.scanner.getToken();
        splineType = peek.value;
    }

    const height1 = parseFloat(parser);
    parser.expect(T.COMMA_TOKEN);
    const height2 = parseFloat(parser);
    parser.expect(T.COMMA_TOKEN);
    const count = parseFloat(parser);
    if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();

    const points = [];
    for (let i = 0; i < count; i++) {
        const v = parseVector(parser);
        points.push([v[0], v[1]]);
        if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
    }

    const obj = { shapeData: createPrism(sweepType, splineType, height1, height2, points), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseIsosurfaceObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    let evalFn = (x, y, z) => x*x + y*y + z*z - 1;
    let threshold = 0;
    let containedBy = { type: 'box', corner1: [-1,-1,-1], corner2: [1,1,1] };
    let maxGradient = 5;
    let accuracy = 0.001;

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.peek();
        if (tok.id === T.FUNCTION_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            // Skip function body for now — use default sphere
            parser.skipBlock();
        } else if (tok.id === T.THRESHOLD_TOKEN) {
            parser.scanner.getToken();
            threshold = parseFloat(parser);
        } else if (tok.id === T.CONTAINED_BY_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            const ctype = parser.scanner.peek();
            if (ctype.id === T.BOX_TOKEN) {
                parser.scanner.getToken();
                parser.expect(T.LEFT_CURLY_TOKEN);
                const c1 = parseVector(parser);
                parser.expect(T.COMMA_TOKEN);
                const c2 = parseVector(parser);
                parser.expect(T.RIGHT_CURLY_TOKEN);
                containedBy = { type: 'box', corner1: c1, corner2: c2 };
            } else if (ctype.id === T.SPHERE_TOKEN) {
                parser.scanner.getToken();
                parser.expect(T.LEFT_CURLY_TOKEN);
                const center = parseVector(parser);
                parser.expect(T.COMMA_TOKEN);
                const radius = parseFloat(parser);
                parser.expect(T.RIGHT_CURLY_TOKEN);
                containedBy = { type: 'sphere', center, radius };
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.MAX_GRADIENT_TOKEN) {
            parser.scanner.getToken();
            maxGradient = parseFloat(parser);
        } else if (tok.id === T.ACCURACY_TOKEN) {
            parser.scanner.getToken();
            accuracy = parseFloat(parser);
        } else break;
    }

    const obj = { shapeData: createIsosurface(evalFn, threshold, containedBy, maxGradient, accuracy), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseSORObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);
    const count = parseFloat(parser);
    if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();

    const points = [];
    for (let i = 0; i < count; i++) {
        const v = parseVector(parser);
        points.push([v[0], v[1]]);
        if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
    }

    const obj = { shapeData: createSOR(points), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseSphereSweepObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    let splineType = 'linear_spline';
    const peek = parser.scanner.peek();
    if (peek.id === T.LINEAR_SPLINE_TOKEN || peek.id === T.B_SPLINE_TOKEN ||
        peek.id === T.CUBIC_SPLINE_TOKEN) {
        parser.scanner.getToken();
        splineType = peek.value;
    }

    const count = parseFloat(parser);
    if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();

    const spheres = [];
    for (let i = 0; i < count; i++) {
        const center = parseVector(parser);
        parser.expect(T.COMMA_TOKEN);
        const radius = parseFloat(parser);
        spheres.push({ center, radius });
        if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
    }

    let tolerance = 1e-6;
    if (parser.scanner.peek().id === T.TOLERANCE_TOKEN) {
        parser.scanner.getToken();
        tolerance = parseFloat(parser);
    }

    const obj = { shapeData: createSphereSweep(splineType, spheres, tolerance), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseBicubicPatchObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    let type = 0, flatness = 0.01, uSteps = 4, vSteps = 4;

    // Parse optional type, flatness, u_steps, v_steps
    const peek = parser.scanner.peek();
    if (peek.id === T.TYPE_TOKEN) {
        parser.scanner.getToken();
        type = parseFloat(parser);
    }
    if (parser.scanner.peek().id === T.FLATNESS_TOKEN) {
        parser.scanner.getToken();
        flatness = parseFloat(parser);
    }
    if (parser.scanner.peek().id === T.U_STEPS_TOKEN) {
        parser.scanner.getToken();
        uSteps = parseFloat(parser);
    }
    if (parser.scanner.peek().id === T.V_STEPS_TOKEN) {
        parser.scanner.getToken();
        vSteps = parseFloat(parser);
    }

    // Read 16 control points
    const points = [];
    for (let i = 0; i < 16; i++) {
        if (i > 0 && parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
        points.push(parseVector(parser));
    }

    const obj = { shapeData: createBicubicPatch(type, flatness, uSteps, vSteps, points), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseJuliaFractalObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    const param = parseVector(parser); // <x, y, z, w> quaternion parameter
    let maxIter = 20, precision = 20, sliceType = 'quaternion';

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.peek();
        if (tok.id === T.MAX_ITERATION_TOKEN) {
            parser.scanner.getToken();
            maxIter = parseFloat(parser);
        } else if (tok.id === T.PRECISION_TOKEN) {
            parser.scanner.getToken();
            precision = parseFloat(parser);
        } else if (tok.id === T.QUATERNION_TOKEN || tok.id === T.HYPERCOMPLEX_TOKEN) {
            parser.scanner.getToken();
            sliceType = tok.value;
        } else if (tok.id === T.JULIA_TOKEN) {
            parser.scanner.getToken(); // just consume
        } else if (tok.id === T.SQR_TOKEN || tok.id === T.CUBE_TOKEN) {
            parser.scanner.getToken(); // exponent type
        } else break;
    }

    const obj = {
        shapeData: createJuliaFractal(
            [param[0]||0, param[1]||0, param[2]||0, param[3]||0],
            maxIter, precision, sliceType
        ),
        texture: null, transform: null, flags: {}
    };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseTextObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    // text { ttf "font.ttf" "string" thickness, offset }
    let fontFile = '';
    const peek = parser.scanner.peek();
    if (peek.id === T.TTF_TOKEN) {
        parser.scanner.getToken();
    }
    // Font filename (string)
    const fontTok = parser.scanner.getToken();
    fontFile = fontTok.value || 'crystal.ttf';

    // Text string
    const textTok = parser.scanner.getToken();
    const textString = textTok.value || 'Text';

    // Thickness
    let thickness = 1;
    if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
    const peekNext = parser.scanner.peek();
    if (peekNext.id === T.FLOAT_TOKEN || peekNext.id === T.FLOAT_ID_TOKEN || peekNext.id === T.DASH_TOKEN) {
        thickness = parseFloat(parser);
    }

    // Offset vector
    let offset = [0, 0, 0];
    if (parser.scanner.peek().id === T.COMMA_TOKEN) {
        parser.scanner.getToken();
        offset = parseVector(parser);
    }

    const obj = { shapeData: createText(fontFile, textString, thickness, offset), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseMesh2(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    let vertices = [], normals = null, faces = [], uvs = null;

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.peek();

        if (tok.id === T.VERTEX_VECTORS_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            const count = parseFloat(parser);
            if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            for (let i = 0; i < count; i++) {
                vertices.push(parseVector(parser));
                if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.NORMAL_VECTORS_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            const count = parseFloat(parser);
            if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            normals = [];
            for (let i = 0; i < count; i++) {
                normals.push(parseVector(parser));
                if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.UV_VECTORS_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            const count = parseFloat(parser);
            if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            uvs = [];
            for (let i = 0; i < count; i++) {
                uvs.push(parseVector(parser));
                if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.FACE_INDICES_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            const count = parseFloat(parser);
            if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            for (let i = 0; i < count; i++) {
                const v = parseVector(parser);
                faces.push([v[0], v[1], v[2]]);
                if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.NORMAL_INDICES_TOKEN || tok.id === T.UV_INDICES_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            parser.skipBlock(); // Skip for now
        } else if (tok.id === T.TEXTURE_LIST_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            parser.skipBlock();
        } else {
            break;
        }
    }

    const obj = { shapeData: createMesh(vertices, normals, faces, uvs), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseLatheObj(parser) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    // Optional spline type
    let splineType = 'linear_spline';
    const peek = parser.scanner.peek();
    if (peek.id === T.LINEAR_SPLINE_TOKEN || peek.id === T.QUADRATIC_SPLINE_TOKEN ||
        peek.id === T.CUBIC_SPLINE_TOKEN || peek.id === T.BEZIER_SPLINE_TOKEN) {
        parser.scanner.getToken();
        splineType = peek.value;
    }

    const count = parseFloat(parser);
    if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();

    const points = [];
    for (let i = 0; i < count; i++) {
        const v = parseVector(parser); // 2D point <x, y>
        points.push([v[0], v[1]]);
        if (parser.scanner.peek().id === T.COMMA_TOKEN) parser.scanner.getToken();
    }

    const obj = { shapeData: createLathe(splineType, points), texture: null, transform: null, flags: {} };
    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseCSG(parser, csgType) {
    parser.scanner.getToken();
    parser.expect(T.LEFT_CURLY_TOKEN);

    const children = [];
    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const child = parseObject(parser);
        if (child) {
            children.push(child);
        } else {
            // May be a modifier for the CSG itself
            break;
        }
    }

    const obj = {
        shapeData: { shapeType: 'csg', csgType, children },
        texture: null,
        transform: null,
        flags: {}
    };

    parseObjectModifiers(parser, obj);
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return obj;
}

function parseObjectRef(parser) {
    parser.scanner.getToken(); // consume 'object'
    parser.expect(T.LEFT_CURLY_TOKEN);
    const inner = parseObject(parser);
    if (inner) {
        parseObjectModifiers(parser, inner);
    }
    parser.expect(T.RIGHT_CURLY_TOKEN);
    return inner;
}

export function parseObjectModifiers(parser, obj) {
    while (true) {
        const tok = parser.scanner.peek();

        if (tok.id === T.TEXTURE_TOKEN) {
            obj.texture = parseTexture(parser);
        } else if (tok.id === T.MATERIAL_TOKEN) {
            // material { texture { ... } interior { ... } }
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
                   parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
                const mtok = parser.scanner.peek();
                if (mtok.id === T.TEXTURE_TOKEN) {
                    obj.texture = parseTexture(parser);
                } else if (mtok.id === T.INTERIOR_TOKEN) {
                    parser.scanner.getToken();
                    parser.expect(T.LEFT_CURLY_TOKEN);
                    parser.skipBlock();
                } else {
                    break;
                }
            }
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.NORMAL_TOKEN) {
            if (!obj.texture) obj.texture = { pigment: null, normal: null, finish: null };
            obj.texture.normal = parseNormal(parser);
        } else if (tok.id === T.PIGMENT_TOKEN) {
            if (!obj.texture) obj.texture = { pigment: null, normal: null, finish: null };
            obj.texture.pigment = parsePigment(parser);
        } else if (tok.id === T.FINISH_TOKEN) {
            if (!obj.texture) obj.texture = { pigment: null, normal: null, finish: null };
            obj.texture.finish = parseFinish(parser);
        } else if (tok.id === T.TRANSLATE_TOKEN) {
            parser.scanner.getToken();
            const v = parseVector(parser);
            if (!obj.transform) obj.transform = createTransform();
            applyTranslate(obj.transform, v);
        } else if (tok.id === T.ROTATE_TOKEN) {
            parser.scanner.getToken();
            const v = parseVector(parser);
            if (!obj.transform) obj.transform = createTransform();
            applyRotate(obj.transform, v);
        } else if (tok.id === T.SCALE_TOKEN) {
            parser.scanner.getToken();
            const v = parseVector(parser);
            if (!obj.transform) obj.transform = createTransform();
            applyScale(obj.transform, v);
        } else if (tok.id === T.MATRIX_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_ANGLE_TOKEN);
            const vals = [];
            for (let i = 0; i < 12; i++) {
                if (i > 0) parser.expect(T.COMMA_TOKEN);
                vals.push(parseFloat(parser));
            }
            parser.expect(T.RIGHT_ANGLE_TOKEN);
            if (!obj.transform) obj.transform = createTransform();
            applyMatrix(obj.transform, vals);
        } else if (tok.id === T.NO_SHADOW_TOKEN) {
            parser.scanner.getToken();
            obj.flags.noShadow = true;
        } else if (tok.id === T.NO_IMAGE_TOKEN) {
            parser.scanner.getToken();
            obj.flags.noImage = true;
        } else if (tok.id === T.NO_REFLECTION_TOKEN) {
            parser.scanner.getToken();
            obj.flags.noReflection = true;
        } else if (tok.id === T.NO_RADIOSITY_TOKEN) {
            parser.scanner.getToken();
            obj.flags.noRadiosity = true;
        } else if (tok.id === T.HOLLOW_TOKEN) {
            parser.scanner.getToken();
            obj.flags.hollow = true;
        } else if (tok.id === T.INVERSE_TOKEN) {
            parser.scanner.getToken();
            obj.flags.inverse = true;
        } else if (tok.id === T.DOUBLE_ILLUMINATE_TOKEN) {
            parser.scanner.getToken();
            obj.flags.doubleIlluminate = true;
        } else if (tok.id === T.INTERIOR_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            obj.interior = parseInteriorBody(parser);
            parser.expect(T.RIGHT_CURLY_TOKEN);
        } else if (tok.id === T.PHOTONS_TOKEN) {
            // Skip photons block for now
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            parser.skipBlock();
        } else if (tok.id === T.BOUNDED_BY_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            parser.skipBlock();
        } else if (tok.id === T.CLIPPED_BY_TOKEN) {
            parser.scanner.getToken();
            parser.expect(T.LEFT_CURLY_TOKEN);
            parser.skipBlock();
        } else {
            break;
        }
    }
}

function parseInteriorBody(parser) {
    const interior = { ior: 1.0, dispersion: 1.0, caustics: 0, fadeDistance: 0, fadePower: 0 };
    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN) {
        const tok = parser.scanner.getToken();
        if (tok.id === T.IOR_TOKEN) {
            interior.ior = parseFloat(parser);
        } else if (tok.id === T.DISPERSION_TOKEN) {
            interior.dispersion = parseFloat(parser);
        } else if (tok.id === T.CAUSTICS_TOKEN) {
            interior.caustics = parseFloat(parser);
        } else if (tok.id === T.FADE_DISTANCE_TOKEN) {
            interior.fadeDistance = parseFloat(parser);
        } else if (tok.id === T.FADE_POWER_TOKEN) {
            interior.fadePower = parseFloat(parser);
        } else if (tok.id === T.MEDIA_TOKEN) {
            parser.expect(T.LEFT_CURLY_TOKEN);
            parser.skipBlock();
        }
    }
    return interior;
}
