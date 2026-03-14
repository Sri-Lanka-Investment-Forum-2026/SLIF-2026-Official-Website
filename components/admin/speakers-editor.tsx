"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm, type Control, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import { saveSpeakerSettingsAction } from "@/app/admin/actions";
import { MediaInput } from "@/components/admin/media-input";
import type { SpeakerSettingsInput } from "@/lib/validation";

type SpeakersEditorProps = {
  initialValue: SpeakerSettingsInput;
};

type SessionCardProps = {
  control: Control<SpeakerSettingsInput>;
  register: UseFormRegister<SpeakerSettingsInput>;
  setValue: UseFormSetValue<SpeakerSettingsInput>;
  watch: UseFormWatch<SpeakerSettingsInput>;
  sessionIndex: number;
  removeSession: () => void;
};

function SessionCard({ control, register, setValue, watch, sessionIndex, removeSession }: SessionCardProps) {
  const speakers = useFieldArray({
    control,
    name: `sessions.${sessionIndex}.speakers`,
  });

  return (
    <div className="admin-array-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 mb-0">Session {sessionIndex + 1}</h3>
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={removeSession}>
          Remove session
        </button>
      </div>

      <div className="mb-3">
        <label className="form-label">Session name</label>
        <input className="form-control" {...register(`sessions.${sessionIndex}.name`)} />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0">Speakers</label>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => speakers.append({ id: "", name: "", title: "", company: "", imageUrl: "", alt: "" })}
        >
          Add speaker
        </button>
      </div>

      <div className="d-grid gap-3">
        {speakers.fields.map((speaker, speakerIndex) => (
          <div key={speaker.id} className="admin-array-card bg-white">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label">Name</label>
                <input className="form-control" {...register(`sessions.${sessionIndex}.speakers.${speakerIndex}.name`)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Title</label>
                <input className="form-control" {...register(`sessions.${sessionIndex}.speakers.${speakerIndex}.title`)} />
              </div>
              <div className="col-md-3">
                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={() => speakers.remove(speakerIndex)}
                >
                  Remove
                </button>
              </div>
              <div className="col-md-6">
                <label className="form-label">Company</label>
                <input className="form-control" {...register(`sessions.${sessionIndex}.speakers.${speakerIndex}.company`)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Alt text</label>
                <input className="form-control" {...register(`sessions.${sessionIndex}.speakers.${speakerIndex}.alt`)} />
              </div>
              <div className="col-12">
                <MediaInput
                  label="Speaker image"
                  value={watch(`sessions.${sessionIndex}.speakers.${speakerIndex}.imageUrl`) ?? ""}
                  onChange={(value) =>
                    setValue(`sessions.${sessionIndex}.speakers.${speakerIndex}.imageUrl`, value, {
                      shouldDirty: true,
                    })
                  }
                  folder="speakers"
                  accept="image/*"
                  preview="image"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpeakersEditor({ initialValue }: SpeakersEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SpeakerSettingsInput>({
    defaultValues: initialValue,
  });

  const sessions = useFieldArray({
    control: form.control,
    name: "sessions",
  });

  const submit = form.handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      try {
        await saveSpeakerSettingsAction(values);
        router.refresh();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error ? submissionError.message : "Unable to save speakers.",
        );
      }
    });
  });

  return (
    <form onSubmit={submit} className="admin-card p-4 p-lg-5">
      <div className="row g-4">
        <div className="col-md-6">
          <label className="form-label">Section title</label>
          <input className="form-control" {...form.register("title")} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Section subtitle</label>
          <input className="form-control" {...form.register("subtitle")} />
        </div>
      </div>

      <div className="admin-form-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">Speaker sessions</h2>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              sessions.append({
                id: "",
                name: "",
                speakers: [],
              })
            }
          >
            Add session
          </button>
        </div>

        <div className="d-grid gap-4">
          {sessions.fields.map((session, sessionIndex) => (
            <SessionCard
              key={session.id}
              control={form.control}
              register={form.register}
              setValue={form.setValue}
              watch={form.watch}
              sessionIndex={sessionIndex}
              removeSession={() => sessions.remove(sessionIndex)}
            />
          ))}
        </div>
      </div>

      {error ? <div className="alert alert-danger mt-4">{error}</div> : null}

      <div className="d-flex justify-content-end gap-3 mt-4">
        <button className="btn btn-dark btn-lg" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save speakers"}
        </button>
      </div>
    </form>
  );
}
