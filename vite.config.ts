import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'node:path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
        svgr(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['logo.svg'],
            manifest: {
                name: 'Massas São José',
                short_name: 'Massas SJ',
                description: 'Site do Massas São José',
                theme_color: '#f3eee7',
                background_color: '#f3eee7',
                display: 'standalone',
                icons: [
                    {
                        src: '/src/assets/logo.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml'
                    },
                    {
                        src: '/src/assets/logo.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml'
                    }
                ]
            }
        })
    ],
    base: '/massas-sao-jose-front/',
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
