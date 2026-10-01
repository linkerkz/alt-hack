import Link from "next/link";
import type { ReactNode } from "react";
import { LiveClock } from "./LiveClock";

type Props = {
  current: Section;
  // Пульт и dashboard своей станции; null — у роли нет своей станции (ДНЦ выбирает на карте).
  stationHref: string | null;
  dashboardHref: string | null;
  // Блок пользователя справа: его собирает страница, шапка о входе не знает.
  account?: ReactNode;
};

type Section = "network" | "station" | "analytics";

type NavItem = { id: Section; label: string; href: string | null };

// Пункт без адреса показываем, только пока он открыт: ДНЦ попадает на пульт
// и в эффективность из карточки станции на карте.
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

export function AppHeader({
  current,
  stationHref,
  dashboardHref,
  account,
}: Props) {
  const items = navItems(stationHref, dashboardHref).filter(
    (item) => item.href != null || item.id === current,
  );

  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-line border-b bg-paper px-5">
      <Link
        prefetch={false}
        href="/"
        className="flex items-center gap-2.5 font-heading font-semibold text-[21px]"
      >
        <Logo />
        Цифровая станция
      </Link>

      <nav className="flex h-full items-stretch gap-1">
        {items.map((item) => (
          <NavLink key={item.id} item={item} isCurrent={item.id === current} />
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <LiveClock />
        {account}
      </div>
    </header>
  );
}

function NavLink({ item, isCurrent }: { item: NavItem; isCurrent: boolean }) {
  const base = "flex items-center border-b-2 px-3 text-sm transition-colors";

  if (isCurrent || item.href == null) {
    return (
      <span
        aria-current="page"
        className={`${base} border-accent text-accent-700`}
      >
        {item.label}
      </span>
    );
  }
  return (
    <Link
      prefetch={false}
      href={item.href}
      className={`${base} border-transparent text-ink hover:text-accent-700`}
    >
      {item.label}
    </Link>
  );
}

function Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M7 3 4 21M17 3l3 18M6.4 8h11.2M5.6 13h12.8M4.8 18h14.4" />
    </svg>
  );
}
