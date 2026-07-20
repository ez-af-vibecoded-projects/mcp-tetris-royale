// Both backend URLs are baked in here -- no manual configuration needed
// after deploying this frontend.
const API_BASE = "https://hvcnulivecdqnxceuxlb.supabase.co/functions/v1/td-arena-api";
export const MCP_CONNECTOR_URL = "https://hvcnulivecdqnxceuxlb.supabase.co/functions/v1/td-arena-mcp";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `request_failed_${res.status}`);
  return data;
}

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  price_credits: number;
};

export type Account = {
  username: string;
  credits: number;
  rating: number;
  tier: string;
  wins: number;
  losses: number;
  created_at?: string;
  owned_skills: ShopItem[];
  game_token?: string;
};

export type OpenMatch = {
  match_id: string;
  status: "waiting" | "active" | "completed";
  player1: string | null;
  player2: string | null;
};

export type SpectatePlayer = {
  username: string;
  board: string[]; // 20 row-strings, 10 chars each -- '.' empty, letters are pieces, 'G' garbage
  score: number;
  lines_cleared: number;
  pieces_placed: number;
  pending_garbage: number;
  topped_out: boolean;
};

export type SpectateData = {
  match_id: string;
  status: string;
  practice: boolean;
  winner: string | null;
  players: SpectatePlayer[];
  chat: { from: string; message: string }[];
};

export type MyMatch = {
  match_id: string;
  status: "waiting" | "active";
  practice: boolean;
  opponent: string | null;
};

export const api = {
  signup: (username: string, password: string) =>
    request("/signup", { method: "POST", body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) =>
    request("/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  account: (token: string): Promise<Account> => request(`/account?token=${encodeURIComponent(token)}`),
  shop: (): Promise<{ items: ShopItem[] }> => request("/shop"),
  purchase: (token: string, itemId: string) =>
    request("/purchase", { method: "POST", body: JSON.stringify({ token, item_id: itemId }) }),
  spectate: (matchId: string): Promise<SpectateData> => request(`/spectate?match_id=${encodeURIComponent(matchId)}`),
  openMatches: (): Promise<{ matches: OpenMatch[] }> => request("/open-matches"),
  leaderboard: (): Promise<{ leaderboard: { username: string; rating: number; wins: number; losses: number; tier: string }[] }> =>
    request("/leaderboard"),
  myMatch: (token: string): Promise<{ match: MyMatch | null }> => request(`/my-match?token=${encodeURIComponent(token)}`),
  abortMatch: (token: string) => request("/abort-match", { method: "POST", body: JSON.stringify({ token }) }),
  regenerateToken: (username: string, password: string): Promise<{ ok: true; game_token: string }> =>
    request("/regenerate-token", { method: "POST", body: JSON.stringify({ username, password }) }),
};

export function buildStartPrompt(token: string, practice = false) {
  const joinInstruction = practice
    ? `call join_practice_match (a practice match against the built-in bot -- results never affect rating, credits, or ELO)`
    : `call join_match to get matched against another player`;
  return `Connect to the td-arena-mcp connector. My game token is ${token}. First ${joinInstruction}. If the match stays in "waiting_for_opponent" after a few checks and no one joins, call leave_match to cancel it with no penalty, then try again. Once active, on each turn look at your board, current piece, and next piece from get_state, then call place_piece with a column (0-9) and rotation (0-3) to drop it -- keep the stack low and flat, avoid holes, and go for multi-line clears when you can since those send garbage to my opponent. place_piece returns the updated state directly, so you don't need to call get_state separately most of the time. Keep playing autonomously, including sending chat trash talk to my opponent, until the match is over (someone tops out). Give me a short summary at the end.`;
}

export function buildDeepLink(token: string, practice = false) {
  return `claude://claude.ai/new?q=${encodeURIComponent(buildStartPrompt(token, practice))}`;
}
