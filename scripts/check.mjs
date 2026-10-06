#!/usr/bin/env node
/**
 * 仓库自检（本地和 CI 都跑）：
 *   1. 公司页 front matter 字段是否完整、取值是否合法
 *   2. 所有 Markdown 里的相对链接是否指向真实存在的文件
 *   3. 自动生成的索引是否最新（否则提示运行 npm run index）
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { ROOT, CATEGORIES, STATUS, loadCompanies, loadSearches, run } from './build-index.mjs'

const errors = []
const isDay = (v) => v instanceof Date || /^\d{4}-\d{2}-\d{2}$/.test(String(v))

// 1. front matter 校验
const REQUIRED = ['title', 'company', 'category', 'program', 'status', 'directions', 'locations', 'apply_url', 'match', 'verified']
for (const { path, data: d } of loadCompanies()) {
  for (const k of REQUIRED) if (d[k] == null || d[k] === '') errors.push(`${path}: 缺少字段 ${k}`)
  const cat = path.split('/')[1]
  if (d.category !== cat) errors.push(`${path}: category=${d.category} 与所在目录 ${cat} 不一致`)
  if (!(d.status in STATUS)) errors.push(`${path}: status 必须是 ${Object.keys(STATUS).join('/')}`)
  if (!(Number.isInteger(d.match) && d.match >= 1 && d.match <= 5)) errors.push(`${path}: match 必须是 1-5 的整数`)
  if (d.verified && !isDay(d.verified)) errors.push(`${path}: verified 必须是 YYYY-MM-DD`)
  if (d.apply_url && !/^https?:\/\//.test(d.apply_url)) errors.push(`${path}: apply_url 必须是完整网址`)
  for (const k of ['directions', 'locations']) if (d[k] && !Array.isArray(d[k])) errors.push(`${path}: ${k} 必须是列表`)
}
for (const { path, data: d } of loadSearches()) {
  for (const k of ['date', 'topic', 'count']) if (d[k] == null) errors.push(`${path}: 缺少字段 ${k}`)
}
if (!Object.keys(CATEGORIES).length) errors.push('CATEGORIES 为空')

// 2. 相对链接校验
const SKIP = new Set(['node_modules', '.git', 'templates', '.vitepress'])
function* walk(dir) {
  for (const f of readdirSync(dir)) {
    if (SKIP.has(f)) continue
    const p = join(dir, f)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (f.endsWith('.md')) yield p
  }
}
const LINK = /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g
for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf-8').replace(/```[\s\S]*?```/g, '')
  for (const [, target] of text.matchAll(LINK)) {
    if (/^(https?:|mailto:|#|\/)/.test(target)) continue
    const path = decodeURI(target.split('#')[0].split('?')[0])
    if (path && !existsSync(join(dirname(file), path))) errors.push(`${relative(ROOT, file)}: 断链 → ${target}`)
  }
}

// 3. 索引是否最新
const stale = run({ write: false })
if (stale.length) errors.push(`索引不是最新的：${stale.join(', ')}（请运行 npm run index）`)

if (errors.length) {
  console.error(`❌ 发现 ${errors.length} 个问题：\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log('✅ 检查通过：front matter、相对链接、索引均正常')
