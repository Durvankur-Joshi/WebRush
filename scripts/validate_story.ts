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
import { buildStoryViewModels, computeStorySummaryMetrics } from '../src/features/story/storyModel.ts';
import { LifeAnalytics } from '../src/analytics/types.ts';

async function main() {
  console.log('=== VALIDATING PHASE 6: STORY MODE ===\n');

  // 1. Ingest datasets and compute analytics
  console.log('1. Constructing LifeAnalytics from CSV data files...');
  const spotPath = path.join(rootDir, 'public', 'data', 'spotify_history.csv');
  const spotParsed = parseCSV(fs.readFileSync(spotPath, 'utf8'));
  const spotSample = normalizeSpotifyRows(spotParsed.headers, spotParsed.rows.slice(0, 10000));
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

  const analytics: LifeAnalytics = {
    timestamp: new Date().toISOString(),
    spotify: spotifyAnalytics,
    household: householdAnalytics,
    transactions: transactionAnalytics,
    patterns: [],
    connections,
    discoveries,
  };
  console.log('✓ LifeAnalytics computed successfully.\n');

  // 2. Generate Story View Models
  console.log('2. Building Story Chapters from analytics...');
  const chapters = buildStoryViewModels(analytics);
  console.log(`✓ Generated ${chapters.length} story chapters.`);
  if (chapters.length < 3 || chapters.length > 6) {
    throw new Error(`Expected between 3 and 6 chapters, got ${chapters.length}`);
  }

  // 3. Verify each chapter's properties
  console.log('\n3. Verifying chapter properties and evidence backing:');
  const prohibitedPhrases = [
    'you became happier',
    'you were lonely',
    'you were stressed',
    'you changed your personality',
    'you became healthier',
    'you fell in love',
    'caused by',
    'this caused',
  ];

  for (const ch of chapters) {
    console.log(`\n--- Chapter ${ch.chapterNumber}: ${ch.title} [${ch.themeTag}] ---`);
    console.log(`  Stream: ${ch.primaryDataset} | Period: ${ch.period}`);
    console.log(`  Subtitle: ${ch.subtitle}`);
    console.log(`  Narrative: ${ch.narrative.slice(0, 100)}...`);

    // Check evidence
    if (!ch.evidence || ch.evidence.length === 0) {
      throw new Error(`Chapter ${ch.chapterNumber} has no backing evidence!`);
    }
    console.log(`  Evidence items (${ch.evidence.length}):`);
    for (const ev of ch.evidence) {
      console.log(`    • ${ev.metric}: ${ev.value} ${ev.unit} (${ev.period})`);
      if (ev.value === undefined || ev.value === null) {
        throw new Error(`Evidence item "${ev.metric}" in Chapter ${ch.chapterNumber} has no value!`);
      }
    }

    // Check visualization
    if (!ch.visualizationConfig || ch.visualizationConfig.dataPoints.length === 0) {
      throw new Error(`Chapter ${ch.chapterNumber} has no visualization data points!`);
    }
    console.log(`  Visualization: ${ch.visualizationConfig.type} (${ch.visualizationConfig.dataPoints.length} points)`);

    // Check drillDownParams
    if (!ch.drillDownParams || !ch.drillDownParams.stream) {
      throw new Error(`Chapter ${ch.chapterNumber} missing explorer drillDownParams!`);
    }
    console.log(`  Explorer drill-down target: stream=${ch.drillDownParams.stream}, storyChapter=${ch.drillDownParams.storyChapter}`);

    // Check prohibited emotional phrases
    const textToCheck = `${ch.narrative} ${ch.subtitle}`.toLowerCase();
    for (const phrase of prohibitedPhrases) {
      if (textToCheck.includes(phrase)) {
        throw new Error(`Prohibited emotional/causal phrase detected in Chapter ${ch.chapterNumber}: "${phrase}"`);
      }
    }

    // Check PII
    const rawJson = JSON.stringify(ch);
    const piiRegexes = [
      /cc_num/i,
      /customer_id/i,
      /\b\d{16}\b/,
      /\b\d{4}-\d{4}-\d{4}-\d{4}\b/,
    ];
    for (const regex of piiRegexes) {
      if (regex.test(rawJson)) {
        throw new Error(`Potential PII detected in Chapter ${ch.chapterNumber} matching ${regex}!`);
      }
    }
  }
  console.log('\n✓ All chapters passed evidence, language honesty, and PII checks.');

  // 4. Test empty analytics behavior
  console.log('\n4. Testing empty analytics behavior...');
  const emptyAnalytics: any = {
    spotify: { totalRecords: 0, topArtists: [], yearlyListening: [] },
    household: { totalRecords: 0, categoryFrequency: [] },
    transactions: { totalRecords: 0, categoryAmounts: [] },
    discoveries: [],
    connections: [],
  };
  const emptyChapters = buildStoryViewModels(emptyAnalytics);
  console.log(`✓ Empty analytics generated ${emptyChapters.length} chapters.`);

  // 5. Test summary metrics computation
  console.log('\n5. Testing story summary metrics...');
  const summary = computeStorySummaryMetrics(analytics);
  console.log(`✓ Listening Records: ${summary.listeningRecords}`);
  console.log(`✓ Household Receipts: ${summary.householdReceipts}`);
  console.log(`✓ Transaction Records: ${summary.transactionRecords}`);
  console.log(`✓ Discoveries: ${summary.totalDiscoveries}`);
  console.log(`✓ Connections: ${summary.totalConnections}`);

  if (summary.totalDiscoveries === 0 || summary.totalConnections === 0) {
    throw new Error('Summary metrics failed to extract discoveries or connections from analytics.');
  }

  console.log('\n========================================');
  console.log('✓ ALL PHASE 6 STORY MODE TESTS PASSED!');
  console.log('========================================');
}

main().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
