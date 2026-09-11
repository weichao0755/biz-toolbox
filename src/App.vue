<template>
  <!-- 密码锁：锁定整个平台门户（首页/知识库/工具箱）；工具独立页不受影响 -->
  <div v-if="locked" class="lock-screen">
    <div class="lock-card">
      <div class="lock-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2"/>
          <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
        </svg>
      </div>
      <h1 class="lock-title">金米启航业务辅助平台</h1>
      <p class="lock-sub">平台门户已加密，请输入访问密码</p>
      <input
        type="password"
        class="lock-input"
        v-model="pwd"
        placeholder="请输入密码"
        autofocus
        @keyup.enter="unlock"
      >
      <button class="lock-btn" @click="unlock">进入平台</button>
      <div v-if="err" class="lock-err">密码错误，请重试</div>
      <div class="lock-hint">工具页面可直接访问，无需密码</div>
    </div>
  </div>

  <div v-else class="layout">
    <aside class="side">
      <div class="brand">
        <div class="brand-logo" aria-label="强袭军">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2L3 6v8c0 4 4 7 9 8 5-1 9-4 9-8V6l-9-4z" fill-opacity="0.18"/>
            <path d="M14.5 5.5L7.5 13.5h4l-1 5L17 10.5h-4.5L14.5 5.5z"/>
            <circle cx="20" cy="4.5" r="0.8" fill-opacity="0.7"/>
            <circle cx="4" cy="19" r="0.6" fill-opacity="0.5"/>
          </svg>
        </div>
        <div>
          <div class="brand-name">金米启航强袭军<br>业务辅助平台</div>
          <div class="brand-sub">知识沉淀 · 工具赋能</div>
        </div>
      </div>
      <nav class="nav">
        <RouterLink to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <span class="nav-dot" style="background:#e0901a"></span>首页
        </RouterLink>
        <RouterLink to="/knowledge" class="nav-item" :class="{ active: $route.path.startsWith('/knowledge') }">
          <span class="nav-dot" style="background:#c2740a"></span>知识库
        </RouterLink>
        <RouterLink to="/tools" class="nav-item" :class="{ active: $route.path === '/tools' }">
          <span class="nav-dot" style="background:#b45309"></span>工具箱
        </RouterLink>
      </nav>
      <div class="side-foot">
        <span class="foot-hint">v1.9.0 · 金米启航强袭军业务辅助平台</span>
      </div>
    </aside>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BACKUP_KEYS } from './data/backupKeys'
import { initVault } from './utils/localVault'

// 平台门户访问密码（仅锁首页/知识库/工具箱等门户页，工具独立 HTML 不受影响）
const LOCK_PWD = '940214'
const LOCK_KEY = 'biz_toolbox_unlocked'
const locked = ref(true)
const pwd = ref('')
const err = ref(false)

onMounted(() => {
  // 会话级解锁：本次浏览器标签页内刷新不再重复要求密码，关闭后重新打开需再次输入
  locked.value = sessionStorage.getItem(LOCK_KEY) !== '1'
  // 本地文件夹同步：解锁前也启动，确保换电脑后一进门就自动恢复数据
  initVault(BACKUP_KEYS).catch(() => {})
})

function unlock() {
  if (pwd.value === LOCK_PWD) {
    sessionStorage.setItem(LOCK_KEY, '1')
    locked.value = false
    err.value = false
    pwd.value = ''
  } else {
    err.value = true
    pwd.value = ''
  }
}
</script>

<style scoped>
.layout { display: flex; height: 100%; }
.side {
  width: 236px; flex-shrink: 0;
  background: var(--side-bg);
  border-right: 1px solid var(--side-line);
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.side::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(180,120,40,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(180,120,40,.05) 1px, transparent 1px);
  background-size: 26px 26px; pointer-events: none;
}
.side::after {
  content: ''; position: absolute; top: -40%; right: -30%; width: 60%; height: 80%;
  background: radial-gradient(circle, rgba(224,144,26,.16), transparent 70%); pointer-events: none;
}
.brand { display: flex; align-items: center; gap: 12px; padding: 20px 18px; border-bottom: 1px solid var(--side-line); position: relative; z-index: 1; }
.brand-logo {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.18), 0 8px 18px -4px rgba(224,144,26,.5);
  position: relative;
}
.brand-logo svg { width: 22px; height: 22px; display: block; filter: drop-shadow(0 0 4px rgba(224,144,26,.5)); }
.brand-name { font-size: 14px; font-weight: 600; line-height: 1.35; color: #2a2118; letter-spacing: .3px; }
.brand-sub { font-size: 11px; color: var(--side-dim); letter-spacing: 1px; }
.nav { flex: 1; padding: 14px 12px; overflow-y: auto; position: relative; z-index: 1; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; margin-bottom: 3px; border-radius: 10px;
  color: var(--side-text); font-size: 14px; text-decoration: none;
  transition: background .15s, color .15s, box-shadow .15s;
}
.nav-item:hover { background: rgba(255,255,255,.06); color: #fff; text-decoration: none; }
.nav-item.active {
  background: linear-gradient(90deg, rgba(224,144,26,.16), rgba(224,144,26,.02));
  color: #2a2118; font-weight: 600;
  box-shadow: inset 3px 0 0 #e0901a, 0 0 14px -3px rgba(224,144,26,.35);
}
.nav-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 8px -1px currentColor; }
.side-foot {
  padding: 14px 18px; border-top: 1px solid var(--side-line);
  display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1;
}
.foot-hint { font-size: 11px; color: var(--side-dim); letter-spacing: .3px; }
.main { flex: 1; overflow-y: auto; max-width: 1180px; width: 100%; margin: 0 auto; padding: 0 24px; }

/* 密码锁屏 */
.lock-screen {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(circle at 20% 10%, rgba(224,144,26,.10), transparent 45%),
    radial-gradient(circle at 80% 90%, rgba(180,83,9,.10), transparent 45%),
    #faf7f2;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}
.lock-card {
  width: 100%; max-width: 380px;
  background: #fffefb;
  border: 1px solid #ece3d6;
  border-radius: 18px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 24px 60px -20px rgba(180,120,40,.25);
}
.lock-logo {
  width: 56px; height: 56px; margin: 0 auto 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 24px -6px rgba(180,83,9,.45);
}
.lock-logo svg { width: 28px; height: 28px; }
.lock-title { margin: 0 0 6px; font-size: 19px; color: #2a2118; letter-spacing: 1px; }
.lock-sub { margin: 0 0 22px; font-size: 13px; color: #6b5d4a; }
.lock-input {
  width: 100%; padding: 12px 14px;
  border: 1px solid #d4c4a8; border-radius: 10px;
  font-size: 15px; text-align: center; letter-spacing: 3px;
  outline: none; background: #fff;
  color: #2a2118; font-family: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.lock-input:focus { border-color: #e0901a; box-shadow: 0 0 0 3px rgba(224,144,26,.15); }
.lock-btn {
  width: 100%; margin-top: 14px; padding: 12px;
  border: none; border-radius: 10px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: transform .15s, box-shadow .15s;
}
.lock-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px -6px rgba(180,83,9,.5); }
.lock-err { margin-top: 12px; font-size: 13px; color: #dc2626; font-weight: 600; }
.lock-hint { margin-top: 18px; font-size: 11.5px; color: #9ca3af; }
</style>
