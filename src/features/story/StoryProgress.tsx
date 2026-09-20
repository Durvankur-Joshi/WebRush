import React from 'react';
import { StoryChapterViewModel } from './storyTypes';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface StoryProgressProps {
  chapters: StoryChapterViewModel[];
  currentIndex: number;
  onSelectChapter: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export const StoryProgress: React.FC<StoryProgressProps> = ({
  chapters,
  currentIndex,
  onSelectChapter,
  onPrev,
  onNext,
  canPrev,
  canNext,
}) => {
  const currentChapter = chapters[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / chapters.length) * 100);

  return (
    <div className="sticky top-2 z-30 p-3 rounded-xl bg-surface/90 backdrop-blur-md border border-border/80 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile View: CHAPTER 02 / 05 */}
        <div className="sm:hidden flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-accent-primary">
            CH {currentChapter?.chapterNumber || '01'} / {String(chapters.length).padStart(2, '0')}
          </span>
          <span className="text-[11px] font-mono text-content-dim truncate max-w-[140px]">
            {currentChapter?.themeTag}
          </span>
        </div>

        {/* Desktop Step Nav: 01 ━━━ 02 ━━━ 03 ━━━ 04 ━━━ 05 */}
        <div className="hidden sm:flex items-center gap-1.5 lg:gap-3 flex-1 overflow-x-auto py-1">
          {chapters.map((ch, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;

            return (
              <React.Fragment key={ch.id}>
                <button
                  type="button"
                  onClick={() => onSelectChapter(idx)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                    isActive
                      ? 'bg-accent-primary text-background font-bold shadow-md shadow-accent-primary/20 ring-1 ring-accent-primary'
                      : isCompleted
                      ? 'bg-surface-elevated text-content-main hover:bg-surface-muted border border-border'
                      : 'text-content-dim hover:text-content-muted hover:bg-surface-elevated'
                  }`}
                  title={`${ch.chapterNumber}: ${ch.title}`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">
                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : ch.chapterNumber}
                  </span>
                  <span className="hidden md:inline font-semibold">
                    {ch.themeTag}
                  </span>
                </button>

                {idx < chapters.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 min-w-[16px] transition-colors ${
                      idx < currentIndex ? 'bg-accent-primary' : 'bg-border'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={!canPrev}
            onClick={onPrev}
            aria-label="Previous Chapter"
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-muted text-content-main border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!canNext}
            onClick={onNext}
            aria-label="Next Chapter"
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface-muted text-content-main border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thin Mobile Progress Bar */}
      <div className="sm:hidden h-1 w-full bg-surface-elevated rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-accent-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
