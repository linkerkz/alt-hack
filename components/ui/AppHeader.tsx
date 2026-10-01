import Link from "next/link";
import { LiveClock } from "./LiveClock";

type Props = {
  current: Section;
};

type Section = "network" | "station";

type NavItem = {
  id: Section | "analytics" | "scenarios" | "settings";
  label: string;
  href?: string;
};

// Пункты без href ещё не реализованы — показываем их, чтобы было видно план продукта.
const NAV: NavItem[] = [
  { id: "network", label: "Карта сети", href: "/" },
  { id: "station", label: "Пульт станции" },
  { id: "analytics", label: "Эффективность" },
  { id: "scenarios", label: "Сценарии сбоев" },
  { id: "settings", label: "Настройки индекса" },
];

export function AppHeader({ current }: Props) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-6 border-line border-b bg-surface-1 px-4">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo />
        <span className="font-semibold text-sm text-white tracking-tight">
          Цифровая станция
        </span>
      </Link>

      <nav className="flex h-full items-stretch gap-1">
        {NAV.map((item) => (
          <NavLink key={item.id} item={item} isCurrent={item.id === current} />
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <span className="flex items-center gap-2 text-muted text-xs">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative size-2 rounded-full bg-emerald-400" />
          </span>
          Симулятор · онлайн
        </span>
        <LiveClock />
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
        className={`${base} border-sky-400 font-medium text-white`}
      >
        {item.label}
      </span>
    );
  }
  if (item.href == null) {
    return (
      <span
        title="В разработке"
        className={`${base} cursor-not-allowed border-transparent text-zinc-600`}
      >
        {item.label}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      className={`${base} border-transparent text-zinc-400 hover:text-white`}
    >
      {item.label}
    </Link>
  );
}

function Logo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 text-sky-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M7 3 4 21M17 3l3 18M6.4 8h11.2M5.6 13h12.8M4.8 18h14.4" />
    </svg>
  );
}
