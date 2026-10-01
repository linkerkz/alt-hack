"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { ApprovalButton } from "./ApprovalButton";

type Props = { stationId: string };

// Комментарий длиннее не примет сервер.
const COMMENT_LIMIT = 200;

// Ответ ДНЦ на запрос на согласование: комментарий для станции и решение.
// Один и тот же на пульте станции и в карточке запроса на карте.
export function ApprovalForm({ stationId }: Props) {
  const [comment, setComment] = useState("");
  const answerComment = comment.trim() === "" ? null : comment;

  return (
    <div className="flex flex-col gap-2.5">
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
  );
}
