"use client";

import { useState } from "react";
import {
  createId,
  deleteCharacter,
  deleteCharacterField,
  upsertCharacter,
  upsertCharacterField,
  useStories,
  type CharacterField,
} from "@/lib/story-store";
import { AutoTextarea } from "@/components/auto-textarea";

const FIELD_TYPES: CharacterField["type"][] = ["text", "number", "date", "select", "boolean"];

/**
 * Full-page Character Editor shown in the writing area while the mode is open.
 * A dynamic table: rows are characters, columns are the story's character
 * fields — rows and columns can be added or removed, and every cell is editable.
 */
export function CharacterEditor({
  storyId,
  onClose,
}: {
  storyId: string;
  onClose: () => void;
}) {
  const story = useStories().find((s) => s.id === storyId);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<CharacterField["type"]>("text");

  if (!story) return null;

  const addField = () => {
    if (!fieldLabel.trim()) return;
    const key =
      fieldLabel
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "field";
    upsertCharacterField(storyId, {
      id: createId(),
      key,
      label: fieldLabel.trim(),
      type: fieldType,
    });
    setFieldLabel("");
  };

  const addCharacter = () =>
    upsertCharacter(storyId, { id: createId(), name: "", role: "", summary: "", data: {} });

  return (
    <section className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-mist pb-2">
        <h1 className="text-xl font-bold text-ink">▤ Character Editor</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addCharacter}
            className="cursor-pointer text-sm font-semibold text-lilac"
          >
            + Character
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Back to the writing area"
            className="cursor-pointer rounded-md border border-lilac px-2 py-0.5 text-xs font-semibold text-lilac hover:bg-lilac-soft"
          >
            Close
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto py-3">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="text-left text-ink-dim">
              <th className="w-10 py-1 pr-2 font-semibold">No.</th>
              <th className="min-w-[10rem] py-1 pr-2 font-semibold">Name</th>
              <th className="min-w-[8rem] py-1 pr-2 font-semibold">Role</th>
              {story.characterFields.map((f) => (
                <th key={f.id} className="min-w-[8rem] py-1 pr-2">
                  <span className="flex items-center gap-1">
                    <input
                      value={f.label}
                      onChange={(e) =>
                        upsertCharacterField(storyId, { ...f, label: e.target.value })
                      }
                      aria-label="Column label"
                      title="Rename column"
                      className="min-w-0 flex-1 rounded bg-transparent px-1 font-semibold outline-none hover:bg-lilac-mist focus:bg-white focus:ring-1 focus:ring-lilac"
                    />
                    <button
                      type="button"
                      onClick={() => deleteCharacterField(storyId, f.id)}
                      aria-label={`Remove column ${f.label}`}
                      title="Remove column"
                      className="shrink-0 cursor-pointer text-ink-dim hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                </th>
              ))}
              <th className="w-6" />
            </tr>
          </thead>
          <tbody>
            {story.characters.map((c, i) => (
              <tr key={c.id} className="border-t border-mist align-top">
                <td className="py-1.5 pr-2 text-ink-dim">{i + 1}</td>
                <td className="py-1.5 pr-2">
                  <AutoTextarea
                    value={c.name}
                    onChange={(e) => upsertCharacter(storyId, { ...c, name: e.target.value })}
                    placeholder="Name"
                    aria-label="Character name"
                    className="w-full bg-transparent text-ink outline-none"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <AutoTextarea
                    value={c.role}
                    onChange={(e) => upsertCharacter(storyId, { ...c, role: e.target.value })}
                    placeholder="Role"
                    aria-label="Character role"
                    className="w-full bg-transparent text-ink outline-none"
                  />
                </td>
                {story.characterFields.map((f) => (
                  <td key={f.id} className="py-1.5 pr-2">
                    <AutoTextarea
                      value={c.data[f.key] ?? ""}
                      onChange={(e) =>
                        upsertCharacter(storyId, {
                          ...c,
                          data: { ...c.data, [f.key]: e.target.value },
                        })
                      }
                      placeholder={f.label}
                      aria-label={f.label}
                      className="w-full bg-transparent text-ink outline-none"
                    />
                  </td>
                ))}
                <td className="py-1.5">
                  <button
                    type="button"
                    onClick={() => deleteCharacter(storyId, c.id)}
                    aria-label="Delete character row"
                    title="Remove row"
                    className="cursor-pointer text-ink-dim hover:text-red-500"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3 + story.characterFields.length + 1} className="py-2">
                <button
                  type="button"
                  onClick={addCharacter}
                  className="cursor-pointer text-sm font-semibold text-lilac hover:text-lilac-deep"
                >
                  + Add row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        {story.characters.length === 0 && (
          <p className="mt-3 text-sm text-ink-dim">No characters yet — add a row to begin.</p>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-mist pt-2">
        <span className="text-sm font-semibold text-ink-dim">New column:</span>
        <input
          value={fieldLabel}
          onChange={(e) => setFieldLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addField();
          }}
          placeholder="Column label"
          className="min-w-0 flex-1 rounded-md border border-mist bg-white px-2 py-1 text-sm outline-none"
        />
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value as CharacterField["type"])}
          aria-label="Column type"
          className="rounded-md border border-mist bg-white px-1 text-sm"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addField}
          className="cursor-pointer rounded-md bg-lilac px-3 py-1 text-sm font-semibold text-white hover:bg-lilac-deep"
        >
          Add column
        </button>
      </footer>
    </section>
  );
}