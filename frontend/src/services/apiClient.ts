const LOCAL_API_BASE_URL = 'http://localhost:3001';
const PROD_FALLBACK_API_BASE_URL = 'https://dechico-backend-772774227494.us-central1.run.app';

const getApiBaseUrl = () => {
  if (import.meta?.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta?.env?.DEV) {
    return LOCAL_API_BASE_URL;
  }
  return PROD_FALLBACK_API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();

type ApiHeaders = Record<string, string>;

export type ApiFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: ApiHeaders;
};

export const apiFetch = async <TResponse = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> => {
  const url = `${API_BASE_URL}${path}`;
  const { headers: customHeaders, ...restOptions } = options;
  const headers: ApiHeaders = {
    'Content-Type': 'application/json',
    ...(customHeaders ?? {}),
  };

  const response = await fetch(url, {
    ...restOptions,
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

export const withAuthHeaders = (uid?: string, email?: string): ApiHeaders => {
  if (!uid || !email) {
    throw new Error('Missing UID or email for authenticated request.');
  }

  return {
    'x-user-id': uid,
    'x-user-email': email,
  };
};

