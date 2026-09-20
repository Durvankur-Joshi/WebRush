import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RouteId } from '../../types/common';
import { useLifeAnalytics } from '../../hooks';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { StoryChapterViewModel } from './storyTypes';
import { buildStoryViewModels, computeStorySummaryMetrics } from './storyModel';
import { StoryHero } from './StoryHero';
import { StoryProgress } from './StoryProgress';
import { StoryChapter } from './StoryChapter';
import { StoryCompletion } from './StoryCompletion';
import {
  buildConstellationGraph,
  ConstellationCanvas,
  ConstellationDetailPanel,
  ConstellationNodeData,
} from '../constellation';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';

export interface StoryViewProps {
  initialParams?: Record<string, string>;
  onNavigate?: (route: RouteId, params?: Record<string, string>) => void;
}

export const StoryView: React.FC<StoryViewProps> = ({ initialParams, onNavigate }) => {
  const { analytics, loading, error, reload } = useLifeAnalytics();

  // Navigation & Chapter State
  const initialChapterParam = initialParams?.chapter ? Number(initialParams.chapter) - 1 : 0;
  const [started, setStarted] = useState<boolean>(Boolean(initialParams?.chapter));
  const [currentIndex, setCurrentIndex] = useState<number>(Math.max(0, initialChapterParam));
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [evidenceModalChapter, setEvidenceModalChapter] = useState<StoryChapterViewModel | null>(null);

  // Constellation node selection state for Chapter 5
  const [selectedConstellationNode, setSelectedConstellationNode] = useState<ConstellationNodeData | null>(null);
  const [hoveredConstellationNode, setHoveredConstellationNode] = useState<ConstellationNodeData | null>(null);

  // Memoized Chapters & Metrics
  const chapters = useMemo(() => {
    if (!analytics) return [];
    return buildStoryViewModels(analytics);
  }, [analytics]);

  const summaryMetrics = useMemo(() => {
    if (!analytics) {
      return {
        listeningRecords: '0',
        householdReceipts: '0',
        transactionRecords: '0',
        totalDiscoveries: 0,
        totalConnections: 0,
        totalYears: 12,
      };
    }
    return computeStorySummaryMetrics(analytics);
  }, [analytics]);

  const constellationGraph = useMemo(() => {
    if (!analytics) return { nodes: [], edges: [] };
    return buildConstellationGraph(analytics);
  }, [analytics]);

  // Sync if URL query parameter changes
  useEffect(() => {
    if (initialParams?.chapter) {
      const idx = Number(initialParams.chapter) - 1;
      if (idx >= 0 && idx < chapters.length) {
        setCurrentIndex(idx);
        setStarted(true);
        setIsCompleted(false);
      }
    }
  }, [initialParams?.chapter, chapters.length]);

  // Sync hash state when navigating chapters
  useEffect(() => {
    if (started && !isCompleted && chapters.length > 0) {
      const targetHash = `#story?chapter=${currentIndex + 1}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [started, isCompleted, currentIndex, chapters.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (evidenceModalChapter) {
        if (e.key === 'Escape') setEvidenceModalChapter(null);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (started && !isCompleted) {
          if (currentIndex < chapters.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setIsCompleted(true);
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (started && !isCompleted && currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, isCompleted, currentIndex, chapters.length, evidenceModalChapter]);

  // Handlers
  const handleBeginStory = useCallback(() => {
    setStarted(true);
    setCurrentIndex(0);
    setIsCompleted(false);
  }, []);

  const handleNextChapter = useCallback(() => {
    if (currentIndex < chapters.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex, chapters.length]);

  const handlePrevChapter = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex]);

  const handleSelectChapter = useCallback((index: number) => {
    setCurrentIndex(index);
    setStarted(true);
    setIsCompleted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExploreReceipts = useCallback(
    (chapter: StoryChapterViewModel) => {
      onNavigate?.('explore', chapter.drillDownParams);
    },
    [onNavigate]
  );

  const handleViewDiscovery = useCallback(
    (chapter: StoryChapterViewModel) => {
      onNavigate?.('discover', chapter.discoveryId ? { discoveryId: chapter.discoveryId } : undefined);
    },
    [onNavigate]
  );

  // Loading State
  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center animate-fadeIn">
        <LoadingState
          message="BUILDING YOUR STORY..."
          subtext="Chronologically synthesizing longitudinal telemetry into an evidence-backed narrative..."
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  // Error State
  if (error || !analytics) {
    return (
      <div className="py-20 flex items-center justify-center animate-fadeIn">
        <ErrorState
          title="STORY UNAVAILABLE"
          message={error || 'Your story could not be assembled.'}
          onRetry={reload}
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  // Empty State
  if (chapters.length === 0) {
    return (
      <div className="py-20 flex items-center justify-center animate-fadeIn">
        <EmptyState
          title="NO STORY CHAPTERS DETECTED"
          description="There are not enough verified patterns in the source telemetry to generate a narrative arc."
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  const currentChapter = chapters[currentIndex];
  const totalReceipts = analytics.spotify.totalRecords + analytics.household.totalRecords + analytics.transactions.totalRecords;

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      {/* 1. STORY HERO (Always visible at top when not started, or compact banner when started) */}
      {!started && (
        <StoryHero
          metrics={summaryMetrics}
          onBeginStory={handleBeginStory}
        />
      )}

      {/* 2. ACTIVE CHAPTER EXPERIENCE */}
      {started && !isCompleted && currentChapter && (
        <div className="space-y-8">
          {/* Chapter Step Progress Navigation Bar */}
          <StoryProgress
            chapters={chapters}
            currentIndex={currentIndex}
            onSelectChapter={handleSelectChapter}
            onPrev={handlePrevChapter}
            onNext={handleNextChapter}
            canPrev={currentIndex > 0}
            canNext={true}
          />

          {/* Active Chapter Layout */}
          <StoryChapter
            chapter={currentChapter}
            isLastChapter={currentIndex === chapters.length - 1}
            onShowEvidence={(ch) => setEvidenceModalChapter(ch)}
            onExploreReceipts={handleExploreReceipts}
            onViewDiscovery={handleViewDiscovery}
            onNextChapter={handleNextChapter}
            onPrevChapter={handlePrevChapter}
            canPrev={currentIndex > 0}
            embeddedConstellationNode={
              currentChapter.order === 5 ? (
                <div className="rounded-xl border border-border/80 bg-surface/60 overflow-hidden">
                  <div className="p-3 bg-surface-elevated/40 border-b border-border/70 flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-content-main">
                      Interactive Life Constellation
                    </span>
                    <span className="text-[10px] text-content-dim">
                      {constellationGraph.nodes.length} Connected Nodes
                    </span>
                  </div>
                  <div className="p-2 sm:p-4 bg-background/50">
                    <ConstellationCanvas
                      nodes={constellationGraph.nodes}
                      edges={constellationGraph.edges}
                      selectedNode={selectedConstellationNode}
                      hoveredNode={hoveredConstellationNode}
                      onSelectNode={setSelectedConstellationNode}
                      onHoverNode={setHoveredConstellationNode}
                    />
                  </div>
                  <div className="p-4 border-t border-border/70">
                    <ConstellationDetailPanel
                      node={selectedConstellationNode || hoveredConstellationNode}
                      onClose={() => {
                        setSelectedConstellationNode(null);
                        setHoveredConstellationNode(null);
                      }}
                      onExploreReceipts={(node) => {
                        let params: Record<string, string> = { stream: 'spotify' };
                        if (node.id === 'stream-spotify') params = { stream: 'spotify' };
                        else if (node.id === 'stream-household') params = { stream: 'household' };
                        else if (node.id === 'stream-transactions') params = { stream: 'transactions' };
                        onNavigate?.('explore', params);
                      }}
                    />
                  </div>
                </div>
              ) : undefined
            }
          />
        </div>
      )}

      {/* 3. STORY COMPLETION SCREEN */}
      {isCompleted && (
        <StoryCompletion
          totalDiscoveries={summaryMetrics.totalDiscoveries}
          totalConnections={summaryMetrics.totalConnections}
          totalReceiptsFormatted={`${totalReceipts.toLocaleString()}+`}
          onReplayStory={() => {
            setIsCompleted(false);
            setCurrentIndex(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onExploreDiscoveries={() => onNavigate?.('discover')}
          onOpenConstellation={() => onNavigate?.('discover')}
          onExploreReceipts={() => onNavigate?.('explore')}
        />
      )}

      {/* 4. EVIDENCE MODAL DRAWER */}
      {evidenceModalChapter && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Evidence for Chapter: ${evidenceModalChapter.title}`}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-fadeIn"
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-accent-primary/50 bg-surface shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    CHAPTER {evidenceModalChapter.chapterNumber} EVIDENCE
                  </Badge>
                  <span className="font-mono text-[10px] text-content-dim uppercase">
                    {evidenceModalChapter.primaryDataset}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-content-main mt-1">
                  {evidenceModalChapter.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setEvidenceModalChapter(null)}
                aria-label="Close evidence modal"
                className="p-1.5 rounded-lg text-content-dim hover:text-content-main hover:bg-surface-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <span className="font-bold text-content-main block uppercase">
                Underlying Ground-Truth Measurements
              </span>

              <div className="space-y-2">
                {evidenceModalChapter.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-elevated/70 border border-border/70 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-content-main font-semibold">
                        {ev.metric}
                      </div>
                      <div className="text-[10px] text-content-dim">
                        Epoch: {ev.period} {ev.sampleSize ? `(n=${ev.sampleSize.toLocaleString()})` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-accent-primary">
                        {typeof ev.value === 'number' ? ev.value.toLocaleString() : ev.value}
                      </span>{' '}
                      <span className="text-[10px] text-content-muted">{ev.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {evidenceModalChapter.primaryDataset === 'cross-temporal' && (
                <div className="p-2.5 rounded bg-surface/70 border border-border-subtle text-[10px] text-content-dim">
                  * {CAUSALITY_DISCLAIMER}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs font-mono">
              <Button variant="ghost" size="sm" onClick={() => setEvidenceModalChapter(null)}>
                Close
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const ch = evidenceModalChapter;
                  setEvidenceModalChapter(null);
                  handleExploreReceipts(ch);
                }}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
                className="font-bold font-mono"
              >
                Explore Receipts →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
