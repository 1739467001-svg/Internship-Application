#!/usr/bin/env node
/**
 * 根据公司页、搜索页的 front matter，重新生成各索引中 <!-- AUTO:xxx:START/END --> 之间的内容。
 *
 *   npm run index           # 写入文件
 *   node scripts/build-index.mjs --check   # 只检查是否最新（CI 用）
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const CATEGORIES = {
  'ai-tech': '🤖 AI / 科技大厂（行业赋能线）',
  soe: '⚡ 传统行业央国企',
  foreign: '🌍 外企 / 跨国企业'
}
export const STATUS = { open: '🟢 开放中', upcoming: '🟡 即将开放', rolling: '🔵 滚动招聘', closed: '🔴 已截止' }
const stars = (n) => '⭐'.repeat(n)
const fmtDate = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? ''))
const list = (v) => (Array.isArray(v) ? v.join('、') : v ?? '')

function readMd(dir) {
  const abs = join(ROOT, dir)
  if (!existsSync(abs)) return []
  return readdirSync(abs)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => {
      const raw = readFileSync(join(abs, f), 'utf-8')
      const { data, content } = matter(raw)
      return { file: f, path: `${dir}/${f}`, data, h1: content.match(/^#\s+(.+)$/m)?.[1]?.trim() }
    })
}

export function loadCompanies() {
  return Object.keys(CATEGORIES)
    .flatMap((cat) => readMd(`companies/${cat}`))
    .sort((a, b) => (b.data.match ?? 0) - (a.data.match ?? 0) || a.file.localeCompare(b.file))
}

export function loadSearches() {
  return readMd('searches').sort((a, b) => b.file.localeCompare(a.file))
}

/** 公司表格。from = 表格所在文件的目录（用于计算相对链接） */
function companyTable(rows, from) {
  const rel = (p) => (from ? p.replace(`${from}/`, '') : p)
  const head = '| 公司 | 项目 / 岗位 | 状态 | 匹配度 | 地点 | 核实日期 |\n| --- | --- | --- | --- | --- | --- |'
  const body = rows.map(
    ({ path, data: d }) =>
      `| [${d.company}](${rel(path)}) | ${d.program} | ${STATUS[d.status] ?? d.status} | ${stars(d.match)} | ${list(d.locations)} | ${fmtDate(d.verified)} |`
  )
  return [head, ...body].join('\n')
}

function companiesIndex(companies) {
  return Object.entries(CATEGORIES)
    .map(([cat, title]) => {
      const rows = companies.filter((c) => c.data.category === cat)
      return `## ${title}\n\n${rows.length ? companyTable(rows, 'companies') : '_暂无_'}`
    })
    .join('\n\n')
}

function overview(companies) {
  const count = (cat) => companies.filter((c) => c.data.category === cat).length
  const top = companies.filter((c) => (c.data.match ?? 0) >= 4)
  return [
    `| 分类 | 收录公司数 |\n| --- | --- |`,
    ...Object.entries(CATEGORIES).map(([k, t]) => `| ${t} | ${count(k)} |`),
    '',
    `**⭐ 重点推荐（匹配度 ≥ 4）**`,
    '',
    companyTable(top, '')
  ].join('\n')
}

function searchList(searches, from) {
  if (!searches.length) return '_暂无搜索记录_'
  const rel = (p) => (from ? p.replace(`${from}/`, '') : p)
  return [
    '| 日期 | 搜索主题 | 收录 |\n| --- | --- | --- |',
    ...searches.map(
      ({ path, data: d, h1 }) =>
        `| ${fmtDate(d.date)} | [${d.topic ?? h1}](${rel(path)}) | ${d.count ?? '-'} 家 |`
    )
  ].join('\n')
}

/** 返回 { 文件路径: { 标记名: 内容 } } */
export function generate() {
  const companies = loadCompanies()
  const searches = loadSearches()
  return {
    'companies/README.md': { COMPANIES: companiesIndex(companies) },
    'searches/README.md': { SEARCHES: searchList(searches, 'searches') },
    'README.md': { OVERVIEW: overview(companies), LATEST: searchList(searches.slice(0, 3), '') }
  }
}

export function applyBlocks(text, blocks, file) {
  for (const [name, content] of Object.entries(blocks)) {
    const re = new RegExp(`(<!-- AUTO:${name}:START[^>]*-->)[\\s\\S]*?(<!-- AUTO:${name}:END -->)`)
    if (!re.test(text)) throw new Error(`${file} 缺少标记 <!-- AUTO:${name}:START --> / <!-- AUTO:${name}:END -->`)
    text = text.replace(re, (_, a, b) => `${a}\n\n${content}\n\n${b}`)
  }
  return text
}

/** 返回过期（与生成结果不一致）的文件列表；write=true 时直接写入 */
export function run({ write }) {
  const stale = []
  for (const [file, blocks] of Object.entries(generate())) {
    const abs = join(ROOT, file)
    const before = readFileSync(abs, 'utf-8')
    const after = applyBlocks(before, blocks, file)
    if (after !== before) {
      stale.push(file)
      if (write) writeFileSync(abs, after)
    }
  }
  return stale
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes('--check')
  const stale = run({ write: !check })
  if (check && stale.length) {
    console.error(`❌ 索引不是最新的：${stale.join(', ')}\n   请运行 npm run index`)
    process.exit(1)
  }
  console.log(stale.length ? `✅ 已更新：${stale.join(', ')}` : '✅ 索引已是最新')
}
