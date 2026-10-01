"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

const FIELD_CLASS =
  "w-full rounded border border-line bg-surface-0 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-sky-500";

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
        <p role="alert" className="text-rose-300 text-sm">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-sky-500 px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-sky-400 disabled:opacity-60"
      >
        {isPending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
