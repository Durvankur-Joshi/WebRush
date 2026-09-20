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
import { computeSpotifyAnalytics } from '../src/analytics/spotify.ts';
import { computeHouseholdAnalytics } from '../src/analytics/household.ts';
import { computeTransactionAnalytics } from '../src/analytics/transactions.ts';
import { generateDiscoveries } from '../src/analytics/discoveries.ts';
import { generateConnections } from '../src/analytics/connections.ts';
import {
  buildDiscoveryViewModels,
  filterDiscoveries,
  sortDiscoveries,
  computeDiscoveriesSummary,
} from '../src/features/discoveries/discoveryModel.ts';
import { buildConstellationGraph } from '../src/features/constellation/constellationModel.ts';
import { LifeAnalytics } from '../src/analytics/types.ts';

console.log('====================================================');
console.log('LIFELINE — PHASE 5 DISCOVERIES & CONSTELLATION VALIDATION');
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

// 1. Build LifeAnalytics from local datasets
console.log('1. Constructing LifeAnalytics...');
const spotPath = path.join(rootDir, 'public', 'data', 'spotify_history.csv');
const spotParsed = parseCSV(fs.readFileSync(spotPath, 'utf8'));
const spotSample = normalizeSpotifyRows(spotParsed.headers, spotParsed.rows.slice(0, 5000));
const spotifyAnalytics = computeSpotifyAnalytics(spotSample.records);

const housePath = path.join(rootDir, 'public', 'data', 'household_transactions.csv');
const houseParsed = parseCSV(fs.readFileSync(housePath, 'utf8'));
const houseNorm = normalizeHouseholdRows(houseParsed.headers, houseParsed.rows);
const householdAnalytics = computeHouseholdAnalytics(houseNorm.records);

const txnPath = path.join(rootDir, 'public', 'data', 'india_transactions.csv');
const txnParsed = parseCSV(fs.readFileSync(txnPath, 'utf8'));
const txnNorm = normalizeTransactionRows(txnParsed.headers, txnParsed.rows);
const transactionAnalytics = computeTransactionAnalytics(txnNorm.records);

const discoveries = generateDiscoveries(spotifyAnalytics, householdAnalytics, transactionAnalytics);
const connections = generateConnections(spotifyAnalytics, householdAnalytics, transactionAnalytics);

const mockAnalytics: LifeAnalytics = {
  timestamp: new Date().toISOString(),
  spotify: spotifyAnalytics,
  household: householdAnalytics,
  transactions: transactionAnalytics,
  patterns: [],
  connections,
  discoveries,
  storyChapters: [],
};

// 2. Discoveries View Model Generation & Evidence Mapping
console.log('2. Validating Discovery View Models & Evidence...');
const viewModels = buildDiscoveryViewModels(mockAnalytics);
assert(viewModels.length > 0, `Generated ${viewModels.length} discovery view models`);

const withEvidence = viewModels.filter((d) => d.evidence && d.evidence.length > 0);
assert(withEvidence.length === viewModels.length, '100% of discoveries contain verified evidence items');

// 3. Mini Visual Telemetry
console.log('\n3. Validating Mini Visual Telemetry...');
const withMiniCharts = viewModels.filter((d) => d.miniChart !== undefined);
assert(withMiniCharts.length >= 4, `At least 4 key discoveries feature tailored mini charts (found ${withMiniCharts.length})`);

// 4. Explorer Drill-Down Parameters
console.log('\n4. Validating Explorer Drill-Down Parameters...');
let validDrillDown = true;
viewModels.forEach((d) => {
  if (!d.drillDownParams || !d.drillDownParams.discoveryId || !d.drillDownParams.stream) {
    validDrillDown = false;
  }
});
assert(validDrillDown, 'All discoveries have structured Explorer drill-down parameters with discoveryId and stream');

// Check specific known discovery drill-down routing
const skipShift = viewModels.find((d) => d.id === 'disc-spotify-skip-shift');
if (skipShift) {
  assert(
    skipShift.drillDownParams.stream === 'spotify' && skipShift.drillDownParams.year === '2015',
    'Skip shift discovery routes to Spotify 2015 filter'
  );
}

const foodDominance = viewModels.find((d) => d.id === 'disc-household-food-dominance');
if (foodDominance) {
  assert(
    foodDominance.drillDownParams.stream === 'household' && foodDominance.drillDownParams.category === 'Food',
    'Food dominance discovery routes to Household Food filter'
  );
}

// 5. Discovery Filtering & Search
console.log('\n5. Validating Discovery Filtering & Search...');
const allFiltered = filterDiscoveries(viewModels, 'ALL', '');
assert(allFiltered.length === viewModels.length, 'Filter ALL returns 100% of discoveries');

const spotifyOnly = filterDiscoveries(viewModels, 'spotify', '');
assert(
  spotifyOnly.length > 0 && spotifyOnly.every((d) => d.source === 'spotify'),
  `Stream filter strictly isolates Spotify (${spotifyOnly.length} discoveries)`
);

const searchFood = filterDiscoveries(viewModels, 'ALL', 'food');
assert(
  searchFood.length > 0 && searchFood.every((d) => JSON.stringify(d).toLowerCase().includes('food')),
  `Case-insensitive search isolates Food pattern (${searchFood.length} matches)`
);

// 6. Deterministic Sorting
console.log('\n6. Validating Deterministic Sorting...');
const sortedByConf = sortDiscoveries(viewModels, 'confidence');
assert(
  sortedByConf[0].confidence >= sortedByConf[sortedByConf.length - 1].confidence,
  'Sorted by confidence orders highest to lowest confidence'
);

const sortedByImpact = sortDiscoveries(viewModels, 'impact');
const sigRank = { critical: 4, high: 3, medium: 2, low: 1 };
assert(
  (sigRank[sortedByImpact[0].significance] || 0) >= (sigRank[sortedByImpact[sortedByImpact.length - 1].significance] || 0),
  'Sorted by impact prioritizes critical/high significance'
);

// 7. Life Constellation Graph Generation
console.log('\n7. Validating Life Constellation Graph...');
const constellation = buildConstellationGraph(mockAnalytics);
assert(constellation.nodes.length >= 8, `Constellation graph has ${constellation.nodes.length} nodes (>= 8 required)`);
assert(constellation.edges.length >= 8, `Constellation graph has ${constellation.edges.length} edges (>= 8 required)`);

const centerNode = constellation.nodes.find((n) => n.id === 'node-life');
assert(Boolean(centerNode && centerNode.category === 'center'), 'Constellation contains centralized LIFELINE anchor node');

const streamNodes = constellation.nodes.filter((n) => n.category === 'stream');
assert(streamNodes.length === 3, 'Constellation links all 3 primary streams (Music, Household, Transactions)');

// 8. Zero PII Exposure in Discoveries and Constellation
console.log('\n8. Validating Strict PII Sanitization in Constellation & Discoveries...');
let piiExposed = false;
const unsafeKeywords = ['cc_num', 'customer_id', 'card_num', 'street', 'dob'];
const fullPayload = JSON.stringify({ viewModels, constellation }).toLowerCase();
unsafeKeywords.forEach((kw) => {
  if (fullPayload.includes(`"${kw}"`)) piiExposed = true;
});
assert(!piiExposed, 'Zero sensitive PII identifiers exposed in Discoveries or Constellation data structures');

// 9. Empty Analytics Handling
console.log('\n9. Validating Empty Analytics Handling...');
const emptyAnalytics: LifeAnalytics = {
  timestamp: new Date().toISOString(),
  spotify: { ...spotifyAnalytics, totalRecords: 0, yearlyListening: [], topArtists: [] },
  household: { ...householdAnalytics, totalRecords: 0, categoryAmounts: [], categoryFrequency: [] },
  transactions: { ...transactionAnalytics, totalRecords: 0, categoryAmounts: [], categoryFrequency: [] },
  patterns: [],
  connections: [],
  discoveries: [],
  storyChapters: [],
};
const emptySummary = computeDiscoveriesSummary(emptyAnalytics);
assert(emptySummary.totalDiscoveries === 0 && emptySummary.totalConnections === 0, 'Empty analytics produces zero counts gracefully');

console.log('\n====================================================');
console.log(`PHASE 5 VALIDATION: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) process.exit(1);
