import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { registerMediaUrl } from "@/lib/media";
import { uploadToMinio } from "@/lib/minio";
import { normalizeUploadFolder, validateUploadFile } from "@/lib/upload-policy";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const requestedFolder = String(formData.get("folder") ?? "uploads");
    const altText = String(formData.get("altText") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const folder = normalizeUploadFolder(requestedFolder);

    if (!folder) {
      return NextResponse.json({ error: "Unsupported upload destination." }, { status: 400 });
    }

    const validation = validateUploadFile(folder, file.name, file.type, file.size);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "";
    const key = `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${slugify(baseName)}${
      extension ? `.${extension}` : ""
    }`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToMinio({
      body: buffer,
      key,
      contentType: file.type || "application/octet-stream",
    });

    const asset = await registerMediaUrl(url, {
      altText,
      mimeType: file.type,
      size: file.size,
    });

    return NextResponse.json({
      url,
      asset,
    });
  } catch (error) {
    console.error("Media upload failed.", error);

    return NextResponse.json(
      {
        error: error instanceof Error && error.message ? error.message : "Upload failed.",
      },
      { status: 500 },
    );
  }
}
