import EmbeddedToolView from '../views/tools/EmbeddedToolView.vue'

// ============ 工具分类 ============
// 工具箱首页与侧边栏均按此分类分组展示。新增工具时：
// 1. 在 TOOLS 里加一项并填好 category（对应下面的 key）
// 2. 无需手动改页面，分组会自动按 CATEGORIES 顺序生成
export const CATEGORIES = [
  { key: 'manage', label: '管理类', desc: '团队经验沉淀与案例档案归集', color: '#7c3aed' },
  { key: 'hightech', label: '高新类', desc: '高新技术企业认定与资质评估', color: '#0891b2' },
  { key: 'transfer', label: '转让类', desc: '公司转让业务的合同与尽职调查', color: '#2563eb' },
  { key: 'qual', label: '资质类', desc: '建筑工程资质办理与查询', color: '#16a34a' },
  { key: 'sales', label: '销售类', desc: '报价与收款测算', color: '#ea580c' },
  { key: 'efficiency', label: '效率类', desc: '个人待办与效率工具', color: '#5f3dc4' }
]

// ============ 工具注册表 ============
// 新增工具两种方式：
// 1. 外部单文件工具（推荐）：把你的工具 HTML 放到 public/tools/<名字>/index.html，
//    然后在这里加一项 { path, name, title, desc, color, category, url, component: EmbeddedToolView }
//    例如：url: '/tools/<名字>/index.html'
// 2. 定制开发工具：写一个组件放到 src/views/tools/ 下，
//    然后在这里加一项 { path, name, title, desc, color, category, component }
// 重新部署后，工具会自动出现在侧边栏和工具箱首页，全员可见。

// 内嵌 SVG 公共参数：fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
const svgWrap = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

export const TOOLS = [
  {
    path: '/tools/sales-cases',
    name: 'sales-cases',
    title: '销售优秀成交案例归集',
    desc: '沉淀团队标杆成交案例：痛点/打法/话术/金额/周期一键归档，支持检索与 Word、列表图片导出',
    color: '#7c3aed',
    category: 'manage',
    iconSvg: svgWrap(`
      <polygon points="12 2 15 9 22 9 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9 9 9"/>
    `),
    url: 'tools/sales-cases/index.html',
    component: EmbeddedToolView
  },
  {
    path: '/tools/high-tech',
    name: 'high-tech',
    title: '企业资质评估助手',
    desc: '高新认定 / 专精特新 / 科技型中小企业评估与申报方案生成（含报告导出）',
    color: '#0891b2',
    category: 'hightech',
    iconSvg: svgWrap(`
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M9 14l1.5 1.5L14 12"/>
      <line x1="8" y1="18" x2="13" y2="18"/>
    `),
    url: 'tools/hightech/index.html',
    component: EmbeddedToolView
  },
  {
    path: '/tools/due-diligence',
    name: 'due-diligence',
    title: '企业尽调报告生成器',
    desc: '引导式填写尽调信息，一键生成正式且排版精美的企业尽职调查报告（Word）',
    color: '#2563eb',
    category: 'transfer',
    iconSvg: svgWrap(`
      <path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/>
      <polyline points="14 2 14 8 20 8"/>
      <circle cx="16" cy="16" r="4"/>
      <line x1="19.2" y1="19.2" x2="22" y2="22"/>
    `),
    url: 'tools/due-diligence/index.html',
    component: EmbeddedToolView
  },
  {
    path: '/tools/contract',
    name: 'contract',
    title: '合同生成助手',
    desc: '收购公司合同（面向同行渠道/面向客户）：选择场景、一键填入默认信息、分期付款与补充协议，生成成品合同（Word）',
    color: '#3b82f6',
    category: 'transfer',
    iconSvg: svgWrap(`
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M8.5 13.5l2 2 5-5"/>
      <line x1="8" y1="18" x2="14" y2="18"/>
    `),
    url: 'tools/contract/index.html',
    component: EmbeddedToolView
  },
  {
    path: '/tools/qualification',
    name: 'qualification',
    title: '建筑工程资质办理查询助手',
    desc: '选城市+选资质，查可办性/办理条件/流程/卡点，联网验证最新政策；无数据自动录入，支持团队共享库贡献',
    color: '#16a34a',
    category: 'qual',
    iconSvg: svgWrap(`
      <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"/>
      <line x1="9" y1="11" x2="9" y2="21"/>
      <line x1="15" y1="11" x2="15" y2="21"/>
      <line x1="12" y1="11" x2="12" y2="21"/>
      <path d="M16.5 15.5l1.2 1.2 2.3-2.3" stroke-width="2.4"/>
    `),
    url: 'tools/qualification/index.html',
    component: EmbeddedToolView,
    newTab: true // 工具内容长、交互多，平台内点击/路由访问一律新窗口打开独立页，不 iframe 内嵌
  },
  {
    path: '/tools/quote',
    name: 'quote',
    title: '快速报价单生成器',
    desc: '填三步出正式报价单（Word）：客户信息+服务项目多选（价目库可管）+折扣条款，统一全员报价口径',
    color: '#ea580c',
    category: 'sales',
    iconSvg: svgWrap(`
      <path d="M20.6 13.4L13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/>
      <circle cx="7" cy="7" r="1.4" fill="currentColor" stroke="none"/>
      <line x1="11" y1="13" x2="15" y2="17"/>
    `),
    url: 'tools/quote/index.html',
    component: EmbeddedToolView
  },
  {
    path: '/tools/installment',
    name: 'installment',
    title: '分期收款支出测算器',
    desc: '按阶段归并收款与支出两条计划，逐节点核对累计现金流，确保收款始终≥支出并定位利润到账节点',
    color: '#f97316',
    category: 'sales',
    iconSvg: svgWrap(`
      <polyline points="3 17 9 11 13 15 21 7"/>
      <polyline points="14 7 21 7 21 14"/>
      <circle cx="3" cy="17" r="1.4" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none"/>
      <circle cx="13" cy="15" r="1.4" fill="currentColor" stroke="none"/>
    `),
    url: 'tools/installment/index.html',
    component: EmbeddedToolView
  },
  {
    path: '/tools/demand-form',
    name: 'demand-form',
    title: '需求确认单生成器',
    desc: '销售录入收购目的/年限/行业/城市/经营范围/注册资金/预算/其他需求八项，一键生成精美需求确认单图片，可直接发客户，支持保存历史复用',
    color: '#ea580c',
    category: 'sales',
    iconSvg: svgWrap(`
      <path d="M9 3h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2V4a1 1 0 0 1 1-1z"/>
      <path d="M9.5 12.5l1.8 1.8 3.7-3.8"/>
    `),
    url: 'tools/demand-form/index.html',
    component: EmbeddedToolView
  },
  {
    path: '/tools/todo',
    name: 'todo',
    title: '待办事项清单',
    desc: '清单分组、标签、子任务、优先级与重复提醒，支持日历视图，个人待办随手记、到期不遗漏',
    color: '#5f3dc4',
    category: 'efficiency',
    iconSvg: svgWrap(`
      <rect x="3" y="4" width="18" height="18" rx="3"/>
      <line x1="8" y1="9" x2="16" y2="9"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    `),
    url: 'tools/todo/index.html',
    component: EmbeddedToolView,
    newTab: true // 待办工具新窗口打开，与首页「进入待办」摘要卡片行为保持一致
  },
  {
    path: '/tools/huashu',
    name: 'huashu',
    title: '话术快捷回复',
    desc: '销售话术库：分类管理、拼音首字母/关键词秒搜、变量自动替换、一键复制粘贴到微信/QQ',
    color: '#f59e0b',
    category: 'sales',
    iconSvg: svgWrap(`
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"/>
      <line x1="9" y1="10" x2="16" y2="10"/>
      <line x1="9" y1="14" x2="13" y2="14"/>
    `),
    url: 'tools/huashu/index.html',
    component: EmbeddedToolView,
    newTab: true // 高频复制粘贴、需常驻配合微信，独立标签页打开体验更好、剪贴板权限完整
  }
]
