import Link from "next/link";
import type { ReactNode } from "react";
import { LiveClock } from "./LiveClock";

type Props = {
  current: Section;
  // Пульт своей станции; null — у пользователя её нет, пункт неактивен.
  stationHref: string | null;
  // Блок пользователя справа: его собирает страница, шапка о входе не знает.
  account?: ReactNode;
};

type Section = "network" | "station";

type NavItem = {
  id: Section | "analytics" | "scenarios" | "settings";
  label: string;
  href?: string;
  // Подсказка для неактивного пункта.
  hint?: string;
};

// Пункты без href неактивны: ещё не реализованы или недоступны роли —
// показываем их, чтобы было видно план продукта.
function navItems(stationHref: string | null): NavItem[] {
  return [
    { id: "network", label: "Карта сети", href: "/" },
    {
      id: "station",
      label: "Пульт станции",
      href: stationHref ?? undefined,
      hint: "Откройте пульт из карточки станции на карте",
    },
    { id: "analytics", label: "Эффективность" },
    { id: "scenarios", label: "Сценарии сбоев" },
    { id: "settings", label: "Настройки индекса" },
  ];
}

export function AppHeader({ current, stationHref, account }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-line border-b bg-paper px-5">
      <Link
        href="/"
        className="flex items-center gap-2.5 font-heading font-semibold text-[21px]"
      >
        <Logo />
        Цифровая станция
      </Link>

      <nav className="flex h-full items-stretch gap-1">
        {navItems(stationHref).map((item) => (
          <NavLink key={item.id} item={item} isCurrent={item.id === current} />
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <span className="flex items-center gap-2 text-[11px] text-muted">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-normal opacity-50" />
            <span className="relative size-2 rounded-full bg-normal" />
          </span>
          Симулятор · онлайн
        </span>
        <LiveClock />
        {account}
      </div>
    </header>
  );
}

function NavLink({ item, isCurrent }: { item: NavItem; isCurrent: boolean }) {
  const base = "flex items-center border-b-2 px-3 text-sm transition-colors";

  if (isCurrent) {
    return (
      <span
        aria-current="page"
        className={`${base} border-accent text-accent-700`}
      >
        {item.label}
      </span>
    );
  }
  if (item.href == null) {
    return (
      <span
        title={item.hint ?? "В разработке"}
        className={`${base} cursor-not-allowed border-transparent text-neutral-400`}
      >
        {item.label}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      className={`${base} border-transparent text-ink hover:text-accent`}
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
