import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? "/uscpa-vocab-quiz" : "",
  assetPrefix: isGithubPages ? "/uscpa-vocab-quiz/" : "",
  images: {
    unoptimized: true
  }
};

export default nextConfig;
