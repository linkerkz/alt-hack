import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Kicker } from "@/components/ui/Kicker";
import {
  canOpenNetwork,
  canOpenStation,
  homePath,
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

export default async function StationPage({
  params,
  searchParams,
}: PageProps<"/stations/[stationId]">) {
  const { stationId } = await params;
  // Всё читаем одной волной: права проверяем до того, как что-то показать,
  // а данные станции и так закрыты RLS.
  const [user, station, live, neighbors, query] = await Promise.all([
    requireUser(),
    getStation(stationId),
    getLive(stationId),
    getStationNeighbors(stationId),
    searchParams,
  ]);
  if (station == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");

  const mapHref = canOpenNetwork(user) ? `/?station=${station.id}` : null;
  const header = (
    <AppHeader
      current="station"
      stationHref={`/stations/${station.id}`}
      dashboardHref={`/dashboard/${station.id}`}
      account={<AccountMenu user={user} />}
    />
  );

  // Пульт готов для ДСЦС, ДСП, ДНЦ (согласует вариант Б прямо на пульте)
  // и ДС (наблюдает без команд); остальные роли видят заглушку.
  const { role } = user;
  if (role !== "dscs" && role !== "dsp" && role !== "dnc" && role !== "ds") {
    return (
      <>
        {header}
        <ConsoleStub station={station} mapHref={mapHref} />
      </>
    );
  }

  const state = parseConsoleState(query, live);
  const data = await getStationConsole(station.id, state, neighbors, live);

  return (
    <>
      {header}
      <StationConsole
        role={role}
        stationName={station.name}
        data={data}
        state={state}
        neighbors={neighbors}
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
        Пульт для вашей роли ещё в работе. Сейчас готовы экраны ДСЦС и ДСП, ДНЦ
        смотрит пульт станции своего круга, ДС — своей станции.
      </p>
      {mapHref != null && (
        <ButtonLink href={mapHref}>← К карте сети</ButtonLink>
      )}
    </main>
  );
}
