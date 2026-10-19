/* Loads content for the Astro build (Vite import, so edits hot-reload in `npm run dev`). */
import site from '../../content/site.json';
import register from '../../content/register.json';
import facts from '../../content/editorial/format-facts.json';
import checklist from '../../content/editorial/moving-up-checklist.json';
import { buildModel, resolveTarget } from './model.mjs';

const files = import.meta.glob('../../content/formations/*/*.json', { eager: true, import: 'default' });
const formations = Object.values(files);

export const TARGET = resolveTarget(process.env);
export const model = buildModel({ site, register, facts, formations, checklist }, TARGET);
export default model;
