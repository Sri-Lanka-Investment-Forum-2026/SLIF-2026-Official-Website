import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { fetchBrochureBuffer } from "@/lib/brochure";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const brochureUrl = requestUrl.searchParams.get("url");
  const page = parsePositiveInteger(requestUrl.searchParams.get("page"), 1);
  const width = parsePositiveInteger(requestUrl.searchParams.get("width"), 1400);

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
    ]);

    const image = await readFile(imagePath);

    return new Response(image, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to render brochure page.";
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
