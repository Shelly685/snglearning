'use client';

import React, { useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { REGIONS, SUBJECTS, extractYouTubeId } from '@/lib/lms-logic';
import {
  AcademicGrade,
  CurriculumRegion,
  Lesson,
  SubjectId,
} from '@/lib/types';

interface AddVideoQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRegion: CurriculumRegion;
  onAddLesson: (lesson: Lesson) => void;
}

const GRADES: AcademicGrade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function AddVideoQuizModal({
  isOpen,
  onClose,
  defaultRegion,
  onAddLesson,
}: AddVideoQuizModalProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState<AcademicGrade>(10);
  const [subject, setSubject] = useState<SubjectId>('mathematics');
  const [region, setRegion] = useState<CurriculumRegion>(defaultRegion);
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedId = extractYouTubeId(videoUrl);
    if (!parsedId) {
      setError(
        'Enter a valid YouTube link (e.g. https://www.youtube.com/watch?v=WUvTyaaNkzM) or 11-character ID.'
      );
      return;
    }

    if (!topic.trim()) {
      setError('Enter the lesson topic or concept covered in this video.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          topic,
          grade,
          subject,
          region,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not generate quiz for this video.');
        setIsLoading(false);
        return;
      }

      const subjectLabel =
        SUBJECTS.find((s) => s.id === subject)?.label ?? 'General';
      const regionInfo = REGIONS.find((r) => r.id === region) ?? REGIONS[0];

      const created: Lesson = {
        id: `custom-${Date.now()}`,
        title: data.lessonData.title || topic.trim(),
        subtitle:
          data.lessonData.subtitle || `Interactive video quiz on ${topic.trim()}`,
        grade,
        academicYear,
        subject,
        subjectLabel,
        topic: topic.trim(),
        regions: [region, 'global'],
        boardAlignment: `${regionInfo.boardSystem} · Grade ${grade}`,
        durationMinutes: 12,
        videoProvider: 'youtube',
        youtubeId: data.youtubeId,
        sourceChannel: 'Curated Web Video',
        instructorNote:
          data.lessonData.instructorNote ||
          'Use your Student Board to sketch key ideas while watching.',
        notes: data.lessonData.notes || [],
        quiz: (data.lessonData.quiz || []).map(
          (
            q: {
              question: string;
              options: string[];
              correctIndex: number;
              explanation: string;
              videoTimestamp?: string;
            },
            idx: number
          ) => ({
            id: `cq-${Date.now()}-${idx}`,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            videoTimestamp: q.videoTimestamp,
          })
        ),
        isTopicTrack: true,
        isCustom: true,
      };

      onAddLesson(created);
      setVideoUrl('');
      setTopic('');
      setIsLoading(false);
      onClose();
    } catch {
      setError('Network error while contacting quiz generator.');
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2
              id="add-video-modal-title"
              className="font-display text-lg font-bold text-slate-950"
            >
              Turn Any Internet Video Into a Quiz
            </h2>
            <p className="text-xs text-slate-500">
              Paste a YouTube lecture link and generate study notes &amp; a quiz for your grade.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="video-url-input"
              className="block text-xs font-semibold text-slate-700"
            >
              YouTube Video URL
            </label>
            <input
              id="video-url-input"
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=WUvTyaaNkzM"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="video-topic-input"
              className="block text-xs font-semibold text-slate-700"
            >
              Lesson Topic or Title
            </label>
            <input
              id="video-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Derivatives & Chain Rule"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="modal-grade-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Grade / Class (1–12)
              </label>
              <select
                id="modal-grade-select"
                value={grade}
                onChange={(e) =>
                  setGrade(Number(e.target.value) as AcademicGrade)
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade / Class {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="modal-subject-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Subject
              </label>
              <select
                id="modal-subject-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectId)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900"
              >
                {SUBJECTS.filter((s) => s.id !== 'all').map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="modal-region-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Curriculum Region
              </label>
              <select
                id="modal-region-select"
                value={region}
                onChange={(e) => setRegion(e.target.value as CurriculumRegion)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="modal-year-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Academic Year
              </label>
              <select
                id="modal-year-select"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900"
              >
                <option value="2026-27">2026-27</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Generate Quiz &amp; Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
