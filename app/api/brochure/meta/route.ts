import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fetchBrochureBuffer, getBrochureErrorResponse } from "@/lib/brochure";

const execFileAsync = promisify(execFile);
const PDF_INFO_TIMEOUT_MS = 10_000;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePageCount(pdfInfoOutput: string) {
  const match = pdfInfoOutput.match(/^Pages:\s+(\d+)/m);
  return match ? Number.parseInt(match[1] ?? "1", 10) : 1;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const brochureUrl = requestUrl.searchParams.get("url");

  if (!brochureUrl) {
    return Response.json({ error: "Missing brochure URL." }, { status: 400 });
  }

  let tempDir = "";

  try {
    const { buffer } = await fetchBrochureBuffer(brochureUrl);

    tempDir = await mkdtemp(join(tmpdir(), "slif-brochure-meta-"));
    const pdfPath = join(tempDir, "brochure.pdf");
    await writeFile(pdfPath, buffer);

    const { stdout } = await execFileAsync("pdfinfo", [pdfPath], {
      timeout: PDF_INFO_TIMEOUT_MS,
    });
    const pages = parsePageCount(stdout);

    return Response.json(
      { pages: Math.max(1, Math.min(2, pages)) },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      },
    );
  } catch (error) {
    const { message, status } = getBrochureErrorResponse(error, 500);

    return Response.json({ error: message }, { status });
  } finally {
    if (tempDir) {
      await rm(tempDir, { force: true, recursive: true });
    }
  }
}
