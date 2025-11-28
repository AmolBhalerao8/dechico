const LOCAL_API_BASE_URL = 'http://localhost:3001';

const resolveApiBaseUrl = () => {
  const envValue = import.meta?.env?.VITE_API_BASE_URL?.trim();
  if (envValue) {
    return envValue;
  }

  const message =
    'VITE_API_BASE_URL is not defined. Configure it in your environment variables (Vercel dashboard for production, `.env` locally).';

  if (import.meta?.env?.DEV) {
    console.warn(`${message} Falling back to ${LOCAL_API_BASE_URL} for local development.`);
    return LOCAL_API_BASE_URL;
  }

  throw new Error(message);
};

export const API_BASE_URL = resolveApiBaseUrl();

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

