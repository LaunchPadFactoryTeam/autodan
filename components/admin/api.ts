'use client';

/** Small fetch wrapper: every backoffice call carries the secret link's token. */
export function makeApi(token: string) {
  async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
    const isForm = body instanceof FormData;
    const res = await fetch(url, {
      method,
      headers: { 'x-admin-token': token, ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}) },
      body: body == null ? undefined : isForm ? body : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
    return data as T;
  }
  return {
    get: <T,>(url: string) => call<T>('GET', url),
    post: <T,>(url: string, body?: unknown) => call<T>('POST', url, body),
    patch: <T,>(url: string, body?: unknown) => call<T>('PATCH', url, body),
    del: <T,>(url: string) => call<T>('DELETE', url),
  };
}

export type Api = ReturnType<typeof makeApi>;
