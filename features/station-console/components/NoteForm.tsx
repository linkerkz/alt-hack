"use client";

import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { runCommand } from "../actions";

type Props = { stationId: string };

// Пути станции: поручение можно привязать к одному из них.
const TRACKS = [1, 2, 3, 4, 5, 6];

// Длиннее не примет сервер.
const NOTE_LIMIT = 200;

// Своё поручение бригаде: то, чего нет в плане путей. Путь — по желанию,
// становится началом текста: «Путь 4: …».
export function NoteForm({ stationId }: Props) {
  const [text, setText] = useState("");
  const [track, setTrack] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function send(event: FormEvent) {
    event.preventDefault();
    const note = track === "" ? text : `Путь ${track}: ${text}`;
    startTransition(async () => {
      const result = await runCommand(stationId, { kind: "note", text: note });
      setError(result.error);
      if (result.error == null) setText("");
    });
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-1.5">
      <span className="text-[12px] text-ink/70">Своё поручение</span>
      <div className="flex gap-1.5">
        <select
          value={track}
          onChange={(event) => setTrack(event.target.value)}
          aria-label="Путь"
          className="min-h-9 rounded border border-line bg-transparent px-1.5 text-[13px] outline-none hover:border-ink/45 focus-visible:border-accent"
        >
          <option value="">Путь —</option>
          {TRACKS.map((number) => (
            <option key={number} value={number}>
              Путь {number}
            </option>
          ))}
        </select>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={NOTE_LIMIT}
          placeholder="Что сделать бригаде"
          aria-label="Что сделать бригаде"
          className="min-h-9 min-w-0 flex-1 rounded border border-line bg-transparent px-2.5 text-[13px] outline-none hover:border-ink/45 focus-visible:border-accent"
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={isPending || text.trim() === ""}
        className="self-start"
      >
        {isPending ? "Отправляем…" : "Отправить на пейджер"}
      </Button>
      {error != null && (
        <span role="alert" className="text-[12px] text-critical">
          {error}
        </span>
      )}
    </form>
  );
}
