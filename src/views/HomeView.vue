<template>
  <div class="page">
    <div class="hero card">
      <h1 class="page-title">欢迎使用金米财税业务辅助平台</h1>
      <p class="page-sub">公司转让业务的知识沉淀与效率工具平台，新人快速上手，老手持续沉淀。</p>
      <div class="hero-actions">
        <RouterLink to="/knowledge"><button>进入知识库</button></RouterLink>
        <RouterLink to="/tools"><button class="secondary">打开工具箱</button></RouterLink>
        <a href="https://operate-workbench-admin.jinmicaishui.com/#/crm/home/workbench" target="_blank" rel="noopener"><button class="secondary">CRM管理系统</button></a>
        <a href="https://alidocs.dingtalk.com/i/nodes/N7dx2rn0JbZ3m1ElFbzpAqNkJMGjLRb3?iframeQuery=source%3Dnotable_portal&amp;sideCollapsed=true&amp;utm_source=notable_portal" target="_blank" rel="noopener"><button class="secondary">意向客户表格</button></a>
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
      <p class="ver-line">当前版本 {{ APP_VERSION }} · 更新于 2026-11-13</p>

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
const APP_VERSION = 'v1.23.2' /* v1.23.2=2026-11-28 链路图生成器归入合规区(category compliance, 侧边栏显示合规类), 描述更新含7模式与三流开关; 测试加分类断言。v1.23.1=2026-11-28 链路图加三流开关: 货物流(蓝虚线#2d7fb8)/资金流(红点线#c0392b)/票据流(金长虚线#b8860b)三个彩色按钮, 点亮显示对应线、全亮显示三条、全关只剩主干; 主干业务链常显不参与开关; flow-data.js 每边加flow字段(goods/fund/invoice/null), 赛维族补4条票据流线、报关族补3条票据流线, 共7模式都支持; render按FLOW_ON过滤边与箭头marker, 图例动态显示已开启流; edgePath加bottom/top3/right2/left2专用弧线让票据流避开主干; 真机msedge验证三态布局。测试 test_flow_chart 扩展开关断言+全套16套+build。v1.23.0=2026-11-28 新增「业务链路图生成器」(public/tools/flow-chart): 按用户提供的赛维模式草稿.pdf示意图还原, 销售只需选业务模式(赛维1.0协议控制/第三方账户 vs 赛维2.0本土账户/收入申报)+填客户名和平台, 即出链路图并下载PNG。图含节点框(供应商/贸易公司/HK境外/店铺公司群/运营中心/亚马逊/消费者/仓库/货代/海关/FBA仓)+三类连线(业务流实线/货物流蓝虚线/资金流红点线)+注释框(前提条件/第三方账户/资金流/股权/税务申报), 模式切换自动改『协议控制↔销售』『第三方账户↔本土银行』『0申报↔如实申报』等关键文案。flow-data.js 数据化14节点16连线5注释2模式; html2canvas离屏克隆出图(沿用cross-intake踩坑经验), 预览等比缩放适配宽度; 真机msedge验证布局无重叠。tools.js注册cross类+backupKeys加flow_chart_v1+复制html2canvas依赖。测试 test_flow_chart 29项+全套16套回归+build。v1.22.0=2026-11-25 用《跨境合规服务方案书模板.docx》倒推重做方案书生成工具(仅跨境电商行业, 进阶版): 模板数据化为 cross-template.js(8章+目录+4附录+16张表+全部固定文案, 占位符{{key}}映射参数), 一份结构供HTML预览与Word导出共用; fields.js 跨境电商加H组22项问诊字段(67项/8组, 含附录B风险诊断勾选), 国内电商37项不变; genOutline 跨境分支改模板prompt(AI只写业务链路/服务背景/客户诉求3段, 沿用反幻觉铁律), 其余章节确定性渲染; genWord 模板分支输出封面+目录+8章+附录+表格, 预览里AI段落可编辑且改后自动带回Word; guide内部填写指引仅预览显示不进Word; 其他13行业四段路径不变。价格按报价单年费口径(月费×12)、服务明细与专项收费命名统一报价单。测试 test_tpl_mode 32项 + 全套15套回归 + build。v1.21.3=2026-11-23 按老板截图把「合规官 · 包含服务明细」分组从末尾挪到「配套服务」之前(顺序: 合规官6档→包含服务明细6项→配套服务→专项收费); 渲染按DEFAULT_LIB数组顺序分组, 移动6行即生效; 测试加分组顺序断言防回退+全套14套回归+build。v1.21.2=2026-11-23 删除6档服务描述里的「按月报价、按年收费。」口径话(保留年费X元每年/月费Y元), 页面顶栏与tools.js描述同步去掉该措辞; 测试断言改「年费」+「无该措辞」。另修复GitHub Pages部署失败(同一run出现2个同名github-pages artifact, 删除多余的那个重跑)。v1.21.1=2026-11-23 按老板截图去掉6项合规官服务名前的圈号①②③④⑤⑥(改为纯名称:首次账务规则梳理/会计管理/税务风险管控/动态纳税规划/出口退税全流程陪伴/合规咨询);向导步骤与配套服务描述里的圈号不动。全套14套回归+build。v1.21.0=2026-11-23 合规官服务拆项+描述统一：①把原desc里6条服务内容拆成6个独立服务项(officer_s1~s6, group合规官·包含服务明细, price=0显示【包含服务】)，勾选任一合规官档位自动带上这6项、取消自动移除(syncOfficerDetails,初始化与历史载入也同步)；②6档服务描述统一为老板指定文案「跨境合规官定制服务：首次账务规则梳理 + 会计管理 + 税务风险管控 + 动态纳税规划 + 出口退税全流程陪伴 + 合规咨询」，保留年费口径前缀(按月报价按年收费/年费X元每年/月费Y元)。LIB_KEY v6→v7触发默认库刷新(26项)。测试 test_officer_split 19项(6项内容/自动联动/价格0/换档保持)+全套14套回归+build。v1.20.9=2026-11-23 修复「生成的旧报价单删不掉」：根因=换价目库key只更新可选清单，已存草稿(cross_quote_data_v1 的 state.items)和历史记录快照(cross_quote_records_v1 的 snapshot)里存的是完整项目内容快照，不受key影响。新增 migrateOldItems()：初始化时和历史记录载入时按当前 lib 的 id 白名单过滤 items（旧档位id如pkg4888/imp不在新lib即剔除；c开头的自定义项永久保留），草稿与历史快照一次性清洗、记录本身不丢。测试 test_migrate_items 10项(旧项剔除/新项与自定义保留/历史快照清洗/记录保留)+全套回归+build。v1.20.8=2026-11-23 老板澄清两点：①旧星级账全删（v1.20.7短暂恢复是误解，撤销）②报价按月报、收费按年收。价目库 LIB_KEY v5→v6，只留合规官6档+配套服务4类+专项收费10项共20项，星级账4档+8包含服务全部清除。合规官6档改年度收费：月费750/750/1000/1500/2000/2500 ×12 = 年费9000/9000/12000/18000/24000/30000元每年，unit从「月」改「年」，name标注「750 元/月 × 12」，desc开头「按月报价、按年收费。年费 X 元/年（月费 Y 元）」；pkgReco推荐文案同步年费；页面/工具描述同步9000~30000元每年；专项收费里「500/月起、800/月起」是起步价措辞不动。backupKeys加v5历史+v6当前。测试 test_crossquote_v4(星级账清除+年费×12+unit年+名称标注)+全套回归+CR0/build。v1.20.7=2026-11-23 恢复星级账套餐内容（老板：内容还有，删不掉——老客户仍在星级账体系）：价目库 LIB_KEY v4→v5，在合规官新体系20项基础上恢复「星级账套餐 · 老客户沿用」分组12项——4档(4888小规模≤300万/6888小规模≤500万/10888一般人≤700万/14888一般人≤1000万) + 8项包含服务(办理进出口权/跨境电商企业备案/IC卡/免税备案13栏/出口免税申报/平台明细账按站点/供应商发票规划/人力年终奖个税规划，price=0 自动显示【包含服务】、不单独计价，与截图效果一致)。两套并存：新客户自动推荐合规官月度档，老客户销售手动选星级账；推荐逻辑 pkgReco 不变仍只推合规官。backupKeys 加 v5。测试 test_crossquote_v4 星级账恢复断言(12项/4档价格/8项包含服务价格0)+全套回归+CR0/build。v1.20.6=2026-11-23 跨境电商报价单生成器升级为「金米合规官」新体系(按用户提供2张素材:合规官SOP+跨境电商服务报价)：LIB_KEY升v4触发默认库刷新，DEFAULT_LIB全量替换20项——合规官月度服务6档(营收0-100/100-300/300-500/500-1000/1000-1500/1500-2000万→750/750/1000/1500/2000/2500元每月，服务内容6条:首次账务规则梳理/会计管理/税务风险管控/动态纳税规划/出口退税全流程陪伴/合规咨询)、配套服务4类(合规会计/合规代办/税务律师/法务咨询台,一事一议price0)、专项收费10项(内部核算3000月起/历史补税3000起/商标注册500起/历史账务梳理500月起/退税台账800月起/上传发票到后台100月含阶梯说明/跨区变更1000次/地址挂靠1800年/注销公司+香港代办一事一议)。pkgReco()从「纳税人+年流水→星级账档」改「年营收→合规官6档」，纳税人身份不再影响档位;超2000万提示单独评估。清旧4888/6888/10888/14888全部引用与页面文案。backupKeys补登记v3历史+v4当前，tools.js描述同步。SOP素材仅作服务描述专业度参考、不新增展示块。测试 test_crossquote_v4 38项(价目库20项价格/6档推荐边界/旧体系清除)+全套回归+CR0/build。v1.20.5=2026-11-20 方案书工具参数改为「选行业→填分组详表→AI分析」：新增 fields.js 字段池(46项)与 GROUPS 分组(跨境45项/7组 A基本盘·B经营盘面·C报关物流·D票据成本·E账务申报·F历史风险·G诉求决策；国内37项/6组)，renderForm 按组可折叠渲染+已填计数，collectFacts 遍历全部字段。深度引擎接入新参数：CrossDeep.toTK 修中文值映射(impExp「已办理」→true/subs「2个」→2/staffN/ful独立字段/declMethod优先)、detailPoints() 把7主题详细参数拼成已定事实进 points(AI只能用不能加)。顺手修国内电商 points 遗留旧口径「平台成本凭汇总单入账」→「可申请增值税发票、汇总单仅核对」。测试 test_detail_fields 24项 + 全套11套回归 + CR0/build。v1.20.4=2026-11-20 新增「合规区」分类并把业务方案书生成工具移入：tools.js CATEGORIES 加 {key:'compliance',label:'合规类',desc:'行业合规账方案与诊断工具',color:'#b45309'}（侧边栏自动把「类」显示成「区」），plan-doc 的 category 从 sales 改 compliance。分类数据驱动，App侧边栏/ToolsView/router 自动生效无需改。测试 test_plan_doc 注册断言改 compliance + 全套回归 + build。v1.20.3=2026-11-20 国内电商平台成本口径纠正：原 DomesticDeep 把跨境「平台成本凭汇总单入账、无票单列」套到国内电商，实际国内平台佣金/技术服务费/广告费(直通车/引力魔方/千川等)均可向平台申请增值税发票(信息技术服务/广告服务6%)，专票抵进项/普票抵企税，汇总单仅核对账单金额不能替代发票。修复：新增「平台发票」诊断项(待确认,提示申请平台发票)、成本入账项改聚焦供应商采购票(与平台票分离)、账务规范改「按账单申请发票后凭票入账」、落地方案第2步改「平台成本申请发票、按明细账入账」(含专票/普票用法+私下达人合作无票才单列)。 供应商无票与平台可开票分开。测试 test_deep_engine 加 7 项口径断言全PASS + 全套回归 + build。v1.20.2=2026-11-20 方案书工具深度定制：跨境电商+国内电商两行业按 cross 标准做「规则引擎定结论、AI 只润色措辞」。新增 engine.js(从 cross 抽取已验证核心 derive/planCheck/ckClient/histTaxCompare/taxCalc 等 21 函数+PLAT/DECLD 等常量,735行) 与 deep-engine.js(CrossDeep 复用 cross 引擎做 toTK 映射+诊断+roadmap；DomesticDeep 自建同构规则:收入按平台销售额不按回款/成本明细账/进项票/历史缺口)。genOutline 深度模式先跑规则引擎出 points(结论锁定),AI prompt 明确「不得更改结论/不得加数字」只连成通顺对客四段;其余12行业暂留浅模式。修复 toTK 履约 key 须取平台实际 ful 键(否则 derive 待确认)、新主体 points 去敏感词。测试 test_deep_engine 34项 + test_plan_doc_deep_e2e 13项 + test_plan_doc 35项全PASS + cross全套回归 + 语法CR0/build。v1.20.1=2026-11-20 业务方案书生成工具行业从2个扩到14个：新增 一般贸易出口/直播短视频带货/制造业/商贸批发零售/餐饮服务/建筑工程/科技高新/软件信息/物流货代/教育培训/医疗健康/文化传媒 共12个行业模板。引入 baseFields() 通用字段工厂(客户/城市/纳税人/流水/进项票/历史申报/诉求/补充信息共享 + 行业专属项)，新增行业只需加 INDUSTRIES 一项；每行业带专属 base 服务范围 + 3~5 条专业口径规则(免抵退/研发加计扣除/软件即征即退/异地预缴/个税/进销存等)。测试 test_plan_doc 27项 + 14行业交互渲染全 PASS + cross 全套回归 + 语法CR0/build。v1.20.0=2026-11-20 新增「业务方案书生成工具」(public/tools/plan-doc)：按行业(首版跨境电商/国内电商)填客户参数→AI 严格按事实生成四段方案大纲(客户情况/现状与关注点/落地方案/服务说明)→预览可编辑→导出正式 Word。AI 铁律：只用填写的事实、留空写待确认、禁编造痛点/报价/金额/案例、禁结果承诺、 Neutral 普通话对客称谓贵司；复用 cross 的 cbx_ai Key 与本地 8792 中转兜底；复用 docx.umd.js 与暖金排版。已注册 tools.js(sales 类,newTab)，无新增 localStorage key(参数内存态)。测试 test_plan_doc.cjs 22项全PASS + 交互流程桩验证 + 修掉「未选行业打开即崩」bug + cross 全套回归 + 语法CR0/build。v1.19.57=2026-11-18 cross 修正报关离岸价口径：原方案书/roadmap/话术/FAQ 多处写「报关单金额应与平台销售额一致、不得按成本填报」——这是错的（报关金额是出口估价口径，平台销售额是终端零售口径）。按用户确认「全部按成本+利润口径」统一改为：报关单/清单离岸价(FOB)按国内采购成本加合理利润申报，与实际采购成本/SKU/数量匹配，不与平台销售额一一对应；增值税免税申报仍按平台实际销售额(营业额−退货)如实填报，两处不同口径在 FAQ 里讲清。覆盖22处替换(大纲说明/9810·9610·0110·1039 roadmap acts+done+watch/s6前置/9810推荐理由/单价话术/s3·s5·s6口播/FAQ单价·免税保证·买单混合风险)，旧口径源码0残留、新口径34处。测试 test_fob_pricing.cjs 25项全PASS + 全套回归 + 语法CR0/build。v1.19.56=2026-11-18 cross 三处增强：① 沟通台 base 卡片②平台多选加「其他」按钮→手动输入自定义平台(custom:前缀存 TK.plats，tkOtherOpen/TK.otherText 控制输入框)；新增 PLAT.other 通用履约模板(直邮9610/海外仓9810) + platKey()/platDef() 兜底，让自定义平台在 ful/decl/derive/客户情况表都不崩、按通用口径判定；② 纳税人身份加「个人/个体户」(entity=person)：entNameOf()/entShortOf() 统一显示映射替换 9 处，计算按小规模口径兜底(<120万同享增值税免征)，方案书加「个人不缴企税、经营所得个税另算」提示；③ 客户情况表(custBuild)末尾加「五、补充信息」节含 TK.note(空显示未填)。测试 test_platform_person_note.cjs 24项全PASS + 全套回归(renderTBL/city/futureTax/e2e/genSwitches + 根custNew11/roadmap7) + 语法CR0/build。v1.19.55=2026-11-18 cross 沟通台新增「方案书设置」卡片(第⑤组,可选不阻塞12项采集)：三开关三态(自动/手动/强制不),默认 auto 完全保持现有推断。① 历史数据/历史税费(genHist): forceNo=强制走未来税负预测、force=强制走历史遗留章节——挂在 custNew() 最优先;② 罚款风险(genFine): forceNo=隐去罚款行、force=按企税缺口恢复滞纳金/罚款(不改增值税免征 vatExempt)——挂在 histTaxCompare() 的 fineOff;③ 核定口径(genHed): force=可核定、forceNo=不可核定——挂在 heDingEligible()。TK 存三字段随存档,老存档缺字段按 auto。测试 test_gen_switches.cjs 31 项全 PASS(含采集进度不受影响/老存档兼容/端到端),回归 renderTBL/city/futureTax/e2e + 根 custNew(11)/roadmap(7) 全过 + 语法/CR0/build。v1.19.54=2026-11-17 cross 方案书修正「26 年起新公司仍写企业所得税核定」：根因 genPlanDoc() 未用 custNew() 分支，2026 起步的新主体仍生成整套「历史遗留数据处理方案」(含税局核定利润×65%测算表/核定征收步骤)。修复：① 新增 futureTaxParas() 生成「未来税负预测」章节——按明细账口径(利润=销售额−平台50%−采购20%−人力，计税基础=利润−增值税，税率5%/25%)预测合规后年度增值税0+企税+综合税负率+降税三件事，全篇无「核定/补税」字眼；② genPlanDoc 中 custNew() 为真时以未来预测替代历史遗留章节，推进原则改「先合规、稳经营」，预期效果兜底去核定；③ 有历史客户原逻辑不变。测试 test_future_tax.cjs(19)+test_plan_doc_e2e.cjs(9)全 PASS(端到端验证新主体无历史/核定、老客户仍有)，renderTBL/city 回归 + CR=0 + build 通过。v1.19.53=2026-11-17 cross 沟通台城市改手动输入：base 卡片第③项「有深圳/全在外地」两个按钮改为文本框(可填具体城市如 深圳/广州/义乌 或 深圳、东莞)。新增 TK.cityText 存文本、TK.city 按是否含「深圳」自动推断 sz/out(下游方案书 szExempt/13栏判断不变)；6 处展示点(沟通台摘要·客户情况表·AI结论·登记KV·方案书表格与正文)改用 tkCityShow() 优先显示具体城市名，老存档无 cityText 回退「含深圳/全在外地」。转义 value 防注入；测试 test_cross_city.cjs 23 项全 PASS + renderTBL 回归 + CR=0 + build 通过。v1.19.52=2026-11-16 cross 对照表修复 33 个新平台 chip/表头显示 undefined 的问题：v1.19.51 回填的 33 个条目漏写 pn(显示名)字段，导致平台筛选 chip 与点开后的表格表头均显示「undefined」；为这 33 个条目补 pn=平台 key(eMAG/Tokopedia/淘宝天猫…)，筛选与表头恢复正常显示。冒烟测试加 3 项 undefined 断言共 27 项全 PASS。v1.19.51=2026-11-13 cross 对照表 33 个待补平台全部联网查证回填（不伪造原则）：eMAG/Allegro/Otto/Wayfair 等欧洲东欧美国平台 + Tokopedia/Tiki/Falabella/Jumia/Takealot/Flipkart/Meesho 等东南亚拉美非洲印度平台 + 淘宝天猫/京东国际/拼多多/抖音/小红书/阿里国际站/敦煌网/兰亭集势 等国内平台，逐项标注 ask/notice/practice/gap/risk/modes/ful 与每行 f/m/subj/doc/mi/tu/why/lvl/concl/promise/chk/note；无把握字段标「待核实」(chk 2026-10-31 需单独复核：Tokopedia/Tiki/Takealot/Target/Best Buy/Flipkart/Meesho/小红书)，其余 chk 2026-11-13；平台筛选 50 平台全部有数据、无「待补」徽标。v1.19.50=2026-11-13 cross 对照表扩展为全平台：平台筛选从 TBL 派生覆盖沟通台同款约 50 个平台（17 个已有报关对照数据 + 33 个待补），无数据的显示「待补」徽标、点开/选地区显示「数据补充中」；全部计数仅计有数据的站点(40)，不虚高；默认视图只列有数据平台，待补平台在选中该平台或该地区时才展开。TBL 新增 33 个空数据条目(各带地区，复用现有地区标签，新增「非洲」「中国」两地区)，筛选自动派生无需手工同步。v1.19.49=2026-11-13 cross 对照表平台筛选视觉修复：平台筛选容器 .kbf 原为横向滚动且隐藏滚动条，导致 17 个平台中仅视口内约 14 个可见、Noon/Trendyol/乐天 被挤到右侧隐藏区(用户在 v1.19.48 仍只看到 14)；改为 flex-wrap 自动换行，全部平台可见(与地区筛选一致)。v1.19.48=2026-11-13 cross 对照表平台筛选修复：平台筛选 chips 从 TBL 数据自动派生(TBLPLATS + TBLPNAME)，不再手工维护筛选列表，修复此前脱节导致 Noon/Trendyol/乐天 三个平台在筛选栏漏显示；保证筛选列表与对照表数据永远一致、未来新增平台无需手动同步 chips；TBLORDER 降级为仅排序与中文别名参考。v1.19.47=2026-11-12 cross 沟通台+对照表两处增强：① 沟通台「客户沟通记录」新增「客户情况表（图片）」按钮，一键把客户情况(基本信息·各平台履约·税局与存量·主体与票据)抽成结构化表格 canvas 出图，弹窗逐张/全部下载 PNG；② 对照表新增「地区」筛选并与「平台」筛选双向联动(选平台自动收拢可选地区、选地区反查该平台可服务地区，灰态不可选)，TBLORDER 给 TikTok/Temu/eBay 补中文名。v1.19.46=2026-11-11 cross 方案书生成逻辑按手改反推修正（深圳/小规模/年销<120万无增值税风险场景）：①「报关单或报关清单」统一改「报关清单」（planCheck ② + ckClient ②）；② ckClient ⑤ 历史遗留新增 noVatRisk 分支——"公司主体不存在增值税问题，仅处理企税、可延后"；③ 推进原则核定分支 headline 由「先合规、再核定」改为「先合规」(noVatRisk 时)；④ roadmap s8 对 9610/9810 不再缺失、改固定为「企税优化方案」(去掉"无法取得时"fallback 与 Temu 强约束/不再讨论免税两条 bullet)，其余模式保留原 fallback；s9 在 noVatRisk 时改「历史缺口处理（延后处理）」并合并/改完成标志；⑤ histTaxCompare 增值税免征(vatExempt)时滞纳金/罚款置 0 并回传 noVatRisk；测算表 滞纳金→"暂不计算"/罚款→空/合计仅企税，对比结论节省额改单一值；⑥ 节税筹划 s13 深圳 bullet 去掉"将增值税降至 0"。v1.19.45=2026-11-10 cross 方案书生成逻辑三处修正：① 9610 方案书原漏用「报关单」处统一改为「报关清单」（roadmap 转合规分支 _docShort + s3 分支 + outlineTextClient footer + talkOf）；② 去除「我们代替客户跟货代沟通」表述，明确货代 / 物流商对接（确认报关抬头、索取报关清单）由客户自行沟通、我方仅提供话术与指导（outlineTextClient + roadmap s2 三段 + s7）；③ 走通 9610 / 9810 默认可免税，不再生成「拿不到报关单 / 报关清单转账务合规」fallback 步骤（s8 仅对 0110 / 1039 / 待确认类出现）；另将 s7 报关凭证术语按模式自适应（9610=报关清单 / 9810=报关单）。v1.19.44=2026-11-10 税负速算(cross)修正增值税口径：小规模纳税人季度销售额 ≤ 30 万免征增值税（不再一律按 1% 视同内销）；新增「小规模季度销售额是否超 30 万」下拉(txQ)仅对小规模生效、一般人仍 13%；smallFree 分支写入 taxCalc/renderTax，控额拆分方案对季≤30万小规模不再误触发。v1.19.43=2026-11-09 跨境对照表(名词速查·平台×报关对照表)扩表：新增 10 个主流平台(希音/沃尔玛/eBay/酷澎/来赞达/美客多/野莓/Noon/Trendyol/乐天) + 现有 7 平台补主流站点(亚马逊中东·澳洲·印度、TikTok 巴西·西班牙、Temu 墨西哥·巴西·中东、虾皮巴西·墨西哥·台湾、速卖通法国·沙特·墨西哥)，TBLORDER 同步加 10 个筛选芯片；仅展示层，不动 PLAT/沟通台方案生成逻辑。v1.19.42=2026-11-07 沟通台(cross)按客户经营状态自适应：新增 custNew()（TK.fresh 或 A.hist==='new'），roadmap 三分支 s1/s4/s9 历史整改步骤与历史遗留方向对「新注册/无历史」客户自动跳过；hist 问题新增「刚注册无历史」一键识别(tkFresh)，tkHistInferText/tkToA 同步。v1.19.41=2026-11-07 cross-intake「在什么平台销售」交互升级：主列表保留常用 10 个，「其他」改为网关——点击展开次级面板装长尾平台（OTHER_PLATFORMS 约 41 个，覆盖俄/东南亚/日韩/欧洲/中东/拉美/非洲/北美补充/南亚/国内出海/B2B），多选同步进 platforms；cellPills 已含长尾配色。v1.19.40=2026-11-06 删除「跨境需求交接表填写工具」(cross-handoff)：移除 tools.js 注册项、backupKeys 白名单 cross_handoff_v1、git rm public/tools/cross-handoff/（v1.19.32 旧版，内部交接用途已由 cross-intake·出图 v1.19.36 承接）。v1.19.39=2026-11-06 跨境出图工具(cross-intake)修复导出 PNG 中文重叠/错乱：根因是预览区 transform:scale 缩放干扰 html2canvas 文字定位（占位提示与正文叠印、字形挤压）；导出改为克隆 #sheet 到离屏无 transform 容器（自然 720px）再截，预览缩放只影响屏幕显示、不污染出图。v1.19.38=2026-11-06 跨境客户对接表出图工具(cross-intake)优化：① 预览区改为等比缩放适配屏幕（表格 720px 固定、外层 transform scale 适配，完整可见不再横向截断、消除留白）；② 新增「公司名称」输入字段（表单基础对接卡顶部 + 出图标题下蓝底条展示，未填显「（未填写）」）；③ 收紧间距。v1.19.37=2026-11-06 首页恢复「意向客户表格」外链按钮：仅作钉钉文档快捷入口（href 直跳 alidocs.dingtalk.com/...N7dx2rn0...），非内嵌工具（v1.19.35 已删的 lead-table 重型内嵌工具不再恢复）；位置接在「CRM管理系统」之后。v1.19.36=2026-11-06 新增「跨境电商客户对接表 · 出图」工具(public/tools/cross-intake)：销售勾选/填写/下拉 15 项对接信息（纳税性质/平台/报关模式/资质/账务勾选/后续合规路径），一键生成仿 Excel 的「客户对接情况」表并 html2canvas 导出 PNG；草稿自动保存到 cross_intake_v1；已注册 tools.js(cross 类) 与 backupKeys 白名单。v1.19.35=2026-11-06 删除「意向客户表格」工具：移除首页硬按钮(HomeView)、tools.js 注册项、backupKeys 白名单 lead_table_v1，并 git rm public/tools/lead-table/（与 cross 无代码依赖，cross 的"核心痛点"为独立痛点推导功能）。v1.19.34=2026-11-05 跨境「方案生成」补 9610 进出口权前置：平台代报/无自有报关单客户（即 9610 零售直发常见路径）原方案 s7/s8/s9 漏掉进出口权+免税备案步骤（与合规体检 2807 行"无进出口权则无报关清单"自相矛盾）；现于 else(decl=无) 分支按 ieState 条件补 s2「办理进出口权及出口免税备案（取得本公司抬头报关清单的前提）」，已具备资质则跳过；PLAN_META s7 前置说明同步。v1.19.33=2026-11-03 跨境「方案生成」9810/9610 混淆修复：① roadmap 转合规分支 s3 取消对 9610 客户无条件塞入 9810 报关四项动作与「走通 9810 全流程」话术，改为按 natMode 分支——9810 保留四项动作、9610 走「向平台/物流商索取报关清单→清单推送海关→填13栏免税」、0110/1039 走自有抬头报关；② 报关模式落地 s5/免税申报 s6 对 9610 客户统一改用「报关清单」而非「报关单」；③ PLAN_META s3/s5/s6/s11 报关凭证口径统一（报关单/报关清单）。v1.19.32=2026-11-03 新增「跨境需求交接表填写工具」(public/tools/cross-handoff)：销售只填极简子项，自动拼装客户画像/实际业务流程/业务问题/核心需求等整段交接文案，一键导出可编辑 Excel 交给财务；草稿自动保存到 cross_handoff_v1。v1.19.31=2026-10-31 税负速算企业所得税计税基础纠偏：CIT=（利润−增值税）×税率（原错误地直接按利润×税率）。三计算器统一：taxCalc(合规后)/histTaxCalc(历史问题)/taxModel(AI facts) 均改 citBase=利润−增值税、cit=citBase×税率，显示口径改「计税基础 = 利润 − 增值税」；税率档位仍按利润 300 万判定不变。v1.19.30=2026-10-31 lead-table 意向客户表格首页：隐藏「电话」列、取而代之显示「核心痛点」(pain)，核心痛点超长以省略号截断+悬停 title 显示全文；电话字段仍在表单/详情/导出/搜索中保留。v1.19.29=2026-10-31 cross「名词速查」新增「贸易术语 / 成交方式」分组，补 FOB/CIF/CFR 及 EXW/FCA/CPT/CIP/DDP 共 8 条 Incoterms（每条带报关单/免税退税角度说明），并将名词搜索改为大小写不敏感（搜 fob/cif 小写也能命中）。v1.19.28=2026-10-31 跨工具定价对齐+AI 禁报价：cross-quote 移除多站点 13888/16888 档（LIB_KEY 升 v3、pkgReco 不再按站点分档），星级账套餐统一四档 4888/6888/10888/14888+超1000万定制；cross AI 痛点/推导提示词改为「不持有任何对外报价数字、禁止引用或编造服务费价格、客户问价不报不臆测转团队」，根除「一年6000元费用贵」类幻觉。v1.19.27=2026-10-31 跨境「生成方案书」AI 痛点推导纠偏：删除提示词中硬编码的「怕流程麻烦、觉得费用贵」模板，新增反幻觉约束（其他痛点只能来自事实/提问/补充信息三处来源，未暴露的痛点一律不写、不得编造「一年多少费用」数字），修复未填价格信息却生成「觉得一年6000元费用贵」痛点的问题。v1.19.26=2026-10-31 跨境「生成方案书」税费测算三项纠偏：① 路径一企税改按税局核定利润=销售额×65%(平台成本约50%不被认可上浮)计，非真实利润×15%；② 小规模年销售额<120万(季度≤30万)路径一增值税免征(0)，不按1%补缴；③ 补申报口径人力成本(工资)按最新政策无法补录入账，方案书不再将工资并入补申报成本抵扣项(仅合规后日常账务规划)。2026-10-31 跨境「生成方案书」税费测算口径纠偏 + 加回合同退费 + 沟通台「点名季度」选项按当前日期动态生成(tkQOptions：2025Q3 起至已结束最近季度，Q4 未结束不出现)：① histTaxCompare/histPlan/heDingEligible 数据驱动——真实利润按销售额×15%(亚马逊行业常见)估算，企税=真实利润×5%(<300万)/25%；核定仅适用于 2025 Q3/Q4 季度，口径=销售额×核定利润率(2%~4%)×企业所得税5%(非直接销售额×2%~4%)，2026起各季度不可核定；以客户开网店年份(A.startMonth/TK.startMonth) gating：2026起→不可核定、企税同真实利润×5%、路径二仅省增值税+滞纳金+罚款；渲染块(表头/企税行/合计/测算说明/落地步骤第三步/预期效果/总起句)按 hed 分叉。② 服务保障加回「合同季度退费」条。v1.19.24=2026-10-31 方案书「服务保障」删「合同季度退费」条（跨境合同季度不满意可退费表述不再出现在方案书）。v1.19.23=2026-10-30 跨境「生成方案书」三项强化：① 历史遗留方案落地化——新增（一）落地步骤（调取汇总单差额比对形成缺口表→如实补缴/走免税备案两路径测算→合规跑通后对接核定，顺序不可颠倒）+（二）需贵司提供资料（对应季度汇总单逐季提供，无须近三年全量）+（三）税费测算与路径对比表（histTaxCompare()：路径一如实补缴=增值税1%/13%+企税明细账5%/25%+滞纳金日万分之五+罚款0.5~5倍 vs 路径二合规=增值税0+企税核定2%~4%，算出节省金额区间）+（四）增值税处理方案（五）企业所得税处理方案；roadmap s1 与话术同步改季度汇总单口径。② 封面：buildCover 改794×1123满版canvas+ImageRun floating(page 0,0)贴页边无白边，删「生成日期/咨询热线」两行。③ 内容丰富：一、业务概况综述段；二、诊断小结；三、推进原则（先合规再核定）+预期效果；四、（一）服务保障六条+（二）品牌介绍。v1.19.22=2026-10-30 跨境「生成方案书」历史遗留数据处理方案数据化：新增 histPlan(d) 按客户信息（纳税人类型 general/small · 城市 shenzhen/other · 免税备案 ieState().tf · 报关单 d.decl）动态生成增值税+企业所得税处理方案，彻底去模板腔。增值税三分支：一般纳税人→可直接填报 13 栏免税、历史数据优先按免税口径更正申报；小规模→须先完成免税备案，深圳主体可直接填报免税、外地须凭报关单（无/部分报关单→无票部分暂按内销补缴或与税管员沟通）；均附【沟通要点】与税管员按具体城市沟通。企业所得税四条：核定征收参考口径 2025 Q3 约 2%/Q4 约 4%（广州约 8% 特例、其他视沟通）+ 平台成本与人力成本按平台汇总单据实录入 + 采购成本按收票情况录入（无票单列）+ 人力成本专项规划（返聘退休人员/工资列支）。渲染块插在落地方案步骤后、「四、关于我们」前，带金色下划线标题+定制引言（结合贵司实际情况）。v1.19.21=2026-10-30 跨境「生成方案书」封面参照公司简章重做（buildCover canvas 合成）：B&W 城市图背景（brand/cover-bg.jpg）+ 白字（顶部金米财税/JINMI FINANCE & TAX + 细分割线；中部大标题「跨境出口合规/落地方案」+ 英文副标题；底部致贵司建议+生成日期+咨询热线）+ 上下金色 accent 条，best-effort 取不到回退金色条。v1.19.20=2026-10-30 封面金色主视觉条 + 品牌配图 + 删「贵司编号」。v1.19.19=2026-10-30 落地方案文案专业化：将 roadmap 的 acts 口语化「我们帮您…」整体改写为正式方案表述（如「如经营范围缺少…则须先行办理变更」），genPlanDoc 标签「您这边需要提供/这一步做完」→「需贵司提供/完成标志」，全文以「贵司」称谓。v1.19.18=2026-10-30 跨境「生成方案书」四大板块各另起一页：封面(标题+日期) → 一/二/三/四 各独立分页（pageBreakBefore）。v1.19.17=2026-10-30 跨境「生成方案书」Word 排版美化 + 品牌背书填充：① 修复 CJK 字体不生效与字挤问题——TextRun.font 改用结构化对象 {eastAsia:'宋体'}/{eastAsia:'黑体'} + 全篇 spacing:{line:320,lineRule:'auto'}（≈1.4 倍行距）② 表格升级金色表头(白字)+隔行底纹+宽单元格 margin(90/90/160/120)+四边/内框细线，章节标题带金色下划线 ③ 文档加 page.margin 1080 twips 留白、页脚页码 ④ 四、关于我们品牌文案取自公司企业简章（金米财税成立于 2015 / 1000+ 团队 / 50万+ 客户 / 全国分公司 / 咨询热线 400-0123-860）。v1.19.16=2026-10-30 跨境「生成方案书」重构为四段结构：一、客户情况（表格完整呈现登记信息）/ 二、合规诊断（不合规与待确认项 + 可能带来的危害）/ 三、落地方案（具体执行步骤）/ 四、关于我们（品牌内容留空待用户后续补充）；全篇对客视角（禁用内部作业视角），复用 ckClient/outlineText 对客版数据，依赖 cross/docx.umd.js。v1.19.15=2026-10-30 跨境工具新增「生成方案书」：沟通台方案页/单页视图新增「生成方案书」按钮，复用「对客版」方案全文（outlineTextClient）生成 Word(.docx) 交由客户促单，末尾追加公司背书段；沿用暖金主题，依赖 cross/docx.umd.js 库。v1.19.14=2026-10-30 跨境沟通台三连改：① 方案图由纯白素图改为暖金排版（只排版不着改文字）② 新增「对客版」渲染层，复制给客户的文本与生成的图片一律人写口吻、剔除内部作业视角（内外版分离）③ AI 五项方案+痛点推导按记录落盘（cbx_ai_out_v1），历史再点「查看方案」直接读回不再重烧 token，并修复切客户时上一条 AI 串档；历史列表新增「AI 方案已存」标记；2026-10-29 意向客户表格四项改动：① 新增「今日未跟进」视图（时间维度，显示今天尚未跟进/更新过的活跃客户，排除已成交/已流失；徽标与二级标签同口径）；② 排序下拉新增「客户状态」（按 STATUSES 管线顺序，未知状态置后）；③ 默认字段新增「核心痛点」textarea（表单+详情+CSV/Excel 导出同步）；④ 首页表格移除「微信」列（<thead> 表头与 <tbody> 列同步，colspan 9→8；字段仍保留在表单/详情/导出中可录入可查）。v1.19.12=2026-10-28 cross-quote 明细表渲染「第三次」修正（终版）：v1.19.11 的 inline-block + white-space:nowrap 方案误判为正常，实则 white-space 可继承、传到单元格内关闭了换行，导致服务内容/服务项目/金额文字不换行、横向溢出到邻列（看似被裁）。本版直接复用「快速报价单生成器(quote)」已验证可用的 flex 写法：.qt/.qt-sum 用 display:flex + align-items:stretch（同行自动等高），.c 用 display:flex+flex:0 0 auto+flex-basis 固定宽 + overflow:hidden 防溢出，单元格内文字正常换行（绝不写 white-space:nowrap）；列宽 50/120/245/50/50/82/85=682、inc 合并 167、合计 515+167 与 quote 同口径。移除 inline-block 时代补丁 fixRowHeights()。v1.19.11=inline-block 误修（撤销）；v1.19.10=2026-10-28 跨境报价单明细表布局修复（flex→display:table 解决导出图裁切/空白条）+ 意向客户表格新增「创建日期」可见列（表头+数据行 date-only+展开详情，colspan 8→9，排序「创建时间」与 CSV/Excel「创建时间」列原本已存在并自动对齐）；v1.19.9=2026-10-28 意向客户表格「客户来源」新增「激活」选项（SOURCES 数组追加，过滤下拉/新建表单/按来源统计/导出同步生效）；v1.19.8=2026-10-28 cross-paper 销冠档强化：① 客观题全抽 hard（新增 7 单选+3 多选 hard 题，pickByTier 销冠档改取全部 hard、不足才回退 medium），销冠卷真正“最难” ② 方案题加真实经营数据并要求测算——销冠档客户注入年销售额/人数/无票比例/历史少报/逾期月数，答案用 cross 的 taxCalc/histTaxCalc 算出增值税、企税、综合税负率（现状 vs 合规后双口径）及历史滞纳金(日万分之五)+罚款(0.5~5倍)区间；老人档轻量测算综合税负率；新人档保持方向性。v1.19.7=2026-10-28 cross-paper 考核试卷按三档拆分（新人 / 老人 / 销冠），难度递增：每题加 lv（easy/medium/hard）并按档位优先抽题（新人全 easy、老人 medium 为主、销冠 hard 优先），方案题客户模型三套（bEasyClient/bGenClient/bHardClient）复杂度递增，销冠方案题为「销冠复杂型」原型（平台代报/全托管 + 外地 + 一般纳税人 + 刚收短信历史缺口）并加 CHAMP_EXTRA 附加考核点（量化历史滞纳金/罚款、多主体搭建、不可承诺 100% 免税）；v1.19.6=2026-10-27 cross-paper 归入管理类（category cross→manage、配色对齐管理紫 #7c3aed），便于主管考核销售顾问；v1.19.5=2026-10-27 新增「跨境电商考核试卷生成器」工具（管理类 cross-paper）：从 cross 题库 + 公司《客户标准问答库》扩展题库随机生成 100 分制考核卷，四题型（单选 10×2 / 多选 5×3 / 填空 5×5 / 方案 2×20、共 22 题）知识点互不冲撞，方案题客户模型内部自洽（杜绝“亚马逊 + 平台物流”这类冲突组合）；预览满意后一键导出 Word 试卷与参考答案（复用 docx.umd.js）。v1.19.4=2026-10-27 新增「跨境电商考核题库」工具（跨境类 cross-quiz）：从 cross 工具已下线板块拆出的独立训练工具，212 道（194 通用 + 18 合规红线），学习浏览 + 随机抽卷自测（新人/进阶/主管三卷）、判分（≥80% 且红线全对为合格）、薄弱点分析与重做错题；存储 key cross_quiz_v1 已登记 backupKeys 白名单。v1.19.3=2026-10-27 意向客户表格：「意向类型」改名「业务类型」，下拉选项改为 星级账 / 基础工商 / 基础代账 / 推荐业务 / 其他（原为 收购公司 / 资质办理 / 转让标的 / 注册公司 / 代账 / 其他）；同步改列表表头、表单字段标签、统计分组标题「按业务类型」与 Excel/CSV 导出表头。**附带数据安全修复**：新建/编辑弹窗渲染下拉时，若客户已有的值不在当前选项里（如历史的「收购公司」），会把该历史值作为首项保留并选中，避免编辑保存时被静默改成第一项（此保护对所有下拉字段生效：业务类型 / 客户来源 / 意向等级 / 跟进状态）。v1.19.2=跨境电商报价单：单价设为 0 的服务项，输出表格中「单价（元）」与「金额（元）」两栏自动合并为一格并写「【包含服务】」（用于已包含在套餐里、不单独计价的项目）。新增判定 `isIncluded(it)`（非赠送且单价 ≤ 0），三处同步：① 图片卡片（750px）该行由 7 格变 6 格，合并格宽度 82+85=167px，样式 `.qt .c.inc`（浅金底+橙字加粗）② Word 表格该行末两列用 `columnSpan:2` 合并，浅金底橙字居中 ③ 第②步选择列表的「金额」列显示【包含服务】徽标（`.inc-tag`，与「赠送」徽标区分）；实时改单价时也同步刷新。赠送项逻辑不变（仍显示「赠送」，不计入应付但计入优惠）。v1.19.1=① 6888 / 10888 / 14888 三档的服务内容不再写「服务内容同 4888 档」，改为与 4888 档同样完整的表述（含进出口权资质办理、平台明细账与资料归集、出口资质备案与 13 栏操作申请、月度数据核对与专属跨境会计对接）② 原先 12 项单价 0 元（列表显示「面议」）的服务项，默认价改为 1000 元（出口资质与备案 4 项、报关与申报落地 3 项、账务与成本 3 项、增值服务 2 项）；套餐档位价（4888/6888/10888/14888/16888）与历史补账价（小规模 400 元/季度、一般人 900 元/季度）保持不变。配套：价目库 key 升到 cross_quote_lib_v2（否则本机已存的旧价目库不会刷新默认值），价目库弹窗新增「↺ 恢复默认价目库」按钮（可随时重置，需再点保存才生效），自定义新增服务的默认单价同步改为 1000。v1.19.0=新增「跨境电商报价单生成器」（跨境类，public/tools/cross-quote/index.html）：仿「快速报价单生成器」的三步流程与双格式输出（750px 微信图片卡片 + Word），做跨境专属改造——① 第①步增加「跨境业务盘面」八项（主营平台 / 站点数量 / 合计年流水 / 纳税人身份 / 报关模式 9810·9610·0110·1039·待转合规 / 注册城市 深圳·外地 / 进出口权 / 历史遗留）② 第②步按「纳税人身份 + 年流水（+站点数）」自动推荐星级账套餐档位（小规模 ≤300万→4888、≤500万→6888；一般人 ≤700万→10888、≤1000万→14888、2~4站点13888/5站点以上16888；超 1000 万不硬套、提示走定制），可一键勾选 ③ 跨境专属价目库 19 项（价格全部取自公司《跨境电商SOP流程梳理》与《客户标准问答库》，不自定价格）：年度星级账套餐、出口资质与备案（进出口权 / 跨境电商企业备案 / 电子口岸IC卡 / 免税备案13栏）、报关与申报落地（9810 全流程指导含订单号·无纸化·推单·授权代理、9610 报关清单核实、按期免税申报）、账务与成本（按站点明细账 / 供应商发票规划普票1~3%专票8~10% / 人力与年终奖3.6万个税规划）、历史遗留（小规模400元/季度、一般人900元/季度）、增值（网商银行收汇通道 / 多主体架构咨询）④ 图片卡片与 Word 均增加「客户跨境业务盘面」区块，Word 末尾附公司口径「合规边界」条款（免税须以本公司抬头报关单或经核实的报关清单为依据、深圳13栏默认开通外地须先有报关单、不承诺不被查/一定免税）⑤ 独立存储 key（cross_quote_data_v1 / records / lib / ai_config），已同步登记 backupKeys 白名单。v1.18.7=①**痛点推导重构**：痛点可以有多个，但必须有且只有一个最痛的，格式为「一、痛点：1.核心痛点 2.其他痛点（1.2.3 延伸/次要）」＋「二、侧重打法」＋「三、推导过程（折叠）」。核心痛点口径＝**合规的目的是避免被税局查导致进一步损失**，所以核心痛点必须落在「被查之后的损失」上并把损失放大（补税 + 滞纳金按日万分之五 + 罚款 0.5~5 倍 + 被查期间生意受影响），必须带数字，禁止"有风险"这类空话；其他痛点只能写由核心带出来或客户已暴露的延伸/次要问题，不写依据不写解法。提示词标记由【结论】改【痛点】，`aiPainSplit()` 拆出 core/others[]/play/derive，渲染为高亮 `.aip-core` 核心块 + 编号 `.aip-li` 其他痛点列表；AI 不按格式写时整段兜底当核心，不丢内容 ②**删除方案落地话术最后一栏「挂电话前，最后这几句」**（`planTalkHTML` 里的收尾 tl2Card），原挂在该栏的 blk6 收尾异议改挂到最后一步（`askSlot` 中 `blk6` 由返回 n 改为 `Math.max(0,n-1)`），避免内容静默丢失。v1.18.6=① 痛点推导改为**随方案自动生成**（不再单独点按钮）——新增 `aiRunPlanAndPain()` 串起 plan 与 pain，`aiStartPlan()` 改 async 并在 AIPLAN 已存在时只补跑 pain，两者都生成过才跳过（不重复烧 token）；方案页「按这个客户生成这 5 项」按钮同步改为联动 ② 痛点推导输出拆三块：`【结论】`痛点结论（3~5 条一句话，不写依据）、`【打法】`侧重打法（3~4 条，格式「放大什么 → 怎么戳」，明确销售该放大什么）、`【推导】`推导过程（分「他已经说出来的」与「推出来的」，每条「痛点 → 依据」，末尾给切入顺序）。新增 `AIPAIN` 缓存、`aiPainSplit()` / `aiPainPaint()` 流式解析填充；推导过程用 `<details>` **默认折叠**，点开才看依据；新增 `.aip-sub / .aip-pbox / .aip-der / .aip-derbody` 样式 ③ 税负速算②「历史问题账目」改口径：企税走**明细账**（销售额 − 能录入的平台成本 − 能录入的采购成本 − 人力），**不按核定率折算**；平台成本与采购成本改为**手动录入金额**的输入框（`hxPlatCost` / `hxPurchCost`，万元），删掉原「核定率」输入框与两套企税口径行；罚款按**不合规的全额税款**（增值税 + 企业所得税）的 0.5~5 倍估算。v1.18.5=① 沟通台客户信息表底部新增「补充信息」多行输入框（`tkNoteBoxHTML` / `TK.note`，写结构化问题没覆盖到的现场线索：谁拍板、有无戒心、现金流顾虑、时间要求等），内容进客户记录「八、补充信息」，并作为 AI 输入 ② 方案页「方案结论」下方新增 AI 板块「痛点推导」（`AI_SECS` 新增 k:'pain'、`painAIHTML` 渲染、`#aiout-pain` 输出），推理来源三处＝【事实】客户信息 +【客户问过的问题】+【补充信息】，由 AI 分两组推导——「他已经说出来的痛点」(从提问反推：问价格=预算敏感、问会不会被查=风险焦虑)与「推出来的痛点」(从数据推导：按回款申报有差额且滞纳金按日万分之五、名下无报关单则免税退税都不成立)，每条固定「痛点 → 依据 → 开场怎么戳」，末尾给「切入顺序」；提示词强制依据必须来自上述三处、不得编造、不确定写「这个要核实」。新增 `.aiout` 输出样式（pre-wrap 保留换行）。v1.18.4=读取桌面《跨境电商物料(2)》29 份 docx 建成语料库，把《跨境电商客户标准问答库_新人版》30 条（可直接对客户说 + 下一步动作 + 禁止承诺 三段式）注入 FAQ_LIB，FAQ 从 72 条扩到 89 条、新增「八 新人标准问答库」4 个子类（17 条新增 + 13 条既有条目补齐三段式结构）；并按公司标准口径修正三处冲突——①「清单汇总报关单」公司语料 0 命中，改回有出处的「报关清单」（9610 向物流/平台索取后核实能否免税）②税点改问答库口径：普票 1~3%、专票 8~10%（原误写 3~4 / 8~13）③报关费改问答库口径：市场行情 80~300 元/票、我司合作货代 80 元/票、小麦云 5~8 元/票，并补小麦云真实功能（系统可全程做订单号生成与推单流程操作）。v1.18.3=京腔治理 + 语料去自造（FULL_TALK / roadmap / 卡点分支）里的北方口语与京腔（咱、咱们、咱俩、这俩、好多人、活儿、干脆、往回圆、顺不顺等），改中性标准普通话；删除全部查无出处的自造时限（公司 FAQ 全库「工作日」0 条，唯一可依据的是「整理旧账约一周」「付款当天安排对接」），7 处步骤 time + 4 处对照表 per + 3 处话术改为「以主管部门实际出件为准 / 以资料齐全为准 / 整理旧账一般一周左右」；删掉自造的「首票试单」残留与「一半概率要不到」概率表述；AISYS 新增铁律 12（语体必须中性标准普通话，禁北方方言与儿化音，附改写对照）与铁律 13（语料只能来自首资话术与公司 FAQ，禁自造时限 / 概率 / 步骤名，不确定就写「这个要核实」）。v1.18.2=9810 预退税口径纠偏（离境即退税），但公司不建议——流程复杂、目前暂无退税到账案例，建议走常规免税流程；落地话术 / 沟通台话术 / 名词速查 yutui / 对照表 trap / 练习题同步改写，AI【事实】+ 铁律 11(3) + 「跟他说」指令同步。v1.18.1=跨境工具方案表述再对标咨询师-客户对话话术实录：第一步先问进出口权再给动作链；9810 四动作补报关费行情 80~200 元/票（对比平台一票 8 元）；成本归位列平台费 40~60%(高 70%)→进项票 10~30%→成本约 70%→税务利润 10~20%；AISYS 铁律追加行情对比与推进方式，AI「跟他说」注入首资说话顺序。v1.18.0=人力成本口径修正：5000 元是月薪，人力成本按年度计 = 6 万/人/年（原误按 0.5 万/人一次性计入），三个计算处同步修正（税负速算①②+方案引擎 taxModel），AI 事实卡公式同步；另统一「月薪 5000 以内不产生个税」的个税起征点表述，避免与人力成本混淆；v1.17.9=2026-10-26 跨境工具税负速算「平台费用占销售额」改为可输入框（默认 50%，与国内采购一样放进共用参数，①②两块共用），显示口径同步按填入比例走；新增 pct() 容错，输入框清空或非数字时回落默认值而不是算成 0%；v1.17.8=2026-10-26 跨境工具「税负速算」拆成两块：①合规规划后的税负率（年销售额+报关单）②历史问题账目的税费与罚款（未申报销售额+距今月数+处理方式+核定率 → 增值税、企业所得税两套口径、滞纳金按日万分之五、罚款按少缴税款 0.5~5 倍区间、合计给上下限）；纳税人性质/人数/采购占比改为两块共用参数，企税档位并入当年利润判定；v1.17.7=2026-10-26 跨境工具页脚移除 v5.6~v6.10 更新日志（底部只保留工具名一行，版本记录统一收敛到平台版本号）；v1.17.6=2026-10-26 跨境工具页签从 3 个加到 5 个：新增「税负速算」（销售额 / 纳税人性质 / 人数 / 采购占比 / 有无报关单 → 实时算增值税、企税、合计税负与综合税负率，并给出节税空间：取得报关单走出口免税、年终奖 3.6 万/人工资抵扣、小规模超 500 万控额拆分；已免税则不再提示控额拆分）与「FAQ」（换成《跨境电商 FAQ 原问答融合分类版》原文 72 条 / 7 类，支持搜索与分类筛选；补全两条旧库答案为空的条目，多行答案分段显示）；顺手修页签高亮错位（tab() list 残留已下线的 'flow'，点对照表会高亮到名词速查）；v1.17.4=2026-10-26 跨境工具方案表述参照公司首资话术实录（读自《首资.docx》）：办理事项写全称+动作链（经营范围增项→办理进出口权→进出口权备案(收发货人备案/跨境电商企业备案)→申领电子口岸 IC 卡→办理免税备案→出口免税栏 13 栏填报），9810 补四个具体动作(生成订单号/无纸化/推单/授权报关代理机构)与报关费行情 80~200 元/票，成本合规列具体成本项与区间(平台费占销售额 40%~60%、进项票 10%~30%、账面利润压到 10%~20%)，历史遗留风险如实讲(免税填报无明文规定、被核查按实际金额更正、不承诺查不到)；AI 提示词新增铁律 10 四条表述规则、「跟他说」注入首资说话顺序；删除方案页底部四个折叠板块(他会怎么反弹/客户类型&销售侧重点/本单特别提醒/逐项依据与知识点)及独占依赖链共 306 行；再删④客户问过的这样答、旧版「AI 分析」折叠面板(与顶部AI块重复且 id 冲突)、⑤客户可能会问及独占依赖链共 107 行；2026-10-26 跨境工具改名「跨境销售辅助使用工具」；方案引擎改网状关联（收短信=历史 100% 有问题且自动量化缺口、深圳主体 13 栏免税默认开通且历史数据可尝试免税填报并联动增值税能否免税）；新增第一性原则税负测算（增值税按纳税人性质、企税按利润分档 5% / 25%、综合税负含节税个税；节税=专票改普票或评估不拿票、年终奖 3.6 万/人工资抵扣、小规模超 500 万控额 525 万或月份拆分把增值税留 1%）；基本盘两个勾选没打钩默认按未办理并兜底推导出口资质；删除沟通台底部「算账 / 他报数 / 承诺卡」三块及独占依赖链；文本治理——给销售看的分析（含「为什么按这个顺序」）改为专业书面语，清除打地基 / 逼出来 / 命门 / 抓手 / 空转等 AI 口癖，AI 提示词加入语体分套（状况=专业书面 / 跟他说=自然口语）与禁用词清单； 2026-10-26 跨境销售辅助使用工具「基本盘」新增两项勾选(是否办进出口权/是否有免退税备案)；v1.17.1=跨境工具默认 AI Key 改指定 sk- 值(用户本机保存值优先)；v1.17.0=新增跨境区并入跨境销售辅助使用工具；v1.16.11=平台名统一改为「金米财税业务辅助平台」；v1.16.10=需求确认单「公司年限」改手动输入框；v1.16.9=合同生成 Word 版式对齐样本(单倍行距+签署区keepNext) */
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
