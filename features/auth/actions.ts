"use server";

import { redirect } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { homePath } from "./access";
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
