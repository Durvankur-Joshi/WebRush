import React, { useCallback, useEffect } from 'react';
import { ConstellationNodeData, ConstellationEdgeData } from './types';

export interface ConstellationCanvasProps {
  nodes: ConstellationNodeData[];
  edges: ConstellationEdgeData[];
  selectedNode: ConstellationNodeData | null;
  hoveredNode: ConstellationNodeData | null;
  onSelectNode: (node: ConstellationNodeData | null) => void;
  onHoverNode: (node: ConstellationNodeData | null) => void;
  className?: string;
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  nodes,
  edges,
  selectedNode,
  hoveredNode,
  onSelectNode,
  onHoverNode,
  className = '',
}) => {
  const activeNodeId = selectedNode?.id || hoveredNode?.id;

  // Global escape key to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectNode]);

  // Is an edge connected to the currently focused/selected node?
  const isEdgeHighlighted = useCallback(
    (edge: ConstellationEdgeData) => {
      if (!activeNodeId) return false;
      return edge.source === activeNodeId || edge.target === activeNodeId;
    },
    [activeNodeId]
  );

  // Background star positions (deterministic ambient stars)
  const ambientStars = React.useMemo(() => {
    return [
      { cx: 50, cy: 60, r: 1.2, o: 0.3 },
      { cx: 160, cy: 40, r: 1.5, o: 0.4 },
      { cx: 320, cy: 70, r: 1.0, o: 0.25 },
      { cx: 480, cy: 50, r: 1.4, o: 0.35 },
      { cx: 620, cy: 80, r: 1.1, o: 0.3 },
      { cx: 750, cy: 40, r: 1.6, o: 0.4 },
      { cx: 70, cy: 320, r: 1.3, o: 0.35 },
      { cx: 140, cy: 450, r: 1.0, o: 0.25 },
      { cx: 310, cy: 370, r: 1.5, o: 0.4 },
      { cx: 500, cy: 350, r: 1.2, o: 0.3 },
      { cx: 670, cy: 380, r: 1.4, o: 0.35 },
      { cx: 760, cy: 320, r: 1.1, o: 0.3 },
      { cx: 730, cy: 470, r: 1.3, o: 0.3 },
      { cx: 200, cy: 490, r: 1.2, o: 0.25 },
      { cx: 580, cy: 480, r: 1.5, o: 0.35 },
    ];
  }, []);

  return (
    <div
      className={`relative w-full aspect-[800/520] select-none ${className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
          onSelectNode(null);
        }
      }}
    >
      <svg
        viewBox="0 0 800 520"
        className="w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0 0 20px rgba(8, 11, 17, 0.9))' }}
        preserveAspectRatio="xMidYMid meet"
        role="region"
        aria-label="Interactive Life Constellation Canvas"
      >
        <defs>
          {/* Gradients and Filters */}
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Stars */}
        <g className="ambient-stars pointer-events-none">
          {ambientStars.map((star, i) => (
            <circle
              key={i}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="#FFFFFF"
              opacity={star.o}
            />
          ))}
        </g>

        {/* Constellation Center Radial Field */}
        <circle cx="400" cy="260" r="140" fill="url(#center-glow)" pointerEvents="none" />
        <circle
          cx="400"
          cy="260"
          r="190"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          opacity="0.2"
          pointerEvents="none"
        />

        {/* Edges */}
        <g className="constellation-edges">
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHigh = isEdgeHighlighted(edge);
            const strokeColor = isHigh ? '#38BDF8' : edge.color || '#22324B';
            const strokeWidth = isHigh ? 2 : edge.dashed ? 1.2 : 1;
            const opacity = activeNodeId ? (isHigh ? 0.95 : 0.15) : edge.dashed ? 0.45 : 0.55;

            return (
              <g key={edge.id} className="transition-all duration-300">
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={edge.dashed ? '4 4' : undefined}
                  opacity={opacity}
                />
                {edge.label && isHigh && (
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2 - 6}
                    fill="#38BDF8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none font-medium"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g className="constellation-nodes">
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;
            const isDimmed = Boolean(activeNodeId && !isSelected && !isHovered);

            return (
              <g
                key={node.id}
                tabIndex={0}
                role="button"
                aria-label={`${node.label} (${node.sublabel}). Category: ${node.category}. ${node.whatItRepresents}`}
                aria-pressed={isSelected}
                className="cursor-pointer outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 transition-transform duration-200"
                style={{
                  transformOrigin: `${node.x}px ${node.y}px`,
                  opacity: isDimmed ? 0.35 : 1,
                  filter: isSelected || isHovered ? 'url(#glow)' : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(isSelected ? null : node);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectNode(isSelected ? null : node);
                  }
                }}
                onMouseEnter={() => onHoverNode(node)}
                onMouseLeave={() => onHoverNode(null)}
              >
                {/* Outer halo if selected or hovered or pulsing */}
                {(isSelected || isHovered || node.pulse) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + (isSelected ? 10 : 6)}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={isSelected ? 1.5 : 1}
                    opacity={isSelected ? 0.8 : 0.4}
                    strokeDasharray={isSelected ? '3 3' : undefined}
                    className={node.pulse && !isSelected ? 'animate-ping' : ''}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill="#080B11"
                  stroke={node.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Inner Core */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={Math.max(3, node.radius * 0.4)}
                  fill={node.color}
                  opacity={isSelected || isHovered ? 1 : 0.85}
                />

                {/* Node Label Text */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 13}
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize={node.category === 'center' ? '12' : node.category === 'stream' ? '11' : '10'}
                  fontWeight={node.category === 'center' || node.category === 'stream' ? '700' : '500'}
                  fontFamily="system-ui, sans-serif"
                  className="select-none pointer-events-none"
                  style={{ textShadow: '0 1px 6px rgba(8, 11, 17, 0.95)' }}
                >
                  {node.label}
                </text>

                {/* Node Sublabel / Metric */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 24}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="8.5"
                  fontFamily="monospace"
                  className="select-none pointer-events-none opacity-80"
                  style={{ textShadow: '0 1px 4px rgba(8, 11, 17, 0.95)' }}
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
