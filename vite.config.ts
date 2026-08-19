import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import {
  DEV_AUTH_SEED_SCRIPT,
  handleInterviewMockRequest,
} from './scripts/dev-mocks/interviewFiles.mock'

const E2E_ADMIN_ANALYTICS_PATH = '/api/v1/auth/admin/analytics'
const E2E_CV_ANALYSIS_PATH = '/api/v1/interview/practice/cv-analysis'
const E2E_AUTH_ME_PATH = '/api/v1/auth/me'
const E2E_AUTH_LOGIN_PATH = '/api/v1/auth/login'
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

const E2E_CV_ANALYSIS_RESPONSE = {
  id: 'e2e-evidence-analysis',
  cvId: 'e2e-cv-id',
  jdId: 'e2e-jd-id',
  jobCategory: 'BE',
  summary: 'Backend profile with verifiable API and database experience.',
  strengths: ['Backend delivery'],
  weaknesses: ['Cloud-native operations'],
  suggestions: ['Add a quantified Kubernetes deployment example.'],
  jdMatch: null,
  requirementSummary: {
    mustHave: { total: 2, strong: 1, partial: 1, weak: 0 },
    niceToHave: { total: 1, strong: 0, partial: 0, weak: 1 },
  },
  mustHaveMatches: [
    {
      requirementId: 'e2e-strong', priority: 'MustHave', text: 'ASP.NET Core API development',
      level: 'Strong', evidence: 'Developed ASP.NET Core APIs serving 100K requests per day',
      page: 1, sectionTitle: 'Experience',
    },
    {
      requirementId: 'e2e-partial', priority: 'MustHave', text: 'PostgreSQL performance tuning',
      level: 'Partial', evidence: 'Optimized PostgreSQL queries and indexes',
      page: 1, sectionTitle: 'Skills',
    },
  ],
  niceToHaveMatches: [
    {
      requirementId: 'e2e-weak', priority: 'NiceToHave', text: 'Kubernetes production operations',
      level: 'Weak', evidence: 'Không thấy bằng chứng', page: null, sectionTitle: null,
    },
  ],
  cvSections: [{ title: 'Experience', kind: 'Experience', startsWith: 'EXPERIENCE' }],
  citations: [],
  createdAt: '2026-08-18T12:00:00.000Z',
}

function createE2ePdf(label: string): Buffer {
  const stream = `BT /F1 20 Tf 72 740 Td (${label}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf))
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf)
}

function createE2eApiMock(): Plugin {
  const middleware = async (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    // Interview files / JD requirements / analysis — see scripts/dev-mocks.
    if (await handleInterviewMockRequest(request, response)) return

    const url = request.url?.split('?')[0]
    if (url === E2E_AUTH_LOGIN_PATH) {
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({
        accessToken: 'e2e-access-candidate',
        refreshToken: 'e2e-refresh-candidate',
        expiresAt: '2099-08-18T12:00:00.000Z',
      }))
      return
    }
    if (url === E2E_AUTH_ME_PATH) {
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({
        id: 'e2e-candidate', fullName: 'Evidence Candidate', email: 'candidate@isas.dev',
        role: 'Candidate', title: 'Backend Candidate', location: 'Ho Chi Minh City',
        createdAt: '2026-08-18T00:00:00.000Z',
      }))
      return
    }
    if (url === `${E2E_CV_ANALYSIS_PATH}/e2e-evidence-analysis`) {
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(E2E_CV_ANALYSIS_RESPONSE))
      return
    }
    if (url === E2E_CV_ANALYSIS_PATH && request.method === 'GET') {
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify([E2E_CV_ANALYSIS_RESPONSE]))
      return
    }
    const fileMatch = url?.match(/^\/api\/v1\/interview\/files\/(e2e-(cv|jd)-id)\/download$/)
    if (fileMatch) {
      const kind = fileMatch[2] === 'jd' ? 'JD Preview' : 'CV Evidence Preview'
      const pdf = createE2ePdf(kind)
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/pdf')
      response.setHeader('Content-Length', String(pdf.length))
      response.end(pdf)
      return
    }
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
    // Auto-login seed. `context.server` is only set while the dev server is
    // running, so the snippet can never be baked into a production build.
    transformIndexHtml: {
      order: 'pre',
      handler(_html, context) {
        if (!context.server) return
        return [{
          tag: 'script',
          injectTo: 'head-prepend' as const,
          children: DEV_AUTH_SEED_SCRIPT,
        }]
      },
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
      ...(env.ISAS_E2E === '1' || process.env.ISAS_E2E === '1' ? [createE2eApiMock()] : []),
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
