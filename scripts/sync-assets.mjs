/* Copies design-system/assets to public/hwp/ so the site serves the package's own files.
 * public/hwp/ is generated (gitignored): edit assets in design-system/assets only. */
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './load-content.mjs';
const out = join(ROOT, 'public/hwp');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(ROOT, 'design-system/assets'), out, { recursive: true });
console.log('Synced design-system/assets → public/hwp/');
