"use client";

import type { ContentBlock, QuestionAsset } from "@/modules/questions";
import { blocksToPlainText } from "@/modules/questions";

interface QuestionBlockPreviewProps {
  blocks: ContentBlock[];
  assets?: QuestionAsset[];
  assetUrlMap?: Record<string, string>;
  className?: string;
}

export function QuestionBlockPreview({
  blocks,
  assets,
  assetUrlMap = {},
  className,
}: QuestionBlockPreviewProps) {
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.kind === "text") {
          return (
            <p
              key={index}
              className="mb-2 whitespace-pre-line text-xs leading-relaxed text-exam-text"
            >
              {block.value}
            </p>
          );
        }

        if (block.kind === "formula") {
          return (
            <code
              key={index}
              className="mb-2 block rounded bg-surface px-2 py-1 text-[11px] text-navy"
            >
              {block.latex}
            </code>
          );
        }

        if (block.kind === "image" || block.kind === "svg") {
          const asset = assets?.find((item) => item.id === block.assetId);
          const url =
            assetUrlMap[block.assetId] ??
            (asset?.path.startsWith("http") || asset?.path.startsWith("/")
              ? asset.path
              : undefined);

          if (url) {
            return (
              <img
                key={index}
                src={url}
                alt={asset?.alt ?? "Question diagram"}
                className="mb-2 max-h-40 rounded-lg border border-exam-border object-contain"
              />
            );
          }

          return (
            <div
              key={index}
              className="mb-2 rounded-lg border border-dashed border-exam-border px-3 py-2 text-[11px] text-exam-muted"
            >
              [{block.kind}: {block.assetId}]
            </div>
          );
        }

        if (block.kind === "table") {
          return (
            <div key={index} className="mb-2 overflow-x-auto">
              <table className="min-w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th
                        key={header}
                        className="border border-exam-border bg-surface px-2 py-1 text-left"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-exam-border px-2 py-1"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.kind === "code") {
          return (
            <pre
              key={index}
              className="mb-2 overflow-x-auto rounded bg-surface p-2 text-[11px]"
            >
              {block.value}
            </pre>
          );
        }

        return null;
      })}

      {blocks.length === 0 && (
        <span className="text-xs text-exam-muted">No content</span>
      )}
    </div>
  );
}

export function blocksPreviewText(blocks: ContentBlock[]) {
  return blocksToPlainText(blocks);
}
