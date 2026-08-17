import MarkdownIt from 'markdown-it'

export const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false
})

// 给表格加 class，方便样式
const defaultFence = md.renderer.rules.fence || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.table_open = function () {
  return '<table class="md-table">'
}

export default md
