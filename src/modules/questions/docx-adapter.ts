import mammoth from "mammoth";
import { randomUUID } from "crypto";

export interface ExtractedDocxImage {
  id: string;
  filename: string;
  contentType: string;
  buffer: Buffer;
  extension: string;
}

export interface ExtractedDocxContent {
  text: string;
  html: string;
  images: ExtractedDocxImage[];
}

function extensionForContentType(contentType: string) {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("svg")) return ".svg";
  return ".bin";
}

export async function extractDocxContent(buffer: Buffer): Promise<ExtractedDocxContent> {
  const images: ExtractedDocxImage[] = [];

  const htmlResult = await mammoth.convertToHtml(
    { buffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const id = `img_${images.length + 1}`;
        const contentType = image.contentType;
        const imageBuffer = await image.read();
        const extension = extensionForContentType(contentType);
        const filename = `${id}${extension}`;

        images.push({
          id,
          filename,
          contentType,
          buffer: imageBuffer,
          extension,
        });

        return { src: `asset://${id}` };
      }),
    },
  );

  const textResult = await mammoth.extractRawText({ buffer });

  return {
    text: textResult.value.trim(),
    html: htmlResult.value.trim(),
    images,
  };
}

export function createImportStagingId() {
  return randomUUID();
}
