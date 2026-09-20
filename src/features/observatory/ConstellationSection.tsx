import React, { useState } from 'react';
import { LifeAnalytics } from '../../analytics';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import {
  buildConstellationGraph,
  ConstellationCanvas,
  ConstellationDetailPanel,
  ConstellationNodeData,
} from '../constellation';
import { Compass, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

export interface ConstellationSectionProps {
  analytics: LifeAnalytics;
}

export const ConstellationSection: React.FC<ConstellationSectionProps> = ({ analytics }) => {
  const [selectedNode, setSelectedNode] = useState<ConstellationNodeData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ConstellationNodeData | null>(null);

  const graph = React.useMemo(() => {
    return buildConstellationGraph(analytics);
  }, [analytics]);

  const activeNode = selectedNode || hoveredNode;

  return (
    <section id="observatory-constellation" className="space-y-6 pt-4">
      <SectionHeader
        tag="LIFE CONSTELLATION // INTERACTIVE OBSERVER"
        title="Life Constellation"
        description="A visual field of connected nodes representing data streams, dominant categories, years, and verified discoveries. Select any node to inspect its evidentiary telemetry."
        level="h2"
        action={
          <div className="flex items-center gap-2">
            {selectedNode && (
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-accent-primary hover:underline font-mono inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Clear Selection
              </button>
            )}
            <Badge variant="primary" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
              {graph.nodes.length} Connected Nodes
            </Badge>
          </div>
        }
      />

      {/* Main Canvas + Detail Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Constellation Canvas Viewport */}
        <div className="lg:col-span-8 rounded-lg border border-border bg-surface/60 backdrop-blur-md overflow-hidden relative shadow-2xl">
          {/* Top Bar with Legend */}
          <div className="p-3 border-b border-border/60 bg-surface-elevated/40 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent-primary animate-spin-slow" />
              <span className="font-semibold text-content-main text-xs">
                Multi-Modal Celestial Graph
              </span>
            </div>

            {/* Color Legend */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-content-muted flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-primary" /> Music
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-emerald" /> Household
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-secondary" /> Card POS
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> Discovery
              </span>
              <span className="flex items-center gap-1 opacity-70">
                <span className="w-3 h-0.5 border-t border-dashed border-slate-400" /> Comparison
              </span>
            </div>
          </div>

          {/* Canvas Component */}
          <div className="p-2 sm:p-4 bg-background/50">
            <ConstellationCanvas
              nodes={graph.nodes}
              edges={graph.edges}
              selectedNode={selectedNode}
              hoveredNode={hoveredNode}
              onSelectNode={setSelectedNode}
              onHoverNode={setHoveredNode}
            />
          </div>

          {/* Bottom Keyboard Accessibility & Navigation Hint */}
          <div className="px-4 py-2.5 border-t border-border/50 bg-surface-elevated/20 flex items-center justify-between text-[11px] text-content-dim font-mono flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-accent-primary" />
              <span>
                <kbd className="px-1 py-0.5 bg-surface border border-border rounded text-[10px]">Tab</kbd> to focus nodes,{' '}
                <kbd className="px-1 py-0.5 bg-surface border border-border rounded text-[10px]">Enter</kbd> to lock telemetry,{' '}
                <kbd className="px-1 py-0.5 bg-surface border border-border rounded text-[10px]">Esc</kbd> to deselect.
              </span>
            </div>
            {activeNode && (
              <span className="text-accent-primary font-semibold">
                Inspecting: {activeNode.label}
              </span>
            )}
          </div>
        </div>

        {/* Telemetry Detail Panel */}
        <div className="lg:col-span-4 h-full min-h-[380px] lg:min-h-[520px]">
          <ConstellationDetailPanel
            node={selectedNode || hoveredNode}
            onClose={() => {
              setSelectedNode(null);
              setHoveredNode(null);
            }}
          />
        </div>
      </div>
    </section>
  );
};
