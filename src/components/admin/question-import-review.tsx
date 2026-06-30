"use client";

import { QuestionBlockPreview } from "@/components/admin/question-block-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { CanonicalQuestion } from "@/modules/questions";
import { blocksToPlainText, textBlock } from "@/modules/questions";
import { Trash2 } from "lucide-react";

interface QuestionImportReviewProps {
  questions: CanonicalQuestion[];
  assetUrlMap: Record<string, string>;
  onChange: (questions: CanonicalQuestion[]) => void;
}

const OPTION_IDS = ["A", "B", "C", "D"] as const;

export function QuestionImportReview({
  questions,
  assetUrlMap,
  onChange,
}: QuestionImportReviewProps) {
  const updateQuestion = (index: number, next: CanonicalQuestion) => {
    const copy = [...questions];
    copy[index] = next;
    onChange(copy);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
      {questions.map((question, index) => {
        const stemText = blocksToPlainText(question.blocks);

        return (
          <div
            key={index}
            className="rounded-xl border border-exam-border bg-surface p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-exam-muted">
                  Q{index + 1}
                </span>
                <Badge
                  status={
                    question.questionType === "multiple_choice"
                      ? "obj"
                      : "theory"
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(index)}
              >
                <Trash2 size={12} />
              </Button>
            </div>

            <Textarea
              label="Question stem"
              value={stemText}
              onChange={(e) =>
                updateQuestion(index, {
                  ...question,
                  blocks: [
                    textBlock(e.target.value),
                    ...question.blocks.filter((block) => block.kind !== "text"),
                  ],
                })
              }
              rows={3}
            />

            <QuestionBlockPreview
              blocks={question.blocks.filter((b) => b.kind !== "text")}
              assets={question.assets}
              assetUrlMap={assetUrlMap}
              className="mb-3"
            />

            <Input
              label="Marks"
              type="number"
              min={1}
              value={String(question.marks)}
              onChange={(e) =>
                updateQuestion(index, {
                  ...question,
                  marks: Number.parseInt(e.target.value, 10) || 1,
                })
              }
            />

            {question.questionType !== "multiple_choice" &&
              question.answer.kind === "fill_blank" && (
                <div className="mt-2 rounded-lg bg-gold-light px-3 py-2 text-[11px] text-amber-900">
                  <span className="font-semibold">Model answer: </span>
                  {question.answer.values.join("; ")}
                </div>
              )}

            {question.questionType === "multiple_choice" && question.options && (
              <div className="mt-2 space-y-2">
                {OPTION_IDS.map((optionId, optionIndex) => {
                  const option = question.options?.[optionIndex];
                  const optionText = option
                    ? blocksToPlainText(option.blocks)
                    : "";

                  return (
                    <Input
                      key={optionId}
                      label={`Option ${optionId}`}
                      value={optionText}
                      onChange={(e) => {
                        const options = [...(question.options ?? [])];
                        options[optionIndex] = {
                          id: optionId,
                          blocks: [textBlock(e.target.value)],
                        };
                        updateQuestion(index, { ...question, options });
                      }}
                    />
                  );
                })}

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-exam-text">
                    Correct answer
                  </p>
                  <div className="flex gap-2">
                    {OPTION_IDS.map((optionId) => (
                      <button
                        key={optionId}
                        type="button"
                        onClick={() =>
                          updateQuestion(index, {
                            ...question,
                            answer: { kind: "single", value: optionId },
                          })
                        }
                        className={`h-8 w-8 rounded-lg border text-xs font-bold ${
                          question.answer.kind === "single" &&
                          question.answer.value === optionId
                            ? "border-navy bg-navy text-exam-white"
                            : "border-exam-border text-exam-muted"
                        }`}
                      >
                        {optionId}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
