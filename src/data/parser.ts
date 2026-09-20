/**
 * Minimal zero-dependency CSV parser designed for large files.
 * Handles quoted fields containing commas and newlines.
 * Returns rows as string arrays (header excluded).
 */
export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let i = 0;
  const len = text.length;

  const parseField = (): string => {
    if (i < len && text[i] === '"') {
      i++; // skip opening quote
      let field = '';
      while (i < len) {
        if (text[i] === '"') {
          i++;
          if (i < len && text[i] === '"') {
            field += '"';
            i++;
          } else {
            break;
          }
        } else {
          field += text[i];
          i++;
        }
      }
      return field;
    }
    // Unquoted field
    let field = '';
    while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
      field += text[i];
      i++;
    }
    return field;
  };

  const parseRow = (): string[] | null => {
    if (i >= len) return null;
    const row: string[] = [];
    while (i < len) {
      row.push(parseField());
      if (i < len && text[i] === ',') {
        i++; // skip comma
      } else if (i < len && (text[i] === '\r' || text[i] === '\n')) {
        if (text[i] === '\r') i++;
        if (i < len && text[i] === '\n') i++;
        break;
      } else {
        break;
      }
    }
    return row;
  };

  // Parse header row
  const headerRow = parseRow();
  if (!headerRow) return { headers: [], rows: [] };
  const headers = headerRow.map((h) => h.trim());

  // Parse remaining rows
  while (i < len) {
    const row = parseRow();
    if (!row) break;
    // Skip blank rows
    if (row.length === 1 && row[0] === '') continue;
    rows.push(row);
  }

  return { headers, rows };
}

/** Fetch a file from the public/data directory */
export async function fetchPublicCSV(filename: string): Promise<string> {
  const response = await fetch(`/data/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset "${filename}": HTTP ${response.status}`);
  }
  return response.text();
}

/** Parse a number safely, returning null for unparseable values */
export function safeNum(val: string | undefined): number | null {
  if (!val || !val.trim()) return null;
  const n = parseFloat(val.trim());
  return isFinite(n) ? n : null;
}

/** Parse boolean string values (TRUE/true/1) */
export function safeBool(val: string | undefined): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/** Clean a string value, returning empty string for null/undefined */
export function cleanStr(val: string | undefined): string {
  return (val ?? '').trim();
}
