import { fetchBrochureBuffer, getBrochureErrorResponse } from "@/lib/brochure";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const brochureUrl = requestUrl.searchParams.get("url");

  if (!brochureUrl) {
    return Response.json({ error: "Missing brochure URL." }, { status: 400 });
  }

  try {
    const brochure = await fetchBrochureBuffer(brochureUrl);

    const headers = new Headers({
      "Content-Type": brochure.contentType,
    });
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    headers.set("Content-Length", String(brochure.contentLength));

    return new Response(brochure.buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    const { message, status } = getBrochureErrorResponse(error, 502);

    return Response.json({ error: message }, { status });
  }
}
