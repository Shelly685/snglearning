'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  PenTool,
  Video,
} from 'lucide-react';
import { formatGradeForRegion } from '@/lib/lms-logic';
import { BoardStroke, CurriculumRegion, Lesson } from '@/lib/types';
import QuizPanel from './QuizPanel';
import NotesPanel from './NotesPanel';
import WhiteboardCanvas from './WhiteboardCanvas';

interface LessonStudioProps {
  lesson: Lesson;
  allLessons: Lesson[];
  region: CurriculumRegion;
  personalNotes: string;
  onChangePersonalNotes: (next: string) => void;
  studentBoardStrokes: BoardStroke[];
  onChangeStudentBoardStrokes: (next: BoardStroke[]) => void;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onBackToCatalog: () => void;
  onSwitchLesson: (lesson: Lesson) => void;
  onEnterLiveClass: () => void;
}

type StudioTab = 'quiz' | 'notes' | 'board';

export default function LessonStudio({
  lesson,
  allLessons,
  region,
  personalNotes,
  onChangePersonalNotes,
  studentBoardStrokes,
  onChangeStudentBoardStrokes,
  isCompleted,
  onToggleComplete,
  onBackToCatalog,
  onSwitchLesson,
  onEnterLiveClass,
}: LessonStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('quiz');
  const [startSeconds, setStartSeconds] = useState<number>(0);

  const handleJumpToTimestamp = (ts: string) => {
    const parts = ts.split(':').map((n) => parseInt(n, 10));
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      setStartSeconds(parts[0] * 60 + parts[1]);
    }
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0${
    startSeconds > 0 ? `&start=${startSeconds}` : ''
  }`;

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 space-y-6">
      {/* Studio Sub-header */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>All Lessons</span>
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-indigo-700">
                {formatGradeForRegion(lesson.grade, region)}
              </span>
              <span aria-hidden="true">·</span>
              <span>{lesson.subjectLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.topic}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{lesson.academicYear}</span>
            </div>
            <h1 className="font-display text-lg font-bold text-slate-950 truncate">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="studio-lesson-switch" className="sr-only">
            Switch lesson
          </label>
          <select
            id="studio-lesson-switch"
            value={lesson.id}
            onChange={(e) => {
              const found = allLessons.find((l) => l.id === e.target.value);
              if (found) {
                setStartSeconds(0);
                onSwitchLesson(found);
              }
            }}
            className="max-w-[230px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
          >
            {allLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {formatGradeForRegion(l.grade, region)} — {l.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleComplete}
            aria-pressed={isCompleted}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isCompleted
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>

          <button
            type="button"
            onClick={onEnterLiveClass}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Video className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Join Live Class</span>
          </button>
        </div>
      </div>

      {/* Two-Zone Split Stage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Zone: Curated Internet Video Lecture + Instructor Guidance */}
        <div className="no-print space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <div className="aspect-video w-full">
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={`${lesson.title} — ${lesson.sourceChannel}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-indigo-700">
                Curated Video Lecture · {lesson.sourceChannel}
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-slate-600 hover:text-indigo-700 hover:underline"
              >
                Watch on YouTube
              </a>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {lesson.subtitle}. Aligned with {lesson.boardAlignment}.
            </p>
            <div className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Teacher Tip: </span>
              {lesson.instructorNote}
            </div>
          </div>

          {/* Quick-access Student Board preview directly below video if on another tab */}
          {activeTab !== 'board' && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-slate-900">
                  Need to work out a problem while watching?
                </p>
                <p className="text-xs text-slate-500">
                  Your personal Student Board saves your sketches and lets you download PNGs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <PenTool className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                <span>Open Student Board</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Zone: Interactive Tabs (Quiz | Notes & Download | Student Board) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            role="tablist"
            aria-label="Lesson workspace tools"
            className="no-print grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'quiz'}
              onClick={() => setActiveTab('quiz')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Quiz ({lesson.quiz.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'notes'}
              onClick={() => setActiveTab('notes')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Notes &amp; Download</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'board'}
              onClick={() => setActiveTab('board')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'board'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Student Board</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            {activeTab === 'quiz' && (
              <QuizPanel
                lessonId={lesson.id}
                questions={lesson.quiz}
                sourceChannel={lesson.sourceChannel}
                onJumpToTimestamp={handleJumpToTimestamp}
              />
            )}

            {activeTab === 'notes' && (
              <NotesPanel
                lesson={lesson}
                region={region}
                personalNotes={personalNotes}
                onChangePersonalNotes={onChangePersonalNotes}
              />
            )}

            {activeTab === 'board' && (
              <WhiteboardCanvas
                boardId={`student-${lesson.id}`}
                title="Student Practice Board"
                subtitle="Work out math steps, diagrams, or handwritten notes"
                strokes={studentBoardStrokes}
                onChangeStrokes={onChangeStudentBoardStrokes}
                heightClass="h-[360px]"
                defaultPaper="grid"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
