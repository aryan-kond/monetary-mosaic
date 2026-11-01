/** The backend is reached through the same address as the app, so its cookies stay same-site. */
const API_BASE = '/api';

/** A failure the server explained, in a shape every screen can show. */
export interface ApiFailure {
  code: string;
  message: string;
  /** Problems with specific fields, such as { email: "..." }. */
  fields?: Record<string, string>;
  retryAfterSeconds?: number;
}

export class ApiError extends Error {
  /** The HTTP status, or 0 when the server could not be reached. */
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;
  readonly retryAfterSeconds?: number;

  constructor(status: number, failure: ApiFailure) {
    super(failure.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = failure.code;
    this.fields = failure.fields ?? {};
    this.retryAfterSeconds = failure.retryAfterSeconds;
  }
}

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((item) => typeof item === 'string');

/** Reads the error shape from docs/api-auth.md: { error: { code, message, fields?, retryAfterSeconds? } }. */
function readFailure(data: unknown): ApiFailure | null {
  if (typeof data !== 'object' || data === null || !('error' in data)) return null;
  const error = (data as { error: unknown }).error;
  if (typeof error !== 'object' || error === null) return null;

  const { code, message, fields, retryAfterSeconds } = error as Record<string, unknown>;
  if (typeof code !== 'string' || typeof message !== 'string') return null;

  return {
    code,
    message,
    fields: isStringRecord(fields) ? fields : undefined,
    retryAfterSeconds: typeof retryAfterSeconds === 'number' ? retryAfterSeconds : undefined,
  };
}

/** When the server gave no usable explanation, say something honest based on the status. */
function fallbackFailure(status: number, retryAfterHeader: string | null): ApiFailure {
  if (status === 401) return { code: 'unauthorized', message: 'You need to sign in.' };
  if (status === 429) {
    const seconds = Number(retryAfterHeader);
    return {
      code: 'too_many_attempts',
      message: 'Too many attempts. Please wait a moment and try again.',
      retryAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : undefined,
    };
  }
  if (status >= 500) {
    return {
      code: 'server',
      message: 'Something went wrong on our side. Please try again in a moment.',
    };
  }
  return { code: 'request_failed', message: 'The request could not be completed.' };
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
}

/**
 * Talks to the backend. Cookies are sent and received by the browser, so the app never sees or
 * stores a session token. Throws an ApiError for anything that is not a success.
 */
export async function request<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        // A custom header a cross-site form cannot send. The backend checks for it.
        'X-Requested-With': 'monetary-mosaic',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, {
      code: 'network',
      message: "We couldn't reach the server. Check your connection and try again.",
    });
  }

  if (response.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // The body was empty or not JSON. The status still tells us what happened.
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      readFailure(data) ?? fallbackFailure(response.status, response.headers.get('Retry-After')),
    );
  }
  return data as T;
}
