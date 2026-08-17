// ============ 知识库入口配置 ============
// 每个条目 = 知识库首页的一个入口卡片，点击会新窗口打开对应链接。
// 内容维护在钉钉文档，平台只做入口跳转，无需同步正文。
// 新增/修改知识库：改这个数组即可，然后重新部署。

export const KB_LINKS = [
  {
    name: '转让公司知识库',
    desc: '公司转让业务全流程：新手入门、业务知识、案例库、话术与工具、专家经验',
    color: '#2563eb',
    icon: '转',
    // TODO: 替换为你的钉钉知识库首页链接（在钉钉文档里打开知识库，复制浏览器地址栏 URL）
    url: 'https://alidocs.dingtalk.com/i/nodes/REPLACE_ME_TRANSFER',
    hint: '钉钉文档 · 需钉钉账号登录后查看'
  },
  {
    name: '高新企业知识库',
    desc: '高新技术企业认定：评估标准、申报流程、政策解读、案例与话术',
    color: '#1d9e75',
    icon: '高',
    // TODO: 替换为你的钉钉知识库首页链接
    url: 'https://alidocs.dingtalk.com/i/nodes/REPLACE_ME_HITECH',
    hint: '钉钉文档 · 需钉钉账号登录后查看'
  }
]
