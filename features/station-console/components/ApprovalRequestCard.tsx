"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Kicker } from "@/components/ui/Kicker";
import { TONE_GLYPH } from "@/components/ui/tone";
import type { ApprovalRequest } from "../approval";
import { ApprovalButton } from "./ApprovalButton";
import { ApprovalIndex } from "./ApprovalIndex";
import { ApprovalTrains } from "./ApprovalTrains";

// Комментарий длиннее не примет сервер.
const COMMENT_LIMIT = 200;

// Запрос ДСЦС ждёт ответа ДНЦ: слева — что меняется у поездов, справа —
// индекс станции, комментарий и решение.
export function ApprovalRequestCard({ request }: { request: ApprovalRequest }) {
  const [comment, setComment] = useState("");
  const { stationId, verdict } = request;
  const answerComment = comment.trim() === "" ? null : comment;

  return (
    <Card
      emphasis="accent"
      elevation="md"
      className="grid w-[720px] max-w-full grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-x-6 gap-y-2.5 px-4.5 py-3.5"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap justify-between gap-x-2.5 gap-y-1">
          <Kicker tone="accent" className="whitespace-nowrap">
            {TONE_GLYPH[verdict.tone]} {verdict.label}
          </Kicker>
          <Kicker className="whitespace-nowrap">{request.from}</Kicker>
        </div>
        <h3 className="font-heading font-semibold text-[21px] leading-tight">
          {request.title}
        </h3>
        <p className="text-[12.5px] text-ink/80">{request.reason}</p>
        <ApprovalTrains trains={request.trains} />
        <p className="text-[11.5px] text-muted">{request.unchanged}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-2.5">
        <ApprovalIndex index={request.index} />
        <Field
          label="Комментарий для станции"
          placeholder="Необязательно"
          value={comment}
          maxLength={COMMENT_LIMIT}
          onChange={(event) => setComment(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <ApprovalButton
            stationId={stationId}
            answer={{ kind: "approve", comment: answerComment }}
            variant="primary"
          >
            Согласовать
          </ApprovalButton>
          <ApprovalButton
            stationId={stationId}
            answer={{ kind: "reject", comment: answerComment }}
          >
            Отклонить
          </ApprovalButton>
        </div>
      </div>
    </Card>
  );
}
