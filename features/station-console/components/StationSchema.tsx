import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Tag } from "@/components/ui/Tag";
import type { StationConsoleData } from "../queries";
import { consoleHref } from "../state";
import type { ConsoleState, Neighbors } from "../types";
import { SchemaIncidentObjects } from "./SchemaIncidentObjects";
import { SchemaInfrastructure } from "./SchemaInfrastructure";
import { SchemaLegend } from "./SchemaLegend";
import { SchemaTracks } from "./SchemaTracks";
import { SchemaTrains } from "./SchemaTrains";

type Props = {
  schema: StationConsoleData["schema"];
  incidentCode: string;
  state: ConsoleState;
  neighbors: Neighbors;
};

// Схема станции: пути, стрелки, поезда; при инциденте — фокус на горловине.
export function StationSchema({
  schema,
  incidentCode,
  state,
  neighbors,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5 px-5 pt-3 pb-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Heading note={schema.note}>Схема станции</Heading>
        {schema.focusAvailable && (
          <div className="ml-auto flex flex-none items-center gap-2.5">
            {schema.focus && (
              <Tag variant="outline">Фокус · {incidentCode}</Tag>
            )}
            <Link
              href={consoleHref(state, { focus: !state.focus })}
              scroll={false}
              className={buttonClass("ghost", "sm")}
            >
              {schema.focus ? "Показать всю станцию" : "Фокус на инциденте"}
            </Link>
          </div>
        )}
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
