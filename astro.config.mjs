// How We Play · Astro configuration
// Static output only. Conventional, trailing-slash URLs (/formations/9v9/3-1-3-1/).
// The build target (public | preview | local) comes from HWP_TARGET; see docs/PUBLISHING-WORKFLOW.md.
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://howweplayfootball.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  devToolbar: { enabled: false }
});
