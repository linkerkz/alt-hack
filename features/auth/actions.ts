"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createSupabaseClient } from "@/lib/supabase";
import { homePath } from "./access";
import { DEMO_ACCOUNTS } from "./demo";
import { getCurrentUser } from "./queries";
import type { SignInState } from "./types";

export async function signIn(
  _state: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (email === "" || password === "") {
    return { error: "Введите email и пароль" };
  }
  return signInAndGoHome(email, password);
}

// Пароль демо-аккаунта берётся с сервера, в браузер он не попадает.
export async function signInAsDemo(
  _state: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const isDemo = DEMO_ACCOUNTS.some((account) => account.email === email);
  if (!isDemo || env.demoPassword == null) {
    return { error: "Быстрый вход не настроен" };
  }
  return signInAndGoHome(email, env.demoPassword);
}

export async function signOut() {
  const supabase = await createSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function signInAndGoHome(
  email: string,
  password: string,
): Promise<SignInState> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error != null) return { error: "Неверный email или пароль" };

  const user = await getCurrentUser();
  const home = user == null ? null : homePath(user);
  if (home == null) {
    await supabase.auth.signOut();
    return { error: "Для вашей роли рабочий экран пока в разработке" };
  }
  redirect(home);
}
