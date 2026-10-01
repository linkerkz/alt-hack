import { Heading } from "@/components/ui/Heading";
import type { StationConsoleData } from "../queries";
import type { Neighbors } from "../types";
import { FocusToggle } from "./FocusToggle";
import { SchemaIncidentObjects } from "./SchemaIncidentObjects";
import { SchemaInfrastructure } from "./SchemaInfrastructure";
import { SchemaLegend } from "./SchemaLegend";
import { SchemaTracks } from "./SchemaTracks";
import { SchemaTrains } from "./SchemaTrains";

type Props = {
  schema: StationConsoleData["schema"];
  incidentCode: string;
  neighbors: Neighbors;
};

// Схема станции: пути, стрелки, поезда; при инциденте — фокус на горловине.
export function StationSchema({ schema, incidentCode, neighbors }: Props) {
  return (
    <div className="flex flex-col gap-1.5 px-5 pt-3 pb-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading note={schema.note}>Схема станции</Heading>
        <FocusToggle incidentCode={incidentCode} />
      </div>
      <svg
        viewBox="0 0 1000 360"
        role="img"
        aria-label="Схема путей станции"
        className="block h-auto w-full"
      >
        <SchemaInfrastructure neighbors={neighbors} />
        <SchemaTracks schema={schema} />
        <SchemaIncidentObjects schema={schema} />
        <SchemaTrains schema={schema} />
      </svg>
      <SchemaLegend />
    </div>
  );
}
