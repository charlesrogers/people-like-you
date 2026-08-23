-- International waitlist capture (organic country pages, 2026-08-22).
-- The country pages (/es/solteros-sud/*, /pt/namoro-sud/brasil, /lds-singles/philippines,
-- /lds-singles/nigeria) capture phone + country only — no ZIP, no metro. `country` is
-- ISO-3166 alpha-2; NULL means a US signup from the existing phone+ZIP flow.
-- Waitlist rows by country are the demand signal that decides whether PLY ever goes
-- international (specs/organic-search-international.md §2).

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS country text;
CREATE INDEX IF NOT EXISTS idx_waitlist_country ON waitlist(country) WHERE country IS NOT NULL;

NOTIFY pgrst, 'reload schema';
