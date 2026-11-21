'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export type AppView = 'explore' | 'studio' | 'classroom';

interface TopNavProps {
  activeView: AppView;
  onNavigate: (view: AppView, opts?: { topicTracksOnly?: boolean }) => void;
  onOpenAddModal: () => void;
  topicTracksActive: boolean;
}

export default function TopNav({
  activeView,
  onNavigate,
  onOpenAddModal,
  topicTracksActive,
}: TopNavProps) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('explore', { topicTracksOnly: false });
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          SNG Learning
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => onNavigate('explore', { topicTracksOnly: false })}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeView === 'explore' && !topicTracksActive
                ? 'border-indigo-600 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Grades 1–12
          </button>
          <button
            type="button"
            onClick={() => onNavigate('explore', { topicTracksOnly: true })}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeView === 'explore' && topicTracksActive
                ? 'border-indigo-600 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Topic Tracks
          </button>
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeView === 'studio'
                ? 'border-indigo-600 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Lesson Studio
          </button>
          <button
            type="button"
            onClick={() => onNavigate('classroom')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
              activeView === 'classroom'
                ? 'border-indigo-600 text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Live Classroom
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Video Quiz</span>
          </button>
        </div>
      </div>

      {/* Compact mobile nav row */}
      <div className="grid grid-cols-4 gap-1 border-t border-slate-100 px-3 py-1.5 md:hidden">
        <button
          type="button"
          onClick={() => onNavigate('explore', { topicTracksOnly: false })}
          className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md text-center whitespace-nowrap truncate ${
            activeView === 'explore' && !topicTracksActive
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600'
          }`}
        >
          Grades 1–12
        </button>
        <button
          type="button"
          onClick={() => onNavigate('explore', { topicTracksOnly: true })}
          className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md text-center whitespace-nowrap truncate ${
            activeView === 'explore' && topicTracksActive
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600'
          }`}
        >
          Topics
        </button>
        <button
          type="button"
          onClick={() => onNavigate('studio')}
          className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md text-center whitespace-nowrap truncate ${
            activeView === 'studio'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600'
          }`}
        >
          Studio
        </button>
        <button
          type="button"
          onClick={() => onNavigate('classroom')}
          className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md text-center whitespace-nowrap truncate ${
            activeView === 'classroom'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600'
          }`}
        >
          Live Class
        </button>
      </div>
    </header>
  );
}
