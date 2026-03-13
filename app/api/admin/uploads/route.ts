import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { registerMediaUrl } from "@/lib/media";
import { uploadToMinio } from "@/lib/minio";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "uploads");
  const altText = String(formData.get("altText") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
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
}
