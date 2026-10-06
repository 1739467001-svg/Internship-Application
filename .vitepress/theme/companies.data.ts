import { createContentLoader } from 'vitepress'

export interface Company {
  url: string
  title: string
  company: string
  company_en?: string
  category: 'ai-tech' | 'soe' | 'foreign'
  program: string
  status: 'open' | 'upcoming' | 'rolling' | 'closed'
  directions: string[]
  locations: string[]
  overseas?: string
  apply_url?: string
  deadline?: string
  match: number
  verified: string
}

declare const data: Company[]
export { data }

const day = (v: unknown) =>
  v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? undefined : String(v)

/** 构建时读取 companies/ 下所有公司页的 front matter，供「实习看板」使用 */
export default createContentLoader('companies/*/*.md', {
  transform(raw): Company[] {
    return raw
      .filter((p) => p.frontmatter.company)
      .map(({ url, frontmatter: f }) => ({
        url,
        title: f.title,
        company: f.company,
        company_en: f.company_en,
        category: f.category,
        program: f.program,
        status: f.status,
        directions: f.directions ?? [],
        locations: f.locations ?? [],
        overseas: f.overseas,
        apply_url: f.apply_url,
        deadline: day(f.deadline),
        match: Number(f.match ?? 0),
        verified: day(f.verified) ?? ''
      }))
      .sort((a, b) => b.match - a.match)
  }
})
