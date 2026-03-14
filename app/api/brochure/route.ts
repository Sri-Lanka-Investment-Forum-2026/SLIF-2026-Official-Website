import { fetchBrochureResponse } from "@/lib/brochure";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const brochureUrl = requestUrl.searchParams.get("url");

  if (!brochureUrl) {
    return Response.json({ error: "Missing brochure URL." }, { status: 400 });
  }

  try {
    const upstream = await fetchBrochureResponse(brochureUrl);

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/pdf",
    );
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load brochure.";
    const status =
      message === "Unsupported brochure origin."
        ? 403
        : message === "Unable to load brochure."
          ? 502
          : 400;

    return Response.json({ error: message }, { status });
  }
}
