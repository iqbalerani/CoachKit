import { Coach } from '../types';

export function generateShareLink(coach: Coach, creatorName: string): string {
  const data = {
    n: coach.name,
    d: coach.description,
    i: coach.icon,
    t: coach.tagline,
    c: coach.color,
    p: coach.systemPrompt,
    e: coach.examplePrompts,
    by: creatorName,
  };

  const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
  return `coachkit://shared/${encoded}`;
}

export function parseShareLink(encoded: string): Coach | null {
  try {
    const data = JSON.parse(decodeURIComponent(atob(encoded)));
    return {
      id: `shared_${Date.now()}`,
      name: data.n,
      description: data.d,
      icon: data.i,
      tagline: data.t || data.d,
      color: data.c || '#10B981',
      systemPrompt: data.p,
      examplePrompts: data.e || [],
      category: 'Shared',
      isCustom: true,
      isShared: true,
      creatorName: data.by,
    };
  } catch (e) {
    console.error('Failed to parse share link:', e);
    return null;
  }
}
