"use client";

import { useActionState } from "react";
import { signInAsDemo } from "../actions";
import { DEMO_ACCOUNTS } from "../demo";
import { ROLE_LABEL } from "../roles";

// Одна форма на все кнопки: email уходит значением нажатой кнопки.
export function DemoLogin() {
  const [state, formAction, isPending] = useActionState(signInAsDemo, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="submit"
            name="email"
            value={account.email}
            disabled={isPending}
            className="rounded border border-line bg-surface-0 px-3 py-2 text-left transition-colors hover:border-sky-500/60 hover:bg-surface-2 disabled:opacity-60"
          >
            <span className="block font-semibold text-sm text-white">
              {ROLE_LABEL[account.role].short}
            </span>
            <span className="block truncate text-[11px] text-muted">
              {ROLE_LABEL[account.role].full}
            </span>
            <span className="block truncate font-mono text-[10px] text-sky-300/80">
              {account.scope}
            </span>
          </button>
        ))}
      </div>

      {state.error != null && (
        <p role="alert" className="text-rose-300 text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
