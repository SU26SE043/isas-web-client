import type { FileRecord } from '@/features/cv-analysis/types/cvAnalysis.types';
import { isCvFileType, isJdFileType } from './profileFileUtils';

export type ProfileFileTypeFilter = 'all' | 'cv' | 'jd';
export type ProfileFileSort = 'newest' | 'oldest';

export function filterAndSortProfileFiles(
  files: FileRecord[],
  typeFilter: ProfileFileTypeFilter,
  sort: ProfileFileSort,
): FileRecord[] {
  let result = files;

  if (typeFilter === 'cv') {
    result = result.filter((file) => isCvFileType(file.fileType));
  } else if (typeFilter === 'jd') {
    result = result.filter((file) => isJdFileType(file.fileType));
  }

  return [...result].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sort === 'newest' ? bTime - aTime : aTime - bTime;
  });
}

export function countProfileFilesByType(files: FileRecord[]) {
  return {
    cv: files.filter((file) => isCvFileType(file.fileType)).length,
    jd: files.filter((file) => isJdFileType(file.fileType)).length,
  };
}
