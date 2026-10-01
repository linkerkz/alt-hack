import type { Role } from "./types";

export const ROLES: Role[] = [
  "dsp",
  "dscs",
  "dnc",
  "ds",
  "dsc",
  "shunter",
  "shunting_driver",
];

export const ROLE_LABEL: Record<Role, { short: string; full: string }> = {
  dsp: { short: "ДСП", full: "Дежурный по станции" },
  dscs: { short: "ДСЦС", full: "Станционный диспетчер" },
  dnc: { short: "ДНЦ", full: "Поездной диспетчер" },
  ds: { short: "ДС", full: "Начальник станции" },
  dsc: { short: "ДСЦ", full: "Маневровый диспетчер" },
  shunter: { short: "Составитель", full: "Составитель поездов" },
  shunting_driver: {
    short: "Машинист",
    full: "Машинист маневрового локомотива",
  },
};

export function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role === value);
}
