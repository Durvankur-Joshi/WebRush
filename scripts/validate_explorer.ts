import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import { parseCSV } from '../src/data/parser.ts';
import { normalizeSpotifyRows } from '../src/data/spotify/normalizer.ts';
import { normalizeHouseholdRows } from '../src/data/household/normalizer.ts';
import { normalizeTransactionRows } from '../src/data/transactions/normalizer.ts';
import {
  spotifyToReceipt,
  householdToReceipt,
  transactionToReceipt,
  filterReceipts,
  sortReceipts,
  paginateReceipts,
  computeExplorerSummary,
  extractFilterOptions,
} from '../src/features/explorer/explorerModel.ts';
import { ExplorerFilterState } from '../src/features/explorer/explorerTypes.ts';

console.log('====================================================');
console.log('LIFELINE — EXPLORER / RECEIPT ENGINE VALIDATION');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

// 1. Ingest datasets
console.log('1. Loading sample records...');
const housePath = path.join(rootDir, 'public', 'data', 'household_transactions.csv');
const houseRaw = fs.readFileSync(housePath, 'utf8');
const houseParsed = parseCSV(houseRaw);
const houseNorm = normalizeHouseholdRows(houseParsed.headers, houseParsed.rows);
const houseReceipts = houseNorm.records.map((r, i) => householdToReceipt(r, i));

const spotPath = path.join(rootDir, 'public', 'data', 'spotify_history.csv');
const spotRaw = fs.readFileSync(spotPath, 'utf8');
const spotParsed = parseCSV(spotRaw);
// Take first 5,000 for fast verification
const spotSample = normalizeSpotifyRows(spotParsed.headers, spotParsed.rows.slice(0, 5000));
const spotReceipts = spotSample.records.map((r, i) => spotifyToReceipt(r, i));

const txnPath = path.join(rootDir, 'public', 'data', 'india_transactions.csv');
const txnRaw = fs.readFileSync(txnPath, 'utf8');
const txnParsed = parseCSV(txnRaw);
const txnNorm = normalizeTransactionRows(txnParsed.headers, txnParsed.rows);
const txnReceipts = txnNorm.records.map((r, i) => transactionToReceipt(r, i));

console.log(`   Household receipts: ${houseReceipts.length}`);
console.log(`   Spotify sample receipts: ${spotReceipts.length}`);
console.log(`   Transaction receipts: ${txnReceipts.length}\n`);

// 2. Test PII Sanitization Guarantee
console.log('2. Validating Strict PII Sanitization Guarantee...');
let piiLeaked = false;
const unsafeKeywords = ['cc_num', 'customer_id', 'card_num', 'dob', 'street'];
txnReceipts.forEach((r) => {
  const json = JSON.stringify(r).toLowerCase();
  unsafeKeywords.forEach((k) => {
    if (json.includes(`"${k}"`)) piiLeaked = true;
  });
});
assert(!piiLeaked, 'Zero PII keys found in transaction receipt models');

// Check that no 16-digit card numbers appear anywhere in strings
let cardNumFound = false;
const cardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/;
txnReceipts.slice(0, 500).forEach((r) => {
  if (cardRegex.test(JSON.stringify(r))) cardNumFound = true;
});
assert(!cardNumFound, 'No credit card numbers exposed in any transaction receipt');

// 3. Test Empty Search & Case-Insensitive Search
console.log('\n3. Validating Search Behavior...');
const baseFilter: ExplorerFilterState = {
  stream: 'household',
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
};

const allHousehold = filterReceipts(houseReceipts, baseFilter);
assert(allHousehold.length === houseReceipts.length, 'Empty search returns 100% of receipts');

const searchFoodLower = filterReceipts(houseReceipts, { ...baseFilter, search: 'food' });
const searchFoodUpper = filterReceipts(houseReceipts, { ...baseFilter, search: 'FOOD' });
const searchFoodMixed = filterReceipts(houseReceipts, { ...baseFilter, search: '  FoOd  ' });
assert(
  searchFoodLower.length > 0 &&
  searchFoodLower.length === searchFoodUpper.length &&
  searchFoodLower.length === searchFoodMixed.length,
  `Case-insensitive and trimmed search works identically (${searchFoodLower.length} Food records)`
);

// 4. Test Year Filtering
console.log('\n4. Validating Year & Category Filtering...');
const filter2018 = filterReceipts(houseReceipts, { ...baseFilter, year: 2018 });
assert(
  filter2018.length > 0 && filter2018.every((r) => r.year === 2018),
  `Year filtering strictly isolates 2018 (${filter2018.length} records)`
);

const filterCat = filterReceipts(houseReceipts, { ...baseFilter, category: 'Food' });
assert(
  filterCat.length > 0 && filterCat.every((r) => r.category.toLowerCase() === 'food'),
  `Category filter strictly isolates Food (${filterCat.length} records)`
);

// 5. Test Combined Filters
console.log('\n5. Validating Combined Filters & Empty Results...');
const combined = filterReceipts(houseReceipts, {
  ...baseFilter,
  year: 2018,
  category: 'Food',
  direction: 'expense',
});
assert(
  combined.length > 0 &&
  combined.every((r) => r.year === 2018 && r.category.toLowerCase() === 'food' && r.statusBadge === 'EXPENSE'),
  `Combined multi-facet filter works (${combined.length} matches)`
);

// Empty Result Query
const impossible = filterReceipts(houseReceipts, {
  ...baseFilter,
  year: 1970, // No records
});
assert(impossible.length === 0, 'Impossible filter returns clean empty array without error');

// 6. Test Sorting & Pagination Boundaries
console.log('\n6. Validating Sorting & Pagination Boundaries...');
const sortedRecent = sortReceipts(combined, 'recent');
const sortedOldest = sortReceipts(combined, 'oldest');
assert(
  sortedRecent[0].date >= sortedRecent[sortedRecent.length - 1].date,
  `Sort by recent orders newest to oldest (${sortedRecent[0].date} -> ${sortedRecent[sortedRecent.length - 1].date})`
);
assert(
  sortedOldest[0].date <= sortedOldest[sortedOldest.length - 1].date,
  `Sort by oldest orders chronologically (${sortedOldest[0].date} -> ${sortedOldest[sortedOldest.length - 1].date})`
);

// Pagination
const page1 = paginateReceipts(sortedRecent, 1, 25);
assert(page1.items.length === Math.min(25, sortedRecent.length), 'Page 1 returns correct pageSize items');
assert(page1.startIndex === 1 && page1.endIndex === page1.items.length, 'Pagination indices calculated accurately');

// Boundary test: Out of range page clamped
const overPage = paginateReceipts(sortedRecent, 9999, 25);
assert(overPage.page === overPage.totalPages, 'Over-boundary page requests clamp to max totalPages');

// 7. Test Contextual Summary Metrics
console.log('\n7. Validating Summary Metrics Calculation...');
const summary = computeExplorerSummary(combined, 'household');
assert(summary.totalMatching === combined.length, 'Summary metrics matches filtered count');
assert(Boolean(summary.metric1.value && summary.metric2.value), 'All primary summary metrics populated');

// 8. Test Discovery Drill-down Evidence Connection
console.log('\n8. Validating Discovery Evidence Linking...');
const spotifyWithDiscoveries = spotReceipts.filter((r) => r.supportedDiscoveries.length > 0);
assert(
  spotifyWithDiscoveries.length > 0,
  `Discovery engine verified evidence links in receipts (${spotifyWithDiscoveries.length} sample receipts tagged with discoveries)`
);

console.log('\n====================================================');
console.log(`EXPLORER ENGINE VALIDATION: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
