'use client';

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { gradeQuiz } from '@/lib/lms-logic';
import { QuizQuestion, QuizResult } from '@/lib/types';

interface QuizPanelProps {
  lessonId: string;
  questions: QuizQuestion[];
  sourceChannel: string;
  onJumpToTimestamp?: (timestamp: string) => void;
}

export default function QuizPanel({
  lessonId,
  questions,
  sourceChannel,
  onJumpToTimestamp,
}: QuizPanelProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedResult, setSubmittedResult] = useState<QuizResult | null>(null);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submittedResult) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = gradeQuiz(questions, selectedAnswers);
    setSubmittedResult(result);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmittedResult(null);
  };

  const answeredCount = questions.filter(
    (q) => typeof selectedAnswers[q.id] === 'number'
  ).length;

  return (
    <div className="space-y-5" data-testid={`quiz-panel-${lessonId}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900">
            Video Comprehension Quiz
          </h3>
          <p className="text-xs text-slate-500">
            Built directly from {sourceChannel} lecture concepts
          </p>
        </div>
        <span className="font-mono text-xs font-medium text-slate-600 tabular-nums">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      {submittedResult && (
        <div
          role="status"
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
            submittedResult.passed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-amber-200 bg-amber-50 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {submittedResult.passed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
            )}
            <div>
              <p className="font-display text-sm font-semibold tabular-nums">
                Score: {submittedResult.score} / {submittedResult.total} ({submittedResult.percentage}%) —{' '}
                {submittedResult.passed ? 'Concept Mastered' : 'Review Recommended'}
              </p>
              <p className="text-xs opacity-85">
                {submittedResult.passed
                  ? 'Great work! Check any explanations below or continue to your notes.'
                  : 'Revisit the highlighted video timestamps below and try again.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry Quiz</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, qIdx) => {
          const selected = selectedAnswers[q.id];
          const breakdownItem = submittedResult?.breakdown.find(
            (b) => b.questionId === q.id
          );

          return (
            <fieldset
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <legend className="text-sm font-semibold text-slate-900 leading-snug">
                  <span className="font-mono text-indigo-600 mr-1.5 tabular-nums">
                    {String(qIdx + 1).padStart(2, '0')}.
                  </span>
                  {q.question}
                </legend>
                {q.videoTimestamp && (
                  <button
                    type="button"
                    onClick={() => onJumpToTimestamp?.(q.videoTimestamp!)}
                    className="font-mono text-xs text-indigo-600 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    @{q.videoTimestamp}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isChecked = selected === optIdx;
                  const isCorrectOpt = q.correctIndex === optIdx;

                  let stateStyle =
                    'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800';
                  if (submittedResult) {
                    if (isCorrectOpt) {
                      stateStyle =
                        'border-emerald-400 bg-emerald-50 text-emerald-950 font-medium';
                    } else if (isChecked && !isCorrectOpt) {
                      stateStyle =
                        'border-rose-300 bg-rose-50 text-rose-950';
                    } else {
                      stateStyle = 'border-slate-200 bg-white text-slate-500';
                    }
                  } else if (isChecked) {
                    stateStyle =
                      'border-indigo-600 bg-indigo-50 text-indigo-950 font-medium';
                  }

                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${stateStyle}`}
                    >
                      <input
                        type="radio"
                        name={`quiz-${q.id}`}
                        value={optIdx}
                        checked={isChecked}
                        disabled={Boolean(submittedResult)}
                        onChange={() => handleSelect(q.id, optIdx)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <span className="flex-1">{opt}</span>
                      {submittedResult && isCorrectOpt && (
                        <span className="text-xs font-semibold text-emerald-700">
                          Correct
                        </span>
                      )}
                      {submittedResult && isChecked && !isCorrectOpt && (
                        <span className="text-xs font-semibold text-rose-700">
                          Your pick
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {breakdownItem && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Explanation: </span>
                  {q.explanation}
                </p>
              )}
            </fieldset>
          );
        })}

        {!submittedResult && (
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="submit"
              disabled={answeredCount === 0}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
            >
              Check Answers
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
