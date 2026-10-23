/* Page-specific social previews generated from real, published coaching content.
 * Paths are always deterministic; previews never expose draft illustrations.
 * This is also the single source of truth for OG tags and Article image JSON-LD. */
import { publishedIssues } from './editorial.mjs';

export const DEFAULT_SOCIAL_IMAGE = '/og/default.png';

export function socialImageSpecs(model) {
  const issues = publishedIssues(model);
  const specs = [
    { route: '/', image: '/og/pages/home.png', title: 'FREE FOOTBALL COACHING GUIDES', eyebrow: 'HOW WE PLAY FOOTBALL', deck: 'Simple pictures. Simple decisions. Play together.', frame: issues.find(f => f.format === '9v9' && f.slug === '3-1-3-1')?.shape },
    { route: '/about/', image: '/og/pages/about.png', title: 'SEVEN YEARS ON THE TOUCHLINE', eyebrow: 'ABOUT HOW WE PLAY FOOTBALL', deck: 'From grassroots coaching experience to free formation playbooks.', frame: issues.find(f => f.format === '9v9' && f.slug === '3-1-3-1')?.shape }
  ];
  for (const format of ['5v5', '7v7', '9v9']) {
    const first = issues.find(f => f.format === format);
    specs.push({
      route: `/formations/${format}/`,
      image: `/og/formats/${format}.png`,
      title: `${format.toUpperCase()} FORMATION GUIDES`,
      eyebrow: 'HOW WE PLAY FOOTBALL · GRASSROOTS COACHING',
      deck: first ? 'Complete, free playing principles and illustrated positional guides.' : 'New formation guides in development.',
      frame: first?.shape
    });
  }
  for (const f of issues) {
    const base = `/formations/${f.format}/${f.slug}/`;
    const imageBase = `/og/formations/${f.format}/${f.slug}/`;
    specs.push({
      route: base, image: imageBase + 'guide.png',
      title: `THE ${f.name} FORMATION`, eyebrow: `${f.format} · FREE FORMATION PLAYBOOK`,
      deck: 'Starting shape, four playing principles and player responsibilities.', frame: f.shape
    });
    for (const r of f.rules || []) {
      const steps = f.diagrams?.[r.diagram]?.frames || [];
      specs.push({
        route: base + r.id + '/', image: imageBase + r.id + '.png',
        title: r.title, eyebrow: `${f.format} · ${f.name} · PRINCIPLE ${r.n}`,
        deck: r.summary || r.tag || '', frame: steps.find(x => x.verdict === 'right') || steps.at(-1) || f.shape
      });
    }
    for (const r of f.roles || []) {
      const steps = f.diagrams?.[r.diagram]?.frames || [];
      specs.push({
        route: base + 'positions/' + r.id + '/', image: imageBase + 'positions/' + r.id + '.png',
        title: r.title, eyebrow: `${f.format} · ${f.name} · PLAYER ROLES`,
        deck: r.head || '', frame: steps[0] || f.shape
      });
    }
  }
  return specs;
}
export function socialImageForRoute(route, model) {
  const clean = route.endsWith('/') ? route : route + '/';
  const spec = socialImageSpecs(model).find(s => s.route === clean);
  if (!spec) return { image: DEFAULT_SOCIAL_IMAGE, alt: 'How We Play Football: grassroots football coaching publication' };
  return {
    image: spec.image,
    alt: spec.title + ': How We Play Football coaching illustration'
  };
}
