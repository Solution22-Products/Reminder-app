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
                hostname:"localhost",
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
    }
   
};

export default nextConfig;
