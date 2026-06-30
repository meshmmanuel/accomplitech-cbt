"use client";

import { QuestionBlockPreview } from "@/components/admin/question-block-preview";
import type { ContentBlock, QuestionAsset } from "@/modules/questions";

interface StudentQuestionStemProps {
  blocks: ContentBlock[];
  assets?: QuestionAsset[];
  assetUrlMap?: Record<string, string>;
}

export function StudentQuestionStem({
  blocks,
  assets,
  assetUrlMap,
}: StudentQuestionStemProps) {
  return (
    <QuestionBlockPreview
      blocks={blocks}
      assets={assets}
      assetUrlMap={assetUrlMap}
      className="mb-5.5 text-base leading-relaxed"
    />
  );
}
