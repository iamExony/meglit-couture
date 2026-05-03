/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "undepressible-kena-protractedly.ngrok-free.dev",
    "*.ngrok-free.dev",
  ],
  // Hide Next.js' built-in dev route-pending indicator (bottom-left "N" pulse)
  // so our branded NavigationProgress + page loader is the single source of
  // navigation feedback in development.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
