/** @type {import('next').NextConfig} */
const nextConfig = {
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
