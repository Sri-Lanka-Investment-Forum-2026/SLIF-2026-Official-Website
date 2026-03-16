"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { saveSectorAction } from "@/app/admin/actions";
import { MediaInput } from "@/components/admin/media-input";
import type { SectorInput } from "@/lib/validation";

const parseLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

type SectorEditorProps = {
  initialValue: SectorInput;
};

export function SectorEditor({ initialValue }: SectorEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const preservedSectorDetails = {
    officerName: initialValue.officerName,
    officerTitle: initialValue.officerTitle,
    officerSpecialization: initialValue.officerSpecialization,
    officerPhone: initialValue.officerPhone,
    officerEmail: initialValue.officerEmail,
    officerImageUrl: initialValue.officerImageUrl,
    consultationLink: initialValue.consultationLink,
    reportLink: initialValue.reportLink,
    officerDescription: initialValue.officerDescription,
  };
  const [overviewText, setOverviewText] = useState(
    initialValue.overviewParagraphs.join("\n"),
  );
  const [whyInvestText, setWhyInvestText] = useState(
    initialValue.whyInvestItems.join("\n"),
  );
  const [advantagesText, setAdvantagesText] = useState(
    initialValue.advantages.join("\n"),
  );

  const form = useForm<SectorInput>({
    defaultValues: initialValue,
  });

  const stats = useFieldArray({
    control: form.control,
    name: "stats",
  });

  const submit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await saveSectorAction({
          ...values,
          ...preservedSectorDetails,
          overviewParagraphs: parseLines(overviewText),
          whyInvestItems: parseLines(whyInvestText),
          advantages: parseLines(advantagesText),
        });

        router.push(`/admin/sectors/${result.id}`);
        router.refresh();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to save sector.",
        );
      }
    });
  });

  return (
    <form onSubmit={submit} className="admin-card p-4 p-lg-5">
      <div className="row g-4">
        <div className="col-md-8">
          <label className="form-label">Sector name</label>
          <input className="form-control" {...form.register("name")} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Slug</label>
          <input className="form-control" {...form.register("slug")} />
        </div>
        <div className="col-md-8">
          <label className="form-label">Tagline</label>
          <input className="form-control" {...form.register("tagline")} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Sort order</label>
          <input
            className="form-control"
            type="number"
            {...form.register("sortOrder", { valueAsNumber: true })}
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="sector-published"
              {...form.register("published")}
            />
            <label className="form-check-label" htmlFor="sector-published">
              Published
            </label>
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h2 className="h4 mb-3">Media</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <MediaInput
              label="Hero image"
              value={form.watch("heroImageUrl") ?? ""}
              onChange={(value) =>
                form.setValue("heroImageUrl", value, { shouldDirty: true })
              }
              folder="sectors"
              accept="image/*"
              preview="image"
            />
          </div>
          <div className="col-md-6">
            <MediaInput
              label="Overview image"
              value={form.watch("imageUrl") ?? ""}
              onChange={(value) =>
                form.setValue("imageUrl", value, { shouldDirty: true })
              }
              folder="sectors"
              accept="image/*"
              preview="image"
            />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h2 className="h4 mb-3">Content blocks</h2>
        <div className="mb-4">
          <label className="form-label">Overview paragraphs</label>
          <textarea
            className="form-control"
            rows={6}
            value={overviewText}
            onChange={(event) => setOverviewText(event.target.value)}
          />
          <div className="form-text">One paragraph per line.</div>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">Stats</label>
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
                    <input
                      className="form-control"
                      {...form.register(`stats.${index}.label`)}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">Value</label>
                    <input
                      className="form-control"
                      {...form.register(`stats.${index}.value`)}
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => stats.remove(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Why invest items</label>
          <textarea
            className="form-control"
            rows={6}
            value={whyInvestText}
            onChange={(event) => setWhyInvestText(event.target.value)}
          />
          <div className="form-text">One item per line.</div>
        </div>

        <div>
          <label className="form-label">Strategic advantages</label>
          <textarea
            className="form-control"
            rows={6}
            value={advantagesText}
            onChange={(event) => setAdvantagesText(event.target.value)}
          />
          <div className="form-text">One item per line.</div>
        </div>
      </div>

      <div className="admin-form-section">
        <h2 className="h4 mb-3">SEO and CTA</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <label className="form-label">SEO title</label>
            <input className="form-control" {...form.register("seoTitle")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">SEO description</label>
            <input
              className="form-control"
              {...form.register("seoDescription")}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">CTA title</label>
            <input className="form-control" {...form.register("ctaTitle")} />
          </div>
          <div className="col-md-6">
            <label className="form-label">CTA description</label>
            <input
              className="form-control"
              {...form.register("ctaDescription")}
            />
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger mt-4">{error}</div> : null}

      <div className="d-flex justify-content-end gap-3 mt-4">
        <button
          className="btn btn-dark btn-lg"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save sector"}
        </button>
      </div>
    </form>
  );
}
