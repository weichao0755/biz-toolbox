// ============ 知识库入口配置 ============
// 每个条目 = 知识库首页的一个入口卡片，点击会新窗口打开对应链接。
// 内容维护在钉钉文档，平台只做入口跳转，无需同步正文。
// 新增/修改知识库：改这个数组即可，然后重新部署。

const svgWrap = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

export const KB_LINKS = [
  {
    name: '转让公司知识库',
    desc: '公司转让业务全流程：新手入门、业务知识、案例库、话术与工具、专家经验',
    color: '#2563eb',
    iconSvg: svgWrap(`
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    `),
    // 转让公司知识库（钉钉知识库首页）
    url: 'https://alidocs.dingtalk.com/i/spaces/l2AmoQwZwQ7Qlzdb/overview',
    hint: '钉钉文档 · 需钉钉账号登录后查看'
  },
  {
    name: '高新企业知识库',
    desc: '高新技术企业认定：评估标准、申报流程、政策解读、案例与话术',
    color: '#1d9e75',
    iconSvg: svgWrap(`
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    `),
    // 高新业务知识库（钉钉知识库首页）
    url: 'https://alidocs.dingtalk.com/i/spaces/l2AmoQ4O8EjQVzdb/overview',
    hint: '钉钉文档 · 需钉钉账号登录后查看'
  }
]
