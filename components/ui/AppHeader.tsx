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

// Шапка тёмная: переопределяем токены текста, линий и акцента внутри неё, и
// блок пользователя, который собирает страница, светлеет сам — без своих классов.
const CHROME_TOKENS =
  "[--color-ink:#e8edf5] [--color-muted:#93a0b4] [--color-line:rgb(255_255_255/0.16)] [--color-card:transparent] [--color-neutral-100:rgb(255_255_255/0.08)] [--color-neutral-200:rgb(255_255_255/0.14)] [--color-neutral-300:rgb(255_255_255/0.24)] [--color-neutral-400:rgb(255_255_255/0.4)] [--color-accent:#6f9bee] [--color-accent-700:#a8c4f6] [--color-accent-800:#d4e2fb]";

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
    <header
      className={`flex h-14 shrink-0 items-center gap-6 bg-chrome px-5 text-ink ${CHROME_TOKENS}`}
    >
      <Link
        prefetch={false}
        href="/"
        className="flex items-center gap-2.5 font-heading font-semibold text-[17px] tracking-[-0.01em]"
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

function Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 text-accent-700"
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
