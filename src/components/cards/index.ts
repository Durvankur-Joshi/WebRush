// Domain receipt and insight card components for Phase 2

export interface ReceiptCardProps {
  id: string;
  title: string;
  timestamp: string;
  category: string;
  stream: 'spotify' | 'household' | 'transactions';
  sanitized: boolean;
}
