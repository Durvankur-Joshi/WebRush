import React, { useState } from 'react';
import { TemporalYearData } from './viewModel';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Headphones, Wallet, CreditCard, Sparkles } from 'lucide-react';

export interface TemporalJourneyProps {
  years: TemporalYearData[];
}

export const TemporalJourney: React.FC<TemporalJourneyProps> = ({ years }) => {
  // Default selected year to peak year 2020 or recent 2023
  const [selectedYear, setSelectedYear] = useState<number>(2020);

  const activeYearData = years.find((y) => y.year === selectedYear) || years[0];

  // Maximum values for normalization
  const maxHours = Math.max(...years.map((y) => y.spotifyHours), 1);
  const maxHousehold = Math.max(...years.map((y) => y.householdExpenses), 1);
  const maxTxn = Math.max(...years.map((y) => y.transactionVolume), 1);

  return (
    <section id="observatory-temporal" className="space-y-6 pt-4">
      <SectionHeader
        tag="LONGITUDINAL JOURNEY // 2013 — 2024"
        title="The Years Leave a Trace"
        description="Aggregate historical timeline across twelve years. Select any calendar year to inspect concurrent multi-stream activity and discovered living patterns."
        level="h2"
        action={
          <Badge variant="outline" size="md" icon={<Calendar className="w-3.5 h-3.5" />}>
            Selected Year: {selectedYear}
          </Badge>
        }
      />

      {/* Interactive Year Selector Bar Chart */}
      <div className="p-4 sm:p-6 rounded-lg border border-border bg-surface/50 backdrop-blur-sm space-y-6">
        <div className="flex items-center justify-between text-xs text-content-dim font-mono">
          <span>SELECT A CALENDAR YEAR TO INSPECT</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-primary" /> Music
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-emerald" /> Household
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-secondary" /> Card Commerce
            </span>
          </div>
        </div>

        {/* Horizontal responsive year bars grid */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2">
          {years.map((y) => {
            const isSelected = y.year === selectedYear;
            const audioHeightPct = Math.round((y.spotifyHours / maxHours) * 100);
            const householdHeightPct = Math.round((y.householdExpenses / maxHousehold) * 100);
            const txnHeightPct = Math.round((y.transactionVolume / maxTxn) * 100);

            return (
              <button
                key={y.year}
                onClick={() => setSelectedYear(y.year)}
                aria-pressed={isSelected}
                aria-label={`Inspect year ${y.year}. Audio: ${y.spotifyHours.toFixed(0)} hours`}
                className={`group flex flex-col items-center justify-end p-2 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                  isSelected
                    ? 'bg-surface-elevated border-2 border-accent-primary shadow-lg shadow-accent-primary/10'
                    : 'bg-surface/60 border border-border/50 hover:bg-surface-elevated/70 hover:border-border'
                }`}
              >
                {/* Visual Comparative Bars */}
                <div className="w-full h-24 flex items-end justify-center gap-1 px-1 mb-2">
                  {/* Music bar */}
                  <div
                    className="w-1.5 sm:w-2 rounded-t bg-accent-primary transition-all duration-300 group-hover:brightness-125"
                    style={{ height: `${Math.max(4, audioHeightPct)}%` }}
                    title={`Audio: ${y.spotifyHours.toFixed(0)} hrs`}
                  />
                  {/* Household bar */}
                  {y.householdExpenses > 0 && (
                    <div
                      className="w-1.5 sm:w-2 rounded-t bg-accent-emerald transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${Math.max(4, householdHeightPct)}%` }}
                      title={`Household: INR ${(y.householdExpenses / 100000).toFixed(1)}L`}
                    />
                  )}
                  {/* Transaction bar */}
                  {y.transactionVolume > 0 && (
                    <div
                      className="w-1.5 sm:w-2 rounded-t bg-accent-secondary transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${Math.max(4, txnHeightPct)}%` }}
                      title={`Transactions: INR ${(y.transactionVolume / 100000).toFixed(1)}L`}
                    />
                  )}
                </div>

                {/* Year Label */}
                <span
                  className={`font-mono text-xs font-semibold ${
                    isSelected ? 'text-accent-primary' : 'text-content-muted group-hover:text-content-main'
                  }`}
                >
                  {y.year}
                </span>

                {/* Stream indicator dots */}
                <div className="flex items-center gap-0.5 mt-1">
                  {y.activeStreams.includes('spotify') && (
                    <span className="w-1 h-1 rounded-full bg-accent-primary" />
                  )}
                  {y.activeStreams.includes('household') && (
                    <span className="w-1 h-1 rounded-full bg-accent-emerald" />
                  )}
                  {y.activeStreams.includes('transactions') && (
                    <span className="w-1 h-1 rounded-full bg-accent-secondary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Year Inspection Card */}
        {activeYearData && (
          <div className="p-4 rounded-lg bg-surface-elevated/90 border border-border-highlight/40 space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between gap-3 flex-wrap border-b border-border-subtle pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-2xl font-bold text-content-main">
                    {activeYearData.year}
                  </span>
                  <Badge variant="primary" size="sm" className="font-mono">
                    {activeYearData.activeStreams.length} Active Stream{activeYearData.activeStreams.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                {activeYearData.notablePattern && (
                  <p className="text-xs text-accent-secondary font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    {activeYearData.notablePattern}
                  </p>
                )}
              </div>

              {/* Streams Active in this Year */}
              <div className="flex items-center gap-1.5 font-mono text-xs text-content-dim">
                <span>Active:</span>
                {activeYearData.activeStreams.map((s) => (
                  <Badge key={s} variant="outline" size="sm" className="uppercase font-mono text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Metrics Grid for Selected Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Audio metric */}
              <div className="p-3 rounded bg-surface/60 border border-border/60 space-y-1">
                <div className="flex items-center gap-1.5 text-accent-primary font-medium">
                  <Headphones className="w-3.5 h-3.5" />
                  Music Streaming
                </div>
                <div className="text-base font-bold font-mono text-content-main">
                  {activeYearData.spotifyHours.toFixed(1)} hrs
                </div>
                <div className="text-[11px] text-content-dim font-mono">
                  {activeYearData.spotifyPlays.toLocaleString()} tracks played
                </div>
              </div>

              {/* Household metric */}
              <div className="p-3 rounded bg-surface/60 border border-border/60 space-y-1">
                <div className="flex items-center gap-1.5 text-accent-emerald font-medium">
                  <Wallet className="w-3.5 h-3.5" />
                  Domestic Ledger
                </div>
                {activeYearData.householdCount > 0 ? (
                  <>
                    <div className="text-base font-bold font-mono text-content-main">
                      INR {(activeYearData.householdExpenses / 100000).toFixed(2)}L
                    </div>
                    <div className="text-[11px] text-content-dim font-mono">
                      {activeYearData.householdCount.toLocaleString()} receipts logged
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-content-dim font-mono pt-1">
                    No ledger entries in {activeYearData.year}
                  </div>
                )}
              </div>

              {/* Transactions metric */}
              <div className="p-3 rounded bg-surface/60 border border-border/60 space-y-1">
                <div className="flex items-center gap-1.5 text-accent-secondary font-medium">
                  <CreditCard className="w-3.5 h-3.5" />
                  Card POS Commerce
                </div>
                {activeYearData.transactionCount > 0 ? (
                  <>
                    <div className="text-base font-bold font-mono text-content-main">
                      INR {(activeYearData.transactionVolume / 100000).toFixed(2)}L
                    </div>
                    <div className="text-[11px] text-content-dim font-mono">
                      {activeYearData.transactionCount.toLocaleString()} card purchases
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-content-dim font-mono pt-1">
                    No card transactions in {activeYearData.year}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
