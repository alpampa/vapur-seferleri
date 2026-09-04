import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-map-gl', 'mapbox-gl', 'zustand', 'framer-motion', 'lucide-react'],
};

export default nextConfig;
