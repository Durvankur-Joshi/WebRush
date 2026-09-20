import React, { useRef } from 'react';
import { RouteId } from '../../types/common';
import { useLifeAnalytics } from '../../hooks';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { buildObservatoryViewModel } from './viewModel';
import { HeroSection } from './HeroSection';
import { DataCoverage } from './DataCoverage';
import { ConstellationSection } from './ConstellationSection';
import { DiscoveryPreview } from './DiscoveryPreview';
import { TemporalJourney } from './TemporalJourney';
import { DataStreams } from './DataStreams';

export interface ObservatoryViewProps {
  onNavigate?: (route: RouteId) => void;
}

export const ObservatoryView: React.FC<ObservatoryViewProps> = ({ onNavigate }) => {
  const { analytics, loading, error, reload } = useLifeAnalytics();
  const coverageRef = useRef<HTMLDivElement>(null);

  const handleEnterObservatory = () => {
    const el = document.getElementById('observatory-coverage');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center animate-fadeIn">
        <LoadingState
          message="CALIBRATING OBSERVATORY..."
          subtext="Synthesizing multi-stream receipts, computing temporal graphs, and validating evidence models..."
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
          title="DATA SIGNAL LOST"
          message={error || 'Unable to retrieve offline telemetry. Please reload the observatory.'}
          onRetry={reload}
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  // Empty State
  if (analytics.spotify.totalRecords === 0 && analytics.household.totalRecords === 0 && analytics.transactions.totalRecords === 0) {
    return (
      <div className="py-20 flex items-center justify-center animate-fadeIn">
        <EmptyState
          title="NO PATTERNS DETECTED"
          description="The telemetry engine found no valid receipt records in the supplied datasets."
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  const viewModel = buildObservatoryViewModel(analytics);

  return (
    <div className="space-y-16 sm:space-y-20 animate-fadeIn pb-16">
      {/* 1. HERO SECTION */}
      <HeroSection
        metrics={viewModel.heroMetrics}
        onEnter={handleEnterObservatory}
      />

      {/* 2. DATA COVERAGE */}
      <div ref={coverageRef}>
        <DataCoverage coverage={viewModel.dataCoverage} />
      </div>

      {/* 3. LIFE CONSTELLATION (MAIN VISUAL & INTERACTION) */}
      <ConstellationSection analytics={analytics} />

      {/* 4. KEY DISCOVERIES & SHOW EVIDENCE */}
      <DiscoveryPreview
        discoveries={viewModel.topDiscoveries}
        onViewAllDiscoveries={() => onNavigate?.('discover')}
      />

      {/* 5. TEMPORAL JOURNEY (THE YEARS LEAVE A TRACE) */}
      <TemporalJourney years={viewModel.temporalYears} />

      {/* 6. THREE DATA STREAMS & FINAL TRANSITION */}
      <DataStreams analytics={analytics} onNavigate={onNavigate} />
    </div>
  );
};
