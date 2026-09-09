<template>
  <div class="kb">
    <div class="kb-head">
      <h2 class="kb-title">知识库</h2>
      <p class="kb-sub">内容维护在钉钉文档中，点击下方入口直接查看（需钉钉账号登录）</p>
    </div>

    <div class="kb-grid">
      <a v-for="kb in links" :key="kb.name"
        class="kb-card" :href="kb.url" target="_blank" rel="noopener">
        <div class="kb-icon" :style="{ background: kb.color + '1a', color: kb.color }" v-html="kb.iconSvg"></div>
        <div class="kb-info">
          <div class="kb-name">{{ kb.name }}</div>
          <div class="kb-desc">{{ kb.desc }}</div>
          <div class="kb-hint">↗ {{ kb.hint }}</div>
        </div>
        <div class="kb-arrow" :style="{ color: kb.color }">›</div>
      </a>
    </div>

    <div class="kb-foot">
      <p>💡 打开钉钉文档后，使用钉钉账号登录即可查看对应知识库内容。</p>
      <p>权限由钉钉管理——有权限的成员能看，无权限成员会提示无访问权限。</p>
    </div>
  </div>
</template>

<script setup>
import { KB_LINKS } from '../data/kbLinks'

const links = KB_LINKS
</script>

<style scoped>
.kb { padding: 32px 40px; max-width: 980px; }
.kb-head { margin-bottom: 28px; }
.kb-title { font-size: 22px; font-weight: 600; margin-bottom: 6px; }
.kb-sub { color: var(--text-2); font-size: 13.5px; }

.kb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 860px) { .kb-grid { grid-template-columns: 1fr; } }

.kb-card {
  display: flex; align-items: center; gap: 16px;
  padding: 22px 20px; border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: box-shadow .18s, transform .18s;
  cursor: pointer; text-decoration: none;
}
.kb-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,.08);
  transform: translateY(-2px);
}
.kb-icon {
  width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.kb-icon :deep(svg) { width: 22px; height: 22px; display: block; transform: scale(.72); }
.kb-info { flex: 1; min-width: 0; }
.kb-name { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
.kb-desc { font-size: 12.5px; color: var(--text-2); line-height: 1.55; margin-bottom: 8px; }
.kb-hint { font-size: 12px; color: var(--text-2); }
.kb-arrow { font-size: 26px; flex-shrink: 0; opacity: .7; }

.kb-foot {
  margin-top: 34px; padding: 16px 20px; border-radius: 12px;
  background: var(--accent-bg); font-size: 13px; color: var(--text-2);
  line-height: 1.8;
}
</style>
