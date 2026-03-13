"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/admin/actions";

const initialState = { error: null as string | null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="admin-login-card p-4 p-lg-5">
      <p className="text-uppercase small fw-semibold text-secondary mb-2">SLIF Admin</p>
      <h1 className="h2 mb-3">Sign in</h1>
      <p className="text-secondary mb-4">
        Use the configured internal admin credentials to manage sectors, projects, and speakers.
      </p>

      <div className="mb-3">
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input className="form-control form-control-lg" id="email" name="email" type="email" required />
      </div>

      <div className="mb-4">
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <input
          className="form-control form-control-lg"
          id="password"
          name="password"
          type="password"
          required
        />
      </div>

      {state.error ? <div className="alert alert-danger">{state.error}</div> : null}

      <button className="btn btn-dark btn-lg w-100" type="submit" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
