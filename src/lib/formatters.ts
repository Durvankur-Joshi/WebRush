/**
 * Formatting utilities for LIFELINE personal-data observatory.
 * Handles dates, currencies (INR/compact), durations (ms to human readable), counts, and percentages.
 */

// ==========================================
// 1. DATE FORMATTERS
// ==========================================

export function formatDate(input: string | Date | undefined): string {
  if (!input) return '—';
  try {
    const d = typeof input === 'string' ? parseCustomDate(input) : input;
    if (isNaN(d.getTime())) return String(input);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(input);
  }
}

export function formatDateTime(input: string | Date | undefined): string {
  if (!input) return '—';
  try {
    const d = typeof input === 'string' ? parseCustomDate(input) : input;
    if (isNaN(d.getTime())) return String(input);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return String(input);
  }
}

export function formatYearMonth(input: string): string {
  if (!input) return '—';
  const d = parseCustomDate(input);
  if (isNaN(d.getTime())) return input;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(d);
}

/**
 * Robust date parser supporting UTC ISO, "YYYY-MM-DD HH:MM:SS", "DD/MM/YYYY", and "M/D/YYYY H:MM"
 */
export function parseCustomDate(str: string): Date {
  if (!str) return new Date(NaN);
  
  // DD/MM/YYYY HH:mm:ss format (Household CSV)
  const ddmmyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ddmmyyyyMatch) {
    const [, day, month, year, h = '0', m = '0', s = '0'] = ddmmyyyyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(h), Number(m), Number(s));
  }

  // MM/DD/YYYY H:mm format (India Transact CSV)
  const mmddyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (mmddyyyyMatch) {
    const [, month, day, year, h = '0', m = '0'] = mmddyyyyMatch;
    // Disambiguate if month > 12
    const mNum = Number(month);
    const dNum = Number(day);
    if (mNum > 12 && dNum <= 12) {
      return new Date(Number(year), dNum - 1, mNum, Number(h), Number(m));
    }
    return new Date(Number(year), mNum - 1, dNum, Number(h), Number(m));
  }

  // Standard fallback
  return new Date(str.replace(' ', 'T'));
}

// ==========================================
// 2. CURRENCY FORMATTERS
// ==========================================

export function formatCurrencyINR(amount: number, showDecimals = false): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

export function formatCompactINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency.toUpperCase() === 'INR') {
    return formatCurrencyINR(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

// ==========================================
// 3. DURATION FORMATTERS
// ==========================================

export function formatDurationMs(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms <= 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
}

export function formatHours(hours: number): string {
  if (typeof hours !== 'number' || isNaN(hours)) return '0 hrs';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(hours)} hrs`;
}

export function formatListeningSpan(hours: number): string {
  if (typeof hours !== 'number' || isNaN(hours) || hours <= 0) return '0 hours';
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  if (days === 0) return `${remHours} hours`;
  return `${days}d ${remHours}h`;
}

// ==========================================
// 4. COUNT FORMATTERS
// ==========================================

export function formatCount(val: number): string {
  if (typeof val !== 'number' || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-US').format(val);
}

export function formatCompactNumber(val: number): string {
  if (typeof val !== 'number' || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(val);
}

// ==========================================
// 5. PERCENTAGE FORMATTERS
// ==========================================

export function formatPercent(val: number, precision = 1): string {
  if (typeof val !== 'number' || isNaN(val)) return '0%';
  // If val is already 0-100 or 0.0-1.0
  const normalized = val > 1 ? val : val * 100;
  return `${normalized.toFixed(precision)}%`;
}
