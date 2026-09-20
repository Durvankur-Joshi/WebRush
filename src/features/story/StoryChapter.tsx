import React from 'react';
import { StoryChapterViewModel } from './storyTypes';
import { StoryVisualization } from './StoryVisualization';
import { StoryEvidence } from './StoryEvidence';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  ArrowRight,
  Sparkles,
  Compass,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';

export interface StoryChapterProps {
  chapter: StoryChapterViewModel;
  isLastChapter: boolean;
  onShowEvidence: (chapter: StoryChapterViewModel) => void;
  onExploreReceipts: (chapter: StoryChapterViewModel) => void;
  onViewDiscovery: (chapter: StoryChapterViewModel) => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  canPrev: boolean;
  embeddedConstellationNode?: React.ReactNode;
}

export const StoryChapter: React.FC<StoryChapterProps> = ({
  chapter,
  isLastChapter,
  onShowEvidence,
  onExploreReceipts,
  onViewDiscovery,
  onNextChapter,
  onPrevChapter,
  canPrev,
  embeddedConstellationNode,
}) => {
  return (
    <article
      aria-label={`Story Chapter ${chapter.chapterNumber}: ${chapter.title}`}
      className="space-y-8 animate-fadeIn"
    >
      {/* 1. Editorial Chapter Header */}
      <div className="space-y-3 border-b border-border/70 pb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-accent-primary uppercase tracking-widest">
              CHAPTER {chapter.chapterNumber}
            </span>
            <span className="text-content-dim">•</span>
            <Badge variant="primary" size="sm" className="font-mono text-[10px] tracking-wider">
              {chapter.themeTag}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase">
              {chapter.primaryDataset} stream
            </Badge>
            <span className="font-mono text-[11px] text-content-dim flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {chapter.period}
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-content-main tracking-tight font-heading leading-tight">
          {chapter.title}
        </h2>

        <p className="text-sm sm:text-base font-mono text-accent-primary font-medium">
          {chapter.subtitle}
        </p>
      </div>

      {/* 2. Key Metrics Row */}
      {chapter.keyMetrics && chapter.keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {chapter.keyMetrics.map((km, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-surface border border-border/80 flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono uppercase text-content-dim">
                {km.label}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-content-main truncate">
                {km.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 3. Narrative Text Section */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface/50 border border-border/70 text-sm sm:text-base text-content-muted leading-relaxed font-sans space-y-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-accent-primary font-bold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          Observational Narrative
        </div>
        <p className="text-content-main leading-relaxed">
          {chapter.narrative}
        </p>
      </div>

      {/* 4. Embedded Visualization */}
      {chapter.visualizationConfig && (
        <div className="space-y-3">
          <StoryVisualization config={chapter.visualizationConfig} />
        </div>
      )}

      {/* 5. Embedded Constellation Knowledge Network if Chapter 5 */}
      {embeddedConstellationNode && (
        <div className="space-y-4 pt-4 border-t border-border/70">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent-primary animate-spin-slow" />
            <h3 className="font-bold text-content-main text-base font-heading">
              Interactive Constellation Network
            </h3>
          </div>
          {embeddedConstellationNode}
        </div>
      )}

      {/* 6. Evidentiary Proof Section */}
      <div className="space-y-3">
        <StoryEvidence
          evidence={chapter.evidence}
          source={chapter.primaryDataset}
          period={chapter.period}
        />
      </div>

      {/* 7. Action Bar & Chapter Step Navigation */}
      <div className="pt-6 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Secondary Evidence & Discovery Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowEvidence(chapter)}
            icon={<FileText className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Show Evidence
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExploreReceipts(chapter)}
            icon={<Compass className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Explore Supporting Receipts
          </Button>

          {chapter.discoveryId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDiscovery(chapter)}
              icon={<Sparkles className="w-3.5 h-3.5" />}
              className="text-xs font-mono text-accent-primary hover:underline"
            >
              View Discovery
            </Button>
          )}
        </div>

        {/* Primary Next / Prev Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {canPrev && (
            <Button
              variant="secondary"
              size="md"
              onClick={onPrevChapter}
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
              className="text-xs font-mono"
            >
              Previous Chapter
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={onNextChapter}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="text-xs font-mono font-bold shadow-md shadow-accent-primary/20"
          >
            {isLastChapter ? 'Complete Story →' : `Continue to Chapter 0${chapter.order + 1} →`}
          </Button>
        </div>
      </div>
    </article>
  );
};
