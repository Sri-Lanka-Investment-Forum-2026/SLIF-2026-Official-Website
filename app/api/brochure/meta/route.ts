import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fetchBrochureBuffer } from "@/lib/brochure";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

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

    const { stdout } = await execFileAsync("pdfinfo", [pdfPath]);
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
    const message =
      error instanceof Error ? error.message : "Unable to inspect brochure.";
    const status =
      message === "Unsupported brochure origin."
        ? 403
        : message === "Unable to load brochure."
          ? 502
          : 500;

    return Response.json({ error: message }, { status });
  } finally {
    if (tempDir) {
      await rm(tempDir, { force: true, recursive: true });
    }
  }
}
