import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { knowledgeErrorMessage, parseTopics, sourceTypeKey } from './adminKnowledge';

const t = (key: string) => key;
const axiosError = (status: number, data: unknown, headers: Record<string, string> = {}) =>
  new AxiosError('x', 'ERR', undefined, undefined, { status, statusText: '', data, headers: new AxiosHeaders(headers), config: { headers: new AxiosHeaders() } });

describe('adminKnowledge — lỗi nạp nguồn phân biệt 3 nguồn gốc', () => {
  it('429 kèm Retry-After ⇒ câu giới hạn có số giây; 502 ⇒ câu "không phải do bạn"; 400 ⇒ nguyên câu `error` của BE', () => {
    expect(knowledgeErrorMessage(axiosError(429, { error: 'rate' }, { 'retry-after': '37' }), t)).toBe('admin.knowledge.error.rateLimited'.replace('{seconds}', '37'));
    expect(knowledgeErrorMessage(axiosError(502, { error: 'Context7 down' }), t)).toBe('admin.knowledge.error.upstream');
    // BE knowledge trả `{ error }` (không `message`) — phải đọc được field đó.
    expect(knowledgeErrorMessage(axiosError(400, { error: 'URL không tải được (403 từ trang đích).' }), t)).toBe('URL không tải được (403 từ trang đích).');
  });
  it('sourceType là CHUỖI (Interview), lạ ⇒ Không rõ', () => {
    expect(sourceTypeKey('Url')).toBe('admin.knowledge.type.url');
    expect(sourceTypeKey('Context7')).toBe('admin.knowledge.type.context7');
    expect(sourceTypeKey('Rss')).toBe('admin.money.unknown');
  });
  it('parseTopics: mỗi dòng/dấu phẩy một topic, bỏ trống và trùng', () => {
    expect(parseTopics('hooks\n suspense,hooks\n\n')).toEqual(['hooks', 'suspense']);
  });
});
