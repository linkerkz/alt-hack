// Наряд ремонтной службе: что сделать с объектом и чеклист работ.
export type WorkOrder = {
  id: string;
  stationId: string;
  objectId: string;
  service: Service;
  title: string;
  description: string;
  status: WorkOrderStatus;
  createdAt: string;
  doneAt: string | null;
  resultNote: string | null;
  items: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  text: string;
  // Время отметки; null — пункт ещё не выполнен.
  doneAt: string | null;
};

// Выдан → в работе → работы выполнены (служба) → возвращён в эксплуатацию (ДСП).
export type WorkOrderStatus = "issued" | "in_progress" | "done" | "returned";

export type Service = "signalling" | "track" | "power";

export type ActionResult = { error: string | null };
