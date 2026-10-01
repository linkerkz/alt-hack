import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { TONE_GLYPH } from "@/components/ui/tone";
import type { ApprovalRequest } from "../approval";
import { ApprovalButton } from "./ApprovalButton";

// Ответ ДНЦ уже дан: отклонённый запрос можно вернуть на рассмотрение,
// пока станция не выбрала другой вариант; согласованный — висит, пока
// 2001 удержан и идут работы.
export function ApprovalResultCard({ request }: { request: ApprovalRequest }) {
  const { verdict, comment } = request;
  const isRejected = request.state === "rejected";

  return (
    <Card
      emphasis={isRejected ? "critical" : "default"}
      elevation="sm"
      className="flex w-[360px] max-w-full flex-col gap-1.5 px-4 py-3"
    >
      <div className="flex justify-between gap-2.5">
        <Kicker tone={verdict.tone}>
          {TONE_GLYPH[verdict.tone]} {verdict.label}
        </Kicker>
        <Kicker>{isRejected ? "ответ получен станцией" : request.code}</Kicker>
      </div>
      <h3 className="font-heading font-semibold text-[19px] leading-tight">
        {request.title}
      </h3>
      {(isRejected || comment != null) && (
        <p className="text-[13px] text-ink/80 italic">
          {comment == null ? "Без комментария" : `«${comment}»`}
        </p>
      )}
      <p className="text-[12.5px] text-ink/80">{request.outcome}</p>
      {isRejected && (
        <div>
          <ApprovalButton
            stationId={request.stationId}
            answer={{ kind: "reconsider" }}
            variant="ghost"
          >
            Вернуть на рассмотрение
          </ApprovalButton>
        </div>
      )}
    </Card>
  );
}
