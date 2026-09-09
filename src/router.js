import { createRouter, createWebHashHistory } from 'vue-router'
import { SITE } from './config'
import HomeView from './views/HomeView.vue'
import KnowledgeView from './views/KnowledgeView.vue'
import ToolsView from './views/ToolsView.vue'
import { TOOLS } from './data/tools'

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
  ...toolRoutes,
  ...newTabRoutes
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${SITE.name}` : SITE.name
})

export default router
