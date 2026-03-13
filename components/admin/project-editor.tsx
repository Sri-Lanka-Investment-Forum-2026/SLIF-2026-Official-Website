"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { saveProjectAction } from "@/app/admin/actions";
import { MediaInput } from "@/components/admin/media-input";
import type { ProjectInput } from "@/lib/validation";

const parseLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

type ProjectEditorProps = {
  initialValue: ProjectInput;
  sectors: Array<{ id: string; name: string }>;
};

export function ProjectEditor({ initialValue, sectors }: ProjectEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [highlightsText, setHighlightsText] = useState(initialValue.highlights.join("\n"));
  const [financialText, setFinancialText] = useState(initialValue.financialItems.join("\n"));

  const form = useForm<ProjectInput>({
    defaultValues: initialValue,
  });

  const media = useFieldArray({
    control: form.control,
    name: "media",
  });

  const stats = useFieldArray({
    control: form.control,
    name: "stats",
  });

  const submit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await saveProjectAction({
          ...values,
          highlights: parseLines(highlightsText),
          financialItems: parseLines(financialText),
        });

        router.push(`/admin/projects/${result.id}`);
        router.refresh();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error ? submissionError.message : "Unable to save project.",
        );
      }
    });
  });

  return (
    <form onSubmit={submit} className="admin-card p-4 p-lg-5">
      <div className="row g-4">
        <div className="col-md-5">
          <label className="form-label">Project title</label>
          <input className="form-control" {...form.register("title")} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Legacy ID</label>
          <input className="form-control" {...form.register("legacyId")} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Slug</label>
          <input className="form-control" {...form.register("slug")} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Sector</label>
          <select className="form-select" {...form.register("sectorId")}>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Type</label>
          <input className="form-control" {...form.register("type")} />
        </div>
        <div className="col-md-1">
          <label className="form-label">Order</label>
          <input className="form-control" type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" id="project-published" {...form.register("published")} />
            <label className="form-check-label" htmlFor="project-published">
              Published
            </label>
          </div>
        </div>
        <div className="col-12">
          <label className="form-label">Subtitle</label>
          <input className="form-control" {...form.register("subTitle")} />
        </div>
        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={5} {...form.register("description")} />
        </div>
      </div>

      <div className="admin-form-section">
        <h2 className="h4 mb-3">Media and downloads</h2>
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <MediaInput
              label="Brochure URL/PDF"
              value={form.watch("brochureUrl") ?? ""}
              onChange={(value) => form.setValue("brochureUrl", value, { shouldDirty: true })}
              folder="projects"
              accept="application/pdf,image/*"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">More info URL</label>
            <input className="form-control" {...form.register("moreInfoUrl")} />
          </div>
          <div className="col-md-6">
            <MediaInput
              label="Video URL"
              value={form.watch("videoUrl") ?? ""}
              onChange={(value) => form.setValue("videoUrl", value, { shouldDirty: true })}
              folder="projects"
              accept="video/*"
            />
          </div>
          <div className="col-md-6">
            <MediaInput
              label="Hero video URL"
              value={form.watch("heroVideoUrl") ?? ""}
              onChange={(value) => form.setValue("heroVideoUrl", value, { shouldDirty: true })}
              folder="projects"
              accept="video/*"
            />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label mb-0">Gallery images</label>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => media.append({ url: "", altText: "" })}
          >
            Add image
          </button>
        </div>
        <div className="d-grid gap-3">
          {media.fields.map((field, index) => (
            <div key={field.id} className="admin-array-card">
              <div className="row g-3 align-items-end">
                <div className="col-md-7">
                  <MediaInput
                    label={`Image ${index + 1}`}
                    value={form.watch(`media.${index}.url`) ?? ""}
                    onChange={(value) =>
                      form.setValue(`media.${index}.url`, value, { shouldDirty: true })
                    }
                    folder="projects"
                    accept="image/*"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Alt text</label>
                  <input className="form-control" {...form.register(`media.${index}.altText`)} />
                </div>
                <div className="col-md-2">
                  <button type="button" className="btn btn-outline-danger w-100" onClick={() => media.remove(index)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-form-section">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h4 mb-0">Quick facts</h2>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => stats.append({ label: "", value: "" })}
          >
            Add stat
          </button>
        </div>
        <div className="d-grid gap-3">
          {stats.fields.map((field, index) => (
            <div key={field.id} className="admin-array-card">
              <div className="row g-3 align-items-end">
                <div className="col-md-5">
                  <label className="form-label">Label</label>
                  <input className="form-control" {...form.register(`stats.${index}.label`)} />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Value</label>
                  <input className="form-control" {...form.register(`stats.${index}.value`)} />
                </div>
                <div className="col-md-2">
                  <button type="button" className="btn btn-outline-danger w-100" onClick={() => stats.remove(index)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-form-section">
        <h2 className="h4 mb-3">Highlights and finance</h2>
        <div className="mb-4">
          <label className="form-label">Investment highlights</label>
          <textarea
            className="form-control"
            rows={6}
            value={highlightsText}
            onChange={(event) => setHighlightsText(event.target.value)}
          />
          <div className="form-text">One item per line.</div>
        </div>
        <div>
          <label className="form-label">Financial snapshot</label>
          <textarea
            className="form-control"
            rows={5}
            value={financialText}
            onChange={(event) => setFinancialText(event.target.value)}
          />
          <div className="form-text">One item per line.</div>
        </div>
      </div>

      {error ? <div className="alert alert-danger mt-4">{error}</div> : null}

      <div className="d-flex justify-content-end gap-3 mt-4">
        <button className="btn btn-dark btn-lg" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save project"}
        </button>
      </div>
    </form>
  );
}
