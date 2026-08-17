// ============ 平台配置 ============
// 修改后重新部署，全员刷新即可看到新配置

export const SITE = {
  name: '业务工具箱',
  slogan: '知识沉淀 · 工具赋能',
  // 访问密码（SHA-256 哈希）。默认密码: toolbox2026
  // 修改方法：在浏览器控制台执行
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('你的新密码'))
  //     .then(b => { let h=''; new Uint8Array(b).forEach(x=>h+=x.toString(16).padStart(2,'0')); console.log(h) })
  // 然后把得到的 64 位十六进制字符串填到下面
  passwordHash: '8b1afc04ff58781cc7e0c38e771489dc1f9de535e3acb3f901075c823f69d093',
  unlockDays: 7 // 解锁有效期（天）
}

// 知识库索引文件路径（相对站点根目录）
export const DOCS_INDEX = './docs/index.json'
