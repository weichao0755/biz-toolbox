<template>
  <div class="page">
    <div class="hero card">
      <h1 class="page-title">欢迎使用金米财税业务辅助平台</h1>
      <p class="page-sub">公司转让业务的知识沉淀与效率工具平台，新人快速上手，老手持续沉淀。</p>
      <div class="hero-actions">
        <RouterLink to="/knowledge"><button>进入知识库</button></RouterLink>
        <RouterLink to="/tools"><button class="secondary">打开工具箱</button></RouterLink>
        <a href="https://operate-workbench-admin.jinmicaishui.com/#/crm/home/workbench" target="_blank" rel="noopener"><button class="secondary">CRM管理系统</button></a>
        <a href="tools/lead-table/index.html" target="_blank" rel="noopener"><button class="secondary">意向客户表格</button></a>
      </div>
    </div>

    <div class="top-row">
      <a href="tools/todo/index.html" target="_blank" rel="noopener" class="card todo-panel">
        <div class="todo-head">
          <div class="todo-title">
            <div class="todo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3"/>
                <line x1="8" y1="9" x2="16" y2="9"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="13" y2="17"/>
              </svg>
            </div>
            <div>
              <h3>待办事项清单</h3>
              <p>进入平台先看看今天要处理什么</p>
            </div>
          </div>
          <span class="todo-enter">进入待办 ›</span>
        </div>
        <div class="todo-stats">
          <div class="tstat"><span class="num" :class="{ warn: overdueCount > 0 }">{{ openCount }}</span><span class="lbl">待处理</span></div>
          <div class="tstat"><span class="num today">{{ todayCount }}</span><span class="lbl">今日到期</span></div>
          <div class="tstat"><span class="num overdue" :class="{ warn: overdueCount > 0 }">{{ overdueCount }}</span><span class="lbl">已逾期</span></div>
        </div>
        <div class="todo-preview" v-if="previewTodos.length">
          <div class="todo-row" v-for="t in previewTodos" :key="t.id">
            <span class="p-dot" :class="'p-' + (t.priority || 'med')"></span>
            <span class="p-title" :class="{ 'is-due': isToday(t.due) }">{{ t.title }}</span>
            <span class="p-due" v-if="t.due">{{ dueLabel(t.due) }}</span>
          </div>
          <div class="todo-more" v-if="openCount > previewTodos.length">还有 {{ openCount - previewTodos.length }} 项…</div>
        </div>
        <div class="todo-empty" v-else>暂无待办，点这里去添加一条</div>
      </a>

      <div class="grid grid-side">
        <RouterLink to="/knowledge" class="entry card">
          <div class="entry-icon" style="background:linear-gradient(135deg,#e0901a,#b45309)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <line x1="9" y1="7" x2="15" y2="7"/>
              <line x1="9" y1="11" x2="15" y2="11"/>
            </svg>
          </div>
          <div>
            <h3>知识库</h3>
            <p>新手入门、业务知识、案例库、话术工具、专家经验，五大模块持续沉淀。</p>
          </div>
        </RouterLink>
        <RouterLink to="/tools" class="entry card">
          <div class="entry-icon" style="background:linear-gradient(135deg,#f59e0b,#ea580c)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="badge">
              <circle cx="18" cy="18" r="3.2"/>
              <path d="M18 14.8V13M18 23v-1.8M21.2 18H23M14.8 18H13M20.4 15.6l1.3-1.3M15.6 20.4l-1.3 1.3M20.4 20.4l1.3 1.3M15.6 15.6l-1.3-1.3"/>
            </svg>
          </div>
          <div>
            <h3>工具箱</h3>
            <p>高新申请方案生成器等业务工具，输入数据即出结果，持续新增。</p>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- 本地文件夹同步 -->
    <div class="card data-mgmt vault-card">
      <div class="data-head">
        <div class="data-icon" style="background:linear-gradient(135deg,#e0901a,#b45309)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <path d="M8 13h8M8 16.5h5"/>
          </svg>
        </div>
        <div>
          <h3>本地文件夹同步<span class="vault-state" :class="vaultStateClass">● {{ vaultStateText }}</span></h3>
          <p v-if="vault.supported">
            指定一个本机文件夹，平台的所有设定与工具记录会<b>自动</b>存进去（不再受浏览器 5MB 上限限制）。
            换电脑或重装后，选择同一个文件夹即可<b>自动恢复</b>全部数据。
          </p>
          <p v-else class="unsupported">
            ⚠ 检测到当前浏览器<b>不支持</b>本地文件夹自动同步（仅 Chrome / Edge 等 Chromium 内核可用）。
            请改用下方「备份数据 / 恢复数据」手动导出导入，效果相同。
          </p>
        </div>
      </div>

      <div v-if="vault.supported" class="vault-body">
        <div class="vault-info">
          <div class="vault-row">
            <span class="k">存储文件夹</span>
            <span class="v">{{ vault.bound ? vault.folderName : '尚未选择' }}</span>
          </div>
          <div class="vault-row">
            <span class="k">最近同步</span>
            <span class="v">{{ vault.lastSyncAt ? formatAgo(vault.lastSyncAt) : '尚未同步' }}</span>
          </div>
        </div>

        <div class="data-actions">
          <button v-if="!vault.bound" class="primary" :disabled="working" @click="onChooseFolder">
            📁 选择存储位置
          </button>
          <template v-else>
            <button v-if="vault.needReconnect" class="primary" :disabled="working" @click="onReconnect">
              🔌 恢复连接
            </button>
            <button class="primary" :disabled="working || vault.syncing" @click="onLoadData()">
              ⬆ 加载数据
            </button>
            <button class="secondary" :disabled="working || vault.syncing" @click="onSyncNow">
              {{ vault.syncing ? '同步中…' : '⟳ 立即同步' }}
            </button>
            <button class="secondary" @click="onChooseFolder">⇄ 更换文件夹</button>
            <button class="secondary" @click="onToggleHistory">
              {{ showHistory ? '▴ 收起历史版本' : '▾ 历史版本' + (vault.backups.length ? `（${vault.backups.length}）` : '') }}
            </button>
            <button class="secondary danger-text" @click="onDisconnect">断开</button>
          </template>
        </div>

        <p v-if="vault.bound && vault.needReconnect" class="vault-tip warn-tip">
          浏览器关闭后会自动收回文件夹授权，这是安全机制。点一次「恢复连接」即可继续自动同步，不需要重新选文件夹。
        </p>

        <div v-if="showHistory && vault.bound" class="vault-history">
          <div class="vh-head">保留最近 {{ Math.min(vault.backups.length, 5) }} 份历史版本，误覆盖时可回滚</div>
          <div v-if="!vault.backups.length" class="vh-empty">暂无历史版本。数据变化超过一定量或间隔后会自动生成。</div>
          <div v-else class="vh-list">
            <div v-for="b in vault.backups" :key="b.name" class="vh-item">
              <div class="vh-meta">
                <span class="vh-time">{{ formatTs(b.at) }}</span>
                <span class="vh-size">{{ formatSize(b.size) }}</span>
              </div>
              <button class="vh-load" @click="onLoadData(b.name)">恢复此版本</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card data-mgmt">
      <div class="data-head">
        <div class="data-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            <polyline points="12 13 12 18"/>
            <polyline points="9 15.5 12 18 15 15.5"/>
          </svg>
        </div>
        <div>
          <h3>数据备份与恢复</h3>
          <p>所有工具填写的数据都存在本机浏览器中（不会上传）。建议定期「备份数据」下载保存；更新功能、更换电脑或误清缓存后，用「恢复数据」一键找回全部内容。</p>
        </div>
      </div>
      <div class="data-actions">
        <button class="primary" @click="backupData">⬇ 备份数据</button>
        <button class="secondary" @click="pickFile">⬆ 恢复数据</button>
        <input ref="fileInput" type="file" accept=".json,application/json" class="hidden-file" @change="onFileChange">
        <span v-if="dataStatus" class="data-status" :class="dataStatusType">{{ dataStatus }}</span>
      </div>
    </div>

    <div class="card update-note">
      <h3>内容更新说明</h3>
      <p>平台为静态站点部署，更新流程：内容/工具更新 → 重新部署 → 全员刷新即可看到最新版本（推荐 Ctrl+F5 强制刷新）。需要更新内容时，联系管理员即可。</p>
      <p class="ver-line">当前版本 {{ APP_VERSION }} · 更新于 2026-10-28</p>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BACKUP_KEYS } from '../data/backupKeys'
import {
  vault, chooseFolder, reconnect, syncNow, loadFromFolder,
  refreshBackups, disconnect, initVault, formatAgo, formatSize, formatTs
} from '../utils/localVault'

/* 待办模块：从 localStorage 读取待办数据，展示待处理/今日到期/已逾期统计 + 前几条预览 */
const todoData = ref([])

function loadTodos() {
  try {
    const v = JSON.parse(localStorage.getItem('todo_v1') || '[]')
    todoData.value = Array.isArray(v) ? v : []
  } catch (e) {
    todoData.value = []
  }
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const openTodos = computed(() => todoData.value.filter(t => !t.done))
const openCount = computed(() => openTodos.value.length)
const todayCount = computed(() => openTodos.value.filter(t => t.due === todayStr()).length)
const overdueCount = computed(() => openTodos.value.filter(t => t.due && t.due < todayStr()).length)

// 预览列表：按优先级 + 到期日排序，取前 3 条
const pRank = { high: 0, med: 1, low: 2 }
const previewTodos = computed(() => {
  return openTodos.value.slice().sort((a, b) => {
    const pa = pRank[a.priority] ?? 1, pb = pRank[b.priority] ?? 1
    if (pa !== pb) return pa - pb
    if (a.due && b.due) return a.due.localeCompare(b.due)
    if (a.due) return -1
    if (b.due) return 1
    return (b.createdAt || 0) - (a.createdAt || 0)
  }).slice(0, 3)
})

function isToday(due) { return due === todayStr() }
function dueLabel(due) {
  if (due === todayStr()) return '今天'
  const [y, m, d] = due.split('-').map(Number)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dd = new Date(y, m - 1, d)
  const diff = Math.round((dd - today) / 86400000)
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff < -1) return `逾期 ${-diff} 天`
  return `${m}月${d}日`
}

onMounted(loadTodos)

/* 全部数据 key 统一来自 src/data/backupKeys.js（新增工具的 key 记得登记） */
const APP_VERSION = 'v1.19.12' /* 2026-10-28 cross-quote 明细表渲染「第三次」修正（终版）：v1.19.11 的 inline-block + white-space:nowrap 方案误判为正常，实则 white-space 可继承、传到单元格内关闭了换行，导致服务内容/服务项目/金额文字不换行、横向溢出到邻列（看似被裁）。本版直接复用「快速报价单生成器(quote)」已验证可用的 flex 写法：.qt/.qt-sum 用 display:flex + align-items:stretch（同行自动等高），.c 用 display:flex+flex:0 0 auto+flex-basis 固定宽 + overflow:hidden 防溢出，单元格内文字正常换行（绝不写 white-space:nowrap）；列宽 50/120/245/50/50/82/85=682、inc 合并 167、合计 515+167 与 quote 同口径。移除 inline-block 时代补丁 fixRowHeights()。v1.19.11=inline-block 误修（撤销）；v1.19.10=2026-10-28 跨境报价单明细表布局修复（flex→display:table 解决导出图裁切/空白条）+ 意向客户表格新增「创建日期」可见列（表头+数据行 date-only+展开详情，colspan 8→9，排序「创建时间」与 CSV/Excel「创建时间」列原本已存在并自动对齐）；v1.19.9=2026-10-28 意向客户表格「客户来源」新增「激活」选项（SOURCES 数组追加，过滤下拉/新建表单/按来源统计/导出同步生效）；v1.19.8=2026-10-28 cross-paper 销冠档强化：① 客观题全抽 hard（新增 7 单选+3 多选 hard 题，pickByTier 销冠档改取全部 hard、不足才回退 medium），销冠卷真正“最难” ② 方案题加真实经营数据并要求测算——销冠档客户注入年销售额/人数/无票比例/历史少报/逾期月数，答案用 cross 的 taxCalc/histTaxCalc 算出增值税、企税、综合税负率（现状 vs 合规后双口径）及历史滞纳金(日万分之五)+罚款(0.5~5倍)区间；老人档轻量测算综合税负率；新人档保持方向性。v1.19.7=2026-10-28 cross-paper 考核试卷按三档拆分（新人 / 老人 / 销冠），难度递增：每题加 lv（easy/medium/hard）并按档位优先抽题（新人全 easy、老人 medium 为主、销冠 hard 优先），方案题客户模型三套（bEasyClient/bGenClient/bHardClient）复杂度递增，销冠方案题为「销冠复杂型」原型（平台代报/全托管 + 外地 + 一般纳税人 + 刚收短信历史缺口）并加 CHAMP_EXTRA 附加考核点（量化历史滞纳金/罚款、多主体搭建、不可承诺 100% 免税）；v1.19.6=2026-10-27 cross-paper 归入管理类（category cross→manage、配色对齐管理紫 #7c3aed），便于主管考核销售顾问；v1.19.5=2026-10-27 新增「跨境电商考核试卷生成器」工具（管理类 cross-paper）：从 cross 题库 + 公司《客户标准问答库》扩展题库随机生成 100 分制考核卷，四题型（单选 10×2 / 多选 5×3 / 填空 5×5 / 方案 2×20、共 22 题）知识点互不冲撞，方案题客户模型内部自洽（杜绝“亚马逊 + 平台物流”这类冲突组合）；预览满意后一键导出 Word 试卷与参考答案（复用 docx.umd.js）。v1.19.4=2026-10-27 新增「跨境电商考核题库」工具（跨境类 cross-quiz）：从 cross 工具已下线板块拆出的独立训练工具，212 道（194 通用 + 18 合规红线），学习浏览 + 随机抽卷自测（新人/进阶/主管三卷）、判分（≥80% 且红线全对为合格）、薄弱点分析与重做错题；存储 key cross_quiz_v1 已登记 backupKeys 白名单。v1.19.3=2026-10-27 意向客户表格：「意向类型」改名「业务类型」，下拉选项改为 星级账 / 基础工商 / 基础代账 / 推荐业务 / 其他（原为 收购公司 / 资质办理 / 转让标的 / 注册公司 / 代账 / 其他）；同步改列表表头、表单字段标签、统计分组标题「按业务类型」与 Excel/CSV 导出表头。**附带数据安全修复**：新建/编辑弹窗渲染下拉时，若客户已有的值不在当前选项里（如历史的「收购公司」），会把该历史值作为首项保留并选中，避免编辑保存时被静默改成第一项（此保护对所有下拉字段生效：业务类型 / 客户来源 / 意向等级 / 跟进状态）。v1.19.2=跨境电商报价单：单价设为 0 的服务项，输出表格中「单价（元）」与「金额（元）」两栏自动合并为一格并写「【包含服务】」（用于已包含在套餐里、不单独计价的项目）。新增判定 `isIncluded(it)`（非赠送且单价 ≤ 0），三处同步：① 图片卡片（750px）该行由 7 格变 6 格，合并格宽度 82+85=167px，样式 `.qt .c.inc`（浅金底+橙字加粗）② Word 表格该行末两列用 `columnSpan:2` 合并，浅金底橙字居中 ③ 第②步选择列表的「金额」列显示【包含服务】徽标（`.inc-tag`，与「赠送」徽标区分）；实时改单价时也同步刷新。赠送项逻辑不变（仍显示「赠送」，不计入应付但计入优惠）。v1.19.1=① 6888 / 10888 / 14888 三档的服务内容不再写「服务内容同 4888 档」，改为与 4888 档同样完整的表述（含进出口权资质办理、平台明细账与资料归集、出口资质备案与 13 栏操作申请、月度数据核对与专属跨境会计对接）② 原先 12 项单价 0 元（列表显示「面议」）的服务项，默认价改为 1000 元（出口资质与备案 4 项、报关与申报落地 3 项、账务与成本 3 项、增值服务 2 项）；套餐档位价（4888/6888/10888/14888/16888）与历史补账价（小规模 400 元/季度、一般人 900 元/季度）保持不变。配套：价目库 key 升到 cross_quote_lib_v2（否则本机已存的旧价目库不会刷新默认值），价目库弹窗新增「↺ 恢复默认价目库」按钮（可随时重置，需再点保存才生效），自定义新增服务的默认单价同步改为 1000。v1.19.0=新增「跨境电商报价单生成器」（跨境类，public/tools/cross-quote/index.html）：仿「快速报价单生成器」的三步流程与双格式输出（750px 微信图片卡片 + Word），做跨境专属改造——① 第①步增加「跨境业务盘面」八项（主营平台 / 站点数量 / 合计年流水 / 纳税人身份 / 报关模式 9810·9610·0110·1039·待转合规 / 注册城市 深圳·外地 / 进出口权 / 历史遗留）② 第②步按「纳税人身份 + 年流水（+站点数）」自动推荐星级账套餐档位（小规模 ≤300万→4888、≤500万→6888；一般人 ≤700万→10888、≤1000万→14888、2~4站点13888/5站点以上16888；超 1000 万不硬套、提示走定制），可一键勾选 ③ 跨境专属价目库 19 项（价格全部取自公司《跨境电商SOP流程梳理》与《客户标准问答库》，不自定价格）：年度星级账套餐、出口资质与备案（进出口权 / 跨境电商企业备案 / 电子口岸IC卡 / 免税备案13栏）、报关与申报落地（9810 全流程指导含订单号·无纸化·推单·授权代理、9610 报关清单核实、按期免税申报）、账务与成本（按站点明细账 / 供应商发票规划普票1~3%专票8~10% / 人力与年终奖3.6万个税规划）、历史遗留（小规模400元/季度、一般人900元/季度）、增值（网商银行收汇通道 / 多主体架构咨询）④ 图片卡片与 Word 均增加「客户跨境业务盘面」区块，Word 末尾附公司口径「合规边界」条款（免税须以本公司抬头报关单或经核实的报关清单为依据、深圳13栏默认开通外地须先有报关单、不承诺不被查/一定免税）⑤ 独立存储 key（cross_quote_data_v1 / records / lib / ai_config），已同步登记 backupKeys 白名单。v1.18.7=①**痛点推导重构**：痛点可以有多个，但必须有且只有一个最痛的，格式为「一、痛点：1.核心痛点 2.其他痛点（1.2.3 延伸/次要）」＋「二、侧重打法」＋「三、推导过程（折叠）」。核心痛点口径＝**合规的目的是避免被税局查导致进一步损失**，所以核心痛点必须落在「被查之后的损失」上并把损失放大（补税 + 滞纳金按日万分之五 + 罚款 0.5~5 倍 + 被查期间生意受影响），必须带数字，禁止"有风险"这类空话；其他痛点只能写由核心带出来或客户已暴露的延伸/次要问题，不写依据不写解法。提示词标记由【结论】改【痛点】，`aiPainSplit()` 拆出 core/others[]/play/derive，渲染为高亮 `.aip-core` 核心块 + 编号 `.aip-li` 其他痛点列表；AI 不按格式写时整段兜底当核心，不丢内容 ②**删除方案落地话术最后一栏「挂电话前，最后这几句」**（`planTalkHTML` 里的收尾 tl2Card），原挂在该栏的 blk6 收尾异议改挂到最后一步（`askSlot` 中 `blk6` 由返回 n 改为 `Math.max(0,n-1)`），避免内容静默丢失。v1.18.6=① 痛点推导改为**随方案自动生成**（不再单独点按钮）——新增 `aiRunPlanAndPain()` 串起 plan 与 pain，`aiStartPlan()` 改 async 并在 AIPLAN 已存在时只补跑 pain，两者都生成过才跳过（不重复烧 token）；方案页「按这个客户生成这 5 项」按钮同步改为联动 ② 痛点推导输出拆三块：`【结论】`痛点结论（3~5 条一句话，不写依据）、`【打法】`侧重打法（3~4 条，格式「放大什么 → 怎么戳」，明确销售该放大什么）、`【推导】`推导过程（分「他已经说出来的」与「推出来的」，每条「痛点 → 依据」，末尾给切入顺序）。新增 `AIPAIN` 缓存、`aiPainSplit()` / `aiPainPaint()` 流式解析填充；推导过程用 `<details>` **默认折叠**，点开才看依据；新增 `.aip-sub / .aip-pbox / .aip-der / .aip-derbody` 样式 ③ 税负速算②「历史问题账目」改口径：企税走**明细账**（销售额 − 能录入的平台成本 − 能录入的采购成本 − 人力），**不按核定率折算**；平台成本与采购成本改为**手动录入金额**的输入框（`hxPlatCost` / `hxPurchCost`，万元），删掉原「核定率」输入框与两套企税口径行；罚款按**不合规的全额税款**（增值税 + 企业所得税）的 0.5~5 倍估算。v1.18.5=① 沟通台客户信息表底部新增「补充信息」多行输入框（`tkNoteBoxHTML` / `TK.note`，写结构化问题没覆盖到的现场线索：谁拍板、有无戒心、现金流顾虑、时间要求等），内容进客户记录「八、补充信息」，并作为 AI 输入 ② 方案页「方案结论」下方新增 AI 板块「痛点推导」（`AI_SECS` 新增 k:'pain'、`painAIHTML` 渲染、`#aiout-pain` 输出），推理来源三处＝【事实】客户信息 +【客户问过的问题】+【补充信息】，由 AI 分两组推导——「他已经说出来的痛点」(从提问反推：问价格=预算敏感、问会不会被查=风险焦虑)与「推出来的痛点」(从数据推导：按回款申报有差额且滞纳金按日万分之五、名下无报关单则免税退税都不成立)，每条固定「痛点 → 依据 → 开场怎么戳」，末尾给「切入顺序」；提示词强制依据必须来自上述三处、不得编造、不确定写「这个要核实」。新增 `.aiout` 输出样式（pre-wrap 保留换行）。v1.18.4=读取桌面《跨境电商物料(2)》29 份 docx 建成语料库，把《跨境电商客户标准问答库_新人版》30 条（可直接对客户说 + 下一步动作 + 禁止承诺 三段式）注入 FAQ_LIB，FAQ 从 72 条扩到 89 条、新增「八 新人标准问答库」4 个子类（17 条新增 + 13 条既有条目补齐三段式结构）；并按公司标准口径修正三处冲突——①「清单汇总报关单」公司语料 0 命中，改回有出处的「报关清单」（9610 向物流/平台索取后核实能否免税）②税点改问答库口径：普票 1~3%、专票 8~10%（原误写 3~4 / 8~13）③报关费改问答库口径：市场行情 80~300 元/票、我司合作货代 80 元/票、小麦云 5~8 元/票，并补小麦云真实功能（系统可全程做订单号生成与推单流程操作）。v1.18.3=京腔治理 + 语料去自造（FULL_TALK / roadmap / 卡点分支）里的北方口语与京腔（咱、咱们、咱俩、这俩、好多人、活儿、干脆、往回圆、顺不顺等），改中性标准普通话；删除全部查无出处的自造时限（公司 FAQ 全库「工作日」0 条，唯一可依据的是「整理旧账约一周」「付款当天安排对接」），7 处步骤 time + 4 处对照表 per + 3 处话术改为「以主管部门实际出件为准 / 以资料齐全为准 / 整理旧账一般一周左右」；删掉自造的「首票试单」残留与「一半概率要不到」概率表述；AISYS 新增铁律 12（语体必须中性标准普通话，禁北方方言与儿化音，附改写对照）与铁律 13（语料只能来自首资话术与公司 FAQ，禁自造时限 / 概率 / 步骤名，不确定就写「这个要核实」）。v1.18.2=9810 预退税口径纠偏（离境即退税），但公司不建议——流程复杂、目前暂无退税到账案例，建议走常规免税流程；落地话术 / 沟通台话术 / 名词速查 yutui / 对照表 trap / 练习题同步改写，AI【事实】+ 铁律 11(3) + 「跟他说」指令同步。v1.18.1=跨境工具方案表述再对标咨询师-客户对话话术实录：第一步先问进出口权再给动作链；9810 四动作补报关费行情 80~200 元/票（对比平台一票 8 元）；成本归位列平台费 40~60%(高 70%)→进项票 10~30%→成本约 70%→税务利润 10~20%；AISYS 铁律追加行情对比与推进方式，AI「跟他说」注入首资说话顺序。v1.18.0=人力成本口径修正：5000 元是月薪，人力成本按年度计 = 6 万/人/年（原误按 0.5 万/人一次性计入），三个计算处同步修正（税负速算①②+方案引擎 taxModel），AI 事实卡公式同步；另统一「月薪 5000 以内不产生个税」的个税起征点表述，避免与人力成本混淆；v1.17.9=2026-10-26 跨境工具税负速算「平台费用占销售额」改为可输入框（默认 50%，与国内采购一样放进共用参数，①②两块共用），显示口径同步按填入比例走；新增 pct() 容错，输入框清空或非数字时回落默认值而不是算成 0%；v1.17.8=2026-10-26 跨境工具「税负速算」拆成两块：①合规规划后的税负率（年销售额+报关单）②历史问题账目的税费与罚款（未申报销售额+距今月数+处理方式+核定率 → 增值税、企业所得税两套口径、滞纳金按日万分之五、罚款按少缴税款 0.5~5 倍区间、合计给上下限）；纳税人性质/人数/采购占比改为两块共用参数，企税档位并入当年利润判定；v1.17.7=2026-10-26 跨境工具页脚移除 v5.6~v6.10 更新日志（底部只保留工具名一行，版本记录统一收敛到平台版本号）；v1.17.6=2026-10-26 跨境工具页签从 3 个加到 5 个：新增「税负速算」（销售额 / 纳税人性质 / 人数 / 采购占比 / 有无报关单 → 实时算增值税、企税、合计税负与综合税负率，并给出节税空间：取得报关单走出口免税、年终奖 3.6 万/人工资抵扣、小规模超 500 万控额拆分；已免税则不再提示控额拆分）与「FAQ」（换成《跨境电商 FAQ 原问答融合分类版》原文 72 条 / 7 类，支持搜索与分类筛选；补全两条旧库答案为空的条目，多行答案分段显示）；顺手修页签高亮错位（tab() list 残留已下线的 'flow'，点对照表会高亮到名词速查）；v1.17.4=2026-10-26 跨境工具方案表述参照公司首资话术实录（读自《首资.docx》）：办理事项写全称+动作链（经营范围增项→办理进出口权→进出口权备案(收发货人备案/跨境电商企业备案)→申领电子口岸 IC 卡→办理免税备案→出口免税栏 13 栏填报），9810 补四个具体动作(生成订单号/无纸化/推单/授权报关代理机构)与报关费行情 80~200 元/票，成本合规列具体成本项与区间(平台费占销售额 40%~60%、进项票 10%~30%、账面利润压到 10%~20%)，历史遗留风险如实讲(免税填报无明文规定、被核查按实际金额更正、不承诺查不到)；AI 提示词新增铁律 10 四条表述规则、「跟他说」注入首资说话顺序；删除方案页底部四个折叠板块(他会怎么反弹/客户类型&销售侧重点/本单特别提醒/逐项依据与知识点)及独占依赖链共 306 行；再删④客户问过的这样答、旧版「AI 分析」折叠面板(与顶部AI块重复且 id 冲突)、⑤客户可能会问及独占依赖链共 107 行；2026-10-26 跨境工具改名「跨境销售辅助使用工具」；方案引擎改网状关联（收短信=历史 100% 有问题且自动量化缺口、深圳主体 13 栏免税默认开通且历史数据可尝试免税填报并联动增值税能否免税）；新增第一性原则税负测算（增值税按纳税人性质、企税按利润分档 5% / 25%、综合税负含节税个税；节税=专票改普票或评估不拿票、年终奖 3.6 万/人工资抵扣、小规模超 500 万控额 525 万或月份拆分把增值税留 1%）；基本盘两个勾选没打钩默认按未办理并兜底推导出口资质；删除沟通台底部「算账 / 他报数 / 承诺卡」三块及独占依赖链；文本治理——给销售看的分析（含「为什么按这个顺序」）改为专业书面语，清除打地基 / 逼出来 / 命门 / 抓手 / 空转等 AI 口癖，AI 提示词加入语体分套（状况=专业书面 / 跟他说=自然口语）与禁用词清单； 2026-10-26 跨境销售辅助使用工具「基本盘」新增两项勾选(是否办进出口权/是否有免退税备案)；v1.17.1=跨境工具默认 AI Key 改指定 sk- 值(用户本机保存值优先)；v1.17.0=新增跨境区并入跨境销售辅助使用工具；v1.16.11=平台名统一改为「金米财税业务辅助平台」；v1.16.10=需求确认单「公司年限」改手动输入框；v1.16.9=合同生成 Word 版式对齐样本(单倍行距+签署区keepNext) */
const fileInput = ref(null)
const dataStatus = ref('')
const dataStatusType = ref('ok')

function showDataStatus(text, type) {
  dataStatus.value = text
  dataStatusType.value = type
  setTimeout(() => { dataStatus.value = '' }, 4000)
}

function backupData() {
  try {
    const data = {}
    let count = 0
    for (const k of BACKUP_KEYS) {
      const v = localStorage.getItem(k)
      if (v !== null) { data[k] = v; count++ }
    }
    const payload = { app: 'biz-toolbox', version: 1, exportedAt: new Date().toISOString(), data }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const d = new Date()
    const p = n => String(n).padStart(2, '0')
    const ts = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
    const a = document.createElement('a')
    a.href = url
    a.download = `金米启航平台数据备份-${ts}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showDataStatus(count > 0 ? `已导出 ${count} 项数据，请妥善保存文件` : '暂无可导出的数据', 'ok')
  } catch (e) {
    showDataStatus('备份失败：' + (e && e.message || e), 'tip')
  }
}

function pickFile() {
  fileInput.value && fileInput.value.click()
}

function onFileChange(e) {
  const f = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result)
      const data = (obj && obj.data) || {}
      let n = 0
      for (const k of BACKUP_KEYS) {
        if (typeof data[k] === 'string') { localStorage.setItem(k, data[k]); n++ }
      }
      if (n === 0) { showDataStatus('导入失败：文件里没有可恢复的数据', 'tip'); return }
      showDataStatus(`已恢复 ${n} 项数据，正在刷新页面…`, 'ok')
      setTimeout(() => location.reload(), 800)
    } catch (err) {
      showDataStatus('导入失败：请选择正确的备份文件', 'tip')
    }
  }
  reader.readAsText(f)
}

/* ============ 本地文件夹同步 ============ */
const showHistory = ref(false)
const working = ref(false)

const vaultStateText = computed(() => {
  if (!vault.supported) return '当前浏览器不支持'
  if (!vault.bound) return '未绑定'
  if (vault.needReconnect) return '待恢复授权'
  if (vault.connected) return '已连接'
  return '未连接'
})
const vaultStateClass = computed(() => {
  if (!vault.supported) return 'disable'
  if (!vault.bound) return 'idle'
  if (vault.needReconnect) return 'warn'
  return 'ok'
})

async function guard(fn) {
  if (working.value) return
  working.value = true
  try { await fn() } finally { working.value = false }
}

async function initVaultOnce() {
  await initVault(BACKUP_KEYS)
  if (vault.connected) await refreshBackups()
}
onMounted(initVaultOnce)

function onChooseFolder() {
  guard(async () => {
    const r = await chooseFolder()
    if (r.aborted) return
    if (r.ok) {
      showDataStatus(r.restored ? '已从该文件夹恢复数据，正在刷新…' : `已绑定「${r.folder}」，共写入 ${r.count || 0} 项数据`, 'ok')
      if (r.restored) setTimeout(() => location.reload(), 900)
    } else if (r.msg) {
      showDataStatus(r.msg, 'tip')
    }
  })
}
function onReconnect() {
  guard(async () => {
    const r = await reconnect()
    if (r.ok) showDataStatus(r.restored ? '已恢复连接并载入文件夹数据…' : '已恢复连接，继续自动同步', 'ok')
    else showDataStatus(r.msg || '恢复连接失败', 'tip')
  })
}
function onSyncNow() {
  guard(async () => {
    const r = await syncNow('manual')
    showDataStatus(r.ok ? `已同步 ${r.count} 项数据到文件夹` : (r.msg || '同步失败'), r.ok ? 'ok' : 'tip')
  })
}
function onLoadData(name) {
  const tip = name
    ? `将用历史版本「${name}」覆盖当前浏览器里的全部数据，确定？`
    : '将用文件夹里的数据覆盖当前浏览器里的全部数据，确定？'
  if (!confirm(tip)) return
  guard(async () => {
    const r = await loadFromFolder(name)
    if (r.ok) showDataStatus('正在载入数据并刷新页面…', 'ok')
    else showDataStatus(r.msg || '加载失败', 'tip')
  })
}
function onToggleHistory() {
  showHistory.value = !showHistory.value
  if (showHistory.value) refreshBackups()
}
function onDisconnect() {
  if (!confirm('断开后将不再自动备份到该文件夹（浏览器里的数据会保留），确定？')) return
  guard(async () => {
    await disconnect()
    showHistory.value = false
    showDataStatus('已断开文件夹同步', 'ok')
  })
}
</script>

<style scoped>
.hero {
  margin-bottom: 22px; position: relative; overflow: hidden; color: #2a2118;
  background: linear-gradient(120deg, #fffdf9 0%, #fdf3e3 48%, #fbeccb 100%);
  border: 1px solid rgba(224,144,26,.22);
  box-shadow: 0 18px 44px -18px rgba(180,120,40,.18);
}
.hero::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(180,120,40,.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(180,120,40,.07) 1px, transparent 1px);
  background-size: 28px 28px; opacity: .5; pointer-events: none;
}
.hero::after {
  content: ''; position: absolute; right: -8%; top: -70%; width: 52%; height: 180%;
  background: radial-gradient(circle, rgba(224,144,26,.18), transparent 70%); pointer-events: none;
}
.hero > * { position: relative; z-index: 1; }
.hero .page-title { color: #2a2118; font-size: 22px; letter-spacing: .5px; }
.hero .page-sub { color: rgba(107,93,74,.85); margin-bottom: 4px; }
.hero-actions { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
.hero-actions button { font-weight: 600; }
.hero-actions .ai-trigger.secondary,
.hero-actions button.secondary {
  background: #fffefb; color: #2a2118;
  border: 1px solid #ece3d6; box-shadow: 0 1px 3px rgba(180,120,40,.08);
}
.hero-actions .ai-trigger.secondary:hover,
.hero-actions button.secondary:hover { background: #fbf5ea; border-color: #e0901a; transform: translateY(-1px); }
.ai-trigger { display: inline-flex; align-items: center; gap: 8px; }
.ai-dot {
  width: 18px; height: 18px; border-radius: 5px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff; font-size: 10px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }

/* 待办模块 + 右侧两卡：左右并排 */
.top-row { display: flex; gap: 16px; align-items: stretch; margin-bottom: 22px; }
.top-row .grid { margin-bottom: 0; flex: 1; min-width: 0; }

/* 待办模块 - 左侧窄卡片 */
.todo-panel {
  display: block; flex: 0 0 420px; max-width: 420px;
  padding: 12px 14px;
  transition: transform .15s, box-shadow .15s, border-color .15s;
}
.todo-panel:hover { border-color: var(--accent-2); transform: translateY(-2px); box-shadow: var(--shadow-hover); text-decoration: none; }
.todo-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.todo-title { display: flex; gap: 10px; align-items: center; }
.todo-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #3b5bdb, #5f3dc4);
  color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 6px 14px -4px rgba(95,61,196,.35);
}
.todo-icon svg { width: 17px; height: 17px; display: block; transform: scale(.82); }
.todo-title h3 { font-size: 14px; margin-bottom: 1px; color: var(--text); }
.todo-title p { color: var(--text-2); font-size: 11px; margin: 0; }
.todo-enter { font-size: 12px; color: var(--accent); font-weight: 600; flex-shrink: 0; }
.todo-stats { display: flex; gap: 8px; margin-bottom: 10px; }
.tstat { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; text-align: center; flex: 1; }
.tstat .num { display: block; font-size: 16px; font-weight: 700; color: var(--text); line-height: 1.1; }
.tstat .num.today { color: var(--accent); }
.tstat .num.overdue { color: var(--text-2); }
.tstat .num.warn { color: var(--red); }
.tstat .lbl { font-size: 10px; color: var(--text-2); }
.todo-preview { display: flex; flex-direction: column; gap: 3px; }
.todo-row { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text); padding: 3px 5px; border-radius: 5px; }
.todo-row:hover { background: var(--bg); }
.p-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.p-dot.p-high { background: var(--red); }
.p-dot.p-med { background: #d97706; }
.p-dot.p-low { background: var(--blue); }
.p-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.p-title.is-due { color: var(--accent); font-weight: 600; }
.p-due { font-size: 10px; color: var(--text-2); flex-shrink: 0; }
.todo-more { font-size: 11px; color: var(--accent); padding: 2px 5px; }
.todo-empty { color: var(--text-2); font-size: 12px; padding: 10px 0; }

.entry { display: flex; gap: 14px; align-items: flex-start; transition: transform .15s, box-shadow .15s, border-color .15s; }
.entry:hover { border-color: var(--accent-2); text-decoration: none; transform: translateY(-2px); box-shadow: var(--shadow); }
.entry-icon {
  width: 46px; height: 46px; border-radius: 12px;
  flex-shrink: 0; color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 18px -6px rgba(42,33,24,.22);
  position: relative;
}
.entry-icon svg:not(.badge) { width: 22px; height: 22px; display: block; transform: scale(.8); }
.entry-icon svg.badge {
  position: absolute; right: -4px; bottom: -4px;
  width: 16px; height: 16px; padding: 2px;
  background: var(--surface); border-radius: 50%;
  color: var(--text-2);
  box-shadow: 0 2px 6px -2px rgba(42,33,24,.18);
}
.entry h3 { font-size: 15px; margin-bottom: 4px; }
.entry p { color: var(--text-2); font-size: 13px; }

.ai-settings { margin-bottom: 20px; }
.ai-head { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; position: relative; }
.ai-close {
  position: absolute; top: 0; right: 0;
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--text-2); font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ai-close:hover { border-color: var(--accent-2); color: var(--accent-2); }
.ai-icon {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 8px 20px -6px rgba(224,144,26,.4);
  position: relative;
}
.ai-icon svg { width: 22px; height: 22px; display: block; transform: scale(.8); }
.ai-head h3 { font-size: 15px; margin-bottom: 4px; }
.ai-head p { color: var(--text-2); font-size: 13px; line-height: 1.6; margin: 0; }
.ai-form { display: grid; grid-template-columns: 160px 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
.ai-form .fg { display: flex; flex-direction: column; gap: 5px; }
.ai-form label { font-size: 12.5px; color: var(--text-2); font-weight: 500; }
.ai-form input, .ai-form select {
  width: 100%; padding: 8px 10px; border: 1px solid var(--border);
  border-radius: 7px; font-size: 13px; background: var(--card);
  color: var(--text); font-family: inherit;
}
.ai-form input:focus, .ai-form select:focus {
  outline: none; border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(224,144,26,0.12);
}
.ai-actions { display: flex; gap: 10px; align-items: center; }
.ai-actions button { padding: 8px 18px; border-radius: 7px; font-size: 13px; cursor: pointer; border: none; font-family: inherit; }
.ai-actions button.primary { background: var(--accent); color: #fff; }
.ai-actions button.primary:disabled { opacity: 0.6; cursor: wait; }
.ai-actions button.secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.ai-status { font-size: 12.5px; margin-left: 6px; }
.ai-status.ok { color: #16a34a; }
.ai-status.tip { color: #ea580c; }
.data-mgmt { margin-bottom: 20px; }
.data-head { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; }
.data-icon {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #e0901a, #b45309);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 8px 20px -6px rgba(42,33,24,.18);
}
.data-icon svg { width: 22px; height: 22px; display: block; transform: scale(.8); }
.data-head h3 { font-size: 15px; margin-bottom: 4px; }
.data-head p { color: var(--text-2); font-size: 13px; line-height: 1.6; margin: 0; }
.data-actions { display: flex; gap: 10px; align-items: center; }
.data-actions button { padding: 8px 18px; border-radius: 7px; font-size: 13px; cursor: pointer; border: none; font-family: inherit; }
.data-actions button.primary { background: var(--accent); color: #fff; }
.data-actions button.secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.data-status { font-size: 12.5px; margin-left: 6px; }
.data-status.ok { color: #16a34a; }
.data-status.tip { color: #ea580c; }

/* 本地文件夹同步 */
.vault-card { border: 1px solid rgba(224,144,26,.28); background: linear-gradient(180deg, #fffdf9, #fffefb); }
.vault-card .data-icon { color: #fff; }
.vault-state { font-size: 11.5px; font-weight: 600; margin-left: 8px; padding: 2px 8px; border-radius: 20px; vertical-align: middle; }
.vault-state.ok { background: #dcfce7; color: #15803d; }
.vault-state.warn { background: #fef3c7; color: #b45309; }
.vault-state.idle { background: #f3f0ea; color: #6b5d4a; }
.vault-state.disable { background: #fee2e2; color: #b91c1c; }
.vault-body { padding-top: 4px; }
.unsupported { color: #b91c1c !important; }
.data-head p b { color: var(--accent); }
.vault-info {
  display: flex; gap: 26px; flex-wrap: wrap; padding: 12px 14px; margin-bottom: 14px;
  background: #fdf6ea; border: 1px solid var(--border); border-radius: 9px;
}
.vault-row { display: flex; flex-direction: column; gap: 3px; min-width: 150px; }
.vault-row .k { font-size: 11.5px; color: #9a8a72; }
.vault-row .v { font-size: 13.5px; color: var(--text); font-weight: 600; }
.data-actions button:disabled { opacity: .55; cursor: not-allowed; }
.danger-text { color: #b91c1c !important; }
.vault-tip { font-size: 12.5px; line-height: 1.7; margin: 12px 0 0; }
.warn-tip { color: #b45309; background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 0 6px 6px 0; }
.vault-history {
  margin-top: 14px; padding: 14px; border: 1px dashed #e2d3bd; border-radius: 9px; background: #fffdf8;
}
.vh-head { font-size: 12.5px; color: #6b5d4a; margin-bottom: 10px; }
.vh-empty { font-size: 12.5px; color: #9a8a72; }
.vh-list { display: flex; flex-direction: column; gap: 8px; }
.vh-item {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 9px 12px; background: #fff; border: 1px solid var(--border); border-radius: 7px;
}
.vh-meta { display: flex; gap: 12px; align-items: baseline; }
.vh-time { font-size: 13px; color: var(--text); font-weight: 600; }
.vh-size { font-size: 11.5px; color: #9a8a72; }
.vh-load {
  padding: 5px 14px; border-radius: 6px; border: 1px solid #e2d3bd; background: #fff;
  color: var(--accent); font-size: 12.5px; cursor: pointer; font-family: inherit; font-weight: 600;
}
.vh-load:hover { background: #fdf6ea; border-color: var(--accent); }
.hidden-file { display: none; }
.update-note h3 { font-size: 14px; margin-bottom: 6px; }
.update-note p { color: var(--text-2); font-size: 13px; }
.ver-line { margin-top: 8px; font-size: 12px !important; color: var(--muted) !important; }
@media (max-width: 900px) {
  .ai-form { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 720px) {
  .grid { grid-template-columns: 1fr; }
  .top-row { flex-direction: column; }
  .todo-panel { flex: 1 1 auto; max-width: none; width: 100%; }
  .ai-form { grid-template-columns: 1fr; }
  .ai-head { align-items: flex-start; }
}
</style>
