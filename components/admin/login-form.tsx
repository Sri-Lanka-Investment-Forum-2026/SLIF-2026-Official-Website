"use client";

import { useActionState, useState } from "react";

import { loginAction } from "@/app/admin/actions";

const initialState = { error: null as string | null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="admin-login-card">
      <p className="text-uppercase small fw-semibold text-secondary mb-2" style={{ letterSpacing: "0.08em" }}>
        SLIF Admin
      </p>
      <h1 className="h2 mb-3">Sign in</h1>
      <p className="text-secondary mb-4">
        Use the configured internal admin credentials to manage sectors, projects, and speakers.
      </p>

      <div className="mb-3">
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input
          className="form-control form-control-lg"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </div>

      <div className="mb-4">
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <div className="input-group">
          <input
            className="form-control form-control-lg"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {state.error ? (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-exclamation-circle-fill flex-shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <button className="btn btn-dark btn-lg w-100" type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
