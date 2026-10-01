import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { QrCode } from "@/components/ui/QrCode";
import {
  canOpenStation,
  homePath,
  ownConsolePath,
  ownDashboardPath,
} from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import { devicePath } from "@/features/devices/paths";
import { getStationDevices } from "@/features/devices/queries";
import type { Device } from "@/features/devices/types";
import { getStation } from "@/features/network-map/queries";
import { formatTime } from "@/features/work-orders/status";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Полевые устройства" };

// Служебная страница без ссылок из приложения: QR камер и пейджеров станции,
// чтобы перед демо открыть их на телефонах и поставить на домашний экран.
export default async function StationDevicesPage({
  params,
}: PageProps<"/stations/[stationId]/devices">) {
  const user = await requireUser();
  const station = await getStation((await params).stationId);
  if (station == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");
  const devices = await getStationDevices(station.id);

  return (
    <>
      <AppHeader
        current="station"
        stationHref={ownConsolePath(user)}
        dashboardHref={ownDashboardPath(user)}
        account={<AccountMenu user={user} />}
      />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-5 py-8">
        <Heading
          level={1}
          note="Наведите камеру телефона на QR — устройство откроется без входа"
        >
          Полевые устройства · ст. {station.name}
        </Heading>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map(({ device, lastSeenAt }) => (
            <li key={device.id}>
              <Card className="flex flex-col items-center gap-3 p-5 text-center">
                <Kicker tone="accent">{purposeOf(device)}</Kicker>
                <p className="font-heading font-semibold text-[21px] leading-tight">
                  {device.name}
                </p>
                <QrCode
                  url={`${SITE_URL}${devicePath(device)}`}
                  className="size-40"
                />
                {device.kind === "camera" && (
                  <p className="text-[12px] text-muted">
                    {lastSeenAt == null
                      ? "Сигналов ещё не было"
                      : `Последний сигнал в ${formatTime(lastSeenAt)}`}
                  </p>
                )}
                <Link
                  href={devicePath(device)}
                  target="_blank"
                  className="text-[13px] text-accent-700 underline underline-offset-2 hover:text-accent-600"
                >
                  Открыть на этом компьютере
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

function purposeOf(device: Device) {
  if (device.kind === "camera") return `Камера · стрелка ${device.objectId}`;
  return "Пейджер · станционная бригада";
}
