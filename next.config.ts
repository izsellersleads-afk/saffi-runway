import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "connect-src 'self' wss: https: *.runwayml.com *.livekit.cloud",
              "media-src 'self' blob: mediastream:",
              "img-src 'self' blob: data:",
              "style-src 'self' 'unsafe-inline'",
              "worker-src blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;