import EmbeddedToolView from '../views/tools/EmbeddedToolView.vue'

// ============ 工具注册表 ============
// 新增工具两种方式：
// 1. 外部单文件工具（推荐）：把你的工具 HTML 放到 public/tools/<名字>/index.html，
//    然后在这里加一项 { path, name, title, desc, color, url, component: EmbeddedToolView }
//    例如：url: '/tools/<名字>/index.html'
// 2. 定制开发工具：写一个组件放到 src/views/tools/ 下，
//    然后在这里加一项 { path, name, title, desc, color, component }
// 重新部署后，工具会自动出现在侧边栏和工具箱首页，全员可见。

export const TOOLS = [
  {
    path: '/tools/high-tech',
    name: 'high-tech',
    title: '企业资质评估助手',
    desc: '高新认定 / 专精特新 / 科技型中小企业评估与申报方案生成（含报告导出）',
    color: '#ba7517',
    url: 'tools/hightech/index.html',
    component: EmbeddedToolView
  }
]
