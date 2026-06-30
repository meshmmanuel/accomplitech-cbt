import os from "node:os";

export function getLanIpAddress(): string | null {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }

  return null;
}

export function resolveServerPort(): number {
  const raw = process.env.PORT ?? "3000";
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 3000;
}

export function buildServerBaseUrl(request?: Request): string {
  const configured = process.env.PUBLIC_SERVER_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (request) {
    const url = new URL(request.url);
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return `${url.protocol}//${url.host}`;
    }
  }

  const port = resolveServerPort();
  const lanIp = getLanIpAddress();
  if (lanIp) {
    return `http://${lanIp}:${port}`;
  }

  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  return `http://localhost:${port}`;
}

export function getServerInfo(request?: Request) {
  const port = resolveServerPort();
  const lanIp = getLanIpAddress();
  const baseUrl = buildServerBaseUrl(request);

  return {
    baseUrl,
    studentLoginUrl: `${baseUrl}/student/login`,
    lanIp,
    port,
    hostname: lanIp ?? "localhost",
  };
}
