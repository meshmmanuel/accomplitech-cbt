import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

export function getStagingDir(stagingId: string) {
  return path.join(STORAGE_ROOT, "import-staging", stagingId);
}

export function getExamAssetsDir(examId: string) {
  return path.join(STORAGE_ROOT, "question-assets", examId);
}

export async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

export function createStagingId() {
  return randomUUID();
}

export async function writeStagingAsset(
  stagingId: string,
  assetId: string,
  buffer: Buffer,
  extension: string,
) {
  const dir = getStagingDir(stagingId);
  await ensureDir(dir);
  const filename = `${assetId}${extension}`;
  const absolutePath = path.join(dir, filename);
  await writeFile(absolutePath, buffer);
  return filename;
}

export async function readStagingAsset(stagingId: string, filename: string) {
  return readFile(path.join(getStagingDir(stagingId), filename));
}

export async function finalizeStagingAssets(
  stagingId: string,
  examId: string,
  assets: Array<{ id: string; path: string }>,
) {
  const stagingDir = getStagingDir(stagingId);
  const examDir = getExamAssetsDir(examId);
  await ensureDir(examDir);

  const pathMap = new Map<string, string>();

  for (const asset of assets) {
    const source = path.join(stagingDir, path.basename(asset.path));
    const targetName = `${asset.id}${path.extname(asset.path)}`;
    const target = path.join(examDir, targetName);
    await rename(source, target).catch(async () => {
      // If already moved or missing, skip
      await readFile(source).then((buf) => writeFile(target, buf));
    });
    pathMap.set(asset.id, `question-assets/${examId}/${targetName}`);
  }

  return pathMap;
}

export function resolveAssetPublicPath(relativePath: string) {
  return `/api/assets/${relativePath.replace(/^\/+/, "")}`;
}
