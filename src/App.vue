<template>
  <div class="layout">
    <aside class="side">
      <div class="brand">
        <div class="brand-logo">箱</div>
        <div>
          <div class="brand-name">业务工具箱</div>
          <div class="brand-sub">知识沉淀 · 工具赋能</div>
        </div>
      </div>
      <nav class="nav">
        <RouterLink to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <span class="nav-dot" style="background:#378add"></span>首页
        </RouterLink>
        <RouterLink to="/knowledge" class="nav-item" :class="{ active: $route.path.startsWith('/knowledge') }">
          <span class="nav-dot" style="background:#1d9e75"></span>知识库
        </RouterLink>
        <RouterLink to="/tools" class="nav-item" :class="{ active: $route.path === '/tools' }">
          <span class="nav-dot" style="background:#ba7517"></span>工具箱
        </RouterLink>
        <div class="nav-divider"></div>
        <div class="nav-caption">工具列表</div>
        <RouterLink v-for="t in tools" :key="t.path" :to="t.path"
          class="nav-item tool" :class="{ active: $route.path === t.path }">
          <span class="nav-dot" :style="{ background: t.color || '#888780' }"></span>{{ t.title }}
        </RouterLink>
      </nav>
      <div class="side-foot">
        <span class="foot-hint">v1.0 · 业务工具箱</span>
      </div>
    </aside>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { TOOLS } from './data/tools'

const tools = TOOLS
</script>

<style scoped>
.layout { display: flex; height: 100%; }
.side {
  width: 224px; flex-shrink: 0; background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
}
.brand { display: flex; align-items: center; gap: 10px; padding: 18px 16px; border-bottom: 1px solid var(--border); }
.brand-logo {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--accent); color: #fff; font-size: 18px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.brand-name { font-size: 15px; font-weight: 600; }
.brand-sub { font-size: 11px; color: var(--text-2); }
.nav { flex: 1; padding: 12px 10px; overflow-y: auto; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; margin-bottom: 2px; border-radius: 8px;
  color: var(--text); font-size: 14px;
}
.nav-item:hover { background: #f2f4f7; text-decoration: none; }
.nav-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 500; }
.nav-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.nav-divider { height: 1px; background: var(--border); margin: 10px 4px; }
.nav-caption { font-size: 12px; color: var(--text-2); padding: 0 12px 6px; }
.nav-item.tool { font-size: 13px; }
.side-foot {
  padding: 12px 16px; border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.foot-hint { font-size: 12px; color: var(--text-2); }
.main { flex: 1; overflow-y: auto; }
</style>
