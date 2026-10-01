import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import {
  canOpenNetwork,
  canOpenStation,
  homePath,
  ownConsolePath,
} from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import { getStation } from "@/features/network-map/queries";

// Заглушка: пульт станции (схема, Гант, рекомендации) — следующая фича.
export default async function StationPage({
  params,
}: PageProps<"/stations/[stationId]">) {
  const user = await requireUser();
  const { stationId } = await params;
  const station = await getStation(stationId);
  if (station == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");

  return (
    <>
      <AppHeader
        current="station"
        stationHref={ownConsolePath(user)}
        account={<AccountMenu user={user} />}
      />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-mono text-muted text-xs uppercase tracking-widest">
          Пульт станции · ЕСР {station.code}
        </p>
        <h1 className="font-semibold text-3xl text-white">{station.name}</h1>
        <p className="max-w-md text-muted text-sm">
          Здесь будет схема станции, диаграмма Ганта, индекс эффективности и
          рекомендации ИИ-планировщика.
        </p>
        {canOpenNetwork(user) && (
          <Link
            href={`/?station=${station.id}`}
            className="rounded border border-line px-4 py-2 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white"
          >
            ← К карте сети
          </Link>
        )}
      </main>
    </>
  );
}
