'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { INITIAL_LESSONS } from '@/lib/curriculum-data';
import { filterLessons } from '@/lib/lms-logic';
import {
  AcademicGrade,
  BoardStroke,
  CurriculumRegion,
  Lesson,
  SubjectId,
} from '@/lib/types';
import TopNav, { AppView } from './TopNav';
import CurriculumExplorer from './CurriculumExplorer';
import LessonStudio from './LessonStudio';
import LiveClassroom from './LiveClassroom';
import AddVideoQuizModal from './AddVideoQuizModal';

const STORAGE_KEYS = {
  notes: 'sng_learning_notes_v1',
  studentBoards: 'sng_learning_student_boards_v1',
  teacherBoard: 'sng_learning_teacher_board_v1',
  completed: 'sng_learning_completed_v1',
  customLessons: 'sng_learning_custom_lessons_v1',
};

export default function SngLearningApp() {
  const [activeView, setActiveView] = useState<AppView>('explore');
  const [region, setRegion] = useState<CurriculumRegion>('global');
  const [grade, setGrade] = useState<AcademicGrade | 'all'>('all');
  const [subject, setSubject] = useState<SubjectId | 'all'>('all');
  const [academicYear, setAcademicYear] = useState<string>('All Years');
  const [topicQuery, setTopicQuery] = useState<string>('');
  const [onlyTopicTracks, setOnlyTopicTracks] = useState<boolean>(false);

  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>(
    INITIAL_LESSONS[5].id // Default Grade 10 Quadratic Equations
  );
  const [notesByLesson, setNotesByLesson] = useState<Record<string, string>>({});
  const [studentBoardsByLesson, setStudentBoardsByLesson] = useState<
    Record<string, BoardStroke[]>
  >({});
  const [teacherStrokes, setTeacherStrokes] = useState<BoardStroke[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Hydrate persisted state from localStorage + support ?view= or ?autostart=1
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedNotes = localStorage.getItem(STORAGE_KEYS.notes);
        if (savedNotes) setNotesByLesson(JSON.parse(savedNotes));

        const savedStudentBoards = localStorage.getItem(STORAGE_KEYS.studentBoards);
        if (savedStudentBoards) setStudentBoardsByLesson(JSON.parse(savedStudentBoards));

        const savedTeacherBoard = localStorage.getItem(STORAGE_KEYS.teacherBoard);
        if (savedTeacherBoard) setTeacherStrokes(JSON.parse(savedTeacherBoard));

        const savedCompleted = localStorage.getItem(STORAGE_KEYS.completed);
        if (savedCompleted) setCompletedLessonIds(JSON.parse(savedCompleted));

        const savedCustom = localStorage.getItem(STORAGE_KEYS.customLessons);
        if (savedCustom) setCustomLessons(JSON.parse(savedCustom));
      } catch {
        // Ignore storage parse issues
      }

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        if (viewParam === 'studio' || params.get('autostart') === '1') {
          setActiveView('studio');
        } else if (viewParam === 'classroom') {
          setActiveView('classroom');
        }
      }
    });
  }, []);

  // Cross-tab live sync for Teacher Blank Board
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }
    const channel = new BroadcastChannel('sng-live-teacher-board');
    channel.onmessage = (event) => {
      if (Array.isArray(event.data)) {
        setTeacherStrokes(event.data);
      }
    };
    return () => channel.close();
  }, []);

  const allLessons = useMemo(
    () => [...customLessons, ...INITIAL_LESSONS],
    [customLessons]
  );

  const filteredLessons = useMemo(
    () =>
      filterLessons(allLessons, {
        region,
        grade,
        subject,
        academicYear,
        topicQuery,
        onlyTopicTracks,
      }),
    [allLessons, region, grade, subject, academicYear, topicQuery, onlyTopicTracks]
  );

  const activeLesson = useMemo(
    () =>
      allLessons.find((l) => l.id === activeLessonId) ??
      filteredLessons[0] ??
      allLessons[0],
    [allLessons, activeLessonId, filteredLessons]
  );

  const handleNavigate = (
    view: AppView,
    opts?: { topicTracksOnly?: boolean }
  ) => {
    setActiveView(view);
    if (typeof opts?.topicTracksOnly === 'boolean') {
      setOnlyTopicTracks(opts.topicTracksOnly);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePersonalNotes = (lessonId: string, next: string) => {
    setNotesByLesson((prev) => {
      const updated = { ...prev, [lessonId]: next };
      try {
        localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(updated));
      } catch {
        // Ignore storage quota errors
      }
      return updated;
    });
  };

  const handleUpdateStudentBoard = (lessonId: string, next: BoardStroke[]) => {
    setStudentBoardsByLesson((prev) => {
      const updated = { ...prev, [lessonId]: next };
      try {
        localStorage.setItem(STORAGE_KEYS.studentBoards, JSON.stringify(updated));
      } catch {
        // Ignore storage quota errors
      }
      return updated;
    });
  };

  const handleUpdateTeacherBoard = (next: BoardStroke[]) => {
    setTeacherStrokes(next);
    try {
      localStorage.setItem(STORAGE_KEYS.teacherBoard, JSON.stringify(next));
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('sng-live-teacher-board');
        channel.postMessage(next);
        channel.close();
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleToggleComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const exists = prev.includes(lessonId);
      const updated = exists
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      try {
        localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  const handleAddCustomLesson = (created: Lesson) => {
    setCustomLessons((prev) => {
      const updated = [created, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.customLessons, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
    setActiveLessonId(created.id);
    setActiveView('studio');
  };

  return (
    <div id="top" className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <TopNav
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        topicTracksActive={onlyTopicTracks}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <CurriculumExplorer
                lessons={filteredLessons}
                region={region}
                onChangeRegion={setRegion}
                grade={grade}
                onChangeGrade={setGrade}
                subject={subject}
                onChangeSubject={setSubject}
                academicYear={academicYear}
                onChangeAcademicYear={setAcademicYear}
                topicQuery={topicQuery}
                onChangeTopicQuery={setTopicQuery}
                onlyTopicTracks={onlyTopicTracks}
                onToggleTopicTracks={setOnlyTopicTracks}
                completedLessonIds={completedLessonIds}
                onSelectLesson={(lesson) => {
                  setActiveLessonId(lesson.id);
                  setActiveView('studio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onEnterClassroom={(lesson) => {
                  if (lesson) setActiveLessonId(lesson.id);
                  setActiveView('classroom');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {activeView === 'studio' && activeLesson && (
            <motion.div
              key={`studio-${activeLesson.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <LessonStudio
                lesson={activeLesson}
                allLessons={allLessons}
                region={region}
                personalNotes={notesByLesson[activeLesson.id] ?? ''}
                onChangePersonalNotes={(next) =>
                  handleUpdatePersonalNotes(activeLesson.id, next)
                }
                studentBoardStrokes={studentBoardsByLesson[activeLesson.id] ?? []}
                onChangeStudentBoardStrokes={(next) =>
                  handleUpdateStudentBoard(activeLesson.id, next)
                }
                isCompleted={completedLessonIds.includes(activeLesson.id)}
                onToggleComplete={() => handleToggleComplete(activeLesson.id)}
                onBackToCatalog={() => setActiveView('explore')}
                onSwitchLesson={(l) => setActiveLessonId(l.id)}
                onEnterLiveClass={() => setActiveView('classroom')}
              />
            </motion.div>
          )}

          {activeView === 'classroom' && activeLesson && (
            <motion.div
              key={`classroom-${activeLesson.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              <LiveClassroom
                lesson={activeLesson}
                allLessons={allLessons}
                region={region}
                onChangeLesson={(l) => setActiveLessonId(l.id)}
                teacherStrokes={teacherStrokes}
                onChangeTeacherStrokes={handleUpdateTeacherBoard}
                studentBoardStrokes={studentBoardsByLesson[activeLesson.id] ?? []}
                onChangeStudentBoardStrokes={(next) =>
                  handleUpdateStudentBoard(activeLesson.id, next)
                }
                personalNotes={notesByLesson[activeLesson.id] ?? ''}
                onChangePersonalNotes={(next) =>
                  handleUpdatePersonalNotes(activeLesson.id, next)
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-semibold text-slate-900">
              SNG Learning
            </span>
            <span aria-hidden="true">·</span>
            <span>Part of the S&amp;G Tutorial Services Ecosystem</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://s-gtutorialservices.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              S&amp;G Tutorials Home
            </a>
            <button
              type="button"
              onClick={() => handleNavigate('explore', { topicTracksOnly: false })}
              className="hover:text-slate-900 hover:underline cursor-pointer"
            >
              Grades 1–12
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('classroom')}
              className="hover:text-slate-900 hover:underline cursor-pointer"
            >
              Live Classroom
            </button>
          </div>
        </div>
      </footer>

      <AddVideoQuizModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultRegion={region}
        onAddLesson={handleAddCustomLesson}
      />
    </div>
  );
}
