#!/usr/bin/env node
/**
 * 把一次搜索「打包」成一份可以单独阅读、转发、打印的 Markdown：
 * 搜索汇总页 + 它链接到的所有公司详情页，合并成 exports/<搜索文件名>.md
 *
 *   npm run export                                       # 默认导出最新一次搜索
 *   npm run export -- searches/2026-10-06-first-full-scan.md
 *
 * 处理规则：
 * - 指向本报告内公司页的链接 → 文内跳转（#co-分类-slug）
 * - 其他相对链接 → GitHub 绝对地址，离开仓库也能点
 * - 公司页的 front matter → 信息表；标题整体降一级；去掉顶部返回链接
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, relative, resolve, posix } from 'node:path'
import matter from 'gray-matter'
import { ROOT, STATUS, CATEGORIES, loadSearches } from './build-index.mjs'

const REPO = 'https://github.com/1739467001-svg/Internship-Application/blob/HEAD/'
const fmtDate = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? ''))
const anchorOf = (repoPath) => 'co-' + repoPath.replace(/^companies\//, '').replace(/\.md$/, '').replace(/\//g, '-')
const BACKLINK = /^\[←[^\n]*\n+/m

/** 逐行处理，跳过代码块 */
function mapLines(text, fn) {
  let fence = false
  return text
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) fence = !fence
      return fence || /^\s*```/.test(line) ? line : fn(line)
    })
    .join('\n')
}

const demote = (text) => mapLines(text, (l) => (/^#{1,5}\s/.test(l) ? '#' + l : l))

/** 改写链接：报告内的公司页 → 锚点；其他相对链接 → GitHub 绝对地址 */
function rewriteLinks(text, fromRepoPath, included) {
  const baseDir = posix.dirname(fromRepoPath)
  return mapLines(text, (line) =>
    line.replace(/\]\(\s*([^)\s]+)\s*\)/g, (m, target) => {
      if (/^(https?:|mailto:|#)/.test(target)) return m
      const [p, hash] = target.split('#')
      const repoPath = posix.normalize(posix.join(baseDir, p))
      if (included.has(repoPath)) return `](#${anchorOf(repoPath)})`
      return `](${REPO}${repoPath}${hash ? '#' + hash : ''})`
    })
  )
}

function infoTable(d, repoPath) {
  const list = (v) => (Array.isArray(v) ? v.join('、') : v ?? '')
  const rows = [
    ['分类', CATEGORIES[d.category] ?? d.category],
    ['项目', d.program],
    ['状态', STATUS[d.status] ?? d.status],
    ['方向', list(d.directions)],
    ['地点', list(d.locations)],
    ['留学生', d.overseas],
    ['关键日期', d.deadline ? fmtDate(d.deadline) : ''],
    ['匹配度', '⭐'.repeat(Number(d.match) || 0)],
    ['最后核实', fmtDate(d.verified)],
    ['官方入口', d.apply_url ? `[${d.apply_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}](${d.apply_url})` : ''],
    ['原页面', `[GitHub](${REPO}${repoPath})`]
  ].filter(([, v]) => v)
  return ['| 字段 | 内容 |', '| --- | --- |', ...rows.map(([k, v]) => `| ${k} | ${String(v).replace(/\|/g, '\\|')} |`)].join('\n')
}

export function exportSearch(searchRepoPath) {
  const raw = readFileSync(join(ROOT, searchRepoPath), 'utf-8')
  const { data: s, content } = matter(raw)

  // 收集搜索页里链接到的公司页（按出现顺序去重）
  const included = new Set()
  for (const [, target] of content.matchAll(/\]\(\s*([^)\s#]+\.md)/g)) {
    const repoPath = posix.normalize(posix.join(posix.dirname(searchRepoPath), target))
    if (repoPath.startsWith('companies/') && !repoPath.endsWith('README.md') && existsSync(join(ROOT, repoPath))) included.add(repoPath)
  }

  const companies = [...included].map((repoPath) => {
    const { data: d, content: body } = matter(readFileSync(join(ROOT, repoPath), 'utf-8'))
    const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? d.company
    const rest = body.replace(/^#\s+.+\n+/m, '').replace(BACKLINK, '')
    return {
      repoPath,
      name: d.company ?? h1,
      order: [Object.keys(CATEGORIES).indexOf(d.category), -(Number(d.match) || 0)],
      md: [`<a id="${anchorOf(repoPath)}"></a>`, '', `## ${h1}`, '', infoTable(d, repoPath), '', demote(rewriteLinks(rest, repoPath, included)).trim()].join('\n')
    }
  })

  // 按「分类 → 匹配度从高到低」排列公司小节
  companies.sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1])

  const summaryBody = content.replace(/^#\s+.+\n+/m, '').replace(BACKLINK, '')
  const title = `📦 实习搜索报告｜${fmtDate(s.date)}｜${s.topic ?? ''}`
  const out = [
    `# ${title}`,
    '',
    `> 本文件由 \`npm run export\` 自动生成：把[本次搜索汇总](${REPO}${searchRepoPath})和其中提到的 **${companies.length}** 家公司详情页合并成一份，可以单独阅读、转发或打印。`,
    '> 文中「查看 →」会跳到本文件下方对应的公司小节；其他链接指向 GitHub 上的原页面。',
    '',
    '## 目录',
    '',
    '- [搜索汇总](#summary)',
    ...companies.map((c) => `- [${c.name}](#${anchorOf(c.repoPath)})`),
    '',
    '---',
    '',
    '<a id="summary"></a>',
    '',
    '## 搜索汇总',
    '',
    demote(rewriteLinks(summaryBody, searchRepoPath, included)).trim(),
    ...companies.flatMap((c) => ['', '---', '', c.md]),
    ''
  ].join('\n')

  const outPath = join(ROOT, 'exports', posix.basename(searchRepoPath))
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, out)
  return { outPath: relative(ROOT, outPath), companies: companies.length }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2]
  const target = arg ? relative(ROOT, resolve(arg)).split('\\').join('/') : loadSearches()[0]?.path
  if (!target || !existsSync(join(ROOT, target))) {
    console.error('❌ 找不到搜索文件，用法：npm run export -- searches/<文件名>.md')
    process.exit(1)
  }
  const { outPath, companies } = exportSearch(target)
  console.log(`✅ 已导出：${outPath}（汇总 + ${companies} 家公司）`)
}
