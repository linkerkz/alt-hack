import { Button } from "@/components/ui/Button";
import { signOut } from "../actions";
import { ROLE_LABEL } from "../roles";
import type { CurrentUser } from "../types";

export function AccountMenu({ user }: { user: CurrentUser }) {
  const role = ROLE_LABEL[user.role];

  return (
    <div className="flex items-center gap-3 border-line border-l pl-5">
      <div className="text-right leading-tight">
        <p className="font-heading font-semibold text-[16px]">
          {user.fullName}
        </p>
        <p className="text-[11px] text-muted">
          <span className="font-semibold text-accent-700">{role.short}</span> ·{" "}
          {role.full}
        </p>
      </div>
      <form action={signOut}>
        <Button type="submit" size="sm">
          Выйти
        </Button>
      </form>
    </div>
  );
}
