import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RouteId } from '../../types/common';
import { useLifeAnalytics } from '../../hooks';
import {
  ExplorerFilterState,
  ExplorerReceipt,
  HourRange,
  SortOption,
  StreamId,
} from './explorerTypes';
import {
  computeExplorerSummary,
  extractFilterOptions,
  filterReceipts,
  householdToReceipt,
  paginateReceipts,
  sortReceipts,
  spotifyToReceipt,
  transactionToReceipt,
} from './explorerModel';
import { ExplorerToolbar } from './ExplorerToolbar';
import { ExplorerFilters } from './ExplorerFilters';
import { ExplorerSummary } from './ExplorerSummary';
import { ExplorerResults } from './ExplorerResults';
import { ExplorerDetailPanel } from './ExplorerDetailPanel';
import { ErrorState } from '../../components/ui/ErrorState';
import { loadSpotifyData } from '../../data/spotify/loader';
import { loadHouseholdData } from '../../data/household/loader';
import { loadTransactionData } from '../../data/transactions/loader';

export interface ExplorerViewProps {
  initialParams?: Record<string, string>;
  onNavigate?: (route: RouteId, params?: Record<string, string>) => void;
}

// In-memory cache for transformed receipts so stream switching is near-instant
const _receiptCache = new Map<StreamId, ExplorerReceipt[]>();

export const ExplorerView: React.FC<ExplorerViewProps> = ({ initialParams, onNavigate }) => {
  const { analytics } = useLifeAnalytics();

  // 1. Initial State from URL / Deep-link params
  const initialStream = (initialParams?.stream as StreamId) || 'spotify';
  const initialYear = initialParams?.year ? Number(initialParams.year) : 'all';
  const initialHour = (initialParams?.hourRange as HourRange) || 'all';
  const initialSearch = initialParams?.search || '';

  const [filters, setFilters] = useState<ExplorerFilterState>({
    stream: initialStream,
    search: initialSearch,
    year: initialYear,
    category: 'all',
    subcategory: 'all',
    direction: 'all',
    mode: 'all',
    state: 'all',
    skipped: 'all',
    hourRange: initialHour,
    sortBy: 'recent',
    page: 1,
    pageSize: 25,
  });

  const [streamReceipts, setStreamReceipts] = useState<ExplorerReceipt[]>([]);
  const [loadingStream, setLoadingStream] = useState<boolean>(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ExplorerReceipt | null>(null);

  // Handle Discovery / Story Drill-Down from initialParams
  useEffect(() => {
    if ((initialParams?.discoveryId || initialParams?.storyChapter) && analytics?.discoveries) {
      const disc = initialParams?.discoveryId
        ? analytics.discoveries.find((d) => d.id === initialParams.discoveryId)
        : undefined;

      let stream: StreamId = (initialParams?.stream as StreamId) || filters.stream;
      if (disc) {
        if (disc.source === 'spotify') stream = 'spotify';
        else if (disc.source === 'household') stream = 'household';
        else if (disc.source === 'transactions') stream = 'transactions';
      }

      let targetYear: number | 'all' = initialParams?.year ? Number(initialParams.year) : 'all';
      let targetCategory = initialParams?.category || 'all';
      let targetHour: HourRange = (initialParams?.hourRange as HourRange) || 'all';
      let targetSkipped: 'all' | 'skipped' | 'completed' = (initialParams?.skipped as 'all' | 'skipped' | 'completed') || 'all';
      let targetSearch = initialParams?.search || '';
      let targetSort: SortOption = (initialParams?.sortBy as SortOption) || 'recent';

      if (disc) {
        if (disc.id === 'disc-spotify-hour-concentration') {
          targetHour = 'evening_night';
        } else if (disc.id === 'disc-spotify-persistent-artist') {
          targetSearch = 'Beatles';
        } else if (disc.id === 'disc-spotify-skip-shift') {
          targetYear = 2015;
          targetSkipped = 'skipped';
        } else if (disc.id === 'disc-spotify-peak-eras') {
          targetYear = 2020;
        } else if (disc.id === 'disc-household-food-dominance') {
          targetCategory = 'Food';
        } else if (disc.id === 'disc-household-freq-vs-impact') {
          targetSort = 'magnitude';
        } else if (disc.id === 'disc-txn-category-ticket-size') {
          targetCategory = 'travel';
          targetSort = 'magnitude';
        }
      }

      setFilters((prev) => ({
        ...prev,
        stream,
        year: targetYear,
        category: targetCategory,
        hourRange: targetHour,
        skipped: targetSkipped,
        search: targetSearch,
        sortBy: targetSort,
        page: 1,
        discoveryDrillDown: {
          id: disc?.id || `story-ch-${initialParams?.storyChapter}`,
          title: initialParams?.storyTitle || disc?.title || `Chapter ${initialParams?.storyChapter}`,
          summary: disc?.subtitle || 'Receipt evidence validating narrative chapter',
          period: disc?.period,
          filterDescription: initialParams?.storyChapter
            ? `Receipts supporting Chapter ${initialParams.storyChapter}: ${initialParams.storyTitle || disc?.title || ''}`
            : `Pre-filtered to records verifying: "${disc?.title}"`,
          storyChapter: initialParams?.storyChapter,
          storyTitle: initialParams?.storyTitle || disc?.title,
        },
      }));
    }
  }, [initialParams?.discoveryId, initialParams?.storyChapter, analytics?.discoveries]);

  // Load Stream Data when activeStream changes
  useEffect(() => {
    let isCancelled = false;

    async function loadDataForStream(stream: StreamId) {
      // Check cache first
      if (_receiptCache.has(stream)) {
        setStreamReceipts(_receiptCache.get(stream)!);
        setLoadingStream(false);
        setStreamError(null);
        return;
      }

      setLoadingStream(true);
      setStreamError(null);

      try {
        let receipts: ExplorerReceipt[] = [];

        if (stream === 'spotify') {
          const res = await loadSpotifyData();
          if (isCancelled) return;
          receipts = res.records.map((r, i) => spotifyToReceipt(r, i));
        } else if (stream === 'household') {
          const res = await loadHouseholdData();
          if (isCancelled) return;
          receipts = res.records.map((r, i) => householdToReceipt(r, i));
        } else if (stream === 'transactions') {
          const res = await loadTransactionData();
          if (isCancelled) return;
          receipts = res.records.map((r, i) => transactionToReceipt(r, i));
        }

        _receiptCache.set(stream, receipts);
        if (!isCancelled) {
          setStreamReceipts(receipts);
          setLoadingStream(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setStreamError(
            err instanceof Error
              ? err.message
              : 'Failed to parse telemetry stream receipts.'
          );
          setLoadingStream(false);
        }
      }
    }

    loadDataForStream(filters.stream);

    return () => {
      isCancelled = true;
    };
  }, [filters.stream]);

  // Filter & Options memoization
  const filterOptions = useMemo(() => {
    return extractFilterOptions(streamReceipts);
  }, [streamReceipts]);

  const filteredReceipts = useMemo(() => {
    return filterReceipts(streamReceipts, filters);
  }, [streamReceipts, filters]);

  const sortedReceipts = useMemo(() => {
    return sortReceipts(filteredReceipts, filters.sortBy);
  }, [filteredReceipts, filters.sortBy]);

  const pagination = useMemo(() => {
    return paginateReceipts(sortedReceipts, filters.page, filters.pageSize);
  }, [sortedReceipts, filters.page, filters.pageSize]);

  const summaryMetrics = useMemo(() => {
    return computeExplorerSummary(filteredReceipts, filters.stream);
  }, [filteredReceipts, filters.stream]);

  // Handler: Stream Selection
  const handleSelectStream = useCallback((stream: StreamId) => {
    setSelectedReceipt(null);
    setFilters({
      stream,
      search: '',
      year: 'all',
      category: 'all',
      subcategory: 'all',
      direction: 'all',
      mode: 'all',
      state: 'all',
      skipped: 'all',
      hourRange: 'all',
      sortBy: 'recent',
      page: 1,
      pageSize: 25,
      discoveryDrillDown: undefined,
    });
  }, []);

  // Handler: Filter Change
  const handleFilterChange = useCallback((patch: Partial<ExplorerFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  // Handler: Reset Filters
  const handleResetFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      year: 'all',
      category: 'all',
      subcategory: 'all',
      direction: 'all',
      mode: 'all',
      state: 'all',
      skipped: 'all',
      hourRange: 'all',
      sortBy: 'recent',
      page: 1,
      discoveryDrillDown: undefined,
    }));
  }, []);

  // Handler: Clear Discovery Drill-down
  const handleClearDiscoveryDrillDown = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      discoveryDrillDown: undefined,
      hourRange: 'all',
      skipped: 'all',
      page: 1,
    }));
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Explorer Header & Toolbar */}
      <ExplorerToolbar
        activeStream={filters.stream}
        onSelectStream={handleSelectStream}
        searchQuery={filters.search}
        onSearchChange={(q) => handleFilterChange({ search: q, page: 1 })}
        analytics={analytics}
        totalMatching={filteredReceipts.length}
      />

      {/* 2. Error State */}
      {streamError && (
        <div className="py-12 flex justify-center">
          <ErrorState
            title="EXPLORER DATA UNAVAILABLE"
            message={streamError}
            onRetry={() => {
              _receiptCache.delete(filters.stream);
              setFilters((prev) => ({ ...prev }));
            }}
            className="w-full max-w-md"
          />
        </div>
      )}

      {/* 3. Main Explorer Workspace (when no error) */}
      {!streamError && (
        <>
          {/* Adaptive Filters */}
          <ExplorerFilters
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onClearDiscoveryDrillDown={handleClearDiscoveryDrillDown}
            onBackToDiscovery={() => onNavigate?.('observatory')}
            onBackToStory={(ch) => onNavigate?.('story', ch ? { chapter: ch } : undefined)}
          />

          {/* Explorer Summary & Sorting Bar */}
          <ExplorerSummary
            summary={summaryMetrics}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            sortBy={filters.sortBy}
            onSortChange={(sortBy) => handleFilterChange({ sortBy, page: 1 })}
            stream={filters.stream}
          />

          {/* Results Grid / Detail Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center Results List Feed */}
            <div className={selectedReceipt ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'}>
              <ExplorerResults
                receipts={pagination.items}
                isLoading={loadingStream}
                selectedReceipt={selectedReceipt}
                onSelectReceipt={(receipt) => {
                  setSelectedReceipt((prev) => (prev?.id === receipt.id ? null : receipt));
                }}
                page={pagination.page}
                pageSize={filters.pageSize}
                totalPages={pagination.totalPages}
                totalRecords={pagination.total}
                onPageChange={(p) => handleFilterChange({ page: p })}
                onPageSizeChange={(sz) => handleFilterChange({ pageSize: sz, page: 1 })}
                onClearFilters={handleResetFilters}
                hasQuery={!!filters.search.trim() || filters.year !== 'all' || filters.category !== 'all'}
              />
            </div>

            {/* Right Detail Panel on Desktop */}
            {selectedReceipt && (
              <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
                <ExplorerDetailPanel
                  receipt={selectedReceipt}
                  onClose={() => setSelectedReceipt(null)}
                />
              </div>
            )}
          </div>

          {/* Mobile Detail Modal / Drawer */}
          {selectedReceipt && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center animate-fadeIn">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <ExplorerDetailPanel
                  receipt={selectedReceipt}
                  onClose={() => setSelectedReceipt(null)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
