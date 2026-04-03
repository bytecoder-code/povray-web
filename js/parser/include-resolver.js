// POV-Ray Web - Include file resolver
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

let bundledIncludes = null;

export async function loadBundledIncludes() {
    try {
        const module = await import('../include/include-bundle.js');
        bundledIncludes = module.STANDARD_INCLUDES || {};
    } catch {
        bundledIncludes = {};
    }
}

export async function resolveInclude(filename, baseUrl) {
    // 1. Check bundled includes
    if (bundledIncludes && bundledIncludes[filename]) {
        return bundledIncludes[filename];
    }
    // Also try lowercase
    const lower = filename.toLowerCase();
    if (bundledIncludes && bundledIncludes[lower]) {
        return bundledIncludes[lower];
    }

    // 2. Try relative to scene file URL
    if (baseUrl) {
        try {
            const url = new URL(filename, baseUrl);
            const resp = await fetch(url);
            if (resp.ok) return await resp.text();
        } catch { /* ignore */ }
    }

    // 3. Try relative to app root
    try {
        const resp = await fetch(`include/${filename}`);
        if (resp.ok) return await resp.text();
    } catch { /* ignore */ }

    console.warn(`Could not resolve #include "${filename}"`);
    return null;
}
