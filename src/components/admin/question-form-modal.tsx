"use client";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { apiPatch, apiPost } from "@/lib/api-client";
import {
  blocksToPlainText,
  textBlock,
  type ContentBlock,
  type CreateQuestionInput,
  type QuestionAsset,
  type QuestionBankItem,
} from "@/modules/questions";
import { AlertCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

interface QuestionFormModalProps {
  examId: string;
  question?: QuestionBankItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const OPTION_IDS = ["A", "B", "C", "D"] as const;

export function QuestionFormModal({
  examId,
  question,
  onClose,
  onSuccess,
}: QuestionFormModalProps) {
  const isEdit = Boolean(question);
  const [questionType, setQuestionType] = useState<"obj" | "theory">("obj");
  const [text, setText] = useState("");
  const [marks, setMarks] = useState("2");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("A");
  const [topic, setTopic] = useState("");
  const [preservedBlocks, setPreservedBlocks] = useState<ContentBlock[]>([]);
  const [preservedAssets, setPreservedAssets] = useState<
    QuestionAsset[] | undefined
  >();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!question) {
      setQuestionType("obj");
      setText("");
      setMarks("2");
      setOptions(["", "", "", ""]);
      setAnswer("A");
      setTopic("");
      setPreservedBlocks([]);
      setPreservedAssets(undefined);
      setError("");
      return;
    }

    setQuestionType(question.legacyType);
    setText(blocksToPlainText(question.blocks));
    setMarks(String(question.marks));
    setTopic(question.topic ?? "");
    setPreservedBlocks(question.blocks.filter((block) => block.kind !== "text"));
    setPreservedAssets(question.assets);

    if (question.options?.length) {
      const optionTexts = question.options.map((option) =>
        blocksToPlainText(option.blocks),
      );
      setOptions(
        OPTION_IDS.map((_, index) => optionTexts[index] ?? ""),
      );
    } else {
      setOptions(["", "", "", ""]);
    }

    if (question.answer.kind === "single") {
      setAnswer(question.answer.value);
    } else {
      setAnswer("A");
    }

    setError("");
  }, [question]);

  const buildPayload = (): CreateQuestionInput => {
    const stemBlocks =
      preservedBlocks.length > 0 && isEdit
        ? [textBlock(text.trim()), ...preservedBlocks]
        : [textBlock(text.trim())];

    if (questionType === "theory") {
      return {
        questionType: "essay",
        marks: Number.parseInt(marks, 10),
        blocks: stemBlocks,
        answer: { kind: "essay", value: null },
        topic: topic.trim() || undefined,
        assets: preservedAssets,
      };
    }

    return {
      questionType: "multiple_choice",
      marks: Number.parseInt(marks, 10),
      blocks: stemBlocks,
      options: OPTION_IDS.map((id, index) => ({
        id,
        blocks: [textBlock(options[index].trim())],
      })),
      answer: { kind: "single", value: answer },
      topic: topic.trim() || undefined,
      assets: preservedAssets,
    };
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = buildPayload();
    const result = isEdit && question
      ? await apiPatch<QuestionBankItem>(
          `/api/exams/${examId}/questions/${question.id}`,
          payload,
        )
      : await apiPost<QuestionBankItem>(
          `/api/exams/${examId}/questions`,
          payload,
        );

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Save failed");
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit Question" : "Add Question"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-semibold text-exam-text">
            Question Type
          </label>
          <div className="flex gap-2">
            {(["obj", "theory"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setQuestionType(type)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  questionType === type
                    ? "border-navy bg-indigo-50 text-navy"
                    : "border-exam-border text-exam-muted"
                }`}
              >
                {type === "obj" ? "Objective" : "Theory"}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          required
        />
        {isEdit && preservedBlocks.length > 0 && (
          <p className="-mt-2 mb-3.5 text-[11px] text-exam-muted">
            This question includes tables, images, or formulas. Editing the
            text above updates the stem; other content is preserved.
          </p>
        )}
        <Input
          label="Marks"
          type="number"
          min={1}
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          required
        />
        <Input
          label="Topic (optional)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        {questionType === "obj" && (
          <>
            {OPTION_IDS.map((id, index) => (
              <Input
                key={id}
                label={`Option ${id}`}
                value={options[index]}
                onChange={(e) => {
                  const next = [...options];
                  next[index] = e.target.value;
                  setOptions(next);
                }}
                required
              />
            ))}
            <div className="mb-3.5">
              <label className="mb-1.5 block text-xs font-semibold text-exam-text">
                Correct Answer
              </label>
              <div className="flex gap-2">
                {OPTION_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAnswer(id)}
                    className={`h-9 w-9 rounded-lg border text-xs font-bold ${
                      answer === id
                        ? "border-navy bg-navy text-exam-white"
                        : "border-exam-border text-exam-muted"
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
