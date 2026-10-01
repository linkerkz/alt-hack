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
import { getLive, getStationConsole } from "@/features/station-console/queries";
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

  // Готовы пульты ДСЦС и ДСП, ДНЦ смотрит пульт ДСЦС без команд;
  // остальные роли видят заглушку.
  const { role } = user;
  if (role !== "dscs" && role !== "dsp" && role !== "dnc") {
    return (
      <>
        {header}
        <ConsoleStub station={station} mapHref={mapHref} />
      </>
    );
  }

  const [live, query, found] = await Promise.all([
    getLive(station.id),
    searchParams,
    getStationNeighbors(station.id),
  ]);
  const state = parseConsoleState(query, live);
  const neighbors = {
    odd: found.odd ?? UNKNOWN_NEIGHBOR,
    even: found.even ?? UNKNOWN_NEIGHBOR,
  };
  const data = await getStationConsole(station.id, state, neighbors, live);

  return (
    <>
      {header}
      <StationConsole
        role={role}
        operatorName={shortName(user.fullName)}
        stationName={station.name}
        data={data}
        state={state}
        neighbors={neighbors}
        mapHref={mapHref}
      />
    </>
  );
}

// «Ерлан Ахметов» → «Ахметов Е.»: так подписаны роли в макете.
function shortName(fullName: string) {
  const [first, last] = fullName.split(" ");
  if (last == null) return fullName;
  return `${last} ${first[0]}.`;
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
        Пульт для вашей роли ещё в работе. Сейчас готовы экраны ДСЦС и ДСП, ДНЦ
        смотрит пульт станции своего круга.
      </p>
      {mapHref != null && (
        <ButtonLink href={mapHref}>← К карте сети</ButtonLink>
      )}
    </main>
  );
}
