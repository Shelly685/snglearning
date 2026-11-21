'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Globe2,
  PlayCircle,
  Search,
  Video,
} from 'lucide-react';
import heroStudioImg from '@/src/assets/images/hero_learning_studio_1795281581860.jpg';
import {
  ACADEMIC_YEARS,
  REGIONS,
  SUBJECTS,
  formatGradeForRegion,
} from '@/lib/lms-logic';
import {
  AcademicGrade,
  CurriculumRegion,
  Lesson,
  SubjectId,
} from '@/lib/types';

interface CurriculumExplorerProps {
  lessons: Lesson[];
  region: CurriculumRegion;
  onChangeRegion: (r: CurriculumRegion) => void;
  grade: AcademicGrade | 'all';
  onChangeGrade: (g: AcademicGrade | 'all') => void;
  subject: SubjectId | 'all';
  onChangeSubject: (s: SubjectId | 'all') => void;
  academicYear: string;
  onChangeAcademicYear: (y: string) => void;
  topicQuery: string;
  onChangeTopicQuery: (q: string) => void;
  onlyTopicTracks: boolean;
  onToggleTopicTracks: (next: boolean) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onEnterClassroom: (lesson?: Lesson) => void;
  completedLessonIds: string[];
}

const GRADES: AcademicGrade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function CurriculumExplorer({
  lessons,
  region,
  onChangeRegion,
  grade,
  onChangeGrade,
  subject,
  onChangeSubject,
  academicYear,
  onChangeAcademicYear,
  topicQuery,
  onChangeTopicQuery,
  onlyTopicTracks,
  onToggleTopicTracks,
  onSelectLesson,
  onEnterClassroom,
  completedLessonIds,
}: CurriculumExplorerProps) {
  const activeRegionInfo = REGIONS.find((r) => r.id === region) ?? REGIONS[0];

  return (
    <div className="space-y-10 pb-16">
      {/* Compact Editorial Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-stretch gap-8 px-6 py-10 lg:grid-cols-12 lg:py-12">
          <div className="flex flex-col justify-center space-y-5 lg:col-span-7">
            <p className="text-xs font-semibold tracking-wide text-indigo-700">
              S&amp;G Tutorial Services · Grades 1–12 &amp; Global Curricula
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] [text-wrap:balance] max-w-2xl">
              Master Every Grade, Subject &amp; Topic Without Getting Bored.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600">
              Curated video lectures from the world&apos;s finest educators, instant
              video-linked quizzes, downloadable study notes, personal student
              whiteboards, and live interactive teacher classrooms.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = lessons[0];
                  if (target) onSelectLesson(target);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 cursor-pointer whitespace-nowrap shrink-0"
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                <span>Open Lesson Studio</span>
              </button>
              <button
                type="button"
                onClick={() => onEnterClassroom(lessons[0])}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Video className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                <span>Attend Live Teacher Class</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 lg:h-full min-h-[260px]">
              <Image
                src={heroStudioImg}
                alt="Students collaborating in a sunlit SNG Learning study studio with notebooks and tablets"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
                referrerPolicy="no-referrer"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-5 text-white">
                <p className="font-display text-sm font-semibold">
                  Built for India &amp; Learners Worldwide
                </p>
                <p className="text-xs text-slate-200">
                  CBSE / NCERT · US Common Core · UK GCSE · IB &amp; IGCSE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Curriculum, Year, Grade 1-12, Subject & Topic Filter Bar */}
      <section
        aria-label="Curriculum and grade filters"
        className="mx-auto max-w-[1440px] px-6 space-y-6"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
          {/* Row 1: Region + Academic Year + Topic-Wise Toggle + Search */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
                <Globe2 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                Curriculum:
              </span>
              <div
                role="group"
                aria-label="Select world curriculum region"
                className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
              >
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onChangeRegion(r.id)}
                    aria-pressed={region === r.id}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      region === r.id
                        ? 'bg-white text-slate-950 shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {r.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Academic Year Select */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="academic-year-select"
                  className="text-xs font-semibold text-slate-700 whitespace-nowrap"
                >
                  Academic Year
                </label>
                <select
                  id="academic-year-select"
                  value={academicYear}
                  onChange={(e) => onChangeAcademicYear(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic-wise Toggle */}
              <button
                type="button"
                onClick={() => onToggleTopicTracks(!onlyTopicTracks)}
                aria-pressed={onlyTopicTracks}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  onlyTopicTracks
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Topic-Wise Tracks Only</span>
              </button>

              {/* Topic / Keyword Search */}
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="Search topics, lessons, or channels"
                  value={topicQuery}
                  onChange={(e) => onChangeTopicQuery(e.target.value)}
                  placeholder="Search topic (e.g. Calculus, Cells)..."
                  className="w-60 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Grade / Class / Year 1-12 Matrix */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Level ({activeRegionInfo.boardSystem})
              </span>
              <span className="text-xs text-slate-500">
                Grades 1 through 12
              </span>
            </div>
            <div
              role="group"
              aria-label="Filter by grade or class 1 to 12"
              className="flex flex-wrap items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => onChangeGrade('all')}
                aria-pressed={grade === 'all'}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  grade === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Grades
              </button>
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChangeGrade(g)}
                  aria-pressed={grade === g}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium tabular-nums transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    grade === g
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {formatGradeForRegion(g, region)}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Subject-wise Filter */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <span className="block text-xs font-semibold text-slate-700">
              Subject
            </span>
            <div
              role="group"
              aria-label="Filter by subject"
              className="flex flex-wrap items-center gap-1.5"
            >
              {SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => onChangeSubject(subj.id)}
                  aria-pressed={subject === subj.id}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    subject === subj.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {subj.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-950">
              {onlyTopicTracks ? 'Topic-Wise Mastery Tracks' : 'Academic Lesson Library'}
            </h2>
            <p className="text-xs text-slate-500 tabular-nums">
              Showing {lessons.length} curated {lessons.length === 1 ? 'lesson' : 'lessons'} ·{' '}
              {activeRegionInfo.label}
            </p>
          </div>
        </div>

        {/* Lesson Grid */}
        {lessons.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-slate-900">
              No lessons match these filters yet
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-500">
              Reset your grade or subject filter, or use &ldquo;Add Video Quiz&rdquo; to
              create a custom lesson from any educational YouTube video.
            </p>
            <button
              type="button"
              onClick={() => {
                onChangeGrade('all');
                onChangeSubject('all');
                onChangeAcademicYear('All Years');
                onChangeTopicQuery('');
                onToggleTopicTracks(false);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              const isDone = completedLessonIds.includes(lesson.id);
              const localizedLevel = formatGradeForRegion(lesson.grade, region);

              return (
                <article
                  key={lesson.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Clean unboxed metadata row (zero-pill rule) */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-700">
                        {localizedLevel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lesson.subjectLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {lesson.academicYear}
                      </span>
                      {isDone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-emerald-700">
                            Completed
                          </span>
                        </>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-display text-base font-bold text-slate-950 leading-snug">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {lesson.subtitle}
                      </p>
                    </div>

                    <div className="pt-1 text-xs text-slate-500 space-y-1">
                      <p>
                        <span className="font-medium text-slate-700">Topic:</span>{' '}
                        {lesson.topic}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Video:</span>{' '}
                        {lesson.sourceChannel} · {lesson.durationMinutes} min ·{' '}
                        {lesson.quiz.length} quiz Qs
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Open Lesson</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEnterClassroom(lesson)}
                      className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Live Class View
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
