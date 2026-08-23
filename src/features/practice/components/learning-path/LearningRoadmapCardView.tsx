import React from 'react';
import { BarChart3, BookOpen, CalendarDays, Eye, Flag, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapCard } from '../../types/learningPath.types';
import { continueLearningPath } from '../../utils/learningPathNavigation';

export const LearningRoadmapCardView: React.FC<{ roadmap: LearningRoadmapCard }> = ({ roadmap }) => {
  const { language, t } = useLanguage();
  const name = language === 'vi' ? roadmap.nameVi : roadmap.name;
  const domain = language === 'vi' ? roadmap.domainLabelVi : roadmap.domainLabel;
  const milestone = language === 'vi' ? roadmap.currentMilestoneTitleVi : roadmap.currentMilestoneTitle;
  const lesson = language === 'vi' ? roadmap.currentLessonTitleVi : roadmap.currentLessonTitle;
  const updated = new Date(roadmap.updatedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US');
  const statusClass = roadmap.status === 'completed' ? 'border-success/35 bg-success/10 text-success-light' : roadmap.status === 'in_progress' ? 'border-warning/35 bg-warning/10 text-warning-light' : 'border-subtle bg-surface-overlay text-muted-foreground';

  return <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-satin bg-surface-raised p-5 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-info/45 hover:shadow-[0_24px_55px_-28px_rgba(59,130,246,0.28)] sm:p-7">
    <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-info/50 bg-info/10 text-info shadow-[0_0_24px_-10px_var(--color-info)]"><GitBranch className="size-6" aria-hidden /></div><div className="min-w-0"><h2 className="line-clamp-2 break-words text-xl font-semibold text-foreground" title={name}>{name}</h2><p className="mt-1 truncate text-sm text-muted-foreground" title={`${domain} · ${t(`practice.roadmapWizard.mode.${roadmap.mode === 'Reinforce' ? 'reinforce' : 'levelUp'}`)} · ${t(`practice.roadmapWizard.level.${roadmap.targetLevel}`)}`}>{domain} · {t(`practice.roadmapWizard.mode.${roadmap.mode === 'Reinforce' ? 'reinforce' : 'levelUp'}`)} · {t(`practice.roadmapWizard.level.${roadmap.targetLevel}`)}</p></div></div><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}><span className="size-1.5 rounded-full bg-current" aria-hidden />{t(`practice.learningPath.status.${roadmap.status}`)}</span></div>
    <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{t('practice.learningPath.progress')}</span><span>{roadmap.progressPercent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-overlay"><div className="h-full rounded-full bg-info transition-[width] duration-300" style={{ width: `${roadmap.progressPercent}%` }} /></div></div>
    <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-lg border border-satin bg-surface-overlay/40"><Info icon={Flag} label={t('practice.learningPath.currentMilestone')} value={milestone || '—'} /><Info icon={BookOpen} label={t('practice.learningPath.currentLesson')} value={lesson || '—'} /><Info icon={CalendarDays} label={t('practice.learningPath.updated')} value={updated} /></dl>
    <div className="mt-5 grid grid-cols-2 gap-3"><Link to={continueLearningPath(roadmap)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-info/70 bg-info/10 px-4 py-3 text-sm font-semibold text-foreground shadow-[0_0_24px_-10px_var(--color-info)] transition-colors hover:bg-info/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"><BarChart3 className="size-5 text-info" aria-hidden />{t('practice.learningPath.continue')}</Link><Link to={`/candidate/learning/roadmaps/${roadmap.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-satin bg-surface-overlay px-4 py-3 text-sm font-semibold text-foreground transition hover:border-info/45 hover:bg-info/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"><Eye className="size-4" aria-hidden />{t('practice.learningPath.viewDetails')}</Link></div>
  </article>;
};

// Ô hẹp nhất của thẻ (1/3 chiều ngang) nhưng lại đựng thứ dài nhất: tên mốc / tên bài do AI sinh.
// Một dòng ở đây thường chỉ còn 2-3 chữ. `title` đã có sẵn nên chữ không mất hẳn, nhưng nới lên
// 2 dòng để phần lớn trường hợp đọc được ngay mà không phải rê chuột.
function Info({ icon: Icon, label, value }: { icon: typeof Flag; label: string; value: string }) { return <div className="min-w-0 p-3"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4 shrink-0" aria-hidden />{label}</dt><dd className="mt-2 line-clamp-2 break-words text-sm font-medium text-foreground" title={value}>{value}</dd></div>; }
