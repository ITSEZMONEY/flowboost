/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Allow embedding the widget on juicebox.ai + Webflow previews
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://juicebox.ai https://*.webflow.io;"
          },
          // For older browsers; CSP is the modern control
          {
            key: "X-Frame-Options",
            value: "ALLOWALL"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
