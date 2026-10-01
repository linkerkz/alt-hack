"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-3">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
      />
      <Field
        label="Пароль"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      {state.error != null && (
        <p role="alert" className="text-[14px] text-critical">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Входим…" : "Войти"}
      </Button>
    </form>
  );
}
