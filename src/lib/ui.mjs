/* The design-system components, configured for this site. Pages import from here, never from
 * design-system/ directly, so the asset path and any site-level defaults are set once. */
import * as C from '../../design-system/components/components.mjs';
export * from '../../design-system/components/components.mjs';
export { renderPitch, renderKey, usedSymbols, SYMBOLS } from '../../design-system/diagrams/renderer.mjs';
export const ASSET_BASE = '/hwp/';
C.configure({ assetBase: ASSET_BASE });

/** Deep copy before handing frames to components that annotate them (diagramFigure adds stage numbers). */
export const clone = o => JSON.parse(JSON.stringify(o));

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export { esc };

/** Date as "19 October 2026" (brand voice). */
export const longDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
