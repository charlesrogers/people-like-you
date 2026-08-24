import ArticleShell, {
  HeroCopy, SectionHeading, Paras, StatsTable, FaqBlock, faqJsonLd, JsonLd, WaitlistCta, SourceNote,
} from '@/components/seo/ArticleShell'
import IntlWaitlistForm from '@/components/IntlWaitlistForm'
import { COUNTRY_CONTENT } from '@/content/country-pages'
import countryData from '@/data/seo-countries.json'

const SOURCE_NOTE: Record<string, string> = {
  en: `Membership, congregation, mission and temple figures are the Church's official statistics as of 31 December 2025 (churchofjesuschrist.org). Official membership counts everyone on the records of the Church; it is not an estimate of activity, and this page makes none.`,
  es: `Las cifras de miembros, congregaciones, misiones y templos son las estadísticas oficiales de la Iglesia al 31 de diciembre de 2025 (churchofjesuschrist.org). La membresía oficial cuenta a todas las personas en los registros de la Iglesia; no es una estimación de actividad, y esta página no hace ninguna.`,
  pt: `Os números de membros, congregações, missões e templos são as estatísticas oficiais da Igreja em 31 de dezembro de 2025 (churchofjesuschrist.org). A membresia oficial conta todas as pessoas nos registros da Igreja; não é uma estimativa de atividade, e esta página não faz nenhuma.`,
}

const CRUMB: Record<string, { href: string; label: string }> = {
  en: { href: '/lds-singles', label: 'All cities & countries' },
  es: { href: '/es/solteros-sud', label: 'Todos los países' },
  pt: { href: '/lds-singles', label: 'All cities & countries' },
}

// One-line hero hook (the honest country-specific framing lives inside the form card).
const HOOK: Record<string, string> = {
  en: `A matchmaker, not another swipe app: one real introduction a day, with the reason you two would work.`,
  es: `Un casamentero, no otra app de deslizar: una presentación real al día, con la razón por la que ustedes dos encajarían.`,
  pt: `Um casamenteiro, não mais um app de deslizar: uma apresentação real por dia, com a razão pela qual vocês dois combinariam.`,
}

/** Shared renderer for country pages in all three languages — waitlist-first. */
export default function CountryArticle({ slug }: { slug: string }) {
  const c = COUNTRY_CONTENT[slug]
  const d = countryData.countries.find(x => x.slug === slug)!
  const locale = `${c.lang}-${c.countryCode}`
  const fmt = (n: number) => n.toLocaleString(locale)
  const rows: [string, string][] = [
    [c.statLabels.members, fmt(d.members)],
    [c.statLabels.congregations, fmt(d.congregations)],
    [c.statLabels.missions, fmt(d.missions)],
    [c.statLabels.temples, d.temples],
  ]
  return (
    <ArticleShell
      lang={c.lang}
      crumb={CRUMB[c.lang]}
      hero={
        <>
          <HeroCopy h1={c.h1} hook={HOOK[c.lang]} />
          <IntlWaitlistForm country={c.countryCode} campaign={`country-${slug}`} strings={c.form} />
        </>
      }
    >
      <JsonLd data={faqJsonLd(c.faq)} />
      <Paras paras={c.intro} />
      <SectionHeading>{c.labels.numbers}</SectionHeading>
      <StatsTable rows={rows} caption={c.numbersCaption} />
      <SectionHeading>{c.labels.meaning}</SectionHeading>
      <Paras paras={c.meaning} />
      <SectionHeading>{c.labels.meet}</SectionHeading>
      <Paras paras={c.meet} />
      <SectionHeading>{c.labels.honest}</SectionHeading>
      <Paras paras={c.honest} />
      <FaqBlock faq={c.faq} heading={c.labels.faq} />
      <WaitlistCta title={c.form.title} body={c.form.body} button={`${c.form.button} ↑`} />
      <SourceNote>{SOURCE_NOTE[c.lang]}</SourceNote>
    </ArticleShell>
  )
}
