import { env } from "@/lib/env";

const BROCHURE_FETCH_TIMEOUT_MS = 10_000;
const BROCHURE_MAX_BYTES = 20 * 1024 * 1024;
const BROCHURE_ALLOWED_CONTENT_TYPES = new Set(["application/pdf", "application/x-pdf"]);

export class BrochureError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BrochureError";
    this.status = status;
  }
}

const parseContentLength = (value: string | null) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const isAllowedBrochureContentType = (contentType: string | null) => {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.split(";")[0]?.trim().toLowerCase();
  return normalized ? BROCHURE_ALLOWED_CONTENT_TYPES.has(normalized) : false;
};

const readResponseBuffer = async (response: Response) => {
  if (!response.body) {
    throw new BrochureError("Unable to load brochure.", 502);
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (!value?.byteLength) {
        continue;
      }

      totalBytes += value.byteLength;

      if (totalBytes > BROCHURE_MAX_BYTES) {
        await reader.cancel();
        throw new BrochureError("Brochure file is too large.", 413);
      }

      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    if (error instanceof BrochureError) {
      throw error;
    }

    throw new BrochureError("Unable to load brochure.", 502);
  }

  return Buffer.concat(chunks);
};

export function resolveBrochureTarget(brochureUrl: string) {
  let targetUrl: URL;

  try {
    targetUrl = new URL(brochureUrl);
  } catch {
    throw new BrochureError("Unsupported brochure origin.", 403);
  }

  const allowedOrigin = new URL(env.mediaPublicBaseUrl).origin;

  if (targetUrl.origin !== allowedOrigin) {
    throw new BrochureError("Unsupported brochure origin.", 403);
  }

  return targetUrl;
}

export async function fetchBrochureBuffer(brochureUrl: string) {
  const targetUrl = resolveBrochureTarget(brochureUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BROCHURE_FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        accept: "application/pdf",
      },
      cache: "force-cache",
      signal: controller.signal,
    });

    if (!upstream.ok) {
      throw new BrochureError("Unable to load brochure.", 502);
    }

    if (!isAllowedBrochureContentType(upstream.headers.get("content-type"))) {
      throw new BrochureError("Unsupported brochure content type.", 502);
    }

    const contentLength = parseContentLength(upstream.headers.get("content-length"));

    if (!contentLength) {
      throw new BrochureError("Brochure size is unavailable.", 502);
    }

    if (contentLength > BROCHURE_MAX_BYTES) {
      throw new BrochureError("Brochure file is too large.", 413);
    }

    const buffer = await readResponseBuffer(upstream);

    return {
      buffer,
      contentLength: buffer.byteLength,
      contentType: upstream.headers.get("content-type") ?? "application/pdf",
    };
  } catch (error) {
    if (error instanceof BrochureError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new BrochureError("Brochure request timed out.", 504);
    }

    throw new BrochureError("Unable to load brochure.", 502);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const getBrochureErrorResponse = (error: unknown, fallbackStatus: number) => {
  if (error instanceof BrochureError) {
    return {
      message: error.message,
      status: error.status,
    };
  }

  return {
    message: "Unable to load brochure.",
    status: fallbackStatus,
  };
};

export const brochureSecurity = {
  fetchTimeoutMs: BROCHURE_FETCH_TIMEOUT_MS,
  maxBytes: BROCHURE_MAX_BYTES,
};
