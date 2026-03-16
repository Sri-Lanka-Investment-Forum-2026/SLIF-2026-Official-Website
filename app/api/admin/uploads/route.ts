import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prepareUploadAsset } from "@/lib/image-upload";
import { registerMediaUrl } from "@/lib/media";
import { formatStorageError, uploadToMinio } from "@/lib/minio";
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

    const preparedFile = await prepareUploadAsset(file);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const extension = preparedFile.extension;
    const key = `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${slugify(baseName)}${
      extension ? `.${extension}` : ""
    }`;
    const url = await uploadToMinio({
      body: preparedFile.body,
      key,
      contentType: preparedFile.contentType,
    });

    const asset = await registerMediaUrl(url, {
      altText,
      mimeType: preparedFile.contentType,
      size: preparedFile.size,
    });

    return NextResponse.json({
      url,
      asset,
    });
  } catch (error) {
    console.error("Media upload failed.", error);
    const message = formatStorageError(error);

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
