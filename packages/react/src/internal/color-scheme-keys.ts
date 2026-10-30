/**
 * The two names the scheme switch and its `<head>` script agree on.
 *
 * Kept apart from `internal/color-scheme.ts`, which is a store and imports
 * React, so that `mpColorSchemeScript` can import them without importing React
 * too. A module that imports React is marked `"use client"` by the build, and a
 * function exported from one cannot be called from a server component — which
 * is the one place the script is meant to be written.
 */

/** The attribute on the document element that forces a scheme. */
export const SCHEME_ATTRIBUTE = 'data-mp-scheme';

/** Where a page's choice is remembered, unless told otherwise. */
export const DEFAULT_STORAGE_KEY = 'mp-color-scheme';
