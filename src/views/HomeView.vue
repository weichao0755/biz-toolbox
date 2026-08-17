<template>
  <div class="page">
    <div class="hero card">
      <h1 class="page-title">欢迎使用业务工具箱</h1>
      <p class="page-sub">公司转让业务的知识沉淀与效率工具平台，新人快速上手，老手持续沉淀。</p>
      <div class="hero-actions">
        <RouterLink to="/knowledge"><button>进入知识库</button></RouterLink>
        <RouterLink to="/tools"><button class="secondary">打开工具箱</button></RouterLink>
      </div>
    </div>

    <div class="grid">
      <RouterLink to="/knowledge" class="entry card">
        <div class="entry-icon" style="background:#1d9e75">知</div>
        <div>
          <h3>知识库</h3>
          <p>新手入门、业务知识、案例库、话术工具、专家经验，五大模块持续沉淀。</p>
        </div>
      </RouterLink>
      <RouterLink to="/tools" class="entry card">
        <div class="entry-icon" style="background:#ba7517">具</div>
        <div>
          <h3>工具箱</h3>
          <p>高新申请方案生成器等业务工具，输入数据即出结果，持续新增。</p>
        </div>
      </RouterLink>
    </div>

    <div class="card update-note">
      <h3>内容更新说明</h3>
      <p>平台为静态站点部署，更新流程：内容/工具更新 → 重新部署 → 全员刷新即可看到最新版本。需要更新内容时，联系管理员即可。</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.hero { margin-bottom: 20px; }
.hero-actions { display: flex; gap: 12px; margin-top: 8px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.entry { display: flex; gap: 14px; align-items: flex-start; }
.entry:hover { border-color: var(--accent-2); text-decoration: none; }
.entry-icon {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  color: #fff; font-size: 20px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.entry h3 { font-size: 15px; margin-bottom: 4px; }
.entry p { color: var(--text-2); font-size: 13px; }
.update-note h3 { font-size: 14px; margin-bottom: 6px; }
.update-note p { color: var(--text-2); font-size: 13px; }
@media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style>
