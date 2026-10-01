import type { ApprovalRequest } from "../approval";
import { ApprovalRequestCard } from "./ApprovalRequestCard";
import { ApprovalResultCard } from "./ApprovalResultCard";

// Запросы на согласование станций круга ДНЦ: ждущие ответа — крупно.
export function ApprovalRequests({
  requests,
}: {
  requests: ApprovalRequest[];
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      {requests.map((request) =>
        request.state === "pending" ? (
          <ApprovalRequestCard key={request.stationId} request={request} />
        ) : (
          <ApprovalResultCard key={request.stationId} request={request} />
        ),
      )}
    </div>
  );
}
