<template>
  <div class="open-tab-page">
    <div class="open-tab-card">
      <div class="icon">🔗</div>
      <h2>{{ tool.title }}</h2>
      <p class="desc">正在新窗口打开工具…</p>
      <p v-if="!opened" class="tip">如果浏览器拦截了自动打开，请点击下方按钮手动打开：</p>
      <a v-if="!opened" :href="tool.url" target="_blank" rel="noopener" class="btn">
        在新窗口打开「{{ tool.title }}」
      </a>
      <RouterLink to="/tools" class="back">← 返回工具箱</RouterLink>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OpenNewTabView',
  props: {
    tool: { type: Object, required: true }
  },
  data() {
    return { opened: false }
  },
  mounted() {
    // 路由进入时自动尝试新窗口打开（用户点击链接属于用户手势，多数浏览器放行）
    const win = window.open(this.tool.url, '_blank')
    if (win) this.opened = true
  }
}
</script>

<style scoped>
.open-tab-page {
  max-width: 560px;
  margin: 80px auto 0;
  padding: 0 16px;
}
.open-tab-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 40px 32px;
  text-align: center;
}
.icon { font-size: 40px; margin-bottom: 12px; }
h2 { margin: 0 0 8px; font-size: 20px; color: var(--text); }
.desc { margin: 0 0 6px; color: var(--muted); font-size: 14px; }
.tip { margin: 8px 0 16px; color: var(--muted); font-size: 13px; }
.btn {
  display: inline-block;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 22px;
  border-radius: 8px;
  text-decoration: none;
  margin-bottom: 18px;
}
.btn:hover { opacity: .9; color: #fff; }
.back {
  display: block;
  color: var(--muted);
  font-size: 13px;
  text-decoration: none;
}
.back:hover { color: var(--accent); }
</style>
