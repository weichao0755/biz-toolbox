const fs = require('fs');
const path = require('path');
const root = 'C:/Users/PC/WorkBuddy/2026-09-03-11-14-56/biz-toolbox';
const srcPath = path.join(root, 'public/tools/cross/index.html');
const outDir = path.join(root, 'public/tools/cross-paper');
const outPath = path.join(outDir, 'index.html');

const lines = fs.readFileSync(srcPath, 'utf8').split('\n');
const full = fs.readFileSync(srcPath, 'utf8');

// 题库数据段 4555-5049
const bankJs = lines.slice(4554, 5049).join('\n');
// 方案实战引擎段 5051-5240
const scenarioJs = lines.slice(5050, 5240).join('\n');

// PLAT（平台/发货方式定义，在 2545 行，单独括号配平抽取）
function extractBalanced(text, marker){
  const i = text.indexOf(marker);
  if(i < 0) return '';
  const j = text.indexOf('{', i);
  let depth = 0, k = j;
  for(; k < text.length; k++){
    if(text[k] === '{') depth++;
    else if(text[k] === '}'){ depth--; if(depth === 0){ k++; break; } }
  }
  return text.slice(i, k) + ';\n';
}
const platJs = extractBalanced(full, 'var PLAT=');

const CSS = `
:root{
  --bg:#faf7f2; --surface:#fffefb; --surface-2:#fdf6ec; --border:#ece3d6;
  --text:#2a2118; --text-2:#6b5d4a; --muted:#9a8a72;
  --accent:#b45309; --accent-2:#e0901a; --grad:linear-gradient(135deg,#e0901a 0%,#b45309 100%);
  --accent-bg:#fdf3e3; --green:#2f8f5b; --green-bg:#e8f3ec; --red:#c0392f; --red-bg:#fbecea;
  --amber:#b5730a; --amber-bg:#fbf0dd; --r:12px; --sh:0 1px 2px rgba(60,40,10,.05),0 2px 8px -4px rgba(60,40,10,.08);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
  background-color:var(--bg);
  background-image:radial-gradient(circle at 1px 1px,rgba(224,144,26,.07) 1px,transparent 0);
  background-size:24px 24px;color:var(--text);font-size:14px;line-height:1.65}
.wrap{max-width:780px;margin:0 auto;padding:20px 16px 48px}
.brand{display:inline-block;font-size:11px;font-weight:500;padding:3px 10px;border-radius:999px;background:var(--accent-bg);color:var(--accent);margin-bottom:8px}
h1{font-size:20px;font-weight:600;margin-bottom:6px}
.sub{color:var(--text-2);font-size:12.5px;margin-bottom:14px}
.toolbar{display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;align-items:center}
.btn{width:auto;border:none;border-radius:9px;padding:11px 16px;font-size:13.5px;font-weight:600;cursor:pointer;background:var(--grad);color:#fff;box-shadow:0 6px 16px -6px rgba(224,144,26,.4);transition:.15s}
.btn:hover{opacity:.93;transform:translateY(-1px)}
.btn.ghost{background:var(--surface);color:var(--text-2);border:1px solid var(--border);box-shadow:var(--sh)}
.tabs{display:flex;gap:6px;margin-bottom:16px;background:var(--surface);padding:4px;border:1px solid var(--border);border-radius:12px;box-shadow:var(--sh)}
.tab{flex:1;text-align:center;padding:9px 4px;border-radius:9px;font-size:13px;font-weight:500;color:var(--text-2);cursor:pointer;transition:.15s}
.tab.on{background:var(--grad);color:#fff;box-shadow:0 4px 12px -4px rgba(224,144,26,.5)}
.pane{display:none}.pane.on{display:block}
.sechead{font-size:15px;font-weight:700;margin:18px 0 10px;padding:8px 12px;background:var(--surface-2);border-left:3px solid var(--accent);border-radius:0 8px 8px 0}
.qcard{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:13px 14px;margin-bottom:10px;box-shadow:var(--sh)}
.qno{font-size:14.5px;font-weight:600;margin-bottom:8px;line-height:1.55}
.o{font-size:14px;padding:5px 2px;color:var(--text)}
.ansline{margin-top:8px;font-size:13px;color:var(--text-2);border-bottom:1px solid var(--border);padding-bottom:6px}
.fillline{border-bottom:1px solid #c9b48f;min-height:26px}
.scard{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px;box-shadow:var(--sh)}
.cmodel{font-size:12.5px;color:var(--text-2);background:var(--accent-bg);border-radius:8px;padding:9px 11px;margin:6px 0 10px;line-height:1.8}
.sub2{font-size:13px;color:var(--accent);font-weight:600;margin-bottom:4px}
.akey{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:9px;box-shadow:var(--sh);font-size:13.5px}
.qn{font-weight:700;color:var(--accent)}
.ans{display:inline-block;margin-left:8px;color:var(--green);font-weight:600}
.exp{font-size:12.5px;color:var(--text-2);margin-top:5px;line-height:1.6}
.step{font-size:13.5px;margin:7px 0;line-height:1.6}
.meta{font-size:12px;color:var(--muted);margin-bottom:10px}
.note{font-size:12px;color:var(--muted);margin-top:6px;line-height:1.6}
.warnbar{background:var(--amber-bg);border:1px solid #ecd9b0;color:var(--amber);font-size:12.5px;padding:10px 12px;border-radius:10px;margin-bottom:14px;line-height:1.6}
@media print{
  .tabs,.toolbar{display:none!important}
  .pane{display:block!important}
  #p-key{display:none!important}
  body{background:#fff}
  .wrap{max-width:100%;padding:0 4px}
  .qcard,.scard,.akey{box-shadow:none}
}
`;

const HEAD = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>跨境电商销售顾问 · 考核试卷生成器</title>
<script src="./docx.umd.js"><\/script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
  <span class="brand">跨境 · 销售训练</span>
  <h1>跨境电商销售顾问 · 考核试卷生成器</h1>
  <p class="sub">基于现有题库（212 道）+ 方案实战引擎 + 公司《客户标准问答库》扩展题库，随机出卷 · 总分 100 · 及格 80 · 四题型齐全且互不冲撞</p>
  <div class="warnbar">📌 使用方式：先点「生成新试卷」预览，确认题目无误后点「导出试卷 Word / 导出参考答案 Word」下载。本工具不做线上答题，导出的 Word 才是正式卷面。</div>
  <div class="toolbar">
    <button class="btn" onclick="genPaper()">生成新试卷</button>
    <button class="btn ghost" onclick="exportPaper()">导出试卷 Word</button>
    <button class="btn ghost" onclick="exportKey()">导出参考答案 Word</button>
    <button class="btn ghost" onclick="doPrint()">打印预览</button>
    <span class="meta" id="pmeta" style="margin-left:auto"></span>
  </div>
  <div class="tabs">
    <div class="tab on" data-t="paper" onclick="tab('paper')">试卷预览</div>
    <div class="tab" data-t="key" onclick="tab('key')">参考答案</div>
  </div>
  <div class="pane on" id="p-paper">
    <p class="note">说明：本卷满分 100 分，<b>80 分及格</b>。题型含单选题、多选题、填空题、方案题，四者知识点互不重复，且方案题客户模型内部自洽（杜绝“亚马逊 + 平台物流”这类冲突组合）。方案题为手写题，请按客户模型制定四步方案。</p>
    <div id="paper"></div>
  </div>
  <div class="pane" id="p-key">
    <div id="key"></div>
  </div>
</div>
`;

const SCRIPT1 = `
var ST={attempts:[]};
`;

const SCRIPT3 = `
/* ===== 扩展题库：基于公司《跨境电商客户标准问答库（新人版）》89 条 + SOP 提炼 =====
   均为独立知识点，与下方填空题库 topic 完全不重叠（tag 用 ex_sN / ex_mN 前缀，绝不落入填空 topic 集合），
   保证「单选题 / 多选题 / 填空题 / 方案题」四者不会出现同一道题换种问法的冲撞。 */

var EXTRA_SINGLE=[
 {tag:'ex_s1',q:'跨境电商卖家为什么会涉及增值税？',o:['A. 平台会代扣代缴','B. 多走双清 / 买单出口，被视同内销','C. 进口关税转嫁','D. 企业所得税附征'],a:1,e:'走双清或买单出口是用别人公司抬头出货，会被税局视同内销，季度营业额超 30 万就要交增值税；走 9810 有自己报关单才可免。'},
 {tag:'ex_s2',q:'收到税务局发来的风险提醒短信，是否一定要处理？',o:['A. 是的，需按如实数据修改申报','B. 不用管，自动作废','C. 仅一般纳税人要处理','D. 等电话再说'],a:0,e:'现在平台每季度推送营业额−退货数据，税局据此发提醒；0 申报 / 回款申报都要按如实数据改，否则会被拉异常或约谈。'},
 {tag:'ex_s3',q:'电商平台会不会把卖家数据报送给税务局？',o:['A. 一定会的，每季度推送营业额−退货','B. 不会，只有查账时才要','C. 仅欧洲站推送','D. 由卖家自行决定是否报送'],a:0,e:'电商法执行后平台每季度推送“销售额−退货”的银控数据，回款口径已不可行。'},
 {tag:'ex_s4',q:'采购没有发票，平台费用（佣金 / 仓储 / 广告）怎么入账？',o:['A. 必须补开专票才能做账','B. 提供平台汇总单，右侧费用按明细账录入成本，无需发票','C. 全部计入股东借款','D. 不做任何成本'],a:1,e:'提供后台汇总单即可：左侧 income 申报收入，右侧费用按明细账直接录入抵扣，不需要额外发票。'},
 {tag:'ex_s5',q:'0110 一般贸易与 9610 零售直发的本质区别是？',o:['A. 两者都是免税','B. 0110 走免抵退（有票可退税），9610 走免税（小包难退税）','C. 0110 只能内销','D. 9610 退税更高'],a:1,e:'0110 是“免抵退”不是免税，有票有单证可退税；9610 小包货源几乎拿不到进项专票，退税一线不做。'},
 {tag:'ex_s6',q:'一般纳税人按月申报，某个月没有报关单会怎样？',o:['A. 自动顺延到下月抵扣','B. 只需交企业所得税','C. 不能抵扣当月增值税，需缴全额，不顺延','D. 免交增值税'],a:2,e:'一般人按月申报逻辑同内销，当月无报关单则无法抵扣，需缴全额，不能顺延。'},
 {tag:'ex_s7',q:'企业所得税小型微利优惠的应纳税所得额上限是？',o:['A. 100 万元','B. 200 万元','C. 300 万元','D. 500 万元'],a:2,e:'小微企业优惠上限 300 万，建议把利润控制在 260~290 万区间以避开严查。'},
 {tag:'ex_s8',q:'9810 全流程的四个动作中，以下哪项是“错误”的？',o:['A. 生成订单号','B. 无纸化签约','C. 推单给货代','D. 自行到海关柜台交税'],a:3,e:'9810 比双清只多四步：生成订单号、无纸化、推单、委托货代；均由企业操作 + 货代执行，不是去柜台交税。'},
 {tag:'ex_s9',q:'判定一个客户的报关模式，主要由哪两个维度共同决定？',o:['A. 年流水 + 品类','B. 平台 + 发货方式','C. 城市 + 主体','D. 历史 + 发票'],a:1,e:'报关模式由“平台 + 发货方式”共同决定：自己报关出境→9810/0110；平台代报关→9610；借抬头→先转合规。'},
 {tag:'ex_s10',q:'判定 13 栏可行性时，哪类客户“不能直接填、需先有报关单”？',o:['A. 深圳自有报关单','B. 平台代报、拿不到自己名下报关单','C. 海外仓 9810','D. 一般贸易 0110'],a:1,e:'三层判：借抬头→不能用；平台代报拿不到报关单→需先有报关清单；自有报关单→深圳可直填、外地需先有。'},
 {tag:'ex_s11',q:'客户走买单 / DDP 双清出口，最终结论由什么决定？',o:['A. 货怎么发','B. 报关方式（报关单写谁的名字）','C. 平台类型','D. 年流水大小'],a:1,e:'只要报关单写的是别人抬头，免税退税都不成立、会被视同内销补增值税；结论由报关方式决定，不看发货方式。'},
 {tag:'ex_s12',q:'多主体架构“赛维 2.0”通常包含哪三类主体？',o:['A. 工厂 + 物流 + 银行','B. 店铺 + 个人 + 税局','C. 贸易公司 + 香港公司 + 店铺公司','D. 母公司 + 子公司 + 分公司'],a:2,e:'通过“贸易公司 + 香港公司 + 店铺公司”三角关系，香港作中间层实现外采外销、隔离风险；三地需无关联。'},
 {tag:'ex_s13',q:'以下哪项属于公司明令禁止的“红线承诺”？',o:['A. 按报关单如实申报','B. 提供情况说明应对核查','C. 先转合规再填报','D. 保证 100% 免税、一定不被查'],a:3,e:'禁止承诺“100% 免税 / 一定不被查 / 退税必到账”等结果性结论，只能讲合规路径与风险。'},
 {tag:'ex_s15',q:'“先给再取”的探需技巧是指？',o:['A. 先要客户付款再给资料','B. 先免费给一份体检 / 测算，再谈方案','C. 先签合同再了解需求','D. 先让客户自我介绍'],a:1,e:'先给价值（体检 / 税负测算）建立信任，再自然引出方案，比直接推销转化高。'},
 {tag:'ex_s16',q:'跟进铁律：每次触达客户必须带什么？',o:['A. 一条新信息（新政策 / 新案例 / 新测算）','B. 一份合同','C. 一个优惠码','D. 一段广告'],a:0,e:'不带新信息的触达等于骚扰；每次都要有新价值点。'},
 {tag:'ex_s17',q:'客户刚收到税务短信，属于哪一类客户？',o:['A. 存量触发型','B. 新锐合规型','C. 大卖架构型','D. 零申报灰产型'],a:0,e:'刚收短信属存量触发型，外力推动、转化最快，应优先跟进。'},
 {tag:'ex_s18',q:'关于 9810 预退税（离境即退税），公司的标准口径是？',o:['A. 强烈建议所有客户都做','B. 离境可预退但不建议，目前暂无成功案例，走常规免税更稳','C. 必须做才能免税','D. 只有深圳能做'],a:1,e:'9810 确实可预退税，但流程复杂、暂无退税到账案例，公司建议走常规免税流程。'},
 {tag:'ex_s19',q:'对“出口免税”的正确理解是？',o:['A. 办完备案就永远不用交税','B. 只要出货就免，与报关单无关','C. 有报关单可先按免税，差异部分需补，不承诺一定免','D. 仅限海外仓'],a:2,e:'免税须以本公司抬头报关单（或核实的报关清单）为依据，金额与销售额一致才可免；差异部分需补，不承诺一定免。'},
 {tag:'ex_s20',q:'第三方回款到私户是否一定有风险？',o:['A. 一定会被查','B. 收入已如实申报则风险低，建议逐步把主体 / 收款 / 申报统一','C. 完全合规无风险','D. 必须全部转公户'],a:1,e:'监管重点是收入是否如实申报，而非钱收到哪；收入已申报则风险低，但仍建议主体统一。'},
 {tag:'ex_s21',q:'在香港公司架构中，香港公司的主要作用是？',o:['A. 替代报关行','B. 作为中间层实现外采外销、隔离风险','C. 直接退税给店铺','D. 代缴国内增值税'],a:1,e:'香港公司作中间层，境内采购、境外销售，形成完整证据链支持退税，并隔离历史风险。'},
 {tag:'ex_s22',q:'判定 13 栏可行性三层中，第一层“借别人抬头出货”的结论是？',o:['A. 不能用','B. 可直接填','C. 需先有报关单','D. 只能退税'],a:0,e:'借别人抬头连自己名下报关单都没有，13 栏不能用，必须先转合规报关。'},
 {tag:'ex_s23',q:'深圳主体与外地主体在 13 栏上的区别是？',o:['A. 深圳默认开通可直接填，外地须先有报关单','B. 外地更方便','C. 两者都要先转合规','D. 深圳不能填'],a:0,e:'深圳 13 栏默认开通可直接填报；外地主体必须先有报关单才能线下申请。'},
 {tag:'ex_s24',q:'多家店铺收入能否归集到一家公司统一申报纳税？',o:['A. 可以，合并申报更省事','B. 不可行，各地税所出于利益保护不会同意税收转移','C. 仅深圳允许','D. 仅需一笔手续费'],a:1,e:'合并申报涉及不同专管员业绩分配，沟通难度极大，各地明确拒绝；各主体仍需单独如实申报。'}
];

var EXTRA_MULTI=[
 {tag:'ex_m1',type:'multi',q:'以下哪些情形会导致被视同内销、补缴增值税？',o:['A. 买单出口','B. DDP 双清','C. 9610 零售直发','D. 0110 一般贸易'],a:[0,1],e:'买单 / DDP 都是报关单写别人抬头，被视同内销补增值税；9610 / 0110 是自有报关，不属于。'},
 {tag:'ex_m2',type:'multi',q:'9810 全流程包含以下哪些动作？',o:['A. 生成订单号','B. 无纸化签约','C. 推单给货代','D. 委托货代出口'],a:[0,1,2,3],e:'四步：生成订单号、无纸化、推单、委托货代；均由企业操作 + 货代执行。'},
 {tag:'ex_m3',type:'multi',q:'以下哪些平台的官方物流 / 全托管属于“平台代报”（卖家侧无自己名下报关单）？',o:['A. TikTok Shipping','B. Ozon 官方物流','C. Shopee SLS','D. Temu 全托管','E. 菜鸟无忧物流'],a:[0,1,2,3,4],e:'这些发货方式报关主体是平台 / 物流商，卖家拿不到自己名下报关单，只能做账务 + 免税（拿到清单）。'},
 {tag:'ex_m4',type:'multi',q:'以下哪些情形 13 栏“不能直接填、需先有报关单（或不可用）”？',o:['A. 借别人公司抬头出货','B. 平台代报、拿不到自己名下报关单','C. 深圳自有 9810 报关单','D. 海外仓 9810 备货'],a:[0,1],e:'借抬头→不能用；平台代报无清单→需先有报关单；自有报关单（深圳 / 外地有单）可填 / 可申。'},
 {tag:'ex_m5',type:'multi',q:'以下可作为企业所得税成本列支的有？',o:['A. 员工工资与社保','B. 年终奖（3.6 万 / 人）','C. 平台费用明细账','D. 股东个人消费无票支出'],a:[0,1,2],e:'工资、社保、年终奖、平台费用明细、供应商发票、广告费（15% 内）均可列支；股东个人消费不可。'},
 {tag:'ex_m6',type:'multi',q:'办理进出口权需要提供以下哪些资料？',o:['A. 营业执照副本','B. 公章','C. 法人及操作员身份证','D. 公司英文名称'],a:[0,1,2,3],e:'需营业执照副本、公章、法人身份证正反面、操作员身份证正反面、公司英文名称。'},
 {tag:'ex_m7',type:'multi',q:'以下哪些属于公司明令禁止的“红线承诺”？',o:['A. 保证 100% 免税','B. 保证一定不被查','C. 保证退税必到账','D. 按报关单如实申报'],a:[0,1,2],e:'禁止任何结果性承诺；按报关单如实申报是合规动作，不在红线内。'},
 {tag:'ex_m8',type:'multi',q:'小规模纳税人年销售额超过 500 万，会发生？',o:['A. 强制登记为一般纳税人','B. 增值税率变为 13%','C. 仍可一直按 1%','D. 之前的小规模身份自动保留'],a:[0,1],e:'超 500 万强制转一般人，增值税率 13%；应在超之前做控额 / 拆月份 / 换主体规划。'},
 {tag:'ex_m9',type:'multi',q:'关于退税，以下说法正确的有？',o:['A. 0110 一般贸易走免抵退','B. 9810 可离境预退税','C. 9610 小包零售可正常退税','D. 退税需有进项专票'],a:[0,1,3],e:'0110 免抵退、9810 预退税，但都需进项专票；9610 小包几乎无专票，退税一线不做。'},
 {tag:'ex_m10',type:'multi',q:'我司与网商银行战略合作的优势包括？',o:['A. 回款免手续费','B. 1688 直采便利','C. 提高增值税率','D. 替代报关'],a:[0,1],e:'网商银行回款免手续费 + 1688 直采便利，是跨境方案的商务卖点；不涉及税率或报关。'},
 {tag:'ex_m11',type:'multi',q:'金米可协助代办的出口资质包括？',o:['A. 进出口权','B. 跨境电商企业备案','C. 电子口岸 IC 卡','D. 免税备案 13 栏'],a:[0,1,2,3],e:'全流程资质代办：进出口权→跨境电商备案→IC 卡→免税备案 13 栏。'},
 {tag:'ex_m12',type:'multi',q:'判定 13 栏可行性的三层逻辑是？',o:['A. 借别人抬头 → 不能用','B. 平台代报 → 需先有报关单','C. 自有报关单 → 深圳可直填、外地需先有','D. 平台代报 → 可直接填'],a:[0,1,2],e:'三层判：借抬头不可用；平台代报需先有报关清单；自有报关单深圳直填、外地先有单。给外地 / 平台代报判“可直接填”是硬伤。'},
 {tag:'ex_m13',type:'multi',q:'生成方案题客户模型时，必须保证哪些自洽？',o:['A. 平台与发货方式必须匹配（如亚马逊不能配平台物流）','B. 报关单归属（own / part / none）落在原型约束内','C. 客户所说与系统事实一致','D. 年流水与主体无关可随意'],a:[0,1,2],e:'客户模型由平台真实发货方式 + 原型约束共同生成，杜绝“亚马逊 + 平台物流”这类冲突组合。'},
 {tag:'ex_m14',type:'multi',q:'跟进与探需的正确做法包括？',o:['A. 每次触达带新信息','B. 先给体检 / 测算再谈方案','C. 同一句话每天群发','D. 直接报死价不探需'],a:[0,1],e:'跟进必带新信息、探需先给再取；群发骚扰与跳过探需都不可取。'},
 {tag:'ex_m15',type:'multi',q:'关于多主体 / 香港架构，正确的做法有？',o:['A. 各主体单独如实申报，不能合并','B. 香港公司需有真实员工缴强基金','C. 新主体隔离历史风险，不改动老店利润','D. 香港公司可长期空转'],a:[0,1,2],e:'各主体单独申报；香港需真实员工；新主体隔离历史；空转会有转让定价与真实性风险。'}
];

/* 把扩展题库并入 POOL_G（original 194 道 + 扩展 23 单选 + 15 多选），抽卷池更大、卷面更丰富 */
POOL_G = POOL_G.concat(EXTRA_SINGLE, EXTRA_MULTI);

/* ===== 填空题库（48 条，每条 topic 唯一，且与单选/多选 tag 完全不重叠，杜绝四题型冲撞） ===== */
var FILL_BANK=[
 {topic:'zhina1', q:'税务滞纳金按每日 ____ 计算，会一直滚动、越拖越贵。', a:'万分之五'},
 {topic:'zhina2', q:'被认定违规后，罚款通常为欠税额的 ____ 倍。', a:'0.5~5'},
 {topic:'ic1', q:'电子口岸 IC 卡的初始密码是 ____。', a:'8个8'},
 {topic:'tuidan1', q:'“推单”是把订单数据推送给 ____，货代才能在单一窗口看到并报关出货。', a:'货代'},
 {topic:'wuzhi1', q:'无纸化签约只需操作 ____ 次，后续不用再弄。', a:'1次（一次）'},
 {topic:'yiban1', q:'一般纳税人的增值税率是 ____%。', a:'13'},
 {topic:'xiao1', q:'小规模纳税人的增值税优惠税率是 ____%。', a:'1'},
 {topic:'piao1', q:'走免税方案建议供应商开 ____ 票（普票/专票），可省 5~7 个点。', a:'普票'},
 {topic:'piao2', q:'为了退税去开专票，通常要比普票多付约 ____% 的税点。', a:'8~10'},
 {topic:'hz1', q:'亚马逊报税按汇总单的 ____ 侧（销售额−退货）申报，不能按回款。', a:'income'},
 {topic:'hz2', q:'亚马逊平台支出（佣金/配送/仓储/广告）通常占销售额的 ____%。', a:'40~70'},
 {topic:'lan1', q:'外地客户想享受出口免税，必须先有 ____ 才能申请 13 栏免税。', a:'报关单'},
 {topic:'zen1', q:'出口免税免的是 ____ 税的销项，企业所得税仍要照常交。', a:'增值'},
 {topic:'os1', q:'9810 报关模式对应的是 ____（海外仓备货 / 零售直发）。', a:'海外仓备货'},
 {topic:'os2', q:'9610 报关模式对应的是 ____（海外仓备货 / 零售直发）。', a:'零售直发'},
 {topic:'wp1', q:'9810 有 ____ 即可免增值税，缺进项票只影响企业所得税。', a:'报关单'},
 {topic:'cz1', q:'当前企业所得税征管趋势是全面 ____ 征收，要求账证健全、据实申报。', a:'查账'},
 {topic:'ct1', q:'客户刚收到税务短信，属于 ____ 型客户，外力推动、转化最快。', a:'存量触发'},
 {topic:'gj1', q:'跟进铁律：每次触达必须带 ____（如新政策/新案例/新测算），否则等于骚扰。', a:'新信息'},
 {topic:'tx1', q:'探需技巧“先给再取”指先免费给一份体检/测算，再谈 ____。', a:'方案'},
 {topic:'pt1', q:'判断客户出口模式，最核心看货是怎么 ____ 的（海外仓/平台物流/买单）。', a:'出去'},
 {topic:'sk1', q:'客户钱留在 Payoneer/万里汇没回国内，申报仍按平台报送的 ____ 为准。', a:'店铺销售额（营业额）'},
 {topic:'bt1', q:'“半托”指一半走海外仓、一半走 ____。', a:'平台物流'},
 {topic:'wt1', q:'“电子委托”是把货物委托给 ____，它才有权限操作出口。', a:'货代'},
 {topic:'yt1', q:'9810 预退税：货物离境预退 ____%，剩余 ____% 月度结算。', a:'80 / 20'},
 {topic:'md1', q:'没有以自己公司名义的出口凭证，货会被视同 ____ 销售补增值税。', a:'内销'},
 {topic:'gg1', q:'广告费的税前扣除比例上限为全年销售收入的 ____%。', a:'15'},
 {topic:'jx1', q:'工资每人每月 ____ 元以内免缴个税。', a:'5000'},
 {topic:'jx2', q:'年终奖一般发 ____ 万元，个税仅 3%。', a:'3.6'},
 {topic:'hb1', q:'历史补账（小规模）收费 ____ 元/季度。', a:'400'},
 {topic:'hb2', q:'历史补账（一般纳税人）收费 ____ 元/季度。', a:'900'},
 {topic:'pkg1', q:'小规模年流水≤300万对应星级账套餐 ____ 元/年。', a:'4888'},
 {topic:'pkg2', q:'一般纳税人年流水≤700万对应星级账套餐 ____ 元/年。', a:'10888'},
 {topic:'bg1', q:'9810 相对买单出口多出的四个动作：生成订单号、无纸化、推单、____。', a:'委托货代（电子委托货代）'},
 {topic:'bg2', q:'货代报关市场行情约 ____ 元/票。', a:'80~300'},
 {topic:'bg3', q:'我司合作货代报关费 ____ 元/票。', a:'80'},
 {topic:'bg4', q:'小麦云一票报关费仅 ____ 元/票。', a:'5~8'},
 {topic:'hk1', q:'香港公司首次审计在第 ____ 个月。', a:'18'},
 {topic:'el1', q:'电商法执行起平台每季度推送数据是从 ____ 年 7 月开始。', a:'2025'},
 {topic:'wsb1', q:'网商银行合作优势之一是回款 ____ 手续费。', a:'免（免收）'},
 {topic:'qt1', q:'办理进出口权需提供公司的 ____ 名称（英文）。', a:'英文'},
 {topic:'wl1', q:'____ 模式是“免抵退”而非“免税”（有票有单证可退税）。', a:'0110（一般贸易）'},
 {topic:'m391', q:'____ 模式是“免征不退”（免增值税但放弃退税）。', a:'1039（市场采购）'},
 {topic:'xq1', q:'小规模纳税人年销售额超 ____ 万会被强制登记为一般纳税人。', a:'500'},
 {topic:'rd1', q:'判定报关模式由“平台 + ____”共同决定。', a:'发货方式'},
 {topic:'yw1', q:'深圳主体 13 栏默认 ____，外地必须先有报关单。', a:'开通（可直接填报）'},
 {topic:'qz1', q:'判定 13 栏可行性三层：借抬头→不能用；平台代报→需先有 ____；自有报关单→深圳可直填。', a:'报关单'}
];
var PASS=80, TOTAL=100;
var LETTERS=['A','B','C','D','E','F','G','H'];

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function optList(opts){ var h=''; for(var j=0;j<opts.length;j++) h+='<div class="o">'+LETTERS[j]+'. '+esc(opts[j])+'</div>'; return h; }

/* 抽填空题：保证每题 topic 不同，避免填空之间也撞 */
function pickFills(n){
  var pool=FILL_BANK.slice(); shuffle(pool);
  var out=[], seen={};
  for(var i=0;i<pool.length && out.length<n;i++){ if(!seen[pool[i].topic]){ seen[pool[i].topic]=1; out.push(pool[i]); } }
  return out;
}

/* ===== 方案客户模型自洽校验 =====
   规则：① 发货方式 ful 必须属于该 platform 的真实 ful 集合（结构上杜绝“亚马逊+平台物流”）；
        ② 报关单归属 bType(ful) 必须落在原型 BARCH.ft 约束内；
        ③ 平台/城市/主体/历史等维度各自合法。不通过则重抽。 */
function bArchOf(t){ for(var i=0;i<BARCH.length;i++){ if(BARCH[i].t===t) return BARCH[i]; } return null; }
function bValidate(c){
  var P=PLAT[c.platform]; if(!P) return false;
  var f=P.ful[c.ful]; if(!f) return false;
  var a=bArchOf(c._arch); if(a){
    if(a.entity!==c.entity) return false;
    if(a.history!==c.history) return false;
    if(a.flow.indexOf(c.flow)<0) return false;
    if(a.ft.indexOf(bType(f))<0) return false;
  }
  return true;
}
/* 覆盖原 bGenClient，加入 _arch 标记与自洽校验 + 平台↔发货方式强绑定 */
function bGenClient(){
  var tries=0,c;
  do{
    var a=BARCH[Math.floor(Math.random()*BARCH.length)];
    var p=bPickPlat();
    var F=PLAT[p].ful, pool=[];
    for(var k in F){ if(a.ft.indexOf(bType(F[k]))>=0) pool.push(k); }
    var ful= pool.length ? pool[Math.floor(Math.random()*pool.length)] : Object.keys(F)[0];
    c={ _arch:a.t, platform:p, ful:ful, city:bPickCityB(),
        entity:a.entity, flow:a.flow[Math.floor(Math.random()*a.flow.length)],
        history:a.history, invoice:bPickOne('invoice'), category:bPickOne('category') };
    tries++;
  } while(!bValidate(c) && tries<40);
  return c;
}

/* 客户模型文案 + 标准方案 + 标准话术（复用 cross 方案引擎） */
function clientLabel(c){
  return '平台：'+PLAT[c.platform].n+'　发货方式：'+PLAT[c.platform].ful[c.ful].n+
    '　城市：'+bLabel('city',c.city)+'　主体：'+bLabel('entity',c.entity)+
    '　年流水：'+bLabel('flow',c.flow)+'　历史：'+bHistLabel(c)+
    '　采购票：'+bLabel('invoice',c.invoice)+'　品类：'+bLabel('category',c.category);
}
function scenarioTalk(c){
  var f=PLAT[c.platform].ful[c.ful],t='';
  if(f.mode==='转合规')t='先把买单/双清改成合规报关：经营范围加进出口→办进出口权（收发货人+跨境电商备案）→申 IC 卡→走报关，全程我们代办。不转合规的话，税局会按视同内销让你补增值税。';
  else if(f.mode==='9810')t='您这个是海外仓备货，货从中国报关出境走 9810：离境就有报关单，可以免增值税。9810 确实可以做预退税（离境即退税），但我们不建议——流程复杂，而且目前暂时还没有退税下来的成功案例，走常规免税流程会更好、也更稳。按平台汇总单的 income（销售额−退货）申报，别按回款报。';
  else if(f.mode==='9610')t='您这个是零售直发，对应 9610：清单录入跨境平台推送海关，再填免税栏'+(f.decl==='无'?'。但报关单是平台出的，得先向平台/物流商要当月的报关清单，拿到才能免税':'')+'。';
  else if(f.mode==='0110')t='您是大货出口，走一般贸易 0110，是“免抵退”不是免税：有票有单证就能退税，退税额通常比零售更高。';
  else if(f.mode==='1039')t='市场采购 1039 是“免征不退”：免增值税，但退税同时放弃，二者只能选一个，不能既免又退。';
  if(f.mode==='转合规')t+=' 现阶段 13 栏还用不了，先把报关做起来。';
  else if(c.city==='shenzhen')t+=' 深圳 13 栏可直填免税，但没报关单被倒查要全额补增值税，还是要尽快把报关做起来。';
  else t+=' 外地必须先有报关单才能申 13 栏，所以顺序是先报关、再免税；拖过 500 万就变一般人 13%。';
  if(c.history==='sms')t+=' 历史两方案：①老实交 1% 增值税+滞纳金；②办进出口+免税备案，企税按核定（q3 2% / q4 4%）。方案二无明文规定，被查只能按真实利润补。';
  if(c.history==='upgrade')t+=' 建议换绑新主体：存量留老主体、新单走新主体，讲清新旧衔接，别让客户觉得在逃避。';
  if(c.history==='new')t+=' 从 0 搭：先办进出口权走报关，再开免税备案，账从第一天就规范，别等出问题。';
  if(c.history==='zero')t+=' 一直 0 申报最危险：平台按季报送后数据一对就出来。用“早合规早省心”教育，别恐吓。';
  if(c.invoice==='none')t+=' 采购无票只影响企业所得税（利润虚高），增值税该免还能免；别让客户误以为无票就不能做。';
  return t;
}
function scenarioStd(c){
  var s=bStd(c);
  var steps=[['① 报关模式',s.mode,BSTEPS[0].why],['② 13栏可行性',s.lan,BSTEPS[1].why],['③ 套餐档位',s.pkg,BSTEPS[2].why],['④ 账务落地路径',s.act,BSTEPS[3].why]];
  return {steps:steps, talk:scenarioTalk(c)};
}

var PAPER=null;
function genPaper(){
  var fills=pickFills(5);
  var ex=fills.map(function(f){return f.topic;});
  var singles=POOL_G.filter(function(q){return !q.type && q.tag!=='红线' && ex.indexOf(q.tag)<0;});
  shuffle(singles);
  /* 去重：同一道题文本只保留一个，避免罕见重复 */
  var seenQ={}, uniq=[];
  for(var s=0;s<singles.length;s++){ if(!seenQ[singles[s].q]){ seenQ[singles[s].q]=1; uniq.push(singles[s]); } }
  singles=uniq.slice(0,10);
  var multis=POOL_G.filter(function(q){return q.type==='multi' && ex.indexOf(q.tag)<0;});
  shuffle(multis); multis=multis.slice(0,5);
  var scen=[]; for(var i=0;i<2;i++){ scen.push(bGenClient()); }
  PAPER={single:singles, multi:multis, fill:fills, scen:scen};
  renderPaper(PAPER); renderKey(PAPER);
  document.getElementById('pmeta').textContent='编号 '+Math.floor(Math.random()*9000+1000)+' · 生成于 '+new Date().toLocaleDateString('zh-CN');
}

function renderPaper(p){
  var h='';
  h+='<div class="sechead">一、单选题（每题 2 分，共 '+p.single.length+' 题，合计 '+(p.single.length*2)+' 分）</div>';
  for(var i=0;i<p.single.length;i++){ var q=p.single[i];
    h+='<div class="qcard"><div class="qno">'+(i+1)+'. '+esc(q.q)+'</div>'+optList(q.o)+'<div class="ansline">答：（　　）</div></div>';
  }
  h+='<div class="sechead">二、多选题（每题 3 分，共 '+p.multi.length+' 题，合计 '+(p.multi.length*3)+' 分，多选少选均不得分）</div>';
  for(var j=0;j<p.multi.length;j++){ var m=p.multi[j];
    h+='<div class="qcard"><div class="qno">'+(j+1)+'. '+esc(m.q)+'</div>'+optList(m.o)+'<div class="ansline">答：（　　）</div></div>';
  }
  h+='<div class="sechead">三、填空题（每题 5 分，共 '+p.fill.length+' 题，合计 '+(p.fill.length*5)+' 分）</div>';
  for(var k=0;k<p.fill.length;k++){ var f=p.fill[k];
    h+='<div class="qcard"><div class="qno">'+(k+1)+'. '+esc(f.q)+'</div><div class="ansline fillline">答：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div></div>';
  }
  h+='<div class="sechead">四、方案题（每题 20 分，共 '+p.scen.length+' 题，合计 '+(p.scen.length*20)+' 分，手写）</div>';
  for(var sc=0;sc<p.scen.length;sc++){ var c=p.scen[sc];
    h+='<div class="scard"><div class="qno">方案 '+(sc+1)+'（20 分）　客户模型</div>'+
       '<div class="cmodel">'+clientLabel(c)+'</div>'+
       '<div class="sub2">请为该客户制定合规方案（每步 5 分）：</div>'+
       '<div class="ansline">① 报关模式：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">② 13 栏可行性：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">③ 套餐档位：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">④ 账务落地路径：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">话术要点：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div></div>';
  }
  document.getElementById('paper').innerHTML=h;
}

function renderKey(p){
  var h='<div class="note">及格线 <b>'+PASS+'</b> 分 · 满分 '+TOTAL+' 分。方案题每步 5 分，四步合计 20 分；话术为参考不计分。</div>';
  h+='<div class="sechead">一、单选题 答案</div>';
  for(var i=0;i<p.single.length;i++){ var q=p.single[i];
    h+='<div class="akey"><span class="qn">'+(i+1)+'.</span> '+esc(q.q)+'<span class="ans">'+LETTERS[q.a]+'. '+esc(q.o[q.a])+'</span>'+(q.e?'<div class="exp">解析：'+esc(q.e)+'</div>':'')+'</div>';
  }
  h+='<div class="sechead">二、多选题 答案（全选对得分）</div>';
  for(var j=0;j<p.multi.length;j++){ var m=p.multi[j];
    var ans=m.a.map(function(x){return LETTERS[x]+'. '+m.o[x];}).join('　');
    h+='<div class="akey"><span class="qn">'+(j+1)+'.</span> '+esc(m.q)+'<span class="ans">'+ans+'</span>'+(m.e?'<div class="exp">解析：'+esc(m.e)+'</div>':'')+'</div>';
  }
  h+='<div class="sechead">三、填空题 答案</div>';
  for(var k=0;k<p.fill.length;k++){ var f=p.fill[k];
    h+='<div class="akey"><span class="qn">'+(k+1)+'.</span> '+esc(f.q)+'<span class="ans">'+esc(f.a)+'</span></div>';
  }
  h+='<div class="sechead">四、方案题 标准答案（每题 20 分，四步各 5 分）</div>';
  for(var s2=0;s2<p.scen.length;s2++){ var c=p.scen[s2]; var std=scenarioStd(c);
    h+='<div class="akey"><div class="qn" style="display:block">方案 '+(s2+1)+'　客户模型</div><div class="cmodel" style="margin:4px 0 8px">'+clientLabel(c)+'</div>';
    for(var x=0;x<std.steps.length;x++){ var st=std.steps[x];
      h+='<div class="step"><b>'+st[0]+'（5 分）：</b>'+esc(st[1])+'<div class="exp">'+esc(st[2])+'</div></div>';
    }
    h+='<div class="step"><b>标准话术参考（不计分）：</b><div class="exp">'+esc(std.talk)+'</div></div></div>';
  }
  document.getElementById('key').innerHTML=h;
}

/* ===== Word 导出（复用 cross-quote 的 docx.umd.js） ===== */
function _docxReady(){ var d=window.docx; if(!d){ alert('Word 组件未加载，请刷新页面后重试'); return null; } return d; }
async function exportPaper(){
  var d=_docxReady(); if(!d) return;
  try{
    var Document=d.Document, Packer=d.Packer, Paragraph=d.Paragraph, TextRun=d.TextRun, AlignmentType=d.AlignmentType;
    var FSong={ascii:'Times New Roman',hAnsi:'Times New Roman',eastAsia:'宋体'};
    var FHei={ascii:'Arial',hAnsi:'Arial',eastAsia:'黑体'};
    var R=function(t,o){ return new TextRun({text:String(t==null?'':t),font:(o&&o.font)||FSong,size:(o&&o.size)||24,bold:!!(o&&o.bold),color:(o&&o.color)}); };
    var P=function(runs,o){ o=o||{}; return new Paragraph({children:(typeof runs==='string'?[R(runs,o)]:runs),alignment:o.align||AlignmentType.LEFT,spacing:{line:o.line||280,lineRule:'auto',after:(o.after!=null?o.after:60)},indent:(o.indent!=null?{firstLine:o.indent}:undefined)}); };
    var ch=[];
    ch.push(P([R('跨境电商销售顾问 · 考核试卷',{font:FHei,size:40,bold:true,color:'0C2D5D'})],{align:AlignmentType.CENTER,after:80,line:360}));
    ch.push(P([R('满分 100 分 · 80 分及格 · 四题型：单选 / 多选 / 填空 / 方案',{size:22,color:'595959'})],{align:AlignmentType.CENTER,after:200}));
    ch.push(P([R('一、单选题（每题 2 分，共 '+PAPER.single.length+' 题，合计 '+(PAPER.single.length*2)+' 分）',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    PAPER.single.forEach(function(q,i){
      ch.push(P([R((i+1)+'. '+q.q,{bold:true,size:24})],{after:40}));
      q.o.forEach(function(op,j){ ch.push(P([R(LETTERS[j]+'. '+op,{size:24})],{indent:400,after:20})); });
      ch.push(P([R('答：（　　）',{size:22,color:'888888'})],{indent:400,after:140}));
    });
    ch.push(P([R('二、多选题（每题 3 分，共 '+PAPER.multi.length+' 题，合计 '+(PAPER.multi.length*3)+' 分，多选少选均不得分）',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    PAPER.multi.forEach(function(m,j){
      ch.push(P([R((j+1)+'. '+m.q,{bold:true,size:24})],{after:40}));
      m.o.forEach(function(op,k){ ch.push(P([R(LETTERS[k]+'. '+op,{size:24})],{indent:400,after:20})); });
      ch.push(P([R('答：（　　）',{size:22,color:'888888'})],{indent:400,after:140}));
    });
    ch.push(P([R('三、填空题（每题 5 分，共 '+PAPER.fill.length+' 题，合计 '+(PAPER.fill.length*5)+' 分）',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    PAPER.fill.forEach(function(f,k){
      ch.push(P([R((k+1)+'. '+f.q,{size:24})],{after:40}));
      ch.push(P([R('答：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿',{size:22,color:'888888'})],{indent:400,after:140}));
    });
    ch.push(P([R('四、方案题（每题 20 分，共 '+PAPER.scen.length+' 题，合计 '+(PAPER.scen.length*20)+' 分，手写）',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    var blanks=['① 报关模式：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','② 13 栏可行性：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','③ 套餐档位：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','④ 账务落地路径：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','话术要点：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'];
    PAPER.scen.forEach(function(c,s){
      ch.push(P([R('方案 '+(s+1)+'（20 分）　客户模型',{bold:true,size:24})],{after:40}));
      ch.push(P([R(clientLabel(c),{size:22,color:'444444'})],{indent:400,after:40}));
      ch.push(P([R('请为该客户制定合规方案（每步 5 分）：',{bold:true,size:22})],{after:20}));
      blanks.forEach(function(t){ ch.push(P([R(t,{size:22})],{indent:400,after:80})); });
    });
    var doc=new Document({sections:[{children:ch}]});
    var blob=await Packer.toBlob(doc);
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='跨境电商考核试卷.docx'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(a.href);},5000);
  }catch(e){ console.error(e); alert('导出试卷失败：'+(e&&e.message||e)); }
}
async function exportKey(){
  var d=_docxReady(); if(!d) return;
  try{
    var Document=d.Document, Packer=d.Packer, Paragraph=d.Paragraph, TextRun=d.TextRun, AlignmentType=d.AlignmentType;
    var FSong={ascii:'Times New Roman',hAnsi:'Times New Roman',eastAsia:'宋体'};
    var FHei={ascii:'Arial',hAnsi:'Arial',eastAsia:'黑体'};
    var R=function(t,o){ return new TextRun({text:String(t==null?'':t),font:(o&&o.font)||FSong,size:(o&&o.size)||24,bold:!!(o&&o.bold),color:(o&&o.color)}); };
    var P=function(runs,o){ o=o||{}; return new Paragraph({children:(typeof runs==='string'?[R(runs,o)]:runs),alignment:o.align||AlignmentType.LEFT,spacing:{line:o.line||280,lineRule:'auto',after:(o.after!=null?o.after:60)},indent:(o.indent!=null?{firstLine:o.indent}:undefined)}); };
    var ch=[];
    ch.push(P([R('跨境电商销售顾问 · 考核试卷 · 参考答案',{font:FHei,size:38,bold:true,color:'0C2D5D'})],{align:AlignmentType.CENTER,after:80,line:360}));
    ch.push(P([R('及格线 80 分 · 满分 100 分 · 方案题每步 5 分，话术参考不计分',{size:22,color:'595959'})],{align:AlignmentType.CENTER,after:200}));
    ch.push(P([R('一、单选题 答案',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    PAPER.single.forEach(function(q,i){
      ch.push(P([R((i+1)+'. '+q.q,{bold:true,size:24})],{after:30}));
      ch.push(P([R('答案：'+LETTERS[q.a]+'. '+q.o[q.a],{size:24,color:'2f8f5b',bold:true})],{indent:400,after:20}));
      if(q.e) ch.push(P([R('解析：'+q.e,{size:22,color:'666666'})],{indent:400,after:100}));
    });
    ch.push(P([R('二、多选题 答案（全选对得分）',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    PAPER.multi.forEach(function(m,j){
      var ans=m.a.map(function(x){return LETTERS[x]+'. '+m.o[x];}).join('　');
      ch.push(P([R((j+1)+'. '+m.q,{bold:true,size:24})],{after:30}));
      ch.push(P([R('答案：'+ans,{size:24,color:'2f8f5b',bold:true})],{indent:400,after:20}));
      if(m.e) ch.push(P([R('解析：'+m.e,{size:22,color:'666666'})],{indent:400,after:100}));
    });
    ch.push(P([R('三、填空题 答案',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    PAPER.fill.forEach(function(f,k){
      ch.push(P([R((k+1)+'. '+f.q,{size:24})],{after:20}));
      ch.push(P([R('答案：'+f.a,{size:24,color:'2f8f5b',bold:true})],{indent:400,after:100}));
    });
    ch.push(P([R('四、方案题 标准答案（每题 20 分，四步各 5 分）',{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    PAPER.scen.forEach(function(c,s){
      var std=scenarioStd(c);
      ch.push(P([R('方案 '+(s+1)+'　客户模型',{bold:true,size:24})],{after:20}));
      ch.push(P([R(clientLabel(c),{size:22,color:'444444'})],{indent:400,after:40}));
      std.steps.forEach(function(st){
        ch.push(P([R(st[0]+'（5 分）：'+st[1],{size:24,color:'2f8f5b',bold:true})],{indent:400,after:20}));
        ch.push(P([R(st[2],{size:22,color:'666666'})],{indent:400,after:80}));
      });
      ch.push(P([R('标准话术参考（不计分）：'+std.talk,{size:22,color:'666666'})],{indent:400,after:140}));
    });
    var doc=new Document({sections:[{children:ch}]});
    var blob=await Packer.toBlob(doc);
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='跨境电商考核试卷-参考答案.docx'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(a.href);},5000);
  }catch(e){ console.error(e); alert('导出参考答案失败：'+(e&&e.message||e)); }
}

function tab(n){
  var ts=document.querySelectorAll('.tab'); for(var i=0;i<ts.length;i++) ts[i].classList.toggle('on', ts[i].dataset.t===n);
  document.getElementById('p-paper').classList.toggle('on', n==='paper');
  document.getElementById('p-key').classList.toggle('on', n==='key');
}
function doPrint(){ window.print(); }
/* 覆盖 bank 区的 updProg，避免依赖 TERMS */
function updProg(){}

genPaper();
`;

const HTML = HEAD + '<script>' + SCRIPT1 + '<\/script>' + '<script>' + platJs + '<\/script>' + '<script>' + bankJs + '<\/script>' + '<script>' + scenarioJs + '<\/script>' + '<script>' + SCRIPT3 + '<\/script>' + '</body></html>';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, HTML, 'utf8');
console.log('written:', outPath, 'bytes:', HTML.length, 'platJs len:', platJs.length);
