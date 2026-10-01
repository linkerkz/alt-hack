import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Kicker } from "@/components/ui/Kicker";
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
        <Kicker tone="accent">Пульт станции · ЕСР {station.code}</Kicker>
        <h1 className="font-heading font-semibold text-[42px] leading-tight">
          {station.name}
        </h1>
        <p className="max-w-md text-[14px] text-muted">
          Здесь будет схема станции, диаграмма Ганта, индекс эффективности и
          рекомендации ИИ-планировщика.
        </p>
        {canOpenNetwork(user) && (
          <ButtonLink href={`/?station=${station.id}`}>
            ← К карте сети
          </ButtonLink>
        )}
      </main>
    </>
  );
}
