import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import KnowledgeView from './views/KnowledgeView.vue'
import ToolsView from './views/ToolsView.vue'
import { TOOLS } from './data/tools'

const toolRoutes = TOOLS.map(t => ({
  path: t.path,
  name: t.name,
  component: t.component,
  props: () => ({ tool: t }),
  meta: { title: t.title, tool: true }
}))

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
  { path: '/knowledge', name: 'knowledge', component: KnowledgeView, meta: { title: '知识库' } },
  { path: '/tools', name: 'tools', component: ToolsView, meta: { title: '工具箱' } },
  ...toolRoutes
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 业务工具箱` : '业务工具箱'
})

export default router
