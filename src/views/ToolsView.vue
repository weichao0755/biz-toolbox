<template>
  <div class="page">
    <h1 class="page-title">工具箱</h1>
    <p class="page-sub">业务效率工具合集，按业务分类组织。输入数据即出结果，新工具会持续加入。</p>

    <section v-for="cat in grouped" :key="cat.key" class="cat">
      <div class="cat-head">
        <span class="cat-dot" :style="{ background: cat.color }"></span>
        <h2 class="cat-title">{{ cat.label }}</h2>
        <span class="cat-desc">{{ cat.desc }}</span>
        <span class="cat-count">{{ cat.tools.length }} 个工具</span>
      </div>
      <div class="tool-list">
        <a v-for="t in cat.tools" :key="t.path" :href="t.url" target="_blank" rel="noopener" class="tool-card card">
          <div class="tool-icon" :style="{ background: t.color, color: '#fff' }" v-html="t.iconSvg"></div>
          <div class="tool-info">
            <h3>{{ t.title }}</h3>
            <p>{{ t.desc }}</p>
          </div>
          <span class="go">↗</span>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { TOOLS, CATEGORIES } from '../data/tools'

const grouped = CATEGORIES
  .map(c => ({ ...c, tools: TOOLS.filter(t => t.category === c.key) }))
  .filter(c => c.tools.length > 0)
</script>

<style scoped>
.cat { margin-bottom: 26px; }
.cat-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 12px; padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.cat-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; box-shadow: 0 0 10px -1px currentColor; }
.cat-title { font-size: 16px; font-weight: 700; color: var(--text); margin: 0; letter-spacing: .5px; }
.cat-desc { font-size: 12.5px; color: var(--text-2); flex: 1; }
.cat-count { font-size: 12px; color: var(--muted); background: var(--surface-2); padding: 2px 9px; border-radius: 20px; flex-shrink: 0; }

.tool-list { display: flex; flex-direction: column; gap: 14px; max-width: 760px; }
.tool-card {
  display: flex; align-items: center; gap: 16px; color: var(--text); text-decoration: none;
  transition: transform .15s, box-shadow .15s, border-color .15s;
}
.tool-card:hover {
  border-color: var(--accent-2); text-decoration: none;
  transform: translateY(-2px); box-shadow: var(--shadow);
}
.tool-card h3, .tool-card p { margin: 0; }
.tool-card .go { color: var(--accent-2); font-size: 20px; flex-shrink: 0; transition: transform .15s; }
.tool-card:hover .go { transform: translate(3px, -3px); }
.tool-icon {
  width: 46px; height: 46px; border-radius: 12px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 16px -6px rgba(42,33,24,.2);
}
.tool-icon :deep(svg) { width: 20px; height: 20px; display: block; transform: scale(.72); }
.tool-info { flex: 1; }
.tool-info h3 { font-size: 15px; margin-bottom: 3px; }
.tool-info p { color: var(--text-2); font-size: 13px; }
.go { color: var(--accent-2); font-size: 20px; }
</style>
