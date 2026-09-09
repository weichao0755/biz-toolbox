// 工具箱全局 AI 配置：首页统一设置，所有工具共享（iframe 同域，可直接读取 localStorage）
export const AI_CONFIG_KEY = 'biz_toolbox_ai_config'
export const LEGACY_AI_CONFIG_KEY = 'contract_ai_cfg'
// 平台默认 API Key（团队开箱即用；未配置或为空时自动回退到此值）
export const DEFAULT_AI_KEY = '' // 团队 API Key 请在各工具「AI 配置」面板填写，勿硬编码入库

export const AI_PROVIDERS = {
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-v4-flash' },
  silicon:  { name: '硅基流动', baseUrl: 'https://api.siliconflow.cn/v1', model: 'Qwen/Qwen2.5-7B-Instruct' },
  zhipu:    { name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  moonshot: { name: '月之暗面 Moonshot', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  qwen:     { name: '阿里云百炼(通义)', baseUrl: 'https://dashscope.aliyun.com/compatible-mode/v1', model: 'qwen-turbo' },
  tencent:  { name: '腾讯混元', baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1', model: 'hunyuan-lite' },
  baidu:    { name: '百度千帆', baseUrl: 'https://qianfan.baidubce.com/v2', model: 'ernie-speed-128k' },
  ifly:     { name: '讯飞星火', baseUrl: 'https://spark-api-open.xf-yun.com/v1', model: 'spark-lite' },
  volcengine:{ name: '火山引擎方舟', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-seed-2-1-pro-260628' },
    custom:   { name: '自定义（OpenAI 兼容）', baseUrl: '', model: '' }
}

export function loadAiConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY) || localStorage.getItem(LEGACY_AI_CONFIG_KEY) || '{}'
    const cfg = Object.assign({ provider: 'volcengine', key: DEFAULT_AI_KEY, baseUrl: '', model: 'doubao-seed-2-1-pro-260628' }, JSON.parse(raw))
    if (!cfg.key) cfg.key = DEFAULT_AI_KEY
    return cfg
  } catch (e) {
    return { provider: 'volcengine', key: DEFAULT_AI_KEY, baseUrl: '', model: 'doubao-seed-2-1-pro-260628' }
  }
}

export function saveAiConfig(cfg) {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg))
  } catch (e) {
    // ignore
  }
}

export function clearAiConfig() {
  try {
    localStorage.removeItem(AI_CONFIG_KEY)
    localStorage.removeItem(LEGACY_AI_CONFIG_KEY)
  } catch (e) {
    // ignore
  }
}

export function applyProviderPreset(cfg, providerKey) {
  const preset = AI_PROVIDERS[providerKey]
  if (!preset) return cfg
  return {
    ...cfg,
    provider: providerKey,
    baseUrl: preset.baseUrl || cfg.baseUrl,
    model: preset.model || cfg.model
  }
}
