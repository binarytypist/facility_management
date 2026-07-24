
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client"],

  allowedDevOrigins: [
    "http://100.53.168.109",
    "http://100.53.168.109:3000",
  ],
};

export default nextConfig;
