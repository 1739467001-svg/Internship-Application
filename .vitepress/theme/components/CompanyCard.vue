<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { CATEGORY, STATUS, stars } from '../meta'

const { frontmatter: f } = useData()
const show = computed(() => !!f.value.company && !!f.value.category)
const join = (v: unknown) => (Array.isArray(v) ? v.join(' · ') : v ? String(v) : '')
</script>

<template>
  <div v-if="show" class="company-card">
    <div class="head">
      <span>{{ CATEGORY[f.category as keyof typeof CATEGORY]?.icon }} {{ CATEGORY[f.category as keyof typeof CATEGORY]?.text }}</span>
      <span>{{ STATUS[f.status as keyof typeof STATUS]?.icon }} {{ STATUS[f.status as keyof typeof STATUS]?.text }}</span>
    </div>
    <dl>
      <dt>项目</dt><dd>{{ f.program }}</dd>
      <dt>方向</dt><dd>{{ join(f.directions) }}</dd>
      <dt>地点</dt><dd>{{ join(f.locations) }}</dd>
      <template v-if="f.overseas"><dt>留学生</dt><dd>{{ f.overseas }}</dd></template>
      <template v-if="f.deadline"><dt>关键日期</dt><dd>{{ f.deadline }}</dd></template>
      <dt>匹配度</dt><dd class="stars">{{ stars(Number(f.match ?? 0)) }}</dd>
      <dt>最后核实</dt><dd>{{ f.verified }}</dd>
    </dl>
    <a v-if="f.apply_url" class="apply" :href="f.apply_url" target="_blank" rel="noopener">官方投递入口 ↗</a>
  </div>
</template>

<style scoped>
.company-card {
  border: 1px solid var(--vp-c-divider); border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; background: var(--vp-c-bg-soft);
}
.head { display: flex; justify-content: space-between; font-size: 13px; color: var(--vp-c-text-2); margin-bottom: 8px; }
dl { display: grid; grid-template-columns: 72px 1fr; gap: 4px 12px; margin: 0; font-size: 14px; }
dt { color: var(--vp-c-text-2); }
dd { margin: 0; }
.stars { color: #e3a008; letter-spacing: 1px; }
.apply {
  display: inline-block; margin-top: 12px; padding: 4px 14px; border-radius: 999px;
  background: var(--vp-c-brand-1); color: var(--vp-c-white) !important; font-size: 14px; font-weight: 600;
  text-decoration: none !important;
}
.apply:hover { background: var(--vp-c-brand-2); }
</style>
