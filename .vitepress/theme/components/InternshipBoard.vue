<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as companies } from '../companies.data'
import { CATEGORY, STATUS, stars } from '../meta'

type Cat = keyof typeof CATEGORY
type St = keyof typeof STATUS

const cat = ref<Cat | 'all'>('all')
const status = ref<St | 'all'>('all')
const minMatch = ref(0)
const q = ref('')
const sortBy = ref<'match' | 'deadline'>('match')

onMounted(() => {
  const c = new URLSearchParams(location.search).get('cat')
  if (c && c in CATEGORY) cat.value = c as Cat
})

const counts = computed(() => {
  const r: Record<string, number> = { all: companies.length }
  for (const c of companies) r[c.category] = (r[c.category] ?? 0) + 1
  return r
})

const list = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return companies
    .filter((c) => cat.value === 'all' || c.category === cat.value)
    .filter((c) => status.value === 'all' || c.status === status.value)
    .filter((c) => c.match >= minMatch.value)
    .filter(
      (c) =>
        !kw ||
        [c.company, c.company_en, c.program, ...c.directions, ...c.locations]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(kw))
    )
    .sort((a, b) =>
      sortBy.value === 'deadline'
        ? (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')
        : b.match - a.match
    )
})
</script>

<template>
  <div class="board">
    <div class="filters">
      <div class="row">
        <button :class="{ on: cat === 'all' }" @click="cat = 'all'">全部 {{ counts.all }}</button>
        <button
          v-for="(m, k) in CATEGORY"
          :key="k"
          :class="{ on: cat === k }"
          @click="cat = k as Cat"
        >
          {{ m.icon }} {{ m.text }} {{ counts[k] ?? 0 }}
        </button>
      </div>
      <div class="row">
        <button :class="{ on: status === 'all' }" @click="status = 'all'">任意状态</button>
        <button
          v-for="(m, k) in STATUS"
          :key="k"
          :class="{ on: status === k }"
          @click="status = k as St"
        >
          {{ m.icon }} {{ m.text }}
        </button>
      </div>
      <div class="row">
        <input v-model="q" class="kw" placeholder="筛选：公司 / 方向 / 城市，如「四川」「电力」「Agent」" />
        <select v-model.number="minMatch" aria-label="最低匹配度">
          <option :value="0">匹配度不限</option>
          <option :value="3">★★★ 以上</option>
          <option :value="4">★★★★ 以上</option>
          <option :value="5">仅 ★★★★★</option>
        </select>
        <select v-model="sortBy" aria-label="排序">
          <option value="match">按匹配度</option>
          <option value="deadline">按截止日期</option>
        </select>
      </div>
    </div>

    <p class="summary">共 {{ list.length }} 条结果</p>

    <div class="grid">
      <a v-for="c in list" :key="c.url" class="card" :href="withBase(c.url)">
        <div class="top">
          <span class="cat">{{ CATEGORY[c.category]?.icon }} {{ CATEGORY[c.category]?.text }}</span>
          <span class="st" :data-st="c.status">{{ STATUS[c.status]?.icon }} {{ STATUS[c.status]?.text }}</span>
        </div>
        <h3>{{ c.company }}</h3>
        <p class="en" v-if="c.company_en">{{ c.company_en }}</p>
        <p class="prog">{{ c.program }}</p>
        <div class="tags">
          <span v-for="d in c.directions.slice(0, 4)" :key="d" class="tag">{{ d }}</span>
        </div>
        <div class="meta">
          <span class="stars" :title="`匹配度 ${c.match}/5`">{{ stars(c.match) }}</span>
          <span v-if="c.locations.length">📍 {{ c.locations.slice(0, 3).join(' · ') }}</span>
        </div>
        <div class="meta small">
          <span v-if="c.deadline">⏰ {{ c.deadline }}</span>
          <span>核实于 {{ c.verified }}</span>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.board { margin-top: 16px; }
.filters { display: flex; flex-direction: column; gap: 10px; }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
button, select, .kw {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  line-height: 22px;
}
select, .kw { border-radius: 8px; }
.kw { flex: 1 1 260px; min-width: 0; }
button.on { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); font-weight: 600; }
.summary { color: var(--vp-c-text-2); font-size: 13px; margin: 14px 0 6px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
.card {
  display: flex; flex-direction: column; gap: 6px;
  border: 1px solid var(--vp-c-divider); border-radius: 12px; padding: 14px 16px;
  background: var(--vp-c-bg-soft); color: inherit; text-decoration: none !important;
  transition: border-color .2s, transform .2s;
}
.card:hover { border-color: var(--vp-c-brand-1); transform: translateY(-2px); }
.top { display: flex; justify-content: space-between; font-size: 12px; color: var(--vp-c-text-2); gap: 6px; }
.card h3 { margin: 4px 0 0; padding: 0; border: 0; font-size: 18px; }
.en { margin: 0; font-size: 12px; color: var(--vp-c-text-3); line-height: 1.4; }
.prog { margin: 0; font-size: 13px; line-height: 1.5; color: var(--vp-c-text-1); }
.tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag { font-size: 11px; padding: 0 8px; border-radius: 999px; background: var(--vp-c-default-soft); color: var(--vp-c-text-2); line-height: 20px; }
.meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--vp-c-text-2); margin-top: auto; }
.meta.small { margin-top: 0; color: var(--vp-c-text-3); }
.stars { color: #e3a008; letter-spacing: 1px; }
</style>
