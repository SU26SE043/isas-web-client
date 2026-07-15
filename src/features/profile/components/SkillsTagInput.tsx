import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { profileService } from '../services/profile.service';
import type { Skill } from '../types/profile.types';

interface SkillsTagInputProps {
  initialSkills: Skill[];
  onSaved: () => void;
}

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

export const SkillsTagInput: React.FC<SkillsTagInputProps> = ({ initialSkills, onSaved }) => {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const addSkill = () => {
    const name = input.trim();
    if (!name || skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) return;
    setSkills((prev) => [...prev, { id: `skill-${Date.now()}`, name, level: 'intermediate' }]);
    setInput('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileService.updateSkills(skills);
      toast.success(t('profile.skills.saved'));
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-default bg-surface-overlay px-3 py-2 text-sm"
          placeholder={t('profile.skills.placeholder')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } }}
        />
        <button type="button" className="btn-secondary" onClick={addSkill}>{t('profile.skills.add')}</button>
      </div>
      {skills.length === 0 ? <p className="text-sm text-muted-foreground">{t('profile.skills.empty')}</p> : null}
      <ul className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <li key={skill.id} className="flex items-center gap-2 rounded-lg border border-subtle bg-surface-overlay px-3 py-1.5 text-sm">
            <span>{skill.name}</span>
            <select
              className="rounded border border-subtle bg-surface-base px-1 py-0.5 text-xs"
              value={skill.level ?? 'intermediate'}
              onChange={(event) => setSkills((prev) => prev.map((item) => item.id === skill.id ? { ...item, level: event.target.value as Skill['level'] } : item))}
              aria-label={t('profile.skills.level')}
            >
              {LEVELS.map((level) => <option key={level} value={level}>{t(`profile.skills.${level}`)}</option>)}
            </select>
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setSkills((prev) => prev.filter((item) => item.id !== skill.id))} aria-label={t('profile.skills.remove')}>×</button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-primary" onClick={() => void handleSave()} disabled={isSaving}>
        {isSaving ? t('profile.common.saving') : t('profile.skills.save')}
      </button>
    </div>
  );
};
