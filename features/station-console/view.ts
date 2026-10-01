import type { ChosenOption, ConsoleTab } from "./types";

// Вид пульта в URL: вкладка, фокус, панель и вариант, который ДСЦС пока
// только смотрит. Вкладка, фокус и панель переключаются в браузере без
// запроса к серверу: данные от них не зависят. Вариант меняет расчёты —
// по нему пульт идёт на сервер.

export type ConsoleView = {
  tab: ConsoleTab;
  // Фокус на инциденте: остальная станция приглушена.
  focus: boolean;
  // Правая панель открыта; свёрнутая — освобождает место схеме.
  panel: boolean;
};

export type ViewPatch = Partial<ConsoleView> & { option?: ChosenOption };

// Битые и пустые параметры заменяем умолчаниями. До инцидента вкладки
// инцидента нет; после — она открыта по умолчанию.
export function parseView(
  params: URLSearchParams,
  hasIncident: boolean,
): ConsoleView {
  const tab = params.get("tab");
  return {
    tab: hasIncident && tab !== "overview" ? "incident" : "overview",
    focus: params.get("focus") !== "off",
    panel: params.get("panel") !== "off",
  };
}

// Ссылка на тот же пульт с изменёнными полями вида; остальное в URL — как было.
export function viewHref(params: URLSearchParams, patch: ViewPatch) {
  const query = new URLSearchParams(params);
  if (patch.option != null) query.set("opt", patch.option);
  if (patch.tab != null) query.set("tab", patch.tab);
  if (patch.focus != null) setFlag(query, "focus", patch.focus);
  if (patch.panel != null) setFlag(query, "panel", patch.panel);
  return `?${query}`;
}

// Включённое — по умолчанию, в URL пишем только «off».
function setFlag(query: URLSearchParams, name: string, isOn: boolean) {
  if (isOn) query.delete(name);
  else query.set(name, "off");
}
