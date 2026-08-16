import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Check, ChevronDown, Circle, Lock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { LearningLesson, LearningMilestone, LearningRoadmapDetail } from '../../types/learningPath.types';
import { theoryPath } from '../../utils/learningPathNavigation';

interface LearningSidebarProps {
  roadmap: LearningRoadmapDetail;
  currentLessonId?: string;
}

function LessonStatusIcon({ lesson, locked }: { lesson: LearningLesson; locked: boolean }) {
  if (locked) return <Lock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />;
  if (lesson.status === 'completed') {
    return <Check className="size-3.5 shrink-0 text-success" aria-hidden />;
  }
  if (lesson.status === 'in_progress') {
    return (
      <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full border border-foreground" aria-hidden>
        <span className="size-1.5 rounded-full bg-foreground" />
      </span>
    );
  }
  return <Circle className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />;
}

function MilestoneBlock({
  milestone,
  roadmapId,
  currentLessonId,
  defaultOpen,
}: {
  milestone: LearningMilestone;
  roadmapId: string;
  currentLessonId?: string;
  defaultOpen: boolean;
}) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  const locked = milestone.status === 'locked';
  const title = language === 'vi' ? milestone.titleVi : milestone.title;

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <div className="border-b border-subtle last:border-b-0">
      <button
        type="button"
        className="flex w-full items-start gap-2 px-3 py-3 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown
          className={cn(
            'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform',
            open ? 'rotate-0' : '-rotate-90',
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">
            {t('practice.learningPath.milestone').replace('{n}', String(milestone.order))}
          </span>
          <span className="block text-sm font-medium text-foreground">{title}</span>
          <span
            className={
              milestone.status === 'completed'
                ? 'mt-0.5 block text-caption text-success'
                : 'mt-0.5 block text-caption text-muted-foreground'
            }
          >
            {milestone.progressPercent}% · {t(`practice.learningPath.milestoneStatus.${milestone.status}`)}
          </span>
        </span>
      </button>

      {open ? (
        <ul className="space-y-0.5 pb-3 pl-3 pr-2">
          {milestone.lessons.map((lesson) => {
            const lessonLocked = locked || lesson.theoryStatus === 'locked';
            const lessonTitle = language === 'vi' ? lesson.titleVi : lesson.title;
            const isCurrent = lesson.id === currentLessonId;
            const canOpen =
              !lessonLocked ||
              lesson.theoryStatus === 'completed' ||
              lesson.theoryStatus === 'available';

            const content = (
              <>
                <LessonStatusIcon lesson={lesson} locked={lessonLocked} />
                <span className="min-w-0 flex-1">
                  {/* Tên bài do AI sinh, tiếng Việt thường dài hơn ô rộng 288px của sidebar.
                      `truncate` cắt còn MỘT dòng và không để lại đường nào đọc phần bị mất —
                      2 dòng + tooltip giữ được gần hết chữ, phần còn lại vẫn tra được. */}
                  <span
                    className="block line-clamp-2 break-words text-sm text-foreground"
                    title={lessonTitle}
                  >
                    {lessonTitle}
                  </span>
                  <span
                    className={
                      lesson.status === 'completed'
                        ? 'block text-caption text-success'
                        : 'block text-caption text-muted-foreground'
                    }
                  >
                    {t(`practice.learningPath.status.${lesson.status}`)}
                  </span>
                </span>
              </>
            );

            if (!canOpen) {
              return (
                <li key={lesson.id}>
                  <div className="flex items-center gap-2 rounded-lg px-2 py-2 opacity-50">{content}</div>
                </li>
              );
            }

            return (
              <li key={lesson.id}>
                <NavLink
                  to={theoryPath(roadmapId, lesson.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-2 transition',
                    isCurrent
                      ? 'bg-surface-elevated text-foreground ring-1 ring-white/10'
                      : 'hover:bg-white/[0.04]',
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {content}
                </NavLink>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function LearningSidebar({ roadmap, currentLessonId }: LearningSidebarProps) {
  const { language, t } = useLanguage();
  const name = language === 'vi' ? roadmap.nameVi : roadmap.name;

  return (
    <aside
      className="flex h-full w-full flex-col border-r border-subtle bg-surface-raised/40"
      aria-label={t('practice.learningPath.sidebarLabel')}
    >
      <div className="border-b border-subtle p-4">
        <p className="text-caption text-muted-foreground">{t('practice.learningPath.sidebarRoadmap')}</p>
        <h2 className="mt-1 text-base font-semibold text-foreground">{name}</h2>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{t('practice.learningPath.progress')}</span>
            <span>{roadmap.progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className={
                roadmap.status === 'completed'
                  ? 'h-full rounded-full bg-success transition-[width] duration-300'
                  : 'h-full rounded-full bg-foreground/80 transition-[width] duration-300'
              }
              style={{ width: `${roadmap.progressPercent}%` }}
            />
          </div>
        </div>
        <Link
          to={`/candidate/learning/roadmaps/${roadmap.id}`}
          className="btn-ghost mt-3 inline-flex w-full justify-center text-xs"
        >
          {t('practice.learningPath.backToRoadmap')}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto" aria-label={t('practice.learningPath.sidebarLessons')}>
        {roadmap.milestones.map((milestone) => {
          const hasCurrent = milestone.lessons.some((lesson) => lesson.id === currentLessonId);
          return (
            <MilestoneBlock
              key={milestone.id}
              milestone={milestone}
              roadmapId={roadmap.id}
              currentLessonId={currentLessonId}
              defaultOpen={hasCurrent || milestone.status === 'current'}
            />
          );
        })}
      </nav>
    </aside>
  );
}
