import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import CompanyCard from './components/CompanyCard.vue'
import InternshipBoard from './components/InternshipBoard.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  // 公司详情页顶部自动渲染信息卡（数据来自 front matter）
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(CompanyCard) }),
  enhanceApp({ app }) {
    app.component('InternshipBoard', InternshipBoard)
  }
} satisfies Theme
