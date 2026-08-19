/**
 * Local mock harness for the B2C CV-analysis flow (FE-0).
 *
 * DEV/E2E ONLY — this module is imported from `vite.config.ts` behind the
 * `ISAS_E2E=1` flag, so it never reaches an application bundle.
 *
 * Goal: `npm run dev:local` → open the browser → click through *every* state of
 * the JD step without a gateway, InterviewService or AIService running.
 *
 * Routes served (all under `/api/v1/interview`):
 *   POST   /files/upload?fileType=cv|jd     → 200 FileRecord (`fileId`, parsedStatus completed)
 *   GET    /files/files[?fileType=cv|jd]    → 2 CV + 2 JD (+ anything uploaded this session)
 *   GET    /files/{id}/parsed-text          → 200 completed · 202 pending · 409 failed
 *   GET    /files/{id}/download             → tiny generated PDF (mock ids only)
 *   DELETE /files/{id}                      → 200, drops it from the session list
 *   POST   /practice/jd-requirements        → scenario-driven, see JD_SCENARIOS below
 *   POST   /practice/cv-analysis            → echoes the request back as a report
 *   GET    /practice/cv-analysis/{id}       → report created by the POST above
 *
 * Scenarios are triggered by *typing into the JD box* so a reviewer can walk the
 * whole matrix without editing code or restarting the server:
 *
 *   (nothing)  8 requirements (5 must / 3 nice); every `jdQuote` is a verbatim
 *              substring of the `jdText` that was sent, so "Xem trong JD" is
 *              testable before BE-2 ships
 *   #empty     `{ mustHave: [], niceToHave: [] }`
 *   #dup       duplicated + commonly-typed texts (`C# / .NET`, `Docker`) for merge/dedupe
 *   #slow      8s delay, then the scenario that would otherwise apply (loading + Hủy)
 *   #429       429 + `Retry-After: 45` + `{ error, retryAfterSeconds: 45 }`
 *   #error     502 + `{ error }`
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

const INTERVIEW_PREFIX = '/api/v1/interview'
const SLOW_DELAY_MS = 8_000
const RETRY_AFTER_SECONDS = 45
const MAX_BODY_BYTES = 25 * 1024 * 1024

type MockFileType = 'cv' | 'jd'

interface MockFileRecord {
  id: string
  fileType: MockFileType
  originalName: string
  mimeType: string
  fileSize: number
  parsedStatus: 'completed' | 'pending' | 'failed'
  createdAt: string
  updatedAt: string
  userId: string
  parsedText: string
}

/* ------------------------------------------------------------------ fixtures */

const SAMPLE_JD_TEXT = [
  'Tuyển dụng Backend Developer (.NET) — Công ty ISAS',
  '',
  'Mô tả công việc:',
  'Tham gia thiết kế, xây dựng và vận hành các dịch vụ backend cho nền tảng tuyển dụng thông minh.',
  'Phối hợp cùng team frontend, QA và DevOps để đưa tính năng lên production hai tuần một lần.',
  '',
  'Yêu cầu bắt buộc:',
  '- Tối thiểu 3 năm kinh nghiệm phát triển backend với C# / .NET.',
  '- Thành thạo SQL Server hoặc PostgreSQL, biết tối ưu truy vấn và đánh index.',
  '- Kinh nghiệm thiết kế và triển khai RESTful API cho hệ thống nhiều người dùng.',
  '- Hiểu biết về Docker, CI/CD và quy trình release tự động.',
  '- Kỹ năng làm việc nhóm tốt, đọc hiểu tài liệu kỹ thuật tiếng Anh.',
  '',
  'Điểm cộng:',
  '- Kinh nghiệm vận hành hệ thống trên Kubernetes.',
  '- Đã làm việc với message queue như RabbitMQ hoặc Kafka.',
  '- Có chứng chỉ AWS hoặc Azure còn hiệu lực.',
  '',
  'Quyền lợi: lương thỏa thuận 12 tháng, review lương 2 lần/năm, bảo hiểm sức khỏe cho người thân.',
].join('\n')

const SAMPLE_JD_TEXT_ALT = [
  'Frontend Engineer (React / TypeScript) — ISAS Product Team',
  '',
  'Yêu cầu bắt buộc:',
  '- 2 năm kinh nghiệm trở lên với React và TypeScript trong sản phẩm thật.',
  '- Thành thạo HTML/CSS ngữ nghĩa, responsive và accessibility cơ bản.',
  '- Kinh nghiệm làm việc với REST API, xử lý trạng thái loading và lỗi.',
  '- Viết unit test cho component bằng Vitest hoặc Jest.',
  '',
  'Điểm cộng:',
  '- Biết Tailwind CSS và design system.',
  '- Có kinh nghiệm tối ưu hiệu năng render và bundle size.',
].join('\n')

const SAMPLE_CV_TEXT = [
  'NGUYEN VAN A — Backend Developer',
  'Email: a.nguyen@example.com · Ho Chi Minh City',
  '',
  'EXPERIENCE',
  'ISAS JSC — Backend Developer (2022 – nay)',
  '- Xây dựng ASP.NET Core API phục vụ 100K request/ngày.',
  '- Tối ưu truy vấn PostgreSQL, giảm p95 latency từ 800ms xuống 210ms.',
  '- Đóng gói dịch vụ bằng Docker, dựng pipeline CI/CD trên GitHub Actions.',
  '',
  'SKILLS',
  'C#, .NET 8, PostgreSQL, SQL Server, Docker, RabbitMQ, Git',
].join('\n')


function seedFiles(): MockFileRecord[] {
  return [
    {
      id: 'mock-cv-001',
      fileType: 'cv',
      originalName: 'CV_NguyenVanA_Backend.pdf',
      mimeType: 'application/pdf',
      fileSize: 184_320,
      parsedStatus: 'completed',
      createdAt: '2026-08-16T08:15:00.000Z',
      updatedAt: '2026-08-16T08:15:00.000Z',
      userId: 'e2e-candidate',
      parsedText: SAMPLE_CV_TEXT,
    },
    {
      id: 'mock-cv-002',
      fileType: 'cv',
      originalName: 'CV_NguyenVanA_Fullstack_v2.pdf',
      mimeType: 'application/pdf',
      fileSize: 226_918,
      parsedStatus: 'completed',
      createdAt: '2026-08-17T03:40:00.000Z',
      updatedAt: '2026-08-17T03:40:00.000Z',
      userId: 'e2e-candidate',
      parsedText: `${SAMPLE_CV_TEXT}\n\nEDUCATION\nĐại học Bách Khoa — Kỹ thuật phần mềm (2018 – 2022)`,
    },
    {
      id: 'mock-jd-001',
      fileType: 'jd',
      originalName: 'JD_Backend_DotNet.pdf',
      mimeType: 'application/pdf',
      fileSize: 98_304,
      parsedStatus: 'completed',
      createdAt: '2026-08-16T08:20:00.000Z',
      updatedAt: '2026-08-16T08:20:00.000Z',
      userId: 'e2e-candidate',
      parsedText: SAMPLE_JD_TEXT,
    },
    {
      // `pending` in the id makes GET /parsed-text answer 202 — the "đang đọc tệp" state.
      id: 'mock-jd-pending-002',
      fileType: 'jd',
      originalName: 'JD_Frontend_React_dang_xu_ly.pdf',
      mimeType: 'application/pdf',
      fileSize: 74_240,
      parsedStatus: 'pending',
      createdAt: '2026-08-18T02:05:00.000Z',
      updatedAt: '2026-08-18T02:05:00.000Z',
      userId: 'e2e-candidate',
      parsedText: SAMPLE_JD_TEXT_ALT,
    },
  ]
}

const files: MockFileRecord[] = seedFiles()
const analyses = new Map<string, Record<string, unknown>>()
let uploadCounter = 0
let analysisCounter = 0

/* ------------------------------------------------------------------- helpers */

function sendJson(
  response: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  for (const [name, value] of Object.entries(headers)) response.setHeader(name, value)
  response.end(JSON.stringify(body))
}

function delay(ms: number) {
  return new Promise<void>((resolve) => { setTimeout(resolve, ms) })
}

function readRawBody(request: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('MOCK_BODY_TOO_LARGE'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readRawBody(request)
  if (!raw.length) return {}
  try {
    const parsed: unknown = JSON.parse(raw.toString('utf8'))
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

function toText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** Byte length + declared filename of the first file part in a multipart body. */
function readMultipartFile(raw: Buffer, contentType: string) {
  const nameMatch = /filename\*?=(?:UTF-8'')?"?([^";\r\n]+)"?/i.exec(raw.toString('latin1'))
  const originalName = nameMatch ? decodeURIComponent(nameMatch[1].trim()) : 'uploaded-file.pdf'

  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType)
  const boundary = boundaryMatch ? (boundaryMatch[1] ?? boundaryMatch[2]).trim() : ''
  let fileSize = raw.length
  if (boundary) {
    const marker = Buffer.from(`\r\n--${boundary}`)
    const headerEnd = raw.indexOf('\r\n\r\n')
    if (headerEnd >= 0) {
      const start = headerEnd + 4
      const end = raw.indexOf(marker, start)
      if (end > start) fileSize = end - start
    }
  }
  return { originalName, fileSize }
}

function createMockPdf(label: string): Buffer {
  const stream = `BT /F1 18 Tf 62 730 Td (${label.replace(/[()\\]/g, ' ')}) Tj ET`
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

function toFileRecordDto(file: MockFileRecord) {
  return {
    id: file.id,
    fileType: file.fileType,
    originalName: file.originalName,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
    parsedStatus: file.parsedStatus,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
    userId: file.userId,
  }
}

/* --------------------------------------------------- JD requirement scenarios */

interface MockRequirement {
  text: string
  citations: never[]
  jdQuote: string | null
}

const DEFAULT_MUST_HAVE = [
  'Tối thiểu 3 năm kinh nghiệm phát triển backend với C# / .NET',
  'Thành thạo SQL Server hoặc PostgreSQL, biết tối ưu truy vấn',
  'Kinh nghiệm thiết kế và triển khai RESTful API',
  'Hiểu biết về Docker, CI/CD và quy trình release tự động',
  'Kỹ năng làm việc nhóm và đọc hiểu tài liệu kỹ thuật tiếng Anh',
]

const DEFAULT_NICE_TO_HAVE = [
  'Kinh nghiệm vận hành hệ thống trên Kubernetes',
  'Đã làm việc với message queue như RabbitMQ hoặc Kafka',
  'Có chứng chỉ AWS hoặc Azure còn hiệu lực',
]

/** Texts chosen to collide with each other *and* with what users typically type. */
const DUP_MUST_HAVE = [
  'C# / .NET',
  'C#/.NET',
  'Docker',
  'Thành thạo SQL Server hoặc PostgreSQL, biết tối ưu truy vấn',
  'Kinh nghiệm thiết kế và triển khai RESTful API.',
]

const DUP_NICE_TO_HAVE = [
  'Docker',
  'docker',
  'Kinh nghiệm vận hành hệ thống trên Kubernetes',
]

/**
 * Split the *received* JD into verbatim slices so every `jdQuote` we hand back is
 * a genuine substring of `jdText`. Trimming only removes whitespace, so the
 * result is still findable with `jdText.indexOf(quote)`.
 */
function jdQuoteCandidates(jdText: string): string[] {
  return jdText
    .split(/\n+|(?<=\.)\s+/)
    .map((line) => line.replace(/^[\s\-•*]+/, '').trim())
    .filter((line) => line.length >= 12 && !line.startsWith('#'))
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .split(/[^a-z0-9#+.]+/)
    .filter((token) => token.length >= 2)
}

/** Pick the JD line that shares the most words with the requirement text. */
function bestQuote(text: string, quotes: string[], fallbackIndex: number): string | null {
  if (!quotes.length) return null
  const wanted = new Set(tokenize(text))
  let best = -1
  let bestIndex = -1
  quotes.forEach((quote, index) => {
    const score = tokenize(quote).filter((token) => wanted.has(token)).length
    if (score > best) {
      best = score
      bestIndex = index
    }
  })
  if (best <= 0) return quotes[fallbackIndex % quotes.length]
  return quotes[bestIndex]
}

function buildRequirements(texts: string[], quotes: string[], offset: number): MockRequirement[] {
  return texts.map((text, index) => ({
    text,
    citations: [] as never[],
    jdQuote: bestQuote(text, quotes, index + offset),
  }))
}

type JdScenario = 'default' | 'empty' | 'dup' | 'rateLimited' | 'error'

function detectScenario(jdText: string): { scenario: JdScenario; slow: boolean } {
  const text = jdText.toLowerCase()
  const slow = text.includes('#slow')
  if (text.includes('#429')) return { scenario: 'rateLimited', slow }
  if (text.includes('#error')) return { scenario: 'error', slow }
  if (text.includes('#empty')) return { scenario: 'empty', slow }
  if (text.includes('#dup')) return { scenario: 'dup', slow }
  return { scenario: 'default', slow }
}

async function handleJdRequirements(request: IncomingMessage, response: ServerResponse) {
  const body = await readJsonBody(request)
  const jdId = toText(body.jdId).trim()
  const jdTextFromBody = toText(body.jdText)
  const jdText = jdTextFromBody.trim()
    ? jdTextFromBody
    : files.find((file) => file.id === jdId)?.parsedText ?? ''

  if (!toText(body.jobCategory).trim()) {
    sendJson(response, 400, { error: 'jobCategory là bắt buộc.' })
    return
  }
  if (!jdText.trim()) {
    sendJson(response, 400, { error: 'Cần jdText hoặc jdId để tách yêu cầu.' })
    return
  }

  const { scenario, slow } = detectScenario(jdText)
  if (slow) await delay(SLOW_DELAY_MS)

  if (scenario === 'rateLimited') {
    sendJson(
      response,
      429,
      {
        error: 'Bạn đã dùng hết lượt tách yêu cầu. Vui lòng thử lại sau ít phút.',
        retryAfterSeconds: RETRY_AFTER_SECONDS,
      },
      { 'Retry-After': String(RETRY_AFTER_SECONDS) },
    )
    return
  }
  if (scenario === 'error') {
    sendJson(response, 502, { error: 'Dịch vụ AI đang bận. Vui lòng thử lại.' })
    return
  }
  if (scenario === 'empty') {
    sendJson(response, 200, { mustHave: [], niceToHave: [] })
    return
  }

  const quotes = jdQuoteCandidates(jdText)
  if (scenario === 'dup') {
    sendJson(response, 200, {
      mustHave: buildRequirements(DUP_MUST_HAVE, quotes, 0),
      niceToHave: buildRequirements(DUP_NICE_TO_HAVE, quotes, 2),
    })
    return
  }

  sendJson(response, 200, {
    mustHave: buildRequirements(DEFAULT_MUST_HAVE, quotes, 0),
    niceToHave: buildRequirements(DEFAULT_NICE_TO_HAVE, quotes, DEFAULT_MUST_HAVE.length),
  })
}

/* ------------------------------------------------------------ cv-analysis POST */

function requirementTexts(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') return toText((item as Record<string, unknown>).text)
      return ''
    })
    .filter((text) => text.trim().length > 0)
}

function toRequirementMatch(text: string, priority: 'MustHave' | 'NiceToHave', index: number) {
  const level = index % 3 === 0 ? 'Strong' : index % 3 === 1 ? 'Partial' : 'Weak'
  return {
    requirementId: `mock-req-${priority}-${index}`,
    priority,
    text,
    level,
    evidence: level === 'Weak'
      ? 'Không thấy bằng chứng'
      : `Trích từ CV: ${SAMPLE_CV_TEXT.split('\n')[5 + (index % 3)]?.trim() ?? 'Kinh nghiệm liên quan'}`,
    page: level === 'Weak' ? null : 1,
    sectionTitle: level === 'Weak' ? null : (index % 2 === 0 ? 'Experience' : 'Skills'),
  }
}

function countLevels(matches: { level: string }[]) {
  return {
    total: matches.length,
    strong: matches.filter((match) => match.level === 'Strong').length,
    partial: matches.filter((match) => match.level === 'Partial').length,
    weak: matches.filter((match) => match.level === 'Weak').length,
  }
}

async function handleCreateAnalysis(request: IncomingMessage, response: ServerResponse) {
  const body = await readJsonBody(request)
  const cvId = toText(body.cvId).trim()
  if (!cvId) {
    sendJson(response, 400, { error: 'cvId là bắt buộc.' })
    return
  }

  const mustHave = requirementTexts(body.mustHave)
  const niceToHave = requirementTexts(body.niceToHave)
  const requirementMode = mustHave.length + niceToHave.length > 0
  const hasJd = Boolean(toText(body.jdId).trim() || toText(body.jdText).trim())

  const mustHaveMatches = mustHave.map((text, index) => toRequirementMatch(text, 'MustHave', index))
  const niceToHaveMatches = niceToHave.map((text, index) => toRequirementMatch(text, 'NiceToHave', index))

  analysisCounter += 1
  const id = `mock-analysis-${String(analysisCounter).padStart(3, '0')}`
  const result: Record<string, unknown> = {
    id,
    cvId,
    jdId: toText(body.jdId).trim() || null,
    jobCategory: toText(body.jobCategory) || 'BE',
    summary: requirementMode
      ? `Đã đối chiếu CV với ${mustHave.length + niceToHave.length} yêu cầu bạn cung cấp.`
      : 'Hồ sơ backend với kinh nghiệm API và cơ sở dữ liệu có thể kiểm chứng.',
    strengths: ['Kinh nghiệm ASP.NET Core rõ ràng', 'Có số liệu định lượng cho tối ưu hiệu năng'],
    weaknesses: ['Thiếu bằng chứng vận hành cloud-native'],
    suggestions: ['Bổ sung một ví dụ triển khai Kubernetes có số liệu.'],
    jdMatch: hasJd && !requirementMode
      ? {
        score: 78,
        matchedSkills: ['C#', '.NET', 'PostgreSQL', 'Docker'],
        missingSkills: ['Kubernetes', 'Kafka'],
      }
      : null,
    requirementSummary: requirementMode
      ? { mustHave: countLevels(mustHaveMatches), niceToHave: countLevels(niceToHaveMatches) }
      : null,
    mustHaveMatches,
    niceToHaveMatches,
    cvSections: [
      { title: 'Experience', kind: 'Experience', startsWith: 'EXPERIENCE' },
      { title: 'Skills', kind: 'Skills', startsWith: 'SKILLS' },
    ],
    citations: [],
    createdAt: new Date().toISOString(),
  }

  analyses.set(id, result)
  sendJson(response, 200, result)
}

/* -------------------------------------------------------------------- routing */

async function route(
  request: IncomingMessage,
  response: ServerResponse,
  pathname: string,
  query: URLSearchParams,
): Promise<boolean> {
  const method = (request.method ?? 'GET').toUpperCase()
  const path = pathname.slice(INTERVIEW_PREFIX.length)

  if (path === '/files/upload' && method === 'POST') {
    const raw = await readRawBody(request)
    const fileType: MockFileType = query.get('fileType') === 'jd' ? 'jd' : 'cv'
    const { originalName, fileSize } = readMultipartFile(raw, request.headers['content-type'] ?? '')
    uploadCounter += 1
    const record: MockFileRecord = {
      id: `mock-upload-${fileType}-${String(uploadCounter).padStart(3, '0')}`,
      fileType,
      originalName,
      mimeType: originalName.toLowerCase().endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf',
      fileSize,
      parsedStatus: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'e2e-candidate',
      parsedText: fileType === 'jd' ? SAMPLE_JD_TEXT : SAMPLE_CV_TEXT,
    }
    files.unshift(record)
    sendJson(response, 200, {
      fileId: record.id,
      fileType: record.fileType,
      originalName: record.originalName,
      mimeType: record.mimeType,
      fileSize: record.fileSize,
      parsedStatus: record.parsedStatus,
      createdAt: record.createdAt,
    })
    return true
  }

  if (path === '/files/files' && method === 'GET') {
    const wanted = query.get('fileType')
    const items = files
      .filter((file) => (wanted === 'cv' || wanted === 'jd' ? file.fileType === wanted : true))
      .map(toFileRecordDto)
    sendJson(response, 200, { items, nextCursor: null })
    return true
  }

  const parsedTextMatch = /^\/files\/([^/]+)\/parsed-text$/.exec(path)
  if (parsedTextMatch && method === 'GET') {
    const id = decodeURIComponent(parsedTextMatch[1])
    if (id.includes('pending')) {
      sendJson(response, 202, { parsedStatus: 'pending' })
      return true
    }
    if (id.includes('failed')) {
      sendJson(response, 409, { parsedStatus: 'failed' })
      return true
    }
    const file = files.find((item) => item.id === id)
    sendJson(response, 200, {
      parsedText: file?.parsedText ?? SAMPLE_JD_TEXT,
      parsedStatus: 'completed',
    })
    return true
  }

  const downloadMatch = /^\/files\/(mock-[^/]+)\/download$/.exec(path)
  if (downloadMatch && method === 'GET') {
    const id = decodeURIComponent(downloadMatch[1])
    const file = files.find((item) => item.id === id)
    const pdf = createMockPdf(file?.originalName ?? id)
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Length', String(pdf.length))
    response.end(pdf)
    return true
  }

  const fileIdMatch = /^\/files\/(mock-[^/]+)$/.exec(path)
  if (fileIdMatch && method === 'DELETE') {
    const id = decodeURIComponent(fileIdMatch[1])
    const index = files.findIndex((item) => item.id === id)
    if (index >= 0) files.splice(index, 1)
    sendJson(response, 200, { message: 'Đã xoá tệp.' })
    return true
  }

  if (path === '/practice/jd-requirements' && method === 'POST') {
    await handleJdRequirements(request, response)
    return true
  }

  if (path === '/practice/cv-analysis' && method === 'POST') {
    await handleCreateAnalysis(request, response)
    return true
  }

  const analysisMatch = /^\/practice\/cv-analysis\/(mock-analysis-[^/]+)$/.exec(path)
  if (analysisMatch && method === 'GET') {
    const stored = analyses.get(decodeURIComponent(analysisMatch[1]))
    if (stored) {
      sendJson(response, 200, stored)
      return true
    }
  }

  return false
}

/**
 * Returns `true` when the request was fully answered by the mock; `false` lets
 * the caller fall through to the remaining middlewares.
 */
export async function handleInterviewMockRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean> {
  const rawUrl = request.url ?? ''
  if (!rawUrl.startsWith(INTERVIEW_PREFIX)) return false

  const parsed = new URL(rawUrl, 'http://localhost')
  if (!parsed.pathname.startsWith(INTERVIEW_PREFIX)) return false

  try {
    return await route(request, response, parsed.pathname, parsed.searchParams)
  } catch (error) {
    if (response.headersSent) return true
    sendJson(response, 500, {
      error: `Mock harness lỗi: ${error instanceof Error ? error.message : 'unknown'}`,
    })
    return true
  }
}

/* ---------------------------------------------------- auto-login seed (dev only) */

const SEEDED_USER = {
  id: 'e2e-candidate',
  fullName: 'Evidence Candidate',
  email: 'candidate@isas.dev',
  title: 'Backend Candidate',
  role: 'Candidate',
  location: 'Ho Chi Minh City',
  createdAt: '2026-08-18T00:00:00.000Z',
}

/**
 * Inline script injected into index.html by the dev server only. Seeds the exact
 * localStorage shape `loginAsCandidate()` uses in `e2e/specs/b2c/cv-upload.spec.ts`
 * so opening any candidate URL lands signed in — no console pasting.
 *
 * Escape hatch: `localStorage.setItem('isas-mock-no-seed', '1')` to test real login.
 */
export const DEV_AUTH_SEED_SCRIPT = `
(function () {
  try {
    if (localStorage.getItem('isas-mock-no-seed') === '1') return;
    localStorage.setItem('accessToken', 'e2e-access-candidate');
    localStorage.setItem('refreshToken', 'e2e-refresh-candidate');
    localStorage.setItem('expiresAt', '2099-08-18T12:00:00.000Z');
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: ${JSON.stringify(SEEDED_USER)}, isAuthenticated: true },
      version: 0,
    }));
    sessionStorage.setItem('isas-auth-user', JSON.stringify(${JSON.stringify(SEEDED_USER)}));
    console.info('[isas-mock] seeded candidate session (ISAS_E2E=1)');
  } catch (error) {
    console.warn('[isas-mock] could not seed session', error);
  }
})();
`
