# CoachKit — Full Notion Integration Specification

**Version:** 2.0  
**Date:** February 6, 2026  
**Author:** Iqbal (Solo Developer)  
**Status:** Ready for Implementation  
**Priority:** Critical — Primary Competition Differentiator  

---

## 1. Overview

### 1.1 Vision

CoachKit is not just a standalone coaching app — it is the **mobile extension of Simon's Notion ecosystem.** Simon's audience lives in Notion. Their goals, values, habits, agent instructions, and life systems all exist there. CoachKit bridges that world into a beautiful, focused mobile coaching experience with full bidirectional Notion integration.

### 1.2 Feature Summary

| # | Feature | Description |
|---|---|---|
| F1 | **Notion OAuth Connect** | One-tap workspace connection with secure token management |
| F2 | **Personal Context Import** | Pull goals, values, and personal data from Notion pages/databases |
| F3 | **Auto-Sync Context** | Periodically refresh user context from Notion so coaches stay current |
| F4 | **Export Session Summaries** | Push coaching insights, action items, and session notes back to Notion |
| F5 | **Coach Import from Agent Instructions** | Import AgentOS modes and custom agent profiles as CoachKit coaches |
| F6 | **Coach Export to Notion** | Export CoachKit coaches as Notion agent instruction pages |
| F7 | **AgentOS Marketplace Bridge** | Shared library where users can publish and discover community coaches |

### 1.3 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CoachKit App                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │Onboarding│  │ Coaching  │  │ Builder  │  │ Marketplace │  │
│  │  Import   │  │  Export   │  │  Import  │  │   Bridge    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
│       │              │              │               │         │
│  ┌────▼──────────────▼──────────────▼───────────────▼──────┐  │
│  │              services/notion.ts                          │  │
│  │         (OAuth + API Client + Sync Engine)               │  │
│  └────────────────────────┬────────────────────────────────┘  │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │ HTTPS
                ┌───────────▼───────────────┐
                │   Notion API (v2022-06-28) │
                │                           │
                │  • OAuth endpoints        │
                │  • Pages API              │
                │  • Databases API          │
                │  • Blocks API             │
                │  • Search API             │
                └───────────────────────────┘
```

---

## 2. F1: Notion OAuth Connect

### 2.1 User Story

> As a CoachKit user, I want to connect my Notion workspace with one tap so that all my existing goals, values, and agent instructions are available to my coaches without manual copy-pasting.

### 2.2 Notion Integration Setup (Developer Side)

**Prerequisites:**
1. Create a Notion Integration at https://www.notion.so/my-integrations
2. Select "Public integration" (allows any user to connect)
3. Set redirect URI to: `coachkit://notion-callback`
4. Request capabilities: Read content, Read user information
5. Store `client_id` and `client_secret`

**OAuth Flow (Authorization Code with PKCE):**

```
User taps "Connect Notion"
        │
        ▼
┌─────────────────────────────┐
│  Open WebBrowser to:        │
│  https://api.notion.com/v1/ │
│  oauth/authorize?           │
│    client_id={CLIENT_ID}    │
│    redirect_uri=coachkit:// │
│      notion-callback        │
│    response_type=code       │
│    owner=user               │
│    state={random_state}     │
└─────────────────────────────┘
        │
        ▼ (User authorizes in Notion)
┌─────────────────────────────┐
│  Notion redirects to:       │
│  coachkit://notion-callback │
│    ?code={auth_code}        │
│    &state={state}           │
└─────────────────────────────┘
        │
        ▼ (App intercepts deep link)
┌─────────────────────────────┐
│  POST https://api.notion.com│
│  /v1/oauth/token            │
│  {                          │
│    grant_type:              │
│      "authorization_code",  │
│    code: {auth_code},       │
│    redirect_uri: "coachkit: │
│      //notion-callback"     │
│  }                          │
│  Authorization: Basic       │
│    base64(id:secret)        │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  Response:                  │
│  {                          │
│    access_token: "...",     │
│    workspace_id: "...",     │
│    workspace_name: "...",   │
│    workspace_icon: "...",   │
│    bot_id: "...",           │
│    owner: { user: {...} }   │
│  }                          │
│                             │
│  Store securely in          │
│  SecureStore (expo)         │
└─────────────────────────────┘
```

### 2.3 Implementation Details

#### 2.3.1 Dependencies

```bash
npx expo install expo-auth-session expo-web-browser expo-secure-store expo-crypto
```

#### 2.3.2 services/notion.ts — OAuth Module

```typescript
// === Types ===

interface NotionConnection {
  accessToken: string;
  workspaceId: string;
  workspaceName: string;
  workspaceIcon: string | null;
  botId: string;
  ownerUserId: string;
  ownerUserName: string;
  connectedAt: string;
  lastSyncAt: string | null;
}

interface NotionPage {
  id: string;
  title: string;
  icon: string | null;
  lastEdited: string;
  parentType: 'workspace' | 'database' | 'page';
  parentId: string | null;
}

interface NotionDatabase {
  id: string;
  title: string;
  icon: string | null;
  description: string | null;
  properties: Record<string, NotionPropertySchema>;
}

interface NotionBlock {
  id: string;
  type: string;
  content: string;
  children?: NotionBlock[];
}

// === OAuth Functions ===

/**
 * Initiate Notion OAuth flow using expo-auth-session.
 * Opens browser for user authorization, handles callback.
 */
export async function connectNotion(): Promise<NotionConnection>;

/**
 * Exchange authorization code for access token.
 * Stores token securely in expo-secure-store.
 */
async function exchangeCodeForToken(code: string): Promise<NotionConnection>;

/**
 * Retrieve stored Notion connection. Returns null if not connected.
 */
export async function getNotionConnection(): Promise<NotionConnection | null>;

/**
 * Disconnect Notion workspace. Clears stored tokens and synced data.
 */
export async function disconnectNotion(): Promise<void>;

/**
 * Check if Notion token is still valid by making a test API call.
 * If expired/revoked, clear connection and return false.
 */
export async function isNotionConnected(): Promise<boolean>;
```

#### 2.3.3 Token Storage

```typescript
import * as SecureStore from 'expo-secure-store';

const NOTION_TOKEN_KEY = 'coachkit_notion_token';
const NOTION_CONNECTION_KEY = 'coachkit_notion_connection';

async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(NOTION_TOKEN_KEY, token);
}

async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(NOTION_TOKEN_KEY);
}

async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(NOTION_TOKEN_KEY);
  await SecureStore.deleteItemAsync(NOTION_CONNECTION_KEY);
}
```

### 2.4 User Flow

```
Profile Screen / Settings
        │
        ▼
┌────────────────────────────────────┐
│  Notion Integration                │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🔗  Connect Notion          │  │
│  │                              │  │
│  │  Sync your goals, values,   │  │
│  │  and agent instructions     │  │
│  │  from your Notion workspace │  │
│  │                              │  │
│  │  [Connect Workspace →]      │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
        │
        ▼ (after connection)
┌────────────────────────────────────┐
│  Notion Integration                │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  ✅  Connected               │  │
│  │  Workspace: "Simon's Space" │  │
│  │  Last synced: 2 min ago     │  │
│  │                              │  │
│  │  [Sync Now]  [Disconnect]   │  │
│  └──────────────────────────────┘  │
│                                    │
│  Import Settings:                  │
│  ┌──────────────────────────────┐  │
│  │  📄 Context Source           │  │
│  │  "My Goals & Values" page   │  │
│  │  [Change Source]             │  │
│  ├──────────────────────────────┤  │
│  │  🔄 Auto-Sync               │  │
│  │  Every 24 hours    [Toggle] │  │
│  ├──────────────────────────────┤  │
│  │  📤 Export Sessions          │  │
│  │  To: "CoachKit Sessions" db │  │
│  │  [Change Destination]       │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### 2.5 UI Specifications

**Connect Button (disconnected state)**
- Card with subtle border, Notion logo icon on left
- Title: "Connect Notion"
- Subtitle: "Sync your goals, values, and agent instructions"
- CTA: "Connect Workspace →" in emerald accent
- Tap opens system browser for OAuth

**Connected State Card**
- Green checkmark badge
- Workspace name and icon from Notion
- "Last synced" timestamp
- "Sync Now" secondary button | "Disconnect" text button (destructive)

**Import Settings Section**
- Appears only when connected
- Card-based list of configuration options
- Each item shows current selection and a "Change" action

### 2.6 Edge Cases

| Scenario | Handling |
|---|---|
| User cancels OAuth mid-flow | Return to settings, no state change. Show nothing. |
| Token expires/revoked | Detect on next API call. Show "Reconnect" prompt. Clear stale data. |
| No internet during OAuth | Show error: "Please check your connection and try again." |
| User has multiple workspaces | Notion OAuth selects one workspace at authorization time. Show which is connected. |
| User disconnects | Clear token, clear synced data, preserve manually-entered context. Ask for confirmation. |

---

## 3. F2: Personal Context Import (OAuth-Powered)

### 3.1 User Story

> As a connected Notion user, I want CoachKit to pull my goals, values, and personal context directly from my Notion pages so my coaches know me without any manual entry.

### 3.2 How It Works

After OAuth connection, the user selects a source page or database from their workspace. CoachKit reads the content and uses Gemini to extract structured context.

### 3.3 Source Selection Flow

```
"Choose Context Source"
        │
        ▼
┌────────────────────────────────────┐
│  Select a Notion Page              │
│                                    │
│  🔍 Search pages...               │
│                                    │
│  Recently Edited:                  │
│  ┌──────────────────────────────┐  │
│  │ 📄 My Goals & Values        │  │
│  │    Last edited: 2 days ago  │  │
│  ├──────────────────────────────┤  │
│  │ 📄 2026 Yearly Plan         │  │
│  │    Last edited: 1 week ago  │  │
│  ├──────────────────────────────┤  │
│  │ 📄 Life OS Dashboard        │  │
│  │    Last edited: 3 days ago  │  │
│  ├──────────────────────────────┤  │
│  │ 📊 Goals Database           │  │
│  │    Last edited: 1 day ago   │  │
│  └──────────────────────────────┘  │
│                                    │
│  💡 Tip: Select the page with     │
│  your goals, values, or profile.  │
│  Life OS and AgentOS profile      │
│  pages work great!                 │
└────────────────────────────────────┘
        │
        ▼ (user selects page)
┌────────────────────────────────────┐
│  Importing Context...              │
│                                    │
│  Reading "My Goals & Values"...    │
│  ████████████░░░░ 75%              │
│                                    │
│  Extracting your goals...          │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│  Review Imported Context           │
│                                    │
│  Name: Sarah                       │
│  Role: Freelance Brand Strategist  │
│  Focus: Launching coaching offer   │
│  Goal: £5k/mo recurring by Q3     │
│  Values: Growth, autonomy,         │
│    simplicity, creativity          │
│  Strengths: Strategic thinking,    │
│    writing, client relationships   │
│  Struggles: Consistency, saying    │
│    no, overthinking decisions      │
│                                    │
│  Source: "My Goals & Values"       │
│  🔄 Auto-sync: On (24hr)          │
│                                    │
│  [Edit Fields]  [Save Context →]   │
└────────────────────────────────────┘
```

### 3.4 Notion API Calls

#### 3.4.1 Search User's Pages

```typescript
/**
 * Search the user's connected workspace for pages and databases.
 * Used in the source selection screen.
 */
export async function searchNotionPages(
  query?: string,
  filter?: 'page' | 'database'
): Promise<NotionPage[]> {
  const token = await getToken();
  
  const response = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query || '',
      filter: filter ? { property: 'object', value: filter } : undefined,
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
      page_size: 20,
    }),
  });
  
  const data = await response.json();
  return data.results.map(formatNotionResult);
}
```

#### 3.4.2 Read Page Content

```typescript
/**
 * Read all blocks (content) from a Notion page.
 * Recursively fetches child blocks for nested content.
 * Returns plain text representation for AI parsing.
 */
export async function readNotionPage(pageId: string): Promise<string> {
  const token = await getToken();
  let allBlocks: NotionBlock[] = [];
  let cursor: string | undefined;

  // Paginate through all blocks
  do {
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${
        cursor ? `&start_cursor=${cursor}` : ''
      }`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
        },
      }
    );
    
    const data = await response.json();
    allBlocks = [...allBlocks, ...data.results];
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocksToPlainText(allBlocks);
}

/**
 * Convert Notion blocks to plain text for AI parsing.
 * Handles paragraphs, headings, lists, todos, toggles, etc.
 */
function blocksToPlainText(blocks: any[]): string {
  return blocks.map(block => {
    const type = block.type;
    const content = block[type];
    
    switch (type) {
      case 'paragraph':
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        return richTextToPlain(content.rich_text);
      
      case 'bulleted_list_item':
      case 'numbered_list_item':
        return `• ${richTextToPlain(content.rich_text)}`;
      
      case 'to_do':
        const checked = content.checked ? '✅' : '☐';
        return `${checked} ${richTextToPlain(content.rich_text)}`;
      
      case 'toggle':
        return richTextToPlain(content.rich_text);
      
      case 'quote':
      case 'callout':
        return richTextToPlain(content.rich_text);
      
      case 'divider':
        return '---';
      
      default:
        return '';
    }
  }).filter(Boolean).join('\n');
}

function richTextToPlain(richText: any[]): string {
  return richText?.map(rt => rt.plain_text).join('') || '';
}
```

#### 3.4.3 Read Database Items

```typescript
/**
 * Query a Notion database and extract structured data.
 * Used when user selects a Goals database as their context source.
 */
export async function queryNotionDatabase(
  databaseId: string,
  filter?: object
): Promise<string> {
  const token = await getToken();
  
  const response = await fetch(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 50,
        filter: filter,
      }),
    }
  );

  const data = await response.json();
  return databaseResultsToText(data.results);
}

/**
 * Convert database query results to readable text.
 * Extracts property values from each row/page.
 */
function databaseResultsToText(results: any[]): string {
  return results.map(page => {
    const props = page.properties;
    const lines: string[] = [];
    
    for (const [key, value] of Object.entries(props) as any[]) {
      const extracted = extractPropertyValue(value);
      if (extracted) {
        lines.push(`${key}: ${extracted}`);
      }
    }
    
    return lines.join('\n');
  }).join('\n\n');
}

function extractPropertyValue(prop: any): string | null {
  switch (prop.type) {
    case 'title':
      return prop.title?.map((t: any) => t.plain_text).join('') || null;
    case 'rich_text':
      return prop.rich_text?.map((t: any) => t.plain_text).join('') || null;
    case 'number':
      return prop.number?.toString() || null;
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map((s: any) => s.name).join(', ') || null;
    case 'date':
      return prop.date?.start || null;
    case 'checkbox':
      return prop.checkbox ? 'Yes' : 'No';
    case 'status':
      return prop.status?.name || null;
    default:
      return null;
  }
}
```

### 3.5 AI Parsing (Same as v1 spec, enhanced)

```typescript
/**
 * Parse raw Notion content into structured user context.
 * Enhanced to handle both page text and database output.
 */
export async function parseNotionContext(
  rawContent: string
): Promise<Partial<UserContext>> {
  const prompt = `You are a context parser for CoachKit, a personal AI coaching app.

The user has connected their Notion workspace and selected a page or database
as their personal context source. Below is the extracted content.

Parse this into a structured coaching profile. Return ONLY valid JSON:

{
  "name": "string or null",
  "role": "string — their job, role, or identity (1 sentence)",
  "currentFocus": "string — what they're actively working on right now",
  "biggestGoal": "string — their primary goal or aspiration",
  "values": "string — comma-separated core values",
  "strengths": "string — comma-separated strengths or skills",
  "struggles": "string — comma-separated challenges or areas for growth",
  "additionalContext": "string — any other coaching-relevant details (interests, life stage, constraints)"
}

Rules:
- Be concise. Summarize, don't copy verbatim.
- If a field cannot be determined, set it to null.
- Focus on information that would help a coach personalize sessions.
- Ignore administrative, formatting, or system-level content.

Content:
${rawContent.substring(0, 6000)}`;

  const response = await sendMessage(prompt, [], null);
  
  try {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse Notion context');
  }
}
```

### 3.6 Fallback: Paste-Based Import

If OAuth fails, is unavailable, or the user prefers not to connect, the paste-based import from v1 spec remains as a fallback:

```
┌────────────────────────────────────┐
│  Import Your Context               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 🔗 Connect Notion           │  │
│  │ One-tap workspace sync      │  │
│  └──────────────────────────────┘  │
│                                    │
│  ── or ──                          │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📋 Paste from Notion        │  │
│  │ Copy & paste your content   │  │
│  └──────────────────────────────┘  │
│                                    │
│  ── or ──                          │
│                                    │
│  [Fill in Manually ↓]             │
└────────────────────────────────────┘
```

### 3.7 Data Mapping

| Source | Parsed Field | Maps To | Storage |
|---|---|---|---|
| Notion Page / Paste | `name` | `UserContext.name` | AsyncStorage |
| Notion Page / Paste | `role` | `UserContext.role` | AsyncStorage |
| Notion Page / Paste | `currentFocus` | `UserContext.currentFocus` | AsyncStorage |
| Notion Page / Paste | `biggestGoal` | `UserContext.biggestGoal` | AsyncStorage |
| Notion Page / Paste | `values` | `UserContext.values` | AsyncStorage |
| Notion Page / Paste | `strengths` | `UserContext.strengths` | AsyncStorage |
| Notion Page / Paste | `struggles` | `UserContext.struggles` | AsyncStorage |
| Notion Page / Paste | `additionalContext` | `UserContext.additionalContext` | AsyncStorage |
| System | `notionSourcePageId` | `UserContext.notionSourcePageId` | AsyncStorage |
| System | `notionLastSyncAt` | `UserContext.notionLastSyncAt` | AsyncStorage |
| System | `importedFromNotion` | `UserContext.importedFromNotion` | AsyncStorage |

---

## 4. F3: Auto-Sync Context

### 4.1 User Story

> As a connected Notion user, I want CoachKit to automatically refresh my context when my Notion pages change, so my coaches always have my latest goals and priorities without me re-importing.

### 4.2 Sync Strategy

Since Expo has limited background task support, use a **foreground sync approach:**

1. **On app open** — Check if last sync was >24 hours ago. If yes, sync silently.
2. **Manual sync** — "Sync Now" button in Notion settings.
3. **Before coaching session** — Quick check before first message if sync is stale (>48 hrs).

### 4.3 Implementation

```typescript
// === services/notion.ts — Sync Module ===

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Check if context needs refresh based on last sync time.
 */
export async function needsSync(): Promise<boolean> {
  const connection = await getNotionConnection();
  if (!connection) return false;
  
  const lastSync = connection.lastSyncAt
    ? new Date(connection.lastSyncAt).getTime()
    : 0;
  
  return Date.now() - lastSync > SYNC_INTERVAL_MS;
}

/**
 * Check if context is stale (used before coaching sessions).
 */
export async function isContextStale(): Promise<boolean> {
  const connection = await getNotionConnection();
  if (!connection) return false;
  
  const lastSync = connection.lastSyncAt
    ? new Date(connection.lastSyncAt).getTime()
    : 0;
  
  return Date.now() - lastSync > STALE_THRESHOLD_MS;
}

/**
 * Perform a full context sync from the connected Notion page.
 * 1. Read the stored source page
 * 2. Parse with AI
 * 3. Update UserContext
 * 4. Update lastSyncAt
 * 
 * Returns true if context was updated, false if unchanged.
 */
export async function syncContext(): Promise<{
  updated: boolean;
  newContext: Partial<UserContext> | null;
  error: string | null;
}> {
  try {
    const connection = await getNotionConnection();
    if (!connection) return { updated: false, newContext: null, error: 'Not connected' };
    
    const user = await getUser();
    if (!user?.notionSourcePageId) {
      return { updated: false, newContext: null, error: 'No source page selected' };
    }

    // Check if source page was modified since last sync
    const pageInfo = await getPageInfo(user.notionSourcePageId);
    const pageLastEdited = new Date(pageInfo.last_edited_time).getTime();
    const lastSync = connection.lastSyncAt
      ? new Date(connection.lastSyncAt).getTime()
      : 0;

    if (pageLastEdited <= lastSync) {
      // Page hasn't changed — update sync time but skip re-parsing
      await updateLastSyncTime();
      return { updated: false, newContext: null, error: null };
    }

    // Page has changed — re-read and re-parse
    const rawContent = await readNotionPage(user.notionSourcePageId);
    const parsedContext = await parseNotionContext(rawContent);
    
    // Merge with existing context (preserve fields not in Notion)
    const mergedContext: Partial<UserContext> = {
      ...user,
      ...parsedContext,
      notionLastSyncAt: new Date().toISOString(),
      importedFromNotion: true,
    };
    
    await saveUser(mergedContext as UserContext);
    await updateLastSyncTime();
    
    return { updated: true, newContext: parsedContext, error: null };
  } catch (error: any) {
    return { updated: false, newContext: null, error: error.message };
  }
}

async function getPageInfo(pageId: string): Promise<any> {
  const token = await getToken();
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
    },
  });
  return response.json();
}

async function updateLastSyncTime(): Promise<void> {
  const connection = await getNotionConnection();
  if (connection) {
    connection.lastSyncAt = new Date().toISOString();
    await SecureStore.setItemAsync(
      NOTION_CONNECTION_KEY,
      JSON.stringify(connection)
    );
  }
}
```

### 4.4 Sync Hook

```typescript
// === hooks/useNotionSync.ts ===

import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { needsSync, syncContext, isNotionConnected } from '../services/notion';

export function useNotionSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  // Sync when app comes to foreground
  useEffect(() => {
    const handleAppState = async (state: AppStateStatus) => {
      if (state === 'active') {
        const connected = await isNotionConnected();
        if (connected && await needsSync()) {
          await performSync();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    
    // Also check on mount
    handleAppState('active');

    return () => subscription?.remove();
  }, []);

  const performSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncContext();
      if (result.updated) {
        setLastSyncResult('Context updated from Notion');
      } else if (result.error) {
        setLastSyncResult(`Sync failed: ${result.error}`);
      } else {
        setLastSyncResult('Already up to date');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return { isSyncing, lastSyncResult, performSync };
}
```

### 4.5 Integration Points

| Trigger | Action | User Visibility |
|---|---|---|
| App opens (after >24hrs) | Silent background sync | Small toast: "✓ Context synced from Notion" |
| User taps "Sync Now" | Immediate sync with loading indicator | Full feedback: updated fields shown |
| Before first message (if stale >48hrs) | Quick sync with subtle indicator | Banner: "Updating your context from Notion..." |
| Notion connection lost | Skip sync, no error shown | Only shows on next manual sync attempt |

---

## 5. F4: Export Session Summaries to Notion

### 5.1 User Story

> As a CoachKit user who manages my life in Notion, I want my coaching session insights and action items to appear in my Notion workspace so everything stays connected and nothing gets lost.

### 5.2 What Gets Exported

After each coaching session (or on-demand), CoachKit generates a summary and creates a page in the user's chosen Notion database.

**Exported content:**
- Session title (coach name + date)
- Session summary (AI-generated)
- Key insights extracted from the conversation
- Action items with checkboxes
- Coaching methodology used
- Session duration and message count
- Mood/energy tags (if applicable)

### 5.3 Summary Generation

```typescript
/**
 * Generate a coaching session summary using Gemini.
 * Called when user ends a session or after a natural conversation break.
 */
export async function generateSessionSummary(
  messages: Message[],
  coach: Coach,
  userContext: UserContext
): Promise<SessionSummary> {
  const prompt = `You are summarizing a coaching session from CoachKit.

Coach: ${coach.name} (${coach.description})
User: ${userContext.name}
Messages: ${messages.length}

Generate a structured summary. Return ONLY valid JSON:

{
  "title": "string — descriptive session title (e.g., 'Clarifying Q3 Business Strategy')",
  "summary": "string — 2-3 sentence overview of what was discussed and decided",
  "keyInsights": ["string array — 2-4 key takeaways or realizations"],
  "actionItems": ["string array — specific next steps the user committed to"],
  "frameworks": ["string array — methodologies or frameworks referenced"],
  "tags": ["string array — 1-3 topic tags like 'career', 'goals', 'decisions'"],
  "followUp": "string — suggested topic for next session"
}

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n').substring(0, 4000)}`;

  const response = await sendMessage(prompt, [], null);
  const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}
```

### 5.4 Notion Export Implementation

```typescript
// === services/notion.ts — Export Module ===

interface ExportDestination {
  type: 'database' | 'page';
  id: string;
  name: string;
}

/**
 * Export a session summary as a new page in a Notion database.
 * Creates a rich, formatted page with properties and content blocks.
 */
export async function exportSessionToNotion(
  summary: SessionSummary,
  coach: Coach,
  destination: ExportDestination
): Promise<{ pageId: string; pageUrl: string }> {
  const token = await getToken();

  const requestBody: any = {
    parent: destination.type === 'database'
      ? { database_id: destination.id }
      : { page_id: destination.id },
  };

  // If exporting to a database, set properties
  if (destination.type === 'database') {
    requestBody.properties = {
      // Title property (required for all database pages)
      'Name': {
        title: [{ text: { content: summary.title } }],
      },
      // Optional properties — only set if they exist in the database
      // The app should detect database schema first and map accordingly
    };
  }

  // Page content as Notion blocks
  requestBody.children = buildExportBlocks(summary, coach);

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  return {
    pageId: data.id,
    pageUrl: data.url,
  };
}

/**
 * Build Notion block array from session summary.
 * Creates a beautifully formatted coaching session page.
 */
function buildExportBlocks(summary: SessionSummary, coach: Coach): any[] {
  const blocks: any[] = [];

  // Header callout with coach info
  blocks.push({
    object: 'block',
    type: 'callout',
    callout: {
      icon: { type: 'emoji', emoji: coach.icon },
      rich_text: [{
        type: 'text',
        text: { content: `Session with ${coach.name} — CoachKit` },
      }],
    },
  });

  // Summary section
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: '📝 Summary' } }],
    },
  });

  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: summary.summary } }],
    },
  });

  // Key Insights
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: '💡 Key Insights' } }],
    },
  });

  for (const insight of summary.keyInsights) {
    blocks.push({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: insight } }],
      },
    });
  }

  // Action Items (as to-do blocks)
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: '✅ Action Items' } }],
    },
  });

  for (const action of summary.actionItems) {
    blocks.push({
      object: 'block',
      type: 'to_do',
      to_do: {
        rich_text: [{ type: 'text', text: { content: action } }],
        checked: false,
      },
    });
  }

  // Frameworks Used
  if (summary.frameworks?.length > 0) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '🧭 Frameworks Used' } }],
      },
    });

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: summary.frameworks.join(', ') },
        }],
      },
    });
  }

  // Follow-up suggestion
  blocks.push({ object: 'block', type: 'divider', divider: {} });

  blocks.push({
    object: 'block',
    type: 'callout',
    callout: {
      icon: { type: 'emoji', emoji: '🔮' },
      rich_text: [{
        type: 'text',
        text: { content: `Next session suggestion: ${summary.followUp}` },
      }],
    },
  });

  return blocks;
}
```

### 5.5 Export User Flow

```
Session Ends (or user taps "End Session")
        │
        ▼
┌────────────────────────────────────┐
│  Session Complete! 🎉              │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Summary                      │  │
│  │ "Clarifying Q3 Strategy"     │  │
│  │                              │  │
│  │ You explored three possible  │  │
│  │ paths for your freelance     │  │
│  │ business and committed to... │  │
│  └──────────────────────────────┘  │
│                                    │
│  Key Insights:                     │
│  • Focus beats diversification     │
│  • Revenue target needs timeline   │
│                                    │
│  Action Items:                     │
│  ☐ Draft 90-day plan by Friday    │
│  ☐ Reach out to 3 past clients    │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📤 Export to Notion           │  │
│  │ Save insights to your        │  │
│  │ workspace                    │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Start New Session] [Done]        │
└────────────────────────────────────┘
        │
        ▼ (if Export tapped)
┌────────────────────────────────────┐
│  Choose Destination                │
│                                    │
│  Recent:                           │
│  📊 CoachKit Sessions (database)  │
│  📄 My Journal (page)             │
│                                    │
│  [Search Notion...]                │
│                                    │
│  [Export →]                        │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│  ✅ Exported to Notion!            │
│                                    │
│  Saved to "CoachKit Sessions"      │
│  [Open in Notion]  [Done]          │
└────────────────────────────────────┘
```

### 5.6 Auto-Export Option

```typescript
// In Notion settings, user can enable auto-export
interface NotionExportSettings {
  autoExport: boolean;
  destinationId: string | null;
  destinationType: 'database' | 'page' | null;
  destinationName: string | null;
  exportOnSessionEnd: boolean; // Trigger on every session end
  minimumMessages: number; // Don't export very short sessions (default: 5)
}
```

### 5.7 Tier Gating

| Tier | Access |
|---|---|
| Free | Cannot export (shows upgrade prompt after session summary) |
| Pro | Manual export (tap "Export to Notion" button) |
| Creator | Manual + Auto-export enabled |

---

## 6. F5: Coach Import from Agent Instructions (OAuth + Paste)

### 6.1 User Story

> As an AgentOS user, I want to import my custom Notion agent modes directly into CoachKit as fully-configured coaches, including their personality, methodology, and instructions.

### 6.2 OAuth-Powered Import Flow

```
Builder: Create Screen
        │
        ▼
┌────────────────────────────────────┐
│  Create a New Coach                │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 🛠️ Build from Scratch        │  │
│  │ Configure every detail       │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 🔗 Import from Notion        │  │
│  │ AgentOS modes & custom       │  │
│  │ agent instructions           │  │
│  │                              │  │
│  │  [Connected: Simon's Space] │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📋 Paste Instructions        │  │
│  │ Copy & paste agent prompts   │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
        │
        ▼ (Import from Notion tapped)
┌────────────────────────────────────┐
│  Select Agent Instructions Page    │
│                                    │
│  🔍 Search pages...               │
│                                    │
│  Suggested (AgentOS detected):     │
│  ┌──────────────────────────────┐  │
│  │ 🤖 Productivity Coach Mode   │  │
│  │ 📄 Decision Coach Mode       │  │
│  │ 📝 Notes Transformer Mode    │  │
│  │ 🎯 Goal Setting Coach Mode   │  │
│  └──────────────────────────────┘  │
│                                    │
│  All Pages:                        │
│  ┌──────────────────────────────┐  │
│  │ 📄 My Custom Coach           │  │
│  │ 📄 Content Writer Agent      │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
        │
        ▼ (page selected)
┌────────────────────────────────────┐
│  Importing Agent Instructions...   │
│                                    │
│  Reading page content...           │
│  ████████░░░░░░░░ 50%              │
│  Extracting personality...         │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│  Review Imported Coach             │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🧭  The Essentialist        │  │
│  │  Productivity coach focused  │  │
│  │  on doing less, better.      │  │
│  └──────────────────────────────┘  │
│                                    │
│  Methodology: Essentialism,        │
│    80/20 Principle, Deep Work      │
│  Personality: Calm, focused,       │
│    encouraging but honest          │
│  Tone: Warm and direct             │
│                                    │
│  Instructions: (expandable)        │
│  ┌──────────────────────────────┐  │
│  │ You are The Essentialist, a  │  │
│  │ productivity coach that...   │  │
│  │ [Show Full Instructions]     │  │
│  └──────────────────────────────┘  │
│                                    │
│  Source: Notion (AgentOS)          │
│  🔄 Auto-update: [Toggle]         │
│                                    │
│  [Edit]  [Create Coach →]          │
└────────────────────────────────────┘
```

### 6.3 AgentOS Detection

CoachKit can detect AgentOS pages by looking for characteristic patterns in the content:

```typescript
/**
 * Detect if a Notion page looks like an AgentOS mode/instruction page.
 * Uses keyword matching on the page content.
 */
function detectAgentOSContent(content: string): {
  isAgentOS: boolean;
  confidence: 'high' | 'medium' | 'low';
  detectedMode: string | null;
} {
  const agentOSKeywords = [
    'agent mode', 'mode name', 'personality', 'tone of voice',
    'system instructions', 'specialisation', 'response style',
    'S(ai)mon', 'AgentOS', 'Better Creating',
    'mode switcher', 'sub-agent', 'agent instructions'
  ];

  const matches = agentOSKeywords.filter(kw =>
    content.toLowerCase().includes(kw.toLowerCase())
  );

  return {
    isAgentOS: matches.length >= 3,
    confidence: matches.length >= 5 ? 'high' : matches.length >= 3 ? 'medium' : 'low',
    detectedMode: extractModeName(content),
  };
}
```

### 6.4 AI Parsing (Coach Extraction)

```typescript
export async function parseNotionCoachInstructions(
  rawContent: string
): Promise<Partial<Coach>> {
  const prompt = `You are a coach profile parser for CoachKit.

The user has imported AI agent instructions from their Notion workspace
(likely from AgentOS by Better Creating, or a custom agent profile).

Extract a structured coach profile. Return ONLY valid JSON:

{
  "name": "string — the agent/coach name",
  "emoji": "string — single emoji representing this coach",
  "description": "string — 1-2 sentence summary",
  "methodology": "string — frameworks, methods, approaches used",
  "personality": "string — personality traits and behavioral style",
  "tone": "string — communication tone",
  "category": "string — one of: productivity, strategy, career, mindset, creativity, wellness, custom",
  "samplePrompts": ["3 example questions a user might ask this coach"],
  "systemPrompt": "string — cleaned coaching instructions adapted for mobile chat. Remove all Notion-specific references (databases, pages, workspace actions). Keep core methodology, personality, and coaching approach. Under 2000 chars."
}

Preserve the original agent's identity faithfully.
Adapt from workspace-tool to conversational-coach context.

Agent Instructions:
${rawContent.substring(0, 6000)}`;

  const response = await sendMessage(prompt, [], null);
  const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}
```

### 6.5 Coach Auto-Update from Notion

Imported coaches can optionally stay linked to their Notion source and auto-update:

```typescript
interface ImportedCoachLink {
  notionPageId: string;
  notionPageTitle: string;
  autoUpdate: boolean;
  lastImportedAt: string;
  lastNotionEditAt: string;
}

/**
 * Check if any imported coaches need updating from Notion.
 * Called during app foreground sync alongside context sync.
 */
export async function syncImportedCoaches(
  coaches: Coach[]
): Promise<Coach[]> {
  const importedCoaches = coaches.filter(
    c => c.source === 'notion_import' && c.notionLink?.autoUpdate
  );

  const updated: Coach[] = [];

  for (const coach of importedCoaches) {
    try {
      const pageInfo = await getPageInfo(coach.notionLink!.notionPageId);
      const pageEdited = new Date(pageInfo.last_edited_time).getTime();
      const lastImported = new Date(coach.notionLink!.lastImportedAt).getTime();

      if (pageEdited > lastImported) {
        const content = await readNotionPage(coach.notionLink!.notionPageId);
        const parsed = await parseNotionCoachInstructions(content);

        const updatedCoach: Coach = {
          ...coach,
          ...parsed,
          id: coach.id, // Preserve original ID
          notionLink: {
            ...coach.notionLink!,
            lastImportedAt: new Date().toISOString(),
            lastNotionEditAt: pageInfo.last_edited_time,
          },
        };

        await saveCustomCoach(updatedCoach);
        updated.push(updatedCoach);
      }
    } catch (error) {
      console.warn(`Failed to sync coach ${coach.id}:`, error);
    }
  }

  return updated;
}
```

### 6.6 Tier Gating

| Tier | Access |
|---|---|
| Free | Cannot import coaches |
| Pro | Paste-based import only (up to 3 custom coaches) |
| Creator | Full Notion OAuth import + auto-update + unlimited coaches |

---

## 7. F6: Coach Export to Notion

### 7.1 User Story

> As a CoachKit Creator, I want to export coaches I've built in CoachKit back to Notion as agent instruction pages, so I can use them in AgentOS or share them with my Notion workspace.

### 7.2 Export Implementation

```typescript
/**
 * Export a CoachKit coach as a Notion page formatted as agent instructions.
 * Compatible with AgentOS mode format for easy integration.
 */
export async function exportCoachToNotion(
  coach: Coach,
  destinationPageId: string
): Promise<{ pageId: string; pageUrl: string }> {
  const token = await getToken();

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { page_id: destinationPageId },
      icon: { type: 'emoji', emoji: coach.icon },
      properties: {
        title: [{ text: { content: `${coach.name} — CoachKit Agent` } }],
      },
      children: buildCoachExportBlocks(coach),
    }),
  });

  const data = await response.json();
  return { pageId: data.id, pageUrl: data.url };
}

/**
 * Build Notion blocks formatted as AgentOS-compatible agent instructions.
 */
function buildCoachExportBlocks(coach: Coach): any[] {
  const blocks: any[] = [];

  // Header
  blocks.push({
    object: 'block',
    type: 'callout',
    callout: {
      icon: { type: 'emoji', emoji: coach.icon },
      rich_text: [{
        type: 'text',
        text: { content: `${coach.name} — Exported from CoachKit` },
        annotations: { bold: true },
      }],
    },
  });

  // Description
  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: coach.description } }],
    },
  });

  blocks.push({ object: 'block', type: 'divider', divider: {} });

  // Mode Name
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: 'Mode Name' } }],
    },
  });
  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: coach.name } }],
    },
  });

  // Personality & Tone
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: 'Personality & Tone' } }],
    },
  });
  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: {
          content: `Personality: ${coach.personality || 'Not specified'}\nTone: ${coach.tone || 'Not specified'}`,
        },
      }],
    },
  });

  // Methodology
  if (coach.methodology) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Methodology & Frameworks' } }],
      },
    });
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: coach.methodology } }],
      },
    });
  }

  // System Instructions
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: 'Agent Instructions' } }],
    },
  });
  blocks.push({
    object: 'block',
    type: 'quote',
    quote: {
      rich_text: [{ type: 'text', text: { content: coach.systemPrompt } }],
    },
  });

  // Sample Prompts
  if (coach.samplePrompts?.length > 0) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Example Prompts' } }],
      },
    });
    for (const prompt of coach.samplePrompts) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: prompt } }],
        },
      });
    }
  }

  // Footer
  blocks.push({ object: 'block', type: 'divider', divider: {} });
  blocks.push({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: { content: 'Exported from CoachKit — AI Coaching powered by your context.' },
        annotations: { italic: true, color: 'gray' },
      }],
    },
  });

  return blocks;
}
```

### 7.3 Export Flow

```
Coach Detail Screen (custom coach)
        │
        ▼
  [⋮ More Options]
        │
        ├── Share Coach (link)
        ├── Export to Notion ← NEW
        └── Delete Coach
        │
        ▼ (Export to Notion tapped)
┌────────────────────────────────────┐
│  Export to Notion                   │
│                                    │
│  This will create a new page in    │
│  your Notion workspace with this   │
│  coach's instructions formatted    │
│  for AgentOS compatibility.        │
│                                    │
│  Destination:                      │
│  📄 My Agents (page)              │
│  [Change]                          │
│                                    │
│  [Export Coach →]                   │
└────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────┐
│  ✅ Exported!                      │
│                                    │
│  "The Essentialist" is now in      │
│  your Notion workspace.            │
│                                    │
│  [Open in Notion]  [Done]          │
└────────────────────────────────────┘
```

### 7.4 Tier Gating

| Tier | Access |
|---|---|
| Free | No export |
| Pro | No export |
| Creator | Full export to Notion |

---

## 8. F7: AgentOS Marketplace Bridge

### 8.1 User Story

> As a CoachKit Creator, I want to publish my coaches to a shared library where other users can discover and import them, creating a community-driven coaching ecosystem that mirrors how AgentOS modes can be shared.

### 8.2 Architecture

Since a full backend is complex, implement this as a **Notion-powered marketplace:**

```
┌──────────────────────────────────────┐
│        CoachKit Marketplace          │
│          (Notion Database)           │
│                                      │
│  A shared Notion database managed    │
│  by the CoachKit integration that    │
│  stores published coach profiles.    │
│                                      │
│  Properties:                         │
│  - Name (title)                      │
│  - Description (text)                │
│  - Category (select)                 │
│  - Icon (text/emoji)                 │
│  - SystemPrompt (text)               │
│  - Methodology (text)                │
│  - Personality (text)                │
│  - Tone (text)                       │
│  - AuthorName (text)                 │
│  - Downloads (number)                │
│  - Rating (number)                   │
│  - PublishedAt (date)                │
│  - Status (select: published/review) │
│  - SamplePrompts (text)              │
│  - Tags (multi_select)               │
└──────────────────────────────────────┘
         │                    ▲
    Read (browse)      Write (publish)
         │                    │
         ▼                    │
┌────────────────┐  ┌────────────────┐
│  Any CoachKit  │  │  Creator Tier  │
│  User (Free+)  │  │  Users Only    │
│  can browse &  │  │  can publish   │
│  import        │  │  coaches       │
└────────────────┘  └────────────────┘
```

### 8.3 Implementation — Notion as Backend

Use a dedicated Notion database as the marketplace backend. The CoachKit integration has its own access to this database (separate from user OAuth).

```typescript
// === services/marketplace.ts ===

// This uses the CoachKit integration's own token (not user's)
// to access the shared marketplace database
const MARKETPLACE_TOKEN = 'ntn_COACHKIT_INTEGRATION_TOKEN';
const MARKETPLACE_DB_ID = 'SHARED_MARKETPLACE_DATABASE_ID';

interface MarketplaceCoach {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  methodology: string;
  personality: string;
  tone: string;
  systemPrompt: string;
  samplePrompts: string[];
  authorName: string;
  downloads: number;
  rating: number;
  publishedAt: string;
  tags: string[];
}

/**
 * Browse marketplace coaches with optional filtering.
 */
export async function browseMarketplace(options?: {
  category?: string;
  tags?: string[];
  sortBy?: 'downloads' | 'rating' | 'recent';
  limit?: number;
}): Promise<MarketplaceCoach[]> {
  const filter: any = {
    and: [
      { property: 'Status', select: { equals: 'published' } },
    ],
  };

  if (options?.category) {
    filter.and.push({
      property: 'Category',
      select: { equals: options.category },
    });
  }

  if (options?.tags?.length) {
    for (const tag of options.tags) {
      filter.and.push({
        property: 'Tags',
        multi_select: { contains: tag },
      });
    }
  }

  const sorts: any[] = [];
  switch (options?.sortBy) {
    case 'downloads':
      sorts.push({ property: 'Downloads', direction: 'descending' });
      break;
    case 'rating':
      sorts.push({ property: 'Rating', direction: 'descending' });
      break;
    case 'recent':
    default:
      sorts.push({ property: 'PublishedAt', direction: 'descending' });
  }

  const response = await fetch(
    `https://api.notion.com/v1/databases/${MARKETPLACE_DB_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MARKETPLACE_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter,
        sorts,
        page_size: options?.limit || 20,
      }),
    }
  );

  const data = await response.json();
  return data.results.map(pageToMarketplaceCoach);
}

/**
 * Publish a coach to the marketplace.
 * Creates a new page in the shared Notion database.
 */
export async function publishCoach(
  coach: Coach,
  authorName: string
): Promise<{ success: boolean; marketplaceId: string }> {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MARKETPLACE_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: MARKETPLACE_DB_ID },
      properties: {
        'Name': { title: [{ text: { content: coach.name } }] },
        'Description': { rich_text: [{ text: { content: coach.description } }] },
        'Category': { select: { name: coach.category } },
        'Icon': { rich_text: [{ text: { content: coach.icon } }] },
        'SystemPrompt': { rich_text: [{ text: { content: coach.systemPrompt.substring(0, 2000) } }] },
        'Methodology': { rich_text: [{ text: { content: coach.methodology || '' } }] },
        'Personality': { rich_text: [{ text: { content: coach.personality || '' } }] },
        'Tone': { rich_text: [{ text: { content: coach.tone || '' } }] },
        'AuthorName': { rich_text: [{ text: { content: authorName } }] },
        'Downloads': { number: 0 },
        'Rating': { number: 0 },
        'PublishedAt': { date: { start: new Date().toISOString() } },
        'Status': { select: { name: 'published' } },
        'SamplePrompts': {
          rich_text: [{
            text: { content: JSON.stringify(coach.samplePrompts || []) },
          }],
        },
        'Tags': {
          multi_select: (coach.tags || []).map(t => ({ name: t })),
        },
      },
    }),
  });

  const data = await response.json();
  return { success: !data.object?.includes('error'), marketplaceId: data.id };
}

/**
 * Import a coach from the marketplace into local storage.
 */
export async function importFromMarketplace(
  marketplaceCoach: MarketplaceCoach
): Promise<Coach> {
  const newCoach: Coach = {
    id: `marketplace_${Date.now()}`,
    name: marketplaceCoach.name,
    icon: marketplaceCoach.icon,
    description: marketplaceCoach.description,
    color: getCategoryColor(marketplaceCoach.category),
    category: marketplaceCoach.category,
    systemPrompt: marketplaceCoach.systemPrompt,
    tagline: marketplaceCoach.description.split('.')[0],
    samplePrompts: marketplaceCoach.samplePrompts,
    methodology: marketplaceCoach.methodology,
    personality: marketplaceCoach.personality,
    tone: marketplaceCoach.tone,
    source: 'marketplace',
    marketplaceId: marketplaceCoach.id,
    importedAt: new Date().toISOString(),
  };

  await saveCustomCoach(newCoach);

  // Increment download counter
  await incrementDownloadCount(marketplaceCoach.id);

  return newCoach;
}

async function incrementDownloadCount(pageId: string): Promise<void> {
  // Read current count, increment, update
  const page = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      'Authorization': `Bearer ${MARKETPLACE_TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
  }).then(r => r.json());

  const currentDownloads = page.properties?.Downloads?.number || 0;

  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${MARKETPLACE_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        'Downloads': { number: currentDownloads + 1 },
      },
    }),
  });
}
```

### 8.4 Marketplace UI Flow

```
Library Tab → "Community" Section (or separate tab)
        │
        ▼
┌────────────────────────────────────┐
│  Coach Marketplace 🌍              │
│                                    │
│  Category Filter Pills:            │
│  [All] [Productivity] [Strategy]   │
│  [Career] [Mindset] [Creativity]   │
│                                    │
│  Sort: [Popular ▼]                 │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 🧭 The Essentialist          │  │
│  │ Productivity coach focused   │  │
│  │ on essentialism & deep work  │  │
│  │ By: SimonBC  ⬇ 234  ⭐ 4.8  │  │
│  │ [Preview]  [+ Add]           │  │
│  ├──────────────────────────────┤  │
│  │ 🎯 The Goal Architect        │  │
│  │ Vision & goal-setting coach  │  │
│  │ with quarterly planning      │  │
│  │ By: Sarah K  ⬇ 189  ⭐ 4.6  │  │
│  │ [Preview]  [+ Add]           │  │
│  ├──────────────────────────────┤  │
│  │ 💡 The Decision Maker        │  │
│  │ Framework-driven decision    │  │
│  │ coaching with 10 models      │  │
│  │ By: Alex M  ⬇ 156  ⭐ 4.7   │  │
│  │ [Preview]  [+ Add]           │  │
│  └──────────────────────────────┘  │
│                                    │
│  ── Creator Tier ──                │
│  [Publish Your Coach →]            │
└────────────────────────────────────┘
```

### 8.5 Tier Gating

| Tier | Access |
|---|---|
| Free | Browse marketplace, import up to 2 community coaches |
| Pro | Browse + import unlimited community coaches |
| Creator | Browse + import + publish coaches to marketplace |

---

## 9. Updated Type Definitions

### 9.1 UserContext (Extended)

```typescript
interface UserContext {
  // Core fields
  name: string;
  currentFocus: string;
  biggestGoal: string;
  coachingStyle: 'gentle' | 'balanced' | 'direct';
  userType: 'seeker' | 'builder' | 'both';
  onboardingComplete: boolean;

  // Imported context fields
  values?: string;
  strengths?: string;
  struggles?: string;
  role?: string;
  additionalContext?: string;

  // Notion connection metadata
  importedFromNotion?: boolean;
  notionSourcePageId?: string | null;
  notionSourcePageTitle?: string | null;
  notionLastSyncAt?: string | null;
  notionAutoSync?: boolean;
}
```

### 9.2 Coach (Extended)

```typescript
interface Coach {
  // Core fields
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  category: string;
  systemPrompt: string;
  tagline: string;
  samplePrompts: string[];

  // Agent-level fields
  methodology?: string;
  personality?: string;
  tone?: string;
  tags?: string[];

  // Source tracking
  source?: 'built_in' | 'custom' | 'notion_import' | 'marketplace';
  rawImport?: string;
  importedAt?: string;

  // Notion link (for auto-update)
  notionLink?: {
    notionPageId: string;
    notionPageTitle: string;
    autoUpdate: boolean;
    lastImportedAt: string;
    lastNotionEditAt: string;
  };

  // Marketplace metadata
  marketplaceId?: string;
  authorName?: string;
  downloads?: number;
  rating?: number;
}
```

### 9.3 NotionExportSettings

```typescript
interface NotionExportSettings {
  autoExport: boolean;
  destinationId: string | null;
  destinationType: 'database' | 'page' | null;
  destinationName: string | null;
  exportOnSessionEnd: boolean;
  minimumMessages: number;
}
```

### 9.4 SessionSummary

```typescript
interface SessionSummary {
  id: string;
  sessionId: string;
  coachId: string;
  title: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  frameworks: string[];
  tags: string[];
  followUp: string;
  createdAt: string;
  exportedToNotion?: boolean;
  notionPageId?: string;
  notionPageUrl?: string;
}
```

---

## 10. New Files Summary

| File | Purpose |
|---|---|
| `services/notion.ts` | OAuth, page reading, database querying, export, sync engine |
| `services/marketplace.ts` | Browse, publish, import community coaches |
| `hooks/useNotion.ts` | Notion connection state, page search, source selection |
| `hooks/useNotionSync.ts` | Auto-sync on foreground, manual sync trigger |
| `hooks/useMarketplace.ts` | Browse, filter, import marketplace coaches |
| `components/NotionConnectCard.tsx` | OAuth connection card for profile/settings |
| `components/NotionPagePicker.tsx` | Page/database browser with search |
| `components/NotionImportButton.tsx` | Reusable import trigger button |
| `components/NotionPasteModal.tsx` | Paste-based fallback import modal |
| `components/ParsedContextReview.tsx` | Editable review of parsed user context |
| `components/ParsedCoachReview.tsx` | Editable review of parsed coach profile |
| `components/MarketplaceCard.tsx` | Coach card for marketplace browsing |
| `components/MarketplaceGrid.tsx` | Grid/list layout for marketplace |
| `components/SessionSummaryCard.tsx` | Post-session summary with export CTA |
| `components/ExportSuccessModal.tsx` | Confirmation after Notion export |
| `app/marketplace/index.tsx` | Marketplace browse screen |
| `app/marketplace/[id].tsx` | Marketplace coach detail/preview |

---

## 11. Tier Summary (All Notion Features)

| Feature | Free | Pro ($4.99/mo) | Creator ($9.99/mo) |
|---|---|---|---|
| Paste-based context import | ✅ | ✅ | ✅ |
| Notion OAuth connect | ❌ | ✅ | ✅ |
| Auto-sync context | ❌ | ✅ | ✅ |
| Export sessions to Notion | ❌ | Manual only | Manual + Auto |
| Paste-based coach import | ❌ | ✅ (up to 3) | ✅ (unlimited) |
| Notion OAuth coach import | ❌ | ❌ | ✅ |
| Coach auto-update from Notion | ❌ | ❌ | ✅ |
| Export coach to Notion | ❌ | ❌ | ✅ |
| Marketplace browse | ✅ | ✅ | ✅ |
| Marketplace import | Up to 2 | Unlimited | Unlimited |
| Marketplace publish | ❌ | ❌ | ✅ |

---

## 12. Demo Video Script (Notion Integration Segment)

**~45 seconds of the 3-minute demo dedicated to Notion integration:**

> "CoachKit is built for Simon's ecosystem. Watch this —"
>
> [Show Notion connect tap → OAuth → workspace connected]
>
> "One tap and your Notion workspace is connected. CoachKit pulls your goals, values, and personal context directly from your Life OS or AgentOS profile."
>
> [Show coaches personalized with imported context]
>
> "Every coach now knows who you are from the first message. No setup, no repetition."
>
> [Show AgentOS mode being imported as a coach]
>
> "Already built custom agents in AgentOS? Import them. Your Essentialist Coach, your Decision Coach — they're all here, ready to go."
>
> [Show session summary → Export to Notion]
>
> "And when your session ends, insights and action items flow right back to Notion. Your coaching life and your productivity life, fully connected."
>
> [Show marketplace briefly]
>
> "Plus a community marketplace where creators can share and discover coaches."

---

## 13. Written Proposal Excerpt

> **Deep Notion Ecosystem Integration**
>
> CoachKit is purpose-built as the mobile coaching companion for Simon's BetterCreating community. We recognize that his audience lives in Notion — their goals, values, habits, and custom AgentOS agents all exist there.
>
> CoachKit features full Notion OAuth integration. Users connect their workspace with one tap and CoachKit immediately pulls their personal context — goals, values, strengths, and struggles — directly from their Notion pages. This eliminates the cold-start problem entirely. Every coaching session is personalized from the first message, because CoachKit already knows who you are.
>
> For AgentOS users, CoachKit goes further. Custom agent modes can be imported directly from Notion as fully-configured coaches, preserving personality, methodology, and tone. These coaches can auto-update when the source instructions change in Notion, keeping both systems in sync.
>
> Session insights flow back to Notion automatically. After each coaching session, CoachKit generates structured summaries with key insights, action items, and framework references — all exported as beautifully formatted Notion pages with to-do checkboxes that integrate naturally into existing Life OS workflows.
>
> A community marketplace powered by a shared Notion database allows Creator-tier users to publish coaches for others to discover, creating a growing ecosystem of specialist coaching agents — the mobile equivalent of AgentOS modes that the community can build together.
>
> CoachKit doesn't replace Notion — it extends it into a focused, beautiful mobile coaching experience that Simon's audience has been waiting for.
