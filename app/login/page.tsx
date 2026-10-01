import { redirect } from "next/navigation";
import { homePath } from "@/features/auth/access";
import { DemoLogin } from "@/features/auth/components/DemoLogin";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentUser, isDemoLoginEnabled } from "@/features/auth/queries";

export default async function LoginPage() {
  const user = await getCurrentUser();
  const home = user == null ? null : homePath(user);
  if (home != null) redirect(home);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1 text-center">
          <p className="font-mono text-[11px] text-muted uppercase tracking-widest">
            Диспетчерская система
          </p>
          <h1 className="font-semibold text-2xl text-white">
            Цифровая станция
          </h1>
        </header>

        <section className="space-y-5 rounded-lg border border-line bg-surface-1 p-6 shadow-2xl">
          <LoginForm />

          {isDemoLoginEnabled() && (
            <div className="space-y-3 border-line border-t pt-5">
              <p className="text-center text-muted text-xs">
                Демо: войти под ролью
              </p>
              <DemoLogin />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
