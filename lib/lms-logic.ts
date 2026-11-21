import {
  AcademicGrade,
  CurriculumRegion,
  Lesson,
  QuizQuestion,
  QuizResult,
  SubjectId,
} from './types';

export interface RegionInfo {
  id: CurriculumRegion;
  label: string;
  shortLabel: string;
  boardSystem: string;
  gradePrefix: string;
}

export const REGIONS: RegionInfo[] = [
  {
    id: 'global',
    label: 'Global Standard (K-12)',
    shortLabel: 'Global',
    boardSystem: 'International K-12',
    gradePrefix: 'Grade',
  },
  {
    id: 'india',
    label: 'India (CBSE / ICSE / NCERT)',
    shortLabel: 'India',
    boardSystem: 'CBSE / ICSE / NCERT',
    gradePrefix: 'Class',
  },
  {
    id: 'usa',
    label: 'United States (Common Core / AP)',
    shortLabel: 'USA',
    boardSystem: 'Common Core / AP',
    gradePrefix: 'Grade',
  },
  {
    id: 'uk',
    label: 'United Kingdom (Key Stages / GCSE)',
    shortLabel: 'UK',
    boardSystem: 'UK National / GCSE',
    gradePrefix: 'Year',
  },
  {
    id: 'ib',
    label: 'International Baccalaureate / IGCSE',
    shortLabel: 'IB / IGCSE',
    boardSystem: 'IB & Cambridge',
    gradePrefix: 'Level',
  },
];

export const SUBJECTS: { id: SubjectId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Subjects' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'biology', label: 'Biology' },
  { id: 'computer-science', label: 'Computer Science' },
  { id: 'history', label: 'History & Civics' },
  { id: 'economics', label: 'Economics' },
  { id: 'english', label: 'English' },
];

export const ACADEMIC_YEARS = ['All Years', '2026-27', '2025-26'];

export function formatGradeForRegion(
  grade: AcademicGrade,
  region: CurriculumRegion
): string {
  switch (region) {
    case 'india':
      return `Class ${grade}`;
    case 'uk':
      return `Year ${grade === 12 ? 13 : grade + 1}`;
    case 'ib':
      if (grade <= 5) return `PYP ${grade}`;
      if (grade <= 10) return `MYP ${grade - 5}`;
      return `DP ${grade - 10}`;
    case 'usa':
    case 'global':
    default:
      return `Grade ${grade}`;
  }
}

export interface LessonFilterCriteria {
  region: CurriculumRegion;
  grade: AcademicGrade | 'all';
  subject: SubjectId | 'all';
  academicYear: string;
  topicQuery: string;
  onlyTopicTracks?: boolean;
}

export function filterLessons(
  lessons: Lesson[],
  criteria: LessonFilterCriteria
): Lesson[] {
  const query = criteria.topicQuery.trim().toLowerCase();

  return lessons.filter((lesson) => {
    if (
      criteria.region !== 'global' &&
      !lesson.regions.includes(criteria.region) &&
      !lesson.regions.includes('global')
    ) {
      return false;
    }

    if (criteria.grade !== 'all' && lesson.grade !== criteria.grade) {
      return false;
    }

    if (criteria.subject !== 'all' && lesson.subject !== criteria.subject) {
      return false;
    }

    if (
      criteria.academicYear !== 'All Years' &&
      lesson.academicYear !== criteria.academicYear
    ) {
      return false;
    }

    if (criteria.onlyTopicTracks && !lesson.isTopicTrack) {
      return false;
    }

    if (query.length > 0) {
      const haystack = [
        lesson.title,
        lesson.subtitle,
        lesson.topic,
        lesson.subjectLabel,
        lesson.boardAlignment,
        lesson.sourceChannel,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function gradeQuiz(
  questions: QuizQuestion[],
  selectedAnswers: Record<string, number>
): QuizResult {
  const total = questions.length;
  let score = 0;

  const breakdown = questions.map((q) => {
    const selected =
      typeof selectedAnswers[q.id] === 'number' ? selectedAnswers[q.id] : null;
    const isCorrect = selected !== null && selected === q.correctIndex;
    if (isCorrect) {
      score += 1;
    }
    return {
      questionId: q.id,
      selectedIndex: selected,
      correctIndex: q.correctIndex,
      isCorrect,
    };
  });

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    score,
    total,
    percentage,
    passed: percentage >= 60,
    breakdown,
  };
}

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const parts = url.pathname.split('/').filter(Boolean);
      if (
        (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') &&
        parts[1] &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function buildDownloadableNotes(
  lesson: Lesson,
  personalNotes: string,
  region: CurriculumRegion,
  format: 'md' | 'txt'
): string {
  const gradeLabel = formatGradeForRegion(lesson.grade, region);
  const videoUrl = `https://www.youtube.com/watch?v=${lesson.youtubeId}`;

  if (format === 'txt') {
    const sections = lesson.notes
      .map((sec) => {
        const bullets = sec.bullets.map((b) => `  - ${b}`).join('\n');
        const formula = sec.keyFormula ? `\n  Key Formula: ${sec.keyFormula}` : '';
        return `${sec.heading.toUpperCase()}\n${bullets}${formula}`;
      })
      .join('\n\n');

    return [
      `SNG LEARNING — STUDENT STUDY NOTES`,
      `========================================`,
      `Lesson: ${lesson.title}`,
      `Level: ${gradeLabel} (${lesson.academicYear}) | Subject: ${lesson.subjectLabel}`,
      `Topic: ${lesson.topic} | Alignment: ${lesson.boardAlignment}`,
      `Video Source: ${lesson.sourceChannel} (${videoUrl})`,
      ``,
      `CURATED LESSON SUMMARY`,
      `----------------------------------------`,
      sections,
      ``,
      `MY PERSONAL NOTES`,
      `----------------------------------------`,
      personalNotes.trim() || '(No personal notes added yet.)',
      ``,
    ].join('\n');
  }

  const mdSections = lesson.notes
    .map((sec) => {
      const bullets = sec.bullets.map((b) => `- ${b}`).join('\n');
      const formula = sec.keyFormula
        ? `\n> **Key Formula:** \`${sec.keyFormula}\`\n`
        : '';
      return `### ${sec.heading}\n\n${bullets}${formula}`;
    })
    .join('\n\n');

  return [
    `# ${lesson.title}`,
    ``,
    `- **Platform:** SNG Learning (S&G Tutorial Services)`,
    `- **Level:** ${gradeLabel} (${lesson.academicYear})`,
    `- **Subject:** ${lesson.subjectLabel} — ${lesson.topic}`,
    `- **Board Alignment:** ${lesson.boardAlignment}`,
    `- **Curated Lecture:** [${lesson.sourceChannel}](${videoUrl})`,
    ``,
    `---`,
    ``,
    `## Curated Lesson Notes`,
    ``,
    mdSections,
    ``,
    `---`,
    ``,
    `## Student Personal Notes`,
    ``,
    personalNotes.trim() || '_No personal notes added yet._',
    ``,
  ].join('\n');
}
