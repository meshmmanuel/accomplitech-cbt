import {
  GoogleGenerativeAI,
  type Part,
} from "@google/generative-ai";
import type { ExamType } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { getGeminiApiKey, getGeminiModel } from "@/lib/gemini-config";
import { normalizeRawAiQuestion } from "@/modules/questions/normalize-ai-output";
import type { CanonicalQuestion } from "@/modules/questions/types";
import { canonicalQuestionSchema } from "@/modules/questions/schemas";
import type { ExtractedDocxContent } from "@/modules/questions/docx-adapter";

const SYSTEM_PROMPT = `You are an exam question extraction engine for ExamLink CBT.
Convert the supplied Word document into canonical JSON questions.

Output ONLY valid JSON: { "questions": [ ... ] }

Every question MUST include non-empty question text in "blocks" OR "question"/"stem"/"text".

You may receive embedded document images — use them to extract diagram, graph, and figure content accurately.

## Example multiple_choice
{
  "questionType": "multiple_choice",
  "marks": 1,
  "blocks": [{ "kind": "text", "value": "What is 2 + 2?" }],
  "options": [
    { "id": "A", "blocks": [{ "kind": "text", "value": "3" }] },
    { "id": "B", "blocks": [{ "kind": "text", "value": "4" }] },
    { "id": "C", "blocks": [{ "kind": "text", "value": "5" }] },
    { "id": "D", "blocks": [{ "kind": "text", "value": "6" }] }
  ],
  "answer": { "kind": "single", "value": "B" }
}

## Example short_answer
{
  "questionType": "short_answer",
  "marks": 2,
  "blocks": [{ "kind": "text", "value": "Define physics." }],
  "answer": { "kind": "fill_blank", "values": ["Physics is the study of matter and energy."] }
}

## questionType (use EXACTLY these strings)
- "multiple_choice" — MCQ with options A–D
- "short_answer" — definitions, state/name/list, brief answers (1–3 sentences)
- "calculation" — numeric problems with formula + worked answer
- "label_diagram" — draw/label/sketch questions (pendulum, ray diagram, graph axes, etc.)
- "essay" — long multi-paragraph answers only

Do NOT invent types like "definition", "theory", "obj", "descriptive", or "open_ended".
Map them: definition → short_answer, calculation problem → calculation, draw/label → label_diagram.

## Answer format (required object, never a plain string)
- multiple_choice: { "kind": "single", "value": "A"|"B"|"C"|"D" }
- short_answer / calculation / label_diagram: { "kind": "fill_blank", "values": ["model answer text"] }
- essay: { "kind": "essay", "value": null }

If the document has "Question ... Answer: ..." pairs (practice worksheet), emit one question per pair.
Put the question text in blocks. Put the answer text in answer.values[0].

## blocks
- { "kind": "text", "value": "..." } for question stem
- { "kind": "formula", "latex": "..." } for equations (LaTeX)
- { "kind": "image", "assetId": "img_N" } when asset://img_N appears

## Other rules
- marks: integer > 0 (default 1 for MCQ, 2 for short_answer, 3 for calculation, 5 for label_diagram, 10 for essay)
- Preserve document order
- Do not skip questions
- Do not invent content not in the document
- For ASCII diagrams in the source, keep description in the text block
- Section A objective papers → multiple_choice; Section B theory → essay / short_answer / calculation as appropriate`;

function examTypeHint(examType: ExamType) {
  if (examType === "OBJECTIVE") {
    return "Exam type: OBJECTIVE only — output multiple_choice questions. Convert others to MCQ only if options exist; otherwise skip.";
  }
  if (examType === "THEORY") {
    return "Exam type: THEORY — use short_answer, calculation, label_diagram, and essay. No multiple_choice.";
  }
  return "Exam type: MIXED — use the appropriate type per question.";
}

function buildUserPrompt(content: ExtractedDocxContent, examType: ExamType) {
  const imageManifest =
    content.images.length > 0
      ? content.images
          .map(
            (img) =>
              `- ${img.id}: embedded image (${img.contentType}), reference as asset://${img.id}`,
          )
          .join("\n")
      : "No embedded images.";

  return `${examTypeHint(examType)}

## Embedded images
${imageManifest}

## Document HTML
${content.html.slice(0, 120_000)}

## Document plain text
${content.text.slice(0, 80_000)}`;
}

function buildContentParts(
  content: ExtractedDocxContent,
  examType: ExamType,
): Part[] {
  const parts: Part[] = [{ text: buildUserPrompt(content, examType) }];

  for (const image of content.images) {
    parts.push({
      inlineData: {
        mimeType: image.contentType,
        data: image.buffer.toString("base64"),
      },
    });
    parts.push({
      text: `[Document image ${image.id} — reference as asset://${image.id} in question blocks when relevant]`,
    });
  }

  return parts;
}

function parseGeminiJson(raw: string): { questions?: unknown[] } {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const jsonText = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(jsonText) as { questions?: unknown[] };
  } catch {
    throw new AppError("Gemini returned invalid JSON", 502);
  }
}

function formatGeminiError(error: unknown): AppError {
  const message = error instanceof Error ? error.message : "Gemini request failed";

  if (message.includes("429") || message.includes("quota") || message.includes("limit: 0")) {
    const model = getGeminiModel();
    return new AppError(
      `Gemini quota exceeded for "${model}". ` +
        "gemini-2.0-flash was shut down — use gemini-2.5-flash in .env. " +
        "Check limits at https://aistudio.google.com/apikey and retry in a minute.",
      429,
    );
  }

  return new AppError(`Gemini extraction failed: ${message}`, 502);
}

export class GeminiQuestionImportService {
  async extractQuestions(
    content: ExtractedDocxContent,
    examType: ExamType,
  ): Promise<CanonicalQuestion[]> {
    const genAI = new GoogleGenerativeAI(getGeminiApiKey());
    const model = genAI.getGenerativeModel({
      model: getGeminiModel(),
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    let raw: string;
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: buildContentParts(content, examType) }],
      });
      raw = result.response.text();
    } catch (error) {
      throw formatGeminiError(error);
    }

    if (!raw.trim()) {
      throw new AppError("Gemini returned an empty response", 502);
    }

    const parsed = parseGeminiJson(raw);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new AppError("No questions were detected in the document", 422);
    }

    const questions: CanonicalQuestion[] = [];
    const errors: string[] = [];

    parsed.questions.forEach((item, index) => {
      const normalized = normalizeRawAiQuestion(item);
      if (!normalized) {
        errors.push(`Question ${index + 1}: missing question text`);
        return;
      }

      const result = canonicalQuestionSchema.safeParse(normalized);
      if (result.success) {
        questions.push(result.data);
      } else {
        errors.push(
          `Question ${index + 1}: ${result.error.issues[0]?.message ?? "invalid"}`,
        );
      }
    });

    if (questions.length === 0) {
      throw new AppError(
        errors.slice(0, 3).join("; ") || "Gemini output could not be validated",
        422,
      );
    }

    if (errors.length > 0) {
      console.warn("Gemini import partial validation warnings:", errors);
    }

    return questions;
  }
}

export const geminiQuestionImportService = new GeminiQuestionImportService();
