"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

const FIELD_CLASS =
  "w-full rounded border border-line bg-surface-0 px-3 py-2 text-ink text-sm outline-none placeholder:text-muted focus:border-accent";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-muted text-xs">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={FIELD_CLASS}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-muted text-xs">Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD_CLASS}
        />
      </label>

      {state.error != null && (
        <p role="alert" className="text-sm text-status-critical">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded border border-accent px-4 py-2.5 font-semibold text-accent-700 text-sm transition-colors hover:bg-accent-100 disabled:opacity-45"
      >
        {isPending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
