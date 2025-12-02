/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore Node.js modules that pdfjs-dist tries to use in browser
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
        fs: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
      };
    }

    config.module.rules.push({
      test: /pdf\.worker\.js$/,
      type: "asset/resource",
    });

    return config;
  },
};

module.exports = nextConfig;