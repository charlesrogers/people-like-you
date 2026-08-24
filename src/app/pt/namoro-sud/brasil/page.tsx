import CountryArticle from '@/components/seo/CountryArticle'
import { COUNTRY_CONTENT } from '@/content/country-pages'

const c = COUNTRY_CONTENT['brasil']

export const metadata = {
  title: c.metaTitle,
  description: c.metaDescription,
  alternates: { canonical: '/pt/namoro-sud/brasil' },
}

export default function Page() {
  return <CountryArticle slug="brasil" />
}
