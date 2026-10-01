import { buildMockDashboard } from "./mock";
import type { StationDashboard, StationSnapshot } from "./types";

export async function getStationDashboard(
  station: StationSnapshot,
): Promise<StationDashboard> {
  return buildMockDashboard(station);
}
