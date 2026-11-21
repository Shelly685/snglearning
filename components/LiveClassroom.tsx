'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Camera,
  CameraOff,
  FileText,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Users,
  Video,
} from 'lucide-react';
import teacherPresenterImg from '@/src/assets/images/teacher_video_presenter_1795281594351.jpg';
import { formatGradeForRegion } from '@/lib/lms-logic';
import {
  BoardStroke,
  ClassChatMessage,
  CurriculumRegion,
  Lesson,
  LivePoll,
} from '@/lib/types';
import WhiteboardCanvas from './WhiteboardCanvas';
import NotesPanel from './NotesPanel';

interface LiveClassroomProps {
  lesson: Lesson;
  allLessons: Lesson[];
  region: CurriculumRegion;
  onChangeLesson: (lesson: Lesson) => void;
  teacherStrokes: BoardStroke[];
  onChangeTeacherStrokes: (next: BoardStroke[]) => void;
  studentBoardStrokes: BoardStroke[];
  onChangeStudentBoardStrokes: (next: BoardStroke[]) => void;
  personalNotes: string;
  onChangePersonalNotes: (next: string) => void;
}

type ClassroomRole = 'student' | 'teacher';
type StudentDockTab = 'notes' | 'chat';

export default function LiveClassroom({
  lesson,
  allLessons,
  region,
  onChangeLesson,
  teacherStrokes,
  onChangeTeacherStrokes,
  studentBoardStrokes,
  onChangeStudentBoardStrokes,
  personalNotes,
  onChangePersonalNotes,
}: LiveClassroomProps) {
  const [role, setRole] = useState<ClassroomRole>('student');
  const [dockTab, setDockTab] = useState<StudentDockTab>('notes');
  const [attending, setAttending] = useState<boolean>(true);
  const [handRaised, setHandRaised] = useState<boolean>(false);

  // Teacher studio video controls (optional real webcam + safe studio preview)
  const [micOn, setMicOn] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ClassChatMessage[]>([
    {
      id: 'm1',
      sender: 'Prof. S. Gupta',
      role: 'teacher',
      text: `Welcome to today's interactive class on "${lesson.title}". Use your Student Board on the right to solve along!`,
      timestamp: '09:02',
    },
    {
      id: 'm2',
      sender: 'Aarav M.',
      role: 'student',
      text: 'Joined from Mumbai — teacher board is super clear!',
      timestamp: '09:03',
    },
  ]);

  const [livePoll, setLivePoll] = useState<LivePoll>({
    id: 'poll-1',
    question: `Quick Check: Ready to solve the main ${lesson.topic} example?`,
    options: [
      { id: 'yes', label: 'Yes, got the concept', votes: 14 },
      { id: 'review', label: 'Walk through 1 more example on board', votes: 5 },
    ],
    active: true,
  });
  const [votedOption, setVotedOption] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleTeacherCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setCameraError(null);
      return;
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError('Camera API unavailable in this browser; showing studio feed.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: micOn,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraError(null);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraError('No physical camera detected; keeping studio presenter stream active.');
      setCameraActive(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: role === 'teacher' ? 'Prof. S. Gupta (Teacher)' : 'You (Student)',
        role,
        text: trimmed,
        timestamp: hhmm,
      },
    ]);
    setChatInput('');
  };

  const handleVote = (optionId: string) => {
    if (votedOption) return;
    setVotedOption(optionId);
    setLivePoll((prev) => ({
      ...prev,
      options: prev.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      ),
    }));
  };

  const attendeeCount = attending ? 28 : 27;

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 space-y-6">
      {/* Classroom Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-indigo-700">
              Live Interactive Classroom
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatGradeForRegion(lesson.grade, region)}</span>
            <span aria-hidden="true">·</span>
            <span>{lesson.subjectLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-700">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {attendeeCount} attending
            </span>
          </div>
          <h1 className="font-display text-lg font-bold text-slate-950 truncate">
            {lesson.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="classroom-lesson-select" className="sr-only">
            Select class session
          </label>
          <select
            id="classroom-lesson-select"
            value={lesson.id}
            onChange={(e) => {
              const found = allLessons.find((l) => l.id === e.target.value);
              if (found) onChangeLesson(found);
            }}
            className="max-w-[230px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none"
          >
            {allLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {formatGradeForRegion(l.grade, region)} — {l.title}
              </option>
            ))}
          </select>

          {/* Role Switcher: Student Attending vs Teacher Studio */}
          <div
            role="group"
            aria-label="Classroom perspective"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => setRole('student')}
              aria-pressed={role === 'student'}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                role === 'student'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Student Attending
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              aria-pressed={role === 'teacher'}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                role === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Teacher Studio
            </button>
          </div>
        </div>
      </div>

      {/* Top Stage: Teacher Video Interaction (5 cols) + Teacher Blank Board (7 cols) — both visible above the fold */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Dedicated Teacher Video Section */}
        <section
          aria-label="Teacher video interaction feed"
          className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Video className="h-4 w-4 text-indigo-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="font-display text-sm font-semibold text-slate-900 truncate">
                  Teacher Video &amp; Interaction
                </h2>
                <p className="text-xs text-slate-500 truncate">
                  {role === 'teacher'
                    ? 'Broadcast camera & interact live'
                    : attending
                      ? 'Attending live class session'
                      : 'Session paused'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {role === 'teacher' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMicOn((m) => !m)}
                    aria-pressed={micOn}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                      micOn
                        ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {micOn ? (
                      <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{micOn ? 'Mic On' : 'Muted'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleTeacherCamera}
                    aria-pressed={cameraActive}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                      cameraActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {cameraActive ? (
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <CameraOff className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{cameraActive ? 'Webcam Active' : 'Enable Webcam'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setHandRaised((h) => !h)}
                    aria-pressed={handRaised}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                      handRaised
                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Hand className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttending((a) => !a)}
                    aria-pressed={attending}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      attending
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {attending ? 'Attending Class' : 'Join Class'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative flex-1 min-h-[260px] w-full bg-slate-900">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={teacherPresenterImg}
                alt="SNG Learning teacher instructing live from the classroom studio"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                referrerPolicy="no-referrer"
                className={`object-cover transition-opacity ${
                  attending || role === 'teacher' ? 'opacity-100' : 'opacity-40'
                }`}
              />
            )}

            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-4 text-white">
              <div>
                <p className="font-display text-sm font-semibold">
                  Prof. S. Gupta · {lesson.subjectLabel} Faculty
                </p>
                <p className="text-xs text-slate-200">
                  {handRaised
                    ? 'Your hand is raised — teacher notified'
                    : `Teaching: ${lesson.topic}`}
                </p>
              </div>
              {cameraError && (
                <p className="rounded bg-slate-900/90 px-2.5 py-1 text-xs text-amber-200">
                  {cameraError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Teacher's Blank Board */}
        <div className="lg:col-span-7">
          <WhiteboardCanvas
            boardId="teacher-live"
            title="Teacher Blank Board"
            subtitle={
              role === 'teacher'
                ? 'Draw live equations and diagrams — students see updates immediately'
                : 'Live synced view of your teacher’s whiteboard'
            }
            strokes={teacherStrokes}
            onChangeStrokes={role === 'teacher' ? onChangeTeacherStrokes : undefined}
            readOnly={role !== 'teacher'}
            heightClass="h-[340px]"
            defaultPaper="blank"
          />
        </div>
      </div>

      {/* Student Companion Workspace: Student Board + Notes & Download + Class Chat & Poll */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Student's Own Interactive Board */}
        <div className="lg:col-span-7">
          <WhiteboardCanvas
            boardId={`student-${lesson.id}`}
            title="Your Student Board"
            subtitle="Work out problems alongside your teacher’s board"
            strokes={studentBoardStrokes}
            onChangeStrokes={onChangeStudentBoardStrokes}
            heightClass="h-[360px]"
            defaultPaper="grid"
          />
        </div>

        {/* Right Column: Live Check-In + Notes & Download + Class Chat */}
        <div className="space-y-4 lg:col-span-5">
          {livePoll.active && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  Live Teacher Check-In
                </h3>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {livePoll.options.reduce((acc, o) => acc + o.votes, 0)} responses
                </span>
              </div>
              <p className="text-xs text-slate-700">{livePoll.question}</p>
              <div className="space-y-2">
                {livePoll.options.map((opt) => {
                  const totalVotes = livePoll.options.reduce(
                    (acc, o) => acc + o.votes,
                    0
                  );
                  const pct =
                    totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const picked = votedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(votedOption)}
                      onClick={() => handleVote(opt.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        picked
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold'
                          : 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{opt.label}</span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {pct}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div
              role="tablist"
              aria-label="Student classroom notes and chat"
              className="grid grid-cols-2 gap-1 border-b border-slate-200 bg-slate-100 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={dockTab === 'notes'}
                onClick={() => setDockTab('notes')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  dockTab === 'notes'
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
                aria-selected={dockTab === 'chat'}
                onClick={() => setDockTab('chat')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  dockTab === 'chat'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Class Chat ({messages.length})</span>
              </button>
            </div>

            <div className="p-4">
              {dockTab === 'chat' ? (
                <div className="space-y-4">
                  <div className="max-h-[260px] space-y-2.5 overflow-y-auto pr-1">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-lg border p-3 text-xs ${
                          m.role === 'teacher'
                            ? 'border-indigo-200 bg-indigo-50/70 text-slate-900'
                            : 'border-slate-200 bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-950">
                            {m.sender}
                          </span>
                          <span className="font-mono text-slate-500 tabular-nums">
                            {m.timestamp}
                          </span>
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className="flex items-center gap-2">
                    <label htmlFor="classroom-chat-input" className="sr-only">
                      Send message to live classroom
                    </label>
                    <input
                      id="classroom-chat-input"
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        role === 'teacher'
                          ? 'Post an explanation or prompt...'
                          : 'Ask your teacher a question...'
                      }
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Send classroom message"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              ) : (
                <NotesPanel
                  lesson={lesson}
                  region={region}
                  personalNotes={personalNotes}
                  onChangePersonalNotes={onChangePersonalNotes}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
