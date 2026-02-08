import { MarketplaceCoach, Coach } from '../types';
import { COLORS } from '../constants/colors';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const MARKETPLACE_TOKEN = process.env.EXPO_PUBLIC_MARKETPLACE_TOKEN || '';
const MARKETPLACE_DB_ID = process.env.EXPO_PUBLIC_MARKETPLACE_DB_ID || '';

async function marketplaceFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${MARKETPLACE_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Marketplace API error (${res.status}): ${error}`);
  }

  return res.json();
}

function extractRichText(prop: any): string {
  if (!prop?.rich_text) return '';
  return prop.rich_text.map((t: any) => t.plain_text || '').join('');
}

function extractTitle(prop: any): string {
  if (!prop?.title) return '';
  return prop.title.map((t: any) => t.plain_text || '').join('');
}

function parseMarketplaceRow(page: any): MarketplaceCoach {
  const props = page.properties;
  return {
    id: page.id,
    name: extractTitle(props.Name || props.name),
    icon: extractRichText(props.Icon || props.icon) || '🤖',
    description: extractRichText(props.Description || props.description),
    category: props.Category?.select?.name || props.category?.select?.name || 'Custom',
    color: extractRichText(props.Color || props.color) || COLORS.accent,
    systemPrompt: extractRichText(props.SystemPrompt || props.system_prompt),
    examplePrompts: (extractRichText(props.ExamplePrompts || props.example_prompts) || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean),
    methodology: (extractRichText(props.Methodology || props.methodology) || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean),
    personality: extractRichText(props.Personality || props.personality),
    tone: extractRichText(props.Tone || props.tone),
    tags: (props.Tags?.multi_select || props.tags?.multi_select || [])
      .map((t: any) => t.name),
    authorName: extractRichText(props.Author || props.author) || 'Community',
    downloads: props.Downloads?.number || props.downloads?.number || 0,
    rating: props.Rating?.number || props.rating?.number || undefined,
    createdAt: page.created_time,
    notionPageId: page.id,
  };
}

export async function browseMarketplace(options?: {
  category?: string;
  sort?: 'downloads' | 'newest' | 'name';
  query?: string;
}): Promise<MarketplaceCoach[]> {
  if (!MARKETPLACE_TOKEN || !MARKETPLACE_DB_ID) {
    throw new Error('Marketplace not configured');
  }

  const filter: any[] = [];
  if (options?.category && options.category !== 'All') {
    filter.push({
      property: 'Category',
      select: { equals: options.category },
    });
  }

  const sorts: any[] = [];
  switch (options?.sort) {
    case 'downloads':
      sorts.push({ property: 'Downloads', direction: 'descending' });
      break;
    case 'name':
      sorts.push({ property: 'Name', direction: 'ascending' });
      break;
    case 'newest':
    default:
      sorts.push({ timestamp: 'created_time', direction: 'descending' });
      break;
  }

  const body: any = { page_size: 50, sorts };
  if (filter.length === 1) {
    body.filter = filter[0];
  } else if (filter.length > 1) {
    body.filter = { and: filter };
  }

  const data = await marketplaceFetch(
    `/databases/${MARKETPLACE_DB_ID}/query`,
    { method: 'POST', body: JSON.stringify(body) }
  );

  let coaches = data.results.map(parseMarketplaceRow);

  // Client-side text search
  if (options?.query) {
    const q = options.query.toLowerCase();
    coaches = coaches.filter(
      (c: MarketplaceCoach) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.authorName.toLowerCase().includes(q)
    );
  }

  return coaches;
}

export async function publishCoach(
  coach: Coach,
  authorName: string
): Promise<{ pageId: string }> {
  if (!MARKETPLACE_TOKEN || !MARKETPLACE_DB_ID) {
    throw new Error('Marketplace not configured');
  }

  const data = await marketplaceFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: MARKETPLACE_DB_ID },
      icon: { type: 'emoji', emoji: coach.icon },
      properties: {
        Name: { title: [{ text: { content: coach.name } }] },
        Description: { rich_text: [{ text: { content: coach.description } }] },
        Icon: { rich_text: [{ text: { content: coach.icon } }] },
        Color: { rich_text: [{ text: { content: coach.color } }] },
        SystemPrompt: { rich_text: [{ text: { content: coach.systemPrompt.slice(0, 2000) } }] },
        ExamplePrompts: { rich_text: [{ text: { content: coach.examplePrompts.join('\n') } }] },
        Methodology: { rich_text: [{ text: { content: (coach.methodology || []).join(', ') } }] },
        Personality: { rich_text: [{ text: { content: coach.personality || '' } }] },
        Tone: { rich_text: [{ text: { content: coach.tone || '' } }] },
        Author: { rich_text: [{ text: { content: authorName } }] },
        Category: { select: { name: coach.category || 'Custom' } },
        Downloads: { number: 0 },
        Tags: {
          multi_select: (coach.tags || []).map(t => ({ name: t })),
        },
      },
    }),
  });

  return { pageId: data.id };
}

export function marketplaceCoachToLocal(mc: MarketplaceCoach): Coach {
  return {
    id: `marketplace_${mc.id}_${Date.now()}`,
    name: mc.name,
    icon: mc.icon,
    description: mc.description,
    tagline: mc.description,
    category: mc.category,
    color: mc.color,
    systemPrompt: mc.systemPrompt,
    examplePrompts: mc.examplePrompts,
    isCustom: true,
    methodology: mc.methodology,
    personality: mc.personality,
    tone: mc.tone,
    tags: mc.tags,
    source: 'marketplace',
    marketplaceId: mc.id,
    authorName: mc.authorName,
    downloads: mc.downloads,
    opens: 0,
    sessions: 0,
  };
}

export async function incrementDownloadCount(pageId: string): Promise<void> {
  try {
    // Read current count
    const page = await marketplaceFetch(`/pages/${pageId}`);
    const current = page.properties?.Downloads?.number || 0;

    // Increment
    await marketplaceFetch(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        properties: {
          Downloads: { number: current + 1 },
        },
      }),
    });
  } catch {
    // Non-critical, silently ignore
  }
}
