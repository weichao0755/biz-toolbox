#!/usr/bin/env node
/**
 * ima 一键同步工具
 * 把腾讯 ima 里写的笔记同步为平台的 Markdown 知识库内容。
 *
 * 用法：
 *   node sync-ima.mjs          # 从 ima 拉取全部笔记本 → 生成 docs + index.json
 *
 * 凭证（二选一）：
 *   1. 环境变量 IMA_OPENAPI_CLIENTID / IMA_OPENAPI_APIKEY
 *   2. 配置文件 ~/.config/ima/client_id 与 ~/.config/ima/api_key
 *
 * ima 笔记本名 → 平台模块目录 映射（可在下方 MAP 中修改）：
 *   新手入门 → onboarding / 业务知识 → business / 案例库 → cases
 *   话术与工具 → scripts / 专家经验 → experts
 * 未匹配的笔记本会跳过并打印警告（不删平台已有内容）。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = join(__dirname, 'public', 'docs')
const INDEX_FILE = join(DOCS_DIR, 'index.json')
const BASE = 'https://ima.qq.com'

// ===== 配置：ima 笔记本名 → 平台模块目录 =====
const MAP = {
  '新手入门': 'onboarding',
  '业务知识': 'business',
  '案例库': 'cases',
  '话术与工具': 'scripts',
  '专家经验': 'experts',
}
// 平台模块展示顺序与主题色（保持与 index.json 一致）
const MODULES = [
  { name: '新手入门', color: '#378add' },
  { name: '业务知识', color: '#1d9e75' },
  { name: '案例库', color: '#ba7517' },
  { name: '话术与工具', color: '#d4537e' },
  { name: '专家经验', color: '#534ab7' },
]

// ===== 凭证读取 =====
function loadCredentials() {
  const clientId = process.env.IMA_OPENAPI_CLIENTID
  const apiKey = process.env.IMA_OPENAPI_APIKEY
  const cfgDir = join(homedir(), '.config', 'ima')
  const cidFile = join(cfgDir, 'client_id')
  const keyFile = join(cfgDir, 'api_key')
  const fromFile = existsSync(cidFile) && existsSync(keyFile)
  if (!clientId && fromFile) {
    return { clientId: readFileSync(cidFile, 'utf8').trim(), apiKey: readFileSync(keyFile, 'utf8').trim() }
  }
  if (clientId && apiKey) {
    return { clientId, apiKey }
  }
  console.error('✗ 缺少 ima 凭证。请配置环境变量 IMA_OPENAPI_CLIENTID / IMA_OPENAPI_APIKEY，')
  console.error('  或在 ~/.config/ima/ 下放 client_id 和 api_key 两个文件。')
  console.error('  凭证获取：https://ima.qq.com/agent-interface')
  process.exit(1)
}

// ===== API 调用 =====
async function imaApi(path, body, cred) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'ima-openapi-clientid': cred.clientId,
      'ima-openapi-apikey': cred.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} @ ${path}`)
  }
  const json = await res.json()
  // 兼容两种响应结构：wiki 接口用 retcode/errmsg，note 接口用 code/msg
  const code = json.retcode ?? json.code
  const msg = json.errmsg || json.msg || '未知错误'
  if (code !== undefined && code !== 0) {
    throw new Error(`ima 接口失败 [${code}] ${msg} @ ${path}`)
  }
  if (code === undefined) {
    throw new Error(`ima 接口响应格式异常 @ ${path}: ${JSON.stringify(json).slice(0, 200)}`)
  }
  return json.data
}

// 列出所有笔记本（翻页）
async function listFolders(cred) {
  const folders = []
  let cursor = '0'
  for (;;) {
    const data = await imaApi('/openapi/note/v1/list_note_folder_by_cursor', { cursor, limit: 20 }, cred)
    for (const f of data.note_book_folders || []) {
      const b = f?.folder?.basic_info
      if (b && b.status === 0) folders.push({ folderId: b.folder_id, name: b.name })
    }
    if (data.is_end) break
    cursor = data.next_cursor
    if (!cursor) break
  }
  return folders
}

// 列出笔记本内所有笔记（翻页）
async function listNotes(folderId, cred) {
  const notes = []
  let cursor = ''
  for (;;) {
    const data = await imaApi('/openapi/note/v1/list_note_by_folder_id', { folder_id: folderId, cursor, limit: 20 }, cred)
    for (const n of data.note_book_list || []) {
      const b = n?.basic_info?.basic_info
      if (b && b.status === 0) notes.push({ docId: b.docid, title: b.title || '无标题' })
    }
    if (data.is_end) break
    cursor = data.next_cursor
    if (!cursor) break
  }
  return notes
}

// 获取笔记正文（纯文本）
async function getDocContent(docId, cred) {
  const data = await imaApi('/openapi/note/v1/get_doc_content', { doc_id: docId, target_content_format: 0 }, cred)
  return (data.content || '').trim()
}

// 标题 → 安全文件名
function slug(title, idx) {
  const clean = title
    .replace(/[\\/:*?"<>|\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40)
  return `${String(idx).padStart(2, '0')}-${clean || 'untitled'}.md`
}

// 读取现有 index.json，返回 { dir: docs }（用于未匹配模块保留现有内容）
function readExistingIndex() {
  const prevByDir = {}
  // 来源 1：现有 index.json
  try {
    const existing = JSON.parse(readFileSync(INDEX_FILE, 'utf8'))
    for (const m of existing.modules || []) {
      const dir = MAP[m.name]
      if (dir && Array.isArray(m.docs) && m.docs.length > 0) prevByDir[dir] = m.docs
    }
  } catch {
    // 首次同步没有旧索引，忽略
  }
  // 来源 2：扫描 docs 目录兜底（index.json 为空/丢失时，按现有 md 文件恢复）
  for (const dir of Object.values(MAP)) {
    const absDir = join(DOCS_DIR, dir)
    if (!existsSync(absDir)) continue
    const files = readdirSync(absDir).filter((f) => f.endsWith('.md')).sort()
    if (files.length > 0 && !prevByDir[dir]) {
      prevByDir[dir] = files.map((f) => ({
        title: f.replace(/^\d+-\s*/, '').replace(/\.md$/, ''),
        file: `${dir}/${f}`,
      }))
    }
  }
  return prevByDir
}

// 重建 index.json：已同步模块以 ima 为准，未同步模块保留平台现有内容
function writeIndex(byModule, prevByDir) {
  const modules = MODULES.map((m) => {
    const dir = MAP[m.name]
    const docs = (byModule[dir] || prevByDir[dir] || []).map((d) => ({ title: d.title, file: `${dir}/${d.file}` }))
    return { name: m.name, color: m.color, docs }
  })
  writeFileSync(INDEX_FILE, JSON.stringify({ modules }, null, 2) + '\n', 'utf8')
}

// ===== 主流程 =====
async function main() {
  const cred = loadCredentials()
  console.log('· 正在从 ima 拉取笔记本列表...')
  const folders = await listFolders(cred)
  console.log(`· 找到 ${folders.length} 个笔记本：${folders.map((f) => f.name).join('、') || '(无)'}`)

  const byModule = {}   // dir -> [{title, file}]
  const files = {}      // dir -> [{title, content, file}]
  let matched = 0

  for (const folder of folders) {
    const dir = MAP[folder.name]
    if (!dir) {
      console.warn(`  ⚠ 跳过未映射笔记本「${folder.name}」（可在脚本顶部 MAP 中添加映射）`)
      continue
    }
    matched++
    const notes = await listNotes(folder.folderId, cred)
    console.log(`· 笔记本「${folder.name}」→ ${dir}/，共 ${notes.length} 篇笔记`)
    byModule[dir] = []
    files[dir] = []
    let idx = 0
    for (const note of notes) {
      idx++
      const content = await getDocContent(note.docId, cred)
      const file = slug(note.title, idx)
      byModule[dir].push({ title: note.title, file })
      files[dir].push({ title: note.title, file, content })
      console.log(`    ✓ ${file} (${content.length} 字)`)
    }
  }

  // 写 Markdown 文件
  for (const [dir, list] of Object.entries(files)) {
    mkdirSync(join(DOCS_DIR, dir), { recursive: true })
    for (const doc of list) {
      const header = `# ${doc.title}\n\n> 来源：腾讯 ima 知识库 · 由 sync-ima 同步生成\n\n`
      writeFileSync(join(DOCS_DIR, dir, doc.file), header + doc.content + '\n', 'utf8')
    }
  }

  // 写索引（未同步模块保留现有内容）
  writeIndex(byModule, readExistingIndex())

  console.log(`\n✔ 完成：匹配 ${matched} 个笔记本，生成 ${Object.values(files).reduce((a, l) => a + l.length, 0)} 篇文档 → public/docs/`)
  console.log('  下一步：npm run build 后重新部署即可全员生效')
}

main().catch((err) => {
  console.error('✗ 同步失败：', err.message)
  process.exit(1)
})
