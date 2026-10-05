import { describe, expect, it } from 'vitest';
import type { CampaignResultFlagEvent } from '../types/campaign.api.types';
import {
  buildProctoringIncidents,
  FACE_INCIDENT_MAX_GAP_MS,
  incidentSpanSeconds,
  summarizeIncidentsByTier,
} from './proctoringTimeline';

const at = (seconds: number) => new Date(Date.UTC(2026, 9, 5, 1, 0, 0) + seconds * 1000).toISOString();
const ev = (signalType: string, seconds: number, note: string | null = null): CampaignResultFlagEvent => (
  { signalType, detectedAt: at(seconds), note }
);
const vn = (signalType: string, clock: string): CampaignResultFlagEvent => {
  const [h, m, s] = clock.split(':').map(Number);
  // giờ VN (UTC+7) như đọc từ prod → UTC
  return { signalType, detectedAt: new Date(Date.UTC(2026, 9, 5, h - 7, m, s)).toISOString(), note: null };
};

describe('buildProctoringIncidents — dữ liệu thật trên prod 05/10', () => {
  it('buổi 5902855c: 8 lượt "không thấy mặt" 08:39:07→08:40:33 là MỘT sự việc, 86 giây', () => {
    const events = ['08:39:07', '08:39:19', '08:39:31', '08:39:43', '08:39:57', '08:40:09', '08:40:21', '08:40:33']
      .map((clock) => vn('no_face', clock));
    const incidents = buildProctoringIncidents(events);
    expect(incidents).toHaveLength(1);
    expect(incidents[0]).toMatchObject({ key: 'noface', checks: 8, faceCheck: true, priority: 'behavior' });
    expect(incidentSpanSeconds(incidents[0])).toBe(86);
  });

  it('buổi 02a218dd: hai đợt vắng mặt cách nhau 76 giây là HAI sự việc', () => {
    const events = ['15:48:38', '15:48:49', '15:49:00', '15:50:16', '15:50:27', '15:50:49'].map((clock) => vn('no_face', clock));
    const incidents = buildProctoringIncidents(events);
    expect(incidents.map((incident) => incident.checks)).toEqual([3, 3]);
    expect(incidents.map(incidentSpanSeconds)).toEqual([22, 33]);
  });
});

describe('buildProctoringIncidents — ranh giới gộp', () => {
  it(`cách nhau đúng ${FACE_INCIDENT_MAX_GAP_MS}ms thì gộp, thêm 1ms thì tách`, () => {
    const base = Date.UTC(2026, 9, 5, 1, 0, 0);
    const iso = (ms: number) => new Date(base + ms).toISOString();
    const merged = buildProctoringIncidents([
      { signalType: 'no_face', detectedAt: iso(0), note: null },
      { signalType: 'no_face', detectedAt: iso(FACE_INCIDENT_MAX_GAP_MS), note: null },
    ]);
    const split = buildProctoringIncidents([
      { signalType: 'no_face', detectedAt: iso(0), note: null },
      { signalType: 'no_face', detectedAt: iso(FACE_INCIDENT_MAX_GAP_MS + 1), note: null },
    ]);
    expect(merged).toHaveLength(1);
    expect(split).toHaveLength(2);
  });

  it('so với lượt kiểm CUỐI của sự việc, không phải lượt đầu (0/12/24/36s là một sự việc)', () => {
    const incidents = buildProctoringIncidents([0, 12, 24, 36].map((s) => ev('no_face', s)));
    expect(incidents).toHaveLength(1);
    expect(incidents[0].checks).toBe(4);
  });

  it('một cờ khác loại chen giữa KHÔNG cắt chuỗi của loại kia', () => {
    const incidents = buildProctoringIncidents([ev('no_face', 0), ev('multiple_faces', 10), ev('no_face', 20)]);
    expect(incidents.map((incident) => [incident.key, incident.checks])).toEqual([['noface', 2], ['multiplefaces', 1]]);
  });

  it('cờ hành vi là sự kiện rời rạc: hai lần rời tab cách 5 giây vẫn là 2 sự việc, mỗi cái giữ ghi chú riêng', () => {
    const incidents = buildProctoringIncidents([ev('tab_switch', 0, 'A'), ev('tab_switch', 5, 'B')]);
    expect(incidents).toHaveLength(2);
    expect(incidents.map((incident) => incident.notes)).toEqual([['A'], ['B']]);
  });

  it('coi NoFace và no_face là cùng loại; tự sắp đầu vào chưa sắp; bỏ mốc giờ hỏng', () => {
    const incidents = buildProctoringIncidents([
      ev('no_face', 20),
      { signalType: 'NoFace', detectedAt: at(0), note: null },
      { signalType: 'no_face', detectedAt: 'not-a-date', note: null },
      ev('tab_switch', 10),
    ]);
    expect(incidents.map((incident) => incident.key)).toEqual(['noface', 'tabswitch']);
    expect(incidents[0].checks).toBe(2);
    expect(incidents[0].startAt).toBe(at(0));
  });

  it('ghi chú server mang marker ⇒ đánh dấu serverRecorded; ghi chú trùng không lặp', () => {
    const incidents = buildProctoringIncidents([
      ev('identity_unverified', 0, 'mốc hỏng'),
      ev('identity_unverified', 10, 'mốc hỏng'),
      ev('monitoring_gap', 30, 'Khoảng trống [gap#123]'),
    ]);
    expect(incidents[0].notes).toEqual(['mốc hỏng']);
    expect(incidents[0].serverRecorded).toBe(false);
    expect(incidents[1].serverRecorded).toBe(true);
  });
});

describe('summarizeIncidentsByTier', () => {
  it('luôn đủ ba tầng theo thứ tự đọc; trong tầng xếp nhiều sự việc trước', () => {
    const groups = summarizeIncidentsByTier(buildProctoringIncidents([
      ev('tab_switch', 0), ev('tab_switch', 100), ev('paste', 200),
      ev('no_face', 300), ev('no_face', 310), ev('no_face', 320),
    ]));
    expect(groups.map((group) => group.priority)).toEqual(['identity', 'behavior', 'environment']);
    expect(groups[0].items).toEqual([]);
    expect(groups[1].items.map((item) => [item.key, item.incidents, item.checks])).toEqual([
      ['tabswitch', 2, 2], ['noface', 1, 3], ['paste', 1, 1],
    ]);
    expect(groups[1].items.find((item) => item.key === 'noface')?.spanSeconds).toBe(20);
  });
});
