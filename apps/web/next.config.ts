import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-map-gl', 'mapbox-gl', 'zustand', 'framer-motion', 'lucide-react'],
  // Düşük RAM'li makinede (7.7GB) build/OOM riskini azaltmak için
  // paralel worker sayısını sınırla.
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
