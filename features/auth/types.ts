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

export type SignInState = { error: string | null };
