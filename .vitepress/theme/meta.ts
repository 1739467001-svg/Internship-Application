/** 状态与分类的统一显示配置（与 CLAUDE.md 中的图例保持一致） */
export const STATUS = {
  open: { icon: '🟢', text: '开放中' },
  upcoming: { icon: '🟡', text: '即将开放' },
  rolling: { icon: '🔵', text: '滚动招聘' },
  closed: { icon: '🔴', text: '已截止' }
} as const

export const CATEGORY = {
  'ai-tech': { icon: '🤖', text: 'AI / 科技大厂' },
  soe: { icon: '⚡', text: '传统行业央国企' },
  foreign: { icon: '🌍', text: '外企 / 跨国企业' }
} as const

export const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n))
