import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fetchBrochureBuffer, getBrochureErrorResponse } from "@/lib/brochure";

const execFileAsync = promisify(execFile);
const PDF_RENDER_TIMEOUT_MS = 15_000;
const MIN_RENDER_PAGE = 1;
const MAX_RENDER_PAGE = 2;
const DEFAULT_RENDER_WIDTH = 1400;
const MAX_RENDER_WIDTH = 1600;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseBoundedInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const brochureUrl = requestUrl.searchParams.get("url");
  const page = parseBoundedInteger(
    requestUrl.searchParams.get("page"),
    MIN_RENDER_PAGE,
    MIN_RENDER_PAGE,
    MAX_RENDER_PAGE,
  );
  const width = parseBoundedInteger(
    requestUrl.searchParams.get("width"),
    DEFAULT_RENDER_WIDTH,
    400,
    MAX_RENDER_WIDTH,
  );

  if (!brochureUrl) {
    return Response.json({ error: "Missing brochure URL." }, { status: 400 });
  }

  let tempDir = "";

  try {
    const { buffer } = await fetchBrochureBuffer(brochureUrl);

    tempDir = await mkdtemp(join(tmpdir(), "slif-brochure-page-"));
    const pdfPath = join(tempDir, "brochure.pdf");
    const imagePrefix = join(tempDir, "page");
    const imagePath = `${imagePrefix}.png`;

    await writeFile(pdfPath, buffer);

    await execFileAsync("pdftoppm", [
      "-png",
      "-singlefile",
      "-f",
      String(page),
      "-l",
      String(page),
      "-scale-to",
      String(width),
      pdfPath,
      imagePrefix,
    ], {
      timeout: PDF_RENDER_TIMEOUT_MS,
    });

    const image = await readFile(imagePath);

    return new Response(image, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    const { message, status } = getBrochureErrorResponse(error, 500);

    return Response.json({ error: message }, { status });
  } finally {
    if (tempDir) {
      await rm(tempDir, { force: true, recursive: true });
    }
  }
}
