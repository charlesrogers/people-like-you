// Builds src/data/seo-*.json from the committed source CSVs for the organic-search pages.
// Run: node scripts/build-seo-data.mjs   (re-run only when the source data changes)
//
// Sources:
//  - data/lds-metro-density-2020.csv  — 2020 U.S. Religion Census, all 869 metro/micro areas
//  - data/metro-pages-data.csv        — Religion Census joined to ACS 2023 5-yr B12002
//    (never-married 20–34) for the seven originally-approved metros
//  - Philadelphia (added to wave 1 by Charles 2026-08-22) has no row in the ACS CSV; its
//    pool numbers below were pulled from the same table (B12002, never-married 20–34,
//    male 006+007+008 / female 099+100+101) via Census Reporter, ACS 2024 5-year release.
//    Column mapping sanity-checked against Boise (77.5 vs 77.0 ratio, same shape).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

function parseCsv(path) {
  const [header, ...lines] = readFileSync(path, 'utf8').replace(/\r/g, '').trim().split('\n')
  const cols = header.split(',')
  return lines.map(line => {
    // split on commas outside quotes, then strip the quotes
    const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, ''))
    return Object.fromEntries(cols.map((c, i) => [c, parts[i]]))
  })
}

const density = parseCsv('data/lds-metro-density-2020.csv').map(r => ({
  cbsa: r.cbsa,
  name: r.name.replace(/ (Metro|Micro) Area$/, ''),
  micro: / Micro Area$/.test(r.name),
  cong: +r.cong,
  adherents: +r.adherents,
  pct: +(+r.pct_pop).toFixed(1),
  rankAdherents: +r.rank_adherents,
  rankPct: +r.rank_pct,
}))

const joined = parseCsv('data/metro-pages-data.csv')

// ---- The eight wave-1 metro pages -------------------------------------------------
const PHILLY_ACS = { total: 933405, men: 478647, women: 454758, vintage: 'ACS 2024 5-year' }

const PAGES = [
  { slug: 'salt-lake-city', cbsa: '41620', short: 'Salt Lake City' },
  { slug: 'provo-orem', cbsa: '39340', short: 'Provo–Orem' },
  { slug: 'phoenix', cbsa: '38060', short: 'Phoenix' },
  { slug: 'boise', cbsa: '14260', short: 'Boise' },
  { slug: 'washington-dc', cbsa: '47900', short: 'Washington, DC' },
  { slug: 'new-york', cbsa: '35620', short: 'New York City' },
  { slug: 'rexburg', cbsa: '39940', short: 'Rexburg' },
  { slug: 'philadelphia', cbsa: '37980', short: 'Philadelphia' },
]

const metros = PAGES.map(p => {
  const d = density.find(r => r.cbsa === p.cbsa)
  if (!d) throw new Error(`No density row for ${p.slug}`)
  const j = joined.find(r => r.cbsa === p.cbsa)
  const pool = j
    ? { total: +r(j.nevermarried_20_34), men: +r(j.nm_men), women: +r(j.nm_women), vintage: 'ACS 2023 5-year' }
    : p.cbsa === '37980' ? PHILLY_ACS : null
  return { ...p, name: d.name, cong: d.cong, adherents: d.adherents, pct: d.pct, rankAdherents: d.rankAdherents, rankPct: d.rankPct, pool }
  function r(v) { return v }
})

// ---- Ranking pages ----------------------------------------------------------------
// Top 25 by share of population (metro areas only — micro areas like Rexburg's neighbors
// would swamp the list and the page claims "metros").
const top25Pct = density.filter(d => !d.micro).sort((a, b) => b.pct - a.pct).slice(0, 25)

// Diaspora: outside the Mormon Corridor's core states (UT, ID), ranked by adherents.
const inCorridor = d => /, (UT|ID)$/.test(d.name) || /UT-ID/.test(d.name)
const diaspora = density.filter(d => !d.micro && !inCorridor(d)).sort((a, b) => b.adherents - a.adherents).slice(0, 15)

// Full reference list, adherents descending (metro + micro, labeled).
const all = density.slice().sort((a, b) => b.adherents - a.adherents)

mkdirSync('src/data', { recursive: true })
writeFileSync('src/data/seo-metros.json', JSON.stringify(metros, null, 1))
writeFileSync('src/data/seo-rankings.json', JSON.stringify({ top25Pct, diaspora, all }, null, 1))
console.log(`metros: ${metros.length}, top25: ${top25Pct.length}, diaspora: ${diaspora.length}, all: ${all.length}`)
console.log(metros.map(m => `${m.slug}: ${m.cong} congs, ${m.adherents} adherents, ${m.pct}%${m.pool ? '' : ' (NO POOL DATA)'}`).join('\n'))
