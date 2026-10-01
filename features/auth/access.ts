import type { CurrentUser, Role, Scope } from "./types";

// Все права на экраны — здесь. RLS в базе закрывает данные, а эти правила
// решают, что показать и куда пустить.

type StationScope = { id: string; dispatchAreaId: string };

// Роли, привязанные к одной станции.
const STATION_ROLES: Role[] = ["dsp", "dscs", "ds", "dsc"];

// Карта сети: ДНЦ работает на ней, остальные смотрят на соседей.
const NETWORK_ROLES: Role[] = ["dnc", "dsp", "dscs", "ds"];

export function canOpenNetwork(user: CurrentUser) {
  return NETWORK_ROLES.includes(user.role);
}

export function canOpenStation(user: CurrentUser, station: StationScope) {
  if (user.role === "dnc") {
    return station.dispatchAreaId === user.dispatchAreaId;
  }
  if (STATION_ROLES.includes(user.role)) return station.id === user.stationId;
  return false;
}

// Стартовый экран роли; null — экрана для роли ещё нет.
export function homePath(user: CurrentUser) {
  if (user.role === "dnc") return "/";
  return ownConsolePath(user);
}

// Пульт своей станции; null — у роли нет своей станции (ДНЦ выбирает на карте).
export function ownConsolePath(user: CurrentUser) {
  if (STATION_ROLES.includes(user.role) && user.stationId != null) {
    return `/stations/${user.stationId}`;
  }
  return null;
}

// Dashboard своей станции; null — у роли нет своей станции (ДНЦ выбирает на карте).
export function ownDashboardPath(user: CurrentUser) {
  if (STATION_ROLES.includes(user.role) && user.stationId != null) {
    return `/dashboard/${user.stationId}`;
  }
  return null;
}

// Зона ответственности: круг ДНЦ или своя станция; null — зоны у роли нет.
export function scopeOf(user: CurrentUser): Scope | null {
  if (user.role === "dnc" && user.dispatchAreaId != null) {
    return { kind: "dispatch-area", dispatchAreaId: user.dispatchAreaId };
  }
  if (STATION_ROLES.includes(user.role) && user.stationId != null) {
    return { kind: "station", stationId: user.stationId };
  }
  return null;
}
