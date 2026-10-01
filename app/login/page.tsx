import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { homePath } from "@/features/auth/access";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getCurrentUser } from "@/features/auth/queries";

export default async function LoginPage() {
  const user = await getCurrentUser();
  const home = user == null ? null : homePath(user);
  if (home != null) redirect(home);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <header className="space-y-1 text-center">
          <Kicker>Диспетчерская система</Kicker>
          <h1 className="font-heading font-semibold text-[32px] leading-tight">
            Цифровая станция
          </h1>
        </header>

        <Card elevation="md" className="p-6">
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
