import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 🔥 GLOBAL WALLET STATE: Track current verified userId to block stale queries
// This is set by WalletContext and checked by ALL user queries
let currentVerifiedUserId: number | null = null;

export function setVerifiedUserId(userId: number | null) {
  console.log(`[QUERY-CLIENT] Setting verified userId: ${userId}`);
  currentVerifiedUserId = userId;
}

export function getVerifiedUserId(): number | null {
  return currentVerifiedUserId;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: RequestInit
): Promise<Response> {
  const fetchOptions: RequestInit = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    ...options // Merge additional options like signal for AbortController
  };

  const res = await fetch(url, fetchOptions);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // 🔥 GLOBAL QUERY GATE: Block all /api/users/ queries when no verified userId
    // This prevents components from fetching stale user data during wallet switches
    if (url.includes('/api/users/')) {
      if (currentVerifiedUserId === null) {
        console.log(`[QUERY-CLIENT] ⛔ Blocking query ${url} - no verified userId`);
        // Return promise that never resolves - keeps query in loading state
        return new Promise(() => {});
      }
      console.log(`[QUERY-CLIENT] ✅ Allowing query ${url} - verified userId: ${currentVerifiedUserId}`);
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
