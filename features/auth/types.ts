// Совпадает с enum public.app_role в supabase/migrations.
export type Role =
  | "dsp"
  | "dscs"
  | "dnc"
  | "ds"
  | "dsc"
  | "shunter"
  | "shunting_driver";

export type CurrentUser = {
  id: string;
  fullName: string;
  role: Role;
  stationId: string | null;
  dispatchAreaId: string | null;
};

// Зона ответственности пользователя: диспетчерский круг или одна станция.
export type Scope =
  | { kind: "dispatch-area"; dispatchAreaId: string }
  | { kind: "station"; stationId: string };

export type SignInState = { error: string | null };
