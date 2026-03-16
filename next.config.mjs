/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ihwvhynnpognxtkmfznl.supabase.co",
      },
    ],
  },
};

export default nextConfig;
