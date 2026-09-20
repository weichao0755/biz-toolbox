<template>
  <div class="tool-page">
    <div class="page-head">
      <h2>{{ tool.title }}</h2>
      <p class="page-desc">{{ tool.desc }}</p>
    </div>
    <div class="embed-card">
      <iframe
        ref="frame"
        :src="tool.url"
        class="embed-frame"
        :style="{ height: frameHeight + 'px' }"
        frameborder="0"
        allowfullscreen
        @load="fitHeight"
      ></iframe>
      <div v-if="loading" class="embed-loading">工具加载中…</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmbeddedToolView',
  props: {
    tool: { type: Object, required: true }
  },
  data() {
    return {
      frameHeight: 720,
      loading: true,
      timer: null
    }
  },
  mounted() {
    // 工具内部是步骤式交互，切换标签/展开内容会改变高度，
    // 周期性检测并自动适配 iframe 高度，避免出现双滚动条。
    this.timer = setInterval(() => this.fitHeight(), 800)
    // 工具主动上报内容高度（生成方案等动态内容后立即通知），优先采用，避免轮询时差导致内容不可滚动。
    this._onResizeMsg = (e) => {
      try {
        const d = e.data
        if (d && d.type === 'tool-resize' && typeof d.height === 'number') {
          this.frameHeight = Math.max(200, Math.round(d.height))
          this.loading = false
        }
      } catch (_) {}
    }
    window.addEventListener('message', this._onResizeMsg)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
    if (this._onResizeMsg) window.removeEventListener('message', this._onResizeMsg)
  },
  methods: {
    fitHeight() {
      try {
        const doc = this.$refs.frame && this.$refs.frame.contentDocument
        if (doc && doc.documentElement) {
          const h = Math.max(
            doc.documentElement.scrollHeight || 0,
            doc.body ? doc.body.scrollHeight || 0 : 0
          )
          if (h > 200) {
            this.frameHeight = h + 24
            this.loading = false
          }
        }
      } catch (e) {
        // 跨域等异常时保持默认高度
      }
    }
  }
}
</script>

<style scoped>
.tool-page {
  max-width: 1100px;
  margin: 0 auto;
}
.page-head {
  margin-bottom: 16px;
}
.page-head h2 {
  font-size: 20px;
  color: var(--text);
  margin: 0 0 6px;
}
.page-desc {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}
.embed-card {
  position: relative;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.embed-frame {
  display: block;
  width: 100%;
  border: none;
  background: #fff;
}
.embed-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 14px;
  background: var(--card);
  transition: opacity .3s;
  pointer-events: none;
}
</style>
