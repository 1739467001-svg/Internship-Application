import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import type { DefaultTheme } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const root = resolve(__dirname, '..')
const base = process.env.SITE_BASE ?? '/Internship-Application/'
const repo = 'https://github.com/1739467001-svg/Internship-Application'

const CATEGORIES = [
  { dir: 'ai-tech', text: '🤖 AI / 科技大厂' },
  { dir: 'soe', text: '⚡ 传统行业央国企' },
  { dir: 'foreign', text: '🌍 外企 / 跨国企业' }
]

/** 读取某个目录下的 Markdown，按 front matter 生成侧边栏条目 */
function mdItems(dir: string, sort: (a: any, b: any) => number) {
  const abs = join(root, dir)
  if (!existsSync(abs)) return []
  return readdirSync(abs)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => {
      const { data, content } = matter(readFileSync(join(abs, f), 'utf-8'))
      const h1 = content.match(/^#\s+(.+)$/m)?.[1]
      return { file: f, data, text: data.company ?? data.title ?? h1 ?? f }
    })
    .sort(sort)
    .map((x) => ({ text: x.text, link: `/${dir}/${x.file.replace(/\.md$/, '')}` }))
}

function sidebar(): DefaultTheme.Sidebar {
  const byMatch = (a: any, b: any) => (b.data.match ?? 0) - (a.data.match ?? 0)
  const byNewest = (a: any, b: any) => b.file.localeCompare(a.file)
  return [
    {
      text: '🧭 开始',
      items: [
        { text: '首页', link: '/' },
        { text: '实习看板', link: '/board' },
        { text: '关于我', link: '/profile/about-me' },
        { text: '简历', link: '/profile/resume' },
        { text: '作品集', link: '/profile/portfolio' },
        { text: '我的 Slogan', link: '/profile/slogan' }
      ]
    },
    {
      text: '🔎 搜索记录',
      collapsed: false,
      items: [{ text: '全部记录', link: '/searches/' }, ...mdItems('searches', byNewest)]
    },
    ...CATEGORIES.map((c) => ({
      text: c.text,
      collapsed: false,
      items: mdItems(`companies/${c.dir}`, byMatch)
    })),
    {
      text: '🗓️ 行动',
      items: [
        { text: '招聘日历', link: '/guides/recruitment-calendar' },
        { text: '已过期待投递', link: '/guides/expired-watchlist' },
        { text: '投递追踪表', link: '/guides/application-tracker' },
        { text: '系统说明', link: '/guides/how-it-works' }
      ]
    }
  ]
}

export default withMermaid({
  lang: 'zh-CN',
  title: 'AI × 行业 实习雷达',
  description: '人工智能专业学生的实习搜索与投递系统：AI 大厂、传统行业央国企、外企',
  base,
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['node_modules/**', 'templates/**', 'public/**', 'exports/**', 'CLAUDE.md', '.claude/**', '.github/**'],
  // GitHub 上用 README.md 作为目录首页，网站上把它映射成 index
  rewrites: {
    'README.md': 'index.md',
    ':dir/README.md': ':dir/index.md'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#2f7d6d' }]
  ],
  // 首页的 Hero 只在网站上出现，不污染 GitHub 上的 README
  transformPageData(pageData) {
    // YAML 会把 2026-10-06 解析成 Date，统一转回 YYYY-MM-DD 字符串
    for (const [k, v] of Object.entries(pageData.frontmatter)) {
      if (v instanceof Date) pageData.frontmatter[k] = v.toISOString().slice(0, 10)
    }
    if (pageData.relativePath === 'index.md' || pageData.filePath === 'README.md') {
      pageData.frontmatter.layout = 'home'
      pageData.frontmatter.hero = {
        name: 'AI × 行业 实习雷达',
        text: '未来不是 AI+，就是 +AI',
        tagline: '用 AI 实时搜索大厂、央国企、外企实习，沉淀为可点击浏览的 Markdown 知识库',
        actions: [
          { theme: 'brand', text: '打开实习看板', link: '/board' },
          { theme: 'alt', text: '最新搜索', link: '/searches/' },
          { theme: 'alt', text: '关于我', link: '/profile/about-me' }
        ]
      }
      pageData.frontmatter.features = [
        { icon: '🤖', title: 'AI / 科技大厂', details: '阿里云、腾讯、字节、华为等的行业赋能线与 AI 应用岗', link: '/board?cat=ai-tech' },
        { icon: '⚡', title: '传统行业央国企', details: '国家电网、南方电网、中国烟草、水利水电（四川）', link: '/board?cat=soe' },
        { icon: '🌍', title: '外企 / 跨国企业', details: '西门子、施耐德、ABB、博世等 AI × 工业岗位，英语友好', link: '/board?cat=foreign' }
      ]
    }
  },
  markdown: {
    lineNumbers: false
  },
  // mermaid 体积较大，属于预期，放宽打包体积告警阈值
  vite: { build: { chunkSizeWarningLimit: 4000 } },
  themeConfig: {
    nav: [
      { text: '实习看板', link: '/board' },
      { text: '搜索记录', link: '/searches/' },
      { text: '公司库', link: '/companies/' },
      { text: '招聘日历', link: '/guides/recruitment-calendar' },
      { text: '关于我', link: '/profile/about-me' }
    ],
    sidebar: sidebar(),
    outline: { level: [2, 3], label: '本页目录' },
    socialLinks: [{ icon: 'github', link: repo }],
    editLink: { pattern: `${repo}/edit/${process.env.GITHUB_REF_NAME ?? 'main'}/:path`, text: '在 GitHub 上编辑此页' },
    lastUpdated: { text: '最后更新' },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    footer: {
      message: '人人都是开发者 · 用大白话把想法讲给 AI 听',
      copyright: '招聘信息以官方渠道为准'
    },
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            // 中文分词：汉字按「二元组」切分（国家电网 → 国家/家电/电网），英文按单词切分。
            // 文档和查询用同一套规则，配合 AND 组合即可做到近似「子串搜索」。
            // 注意：此函数会被序列化到浏览器端，必须自包含、不能引用外部变量。
            tokenize: (text: string) => {
              const out: string[] = []
              const re = /[\u3400-\u9fff\uf900-\ufaff]+|[a-z0-9]+(?:[.+#-][a-z0-9]+)*/gi
              for (const m of text.toLowerCase().matchAll(re)) {
                const w = m[0]
                if (/^[\u3400-\u9fff\uf900-\ufaff]/.test(w)) {
                  if (w.length === 1) out.push(w)
                  else for (let i = 0; i < w.length - 1; i++) out.push(w.slice(i, i + 2))
                } else out.push(w)
              }
              return out
            }
          },
          searchOptions: { fuzzy: 0.1, prefix: true, combineWith: 'AND' }
        },
        translations: {
          button: { buttonText: '搜索公司、岗位、城市', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    }
  },
  mermaid: {}
})
