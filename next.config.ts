import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Emit /guidance/index.html instead of /guidance.html so both /guidance and
  // /guidance/ resolve on GitHub Pages (previously /guidance/ was a 404), and so
  // it matches how the static /game/ folder is served.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
