import { signOut } from "../actions";
import { ROLE_LABEL } from "../roles";
import type { CurrentUser } from "../types";

export function AccountMenu({ user }: { user: CurrentUser }) {
  const role = ROLE_LABEL[user.role];

  return (
    <div className="flex items-center gap-3 border-line border-l pl-5">
      <div className="text-right leading-tight">
        <p className="text-sm text-white">{user.fullName}</p>
        <p className="text-[11px] text-muted">
          <span className="font-semibold text-sky-300">{role.short}</span> ·{" "}
          {role.full}
        </p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded border border-line px-2.5 py-1 text-muted text-xs hover:bg-surface-2 hover:text-white"
        >
          Выйти
        </button>
      </form>
    </div>
  );
}
