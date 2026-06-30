import type { ExamType } from "@prisma/client";
import {
  createStagingId,
  resolveAssetPublicPath,
  writeStagingAsset,
} from "@/lib/question-assets";
import { AppError } from "@/lib/errors";
import { extractDocxContent } from "@/modules/questions/docx-adapter";
import {
  buildImportPreview,
  isPlaceholderQuestion,
  type CanonicalQuestion,
  type WordImportPreview,
} from "@/modules/questions";
import { geminiQuestionImportService } from "@/services/gemini-question-import.service";

function attachStagingAssets(
  questions: CanonicalQuestion[],
  stagingId: string,
  imageFilenames: Map<string, string>,
): CanonicalQuestion[] {
  return questions.map((question) => {
    const assets = question.assets?.map((asset) => {
      const filename = imageFilenames.get(asset.id);
      if (!filename) return asset;
      return {
        ...asset,
        path: `import-staging/${stagingId}/${filename}`,
        kind: asset.kind ?? "image",
      };
    });

    return assets?.length ? { ...question, assets } : question;
  });
}

function rejectPlaceholderResults(questions: CanonicalQuestion[]) {
  if (questions.length === 0) return;

  const placeholderCount = questions.filter(isPlaceholderQuestion).length;
  if (placeholderCount / questions.length > 0.5) {
    throw new AppError(
      "Gemini could not extract usable question text from the document",
      422,
    );
  }
}

async function extractQuestions(
  extracted: Awaited<ReturnType<typeof extractDocxContent>>,
  examType: ExamType,
): Promise<CanonicalQuestion[]> {
  const questions = await geminiQuestionImportService.extractQuestions(
    extracted,
    examType,
  );

  rejectPlaceholderResults(questions);

  return questions.filter((question) => !isPlaceholderQuestion(question));
}

export class QuestionImportService {
  async processWordDocument(
    examId: string,
    examType: ExamType,
    buffer: Buffer,
  ): Promise<WordImportPreview> {
    if (!buffer.length) {
      throw new AppError("Uploaded file is empty", 400);
    }

    const extracted = await extractDocxContent(buffer);
    if (!extracted.text && !extracted.html) {
      throw new AppError("Could not extract any text from the Word document", 422);
    }

    const stagingId = createStagingId();
    const imageFilenames = new Map<string, string>();

    for (const image of extracted.images) {
      const filename = await writeStagingAsset(
        stagingId,
        image.id,
        image.buffer,
        image.extension,
      );
      imageFilenames.set(image.id, filename);
    }

    const rawQuestions = await extractQuestions(extracted, examType);

    if (rawQuestions.length === 0) {
      throw new AppError("No questions were detected in the document", 422);
    }

    const questions = attachStagingAssets(rawQuestions, stagingId, imageFilenames);
    const preview = buildImportPreview(questions, [], examType);

    const assetPreviews = extracted.images.map((image) => ({
      id: image.id,
      kind: "image",
      url: resolveAssetPublicPath(
        `import-staging/${stagingId}/${imageFilenames.get(image.id) ?? image.filename}`,
      ),
    }));

    return {
      ...preview,
      stagingId,
      assetPreviews,
    };
  }
}

export const questionImportService = new QuestionImportService();
