// POV-Ray Web - WebGPU/WebGL2 context creation and capability detection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export async function createGPUContext(canvas) {
    // Try WebGPU first
    if (navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
            if (adapter) {
                const device = await adapter.requestDevice({
                    requiredLimits: {
                        maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
                        maxBufferSize: adapter.limits.maxBufferSize
                    }
                });
                const context = canvas.getContext('webgpu');
                const format = navigator.gpu.getPreferredCanvasFormat();
                context.configure({ device, format, alphaMode: 'premultiplied' });
                return {
                    backend: 'webgpu',
                    device,
                    context,
                    format,
                    canvas,
                    adapter,
                    limits: device.limits
                };
            }
        } catch (e) {
            console.warn('WebGPU init failed:', e);
        }
    }

    // Fallback to WebGL2
    const gl = canvas.getContext('webgl2', {
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: true
    });
    if (gl) {
        // Check for float texture support
        const extColorFloat = gl.getExtension('EXT_color_buffer_float');
        const extTexFloat = gl.getExtension('OES_texture_float_linear');
        return {
            backend: 'webgl2',
            gl,
            canvas,
            hasFloatTextures: !!extColorFloat,
            hasFloatLinear: !!extTexFloat
        };
    }

    return { backend: 'none', canvas };
}

export function getBackendName(ctx) {
    return ctx.backend === 'webgpu' ? 'WebGPU' : ctx.backend === 'webgl2' ? 'WebGL2' : 'CPU';
}
