import fetch from "node-fetch";

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  allowNotFound?: boolean;
}

/**
 * HTTP request wrapper with status checking
 */
export async function request(
  url: string,
  options: RequestOptions = {}
): Promise<{ status: number; body: string; headers: Record<string, string> }> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = 30000,
    allowNotFound = false,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    if (allowNotFound && response.status === 404) {
      return {
        status: 404,
        body: responseBody,
        headers: responseHeaders,
      };
    }

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${responseBody}`
      );
    }

    return {
      status: response.status,
      body: responseBody,
      headers: responseHeaders,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
