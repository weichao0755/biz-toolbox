// 访问密码门的纯逻辑（供 LoginGate.vue 和 App.vue 共用）

const LS_KEY = 'biz_toolbox_unlocked'

export function isUnlocked() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    return data.expire > Date.now()
  } catch {
    return false
  }
}

export function lock() {
  localStorage.removeItem(LS_KEY)
}

// SHA-256 哈希（返回 64 位十六进制字符串）
export async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
  let h = ''
  new Uint8Array(buf).forEach(b => h += b.toString(16).padStart(2, '0'))
  return h
}
