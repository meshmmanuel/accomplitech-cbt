/** Turn mammoth HTML into line-oriented text with bullets and paragraph breaks */
export function htmlToStructuredText(html: string): string {
  if (!html.trim()) return "";

  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#8226;/g, "•")
    .replace(/\u00a0/g, " ");

  return preprocessPlainText(text);
}

/** Normalize plain text from mammoth extractRawText */
export function preprocessPlainText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\t[•\u2022\u00b7]\t/g, "\n• ")
    .replace(/\t[•\u2022\u00b7]\s*/g, "\n• ")
    .replace(/([^\n])\s*•\s*/g, "$1\n• ")
    .replace(/([^\n])\s+(\d+)\.\s+(?=[A-Z])/g, "\n$2. ")
    .replace(/([.?!])\s+(Answer:)/gi, "$1\n$2")
    .replace(/(Answer:\s*[A-D])\s+(?=[A-Z(])/gi, "$1\n• ")
    .replace(
      /(?:Objective Questions|Essay Questions|Theory\s*\/\s*Essay Questions)\s+(?=[A-Z])/gi,
      (match) => `${match.trimEnd()}\n• `,
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Pick the richest text source for deterministic parsers */
export function bestTextForParsing(text: string, html: string): string {
  const plain = preprocessPlainText(text);
  const structured = htmlToStructuredText(html);

  if (!structured) return plain;
  if (!plain) return structured;

  const plainLines = plain.split("\n").filter(Boolean).length;
  const structuredLines = structured.split("\n").filter(Boolean).length;
  const plainBullets = (plain.match(/•/g) ?? []).length;
  const structuredBullets = (structured.match(/•/g) ?? []).length;

  if (structuredBullets > plainBullets) return structured;
  if (structuredLines > plainLines * 1.2) return structured;
  if (plainBullets > structuredBullets) return plain;

  return structured.length > plain.length ? structured : plain;
}
