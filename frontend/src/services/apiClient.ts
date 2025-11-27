const DEFAULT_API_BASE_URL = 'http://localhost:3001';

const getApiBaseUrl = () => {
  if (import.meta?.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();

export type ApiFetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export const apiFetch = async <TResponse = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> => {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    // ignore JSON parse errors for non-JSON responses
  }

  if (!response.ok) {
    const message = payload?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as TResponse;
};

export const withAuthHeaders = (uid?: string, email?: string) => {
  if (!uid || !email) {
    throw new Error('Missing UID or email for authenticated request.');
  }

  return {
    'x-user-id': uid,
    'x-user-email': email,
  };
};

