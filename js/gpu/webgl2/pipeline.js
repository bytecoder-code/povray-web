// POV-Ray Web - WebGL2 fallback ray tracer
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Encodes scene into float textures, traces rays in fragment shader

export class WebGL2Pipeline {
    constructor(gpuCtx) {
        this.gl = gpuCtx.gl;
        this.canvas = gpuCtx.canvas;
        this.program = null;
        this.blitProgram = null;
        this.framebufferTex = null;
        this.fbo = null;
        this.width = 0;
        this.height = 0;
    }

    async init() {
        const gl = this.gl;

        // Trace program: fullscreen quad fragment shader does ray tracing
        const traceVS = `#version 300 es
        in vec2 aPos;
        out vec2 vUV;
        void main() {
            vUV = aPos * 0.5 + 0.5;
            gl_Position = vec4(aPos, 0, 1);
        }`;

        const traceFS = `#version 300 es
        precision highp float;
        in vec2 vUV;
        out vec4 fragColor;

        uniform vec3 uBackground;
        uniform vec3 uAmbient;
        uniform vec3 uCamPos;
        uniform vec3 uCamDir;
        uniform vec3 uCamUp;
        uniform vec3 uCamRight;
        uniform vec3 uCamLookAt;
        uniform float uCamAngle;
        uniform float uHasLookAt;
        uniform vec2 uResolution;

        uniform highp sampler2D uObjectTex;
        uniform highp sampler2D uMaterialTex;
        uniform highp sampler2D uLightTex;
        uniform int uObjectCount;
        uniform int uLightCount;

        const float EPSILON = 1e-4;

        // Texture fetch helpers
        float objF(int idx, int field) {
            int texW = textureSize(uObjectTex, 0).x;
            int flat = idx * 64 + field;
            ivec2 coord = ivec2(flat % texW, flat / texW);
            return texelFetch(uObjectTex, coord, 0).r;
        }

        float matF(int idx, int field) {
            int texW = textureSize(uMaterialTex, 0).x;
            int flat = idx * 32 + field;
            ivec2 coord = ivec2(flat % texW, flat / texW);
            return texelFetch(uMaterialTex, coord, 0).r;
        }

        float ltF(int idx, int field) {
            int texW = textureSize(uLightTex, 0).x;
            int flat = idx * 16 + field;
            ivec2 coord = ivec2(flat % texW, flat / texW);
            return texelFetch(uLightTex, coord, 0).r;
        }

        struct Ray { vec3 origin; vec3 dir; };
        struct Hit { float t; vec3 point; vec3 normal; int matIdx; bool valid; };

        mat4 getMatrix(int objIdx, int offset) {
            int b = objIdx * 64 + offset;
            int texW = textureSize(uObjectTex, 0).x;
            mat4 m;
            for (int i = 0; i < 4; i++) {
                for (int j = 0; j < 4; j++) {
                    int flat = b + i * 4 + j;
                    m[i][j] = texelFetch(uObjectTex, ivec2(flat % texW, flat / texW), 0).r;
                }
            }
            return m;
        }

        Ray transformRay(Ray r, mat4 invM) {
            vec4 o = invM * vec4(r.origin, 1.0);
            vec4 d = invM * vec4(r.dir, 0.0);
            return Ray(o.xyz, d.xyz);
        }

        vec3 transformNormalBack(vec3 n, mat4 invM) {
            return normalize(vec3(
                invM[0][0]*n.x + invM[0][1]*n.y + invM[0][2]*n.z,
                invM[1][0]*n.x + invM[1][1]*n.y + invM[1][2]*n.z,
                invM[2][0]*n.x + invM[2][1]*n.y + invM[2][2]*n.z
            ));
        }

        Hit intersectSphere(Ray ray, int idx) {
            Hit hit; hit.valid = false;
            vec3 center = vec3(objF(idx,36), objF(idx,37), objF(idx,38));
            float radius = objF(idx, 39);
            vec3 oc = ray.origin - center;
            float a = dot(ray.dir, ray.dir);
            float hb = dot(oc, ray.dir);
            float c = dot(oc, oc) - radius*radius;
            float disc = hb*hb - a*c;
            if (disc < 0.0) return hit;
            float sq = sqrt(disc);
            float t = (-hb - sq) / a;
            if (t < EPSILON) t = (-hb + sq) / a;
            if (t < EPSILON) return hit;
            hit.point = ray.origin + ray.dir * t;
            hit.normal = normalize(hit.point - center);
            hit.t = t; hit.valid = true;
            return hit;
        }

        Hit intersectPlane(Ray ray, int idx) {
            Hit hit; hit.valid = false;
            vec3 n = vec3(objF(idx,36), objF(idx,37), objF(idx,38));
            float d = objF(idx, 39);
            float denom = dot(ray.dir, n);
            if (abs(denom) < 1e-12) return hit;
            float t = (d - dot(ray.origin, n)) / denom;
            if (t < EPSILON) return hit;
            hit.point = ray.origin + ray.dir * t; hit.normal = n;
            hit.t = t; hit.valid = true;
            return hit;
        }

        Hit intersectBox(Ray ray, int idx) {
            Hit hit; hit.valid = false;
            vec3 bmin = vec3(objF(idx,36), objF(idx,37), objF(idx,38));
            vec3 bmax = vec3(objF(idx,40), objF(idx,41), objF(idx,42));
            float tMin = -1e30, tMax = 1e30;
            int nAxis = 0; float nSign = 1.0;
            for (int i = 0; i < 3; i++) {
                float invD = 1.0 / ray.dir[i];
                float t1 = (bmin[i] - ray.origin[i]) * invD;
                float t2 = (bmax[i] - ray.origin[i]) * invD;
                float s = -1.0;
                if (t1 > t2) { float tmp = t1; t1 = t2; t2 = tmp; s = 1.0; }
                if (t1 > tMin) { tMin = t1; nAxis = i; nSign = s; }
                if (t2 < tMax) { tMax = t2; }
                if (tMin > tMax) return hit;
            }
            float t = tMin;
            if (t < EPSILON) { t = tMax; nSign = -nSign; }
            if (t < EPSILON) return hit;
            hit.point = ray.origin + ray.dir * t;
            hit.normal = vec3(0); hit.normal[nAxis] = nSign;
            hit.t = t; hit.valid = true;
            return hit;
        }

        Hit intersectCylinder(Ray ray, int idx) {
            Hit hit; hit.valid = false;
            vec3 base = vec3(objF(idx,36), objF(idx,37), objF(idx,38));
            vec3 cap = vec3(objF(idx,40), objF(idx,41), objF(idx,42));
            float radius = objF(idx, 43);
            vec3 axis = cap - base;
            float axisLen = length(axis);
            if (axisLen < 1e-10) return hit;
            vec3 axisDir = axis / axisLen;
            vec3 o = ray.origin - base;
            float dDotA = dot(ray.dir, axisDir);
            float oDotA = dot(o, axisDir);
            vec3 dPerp = ray.dir - axisDir * dDotA;
            vec3 oPerp = o - axisDir * oDotA;
            float a = dot(dPerp, dPerp);
            float hb = dot(oPerp, dPerp);
            float c = dot(oPerp, oPerp) - radius * radius;
            float disc = hb*hb - a*c;
            if (disc < 0.0) return hit;
            float sq = sqrt(disc);
            float bestT = 1e30; int bestType = 0;
            for (int s = 0; s < 2; s++) {
                float t = (s == 0) ? (-hb - sq) / a : (-hb + sq) / a;
                if (t < EPSILON || t >= bestT) continue;
                float h = oDotA + t * dDotA;
                if (h >= 0.0 && h <= axisLen) { bestT = t; bestType = 0; }
            }
            if (abs(dDotA) > 1e-12) {
                float tBase = -oDotA / dDotA;
                if (tBase > EPSILON && tBase < bestT) {
                    vec3 hp = oPerp + dPerp * tBase;
                    if (dot(hp, hp) <= radius*radius) { bestT = tBase; bestType = 1; }
                }
                float tCap = (axisLen - oDotA) / dDotA;
                if (tCap > EPSILON && tCap < bestT) {
                    vec3 hp = oPerp + dPerp * tCap;
                    if (dot(hp, hp) <= radius*radius) { bestT = tCap; bestType = 2; }
                }
            }
            if (bestT >= 1e29) return hit;
            hit.point = ray.origin + ray.dir * bestT;
            if (bestType == 1) hit.normal = -axisDir;
            else if (bestType == 2) hit.normal = axisDir;
            else {
                vec3 v = hit.point - base;
                float proj = dot(v, axisDir);
                hit.normal = normalize(hit.point - (base + axisDir * proj));
            }
            hit.t = bestT; hit.valid = true;
            return hit;
        }

        Hit intersectCone(Ray ray, int idx) {
            Hit hit; hit.valid = false;
            vec3 base = vec3(objF(idx,36), objF(idx,37), objF(idx,38));
            float r0 = objF(idx, 39);
            vec3 cap = vec3(objF(idx,40), objF(idx,41), objF(idx,42));
            float r1 = objF(idx, 43);
            vec3 axis = cap - base;
            float h = length(axis);
            if (h < 1e-10) return hit;
            vec3 axisDir = axis / h;
            float dr = r1 - r0, k = dr / h;
            vec3 o = ray.origin - base;
            float dDotA = dot(ray.dir, axisDir), oDotA = dot(o, axisDir);
            vec3 dPerp = ray.dir - axisDir * dDotA, oPerp = o - axisDir * oDotA;
            float rAtO = r0 + k * oDotA;
            float a = dot(dPerp, dPerp) - k*k*dDotA*dDotA;
            float hb = dot(oPerp, dPerp) - k*rAtO*dDotA;
            float c = dot(oPerp, oPerp) - rAtO*rAtO;
            float disc = hb*hb - a*c;
            if (disc < 0.0) return hit;
            float sq = sqrt(disc);
            float bestT = 1e30; int bestType = 0;
            for (int s = 0; s < 2; s++) {
                float t = (s == 0) ? (-hb - sq) / a : (-hb + sq) / a;
                if (t < EPSILON || t >= bestT) continue;
                float ap = oDotA + t * dDotA;
                if (ap >= 0.0 && ap <= h) { bestT = t; bestType = 0; }
            }
            if (abs(dDotA) > 1e-12) {
                float tBase = -oDotA / dDotA;
                if (tBase > EPSILON && tBase < bestT) {
                    vec3 hp = oPerp + dPerp * tBase;
                    if (dot(hp, hp) <= r0*r0) { bestT = tBase; bestType = 1; }
                }
                float tCap = (h - oDotA) / dDotA;
                if (tCap > EPSILON && tCap < bestT) {
                    vec3 hp = oPerp + dPerp * tCap;
                    if (dot(hp, hp) <= r1*r1) { bestT = tCap; bestType = 2; }
                }
            }
            if (bestT >= 1e29) return hit;
            hit.point = ray.origin + ray.dir * bestT;
            if (bestType == 1) hit.normal = -axisDir;
            else if (bestType == 2) hit.normal = axisDir;
            else {
                vec3 v = hit.point - base;
                float proj = dot(v, axisDir);
                vec3 radial = normalize(hit.point - (base + axisDir * proj));
                float slopeAngle = atan(dr, h);
                hit.normal = normalize(radial * cos(slopeAngle) - axisDir * sin(slopeAngle));
            }
            hit.t = bestT; hit.valid = true;
            return hit;
        }

        Hit intersectDisc(Ray ray, int idx) {
            Hit hit; hit.valid = false;
            vec3 center = vec3(objF(idx,36), objF(idx,37), objF(idx,38));
            vec3 normal = vec3(objF(idx,40), objF(idx,41), objF(idx,42));
            float radius = objF(idx, 43);
            float denom = dot(ray.dir, normal);
            if (abs(denom) < 1e-12) return hit;
            float t = dot(center - ray.origin, normal) / denom;
            if (t < EPSILON) return hit;
            vec3 p = ray.origin + ray.dir * t;
            if (dot(p - center, p - center) > radius * radius) return hit;
            hit.point = p; hit.normal = normal; hit.t = t; hit.valid = true;
            return hit;
        }

        Hit intersectTriangleGL(Ray ray, int idx) {
            Hit hit; hit.valid = false;
            vec3 p1 = vec3(objF(idx,36), objF(idx,37), objF(idx,38));
            vec3 p2 = vec3(objF(idx,40), objF(idx,41), objF(idx,42));
            vec3 p3 = vec3(objF(idx,44), objF(idx,45), objF(idx,46));
            vec3 e1 = p2 - p1, e2 = p3 - p1;
            vec3 h = cross(ray.dir, e2);
            float a = dot(e1, h);
            if (abs(a) < 1e-12) return hit;
            float f = 1.0 / a;
            vec3 s = ray.origin - p1;
            float u = f * dot(s, h);
            if (u < 0.0 || u > 1.0) return hit;
            vec3 q = cross(s, e1);
            float v = f * dot(ray.dir, q);
            if (v < 0.0 || u + v > 1.0) return hit;
            float t = f * dot(e2, q);
            if (t < EPSILON) return hit;
            hit.point = ray.origin + ray.dir * t;
            hit.normal = normalize(cross(e1, e2));
            hit.t = t; hit.valid = true;
            return hit;
        }

        Hit testShape(Ray lr, int st, int i) {
            Hit hit; hit.valid = false;
            if (st == 1) return intersectSphere(lr, i);
            if (st == 2) return intersectBox(lr, i);
            if (st == 3) return intersectPlane(lr, i);
            if (st == 4) return intersectCylinder(lr, i);
            if (st == 5) return intersectCone(lr, i);
            if (st == 7) return intersectDisc(lr, i);
            if (st == 8) return intersectTriangleGL(lr, i);
            return hit;
        }

        Hit traceScene(Ray ray) {
            Hit closest; closest.t = 1e30; closest.valid = false;
            for (int i = 0; i < 256; i++) {
                if (i >= uObjectCount) break;
                int st = int(objF(i, 0));
                mat4 invM = getMatrix(i, 20);
                Ray lr = transformRay(ray, invM);
                Hit hit = testShape(lr, st, i);
                if (hit.valid && hit.t < closest.t) {
                    mat4 m = getMatrix(i, 4);
                    closest.t = hit.t;
                    closest.point = (m * vec4(hit.point, 1.0)).xyz;
                    closest.normal = transformNormalBack(hit.normal, invM);
                    closest.matIdx = i;
                    closest.valid = true;
                }
            }
            return closest;
        }

        bool shadowTest(vec3 origin, vec3 lightPos) {
            vec3 toLight = lightPos - origin;
            float lightDist = length(toLight);
            Ray sr = Ray(origin, toLight / lightDist);
            for (int i = 0; i < 256; i++) {
                if (i >= uObjectCount) break;
                int st = int(objF(i, 0));
                mat4 invM = getMatrix(i, 20);
                Ray lr = transformRay(sr, invM);
                Hit hit = testShape(lr, st, i);
                if (hit.valid && hit.t > EPSILON && hit.t < lightDist) return true;
            }
            return false;
        }

        vec3 evaluatePigment(int mi, vec3 point) {
            int pType = int(matF(mi, 0));
            vec3 c1 = vec3(matF(mi,1), matF(mi,2), matF(mi,3));
            if (pType == 0) return c1;
            if (pType == 1) {
                vec3 c2 = vec3(matF(mi,4), matF(mi,5), matF(mi,6));
                int ix = int(floor(point.x+0.00001));
                int iy = int(floor(point.y+0.00001));
                int iz = int(floor(point.z+0.00001));
                if (((ix+iy+iz) % 2 + 2) % 2 == 0) return c1;
                return c2;
            }
            return c1;
        }

        vec3 shade(Hit hit, Ray ray) {
            int mi = hit.matIdx;
            vec3 sc = evaluatePigment(mi, hit.point);
            vec3 ambient = vec3(matF(mi,12), matF(mi,13), matF(mi,14));
            vec3 color = sc * ambient;
            float diffK = matF(mi, 8);
            float specK = matF(mi, 10);
            float rough = max(0.001, matF(mi, 11));
            float phongK = matF(mi, 15);
            float phongSz = matF(mi, 16);
            vec3 N = hit.normal;
            vec3 V = -ray.dir;

            for (int i = 0; i < 16; i++) {
                if (i >= uLightCount) break;
                vec3 lPos = vec3(ltF(i,0), ltF(i,1), ltF(i,2));
                vec3 lCol = vec3(ltF(i,4), ltF(i,5), ltF(i,6));
                float castS = ltF(i, 7);
                vec3 L = normalize(lPos - hit.point);
                float NdL = dot(N, L);
                if (NdL <= 0.0) continue;
                if (castS > 0.5 && shadowTest(hit.point + N*EPSILON, lPos)) continue;
                if (diffK > 0.0) color += sc * lCol * diffK * NdL;
                if (phongK > 0.0) {
                    vec3 R = reflect(-L, N);
                    color += lCol * phongK * pow(max(dot(R, V), 0.0), phongSz);
                }
                if (specK > 0.0) {
                    vec3 H = normalize(L + V);
                    color += lCol * specK * pow(max(dot(N, H), 0.0), 1.0/rough);
                }
            }
            return color;
        }

        void main() {
            vec3 camPos = uCamPos;
            vec3 fwd = uCamDir;
            vec3 up = uCamUp;
            vec3 right = uCamRight;

            if (uHasLookAt > 0.5) {
                fwd = normalize(uCamLookAt - camPos);
                right = normalize(cross(fwd, vec3(0, 1, 0)));
                up = normalize(cross(right, fwd));
            }

            float fov = uCamAngle;
            if (fov <= 0.0) fov = 67.38;
            float tanHalf = tan(fov * 0.5 * 3.14159265 / 180.0);
            float aspect = uResolution.x / uResolution.y;

            float sx = (vUV.x - 0.5) * 2.0 * tanHalf * aspect;
            float sy = (vUV.y - 0.5) * 2.0 * tanHalf;

            Ray ray;
            ray.origin = camPos;
            ray.dir = normalize(fwd + right * sx + up * sy);

            vec3 color = uBackground;
            Hit hit = traceScene(ray);
            if (hit.valid) {
                color = shade(hit, ray);
                // One bounce reflection
                vec3 reflMax = vec3(matF(hit.matIdx, 18), matF(hit.matIdx, 19), matF(hit.matIdx, 20));
                if (reflMax.x + reflMax.y + reflMax.z > 0.01) {
                    vec3 reflDir = reflect(ray.dir, hit.normal);
                    Ray rr = Ray(hit.point + hit.normal * EPSILON, reflDir);
                    Hit rh = traceScene(rr);
                    if (rh.valid) color += shade(rh, rr) * reflMax;
                    else color += uBackground * reflMax;
                }
            }

            // sRGB gamma to match WebGPU's sRGB canvas format
            vec3 sc = clamp(color, 0.0, 1.0);
            sc = mix(sc * 12.92, 1.055 * pow(sc, vec3(1.0/2.4)) - 0.055, step(0.0031308, sc));
            fragColor = vec4(sc, 1.0);
        }`;

        this.program = this._createProgram(gl, traceVS, traceFS);
        this._setupQuad(gl);
    }

    uploadScene(packedScene, width, height) {
        const gl = this.gl;
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        gl.viewport(0, 0, width, height);

        // Upload scene data as R32F textures
        this.objTex = this._createDataTexture(gl, packedScene.objectBuffer);
        this.matTex = this._createDataTexture(gl, packedScene.materialBuffer);
        this.ltTex = this._createDataTexture(gl, packedScene.lightBuffer);
        this.objectCount = packedScene.objectCount;
        this.lightCount = packedScene.lightCount;
        this.cam = packedScene.cameraBuffer;
        this.globals = packedScene.globalsBuffer;
    }

    renderSample() {
        const gl = this.gl;
        const pgm = this.program;
        gl.useProgram(pgm);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.objTex);
        gl.uniform1i(gl.getUniformLocation(pgm, 'uObjectTex'), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.matTex);
        gl.uniform1i(gl.getUniformLocation(pgm, 'uMaterialTex'), 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.ltTex);
        gl.uniform1i(gl.getUniformLocation(pgm, 'uLightTex'), 2);

        gl.uniform1i(gl.getUniformLocation(pgm, 'uObjectCount'), this.objectCount);
        gl.uniform1i(gl.getUniformLocation(pgm, 'uLightCount'), this.lightCount);
        gl.uniform2f(gl.getUniformLocation(pgm, 'uResolution'), this.width, this.height);

        const bg = this.globals;
        gl.uniform3f(gl.getUniformLocation(pgm, 'uBackground'), bg[0], bg[1], bg[2]);
        gl.uniform3f(gl.getUniformLocation(pgm, 'uAmbient'), bg[4], bg[5], bg[6]);

        const cam = this.cam;
        gl.uniform3f(gl.getUniformLocation(pgm, 'uCamPos'), cam[0], cam[1], cam[2]);
        gl.uniform3f(gl.getUniformLocation(pgm, 'uCamLookAt'), cam[4], cam[5], cam[6]);
        gl.uniform3f(gl.getUniformLocation(pgm, 'uCamDir'), cam[8], cam[9], cam[10]);
        gl.uniform3f(gl.getUniformLocation(pgm, 'uCamUp'), cam[12], cam[13], cam[14]);
        gl.uniform3f(gl.getUniformLocation(pgm, 'uCamRight'), cam[16], cam[17], cam[18]);
        gl.uniform1f(gl.getUniformLocation(pgm, 'uCamAngle'), cam[20]);
        gl.uniform1f(gl.getUniformLocation(pgm, 'uHasLookAt'), cam[21]);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    _createProgram(gl, vsSource, fsSource) {
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
            console.error('VS:', gl.getShaderInfoLog(vs));
        }

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            console.error('FS:', gl.getShaderInfoLog(fs));
        }

        const pgm = gl.createProgram();
        gl.attachShader(pgm, vs);
        gl.attachShader(pgm, fs);
        gl.linkProgram(pgm);
        if (!gl.getProgramParameter(pgm, gl.LINK_STATUS)) {
            console.error('Link:', gl.getProgramInfoLog(pgm));
        }
        return pgm;
    }

    _setupQuad(gl) {
        const verts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const loc = gl.getAttribLocation(this.program, 'aPos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(vao);
    }

    _createDataTexture(gl, data) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // Pack into 1D R32F texture
        const width = Math.min(4096, data.length);
        const height = Math.ceil(data.length / width);
        const padded = new Float32Array(width * height);
        padded.set(data);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, width, height, 0, gl.RED, gl.FLOAT, padded);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
    }
}
