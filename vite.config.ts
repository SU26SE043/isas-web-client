import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

const E2E_ADMIN_ANALYTICS_PATH = '/api/v1/auth/admin/analytics'
const E2E_ADMIN_ANALYTICS_RESPONSE = JSON.stringify({
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-30T00:00:00.000Z',
  granularity: 'day',
  totals: {
    totalUsers: 0,
    newUsers: 0,
    bannedUsers: 0,
    totalOrganizations: 0,
    byRole: [],
  },
  activeUsers: { last7Days: 0, last30Days: 0 },
  buckets: [],
})

function createE2eApiMock(): Plugin {
  const middleware = (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    if (request.url?.startsWith(E2E_ADMIN_ANALYTICS_PATH)) {
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.end(E2E_ADMIN_ANALYTICS_RESPONSE)
      return
    }

    next()
  }

  return {
    name: 'isas-e2e-api-mock',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

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
      ...(env.ISAS_E2E === '1' ? [createE2eApiMock()] : []),
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
