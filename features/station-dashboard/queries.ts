import { toClock } from "@/lib/clock";
import { buildEfficiencyHistory } from "./mock";
import {
  buildAttentionItems,
  buildOperations,
  buildPlanProgress,
  buildStatistics,
  nowMinutes,
} from "./schedule";
import type { RadarTrain, StationDashboard, StationSnapshot } from "./types";

// trains — те же поезда станции, что и в радаре на дашборде (features/network-map
// getStationTrains): operations, план и статистика смены строятся по ним, а не мокаются.
export async function getStationDashboard(
  station: StationSnapshot,
  trains: RadarTrain[],
): Promise<StationDashboard> {
  const operations = buildOperations(trains);

  return {
    now: toClock(nowMinutes()),
    planProgress: buildPlanProgress(operations, station),
    operations,
    attentionItems: buildAttentionItems(station, operations),
    statistics: buildStatistics(trains, station),
    efficiencyHistory: buildEfficiencyHistory(station),
  };
}
