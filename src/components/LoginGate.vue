<template>
  <div class="gate">
    <div class="gate-card">
      <div class="gate-logo">箱</div>
      <h1>{{ SITE.name }}</h1>
      <p class="gate-slogan">{{ SITE.slogan }}</p>
      <input v-model="pw" type="password" placeholder="请输入访问密码"
        @keyup.enter="submit" autofocus />
      <p v-if="err" class="gate-err">{{ err }}</p>
      <button :disabled="checking" @click="submit" style="width:100%;margin-top:6px">
        {{ checking ? '验证中…' : '进入平台' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SITE } from '../config'
import { isUnlocked, lock, hashPassword } from '../utils/auth'

const pw = ref('')
const err = ref('')
const checking = ref(false)

async function submit() {
  if (!pw.value) return
  checking.value = true
  err.value = ''
  try {
    const h = await hashPassword(pw.value)
    if (h === SITE.passwordHash) {
      localStorage.setItem('biz_toolbox_unlocked', JSON.stringify({
        expire: Date.now() + SITE.unlockDays * 24 * 3600 * 1000
      }))
      window.location.reload()
    } else {
      err.value = '密码不正确，请重试'
      pw.value = ''
    }
  } finally {
    checking.value = false
  }
}
</script>

<style scoped>
.gate {
  height: 100%; display: flex; align-items: center; justify-content: center;
  background: var(--bg);
}
.gate-card {
  width: 340px; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 36px 32px;
  text-align: center;
}
.gate-logo {
  width: 56px; height: 56px; margin: 0 auto 14px; border-radius: 14px;
  background: var(--accent); color: #fff; font-size: 28px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.gate-card h1 { font-size: 20px; margin-bottom: 4px; }
.gate-slogan { color: var(--text-2); font-size: 13px; margin-bottom: 20px; }
.gate-err { color: var(--red); font-size: 13px; margin: 8px 0; }
</style>
