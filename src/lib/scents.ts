import type { ScentEntry } from '../types';

export type Gender = 'men' | 'women';

export interface ScentsByGender {
  men: ScentEntry[];
  women: ScentEntry[];
}

export function scentLabel(gender: Gender, inline: string): string {
  return `${gender.toUpperCase()} - NelMora ${inline}`;
}

export function parseScentLabel(label: string): { gender: Gender; inline: string } | null {
  const m = /^(MEN|WOMEN) - NelMora (.+)$/.exec(label);
  if (!m) return null;
  return { gender: m[1] === 'MEN' ? 'men' : 'women', inline: m[2] };
}

export function findScentById(scents: ScentsByGender, id: string): { scent: ScentEntry; gender: Gender } | null {
  const men = scents.men.find((s) => s.id === id);
  if (men) return { scent: men, gender: 'men' };
  const women = scents.women.find((s) => s.id === id);
  if (women) return { scent: women, gender: 'women' };
  return null;
}

export function findScentByLabel(scents: ScentsByGender, label: string): { scent: ScentEntry; gender: Gender } | null {
  const parsed = parseScentLabel(label);
  if (!parsed) return null;
  const scent = scents[parsed.gender].find((s) => s.inline === parsed.inline);
  return scent ? { scent, gender: parsed.gender } : null;
}
