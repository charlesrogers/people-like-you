import Link from 'next/link'
import ArticleShell, { Paras } from '@/components/seo/ArticleShell'
import { COUNTRY_CONTENT } from '@/content/country-pages'
import countryData from '@/data/seo-countries.json'

export const metadata = {
  title: 'Solteros SUD por país — People Like You',
  description:
    'Las cifras reales de la Iglesia en cada país hispanohablante con más Santos de los Últimos Días — y qué significan para los solteros SUD, con honestidad.',
  alternates: { canonical: '/es/solteros-sud' },
}

const ES = Object.values(COUNTRY_CONTENT).filter(c => c.lang === 'es')

export default function Page() {
  return (
    <ArticleShell lang="es" backHref="/lds-singles" backLabel="All cities & countries">
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-stone-900">Solteros SUD por país</h1>
      <Paras
        paras={[
          `People Like You es un casamentero — una presentación real al día, con la razón por la que ustedes dos encajarían. Estas páginas cuentan, con cifras oficiales y sin adornos, cómo es ser soltero Santo de los Últimos Días en cada uno de los países hispanohablantes con más miembros de la Iglesia.`,
        ]}
      />
      <ul className="mt-8 space-y-3">
        {ES.map(c => {
          const d = countryData.countries.find(x => x.slug === c.slug)!
          return (
            <li key={c.slug}>
              <Link
                href={`/es/solteros-sud/${c.slug}`}
                className="flex items-baseline justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 transition hover:border-stone-300"
              >
                <span className="font-semibold text-stone-900">{c.h1}</span>
                <span className="text-sm tabular-nums text-stone-400">
                  {d.members.toLocaleString(`es-${c.countryCode}`)} miembros
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </ArticleShell>
  )
}
