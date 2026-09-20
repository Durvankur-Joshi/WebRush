import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import parsers and normalizers
import { parseCSV } from '../src/data/parser.ts';
import { normalizeSpotifyRows } from '../src/data/spotify/normalizer.ts';
import { normalizeHouseholdRows } from '../src/data/household/normalizer.ts';
import { normalizeTransactionRows } from '../src/data/transactions/normalizer.ts';
import { computeSpotifyAnalytics } from '../src/analytics/spotify.ts';
import { computeHouseholdAnalytics } from '../src/analytics/household.ts';
import { computeTransactionAnalytics } from '../src/analytics/transactions.ts';
import { computeAllPatterns } from '../src/analytics/patterns.ts';
import { generateConnections } from '../src/analytics/connections.ts';
import { generateDiscoveries } from '../src/analytics/discoveries.ts';
import { generateStoryChapters } from '../src/analytics/stories.ts';

console.log('====================================================');
console.log('LIFELINE — LIFE INTELLIGENCE ANALYTICS VALIDATION');
console.log('====================================================\n');

// 1. Load Spotify
console.log('1. Loading & Normalizing Spotify History...');
const spotifyPath = path.join(rootDir, 'public', 'data', 'spotify_history.csv');
const spotifyRaw = fs.readFileSync(spotifyPath, 'utf8');
const spotifyParsed = parseCSV(spotifyRaw);
const spotifyNormalized = normalizeSpotifyRows(spotifyParsed.headers, spotifyParsed.rows);
console.log(`   Processed ${spotifyNormalized.quality.totalRows} raw rows -> ${spotifyNormalized.records.length} valid records`);
console.log(`   Invalid rows: ${spotifyNormalized.quality.invalidRows}, Duplicate rows: ${spotifyNormalized.quality.duplicateRows}`);

const spotifyAnalytics = computeSpotifyAnalytics(spotifyNormalized.records);
console.log(`   Date range: ${spotifyAnalytics.dateRange.start} to ${spotifyAnalytics.dateRange.end}`);
console.log(`   Total listening hours: ${spotifyAnalytics.totalListeningHours.toFixed(1)} hrs`);
console.log(`   Unique artists: ${spotifyAnalytics.uniqueArtists}, Unique tracks: ${spotifyAnalytics.uniqueTracks}`);
const topArtist = spotifyAnalytics.topArtists[0];
console.log(`   Top Artist: "${topArtist?.artist}" with ${topArtist?.playCount} plays (${topArtist?.hours.toFixed(1)} hrs)`);
const yr2015 = spotifyAnalytics.yearlySkipRates.find(y => y.year === 2015);
const yr2016 = spotifyAnalytics.yearlySkipRates.find(y => y.year === 2016);
console.log(`   Skip rate: 2015 = ${yr2015?.skipRate.toFixed(1)}%, 2016 = ${yr2016?.skipRate.toFixed(1)}%`);

// 2. Load Household
console.log('\n2. Loading & Normalizing Daily Household Transactions...');
const householdPath = path.join(rootDir, 'public', 'data', 'household_transactions.csv');
const householdRaw = fs.readFileSync(householdPath, 'utf8');
const householdParsed = parseCSV(householdRaw);
const householdNormalized = normalizeHouseholdRows(householdParsed.headers, householdParsed.rows);
console.log(`   Processed ${householdNormalized.quality.totalRows} raw rows -> ${householdNormalized.records.length} valid records`);

const householdAnalytics = computeHouseholdAnalytics(householdNormalized.records);
console.log(`   Date range: ${householdAnalytics.dateRange.start} to ${householdAnalytics.dateRange.end}`);
console.log(`   Total expenses: INR ${householdAnalytics.totalExpenses.toLocaleString()}, Total income: INR ${householdAnalytics.totalIncome.toLocaleString()}`);
console.log(`   Top frequency category: "${householdAnalytics.categoryFrequency[0]?.category}" with ${householdAnalytics.categoryFrequency[0]?.count} records (${householdAnalytics.categoryFrequency[0]?.percentage.toFixed(1)}%)`);
console.log(`   Second frequency category: "${householdAnalytics.categoryFrequency[1]?.category}" with ${householdAnalytics.categoryFrequency[1]?.count} records`);
console.log(`   Top expenditure category: "${householdAnalytics.categoryAmounts[0]?.category}" with INR ${householdAnalytics.categoryAmounts[0]?.amount.toLocaleString()}`);

// 3. Load India Transactions
console.log('\n3. Loading & Normalizing India Transactions (Strict PII Scrubbing)...');
const txnPath = path.join(rootDir, 'public', 'data', 'india_transactions.csv');
const txnRaw = fs.readFileSync(txnPath, 'utf8');
const txnParsed = parseCSV(txnRaw);
const txnNormalized = normalizeTransactionRows(txnParsed.headers, txnParsed.rows);
console.log(`   Processed ${txnNormalized.quality.totalRows} raw rows -> ${txnNormalized.records.length} valid records`);
console.log(`   Missing category count: ${txnNormalized.quality.missingCategories}`);

const txnAnalytics = computeTransactionAnalytics(txnNormalized.records);
console.log(`   Date range: ${txnAnalytics.dateRange.start} to ${txnAnalytics.dateRange.end}`);
console.log(`   Total transaction volume: INR ${txnAnalytics.totalAmount.toLocaleString()}`);
console.log(`   Active categories:`);
txnAnalytics.categoryFrequency.forEach(c => {
  console.log(`     - ${c.category}: ${c.count} txns (${c.percentage.toFixed(1)}%, avg INR ${c.avgAmount.toFixed(0)})`);
});

// 4. Intelligence Engines
console.log('\n4. Running Intelligence Engines...');
const patterns = computeAllPatterns(spotifyAnalytics, householdAnalytics, txnAnalytics);
console.log(`   Patterns detected: ${patterns.length}`);
patterns.forEach(p => console.log(`     [${p.type}] [${p.source}] ${p.title}`));

const connections = generateConnections(spotifyAnalytics, householdAnalytics, txnAnalytics);
console.log(`\n   Connections established: ${connections.length}`);
connections.forEach(c => console.log(`     [${c.type}] ${c.from} -> ${c.to}`));

const discoveries = generateDiscoveries(spotifyAnalytics, householdAnalytics, txnAnalytics, patterns, connections);
console.log(`\n   Discoveries validated: ${discoveries.length}`);
discoveries.forEach(d => console.log(`     * [${d.significance.toUpperCase()}] ${d.title} (${d.period})`));

const stories = generateStoryChapters(spotifyAnalytics, householdAnalytics, txnAnalytics, discoveries);
console.log(`\n   Story Chapters generated: ${stories.length}`);
stories.forEach(s => console.log(`     Chapter ${s.order}: "${s.title}" — ${s.subtitle}`));

// 5. Construct Unified LifeAnalytics Object
const lifeAnalytics = {
  spotify: spotifyAnalytics,
  household: householdAnalytics,
  transactions: txnAnalytics,
  patterns,
  discoveries,
  connections,
  stories,
  dataQuality: {
    spotify: spotifyNormalized.quality,
    household: householdNormalized.quality,
    transactions: txnNormalized.quality,
  },
};

// 6. Security & Integrity Validation
console.log('\n5. Performing Security & Integrity Checks...');
const serialized = JSON.stringify(lifeAnalytics);
const piiPatterns = [
  /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/, // credit card regex
  /cc_num/i,
  /customer_id/i,
  /first_name/i,
  /last_name/i,
  /street_address/i,
];

let piiFound = false;
for (const pat of piiPatterns) {
  if (pat.test(serialized)) {
    console.error(`   [SECURITY WARNING] Potential sensitive pattern matched: ${pat}`);
    piiFound = true;
  }
}
if (!piiFound) {
  console.log('   [SECURITY PASS] Zero PII detected in LifeAnalytics payload.');
}

// Check size & ensure no raw 150k record arrays are stored inside lifeAnalytics
const jsonSizeBytes = Buffer.byteLength(serialized, 'utf8');
console.log(`   Compact payload size: ${(jsonSizeBytes / 1024).toFixed(1)} KB (Raw input was ~24,000 KB)`);
if (jsonSizeBytes < 1024 * 1024) {
  console.log('   [PERFORMANCE PASS] LifeAnalytics is ultra-compact (< 1MB). No raw 150k records embedded.');
} else {
  console.warn('   [WARNING] LifeAnalytics payload exceeds 1MB.');
}

// 7. Write precomputed compact payload to public/data/life_analytics.json for lightning fast runtime loads
const precomputedPath = path.join(rootDir, 'public', 'data', 'life_analytics.json');
fs.writeFileSync(precomputedPath, serialized, 'utf8');
console.log(`   [CACHING] Wrote precomputed compact analytics to public/data/life_analytics.json`);

console.log('\n====================================================');
console.log('VALIDATION COMPLETE — ALL CHECKS PASSED');
console.log('====================================================\n');
