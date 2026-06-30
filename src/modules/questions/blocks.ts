import type { ContentBlock, QuestionOption } from "./types";

export function textBlock(value: string): ContentBlock {
  return { kind: "text", value: value.trim() };
}

export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.kind === "text") return block.value;
      if (block.kind === "formula") return block.latex;
      if (block.kind === "code") return block.value;
      if (block.kind === "table") {
        return [block.headers.join(" | "), ...block.rows.map((r) => r.join(" | "))].join(
          "\n",
        );
      }
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function legacyOptionsToCanonical(
  options: unknown,
): QuestionOption[] | undefined {
  if (!Array.isArray(options) || options.length === 0) return undefined;

  const letters = ["A", "B", "C", "D"] as const;

  if (typeof options[0] === "string") {
    return options.map((value, index) => ({
      id: letters[index] ?? String.fromCharCode(65 + index),
      blocks: [textBlock(String(value))],
    }));
  }

  return options as QuestionOption[];
}

export function canonicalOptionsToLegacyStrings(
  options: QuestionOption[] | undefined,
): string[] | undefined {
  if (!options?.length) return undefined;
  return options.map((option) => blocksToPlainText(option.blocks));
}

export function firstAssetPath(
  blocks: ContentBlock[],
  assets?: Array<{ id: string; path: string }>,
): string | null {
  for (const block of blocks) {
    if (block.kind === "image" || block.kind === "svg") {
      const asset = assets?.find((item) => item.id === block.assetId);
      return asset?.path ?? null;
    }
  }
  return null;
}
