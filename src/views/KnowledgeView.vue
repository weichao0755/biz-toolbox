<template>
  <div class="kb">
    <aside class="kb-side">
      <div class="search-box">
        <input v-model="q" placeholder="搜索知识库…" @input="onSearch" />
      </div>

      <div v-if="q.trim()" class="results">
        <div v-if="searching" class="hint">搜索中…</div>
        <div v-else-if="results.length === 0" class="hint">没有匹配的文档</div>
        <div v-for="r in results" :key="r.file" class="res-item" @click="openResult(r)">
          <div class="res-title">{{ r.title }}</div>
          <div class="res-snip" v-html="r.snippet"></div>
        </div>
      </div>

      <div v-else class="tree">
        <div v-if="loading" class="hint">加载中…</div>
        <div v-else-if="error" class="hint">{{ error }}</div>
        <div v-for="mod in modules" :key="mod.name" class="mod">
          <div class="mod-name">
            <span class="mod-dot" :style="{ background: mod.color || '#378add' }"></span>
            {{ mod.name }}
          </div>
          <div v-for="doc in mod.docs" :key="doc.file"
            class="doc-item"
            :class="{ active: currentDoc && currentDoc.file === doc.file }"
            @click="openDoc(doc)">
            {{ doc.title }}
          </div>
        </div>
      </div>
    </aside>

    <section class="kb-main">
      <div v-if="!currentDoc && !q" class="empty">
        <div class="empty-icon">知</div>
        <p>从左侧目录选择一篇文档开始阅读</p>
      </div>
      <div v-else-if="!currentDoc && q && !searching" class="empty">输入关键词搜索知识库</div>
      <div v-else-if="currentDoc" class="doc">
        <h2 class="doc-title">{{ currentDoc.title }}</h2>
        <div class="md-body" v-html="html"></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { md } from '../utils/md'
import { DOCS_INDEX } from '../config'

const modules = ref([])
const loading = ref(true)
const error = ref('')
const currentDoc = ref(null)
const html = ref('')

const q = ref('')
const searching = ref(false)
const results = ref([])
let searchTimer = null

async function loadIndex() {
  try {
    const res = await fetch(DOCS_INDEX)
    if (!res.ok) throw new Error('索引加载失败')
    const data = await res.json()
    modules.value = data.modules || []
  } catch (e) {
    error.value = '知识库加载失败：' + e.message
  } finally {
    loading.value = false
  }
}

async function openDoc(doc) {
  currentDoc.value = doc
  q.value = ''
  results.value = []
  try {
    const res = await fetch('./docs/' + doc.file)
    if (!res.ok) throw new Error('文档加载失败')
    const text = await res.text()
    html.value = md.render(text)
  } catch (e) {
    html.value = '<p style="color:#a32d2d">加载失败：' + e.message + '</p>'
  }
}

function openResult(r) {
  openDoc(r)
}

async function doSearch(keyword) {
  searching.value = true
  const found = []
  const kw = keyword.toLowerCase()
  for (const mod of modules.value) {
    for (const doc of mod.docs) {
      try {
        const res = await fetch('./docs/' + doc.file)
        if (!res.ok) continue
        const text = await res.text()
        const idx = text.toLowerCase().indexOf(kw)
        if (idx >= 0) {
          const start = Math.max(0, idx - 18)
          let snippet = text.slice(start, idx + 40).replace(/\n/g, ' ')
          if (start > 0) snippet = '…' + snippet
          found.push({ title: doc.title, file: doc.file, snippet })
          if (found.length >= 20) break
        }
      } catch { /* ignore */ }
    }
    if (found.length >= 20) break
  }
  results.value = found
  searching.value = false
}

function onSearch() {
  clearTimeout(searchTimer)
  const kw = q.value.trim()
  if (!kw) { results.value = []; searching.value = false; return }
  searchTimer = setTimeout(() => doSearch(kw), 300)
}

onMounted(loadIndex)
</script>

<style scoped>
.kb { display: flex; height: 100%; }
.kb-side {
  width: 260px; flex-shrink: 0; background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; overflow-y: auto;
}
.search-box { padding: 14px 14px 10px; }
.tree { padding: 4px 10px 16px; }
.mod { margin-bottom: 12px; }
.mod-name {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--text-2); font-weight: 500;
  padding: 4px 10px 6px;
}
.mod-dot { width: 7px; height: 7px; border-radius: 50%; }
.doc-item {
  padding: 8px 12px 8px 25px; border-radius: 8px;
  font-size: 13px; color: var(--text); cursor: pointer;
}
.doc-item:hover { background: #f2f4f7; }
.doc-item.active { background: var(--accent-bg); color: var(--accent); font-weight: 500; }
.hint { color: var(--text-2); font-size: 13px; padding: 12px; }
.results { padding: 4px 12px 16px; }
.res-item { padding: 10px 8px; border-bottom: 1px solid var(--border); cursor: pointer; }
.res-item:hover { background: #f2f4f7; border-radius: 8px; }
.res-title { font-size: 13px; font-weight: 500; margin-bottom: 3px; color: var(--accent); }
.res-snip { font-size: 12px; color: var(--text-2); }
.kb-main { flex: 1; overflow-y: auto; padding: 28px 36px; max-width: 900px; }
.empty { text-align: center; color: var(--text-2); padding: 80px 0; }
.empty-icon {
  width: 56px; height: 56px; margin: 0 auto 14px; border-radius: 14px;
  background: var(--green-bg); color: var(--green); font-size: 26px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.doc-title { font-size: 22px; font-weight: 600; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
</style>
