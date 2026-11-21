'use client';

import React, { useState } from 'react';
import { Check, Download, FileText, Printer } from 'lucide-react';
import { buildDownloadableNotes } from '@/lib/lms-logic';
import { CurriculumRegion, Lesson } from '@/lib/types';

interface NotesPanelProps {
  lesson: Lesson;
  region: CurriculumRegion;
  personalNotes: string;
  onChangePersonalNotes: (next: string) => void;
}

export default function NotesPanel({
  lesson,
  region,
  personalNotes,
  onChangePersonalNotes,
}: NotesPanelProps) {
  const [downloadedLabel, setDownloadedLabel] = useState<string | null>(null);

  const triggerDownload = (format: 'md' | 'txt') => {
    const content = buildDownloadableNotes(lesson, personalNotes, region, format);
    const mime = format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeSlug = lesson.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    a.href = url;
    a.download = `sng-notes-${safeSlug}.${format}`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedLabel(format === 'md' ? 'Markdown (.md)' : 'Text (.txt)');
    setTimeout(() => setDownloadedLabel(null), 2600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header + Download Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900">
            Student Notes & Study Sheet
          </h3>
          <p className="text-xs text-slate-500">
            Combine curated takeaways with your own notes and download anytime
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => triggerDownload('md')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download Notes (.md)</span>
          </button>
          <button
            type="button"
            onClick={() => triggerDownload('txt')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download (.txt)</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print or save notes as PDF"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {downloadedLabel && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800"
        >
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <span>Downloaded study sheet as {downloadedLabel}.</span>
        </div>
      )}

      {/* Curated Lesson Notes */}
      <div className="space-y-4">
        {lesson.notes.map((section, idx) => (
          <section
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5"
          >
            <h4 className="font-display text-sm font-semibold text-slate-900">
              {String(idx + 1).padStart(2, '0')}. {section.heading}
            </h4>
            <ul className="space-y-1.5 text-sm text-slate-700 leading-relaxed list-disc pl-5">
              {section.bullets.map((bullet, bIdx) => (
                <li key={bIdx}>{bullet}</li>
              ))}
            </ul>
            {section.keyFormula && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 font-mono text-xs font-medium text-indigo-950">
                Formula: {section.keyFormula}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Personal Student Notebook */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={`student-notes-${lesson.id}`}
            className="font-display text-sm font-semibold text-slate-900"
          >
            Your Personal Study Notes
          </label>
          <span className="text-xs text-slate-500">
            Auto-saved locally · Included in download
          </span>
        </div>
        <textarea
          id={`student-notes-${lesson.id}`}
          rows={6}
          value={personalNotes}
          onChange={(e) => onChangePersonalNotes(e.target.value)}
          placeholder="Write key takeaways, questions for your teacher, or formulas to revise..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
        />
      </div>
    </div>
  );
}
