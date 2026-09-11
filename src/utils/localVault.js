/* ============================================================================
 * 本地文件夹同步引擎
 *
 * 作用：把平台全部「用户设定 + 工具记录」自动落到用户指定的本机文件夹，
 *       换电脑 / 重装浏览器 / 清缓存后可从该文件夹一键恢复。
 *
 * 依赖：File System Access API（Chrome / Edge 等 Chromium 内核浏览器）
 *       —— 不支持时优雅降级，不报错、不影响其他功能。
 *
 * 目录结构（用户选定目录下）：
 *   biz-toolbox-data.json      主数据文件（最新）
 *   backups/备份-时间戳.json    自动保留的历史版本（最多 5 份）
 * ========================================================================== */

import { reactive } from 'vue'

export const VAULT_SUPPORTED =
  typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function'

const IDB_NAME = 'biz-toolbox-vault'
const IDB_STORE = 'handles'
const HANDLE_KEY = 'vault-dir'

const MAIN_FILE = 'biz-toolbox-data.json'
const BACKUP_DIR = 'backups'
const BACKUP_KEEP = 5
const ARCHIVE_GAP = 5 * 60 * 1000        /* 两次历史归档的最小间隔 */
const AUTOLOAD_TOLERANCE = 30 * 1000     /* 远端比本地新超过 30 秒才自动覆盖 */
const FORMAT = 1

const LS_SYNC_AT = 'biz_toolbox_vault_sync_at'
const LS_FOLDER = 'biz_toolbox_vault_folder'
const LS_LAST_ARCHIVE = 'biz_toolbox_vault_last_archive'

export const vault = reactive({
  supported: VAULT_SUPPORTED,
  bound: false,          /* 已绑定过文件夹（句柄存在 IndexedDB） */
  folderName: '',
  connected: false,      /* 当前会话已拿到读写授权，可自动同步 */
  needReconnect: false,  /* 授权被浏览器回收，需点一次「恢复连接」 */
  syncing: false,
  lastSyncAt: 0,
  backups: []
})

/* ============================ 数据收集 ============================ */

/* 轻量指纹：长度 + 首尾片段 hash，避免对几 MB 数据做全量 hash */
function hashStr(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
function quickSign(v) {
  if (v === null) return '-'
  const head = v.slice(0, 120)
  const tail = v.slice(-120)
  return v.length + '.' + hashStr(head + tail)
}
function snapshotFingerprint(keys) {
  return keys.map(k => k + ':' + quickSign(localStorage.getItem(k))).join('|')
}

export function buildPayload(keys) {
  const data = {}
  let count = 0
  for (const k of keys) {
    const v = localStorage.getItem(k)
    if (v !== null) { data[k] = v; count++ }
  }
  return {
    app: 'biz-toolbox',
    format: FORMAT,
    exportedAt: new Date().toISOString(),
    count,
    keys,
    data
  }
}

function applyData(obj, keys) {
  const data = (obj && obj.data) || {}
  let n = 0
  for (const k of keys) {
    if (typeof data[k] === 'string') { localStorage.setItem(k, data[k]); n++ }
  }
  localStorage.setItem(LS_SYNC_AT, String(Date.now()))
  return n
}

/* ============================ IndexedDB：持久化句柄 ============================ */
/* FileSystemDirectoryHandle 无法存 localStorage，只能存 IndexedDB */

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function idbGet(key) {
  try {
    const db = await openDB()
    return await new Promise((res) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const r = tx.objectStore(IDB_STORE).get(key)
      r.onsuccess = () => res(r.result || null)
      r.onerror = () => res(null)
    })
  } catch (e) { return null }
}
async function idbSet(key, val) {
  try {
    const db = await openDB()
    await new Promise((res) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put(val, key)
      tx.oncomplete = () => res()
      tx.onerror = () => res()
    })
  } catch (e) { /* 存句柄失败不影响本会话使用 */ }
}
async function idbDel(key) {
  try {
    const db = await openDB()
    await new Promise((res) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).delete(key)
      tx.oncomplete = () => res()
      tx.onerror = () => res()
    })
  } catch (e) { /* ignore */ }
}

/* ============================ 文件读写原语 ============================ */

async function readFileFrom(dir, name) {
  const fh = await dir.getFileHandle(name)
  const file = await fh.getFile()
  return await file.text()
}
async function fileExists(dir, name) {
  try { await dir.getFileHandle(name); return true } catch (e) { return false }
}
async function writeInto(dir, name, text) {
  const fh = await dir.getFileHandle(name, { create: true })
  const w = await fh.createWritable()
  await w.write(text)
  await w.close()
}
async function getSubDir(dir, name, create) {
  return await dir.getDirectoryHandle(name, { create: !!create })
}

/* ============================ 引擎主体 ============================ */

let dirHandle = null
let KEYS = []
let timer = null
let debounceTimer = null
let lastFp = ''
let lastArchiveAt = Number(localStorage.getItem(LS_LAST_ARCHIVE) || 0)
let started = false
let inited = false
let lastInitResult = { autoLoaded: false, reason: 'not-run' }

async function currentHandle() {
  if (dirHandle) return dirHandle
  dirHandle = await idbGet(HANDLE_KEY)
  return dirHandle
}
async function hasPermission(h) {
  try { return (await h.queryPermission({ mode: 'readwrite' })) === 'granted' } catch (e) { return false }
}

/* 启动：恢复句柄 + 检查授权 + 自动加载 + 开启自动同步 */
export async function initVault(keys, opts = {}) {
  /* 进程内只初始化一次，避免 App.vue 与 HomeView 重复调用 */
  if (inited) return lastInitResult
  inited = true
  KEYS = keys
  vault.folderName = localStorage.getItem(LS_FOLDER) || ''
  vault.lastSyncAt = Number(localStorage.getItem(LS_SYNC_AT) || 0)
  if (!VAULT_SUPPORTED) { lastInitResult = { autoLoaded: false, reason: 'unsupported' }; return lastInitResult }

  const h = await currentHandle()
  vault.bound = !!h
  if (!h) { lastInitResult = { autoLoaded: false, reason: 'unbound' }; return lastInitResult }

  if (await hasPermission(h)) {
    vault.connected = true
    vault.needReconnect = false
    vault.folderName = h.name || vault.folderName
    /* 换电脑场景：文件夹里有数据且比本地新 → 自动恢复（内部会 reload） */
    if (opts.autoLoad !== false) {
      const loaded = await autoRestore()
      if (loaded) { lastInitResult = { autoLoaded: true, reason: 'restored' }; return lastInitResult }
    }
    await refreshBackups()
    startAuto()
    lastInitResult = { autoLoaded: false, reason: 'connected' }; return lastInitResult
  }
  /* 授权被回收：需用户点一次「恢复连接」恢复授权 */
  vault.connected = false
  vault.needReconnect = true
  lastInitResult = { autoLoaded: false, reason: 'need-reconnect' }; return lastInitResult
}

/* 自动恢复：本地没数据，或文件夹里明显更新 */
async function autoRestore() {
  try {
    const h = await currentHandle()
    if (!h || !(await hasPermission(h))) return false
    if (!(await fileExists(h, MAIN_FILE))) return false
    const text = await readFileFrom(h, MAIN_FILE)
    const obj = JSON.parse(text)
    const remoteAt = Number(new Date(obj.exportedAt || 0).getTime() || 0)
    const localAt = Number(localStorage.getItem(LS_SYNC_AT) || 0)
    const localEmpty = KEYS.every(k => localStorage.getItem(k) === null)
    if (!localEmpty && remoteAt - localAt <= AUTOLOAD_TOLERANCE) return false
    const n = applyData(obj, KEYS)
    if (n > 0) { location.reload(); return true }
    return false
  } catch (e) {
    console.warn('[vault] 自动加载失败', e)
    return false
  }
}

/* 选择 / 新建存储文件夹（必须由用户点击触发） */
export async function chooseFolder() {
  if (!VAULT_SUPPORTED) return { ok: false, msg: '当前浏览器不支持本地文件夹同步' }
  try {
    const h = await window.showDirectoryPicker({ id: 'biz-toolbox', mode: 'readwrite' })
    dirHandle = h
    await idbSet(HANDLE_KEY, h)
    vault.bound = true
    vault.connected = true
    vault.needReconnect = false
    vault.folderName = h.name || ''
    localStorage.setItem(LS_FOLDER, vault.folderName)

    /* 若该文件夹里已有数据（换电脑后指向老文件夹），先恢复再开同步 */
    const restored = await autoRestore()
    if (restored) return { ok: true, restored: true, folder: vault.folderName }

    await refreshBackups()
    const r = await syncNow('bind')
    startAuto()
    return { ok: r.ok, msg: r.msg, restored: false, folder: vault.folderName, count: r.count }
  } catch (e) {
    if (e && e.name === 'AbortError') return { ok: false, aborted: true, msg: '' }
    return { ok: false, msg: '选择文件夹失败：' + ((e && e.message) || e) }
  }
}

/* 恢复连接（浏览器回收授权后，点一次即可，不用重新选文件夹） */
export async function reconnect() {
  const h = await currentHandle()
  if (!h) return { ok: false, msg: '尚未绑定存储文件夹' }
  try {
    const p = await h.requestPermission({ mode: 'readwrite' })
    if (p !== 'granted') return { ok: false, msg: '授权未通过，文件夹同步暂不可用' }
    vault.connected = true
    vault.needReconnect = false
    vault.folderName = h.name || vault.folderName
    localStorage.setItem(LS_FOLDER, vault.folderName)
    const restored = await autoRestore()
    if (restored) return { ok: true, restored: true }
    await refreshBackups()
    await syncNow('reconnect')
    startAuto()
    return { ok: true, restored: false }
  } catch (e) {
    return { ok: false, msg: '恢复连接失败：' + ((e && e.message) || e) }
  }
}

/* 归档当前主文件为历史版本（受最小间隔保护），并裁剪到 BACKUP_KEEP 份 */
async function archive() {
  const h = await currentHandle()
  if (!h) return
  try {
    if (!(await fileExists(h, MAIN_FILE))) return
    const now = Date.now()
    if (now - lastArchiveAt < ARCHIVE_GAP) return
    const text = await readFileFrom(h, MAIN_FILE)
    const dir = await getSubDir(h, BACKUP_DIR, true)
    const d = new Date()
    const p = n => String(n).padStart(2, '0')
    const name = `备份-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.json`
    await writeInto(dir, name, text)
    lastArchiveAt = now
    localStorage.setItem(LS_LAST_ARCHIVE, String(now))
    await prune(dir)
  } catch (e) {
    console.warn('[vault] 历史归档失败', e)
  }
}
async function prune(dir) {
  try {
    const arr = []
    for await (const [name, fh] of dir.entries()) {
      if (fh.kind === 'file' && /^备份-.*\.json$/i.test(name)) arr.push(name)
    }
    arr.sort()   /* 时间戳命名，字典序即时间序 */
    while (arr.length > BACKUP_KEEP) {
      await dir.removeEntry(arr.shift())
    }
  } catch (e) { /* ignore */ }
}

/* 立即同步（写入主文件） */
export async function syncNow(reason = 'manual') {
  if (!VAULT_SUPPORTED) return { ok: false, msg: '当前浏览器不支持本地文件夹同步' }
  const h = await currentHandle()
  if (!h) return { ok: false, msg: '尚未选择存储文件夹' }
  if (!(await hasPermission(h))) {
    vault.connected = false
    vault.needReconnect = true
    return { ok: false, msg: '授权已失效，请点击「恢复连接」' }
  }
  vault.syncing = true
  try {
    await archive()
    const payload = buildPayload(KEYS)
    await writeInto(h, MAIN_FILE, JSON.stringify(payload, null, 2))
    vault.lastSyncAt = Date.now()
    localStorage.setItem(LS_SYNC_AT, String(vault.lastSyncAt))
    lastFp = snapshotFingerprint(KEYS)
    await refreshBackups()
    return { ok: true, count: payload.count, at: vault.lastSyncAt, reason }
  } catch (e) {
    return { ok: false, msg: '写入文件夹失败：' + ((e && e.message) || e) }
  } finally {
    vault.syncing = false
  }
}

/* 从文件夹加载数据：不传 name 则加载主文件，传 name 则加载指定历史版本 */
export async function loadFromFolder(name) {
  const h = await currentHandle()
  if (!h) return { ok: false, msg: '尚未选择存储文件夹' }
  if (!(await hasPermission(h))) {
    vault.needReconnect = true
    return { ok: false, msg: '授权已失效，请点击「恢复连接」' }
  }
  try {
    const file = name || MAIN_FILE
    let text
    if (name) {
      const dir = await getSubDir(h, BACKUP_DIR, false)
      text = await readFileFrom(dir, name)
    } else {
      if (!(await fileExists(h, MAIN_FILE))) return { ok: false, msg: '文件夹里还没有数据文件' }
      text = await readFileFrom(h, MAIN_FILE)
    }
    const obj = JSON.parse(text)
    const n = applyData(obj, KEYS)
    if (n === 0) return { ok: false, msg: '该文件里没有可恢复的数据' }
    localStorage.setItem(LS_FOLDER, vault.folderName)
    location.reload()
    return { ok: true, count: n, reloading: true }
  } catch (e) {
    return { ok: false, msg: '加载失败：' + ((e && e.message) || e) }
  }
}

/* 历史版本列表 */
export async function refreshBackups() {
  try {
    const h = await currentHandle()
    if (!h || !(await hasPermission(h))) { vault.backups = []; return }
    const dir = await getSubDir(h, BACKUP_DIR, false)
    const arr = []
    for await (const [name, fh] of dir.entries()) {
      if (fh.kind !== 'file' || !/^备份-.*\.json$/i.test(name)) continue
      const f = await fh.getFile()
      arr.push({ name, size: f.size, at: f.lastModified })
    }
    arr.sort((a, b) => b.at - a.at)
    vault.backups = arr
  } catch (e) {
    vault.backups = []
  }
}

/* ============================ 自动同步 ============================ */

function scheduleSync() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { syncNow('auto').catch(() => {}) }, 2500)
}
function onStorageEvent(e) {
  /* 工具页（独立标签页或同源 iframe）改动数据时，本窗口会收到 */
  if (!vault.connected) return
  if (e && e.key && !KEYS.includes(e.key) && e.key !== LS_SYNC_AT) return
  scheduleSync()
}
function onVisibility() {
  if (document.visibilityState === 'hidden' && vault.connected) {
    syncNow('hidden').catch(() => {})
  }
}
function tick() {
  if (!vault.connected) return
  if (document.visibilityState === 'hidden') return
  try {
    const fp = snapshotFingerprint(KEYS)
    if (fp !== lastFp) { lastFp = fp; scheduleSync() }
  } catch (e) { /* ignore */ }
}

export function startAuto() {
  if (started || !VAULT_SUPPORTED) return
  lastFp = snapshotFingerprint(KEYS)
  window.addEventListener('storage', onStorageEvent)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', onVisibility)
  timer = setInterval(tick, 4000)
  started = true
}
export function stopAuto() {
  if (!started) return
  window.removeEventListener('storage', onStorageEvent)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('pagehide', onVisibility)
  clearInterval(timer)
  clearTimeout(debounceTimer)
  timer = null
  started = false
}

/* 断开：清除句柄，保留浏览器本地数据 */
export async function disconnect() {
  stopAuto()
  await idbDel(HANDLE_KEY)
  dirHandle = null
  localStorage.removeItem(LS_FOLDER)
  vault.bound = false
  vault.connected = false
  vault.needReconnect = false
  vault.folderName = ''
  vault.lastSyncAt = 0
  vault.backups = []
}

export function formatAgo(ts) {
  if (!ts) return '尚未同步'
  const diff = Date.now() - ts
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + ' 小时前'
  if (diff < 7 * 24 * 3600000) return Math.floor(diff / 86400000) + ' 天前'
  return new Date(ts).toLocaleDateString('zh-CN')
}
export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}
export function formatTs(ts) {
  const d = new Date(ts)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
