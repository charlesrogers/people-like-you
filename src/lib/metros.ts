/**
 * Named launch metros. This is the curated list of cities we launch into, in priority
 * order. A signup's ZIP maps to one of these via:
 *   1. the CBSA `metro_area` from zip_locations (accurate; cleanly separates e.g.
 *      Utah Valley "Provo-Orem" from Salt Lake City), then
 *   2. a ZIP3 prefix fallback (for metros whose ZIPs lack a metro_area — e.g. Idaho).
 *
 * EDIT THIS LIST to add/remove/rename metros or tune each city's go-live gate.
 * `gate`: a metro is "ready" to launch when it clears min_women AND ratio ≤ max_ratio
 * AND total ≥ min_total. Women-first is the binding constraint, so the gate leads with women.
 */

export interface MetroGate {
  min_women: number
  min_total: number
  max_ratio: number // men : women
}

export interface MetroDef {
  key: string
  name: string
  /** Exact CBSA metro_area strings from zip_locations that belong to this metro. */
  metroAreas: string[]
  /** ZIP3 prefixes used only when a ZIP has no metro_area. Keep unambiguous. */
  zip3: string[]
  gate?: Partial<MetroGate>
}

export const DEFAULT_GATE: MetroGate = { min_women: 75, min_total: 150, max_ratio: 1.5 }

// Ordered by launch priority. Utah Valley is first regardless of signup ranking.
export const METROS: MetroDef[] = [
  // ── Utah / Idaho (LDS-dense core — launch here first) ──
  { key: 'utah-valley', name: 'Utah County',  metroAreas: ['Provo-Orem'],     zip3: ['846'], gate: { min_women: 50, min_total: 100 } },
  { key: 'salt-lake',   name: 'Salt Lake',    metroAreas: ['Salt Lake City'], zip3: ['841'] },
  { key: 'rexburg',     name: 'Rexburg',      metroAreas: [],                 zip3: ['834'] }, // Rexburg + Idaho Falls
  { key: 'boise',       name: 'Boise',        metroAreas: [],                 zip3: ['836', '837'] },
  { key: 'ogden',       name: 'Ogden',        metroAreas: ['Ogden-Clearfield'], zip3: ['844'] },
  { key: 'logan',       name: 'Logan',        metroAreas: ['Logan'],          zip3: ['843'] },
  { key: 'st-george',   name: 'St. George',   metroAreas: ['St. George'],     zip3: ['847'] },
  // ── Major metros ──
  { key: 'las-vegas',   name: 'Las Vegas',    metroAreas: ['Las Vegas-Henderson-Paradise'], zip3: ['889', '890', '891'] },
  { key: 'phoenix',     name: 'Phoenix / Mesa', metroAreas: ['Phoenix-Mesa-Chandler'],      zip3: ['850', '852', '853'] },
  { key: 'denver',      name: 'Denver',       metroAreas: ['Denver-Aurora-Lakewood'],       zip3: ['800', '801', '802'] },
  { key: 'nyc',         name: 'NYC',          metroAreas: ['New York-Newark-Jersey City'],  zip3: ['100', '101', '102', '103', '104', '110', '111', '112', '113', '114', '116'] },
  { key: 'dc',          name: 'DC',           metroAreas: ['Washington-Arlington-Alexandria'], zip3: ['200', '202', '203', '204', '205', '206', '207', '208', '220', '221', '222', '223'] },
  { key: 'philly',      name: 'Philly',       metroAreas: ['Philadelphia-Camden-Wilmington'], zip3: ['189', '190', '191', '194'] },
  { key: 'boston',      name: 'Boston',       metroAreas: ['Boston-Cambridge-Newton'],      zip3: ['021', '022', '024'] },
  { key: 'bay-area',    name: 'Bay Area',     metroAreas: ['San Francisco-Oakland-Berkeley', 'San Jose-Sunnyvale-Santa Clara'], zip3: ['940', '941', '943', '944', '945', '946', '947', '948', '949', '950', '951'] },
  { key: 'la',          name: 'LA',           metroAreas: ['Los Angeles-Long Beach-Anaheim'], zip3: ['900', '901', '902', '903', '904', '905', '906', '907', '908', '910', '911', '912', '913', '914', '915', '916'] },
  { key: 'san-diego',   name: 'San Diego',    metroAreas: ['San Diego-Chula Vista-Carlsbad'], zip3: ['919', '920', '921'] },
  { key: 'seattle',     name: 'Seattle',      metroAreas: ['Seattle-Tacoma-Bellevue'],      zip3: ['980', '981', '982', '983', '984'] },
  { key: 'portland',    name: 'Portland',     metroAreas: ['Portland-Vancouver-Hillsboro'], zip3: ['970', '972'] },
  { key: 'dallas',      name: 'Dallas',       metroAreas: ['Dallas-Fort Worth-Arlington'],  zip3: ['750', '751', '752', '760', '761'] },
  { key: 'houston',     name: 'Houston',      metroAreas: ['Houston-The Woodlands-Sugar Land'], zip3: ['770', '772', '773', '774'] },
  { key: 'austin',      name: 'Austin',       metroAreas: ['Austin-Round Rock-Georgetown'], zip3: ['733', '786', '787'] },
  { key: 'chicago',     name: 'Chicago',      metroAreas: ['Chicago-Naperville-Elgin'],     zip3: ['606', '600', '601', '602'] },
  { key: 'atlanta',     name: 'Atlanta',      metroAreas: ['Atlanta-Sandy Springs-Alpharetta'], zip3: ['303', '300', '301'] },
]

const METRO_AREA_INDEX: Map<string, MetroDef> = (() => {
  const m = new Map<string, MetroDef>()
  for (const metro of METROS) for (const a of metro.metroAreas) m.set(a.toLowerCase(), metro)
  return m
})()

const ZIP3_INDEX: Map<string, MetroDef> = (() => {
  const m = new Map<string, MetroDef>()
  for (const metro of METROS) for (const z of metro.zip3) if (!m.has(z)) m.set(z, metro)
  return m
})()

/** Resolve a metro from a CBSA metro_area (preferred) or a raw ZIP (ZIP3 fallback). */
export function resolveMetro(opts: { metroArea?: string | null; zipcode?: string | null }): MetroDef | null {
  if (opts.metroArea) {
    const hit = METRO_AREA_INDEX.get(opts.metroArea.toLowerCase())
    if (hit) return hit
  }
  if (opts.zipcode && /^\d{5}$/.test(opts.zipcode)) {
    const hit = ZIP3_INDEX.get(opts.zipcode.slice(0, 3))
    if (hit) return hit
  }
  return null
}

export function gateFor(metro: MetroDef): MetroGate {
  return { ...DEFAULT_GATE, ...(metro.gate ?? {}) }
}
