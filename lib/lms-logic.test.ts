import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDownloadableNotes,
  extractYouTubeId,
  filterLessons,
  formatGradeForRegion,
  gradeQuiz,
} from './lms-logic';
import { Lesson, QuizQuestion } from './types';

const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'math-10-quad',
    title: 'Quadratic Equations & Roots',
    subtitle: 'Visualizing parabolas and solving with the quadratic formula',
    grade: 10,
    academicYear: '2026-27',
    subject: 'mathematics',
    subjectLabel: 'Mathematics',
    topic: 'Algebra & Quadratics',
    regions: ['global', 'india', 'usa', 'uk', 'ib'],
    boardAlignment: 'CBSE Class 10 / GCSE / Algebra II',
    durationMinutes: 14,
    videoProvider: 'youtube',
    youtubeId: 'i7idZfS8t8w',
    sourceChannel: 'Khan Academy',
    instructorNote: 'Pause at 05:20 to test discriminant cases.',
    notes: [
      {
        heading: 'Standard Form',
        bullets: ['ax^2 + bx + c = 0 where a != 0'],
        keyFormula: 'x = (-b ± sqrt(b^2 - 4ac)) / 2a',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What determines the number of real roots?',
        options: ['The y-intercept', 'The discriminant b^2 - 4ac', 'The slope'],
        correctIndex: 1,
        explanation: 'The discriminant b^2 - 4ac determines 2, 1, or 0 real roots.',
        videoTimestamp: '04:15',
      },
      {
        id: 'q2',
        question: 'In ax^2 + bx + c = 0, which coefficient cannot be zero?',
        options: ['a', 'b', 'c'],
        correctIndex: 0,
        explanation: 'If a = 0, the equation becomes linear rather than quadratic.',
      },
    ],
    isTopicTrack: true,
  },
  {
    id: 'sci-4-fractions',
    title: 'Fractions on a Number Line',
    subtitle: 'Understanding parts of a whole visually',
    grade: 4,
    academicYear: '2025-26',
    subject: 'mathematics',
    subjectLabel: 'Mathematics',
    topic: 'Fractions & Ratios',
    regions: ['india', 'global'],
    boardAlignment: 'NCERT Class 4 / Grade 4',
    durationMinutes: 9,
    videoProvider: 'youtube',
    youtubeId: 'n0FZhQ_GkKw',
    sourceChannel: 'Math Antics',
    instructorNote: 'Draw equal segments on your student board.',
    notes: [
      {
        heading: 'Numerator & Denominator',
        bullets: ['Denominator is total equal parts; numerator is counted parts.'],
      },
    ],
    quiz: [
      {
        id: 'q3',
        question: 'What does the bottom number of a fraction tell you?',
        options: ['Total equal parts', 'Shaded parts', 'Whole numbers'],
        correctIndex: 0,
        explanation: 'The denominator counts how many equal parts make one whole.',
      },
    ],
    isTopicTrack: false,
  },
];

test('formatGradeForRegion localizes Grade 1-12 across global boards', () => {
  assert.equal(formatGradeForRegion(10, 'india'), 'Class 10');
  assert.equal(formatGradeForRegion(10, 'usa'), 'Grade 10');
  assert.equal(formatGradeForRegion(10, 'uk'), 'Year 11');
  assert.equal(formatGradeForRegion(12, 'uk'), 'Year 13');
  assert.equal(formatGradeForRegion(3, 'ib'), 'PYP 3');
  assert.equal(formatGradeForRegion(8, 'ib'), 'MYP 3');
  assert.equal(formatGradeForRegion(11, 'ib'), 'DP 1');
});

test('filterLessons filters accurately by grade, region, subject, year, and topic query', () => {
  const onlyGrade10 = filterLessons(SAMPLE_LESSONS, {
    region: 'india',
    grade: 10,
    subject: 'all',
    academicYear: 'All Years',
    topicQuery: '',
  });
  assert.equal(onlyGrade10.length, 1);
  assert.equal(onlyGrade10[0].id, 'math-10-quad');

  const ukYearFiltered = filterLessons(SAMPLE_LESSONS, {
    region: 'uk',
    grade: 'all',
    subject: 'mathematics',
    academicYear: '2026-27',
    topicQuery: 'parabolas',
  });
  assert.equal(ukYearFiltered.length, 1);

  const topicTracksOnly = filterLessons(SAMPLE_LESSONS, {
    region: 'global',
    grade: 'all',
    subject: 'all',
    academicYear: 'All Years',
    topicQuery: '',
    onlyTopicTracks: true,
  });
  assert.equal(topicTracksOnly.length, 1);
  assert.equal(topicTracksOnly[0].id, 'math-10-quad');
});

test('gradeQuiz computes score, percentage, pass threshold, and breakdown', () => {
  const questions: QuizQuestion[] = SAMPLE_LESSONS[0].quiz;
  const fullPass = gradeQuiz(questions, { q1: 1, q2: 0 });
  assert.equal(fullPass.score, 2);
  assert.equal(fullPass.total, 2);
  assert.equal(fullPass.percentage, 100);
  assert.equal(fullPass.passed, true);

  const halfFail = gradeQuiz(questions, { q1: 1, q2: 2 });
  assert.equal(halfFail.score, 1);
  assert.equal(halfFail.percentage, 50);
  assert.equal(halfFail.passed, false);
  assert.equal(halfFail.breakdown[0].isCorrect, true);
  assert.equal(halfFail.breakdown[1].isCorrect, false);
});

test('extractYouTubeId handles standard, short, embed, shorts, and invalid URLs', () => {
  assert.equal(
    extractYouTubeId('https://www.youtube.com/watch?v=WUvTyaaNkzM&t=12s'),
    'WUvTyaaNkzM'
  );
  assert.equal(extractYouTubeId('https://youtu.be/WUvTyaaNkzM'), 'WUvTyaaNkzM');
  assert.equal(
    extractYouTubeId('https://www.youtube.com/embed/WUvTyaaNkzM'),
    'WUvTyaaNkzM'
  );
  assert.equal(
    extractYouTubeId('https://www.youtube.com/shorts/WUvTyaaNkzM'),
    'WUvTyaaNkzM'
  );
  assert.equal(extractYouTubeId('WUvTyaaNkzM'), 'WUvTyaaNkzM');
  assert.equal(extractYouTubeId('https://example.com/not-youtube'), null);
});

test('buildDownloadableNotes includes curated summary, localized level, and personal notes', () => {
  const md = buildDownloadableNotes(
    SAMPLE_LESSONS[0],
    'Remember to check b^2 - 4ac first!',
    'india',
    'md'
  );
  assert.ok(md.includes('# Quadratic Equations & Roots'));
  assert.ok(md.includes('Class 10 (2026-27)'));
  assert.ok(md.includes('Remember to check b^2 - 4ac first!'));
  assert.ok(md.includes('x = (-b ± sqrt(b^2 - 4ac)) / 2a'));

  const txt = buildDownloadableNotes(SAMPLE_LESSONS[0], '', 'uk', 'txt');
  assert.ok(txt.includes('Year 11 (2026-27)'));
  assert.ok(txt.includes('(No personal notes added yet.)'));
});
