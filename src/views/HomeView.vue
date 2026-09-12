<template>
  <div class="page">
    <div class="hero card">
      <h1 class="page-title">欢迎使用金米启航强袭军业务辅助平台</h1>
      <p class="page-sub">公司转让业务的知识沉淀与效率工具平台，新人快速上手，老手持续沉淀。</p>
      <div class="hero-actions">
        <RouterLink to="/knowledge"><button>进入知识库</button></RouterLink>
        <RouterLink to="/tools"><button class="secondary">打开工具箱</button></RouterLink>
      </div>
    </div>

    <div class="top-row">
      <a href="tools/todo/index.html" target="_blank" rel="noopener" class="card todo-panel">
        <div class="todo-head">
          <div class="todo-title">
            <div class="todo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <line x1="8" y1="9" x2="16" y2="9"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="13" y2="17"/>
              </svg>
            </div>
            <div>
              <h3>待办事项清单</h3>
              <p>进入平台先看看今天要处理什么</p>
            </div>
          </div>
          <span class="todo-enter">进入待办 ›</span>
        </div>
        <div class="todo-stats">
          <div class="tstat"><span class="num" :class="{ warn: overdueCount > 0 }">{{ openCount }}</span><span class="lbl">待处理</span></div>
          <div class="tstat"><span class="num today">{{ todayCount }}</span><span class="lbl">今日到期</span></div>
          <div class="tstat"><span class="num overdue" :class="{ warn: overdueCount > 0 }">{{ overdueCount }}</span><span class="lbl">已逾期</span></div>
        </div>
        <div class="todo-preview" v-if="previewTodos.length">
          <div class="todo-row" v-for="t in previewTodos" :key="t.id">
            <span class="p-dot" :class="'p-' + (t.priority || 'med')"></span>
            <span class="p-title" :class="{ 'is-due': isToday(t.due) }">{{ t.title }}</span>
            <span class="p-due" v-if="t.due">{{ dueLabel(t.due) }}</span>
          </div>
          <div class="todo-more" v-if="openCount > previewTodos.length">还有 {{ openCount - previewTodos.length }} 项…</div>
        </div>
        <div class="todo-empty" v-else>暂无待办，点这里去添加一条</div>
      </a>

      <div class="grid grid-side">
        <RouterLink to="/knowledge" class="entry card">
          <div class="entry-icon" style="background:linear-gradient(135deg,#e0901a,#b45309)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <line x1="9" y1="7" x2="15" y2="7"/>
              <line x1="9" y1="11" x2="15" y2="11"/>
            </svg>
          </div>
          <div>
            <h3>知识库</h3>
            <p>新手入门、业务知识、案例库、话术工具、专家经验，五大模块持续沉淀。</p>
          </div>
        </RouterLink>
        <RouterLink to="/tools" class="entry card">
          <div class="entry-icon" style="background:linear-gradient(135deg,#f59e0b,#ea580c)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="badge">
              <circle cx="18" cy="18" r="3.2"/>
              <path d="M18 14.8V13M18 23v-1.8M21.2 18H23M14.8 18H13M20.4 15.6l1.3-1.3M15.6 20.4l-1.3 1.3M20.4 20.4l1.3 1.3M15.6 15.6l-1.3-1.3"/>
            </svg>
          </div>
          <div>
            <h3>工具箱</h3>
            <p>高新申请方案生成器等业务工具，输入数据即出结果，持续新增。</p>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- 本地文件夹同步 -->
    <div class="card data-mgmt vault-card">
      <div class="data-head">
        <div class="data-icon" style="background:linear-gradient(135deg,#e0901a,#b45309)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <path d="M8 13h8M8 16.5h5"/>
          </svg>
        </div>
        <div>
          <h3>本地文件夹同步<span class="vault-state" :class="vaultStateClass">● {{ vaultStateText }}</span></h3>
          <p v-if="vault.supported">
            指定一个本机文件夹，平台的所有设定与工具记录会<b>自动</b>存进去（不再受浏览器 5MB 上限限制）。
            换电脑或重装后，选择同一个文件夹即可<b>自动恢复</b>全部数据。
          </p>
          <p v-else class="unsupported">
            ⚠ 检测到当前浏览器<b>不支持</b>本地文件夹自动同步（仅 Chrome / Edge 等 Chromium 内核可用）。
            请改用下方「备份数据 / 恢复数据」手动导出导入，效果相同。
          </p>
        </div>
      </div>

      <div v-if="vault.supported" class="vault-body">
        <div class="vault-info">
          <div class="vault-row">
            <span class="k">存储文件夹</span>
            <span class="v">{{ vault.bound ? vault.folderName : '尚未选择' }}</span>
          </div>
          <div class="vault-row">
            <span class="k">最近同步</span>
            <span class="v">{{ vault.lastSyncAt ? formatAgo(vault.lastSyncAt) : '尚未同步' }}</span>
          </div>
        </div>

        <div class="data-actions">
          <button v-if="!vault.bound" class="primary" :disabled="working" @click="onChooseFolder">
            📁 选择存储位置
          </button>
          <template v-else>
            <button v-if="vault.needReconnect" class="primary" :disabled="working" @click="onReconnect">
              🔌 恢复连接
            </button>
            <button class="primary" :disabled="working || vault.syncing" @click="onLoadData()">
              ⬆ 加载数据
            </button>
            <button class="secondary" :disabled="working || vault.syncing" @click="onSyncNow">
              {{ vault.syncing ? '同步中…' : '⟳ 立即同步' }}
            </button>
            <button class="secondary" @click="onChooseFolder">⇄ 更换文件夹</button>
            <button class="secondary" @click="onToggleHistory">
              {{ showHistory ? '▴ 收起历史版本' : '▾ 历史版本' + (vault.backups.length ? `（${vault.backups.length}）` : '') }}
            </button>
            <button class="secondary danger-text" @click="onDisconnect">断开</button>
          </template>
        </div>

        <p v-if="vault.bound && vault.needReconnect" class="vault-tip warn-tip">
          浏览器关闭后会自动收回文件夹授权，这是安全机制。点一次「恢复连接」即可继续自动同步，不需要重新选文件夹。
        </p>

        <div v-if="showHistory && vault.bound" class="vault-history">
          <div class="vh-head">保留最近 {{ Math.min(vault.backups.length, 5) }} 份历史版本，误覆盖时可回滚</div>
          <div v-if="!vault.backups.length" class="vh-empty">暂无历史版本。数据变化超过一定量或间隔后会自动生成。</div>
          <div v-else class="vh-list">
            <div v-for="b in vault.backups" :key="b.name" class="vh-item">
              <div class="vh-meta">
                <span class="vh-time">{{ formatTs(b.at) }}</span>
                <span class="vh-size">{{ formatSize(b.size) }}</span>
              </div>
              <button class="vh-load" @click="onLoadData(b.name)">恢复此版本</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card data-mgmt">
      <div class="data-head">
        <div class="data-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            <polyline points="12 13 12 18"/>
            <polyline points="9 15.5 12 18 15 15.5"/>
          </svg>
        </div>
        <div>
          <h3>数据备份与恢复</h3>
          <p>所有工具填写的数据都存在本机浏览器中（不会上传）。建议定期「备份数据」下载保存；更新功能、更换电脑或误清缓存后，用「恢复数据」一键找回全部内容。</p>
        </div>
      </div>
      <div class="data-actions">
        <button class="primary" @click="backupData">⬇ 备份数据</button>
        <button class="secondary" @click="pickFile">⬆ 恢复数据</button>
        <input ref="fileInput" type="file" accept=".json,application/json" class="hidden-file" @change="onFileChange">
        <span v-if="dataStatus" class="data-status" :class="dataStatusType">{{ dataStatus }}</span>
      </div>
    </div>

    <div class="card update-note">
      <h3>内容更新说明</h3>
      <p>平台为静态站点部署，更新流程：内容/工具更新 → 重新部署 → 全员刷新即可看到最新版本（推荐 Ctrl+F5 强制刷新）。需要更新内容时，联系管理员即可。</p>
      <p class="ver-line">当前版本 {{ APP_VERSION }} · 更新于 2026-09-12</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BACKUP_KEYS } from '../data/backupKeys'
import {
  vault, chooseFolder, reconnect, syncNow, loadFromFolder,
  refreshBackups, disconnect, initVault, formatAgo, formatSize, formatTs
} from '../utils/localVault'

/* 待办模块：从 localStorage 读取待办数据，展示待处理/今日到期/已逾期统计 + 前几条预览 */
const todoData = ref([])

function loadTodos() {
  try {
    const v = JSON.parse(localStorage.getItem('todo_v1') || '[]')
    todoData.value = Array.isArray(v) ? v : []
  } catch (e) {
    todoData.value = []
  }
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const openTodos = computed(() => todoData.value.filter(t => !t.done))
const openCount = computed(() => openTodos.value.length)
const todayCount = computed(() => openTodos.value.filter(t => t.due === todayStr()).length)
const overdueCount = computed(() => openTodos.value.filter(t => t.due && t.due < todayStr()).length)

// 预览列表：按优先级 + 到期日排序，取前 3 条
const pRank = { high: 0, med: 1, low: 2 }
const previewTodos = computed(() => {
  return openTodos.value.slice().sort((a, b) => {
    const pa = pRank[a.priority] ?? 1, pb = pRank[b.priority] ?? 1
    if (pa !== pb) return pa - pb
    if (a.due && b.due) return a.due.localeCompare(b.due)
    if (a.due) return -1
    if (b.due) return 1
    return (b.createdAt || 0) - (a.createdAt || 0)
  }).slice(0, 3)
})

function isToday(due) { return due === todayStr() }
function dueLabel(due) {
  if (due === todayStr()) return '今天'
  const [y, m, d] = due.split('-').map(Number)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dd = new Date(y, m - 1, d)
  const diff = Math.round((dd - today) / 86400000)
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff < -1) return `逾期 ${-diff} 天`
  return `${m}月${d}日`
}

onMounted(loadTodos)

/* 全部数据 key 统一来自 src/data/backupKeys.js（新增工具的 key 记得登记） */
const APP_VERSION = 'v1.14.2' /* 2026-09-12 话术：纯图复制一次带走全部图片 */
const fileInput = ref(null)
const dataStatus = ref('')
const dataStatusType = ref('ok')

function showDataStatus(text, type) {
  dataStatus.value = text
  dataStatusType.value = type
  setTimeout(() => { dataStatus.value = '' }, 4000)
}

function backupData() {
  try {
    const data = {}
    let count = 0
    for (const k of BACKUP_KEYS) {
      const v = localStorage.getItem(k)
      if (v !== null) { data[k] = v; count++ }
    }
    const payload = { app: 'biz-toolbox', version: 1, exportedAt: new Date().toISOString(), data }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const d = new Date()
    const p = n => String(n).padStart(2, '0')
    const ts = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
    const a = document.createElement('a')
    a.href = url
    a.download = `金米启航平台数据备份-${ts}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showDataStatus(count > 0 ? `已导出 ${count} 项数据，请妥善保存文件` : '暂无可导出的数据', 'ok')
  } catch (e) {
    showDataStatus('备份失败：' + (e && e.message || e), 'tip')
  }
}

function pickFile() {
  fileInput.value && fileInput.value.click()
}

function onFileChange(e) {
  const f = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result)
      const data = (obj && obj.data) || {}
      let n = 0
      for (const k of BACKUP_KEYS) {
        if (typeof data[k] === 'string') { localStorage.setItem(k, data[k]); n++ }
      }
      if (n === 0) { showDataStatus('导入失败：文件里没有可恢复的数据', 'tip'); return }
      showDataStatus(`已恢复 ${n} 项数据，正在刷新页面…`, 'ok')
      setTimeout(() => location.reload(), 800)
    } catch (err) {
      showDataStatus('导入失败：请选择正确的备份文件', 'tip')
    }
  }
  reader.readAsText(f)
}

/* ============ 本地文件夹同步 ============ */
const showHistory = ref(false)
const working = ref(false)

const vaultStateText = computed(() => {
  if (!vault.supported) return '当前浏览器不支持'
  if (!vault.bound) return '未绑定'
  if (vault.needReconnect) return '待恢复授权'
  if (vault.connected) return '已连接'
  return '未连接'
})
const vaultStateClass = computed(() => {
  if (!vault.supported) return 'disable'
  if (!vault.bound) return 'idle'
  if (vault.needReconnect) return 'warn'
  return 'ok'
})

async function guard(fn) {
  if (working.value) return
  working.value = true
  try { await fn() } finally { working.value = false }
}

async function initVaultOnce() {
  await initVault(BACKUP_KEYS)
  if (vault.connected) await refreshBackups()
}
onMounted(initVaultOnce)

function onChooseFolder() {
  guard(async () => {
    const r = await chooseFolder()
    if (r.aborted) return
    if (r.ok) {
      showDataStatus(r.restored ? '已从该文件夹恢复数据，正在刷新…' : `已绑定「${r.folder}」，共写入 ${r.count || 0} 项数据`, 'ok')
      if (r.restored) setTimeout(() => location.reload(), 900)
    } else if (r.msg) {
      showDataStatus(r.msg, 'tip')
    }
  })
}
function onReconnect() {
  guard(async () => {
    const r = await reconnect()
    if (r.ok) showDataStatus(r.restored ? '已恢复连接并载入文件夹数据…' : '已恢复连接，继续自动同步', 'ok')
    else showDataStatus(r.msg || '恢复连接失败', 'tip')
  })
}
function onSyncNow() {
  guard(async () => {
    const r = await syncNow('manual')
    showDataStatus(r.ok ? `已同步 ${r.count} 项数据到文件夹` : (r.msg || '同步失败'), r.ok ? 'ok' : 'tip')
  })
}
function onLoadData(name) {
  const tip = name
    ? `将用历史版本「${name}」覆盖当前浏览器里的全部数据，确定？`
    : '将用文件夹里的数据覆盖当前浏览器里的全部数据，确定？'
  if (!confirm(tip)) return
  guard(async () => {
    const r = await loadFromFolder(name)
    if (r.ok) showDataStatus('正在载入数据并刷新页面…', 'ok')
    else showDataStatus(r.msg || '加载失败', 'tip')
  })
}
function onToggleHistory() {
  showHistory.value = !showHistory.value
  if (showHistory.value) refreshBackups()
}
function onDisconnect() {
  if (!confirm('断开后将不再自动备份到该文件夹（浏览器里的数据会保留），确定？')) return
  guard(async () => {
    await disconnect()
    showHistory.value = false
    showDataStatus('已断开文件夹同步', 'ok')
  })
}
</script>

<style scoped>
.hero {
  margin-bottom: 22px; position: relative; overflow: hidden; color: #2a2118;
  background: linear-gradient(120deg, #fffdf9 0%, #fdf3e3 48%, #fbeccb 100%);
  border: 1px solid rgba(224,144,26,.22);
  box-shadow: 0 18px 44px -18px rgba(180,120,40,.18);
}
.hero::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(180,120,40,.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(180,120,40,.07) 1px, transparent 1px);
  background-size: 28px 28px; opacity: .5; pointer-events: none;
}
.hero::after {
  content: ''; position: absolute; right: -8%; top: -70%; width: 52%; height: 180%;
  background: radial-gradient(circle, rgba(224,144,26,.18), transparent 70%); pointer-events: none;
}
.hero > * { position: relative; z-index: 1; }
.hero .page-title { color: #2a2118; font-size: 22px; letter-spacing: .5px; }
.hero .page-sub { color: rgba(107,93,74,.85); margin-bottom: 4px; }
.hero-actions { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
.hero-actions button { font-weight: 600; }
.hero-actions .ai-trigger.secondary,
.hero-actions button.secondary {
  background: #fffefb; color: #2a2118;
  border: 1px solid #ece3d6; box-shadow: 0 1px 3px rgba(180,120,40,.08);
}
.hero-actions .ai-trigger.secondary:hover,
.hero-actions button.secondary:hover { background: #fbf5ea; border-color: #e0901a; transform: translateY(-1px); }
.ai-trigger { display: inline-flex; align-items: center; gap: 8px; }
.ai-dot {
  width: 18px; height: 18px; border-radius: 5px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff; font-size: 10px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }

/* 待办模块 + 右侧两卡：左右并排 */
.top-row { display: flex; gap: 16px; align-items: stretch; margin-bottom: 22px; }
.top-row .grid { margin-bottom: 0; flex: 1; min-width: 0; }

/* 待办模块 - 左侧窄卡片 */
.todo-panel {
  display: block; flex: 0 0 420px; max-width: 420px;
  padding: 12px 14px;
  transition: transform .15s, box-shadow .15s, border-color .15s;
}
.todo-panel:hover { border-color: var(--accent-2); transform: translateY(-2px); box-shadow: var(--shadow-hover); text-decoration: none; }
.todo-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.todo-title { display: flex; gap: 10px; align-items: center; }
.todo-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #3b5bdb, #5f3dc4);
  color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 6px 14px -4px rgba(95,61,196,.35);
}
.todo-icon svg { width: 17px; height: 17px; display: block; transform: scale(.82); }
.todo-title h3 { font-size: 14px; margin-bottom: 1px; color: var(--text); }
.todo-title p { color: var(--text-2); font-size: 11px; margin: 0; }
.todo-enter { font-size: 12px; color: var(--accent); font-weight: 600; flex-shrink: 0; }
.todo-stats { display: flex; gap: 8px; margin-bottom: 10px; }
.tstat { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; text-align: center; flex: 1; }
.tstat .num { display: block; font-size: 16px; font-weight: 700; color: var(--text); line-height: 1.1; }
.tstat .num.today { color: var(--accent); }
.tstat .num.overdue { color: var(--text-2); }
.tstat .num.warn { color: var(--red); }
.tstat .lbl { font-size: 10px; color: var(--text-2); }
.todo-preview { display: flex; flex-direction: column; gap: 3px; }
.todo-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text); padding: 3px 5px; border-radius: 5px; }
.todo-row:hover { background: var(--bg); }
.p-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.p-dot.p-high { background: var(--red); }
.p-dot.p-med { background: #d97706; }
.p-dot.p-low { background: var(--blue); }
.p-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p-title.is-due { color: var(--accent); font-weight: 600; }
.p-due { font-size: 10px; color: var(--text-2); flex-shrink: 0; }
.todo-more { font-size: 11px; color: var(--accent); padding: 2px 5px; }
.todo-empty { color: var(--text-2); font-size: 12px; padding: 10px 0; }

.entry { display: flex; gap: 14px; align-items: flex-start; transition: transform .15s, box-shadow .15s, border-color .15s; }
.entry:hover { border-color: var(--accent-2); text-decoration: none; transform: translateY(-2px); box-shadow: var(--shadow); }
.entry-icon {
  width: 46px; height: 46px; border-radius: 12px;
  flex-shrink: 0; color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 18px -6px rgba(42,33,24,.22);
  position: relative;
}
.entry-icon svg:not(.badge) { width: 22px; height: 22px; display: block; transform: scale(.8); }
.entry-icon svg.badge {
  position: absolute; right: -4px; bottom: -4px;
  width: 16px; height: 16px; padding: 2px;
  background: var(--surface); border-radius: 50%;
  color: var(--text-2);
  box-shadow: 0 2px 6px -2px rgba(42,33,24,.18);
}
.entry h3 { font-size: 15px; margin-bottom: 4px; }
.entry p { color: var(--text-2); font-size: 13px; }

.ai-settings { margin-bottom: 20px; }
.ai-head { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; position: relative; }
.ai-close {
  position: absolute; top: 0; right: 0;
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--text-2); font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ai-close:hover { border-color: var(--accent-2); color: var(--accent-2); }
.ai-icon {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 8px 20px -6px rgba(224,144,26,.4);
  position: relative;
}
.ai-icon svg { width: 22px; height: 22px; display: block; transform: scale(.8); }
.ai-head h3 { font-size: 15px; margin-bottom: 4px; }
.ai-head p { color: var(--text-2); font-size: 13px; line-height: 1.6; margin: 0; }
.ai-form { display: grid; grid-template-columns: 160px 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
.ai-form .fg { display: flex; flex-direction: column; gap: 5px; }
.ai-form label { font-size: 12.5px; color: var(--text-2); font-weight: 500; }
.ai-form input, .ai-form select {
  width: 100%; padding: 8px 10px; border: 1px solid var(--border);
  border-radius: 7px; font-size: 13px; background: var(--card);
  color: var(--text); font-family: inherit;
}
.ai-form input:focus, .ai-form select:focus {
  outline: none; border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(224,144,26,0.12);
}
.ai-actions { display: flex; gap: 10px; align-items: center; }
.ai-actions button { padding: 8px 18px; border-radius: 7px; font-size: 13px; cursor: pointer; border: none; font-family: inherit; }
.ai-actions button.primary { background: var(--accent); color: #fff; }
.ai-actions button.primary:disabled { opacity: 0.6; cursor: wait; }
.ai-actions button.secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.ai-status { font-size: 12.5px; margin-left: 6px; }
.ai-status.ok { color: #16a34a; }
.ai-status.tip { color: #ea580c; }
.data-mgmt { margin-bottom: 20px; }
.data-head { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; }
.data-icon {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 8px 20px -6px rgba(42,33,24,.18);
}
.data-icon svg { width: 22px; height: 22px; display: block; transform: scale(.8); }
.data-head h3 { font-size: 15px; margin-bottom: 4px; }
.data-head p { color: var(--text-2); font-size: 13px; line-height: 1.6; margin: 0; }
.data-actions { display: flex; gap: 10px; align-items: center; }
.data-actions button { padding: 8px 18px; border-radius: 7px; font-size: 13px; cursor: pointer; border: none; font-family: inherit; }
.data-actions button.primary { background: var(--accent); color: #fff; }
.data-actions button.secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.data-status { font-size: 12.5px; margin-left: 6px; }
.data-status.ok { color: #16a34a; }
.data-status.tip { color: #ea580c; }

/* 本地文件夹同步 */
.vault-card { border: 1px solid rgba(224,144,26,.28); background: linear-gradient(180deg, #fffdf9, #fffefb); }
.vault-card .data-icon { color: #fff; }
.vault-state { font-size: 11.5px; font-weight: 600; margin-left: 8px; padding: 2px 8px; border-radius: 20px; vertical-align: middle; }
.vault-state.ok { background: #dcfce7; color: #15803d; }
.vault-state.warn { background: #fef3c7; color: #b45309; }
.vault-state.idle { background: #f3f0ea; color: #6b5d4a; }
.vault-state.disable { background: #fee2e2; color: #b91c1c; }
.vault-body { padding-top: 4px; }
.unsupported { color: #b91c1c !important; }
.data-head p b { color: var(--accent); }
.vault-info {
  display: flex; gap: 26px; flex-wrap: wrap; padding: 12px 14px; margin-bottom: 14px;
  background: #fdf6ea; border: 1px solid var(--border); border-radius: 9px;
}
.vault-row { display: flex; flex-direction: column; gap: 3px; min-width: 150px; }
.vault-row .k { font-size: 11.5px; color: #9a8a72; }
.vault-row .v { font-size: 13.5px; color: var(--text); font-weight: 600; }
.data-actions button:disabled { opacity: .55; cursor: not-allowed; }
.danger-text { color: #b91c1c !important; }
.vault-tip { font-size: 12.5px; line-height: 1.7; margin: 12px 0 0; }
.warn-tip { color: #b45309; background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 0 6px 6px 0; }
.vault-history {
  margin-top: 14px; padding: 14px; border: 1px dashed #e2d3bd; border-radius: 9px; background: #fffdf8;
}
.vh-head { font-size: 12.5px; color: #6b5d4a; margin-bottom: 10px; }
.vh-empty { font-size: 12.5px; color: #9a8a72; }
.vh-list { display: flex; flex-direction: column; gap: 8px; }
.vh-item {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 9px 12px; background: #fff; border: 1px solid var(--border); border-radius: 7px;
}
.vh-meta { display: flex; gap: 12px; align-items: baseline; }
.vh-time { font-size: 13px; color: var(--text); font-weight: 600; }
.vh-size { font-size: 11.5px; color: #9a8a72; }
.vh-load {
  padding: 5px 14px; border-radius: 6px; border: 1px solid #e2d3bd; background: #fff;
  color: var(--accent); font-size: 12.5px; cursor: pointer; font-family: inherit; font-weight: 600;
}
.vh-load:hover { background: #fdf6ea; border-color: var(--accent); }
.hidden-file { display: none; }
.update-note h3 { font-size: 14px; margin-bottom: 6px; }
.update-note p { color: var(--text-2); font-size: 13px; }
.ver-line { margin-top: 8px; font-size: 12px !important; color: var(--muted) !important; }
@media (max-width: 900px) {
  .ai-form { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 720px) {
  .grid { grid-template-columns: 1fr; }
  .top-row { flex-direction: column; }
  .todo-panel { flex: 1 1 auto; max-width: none; width: 100%; }
  .ai-form { grid-template-columns: 1fr; }
  .ai-head { align-items: flex-start; }
}
</style>
