// POV-Ray Web - Camera parser (all 13 types)
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import * as T from './reserved-words.js';
import { parseFloat, parseVector } from './parse-expressions.js';
import { createDefaultCamera } from '../scene/scene-data.js';

export function parseCamera(parser) {
    parser.scanner.getToken(); // consume 'camera'
    parser.expect(T.LEFT_CURLY_TOKEN);

    const camera = createDefaultCamera();

    // Check for camera identifier
    if (parser.scanner.peek().id === T.CAMERA_ID_TOKEN) {
        const tok = parser.scanner.getToken();
        Object.assign(camera, JSON.parse(JSON.stringify(tok.value)));
    }

    while (parser.scanner.peek().id !== T.RIGHT_CURLY_TOKEN &&
           parser.scanner.peek().id !== T.END_OF_FILE_TOKEN) {
        const tok = parser.scanner.getToken();

        switch (tok.id) {
            // Camera types
            case T.PERSPECTIVE_TOKEN: camera.type = 'perspective'; break;
            case T.ORTHOGRAPHIC_TOKEN: camera.type = 'orthographic'; break;
            case T.FISHEYE_TOKEN: camera.type = 'fisheye'; break;
            case T.ULTRA_WIDE_ANGLE_TOKEN: camera.type = 'ultra_wide_angle'; break;
            case T.OMNIMAX_TOKEN: camera.type = 'omnimax'; break;
            case T.PANORAMIC_TOKEN: camera.type = 'panoramic'; break;
            case T.SPHERICAL_TOKEN: camera.type = 'spherical'; break;
            case T.CYLINDRICAL_TOKEN:
                camera.type = 'cylindrical';
                // Optional cylinder type 1-4
                const next = parser.scanner.peek();
                if (next.id === T.FLOAT_TOKEN) {
                    camera.cylinderType = parseFloat(parser);
                }
                break;
            case T.MESH_CAMERA_TOKEN: camera.type = 'mesh_camera'; break;
            case T.USER_DEFINED_TOKEN: camera.type = 'user_defined'; break;

            // Camera parameters
            case T.LOCATION_TOKEN: camera.location = parseVector(parser); break;
            case T.DIRECTION_TOKEN: camera.direction = parseVector(parser); break;
            case T.UP_TOKEN: camera.up = parseVector(parser); break;
            case T.RIGHT_TOKEN: camera.right = parseVector(parser); break;
            case T.SKY_TOKEN: camera.sky = parseVector(parser); break;
            case T.LOOK_AT_TOKEN: camera.lookAt = parseVector(parser); break;
            case T.ANGLE_TOKEN: camera.angle = parseFloat(parser); break;

            // Depth of field
            case T.FOCAL_POINT_TOKEN: camera.focalPoint = parseVector(parser); break;
            case T.APERTURE_TOKEN: camera.aperture = parseFloat(parser); break;
            case T.BLUR_SAMPLES_TOKEN: camera.blurSamples = parseFloat(parser); break;
            case T.CONFIDENCE_TOKEN: camera.confidence = parseFloat(parser); break;
            case T.VARIANCE_TOKEN: camera.variance = parseFloat(parser); break;

            // Transforms
            case T.TRANSLATE_TOKEN: {
                const v = parseVector(parser);
                camera.location[0] += v[0];
                camera.location[1] += v[1];
                camera.location[2] += v[2];
                break;
            }
            case T.ROTATE_TOKEN: parseVector(parser); break; // TODO: full camera rotation
            case T.SCALE_TOKEN: parseVector(parser); break;

            // Bokeh
            case T.BOKEH_TOKEN:
                parser.expect(T.LEFT_CURLY_TOKEN);
                parser.skipBlock();
                break;

            // Normal (for DOF perturbation)
            case T.NORMAL_TOKEN:
                parser.expect(T.LEFT_CURLY_TOKEN);
                parser.skipBlock();
                break;

            default:
                parser.scanner.ungetToken();
                parser.expect(T.RIGHT_CURLY_TOKEN);
                return camera;
        }
    }

    parser.expect(T.RIGHT_CURLY_TOKEN);
    return camera;
}
