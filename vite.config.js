import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 构建前 dist 需用 find -delete 手动清理（WorkBuddy 安全删除机制会拦截 Vite 的 rmSync 清空）
    emptyOutDir: false
  },
  server: {
    port: 5173,
    host: true
  }
})
