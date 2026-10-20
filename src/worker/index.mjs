/* Cloudflare Worker entrypoint for server-side actions.
 * Static Astro assets are still served by Cloudflare's asset router. Only the
 * /api/contact endpoint invokes this Worker first (see wrangler.jsonc).
 */
import { handleContact } from './contact-handler.mjs';

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/contact' || path === '/api/contact/') {
      return handleContact(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
