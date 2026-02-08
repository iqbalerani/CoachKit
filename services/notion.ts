import * as SecureStore from 'expo-secure-store';
import { NotionConnection, NotionPage, UserContext, Coach } from '../types';
import { parseWithAI } from './ai';
import { getCurrentUserId } from './storage';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

function getNotionSecureKey(): string {
  const userId = getCurrentUserId();
  return userId ? `coachkit_${userId}_notion_connection` : 'coachkit_notion_connection';
}

const CLIENT_ID = process.env.EXPO_PUBLIC_NOTION_CLIENT_ID || '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_NOTION_CLIENT_SECRET || '';

// --- Connection Management ---

export async function saveNotionConnection(conn: NotionConnection): Promise<void> {
  await SecureStore.setItemAsync(getNotionSecureKey(), JSON.stringify(conn));
}

export async function getNotionConnection(): Promise<NotionConnection | null> {
  const data = await SecureStore.getItemAsync(getNotionSecureKey());
  return data ? JSON.parse(data) : null;
}

export async function deleteNotionConnection(): Promise<void> {
  await SecureStore.deleteItemAsync(getNotionSecureKey());
}

export async function isNotionConnected(): Promise<boolean> {
  const conn = await getNotionConnection();
  if (!conn) return false;
  try {
    const res = await fetch(`${NOTION_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${conn.accessToken}`,
        'Notion-Version': NOTION_VERSION,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- OAuth Token Exchange ---

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<NotionConnection> {
  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const res = await fetch(`${NOTION_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Notion OAuth failed: ${error}`);
  }

  const data = await res.json();

  const connection: NotionConnection = {
    accessToken: data.access_token,
    workspaceId: data.workspace_id,
    workspaceName: data.workspace_name,
    workspaceIcon: data.workspace_icon,
    botId: data.bot_id,
    connectedAt: new Date().toISOString(),
  };

  await saveNotionConnection(connection);
  return connection;
}

// --- API Helpers ---

async function notionFetch(path: string, options: RequestInit = {}): Promise<any> {
  const conn = await getNotionConnection();
  if (!conn) throw new Error('Not connected to Notion');

  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${conn.accessToken}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Notion API error (${res.status}): ${error}`);
  }

  return res.json();
}

// --- Search & Read ---

export async function searchNotionPages(
  query?: string,
  filter?: 'page' | 'database'
): Promise<NotionPage[]> {
  const body: any = {};
  if (query) body.query = query;
  if (filter) body.filter = { value: filter, property: 'object' };
  body.sort = { direction: 'descending', timestamp: 'last_edited_time' };
  body.page_size = 20;

  const data = await notionFetch('/search', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return data.results.map(formatNotionResult);
}

function formatNotionResult(result: any): NotionPage {
  const title = extractTitle(result);
  const icon = result.icon?.emoji || result.icon?.external?.url || undefined;

  return {
    id: result.id,
    title: title || 'Untitled',
    icon,
    lastEditedTime: result.last_edited_time,
    parentType: result.parent?.type === 'workspace'
      ? 'workspace'
      : result.parent?.type === 'database_id'
        ? 'database'
        : 'page',
    url: result.url,
  };
}

function extractTitle(page: any): string {
  // Try page properties
  if (page.properties) {
    const titleProp = Object.values(page.properties).find(
      (p: any) => p.type === 'title'
    ) as any;
    if (titleProp?.title?.[0]?.plain_text) {
      return titleProp.title[0].plain_text;
    }
  }
  // Try database title
  if (page.title?.[0]?.plain_text) {
    return page.title[0].plain_text;
  }
  return '';
}

export async function readNotionPage(pageId: string): Promise<string> {
  let allBlocks: any[] = [];
  let cursor: string | undefined;

  do {
    const url = `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const data = await notionFetch(url);
    allBlocks = allBlocks.concat(data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocksToPlainText(allBlocks);
}

function blocksToPlainText(blocks: any[]): string {
  return blocks
    .map(block => {
      const type = block.type;
      const content = block[type];
      if (!content) return '';

      switch (type) {
        case 'paragraph':
        case 'quote':
        case 'callout':
          return richTextToPlain(content.rich_text);
        case 'heading_1':
        case 'heading_2':
        case 'heading_3':
          return `\n## ${richTextToPlain(content.rich_text)}\n`;
        case 'bulleted_list_item':
        case 'numbered_list_item':
          return `- ${richTextToPlain(content.rich_text)}`;
        case 'to_do':
          const checked = content.checked ? '[x]' : '[ ]';
          return `${checked} ${richTextToPlain(content.rich_text)}`;
        case 'toggle':
          return richTextToPlain(content.rich_text);
        case 'code':
          return `\`\`\`\n${richTextToPlain(content.rich_text)}\n\`\`\``;
        case 'divider':
          return '---';
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

function richTextToPlain(richText: any[]): string {
  if (!richText) return '';
  return richText.map((t: any) => t.plain_text || '').join('');
}

export async function getPageInfo(pageId: string): Promise<{ title: string; lastEditedTime: string }> {
  const page = await notionFetch(`/pages/${pageId}`);
  return {
    title: extractTitle(page),
    lastEditedTime: page.last_edited_time,
  };
}

// --- Context Parsing ---

export async function parseNotionContext(rawContent: string): Promise<Partial<UserContext>> {
  const systemInstruction = `You are a data extraction assistant. Extract user coaching context from the given Notion page content.
Return ONLY a JSON object with these fields (include only what you can confidently extract):
{
  "name": "string",
  "currentFocus": "string - what they're currently working on",
  "biggestGoal": "string - their primary goal",
  "role": "string - their job title or role",
  "strengths": "string - their key strengths",
  "struggles": "string - their challenges or pain points",
  "values": ["array", "of", "values"]
}
If a field cannot be extracted, omit it. Respond ONLY with the JSON object.`;

  const response = await parseWithAI(systemInstruction, rawContent);

  try {
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response for context extraction');
  }
}

// --- Coach Parsing ---

export async function parseNotionCoachInstructions(rawContent: string): Promise<Partial<Coach>> {
  const systemInstruction = `You are an AI coach profile extraction assistant. Extract coaching agent details from the given Notion page content.
Return ONLY a JSON object with these fields (include only what you can extract):
{
  "name": "string - the agent/coach name",
  "description": "string - short description of what this agent does",
  "systemPrompt": "string - the full system instructions or prompt for this agent",
  "examplePrompts": ["example question 1", "example question 2"],
  "methodology": ["framework 1", "framework 2"],
  "personality": "string - personality description",
  "tone": "string - communication tone",
  "category": "string - one of: Productivity, Strategy, Career, Creative, Mindset, Habits, Custom",
  "tags": ["tag1", "tag2"]
}
If the content looks like an AgentOS-style page, extract the system prompt from the instructions section.
Respond ONLY with the JSON object.`;

  const response = await parseWithAI(systemInstruction, rawContent);

  try {
    const cleaned = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response for coach extraction');
  }
}

export function detectAgentOSContent(content: string): boolean {
  const keywords = [
    'system prompt', 'system instructions', 'agent prompt',
    'you are', 'your role is', 'as an ai', 'coaching style',
    'when the user', 'respond with', 'never break character',
  ];
  const lower = content.toLowerCase();
  const matches = keywords.filter(kw => lower.includes(kw));
  return matches.length >= 2;
}

// --- Export to Notion ---

export async function exportSessionToNotion(
  summary: {
    title?: string;
    summary: string;
    actionItems: string[];
    keyInsight: string;
    keyInsights?: string[];
    frameworks?: string[];
    followUp?: string;
    tags?: string[];
  },
  coach: { name: string; icon: string },
  destinationPageId: string
): Promise<{ pageId: string; url: string }> {
  const blocks = buildSessionExportBlocks(summary, coach);

  const data = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { page_id: destinationPageId },
      icon: { type: 'emoji', emoji: coach.icon },
      properties: {
        title: {
          title: [
            {
              text: {
                content: summary.title || `Session with ${coach.name}`,
              },
            },
          ],
        },
      },
      children: blocks,
    }),
  });

  return { pageId: data.id, url: data.url };
}

function buildSessionExportBlocks(
  summary: {
    title?: string;
    summary: string;
    actionItems: string[];
    keyInsight: string;
    keyInsights?: string[];
    frameworks?: string[];
    followUp?: string;
    tags?: string[];
  },
  coach: { name: string; icon: string }
): any[] {
  const blocks: any[] = [];

  // Coach callout
  blocks.push({
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: [{ type: 'text', text: { content: `Session with ${coach.name}` } }],
      icon: { type: 'emoji', emoji: coach.icon },
      color: 'blue_background',
    },
  });

  // Summary
  blocks.push(
    { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Summary' } }] } },
    { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: summary.summary } }] } },
  );

  // Key Insight
  blocks.push(
    { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Key Insight' } }] } },
    {
      object: 'block', type: 'callout', callout: {
        rich_text: [{ type: 'text', text: { content: summary.keyInsight } }],
        icon: { type: 'emoji', emoji: '💡' },
        color: 'yellow_background',
      },
    },
  );

  // Additional Insights
  if (summary.keyInsights?.length) {
    blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Key Insights' } }] } });
    summary.keyInsights.forEach(insight => {
      blocks.push({
        object: 'block', type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: insight } }] },
      });
    });
  }

  // Action Items
  if (summary.actionItems.length) {
    blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Action Items' } }] } });
    summary.actionItems.forEach(item => {
      blocks.push({
        object: 'block', type: 'to_do',
        to_do: { rich_text: [{ type: 'text', text: { content: item } }], checked: false },
      });
    });
  }

  // Frameworks
  if (summary.frameworks?.length) {
    blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Frameworks Referenced' } }] } });
    summary.frameworks.forEach(fw => {
      blocks.push({
        object: 'block', type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: fw } }] },
      });
    });
  }

  // Follow-up
  if (summary.followUp) {
    blocks.push(
      { object: 'block', type: 'divider', divider: {} },
      {
        object: 'block', type: 'callout', callout: {
          rich_text: [{ type: 'text', text: { content: `Follow-up: ${summary.followUp}` } }],
          icon: { type: 'emoji', emoji: '📌' },
          color: 'green_background',
        },
      },
    );
  }

  // Tags
  if (summary.tags?.length) {
    blocks.push({
      object: 'block', type: 'paragraph',
      paragraph: {
        rich_text: [
          { type: 'text', text: { content: 'Tags: ' }, annotations: { bold: true } },
          { type: 'text', text: { content: summary.tags.join(', ') } },
        ],
      },
    });
  }

  return blocks;
}

// --- Coach Export to Notion ---

export async function exportCoachToNotion(
  coach: Coach,
  destinationPageId: string
): Promise<{ pageId: string; url: string }> {
  const blocks = buildCoachExportBlocks(coach);

  const data = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { page_id: destinationPageId },
      icon: { type: 'emoji', emoji: coach.icon },
      properties: {
        title: {
          title: [{ text: { content: coach.name } }],
        },
      },
      children: blocks,
    }),
  });

  return { pageId: data.id, url: data.url };
}

function buildCoachExportBlocks(coach: Coach): any[] {
  const blocks: any[] = [];

  // Agent identity callout
  blocks.push({
    object: 'block', type: 'callout', callout: {
      rich_text: [{ type: 'text', text: { content: `${coach.name} — ${coach.description}` } }],
      icon: { type: 'emoji', emoji: coach.icon },
      color: 'purple_background',
    },
  });

  // Category & tags
  blocks.push({
    object: 'block', type: 'paragraph', paragraph: {
      rich_text: [
        { type: 'text', text: { content: `Category: ${coach.category}` }, annotations: { bold: true } },
        ...(coach.tags?.length
          ? [{ type: 'text', text: { content: ` | Tags: ${coach.tags.join(', ')}` } }]
          : []),
      ],
    },
  });

  // System prompt
  blocks.push(
    { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'System Instructions' } }] } },
    { object: 'block', type: 'code', code: { rich_text: [{ type: 'text', text: { content: coach.systemPrompt } }], language: 'plain text' } },
  );

  // Methodology
  if (coach.methodology?.length) {
    blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Frameworks & Methodology' } }] } });
    coach.methodology.forEach(m => {
      blocks.push({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [{ type: 'text', text: { content: m } }] } });
    });
  }

  // Personality & Tone
  if (coach.personality || coach.tone) {
    blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Personality & Tone' } }] } });
    if (coach.personality) {
      blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: `Personality: ${coach.personality}` } }] } });
    }
    if (coach.tone) {
      blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: `Tone: ${coach.tone}` } }] } });
    }
  }

  // Example prompts
  if (coach.examplePrompts.length) {
    blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Example Prompts' } }] } });
    coach.examplePrompts.forEach(p => {
      blocks.push({ object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: [{ type: 'text', text: { content: p } }] } });
    });
  }

  return blocks;
}

export function getNotionOAuthUrl(redirectUri: string): string {
  return `https://api.notion.com/v1/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
}
