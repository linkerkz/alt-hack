import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Kicker } from "@/components/ui/Kicker";
import {
  canOpenNetwork,
  canOpenStation,
  homePath,
  ownConsolePath,
  ownDashboardPath,
} from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import {
  getStation,
  getStationNeighbors,
} from "@/features/network-map/queries";
import { StationConsole } from "@/features/station-console/components/StationConsole";
import { getStationConsole } from "@/features/station-console/queries";
import { parseConsoleState } from "@/features/station-console/state";

// Соседа без участка в сети подписываем нейтрально.
const UNKNOWN_NEIGHBOR = "соседняя";

export default async function StationPage({
  params,
  searchParams,
}: PageProps<"/stations/[stationId]">) {
  const user = await requireUser();
  const { stationId } = await params;
  const station = await getStation(stationId);
  if (station == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");

  const mapHref = canOpenNetwork(user) ? `/?station=${station.id}` : null;
  const header = (
    <AppHeader
      current="station"
      stationHref={ownConsolePath(user)}
      dashboardHref={ownDashboardPath(user)}
      account={<AccountMenu user={user} />}
    />
  );

  // Пока готов только пульт ДСЦС; остальные роли видят заглушку.
  if (user.role !== "dscs") {
    return (
      <>
        {header}
        <ConsoleStub station={station} mapHref={mapHref} />
      </>
    );
  }

  const state = parseConsoleState(await searchParams);
  const found = await getStationNeighbors(station.id);
  const neighbors = {
    odd: found.odd ?? UNKNOWN_NEIGHBOR,
    even: found.even ?? UNKNOWN_NEIGHBOR,
  };
  const data = await getStationConsole(state, neighbors);

  return (
    <>
      {header}
      <StationConsole
        stationName={station.name}
        data={data}
        state={state}
        neighbors={neighbors}
        mapHref={mapHref}
      />
    </>
  );
}

type StubProps = {
  station: { name: string; code: string };
  mapHref: string | null;
};

function ConsoleStub({ station, mapHref }: StubProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Kicker tone="accent">Пульт станции · ЕСР {station.code}</Kicker>
      <h1 className="font-heading font-semibold text-[42px] leading-tight">
        {station.name}
      </h1>
      <p className="max-w-md text-[14px] text-muted">
        Пульт для вашей роли ещё в работе. Сейчас готов экран станционного
        диспетчера (ДСЦС).
      </p>
      {mapHref != null && (
        <ButtonLink href={mapHref}>← К карте сети</ButtonLink>
      )}
    </main>
  );
}
