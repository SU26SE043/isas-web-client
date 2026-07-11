import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const authProxyTarget = env.VITE_AUTH_PROXY_TARGET || 'http://localhost:5174'

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // Gateway contract: /api/v1/auth/* -> Auth service /auth/*
        '/api/v1/auth': {
          target: authProxyTarget,
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/v1\/auth/, '/auth'),
        },
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
})
