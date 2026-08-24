import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isConfigured =
  url.startsWith("http://") || url.startsWith("https://");

if (!isConfigured && typeof window === "undefined") {
  console.warn(
    "[zing] Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable DB features."
  );
}

function maybeCreateClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  return createClient(url, key);
}

const _client = maybeCreateClient();

/**
 * Supabase client proxy.
 * When Supabase is not configured, all DB and auth calls return safe empty values
 * so the app never crashes when env vars are missing.
 */
export const supabase = _client ?? createNoOpClient();

function createNoOpClient() {
  const noOpPromise = () => Promise.resolve({ data: null, error: { message: "Supabase not configured — set env vars" }, count: null });
  const noOpChain: any = {
    select: () => noOpChain,
    order: () => noOpChain,
    limit: () => noOpPromise(),
    eq: () => noOpChain,
    single: () => noOpPromise(),
    insert: () => noOpPromise(),
    upsert: () => noOpPromise(),
    update: () => noOpChain,
  };

  const noOp: any = {
    from: () => noOpChain,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: null }),
    },
  };

  return noOp as unknown as SupabaseClient;
}
