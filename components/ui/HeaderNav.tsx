"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  current: Section;
  stationHref: string | null;
  dashboardHref: string | null;
  // Станции, которые выбирают на карте (?station=) и которые пользователь может открыть.
  selectableStationIds: string[];
};

export type Section = "network" | "station" | "analytics";

type NavItem = { id: Section; label: string; href: string | null };

// Выбор на карте меняет только URL, без запроса к серверу, поэтому пункты
// пульта и эффективности под выбранную станцию собираем в браузере.
export function HeaderNav({
  current,
  stationHref,
  dashboardHref,
  selectableStationIds,
}: Props) {
  const selected = useSearchParams().get("station");
  const isSelectable =
    selected != null && selectableStationIds.includes(selected);
  const items = navItems(
    isSelectable ? `/stations/${selected}` : stationHref,
    isSelectable ? `/dashboard/${selected}` : dashboardHref,
  ).filter((item) => item.href != null || item.id === current);

  return (
    <nav className="flex h-full items-stretch gap-1">
      {items.map((item) => (
        <NavLink key={item.id} item={item} isCurrent={item.id === current} />
      ))}
    </nav>
  );
}

// Пункт без адреса показываем, только пока он открыт: ДНЦ попадает на пульт
// и в эффективность через выбранную на карте станцию.
function navItems(
  stationHref: string | null,
  dashboardHref: string | null,
): NavItem[] {
  return [
    { id: "network", label: "Карта сети", href: "/" },
    { id: "station", label: "Пульт станции", href: stationHref },
    { id: "analytics", label: "Эффективность", href: dashboardHref },
  ];
}

function NavLink({ item, isCurrent }: { item: NavItem; isCurrent: boolean }) {
  const base = "flex items-center border-b-2 px-3 text-sm transition-colors";

  if (isCurrent || item.href == null) {
    return (
      <span
        aria-current="page"
        className={`${base} border-accent font-medium text-ink`}
      >
        {item.label}
      </span>
    );
  }
  return (
    <Link
      prefetch={false}
      href={item.href}
      className={`${base} border-transparent text-muted hover:text-ink`}
    >
      {item.label}
    </Link>
  );
}
