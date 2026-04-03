# POV-Ray Web

A web-based reimplementation of the classic **POV-Ray** (Persistence of Vision Raytracer), built with vanilla HTML, JavaScript, and CSS using WebGPU and WebGL2 for GPU-accelerated ray tracing. No frameworks, no build step — just open in a browser.

## Overview

POV-Ray Web brings the full capabilities of POV-Ray to the browser, enabling scene description, parsing, and photorealistic ray tracing directly from `.pov` files without native software installation.

### Features

- **Full SDL parser** — complete POV-Ray Scene Description Language support including `#declare`, `#macro`, `#include`, conditionals, loops, and expressions
- **23 geometric primitives** — sphere, box, cylinder, cone, torus, disc, triangle, quadric, superellipsoid, CSG, mesh/mesh2, heightfield, lathe, prism, SOR, sphere_sweep, blob, isosurface, parametric, bicubic_patch, julia_fractal, text
- **Complete material system** — 25+ procedural patterns (bozo, marble, granite, wood, checker, etc.), Perlin noise, image maps, warps, UV mapping, color maps
- **5 camera types** — perspective, orthographic, fisheye, panoramic, spherical
- **GPU ray tracing** — WebGPU compute shaders (primary) with WebGL2 fragment shader fallback
- **Progressive rendering** — with configurable anti-aliasing (Off/4x/9x/16x)
- **BVH acceleration** — SAH-based bounding volume hierarchy with transformed bounding boxes
- **Advanced lighting** — point, spot, area, and parallel lights with soft shadows, Fresnel reflection
- **Refraction** — Snell's law with configurable IOR, total internal reflection, colored transparency
- **Bump mapping** — noise-based normal perturbation (bumps, dents, wrinkles, waves, ripples)
- **Fog** — uniform and ground fog with exponential density
- **Focal blur** — depth of field with configurable aperture
- **Standard library** — all 40 bundled `.inc` files (colors, textures, shapes, transforms, math, etc.)
- **Scene editor** — tabbed editor with Scene and Includes views for editing main file and include dependencies
- **Backend selector** — choose Auto, WebGPU, WebGL2, or CPU rendering

### Supported Formats

- `.pov` — POV-Ray scene description files
- `.povz` — POV-Ray bundle (ZIP containing .pov + local .inc files and dependencies)
- `.inc` — Include files (standard library and user-defined)
- `.ini` — Render configuration files
- Image maps: PNG, JPEG, TGA, BMP, GIF

## Live Version

Try it now at **[povray.bytecoder.com](https://povray.bytecoder.com)** — browse sample scenes and render them directly in your browser.

## Quick Start

```bash
npm start
```

Open http://localhost:8080 and paste a POV-Ray scene into the editor, or load a `.pov`/`.povz` file. Press Ctrl+Enter to render, Ctrl+S to save.

## Architecture

The application is organized as ES modules:

| Layer | Purpose |
|-------|---------|
| `js/parser/` | Tokenizer, scanner, recursive descent parser, symbol table, include resolver |
| `js/scene/` | Scene graph: objects, camera, lights, transforms |
| `js/shapes/` | 23 primitive types with intersection, normal, bbox, inside test |
| `js/material/` | Perlin noise, 25+ patterns, image maps, warps, UV mapping |
| `js/math/` | Vector/matrix ops, polynomial solvers (quartic for torus) |
| `js/render/` | Render manager, camera rays, CPU tracer, animation controller |
| `js/gpu/` | WebGPU compute pipeline, WebGL2 fallback, scene buffer packing |
| `js/bvh/` | SAH BVH construction, AABB operations, stack-based traversal |
| `js/vm/` | Function VM for isosurface evaluation |
| `js/io/` | .povz bundle loader (ZIP reader/writer) |
| `js/include/` | Bundled standard .inc library (40 files) |

## History and Credits

### Original POV-Ray

POV-Ray (Persistence of Vision Raytracer) is a free, cross-platform ray tracing program that generates photorealistic images from text-based scene descriptions. Development began in 1991, evolving from DKBTrace by David K. Buck and Aaron A. Collins.

**Key contributors include:**

- **David K. Buck** — Original DKBTrace author
- **Aaron A. Collins** — DKBTrace co-developer
- **The POV-Team** — Chris Young, Drew Wells, Steve Anger, Tim Wegner, Chris Cason, Thorsten Fröhlich, and many others

POV-Ray is licensed under the **GNU Affero General Public License v3** and is available at https://github.com/POV-Ray/povray.

### POV-Ray Web

This web-based reimplementation was created in 2026 by **Bill Heyman** (bill@heyman.ai) to bring POV-Ray's ray tracing capabilities to modern web browsers using WebGPU and WebGL2 for GPU-accelerated rendering. While POV-Ray Web is a complete rewrite using browser technologies, its parser, scene representation, and rendering algorithms are directly informed by the original POV-Ray codebase.

## License

POV-Ray Web is licensed under the **GNU Affero General Public License v3**, the same license as POV-Ray. See [LICENSE.md](LICENSE.md) for details.

Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
