/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ihwvhynnpognxtkmfznl.supabase.co",
      },
    ],
  },
};

export default nextConfig;
