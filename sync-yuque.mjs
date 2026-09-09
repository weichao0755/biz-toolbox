#!/usr/bin/env node
/**
 * 语雀一键同步工具
 * 把语雀知识库里的文档同步为平台的 Markdown 知识库内容。
 *
 * 用法：
 *   YUQUE_TOKEN=xxx YUQUE_REPO=weichao0755/biz-toolbox node sync-yuque.mjs
 *
 * 凭证：环境变量 YUQUE_TOKEN（语雀个人令牌）
 *       生成地址：https://www.yuque.com/settings/tokens → 新建令牌
 * 仓库：YUQUE_REPO = 知识库 namespace（知识库首页网址去掉 https://www.yuque.com/ 后剩下的部分）
 *
 * 语雀知识库分组名 → 平台模块目录 映射（可在下方 MAP 中修改）：
 *   新手入门 → onboarding / 业务知识 → business / 案例库 → cases
 *   话术与工具 → scripts / 专家经验 → experts
 * 文档需放在对应分组下；未映射分组的文档会跳过并打印警告（不删平台已有内容）。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = join(__dirname, 'public', 'docs')
const INDEX_FILE = join(DOCS_DIR, 'index.json')
const BASE = 'https://www.yuque.com/api/v2'

// ===== 配置：语雀知识库分组名 → 平台模块目录 =====
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
function loadConfig() {
  const token = process.env.YUQUE_TOKEN
  const repo = process.env.YUQUE_REPO
  const cfgDir = join(homedir(), '.config', 'yuque')
  const tokenFile = join(cfgDir, 'token')
  const repoFile = join(cfgDir, 'repo')
  if (!token && existsSync(tokenFile)) {
    return { token: readFileSync(tokenFile, 'utf8').trim(), repo: repo || (existsSync(repoFile) ? readFileSync(repoFile, 'utf8').trim() : '') }
  }
  if (token && repo) return { token, repo }
  console.error('✗ 缺少语雀配置。请设置环境变量：')
  console.error('  YUQUE_TOKEN=你的语雀令牌  （https://www.yuque.com/settings/tokens 生成）')
  console.error('  YUQUE_REPO=知识库namespace （知识库首页网址去掉 https://www.yuque.com/ 的部分）')
  process.exit(1)
}

// ===== API 调用 =====
async function yuqueApi(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': token, 'User-Agent': 'biz-toolbox-sync/1.0' },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} @ ${path}（${res.statusText}）`)
  }
  const json = await res.json()
  if (json.status !== 200) {
    throw new Error(`语雀接口失败 [${json.status}] ${json.detail || json.message || '未知错误'} @ ${path}`)
  }
  return json.data
}

// 列出知识库下所有文档（自动翻页）
async function listDocs(repo, token) {
  const docs = []
  let offset = 0
  for (;;) {
    const page = await yuqueApi(`/repos/${repo}/docs?offset=${offset}&limit=100`, token)
    if (!Array.isArray(page) || page.length === 0) break
    for (const d of page) {
      docs.push({ slug: d.slug, title: d.title || '无标题', dir: (d.dir || '').replace(/^\/+|\/+$/g, '') })
    }
    offset += page.length
    if (page.length < 100) break
  }
  return docs
}

// 获取文档正文（Markdown 原文）
async function getDocBody(repo, slug, token) {
  const data = await yuqueApi(`/repos/${repo}/docs/${encodeURIComponent(slug)}`, token)
  return (data.body || '').trim()
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
  try {
    const existing = JSON.parse(readFileSync(INDEX_FILE, 'utf8'))
    for (const m of existing.modules || []) {
      const dir = MAP[m.name]
      if (dir && Array.isArray(m.docs) && m.docs.length > 0) prevByDir[dir] = m.docs
    }
  } catch {
    // 首次同步没有旧索引，忽略
  }
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

// 重建 index.json：已同步模块以语雀为准，未同步模块保留平台现有内容
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
  const { token, repo } = loadConfig()

  // 1. 验证令牌
  const me = await yuqueApi('/user', token)
  console.log(`· 令牌有效：${me.name || me.login}（@${me.login}）`)
  console.log(`· 同步知识库：${repo}`)

  // 2. 列出文档
  const docs = await listDocs(repo, token)
  console.log(`· 知识库共 ${docs.length} 篇文档`)

  const byModule = {}   // dir -> [{title, file}]
  const files = {}      // dir -> [{title, content, file}]
  let matched = 0

  // 3. 逐篇拉取正文并按分组归类
  for (const doc of docs) {
    const topDir = (doc.dir.split('/')[0] || '').trim()
    const dir = MAP[topDir]
    if (!dir) {
      console.warn(`  ⚠ 跳过「${doc.title}」（分组「${topDir || '根目录'}」未映射到平台模块）`)
      continue
    }
    matched++
    const content = await getDocBody(repo, doc.slug, token)
    const file = slug(doc.title, Object.keys(byModule[dir] || {}).length + 1)
    byModule[dir] = byModule[dir] || []
    files[dir] = files[dir] || []
    byModule[dir].push({ title: doc.title, file })
    files[dir].push({ title: doc.title, file, content })
    console.log(`    ✓ [${topDir}] ${file} (${content.length} 字)`)
  }

  // 4. 写 Markdown 文件
  for (const [dir, list] of Object.entries(files)) {
    mkdirSync(join(DOCS_DIR, dir), { recursive: true })
    for (const doc of list) {
      const header = `# ${doc.title}\n\n> 来源：语雀知识库 · 由 sync-yuque 同步生成\n\n`
      writeFileSync(join(DOCS_DIR, dir, doc.file), header + doc.content + '\n', 'utf8')
    }
  }

  // 5. 写索引（未同步模块保留现有内容）
  writeIndex(byModule, readExistingIndex())

  console.log(`\n✔ 完成：同步 ${matched} 篇文档 → public/docs/`)
  console.log('  下一步：npm run build 后重新部署即可全员生效')
}

main().catch((err) => {
  console.error('✗ 同步失败：', err.message)
  process.exit(1)
})
