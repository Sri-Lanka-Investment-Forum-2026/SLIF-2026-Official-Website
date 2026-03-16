"use client";

import { useEffect, useId, useRef, useState } from "react";

import { isSafeMediaUrl, toSafeNavigationHref } from "@/lib/utils";

type MediaInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  folder: string;
  accept?: string;
  preview?: "image";
};

export function MediaInput({ label, value, onChange, folder, accept, preview }: MediaInputProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const safeValueHref = toSafeNavigationHref(value);
  const safePreviewSrc = isSafeMediaUrl(value) ? value.trim() : null;

  useEffect(() => {
    setPreviewFailed(false);
  }, [value]);

  const upload = async (file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed.");
      }

      onChange(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="url"
        className="form-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste an existing MinIO/public URL or upload a file"
        aria-describedby={error ? errorId : undefined}
      />
      <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload file"}
        </button>
        {safeValueHref ? (
          <a
            className="btn btn-link btn-sm p-0"
            href={safeValueHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open asset
          </a>
        ) : null}
      </div>
      {error ? (
        <div id={errorId} className="text-danger small mt-2">
          {error}
        </div>
      ) : null}
      {preview === "image" && safePreviewSrc && !previewFailed ? (
        <div className="admin-media-preview mt-3">
          <img
            src={safePreviewSrc}
            alt={`${label} preview`}
            className="admin-media-preview-image"
            loading="lazy"
            onError={() => setPreviewFailed(true)}
          />
        </div>
      ) : null}
      {preview === "image" && value && previewFailed ? (
        <div className="admin-media-preview admin-media-preview-fallback mt-3">
          <span className="small text-secondary">Preview unavailable for this image.</span>
        </div>
      ) : null}
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void upload(file);
          }
        }}
      />
    </div>
  );
}
