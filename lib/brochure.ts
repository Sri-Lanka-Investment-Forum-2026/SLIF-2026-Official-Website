import { env } from "@/lib/env";

export function resolveBrochureTarget(brochureUrl: string) {
  const targetUrl = new URL(brochureUrl);
  const allowedOrigin = new URL(env.mediaPublicBaseUrl).origin;

  if (targetUrl.origin !== allowedOrigin) {
    throw new Error("Unsupported brochure origin.");
  }

  return targetUrl;
}

export async function fetchBrochureResponse(brochureUrl: string) {
  const targetUrl = resolveBrochureTarget(brochureUrl);

  const upstream = await fetch(targetUrl, {
    headers: {
      accept: "application/pdf,*/*",
    },
    cache: "force-cache",
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error("Unable to load brochure.");
  }

  return upstream;
}

export async function fetchBrochureBuffer(brochureUrl: string) {
  const upstream = await fetchBrochureResponse(brochureUrl);
  const arrayBuffer = await upstream.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: upstream.headers.get("content-type") ?? "application/pdf",
  };
}
