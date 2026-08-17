<template>
  <div class="page">
    <h1 class="page-title">工具箱</h1>
    <p class="page-sub">业务效率工具合集，输入数据即出结果。新工具会持续加入。</p>
    <div class="tool-list">
      <RouterLink v-for="t in TOOLS" :key="t.path" :to="t.path" class="tool-card card">
        <div class="tool-icon" :style="{ background: t.color }">具</div>
        <div class="tool-info">
          <h3>{{ t.title }}</h3>
          <p>{{ t.desc }}</p>
        </div>
        <span class="go">→</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { TOOLS } from '../data/tools'
</script>

<style scoped>
.tool-list { display: flex; flex-direction: column; gap: 14px; max-width: 720px; }
.tool-card { display: flex; align-items: center; gap: 16px; }
.tool-card:hover { border-color: var(--accent-2); text-decoration: none; }
.tool-icon {
  width: 48px; height: 48px; border-radius: 12px; color: #fff;
  font-size: 20px; font-weight: 600; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.tool-info { flex: 1; }
.tool-info h3 { font-size: 15px; margin-bottom: 3px; }
.tool-info p { color: var(--text-2); font-size: 13px; }
.go { color: var(--accent-2); font-size: 20px; }
</style>
