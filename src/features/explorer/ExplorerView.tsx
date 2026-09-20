import React, { useState } from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Filter, AlertCircle, Music, Wallet, CreditCard } from 'lucide-react';
import { DatasetId } from '../../types/common';

export const ExplorerView: React.FC = () => {
  const [activeStream, setActiveStream] = useState<DatasetId | 'all'>('all');

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        tag="DATA INSPECTOR // MULTI-MODAL STREAM"
        title="Sanitized Receipt Explorer"
        description="Inspect granular receipts across all 3 streams with strict real-time PII sanitization. Credit card numbers, customer names, addresses, and customer IDs are omitted at the data adapter boundary."
        level="h1"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="success" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Strict PII Scrubbing Active
            </Badge>
          </div>
        }
      />

      {/* Stream Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-surface border border-border/80">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-content-dim ml-1" />
          <span className="text-xs font-mono uppercase text-content-dim">Filter Stream:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveStream('all')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${activeStream === 'all'
                  ? 'bg-accent-primary text-background font-semibold'
                  : 'text-content-muted hover:text-content-main hover:bg-surface-elevated'
                }`}
            >
              All Streams
            </button>
            <button
              type="button"
              onClick={() => setActiveStream('spotify')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${activeStream === 'spotify'
                  ? 'bg-accent-emerald text-background font-semibold'
                  : 'text-content-muted hover:text-content-main hover:bg-surface-elevated'
                }`}
            >
              <Music className="w-3 h-3" />
              Spotify (2013–24)
            </button>
            <button
              type="button"
              onClick={() => setActiveStream('household')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${activeStream === 'household'
                  ? 'bg-accent-primary text-background font-semibold'
                  : 'text-content-muted hover:text-content-main hover:bg-surface-elevated'
                }`}
            >
              <Wallet className="w-3 h-3" />
              Household (2015–18)
            </button>
            <button
              type="button"
              onClick={() => setActiveStream('transactions')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${activeStream === 'transactions'
                  ? 'bg-accent-secondary text-background font-semibold'
                  : 'text-content-muted hover:text-content-main hover:bg-surface-elevated'
                }`}
            >
              <CreditCard className="w-3 h-3" />
              Transact (2022–24)
            </button>
          </div>
        </div>

        <div className="text-xs font-mono text-content-dim">
          Showing Sanitized Schema Samples
        </div>
      </div>

      {/* Schema Protection Guarantee Card */}
      <Card variant="subtle" padding="sm" className="border-accent-emerald/30 bg-accent-emerald-dim/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent-emerald shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase text-accent-emerald tracking-wide">
              PII Redaction Pipeline Policy
            </h4>
            <p className="text-xs text-content-muted leading-relaxed">
              Every India Transaction record undergoes strict client-side sanitization before entering application memory:
              <strong className="text-content-main"> cc_num, first, last, street, dob, and customer_id</strong> are permanently scrubbed.
              Only safe analytical fields (amount, merchant name, category, state, city) are accessible to the UI.
            </p>
          </div>
        </div>
      </Card>

      {/* Exemplar Schema Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="success" size="sm">Auditory Receipt</Badge>
            <span className="font-mono text-xs text-content-dim">Spotify Stream</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-content-main text-sm">Drinking from the Bottle</div>
            <div className="text-content-muted">Artist: Calvin Harris ft. Tinie Tempah</div>
            <div className="text-content-muted">Album: 18 Months</div>
            <div className="pt-2 border-t border-border-subtle flex justify-between font-mono text-[11px] text-content-dim">
              <span>Timestamp: 2013-07-08</span>
              <span>Played: 61.8s</span>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="primary" size="sm">Domestic Ledger</Badge>
            <span className="font-mono text-xs text-content-dim">Household CSV</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-content-main text-sm">Netflix Subscription (1 mo)</div>
            <div className="text-content-muted">Category: Subscription</div>
            <div className="text-content-muted">Mode: Saving Bank Account 1</div>
            <div className="pt-2 border-t border-border-subtle flex justify-between font-mono text-[11px] text-content-dim">
              <span>Date: 19/09/2018</span>
              <span className="text-content-main font-bold">₹199.00</span>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" size="sm">Sanitized POS</Badge>
            <span className="font-mono text-xs text-content-dim">Card Transact</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-content-main text-sm">Bedi-Krish Pvt Ltd</div>
            <div className="text-content-muted">Category: Entertainment</div>
            <div className="text-content-muted">Region: Rajasthan, India</div>
            <div className="pt-2 border-t border-border-subtle flex justify-between font-mono text-[11px] text-content-dim">
              <span>Date: 12/26/2023</span>
              <span className="text-content-main font-bold">₹8,552.65</span>
            </div>
            <div className="text-[10px] font-mono text-accent-emerald pt-1">
              ✓ Card number & personal name scrubbed
            </div>
          </div>
        </Card>
      </div>

      {/* Phase 2 Implementation Notice */}
      <div className="p-4 rounded-lg bg-surface/40 border border-dashed border-border text-center text-xs text-content-muted font-mono">
        <AlertCircle className="w-4 h-4 text-accent-primary mx-auto mb-2" />
        Granular paginated table explorer & search indexing will activate in Phase 2 upon preprocessed data ingestion.
      </div>
    </div>
  );
};
