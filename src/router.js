import { createRouter, createWebHashHistory } from 'vue-router'
import { SITE } from './config'
import HomeView from './views/HomeView.vue'
import KnowledgeView from './views/KnowledgeView.vue'
import ToolsView from './views/ToolsView.vue'
import { TOOLS, CATEGORIES } from './data/tools'

// newTab 标记的工具：平台内不 iframe 内嵌，路由访问时自动新窗口打开独立页
const toolRoutes = TOOLS.filter(t => !t.newTab).map(t => ({
  path: t.path,
  name: t.name,
  component: t.component,
  props: () => ({ tool: t }),
  meta: { title: t.title, tool: true }
}))
const newTabRoutes = TOOLS.filter(t => t.newTab).map(t => ({
  path: t.path,
  name: t.name,
  component: () => import('./views/tools/OpenNewTabView.vue'),
  props: () => ({ tool: t }),
  meta: { title: t.title, tool: true }
}))

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
  { path: '/knowledge', name: 'knowledge', component: KnowledgeView, meta: { title: '知识库' } },
  { path: '/tools', name: 'tools', component: ToolsView, meta: { title: '工具箱' } },
  // 工具分区：/tools/manage → 管理区 等
  { path: '/tools/:cat', name: 'tools-cat', component: ToolsView, meta: { title: '工具分区' } },
  ...toolRoutes,
  ...newTabRoutes
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  let title = to.meta.title
  if (to.params.cat) {
    const c = CATEGORIES.find(x => x.key === to.params.cat)
    title = c ? c.label.replace(/类$/, '区') : '工具箱'
  }
  document.title = title ? `${title} · ${SITE.name}` : SITE.name
})

export default router
