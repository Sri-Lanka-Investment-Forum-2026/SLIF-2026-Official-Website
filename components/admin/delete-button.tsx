"use client";

import { useTransition } from "react";

type DeleteButtonProps = {
  action: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
};

export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Are you sure you want to delete this? This action cannot be undone.",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(confirmMessage)) return;
    startTransition(() => action());
  };

  return (
    <button
      className="btn btn-outline-danger btn-sm"
      onClick={handleClick}
      disabled={isPending}
      type="button"
    >
      {isPending ? (
        <>
          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
          Deleting…
        </>
      ) : (
        label
      )}
    </button>
  );
}
