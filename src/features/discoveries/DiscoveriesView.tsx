import React, { useState, useMemo, useCallback } from 'react';
import { RouteId } from '../../types/common';
import { useLifeAnalytics } from '../../hooks';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DiscoveryFilterType,
  DiscoverySortOption,
  DiscoveryViewModel,
} from './discoveryTypes';
import {
  buildDiscoveryViewModels,
  computeDiscoveriesSummary,
  filterDiscoveries,
  sortDiscoveries,
} from './discoveryModel';
import { DiscoveriesHero } from './DiscoveriesHero';
import { DiscoveryFilters } from './DiscoveryFilters';
import { DiscoveryGrid } from './DiscoveryGrid';
import { DiscoveryEvidencePanel } from './DiscoveryEvidencePanel';
import {
  buildConstellationGraph,
  ConstellationCanvas,
  ConstellationDetailPanel,
  ConstellationNodeData,
} from '../constellation';
import {
  Compass,
  Sparkles,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';

export interface DiscoveriesViewProps {
  onNavigate?: (route: RouteId, params?: Record<string, string>) => void;
}

export const DiscoveriesView: React.FC<DiscoveriesViewProps> = ({ onNavigate }) => {
  const { analytics, loading, error, reload } = useLifeAnalytics();

  // Filter & Search State
  const [activeFilter, setActiveFilter] = useState<DiscoveryFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<DiscoverySortOption>('confidence');

  // Modal Evidence Panel State
  const [inspectingDiscovery, setInspectingDiscovery] = useState<DiscoveryViewModel | null>(null);

  // Constellation Selection State
  const [selectedNode, setSelectedNode] = useState<ConstellationNodeData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ConstellationNodeData | null>(null);

  // Memoized View Models
  const allViewModels = useMemo(() => {
    if (!analytics) return [];
    return buildDiscoveryViewModels(analytics);
  }, [analytics]);

  const filteredDiscoveries = useMemo(() => {
    const filtered = filterDiscoveries(allViewModels, activeFilter, searchQuery);
    return sortDiscoveries(filtered, sortBy);
  }, [allViewModels, activeFilter, searchQuery, sortBy]);

  const summaryMetrics = useMemo(() => {
    if (!analytics) {
      return {
        totalDiscoveries: 0,
        totalConnections: 0,
        totalStreams: 3,
        criticalCount: 0,
        highConfidenceCount: 0,
      };
    }
    return computeDiscoveriesSummary(analytics);
  }, [analytics]);

  const constellationGraph = useMemo(() => {
    if (!analytics) return { nodes: [], edges: [] };
    return buildConstellationGraph(analytics);
  }, [analytics]);

  // Handler: Drill-down to Explorer from Discovery
  const handleExploreReceipts = useCallback(
    (discovery: DiscoveryViewModel) => {
      onNavigate?.('explore', discovery.drillDownParams);
    },
    [onNavigate]
  );

  // Handler: Drill-down to Explorer from Constellation Node
  const handleExploreConstellationNode = useCallback(
    (node: ConstellationNodeData) => {
      let params: Record<string, string> = { stream: 'spotify' };

      if (node.id === 'stream-spotify') params = { stream: 'spotify' };
      else if (node.id === 'stream-household') params = { stream: 'household' };
      else if (node.id === 'stream-transactions') params = { stream: 'transactions' };
      else if (node.id.includes('beatles')) params = { stream: 'spotify', search: 'Beatles' };
      else if (node.id.includes('skip')) params = { stream: 'spotify', year: '2015', skipped: 'skipped' };
      else if (node.id.includes('2020')) params = { stream: 'spotify', year: '2020' };
      else if (node.id.includes('food')) params = { stream: 'household', category: 'Food' };
      else if (node.id.includes('money-transfer')) params = { stream: 'household', category: 'Money transfer', sortBy: 'magnitude' };
      else if (node.id.includes('travel')) params = { stream: 'transactions', category: 'travel', sortBy: 'magnitude' };
      else if (node.id.includes('online')) params = { stream: 'transactions', category: 'online_shopping' };
      else if (node.id.includes('tamil')) params = { stream: 'transactions', state: 'Tamil Nadu' };
      else params = { stream: node.source === 'cross-temporal' ? 'spotify' : node.source };

      onNavigate?.('explore', params);
    },
    [onNavigate]
  );

  // Loading State
  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center animate-fadeIn">
        <LoadingState
          message="MAPPING YOUR PATTERNS..."
          subtext="Evaluating statistical thresholds, synthesizing verified discoveries, and plotting the celestial constellation..."
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
          title="DISCOVERIES UNAVAILABLE"
          message={error || 'Your discoveries could not be loaded.'}
          onRetry={reload}
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  // Empty State
  if (analytics.discoveries.length === 0) {
    return (
      <div className="py-20 flex items-center justify-center animate-fadeIn">
        <EmptyState
          title="NO STRONG PATTERNS DETECTED"
          description="The analytics engine found no recurring patterns meeting the rigorous empirical confidence threshold."
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  const totalReceipts = analytics.spotify.totalRecords + analytics.household.totalRecords + analytics.transactions.totalRecords;

  return (
    <div className="space-y-16 sm:space-y-20 animate-fadeIn pb-20">
      {/* 1. DISCOVERIES HERO */}
      <DiscoveriesHero
        metrics={summaryMetrics}
        totalReceiptsFormatted={`${totalReceipts.toLocaleString()}+`}
      />

      {/* 2. DISCOVERIES GRID & FILTERS */}
      <section id="discoveries-feed" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SectionHeader
            tag="ALGORITHMIC FINDINGS // PATTERNS & SHIFTS"
            title="Verified Discoveries"
            description="Algorithmic patterns verified against ground-truth receipts. Select any discovery to inspect its evidentiary breakdown or drill down to raw records."
            level="h2"
          />

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant="success" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              PII Sanitized
            </Badge>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <DiscoveryFilters
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalMatching={filteredDiscoveries.length}
        />

        {/* Discoveries Feed (Featured + Grid) */}
        <DiscoveryGrid
          discoveries={filteredDiscoveries}
          onShowEvidence={(disc) => setInspectingDiscovery(disc)}
          onExploreReceipts={handleExploreReceipts}
          onResetFilters={() => {
            setActiveFilter('ALL');
            setSearchQuery('');
          }}
        />
      </section>

      {/* 3. LIFE CONSTELLATION VISUALIZATION */}
      <section id="discoveries-constellation" className="space-y-6 pt-4 border-t border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SectionHeader
            tag="RELATIONSHIP GRAPH // LIFE CONSTELLATION"
            title="See How Your Patterns Connect"
            description="A visual knowledge graph representing relationships between your core life streams, dominant categories, milestone years, and observed discoveries."
            level="h2"
          />

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedNode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs font-mono"
              >
                Reset Graph View
              </Button>
            )}
            <Badge variant="primary" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
              {constellationGraph.nodes.length} Interconnected Nodes
            </Badge>
          </div>
        </div>

        {/* Constellation Canvas + Node Detail Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* SVG Canvas */}
          <div className="lg:col-span-8 rounded-xl border border-border/80 bg-surface/60 backdrop-blur-md overflow-hidden relative shadow-2xl">
            {/* Top Legend Bar */}
            <div className="p-3 border-b border-border/70 bg-surface-elevated/40 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-primary animate-spin-slow" />
                <span className="font-semibold text-content-main">
                  Celestial Knowledge Network
                </span>
              </div>

              {/* Color Categories Legend */}
              <div className="flex items-center gap-3 text-[10px] text-content-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-primary" /> Music
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald" /> Household
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-secondary" /> Card Commerce
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> Discovery
                </span>
                <span className="flex items-center gap-1 opacity-70">
                  <span className="w-3 h-0.5 border-t border-dashed border-slate-400" /> Temporal Link
                </span>
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="p-2 sm:p-4 bg-background/50">
              <ConstellationCanvas
                nodes={constellationGraph.nodes}
                edges={constellationGraph.edges}
                selectedNode={selectedNode}
                hoveredNode={hoveredNode}
                onSelectNode={setSelectedNode}
                onHoverNode={setHoveredNode}
              />
            </div>

            {/* Keyboard & Accessibility Hint */}
            <div className="px-4 py-2 border-t border-border/60 bg-surface-elevated/20 flex items-center justify-between text-[11px] text-content-dim font-mono flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-accent-primary" />
                <span>Click or focus any node to inspect telemetry. Press <kbd className="px-1 py-0.5 rounded bg-surface border border-border">Esc</kbd> to clear.</span>
              </div>
              <span className="text-[10px] text-accent-emerald">✓ High Performance SVG</span>
            </div>
          </div>

          {/* Node Inspector Detail Panel */}
          <div className="lg:col-span-4 h-full min-h-[420px]">
            <ConstellationDetailPanel
              node={selectedNode || hoveredNode}
              onClose={() => {
                setSelectedNode(null);
                setHoveredNode(null);
              }}
              onExploreReceipts={handleExploreConstellationNode}
            />
          </div>
        </div>
      </section>

      {/* 4. MEANINGFUL CONNECTIONS (CONNECTION ENGINE) */}
      <section id="discoveries-connections" className="space-y-6 pt-4 border-t border-border/70">
        <SectionHeader
          tag="CONNECTION ENGINE // RELATIONSHIP EVIDENCE"
          title="Cross-Dimension Connections"
          description="Legitimate analytical relationships observed across time periods, activity domains, and financial facets. Temporal overlaps are strictly non-causal."
          level="h2"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.connections.map((conn) => {
            const isTemporalComparison = conn.type === 'TEMPORAL_COMPARISON';

            return (
              <div
                key={conn.id}
                className="p-5 rounded-lg border border-border/80 bg-surface/50 hover:border-border transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge
                    variant={isTemporalComparison ? 'default' : 'primary'}
                    size="sm"
                    className="font-mono text-[10px]"
                  >
                    {isTemporalComparison ? 'TEMPORAL COMPARISON' : 'INTRA-STREAM RELATIONSHIP'}
                  </Badge>

                  <span className="text-[11px] font-mono text-accent-emerald flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {Math.round(conn.strength * 100)}% Match
                  </span>
                </div>

                {/* Connection Nodes Flow */}
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-content-main pt-1 flex-wrap">
                  <span className="px-2 py-1 rounded bg-surface-elevated border border-border">
                    {conn.from}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span className="px-2 py-1 rounded bg-surface-elevated border border-border text-accent-primary">
                    {conn.to}
                  </span>
                </div>

                <p className="text-xs text-content-muted leading-relaxed">
                  {conn.explanation}
                </p>

                {/* Evidence Metrics */}
                {conn.evidence.length > 0 && (
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-content-dim">
                    <span>{conn.evidence[0].metric}:</span>
                    <span className="text-content-main font-bold">
                      {typeof conn.evidence[0].value === 'number'
                        ? conn.evidence[0].value.toLocaleString()
                        : conn.evidence[0].value}{' '}
                      {conn.evidence[0].unit}
                    </span>
                  </div>
                )}

                {isTemporalComparison && (
                  <div className="pt-1 text-[10px] font-mono text-accent-secondary">
                    * Temporal comparative observation. No causal link implied.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Causality Disclaimer */}
        <div className="p-3.5 rounded-lg bg-surface/40 border border-border-subtle text-xs text-content-dim leading-relaxed font-mono">
          <strong className="text-content-main">Analytical Grounding Policy:</strong> {CAUSALITY_DISCLAIMER}
        </div>
      </section>

      {/* 5. EVIDENCE PANEL MODAL */}
      <DiscoveryEvidencePanel
        discovery={inspectingDiscovery}
        onClose={() => setInspectingDiscovery(null)}
        onExploreReceipts={handleExploreReceipts}
      />
    </div>
  );
};
