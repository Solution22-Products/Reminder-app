import withPWA from 'next-pwa';
/** @type {import('next').NextConfig} */
const nextConfig = {
    ...withPWA({
        dest: "public",
        register: true,
        skipWaiting: true,
      }),
    images:
    {
        remotePatterns:[
            {
                protocol:"https",
                hostname:"reminder-app-rosy-five.vercel.app",
                pathname:"/images/**"
            },
            {
                protocol: 'https',
                hostname: 'dusxvkdxtgtjpuqwxgbs.supabase.co',
                pathname: '/**',
              },
            {
                protocol: 'https',
                hostname: 'dusxvkdxtgtjpuqwxgbs.supabase.co',
                pathname: '/userProfile/**',
              },
        ]
    },
    reactStrictMode: false,
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Content-Security-Policy",
              value: "upgrade-insecure-requests",
            },
          ],
        },
      ];
    },
   
};

export default nextConfig;
