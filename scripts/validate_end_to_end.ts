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
import { buildDiscoveryViewModels, filterDiscoveries, sortDiscoveries } from '../src/features/discoveries/discoveryModel.ts';
import { buildConstellationGraph } from '../src/features/constellation/constellationModel.ts';
import {
  spotifyToReceipt,
  householdToReceipt,
  transactionToReceipt,
  filterReceipts,
  sortReceipts,
  paginateReceipts,
} from '../src/features/explorer/explorerModel.ts';
import { buildStoryViewModels, computeStorySummaryMetrics } from '../src/features/story/storyModel.ts';
import { LifeAnalytics } from '../src/analytics/types.ts';

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

async function runEndToEndQA() {
  console.log('====================================================');
  console.log('LIFELINE — COMPREHENSIVE END-TO-END PRODUCT QA');
  console.log('====================================================\n');

  // STEP 1: INGESTION & NORMALIZATION
  console.log('STEP 1: Ingestion & Normalization Audit');
  const spotPath = path.join(rootDir, 'public', 'data', 'spotify_history.csv');
  const housePath = path.join(rootDir, 'public', 'data', 'household_transactions.csv');
  const txnPath = path.join(rootDir, 'public', 'data', 'india_transactions.csv');

  const spotParsed = parseCSV(fs.readFileSync(spotPath, 'utf8'));
  const houseParsed = parseCSV(fs.readFileSync(housePath, 'utf8'));
  const txnParsed = parseCSV(fs.readFileSync(txnPath, 'utf8'));

  const spotSample = normalizeSpotifyRows(spotParsed.headers, spotParsed.rows.slice(0, 15000));
  const houseNorm = normalizeHouseholdRows(houseParsed.headers, houseParsed.rows);
  const txnNorm = normalizeTransactionRows(txnParsed.headers, txnParsed.rows);

  assert(spotSample.records.length === 15000, 'Spotify normalized successfully');
  assert(houseNorm.records.length === 2461, 'Household records normalized (2,461 entries)');
  assert(txnNorm.records.length === 8725, 'Transaction records normalized (8,725 records)');

  // STEP 2: ANALYTICS & PATTERN ENGINES
  console.log('\nSTEP 2: Analytics & Pattern Intelligence');
  const spotAnalytics = computeSpotifyAnalytics(spotSample.records);
  const houseAnalytics = computeHouseholdAnalytics(houseNorm.records);
  const txnAnalytics = computeTransactionAnalytics(txnNorm.records);
  const discoveries = generateDiscoveries(spotAnalytics, houseAnalytics, txnAnalytics);
  const connections = generateConnections(spotAnalytics, houseAnalytics, txnAnalytics);

  const analytics: LifeAnalytics = {
    timestamp: new Date().toISOString(),
    spotify: spotAnalytics,
    household: houseAnalytics,
    transactions: txnAnalytics,
    patterns: [],
    connections,
    discoveries,
  };

  assert(discoveries.length >= 8, `Discovery engine produced ${discoveries.length} verified discoveries`);
  assert(connections.length >= 8, `Connection engine established ${connections.length} multi-stream links`);

  // STEP 3: OBSERVATORY MACRO METRICS
  console.log('\nSTEP 3: Observatory Macro Metrics');
  const totalStreams = analytics.spotify.totalRecords;
  const totalLedger = analytics.household.totalRecords;
  const totalCommerce = analytics.transactions.totalRecords;
  assert(totalStreams > 0, `Observatory music count derived from analytics (${totalStreams.toLocaleString()})`);
  assert(totalLedger === 2461, `Observatory domestic count derived from analytics (${totalLedger.toLocaleString()})`);
  assert(totalCommerce === 8725, `Observatory commerce count derived from analytics (${totalCommerce.toLocaleString()})`);

  // STEP 4: DISCOVERIES & EVIDENCE AUDIT
  console.log('\nSTEP 4: Discoveries View & Evidence Deep-Dive');
  const discoveryModels = buildDiscoveryViewModels(analytics);
  assert(discoveryModels.length === discoveries.length, 'Discovery view models match analytical discoveries count');

  const foodDisc = discoveryModels.find((d) => d.id === 'disc-household-food-dominance');
  assert(!!foodDisc, 'Food dominance discovery found in view models');
  assert(foodDisc!.evidence.length >= 2, 'Food dominance discovery backed by >= 2 evidentiary metrics');
  assert(foodDisc!.drillDownParams.category === 'Food', 'Drill-down targets Household Food category in Explorer');

  const skipDisc = discoveryModels.find((d) => d.id === 'disc-spotify-skip-shift');
  assert(!!skipDisc, 'Skip shift discovery found in view models');
  assert(skipDisc!.drillDownParams.year === '2015', 'Skip shift drill-down targets 2015 transition in Explorer');

  // STEP 5: LIFE CONSTELLATION NETWORK AUDIT
  console.log('\nSTEP 5: Life Constellation Knowledge Network');
  const graph = buildConstellationGraph(analytics);
  assert(graph.nodes.length >= 10, `Constellation rendered ${graph.nodes.length} nodes (>= 10)`);
  assert(graph.edges.length >= 10, `Constellation contains ${graph.edges.length} edges (>= 10)`);
  assert(graph.nodes.some((n) => n.id === 'node-life'), 'LIFELINE core hub node exists in Constellation');
  assert(graph.nodes.some((n) => n.id === 'stream-spotify'), 'Music Stream node linked in Constellation');
  assert(graph.nodes.some((n) => n.id === 'stream-household'), 'Domestic Ledger node linked in Constellation');
  assert(graph.nodes.some((n) => n.id === 'stream-transactions'), 'Commerce Stream node linked in Constellation');

  // STEP 6: RECEIPT EXPLORER ENGINE AUDIT
  console.log('\nSTEP 6: Receipt Explorer Multi-Stream Engine');
  const sampleSpotReceipts = spotSample.records.slice(0, 100).map((r, i) => spotifyToReceipt(r, i));
  const sampleHouseReceipts = houseNorm.records.slice(0, 100).map((r, i) => householdToReceipt(r, i));
  const sampleTxnReceipts = txnNorm.records.slice(0, 100).map((r, i) => transactionToReceipt(r, i));

  // Search filtering
  const filteredFood = filterReceipts(sampleHouseReceipts, {
    stream: 'household',
    search: 'Food',
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
  });
  assert(filteredFood.length > 0, `Search filtering on 'Food' successfully filtered receipts (${filteredFood.length} matches)`);

  // Sorting & pagination
  const sorted = sortReceipts(sampleHouseReceipts, 'recent');
  assert(sorted.length === sampleHouseReceipts.length, 'Receipt sorting preserved record count');
  const paged = paginateReceipts(sorted, 1, 10);
  assert(paged.items.length === 10, 'Pagination page 1 returns exact pageSize items (10)');

  // STEP 7: STORY MODE & NARRATIVE SYNTHESIS AUDIT
  console.log('\nSTEP 7: Story Mode Narrative & Evidentiary Synthesis');
  const chapters = buildStoryViewModels(analytics);
  assert(chapters.length === 5, `Story Mode generated exactly 5 chapters (got ${chapters.length})`);

  const expectedThemes = ['THE RHYTHM', 'THE SHIFT', 'THE EVERYDAY', 'THE COMMERCE', 'THE BIGGER PICTURE'];
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    assert(ch.themeTag === expectedThemes[i], `Chapter ${ch.chapterNumber} theme is ${expectedThemes[i]}`);
    assert(ch.evidence.length > 0, `Chapter ${ch.chapterNumber} backed by verified evidence items (${ch.evidence.length})`);
    assert(!!ch.visualizationConfig, `Chapter ${ch.chapterNumber} has custom evidentiary visualization`);
    assert(!!ch.drillDownParams.stream, `Chapter ${ch.chapterNumber} includes Explorer deep-link parameters`);
    assert(!!ch.drillDownParams.storyChapter, `Chapter ${ch.chapterNumber} passes storyChapter context`);
  }

  const storySummary = computeStorySummaryMetrics(analytics);
  assert(storySummary.totalDiscoveries > 0, `Story summary metrics extracted ${storySummary.totalDiscoveries} discoveries`);
  assert(storySummary.totalConnections > 0, `Story summary metrics extracted ${storySummary.totalConnections} connections`);

  // STEP 8: PRIVACY & PII SCRUBBING AUDIT
  console.log('\nSTEP 8: Privacy & Strict PII Sanitization Guarantee');
  const payloadStr = JSON.stringify({
    analytics,
    discoveryModels,
    graph,
    chapters,
    storySummary,
    sampleTxnReceipts,
  });

  const piiPatterns = [
    /cc_num/i,
    /customer_id/i,
    /\b\d{16}\b/,
    /\b\d{4}-\d{4}-\d{4}-\d{4}\b/,
  ];

  let piiDetected = false;
  for (const pattern of piiPatterns) {
    if (pattern.test(payloadStr)) {
      piiDetected = true;
      break;
    }
  }
  assert(!piiDetected, 'Zero PII identifiers detected across all UI view models and data structures');

  // STEP 9: DATA HONESTY & PROHIBITED LANGUAGE AUDIT
  console.log('\nSTEP 9: Data Honesty & Non-Causal Vocabulary');
  const prohibitedClaims = [
    'you became happier',
    'you were lonely',
    'you were stressed',
    'you changed your personality',
    'you became healthier',
    'you fell in love',
    'caused by',
    'this caused',
  ];

  let ungroundedClaimFound = false;
  for (const ch of chapters) {
    const fullText = `${ch.title} ${ch.subtitle} ${ch.narrative}`.toLowerCase();
    for (const phrase of prohibitedClaims) {
      if (fullText.includes(phrase)) {
        ungroundedClaimFound = true;
        console.error(`Prohibited claim found: "${phrase}" in Chapter ${ch.chapterNumber}`);
      }
    }
  }
  assert(!ungroundedClaimFound, 'Zero ungrounded emotional or causal claims in story narratives');

  console.log('\n====================================================');
  console.log(`END-TO-END QA RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runEndToEndQA().catch((err) => {
  console.error('QA script error:', err);
  process.exit(1);
});
