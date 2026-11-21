'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Circle,
  Download,
  Eraser,
  Grid3X3,
  Highlighter,
  Minus,
  PenTool,
  Redo2,
  Square,
  Trash2,
  Undo2,
} from 'lucide-react';
import { BoardStroke } from '@/lib/types';

export type BoardPaperMode = 'blank' | 'grid' | 'ruled';

interface WhiteboardCanvasProps {
  boardId: string;
  title: string;
  subtitle?: string;
  strokes: BoardStroke[];
  onChangeStrokes?: (next: BoardStroke[]) => void;
  readOnly?: boolean;
  heightClass?: string;
  defaultPaper?: BoardPaperMode;
}

const COLORS = [
  { id: 'ink', label: 'Slate Ink', hex: '#0F172A' },
  { id: 'indigo', label: 'Indigo', hex: '#4F46E5' },
  { id: 'emerald', label: 'Emerald', hex: '#059669' },
  { id: 'crimson', label: 'Crimson', hex: '#DC2626' },
  { id: 'amber', label: 'Amber', hex: '#D97706' },
];

const WIDTHS = [
  { id: 'fine', label: 'Fine', value: 2 },
  { id: 'medium', label: 'Medium', value: 4 },
  { id: 'bold', label: 'Bold', value: 8 },
];

export default function WhiteboardCanvas({
  boardId,
  title,
  subtitle,
  strokes,
  onChangeStrokes,
  readOnly = false,
  heightClass = 'h-[400px]',
  defaultPaper = 'blank',
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<BoardStroke['tool']>('pen');
  const [color, setColor] = useState<string>('#0F172A');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [paperMode, setPaperMode] = useState<BoardPaperMode>(defaultPaper);
  const [redoStack, setRedoStack] = useState<BoardStroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<BoardStroke | null>(null);

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      if (paperMode === 'grid') {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        const step = 28;
        ctx.beginPath();
        for (let x = step; x < width; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = step; y < height; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (paperMode === 'ruled') {
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        const step = 32;
        ctx.beginPath();
        for (let y = step; y < height; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }
    },
    [paperMode]
  );

  const renderStroke = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: BoardStroke) => {
      if (stroke.points.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = stroke.width * 3.5;
        ctx.globalAlpha = 1;
      } else if (stroke.tool === 'highlighter') {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width * 3.5;
        ctx.globalAlpha = 0.28;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.globalAlpha = 1;
      }

      const first = stroke.points[0];
      const last = stroke.points[stroke.points.length - 1];

      if (stroke.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      } else if (stroke.tool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(
          first.x,
          first.y,
          last.x - first.x,
          last.y - first.y
        );
      } else if (stroke.tool === 'circle') {
        const rx = last.x - first.x;
        const ry = last.y - first.y;
        const radius = Math.sqrt(rx * rx + ry * ry);
        ctx.beginPath();
        ctx.arc(first.x, first.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        if (stroke.points.length === 1) {
          ctx.lineTo(first.x + 0.1, first.y + 0.1);
        } else {
          for (let i = 1; i < stroke.points.length; i++) {
            const p = stroke.points[i];
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      ctx.restore();
    },
    []
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBackground(ctx, width, height);

    for (const s of strokes) {
      renderStroke(ctx, s);
    }
    if (activeStroke) {
      renderStroke(ctx, activeStroke);
    }
    ctx.restore();
  }, [activeStroke, drawBackground, renderStroke, strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      redraw();
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getRelativePoint = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) * 10) / 10,
      y: Math.round((e.clientY - rect.top) * 10) / 10,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getRelativePoint(e);
    setActiveStroke({
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tool,
      color,
      width: strokeWidth,
      points: [point],
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly || !activeStroke) return;
    const point = getRelativePoint(e);
    setActiveStroke((prev) =>
      prev
        ? {
            ...prev,
            points:
              prev.tool === 'line' ||
              prev.tool === 'rect' ||
              prev.tool === 'circle'
                ? [prev.points[0], point]
                : [...prev.points, point],
          }
        : null
    );
  };

  const finishStroke = () => {
    if (readOnly || !activeStroke) return;
    const next = [...strokes, activeStroke];
    setActiveStroke(null);
    setRedoStack([]);
    onChangeStrokes?.(next);
  };

  const handleUndo = () => {
    if (readOnly || strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setRedoStack((prev) => [...prev, last]);
    onChangeStrokes?.(strokes.slice(0, -1));
  };

  const handleRedo = () => {
    if (readOnly || redoStack.length === 0) return;
    const popped = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    onChangeStrokes?.([...strokes, popped]);
  };

  const handleClear = () => {
    if (readOnly || strokes.length === 0) return;
    setRedoStack([]);
    onChangeStrokes?.([]);
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${boardId}-board.png`;
    a.click();
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header + Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold text-slate-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!readOnly && (
            <>
              <div
                role="toolbar"
                aria-label={`${title} drawing tools`}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
              >
                <button
                  type="button"
                  onClick={() => setTool('pen')}
                  aria-label="Pen tool"
                  aria-pressed={tool === 'pen'}
                  className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                    tool === 'pen'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PenTool className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setTool('highlighter')}
                  aria-label="Highlighter tool"
                  aria-pressed={tool === 'highlighter'}
                  className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                    tool === 'highlighter'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Highlighter className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setTool('line')}
                  aria-label="Line tool"
                  aria-pressed={tool === 'line'}
                  className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                    tool === 'line'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setTool('rect')}
                  aria-label="Rectangle tool"
                  aria-pressed={tool === 'rect'}
                  className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                    tool === 'rect'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Square className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setTool('circle')}
                  aria-label="Circle tool"
                  aria-pressed={tool === 'circle'}
                  className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                    tool === 'circle'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Circle className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setTool('eraser')}
                  aria-label="Eraser tool"
                  aria-pressed={tool === 'eraser'}
                  className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                    tool === 'eraser'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Eraser className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Color Swatches */}
              <div
                aria-label="Ink colors"
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5"
              >
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-label={`Select ${c.label}`}
                    aria-pressed={color === c.hex}
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-4 w-4 rounded-full cursor-pointer transition-transform ${
                      color === c.hex
                        ? 'ring-2 ring-indigo-600 ring-offset-1 scale-110'
                        : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                {WIDTHS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setStrokeWidth(w.value)}
                    aria-label={`${w.label} stroke width`}
                    aria-pressed={strokeWidth === w.value}
                    className={`rounded px-2 py-1 text-xs font-medium cursor-pointer whitespace-nowrap ${
                      strokeWidth === w.value
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Paper Surface Toggle */}
          <button
            type="button"
            onClick={() =>
              setPaperMode((prev) =>
                prev === 'blank' ? 'grid' : prev === 'grid' ? 'ruled' : 'blank'
              )
            }
            aria-label={`Switch paper style (current: ${paperMode})`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
          >
            <Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="capitalize">{paperMode}</span>
          </button>

          {!readOnly && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                aria-label={`Undo on ${title}`}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                aria-label={`Redo on ${title}`}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <Redo2 className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={strokes.length === 0}
                aria-label={`Clear ${title}`}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownloadPng}
            aria-label={`Download ${title} as PNG`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas Surface */}
      <div
        ref={containerRef}
        className={`relative w-full ${heightClass} bg-white select-none`}
      >
        <canvas
          ref={canvasRef}
          data-testid={`whiteboard-canvas-${boardId}`}
          data-stroke-count={strokes.length}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          className={`h-full w-full touch-none ${
            readOnly ? 'cursor-default' : 'cursor-crosshair'
          }`}
        />

        {strokes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-xs font-medium text-slate-400">
              {readOnly
                ? 'Teacher blank board is ready — live strokes appear here.'
                : 'Blank board ready — draw diagrams, solve equations, or sketch notes.'}
            </p>
          </div>
        )}
      </div>

      {/* Clean Footer Status */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-1.5 text-xs text-slate-500">
        <span>{readOnly ? 'Live read-only feed from Teacher' : 'Interactive canvas saved locally'}</span>
        <span className="font-mono tabular-nums">
          {strokes.length} {strokes.length === 1 ? 'stroke' : 'strokes'}
        </span>
      </div>
    </div>
  );
}
