import type { NextConfig } from "next";

const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.100.120",
    "*.ngrok-free.app",
    "*.ngrok.app",
    ...extraDevOrigins,
  ],
};

export default nextConfig;
