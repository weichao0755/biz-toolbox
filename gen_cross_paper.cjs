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

/* 从 cross 抽取税负测算引擎（taxCalc / histTaxCalc），用于销冠/老人方案题按真实数据测算 */
function extractFn(text, name){
  const i = text.indexOf('function '+name);
  if(i<0) return '';
  const j = text.indexOf('{', i);
  let depth=0,k=j;
  for(;k<text.length;k++){ if(text[k]==='{')depth++; else if(text[k]==='}'){depth--; if(depth===0){k++;break;}} }
  return text.slice(i,k)+';\n';
}
const calcJs = extractFn(full,'taxCalc') + extractFn(full,'histTaxCalc') +
  'function pct(s,d){var v=parseFloat(s); if(isNaN(v))return d; return v;}\n';

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
.tierbar{display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
.tlabel{font-size:13px;color:var(--text-2);font-weight:500}
.tier{border:1px solid var(--border);background:var(--surface);color:var(--text-2);border-radius:9px;padding:9px 16px;font-size:13.5px;font-weight:600;cursor:pointer;transition:.15s}
.tier:hover{border-color:var(--accent)}
.tier.on{background:var(--grad);color:#fff;border-color:transparent;box-shadow:0 4px 12px -4px rgba(224,144,26,.5)}
.tier .sub{font-size:11px;font-weight:400;opacity:.85;display:block;margin-top:2px}
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
.extra{margin-top:8px;font-size:12.5px;color:var(--accent);background:var(--amber-bg);border:1px solid #ecd9b0;border-radius:8px;padding:8px 10px;line-height:1.7}
.meta{font-size:12px;color:var(--muted);margin-bottom:10px}
.note{font-size:12px;color:var(--muted);margin-top:6px;line-height:1.6}
.warnbar{background:var(--amber-bg);border:1px solid #ecd9b0;color:var(--amber);font-size:12.5px;padding:10px 12px;border-radius:10px;margin-bottom:14px;line-height:1.6}
@media print{
  .tabs,.toolbar,.tierbar{display:none!important}
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
  <p class="sub">按档次出卷：新人 / 老人 / 销冠，难度递增（销冠方案题为复杂客户模型 + 附加考核点）· 总分 100 · 及格 80 · 四题型齐全且互不冲撞</p>
  <div class="warnbar">📌 使用方式：先选「考核档次」，点「生成新试卷」预览，确认无误后点「导出试卷 Word / 导出参考答案 Word」下载。本工具不做线上答题，导出的 Word 才是正式卷面。</div>
  <div class="tierbar">
    <span class="tlabel">考核档次：</span>
    <button class="tier on" data-t="new" onclick="setTier('new')">新人<span class="sub">基础合规认知</span></button>
    <button class="tier" data-t="old" onclick="setTier('old')">老人<span class="sub">综合应用</span></button>
    <button class="tier" data-t="champ" onclick="setTier('champ')">销冠<span class="sub">复杂客户方案</span></button>
  </div>
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
   保证「单选题 / 多选题 / 填空题 / 方案题」四者不会出现同一道题换种问法的冲撞。
   每题带 lv（难度等级：easy / medium / hard），供按档次抽题。 */

var EXTRA_SINGLE=[
 {tag:'ex_s1',lv:'hard',q:'跨境电商卖家为什么会涉及增值税？',o:['A. 平台会代扣代缴','B. 多走双清 / 买单出口，被视同内销','C. 进口关税转嫁','D. 企业所得税附征'],a:1,e:'走双清或买单出口是用别人公司抬头出货，会被税局视同内销，季度营业额超 30 万就要交增值税；走 9810 有自己报关单才可免。'},
 {tag:'ex_s2',lv:'easy',q:'收到税务局发来的风险提醒短信，是否一定要处理？',o:['A. 是的，需按如实数据修改申报','B. 不用管，自动作废','C. 仅一般纳税人要处理','D. 等电话再说'],a:0,e:'现在平台每季度推送营业额−退货数据，税局据此发提醒；0 申报 / 回款申报都要按如实数据改，否则会被拉异常或约谈。'},
 {tag:'ex_s3',lv:'easy',q:'电商平台会不会把卖家数据报送给税务局？',o:['A. 一定会的，每季度推送营业额−退货','B. 不会，只有查账时才要','C. 仅欧洲站推送','D. 由卖家自行决定是否报送'],a:0,e:'电商法执行后平台每季度推送“销售额−退货”的银控数据，回款口径已不可行。'},
 {tag:'ex_s4',lv:'easy',q:'采购没有发票，平台费用（佣金 / 仓储 / 广告）怎么入账？',o:['A. 必须补开专票才能做账','B. 提供平台汇总单，右侧费用按明细账录入成本，无需发票','C. 全部计入股东借款','D. 不做任何成本'],a:1,e:'提供后台汇总单即可：左侧 income 申报收入，右侧费用按明细账直接录入抵扣，不需要额外发票。'},
 {tag:'ex_s5',lv:'medium',q:'0110 一般贸易与 9610 零售直发的本质区别是？',o:['A. 两者都是免税','B. 0110 走免抵退（有票可退税），9610 走免税（小包难退税）','C. 0110 只能内销','D. 9610 退税更高'],a:1,e:'0110 是“免抵退”不是免税，有票有单证可退税；9610 小包货源几乎拿不到进项专票，退税一线不做。'},
 {tag:'ex_s6',lv:'hard',q:'一般纳税人按月申报，某个月没有报关单会怎样？',o:['A. 自动顺延到下月抵扣','B. 只需交企业所得税','C. 不能抵扣当月增值税，需缴全额，不顺延','D. 免交增值税'],a:2,e:'一般人按月申报逻辑同内销，当月无报关单则无法抵扣，需缴全额，不能顺延。'},
 {tag:'ex_s7',lv:'easy',q:'企业所得税小型微利优惠的应纳税所得额上限是？',o:['A. 100 万元','B. 200 万元','C. 300 万元','D. 500 万元'],a:2,e:'小微企业优惠上限 300 万，建议把利润控制在 260~290 万区间以避开严查。'},
 {tag:'ex_s8',lv:'medium',q:'9810 全流程的四个动作中，以下哪项是“错误”的？',o:['A. 生成订单号','B. 无纸化签约','C. 推单给货代','D. 自行到海关柜台交税'],a:3,e:'9810 比双清只多四步：生成订单号、无纸化、推单、委托货代；均由企业操作 + 货代执行，不是去柜台交税。'},
 {tag:'ex_s9',lv:'medium',q:'判定一个客户的报关模式，主要由哪两个维度共同决定？',o:['A. 年流水 + 品类','B. 平台 + 发货方式','C. 城市 + 主体','D. 历史 + 发票'],a:1,e:'报关模式由“平台 + 发货方式”共同决定：自己报关出境→9810/0110；平台代报关→9610；借抬头→先转合规。'},
 {tag:'ex_s10',lv:'hard',q:'判定 13 栏可行性时，哪类客户“不能直接填、需先有报关单”？',o:['A. 深圳自有报关单','B. 平台代报、拿不到自己名下报关单','C. 海外仓 9810','D. 一般贸易 0110'],a:1,e:'三层判：借抬头→不能用；平台代报拿不到报关单→需先有报关清单；自有报关单→深圳可直填、外地需先有。'},
 {tag:'ex_s11',lv:'hard',q:'客户走买单 / DDP 双清出口，最终结论由什么决定？',o:['A. 货怎么发','B. 报关方式（报关单写谁的名字）','C. 平台类型','D. 年流水大小'],a:1,e:'只要报关单写的是别人抬头，免税退税都不成立、会被视同内销补增值税；结论由报关方式决定，不看发货方式。'},
 {tag:'ex_s12',lv:'hard',q:'多主体架构“赛维 2.0”通常包含哪三类主体？',o:['A. 工厂 + 物流 + 银行','B. 店铺 + 个人 + 税局','C. 贸易公司 + 香港公司 + 店铺公司','D. 母公司 + 子公司 + 分公司'],a:2,e:'通过“贸易公司 + 香港公司 + 店铺公司”三角关系，香港作中间层实现外采外销、隔离风险；三地需无关联。'},
 {tag:'ex_s13',lv:'easy',q:'以下哪项属于公司明令禁止的“红线承诺”？',o:['A. 按报关单如实申报','B. 提供情况说明应对核查','C. 先转合规再填报','D. 保证 100% 免税、一定不被查'],a:3,e:'禁止承诺“100% 免税 / 一定不被查 / 退税必到账”等结果性结论，只能讲合规路径与风险。'},
 {tag:'ex_s15',lv:'easy',q:'“先给再取”的探需技巧是指？',o:['A. 先要客户付款再给资料','B. 先免费给一份体检 / 测算，再谈方案','C. 先签合同再了解需求','D. 先让客户自我介绍'],a:1,e:'先给价值（体检 / 税负测算）建立信任，再自然引出方案，比直接推销转化高。'},
 {tag:'ex_s16',lv:'easy',q:'跟进铁律：每次触达客户必须带什么？',o:['A. 一条新信息（新政策 / 新案例 / 新测算）','B. 一份合同','C. 一个优惠码','D. 一段广告'],a:0,e:'不带新信息的触达等于骚扰；每次都要有新价值点。'},
 {tag:'ex_s17',lv:'easy',q:'客户刚收到税务短信，属于哪一类客户？',o:['A. 存量触发型','B. 新锐合规型','C. 大卖架构型','D. 零申报灰产型'],a:0,e:'刚收短信属存量触发型，外力推动、转化最快，应优先跟进。'},
 {tag:'ex_s18',lv:'medium',q:'关于 9810 预退税（离境即退税），公司的标准口径是？',o:['A. 强烈建议所有客户都做','B. 离境可预退但不建议，目前暂无成功案例，走常规免税更稳','C. 必须做才能免税','D. 只有深圳能做'],a:1,e:'9810 确实可预退税，但流程复杂、暂无退税到账案例，公司建议走常规免税流程。'},
 {tag:'ex_s19',lv:'hard',q:'对“出口免税”的正确理解是？',o:['A. 办完备案就永远不用交税','B. 只要出货就免，与报关单无关','C. 有报关单可先按免税，差异部分需补，不承诺一定免','D. 仅限海外仓'],a:2,e:'免税须以本公司抬头报关单（或核实的报关清单）为依据，金额与销售额一致才可免；差异部分需补，不承诺一定免。'},
 {tag:'ex_s20',lv:'hard',q:'第三方回款到私户是否一定有风险？',o:['A. 一定会被查','B. 收入已如实申报则风险低，建议逐步把主体 / 收款 / 申报统一','C. 完全合规无风险','D. 必须全部转公户'],a:1,e:'监管重点是收入是否如实申报，而非钱收到哪；收入已申报则风险低，但仍建议主体统一。'},
 {tag:'ex_s21',lv:'hard',q:'在香港公司架构中，香港公司的主要作用是？',o:['A. 替代报关行','B. 作为中间层实现外采外销、隔离风险','C. 直接退税给店铺','D. 代缴国内增值税'],a:1,e:'香港公司作中间层，境内采购、境外销售，形成完整证据链支持退税，并隔离历史风险。'},
 {tag:'ex_s22',lv:'easy',q:'判定 13 栏可行性三层中，第一层“借别人抬头出货”的结论是？',o:['A. 不能用','B. 可直接填','C. 需先有报关单','D. 只能退税'],a:0,e:'借别人抬头连自己名下报关单都没有，13 栏不能用，必须先转合规报关。'},
 {tag:'ex_s23',lv:'easy',q:'深圳主体与外地主体在 13 栏上的区别是？',o:['A. 深圳默认开通可直接填，外地须先有报关单','B. 外地更方便','C. 两者都要先转合规','D. 深圳不能填'],a:0,e:'深圳 13 栏默认开通可直接填报；外地主体必须先有报关单才能线下申请。'},
 {tag:'ex_s24',lv:'hard',q:'多家店铺收入能否归集到一家公司统一申报纳税？',o:['A. 可以，合并申报更省事','B. 不可行，各地税所出于利益保护不会同意税收转移','C. 仅深圳允许','D. 仅需一笔手续费'],a:1,e:'合并申报涉及不同专管员业绩分配，沟通难度极大，各地明确拒绝；各主体仍需单独如实申报。'}
];

var EXTRA_MULTI=[
 {tag:'ex_m1',lv:'medium',type:'multi',q:'以下哪些情形会导致被视同内销、补缴增值税？',o:['A. 买单出口','B. DDP 双清','C. 9610 零售直发','D. 0110 一般贸易'],a:[0,1],e:'买单 / DDP 都是报关单写别人抬头，被视同内销补增值税；9610 / 0110 是自有报关，不属于。'},
 {tag:'ex_m2',lv:'easy',type:'multi',q:'9810 全流程包含以下哪些动作？',o:['A. 生成订单号','B. 无纸化签约','C. 推单给货代','D. 委托货代出口'],a:[0,1,2,3],e:'四步：生成订单号、无纸化、推单、委托货代；均由企业操作 + 货代执行。'},
 {tag:'ex_m3',lv:'medium',type:'multi',q:'以下哪些平台的官方物流 / 全托管属于“平台代报”（卖家侧无自己名下报关单）？',o:['A. TikTok Shipping','B. Ozon 官方物流','C. Shopee SLS','D. Temu 全托管','E. 菜鸟无忧物流'],a:[0,1,2,3,4],e:'这些发货方式报关主体是平台 / 物流商，卖家拿不到自己名下报关单，只能做账务 + 免税（拿到清单）。'},
 {tag:'ex_m4',lv:'hard',type:'multi',q:'以下哪些情形 13 栏“不能直接填、需先有报关单（或不可用）”？',o:['A. 借别人公司抬头出货','B. 平台代报、拿不到自己名下报关单','C. 深圳自有 9810 报关单','D. 海外仓 9810 备货'],a:[0,1],e:'借抬头→不能用；平台代报无清单→需先有报关单；自有报关单（深圳 / 外地有单）可填 / 可申。'},
 {tag:'ex_m5',lv:'medium',type:'multi',q:'以下可作为企业所得税成本列支的有？',o:['A. 员工工资与社保','B. 年终奖（3.6 万 / 人）','C. 平台费用明细账','D. 股东个人消费无票支出'],a:[0,1,2],e:'工资、社保、年终奖、平台费用明细、供应商发票、广告费（15% 内）均可列支；股东个人消费不可。'},
 {tag:'ex_m6',lv:'easy',type:'multi',q:'办理进出口权需要提供以下哪些资料？',o:['A. 营业执照副本','B. 公章','C. 法人及操作员身份证','D. 公司英文名称'],a:[0,1,2,3],e:'需营业执照副本、公章、法人身份证正反面、操作员身份证正反面、公司英文名称。'},
 {tag:'ex_m7',lv:'easy',type:'multi',q:'以下哪些属于公司明令禁止的“红线承诺”？',o:['A. 保证 100% 免税','B. 保证一定不被查','C. 保证退税必到账','D. 按报关单如实申报'],a:[0,1,2],e:'禁止任何结果性承诺；按报关单如实申报是合规动作，不在红线内。'},
 {tag:'ex_m8',lv:'medium',type:'multi',q:'小规模纳税人年销售额超过 500 万，会发生？',o:['A. 强制登记为一般纳税人','B. 增值税率变为 13%','C. 仍可一直按 1%','D. 之前的小规模身份自动保留'],a:[0,1],e:'超 500 万强制转一般人，增值税率 13%；应在超之前做控额 / 拆月份 / 换主体规划。'},
 {tag:'ex_m9',lv:'hard',type:'multi',q:'关于退税，以下说法正确的有？',o:['A. 0110 一般贸易走免抵退','B. 9810 可离境预退税','C. 9610 小包零售可正常退税','D. 退税需有进项专票'],a:[0,1,3],e:'0110 免抵退、9810 预退税，但都需进项专票；9610 小包几乎无专票，退税一线不做。'},
 {tag:'ex_m10',lv:'easy',type:'multi',q:'我司与网商银行战略合作的优势包括？',o:['A. 回款免手续费','B. 1688 直采便利','C. 提高增值税率','D. 替代报关'],a:[0,1],e:'网商银行回款免手续费 + 1688 直采便利，是跨境方案的商务卖点；不涉及税率或报关。'},
 {tag:'ex_m11',lv:'medium',type:'multi',q:'金米可协助代办的出口资质包括？',o:['A. 进出口权','B. 跨境电商企业备案','C. 电子口岸 IC 卡','D. 免税备案 13 栏'],a:[0,1,2,3],e:'全流程资质代办：进出口权→跨境电商备案→IC 卡→免税备案 13 栏。'},
 {tag:'ex_m12',lv:'hard',type:'multi',q:'判定 13 栏可行性的三层逻辑是？',o:['A. 借别人抬头 → 不能用','B. 平台代报 → 需先有报关单','C. 自有报关单 → 深圳可直填、外地需先有','D. 平台代报 → 可直接填'],a:[0,1,2],e:'三层判：借抬头不可用；平台代报需先有报关清单；自有报关单深圳直填、外地先有单。给外地 / 平台代报判“可直接填”是硬伤。'},
 {tag:'ex_m13',lv:'medium',type:'multi',q:'生成方案题客户模型时，必须保证哪些自洽？',o:['A. 平台与发货方式必须匹配（如亚马逊不能配平台物流）','B. 报关单归属（own / part / none）落在原型约束内','C. 客户所说与系统事实一致','D. 年流水与主体无关可随意'],a:[0,1,2],e:'客户模型由平台真实发货方式 + 原型约束共同生成，杜绝“亚马逊 + 平台物流”这类冲突组合。'},
 {tag:'ex_m14',lv:'easy',type:'multi',q:'跟进与探需的正确做法包括？',o:['A. 每次触达带新信息','B. 先给体检 / 测算再谈方案','C. 同一句话每天群发','D. 直接报死价不探需'],a:[0,1],e:'跟进必带新信息、探需先给再取；群发骚扰与跳过探需都不可取。'},
 {tag:'ex_m15',lv:'hard',type:'multi',q:'关于多主体 / 香港架构，正确的做法有？',o:['A. 各主体单独如实申报，不能合并','B. 香港公司需有真实员工缴强基金','C. 新主体隔离历史风险，不改动老店利润','D. 香港公司可长期空转'],a:[0,1,2],e:'各主体单独申报；香港需真实员工；新主体隔离历史；空转会有转让定价与真实性风险。'}
];

/* ===== 销冠档专用硬题（lv:'hard'）：确保销冠卷能全抽 hard（原 hard 池仅 9 单选 / 4 多选，不够铺满） ===== */
var CHAMP_HARD_SINGLE=[
 {tag:'chd_s1',lv:'hard',q:'某一般纳税人跨境电商年销售额 800 万元，已办进出口权并走出口免税（13 栏），企业所得税应纳税所得额约 300 万元。若给 5 名员工各发 3.6 万元年终奖做工资抵扣，企业所得税税率会如何变化？',o:['A. 仍按 25%，无变化','B. 利润降至 300 万内，可享 5% 小型微利优惠，税负下降','C. 年终奖并入后税率升到 35%','D. 出口免税企业不能发年终奖'],a:1,e:'发年终奖 18 万(5×3.6)后利润<300万，可享 5% 小微优惠，企税由 25% 降到 5%。'},
 {tag:'chd_s2',lv:'hard',q:'客户由平台代报（9610，无本公司抬头报关单）且被税局短信通知补申报，年销售额 1200 万元从未申报。按一般纳税人 13% 测算，仅增值税一项就需补多少（万元）？',o:['A. 0（平台已代扣）','B. 120','C. 156','D. 138'],a:2,e:'无本公司抬头报关单=无出口凭证，视同内销，增值税=1200×13%=156 万。'},
 {tag:'chd_s3',lv:'hard',q:'关于 9810（海外仓）与 0110（一般贸易）的退税，下列正确的是？',o:['A. 两者都只能免税不能退税','B. 9810 是“免抵退”、0110 是“免征不退”','C. 0110 有票有单证可退税；9810 可预退税但当前成功案例少、流程复杂，通常建议走常规免税更稳','D. 9810 退税比 0110 更高'],a:2,e:'0110 一般贸易“免抵退”（有票有单证退税）；9810 可预退税但落地难，多建议常规免税。'},
 {tag:'chd_s4',lv:'hard',q:'香港公司作中间层外采外销（贸易公司+香港公司+店铺公司三地架构），最需防范的反避税风险是？',o:['A. 增值税','B. 受控外国企业(CFC)与转让定价','C. 个人所得税','D. 印花税'],a:1,e:'三地无关联但实质受控，易被认定 CFC / 转让定价不合独立交易原则，需合理商业目的与定价文档。'},
 {tag:'chd_s5',lv:'hard',q:'跨境电商综试区“无票免税”政策下，增值税免了，企业所得税通常采用（ ）征收，要求账证健全。',o:['A. 核定征收（应税所得率）','B. 查账征收','C. 免税','D. 先征后返'],a:1,e:'无票免税仅免增值税；企税趋势为全面查账征收，要求据实申报、账证健全。'},
 {tag:'chd_s6',lv:'hard',q:'小规模纳税人年销售额 520 万元、已办进出口权并报关出口免税。若其将 20 万元内销（无报关单）混入，被稽查后如何处理？',o:['A. 全部按 1%','B. 仅内销部分按 1%、出口部分仍免税','C. 内销部分视同内销按 13% 补、出口部分仍免','D. 不处理'],a:1,e:'出口已报关免税不受影响；内销 20 万无报关单视同内销，小规模按 1% 补 0.2 万（未超500万）。但若因此超500万则转一般人13%。'},
 {tag:'chd_s7',lv:'hard',q:'客户历史少报增值税 52 万元，已逾期 12 个月被稽查。按日万分之五，滞纳金约多少（万元）？',o:['A. 约 9.5','B. 约 19','C. 约 4.7','D. 约 52'],a:0,e:'滞纳金=52万×365天×0.0005=9.49 万≈9.5 万。'}
];
var CHAMP_HARD_MULTI=[
 {tag:'chd_m1',lv:'hard',type:'multi',q:'下列哪些情形会触发 / 要求按一般纳税人 13% 征税？（ ）',o:['A. 年应税销售额超过 500 万元','B. 主动申请登记为一般纳税人','C. 连续 12 个月累计超 500 万','D. 办了进出口权'],a:[0,1,2],e:'超500万（含连续12个月累计）强制登记；也可主动申请。办进出口权不决定纳税人身份。'},
 {tag:'chd_m2',lv:'hard',type:'multi',q:'合规后“出口免税”（13 栏）必须满足（ ）',o:['A. 有本公司抬头报关单','B. 收汇','C. 已是增值税一般纳税人','D. 按平台汇总单 income 申报'],a:[0,1,3],e:'免税核心=本公司抬头报关单+收汇+按平台汇总单 income 申报；小规模纳税人也能办免税，不限于一般人。'},
 {tag:'chd_m3',lv:'hard',type:'multi',q:'历史未申报被稽查，可能的后果包括（ ）',o:['A. 补增值税（视同内销）','B. 每日万分之五滞纳金','C. 欠税额 0.5~5 倍罚款','D. 一律刑事拘留'],a:[0,1,2],e:'补税+滞纳金+0.5~5倍罚款；刑事仅在特定偷税数额巨大且占比达标等情形。'}
];

/* 把扩展题库并入 POOL_G（original 194 道 + 扩展 38 道 + 销冠硬题 10 道），抽卷池更大、卷面更丰富；
   并为每题标注难度 lv（easy/medium/hard），供按档次抽题。 */
POOL_G = POOL_G.concat(EXTRA_SINGLE, EXTRA_MULTI, CHAMP_HARD_SINGLE, CHAMP_HARD_MULTI);
var LV={
 ex_s1:'hard',ex_s2:'easy',ex_s3:'easy',ex_s4:'easy',ex_s5:'medium',ex_s6:'hard',ex_s7:'easy',ex_s8:'medium',ex_s9:'medium',ex_s10:'hard',ex_s11:'hard',ex_s12:'hard',ex_s13:'easy',ex_s15:'easy',ex_s16:'easy',ex_s17:'easy',ex_s18:'medium',ex_s19:'hard',ex_s20:'hard',ex_s21:'hard',ex_s22:'easy',ex_s23:'easy',ex_s24:'hard',
 ex_m1:'medium',ex_m2:'easy',ex_m3:'medium',ex_m4:'hard',ex_m5:'medium',ex_m6:'easy',ex_m7:'easy',ex_m8:'medium',ex_m9:'hard',ex_m10:'easy',ex_m11:'medium',ex_m12:'hard',ex_m13:'medium',ex_m14:'easy',ex_m15:'hard'
};
EXTRA_SINGLE.forEach(function(q){ q.lv=LV[q.tag]||'medium'; });
EXTRA_MULTI.forEach(function(q){ q.lv=LV[q.tag]||'medium'; });
POOL_G.forEach(function(q){ if(!q.lv) q.lv='medium'; });

/* 当前档次：new 新人 / old 老人 / champ 销冠 */
var TIER='new';
var TIERNAME={new:'新人',old:'老人',champ:'销冠'};
/* 销冠方案题附加考核点：面向复杂客户的方案创建能力 */
var CHAMP_EXTRA='附加考核点（销冠加试）：① 向客户量化历史缺口——滞纳金按日万分之五滚动、罚款为欠税额 0.5~5 倍，用数字放大被查损失；② 说明新主体 / 多主体搭建动作链（贸易公司 + 香港公司 + 店铺公司，三地无关联、香港作中间层外采外销）；③ 解释为何不能承诺“100% 免税 / 一定不被查”，只能讲合规路径与风险。';
/* 新增销冠专属客户原型，使 bHardClient 与 bValidate 自洽：
   复杂全托管 / 平台代报（9610 无票→none 或 9810 有票→own）+ 刚收短信的历史缺口 + 一般纳税人 + 外地 */
BARCH.push({t:'销冠复杂型', entity:'general', flow:['f3','f4'], history:'sms', ft:['own','none','part']});

/* ===== 填空题库（47 条，每条 topic 唯一，且与单选/多选 tag 完全不重叠，杜绝四题型冲撞） ===== */
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

/* 按档次抽客观题：easy 优先(新人) / medium 为主(老人) / hard 优先(销冠)，并排除填空 topic */
function pickByTier(kind,n,ex,tier){
  var all=POOL_G.filter(function(q){
    if(kind==='single' && q.type) return false;
    if(kind==='multi' && q.type!=='multi') return false;
    if(q.tag==='红线') return false;
    if(ex.indexOf(q.tag)>=0) return false;
    return true;
  });
  var easy=shuffle(all.filter(function(q){return q.lv==='easy';}));
  var med =shuffle(all.filter(function(q){return q.lv==='medium'||!q.lv;}));
  var hard=shuffle(all.filter(function(q){return q.lv==='hard';}));
  var out=[];
  if(tier==='new'){ out=out.concat(easy); if(out.length<n) out=out.concat(med); }
  else if(tier==='old'){ out=out.concat(med.slice(0,Math.ceil(n*0.6))); out=out.concat(easy.slice(0,Math.floor(n*0.25))); if(out.length<n) out=out.concat(hard); }
  else { /* 销冠：尽可能全抽 hard，仅在 hard 不足时回退 medium，保证“最难” */
    out=out.concat(hard); if(out.length<n) out=out.concat(med); }
  var seen={}, uniq=[];
  for(var i=0;i<out.length && uniq.length<n;i++){ if(!seen[out[i].q]){ seen[out[i].q]=1; uniq.push(out[i]); } }
  return uniq.slice(0,n);
}

/* ===== 方案客户模型自洽校验 + 按档次生成不同复杂度 ===== */
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
/* 覆盖原 bGenClient，加入 _arch 标记与自洽校验 + 平台↔发货方式强绑定（老人档用，中等复杂度）。
   排除销冠专属原型，避免老人档误抽到销冠级客户。 */
function bGenClient(){
  var tries=0,c;
  var bpool=BARCH.filter(function(x){return x.t!=='销冠复杂型';});
  do{
    var a=bpool[Math.floor(Math.random()*bpool.length)];
    var p=bPickPlat();
    var F=PLAT[p].ful, pool=[];
    for(var k in F){ if(a.ft.indexOf(bType(F[k]))>=0) pool.push(k); }
    var ful= pool.length ? pool[Math.floor(Math.random()*pool.length)] : Object.keys(F)[0];
    c={ _arch:a.t, platform:p, ful:ful, city:bPickCityB(),
        entity:a.entity, flow:a.flow[Math.floor(Math.random()*a.flow.length)],
        history:a.history, invoice:bPickOne('invoice'), category:bPickOne('category'),
        calc:'light', sales:[300,400,500,600,800][Math.floor(Math.random()*5)],
        head:[1,2,3,5][Math.floor(Math.random()*4)], noInv:50, platFee:50 };
    tries++;
  } while(!bValidate(c) && tries<40);
  return c;
}
/* 新人档：简单客户——新主体、深圳、小规模、海外仓9810/一般贸易0110，无历史遗留 */
function bEasyClient(){
  var plats=['amazon','independent'];
  var p=plats[Math.floor(Math.random()*plats.length)];
  var F=PLAT[p].ful, keys=Object.keys(F);
  var clean=keys.filter(function(k){ return F[k].mode==='9810'||F[k].mode==='0110'; });
  var ful=clean[Math.floor(Math.random()*clean.length)];
  return { _arch:'新锐合规型', platform:p, ful:ful, city:'shenzhen', entity:'small',
           flow:'f1', history:'new', invoice:'all', category:bPickOne('category') };
}
/* 销冠档：复杂客户——平台代报/全托管(9610 无票→none) 或 9810 有票(→own)、外地、一般纳税人、刚收短信，
   需转合规 + 多主体搭建，并带附加考核点。客户模型严格落在新增「销冠复杂型」原型约束内，保证自洽。
   额外注入真实经营数据（销售额/人数/无票比例/历史少报/逾期），供方案题按数据测算。 */
function bHardClient(){
  var plats=['temu','ozon','shopee','tiktok'];
  var p=plats[Math.floor(Math.random()*plats.length)];
  var F=PLAT[p].ful, keys=Object.keys(F);
  var ful=keys[Math.floor(Math.random()*keys.length)];
  var rnd=function(a){ return a[Math.floor(Math.random()*a.length)]; };
  return { _arch:'销冠复杂型', platform:p, ful:ful, city:'other', entity:'general',
           flow:['f3','f4'][Math.floor(Math.random()*2)], history:'sms', invoice:'none', category:bPickOne('category'), extra:true, calc:'full',
           sales:rnd([600,800,1200,1500,2000]), noInv:60, platFee:50,
           head:rnd([2,3,5,8]), gap:rnd([200,400,600]), mon:rnd([6,12,18]) };
}
function bGenClientTiered(tier){
  if(tier==='new') return bEasyClient();
  if(tier==='champ') return bHardClient();
  return bGenClient();
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

/* ===== 方案题数据测算（复用 cross 的 taxCalc / histTaxCalc） ===== */
/* 销冠：现状(无报关单) vs 合规后(出口免税) 双口径 + 历史缺口滞纳金罚款区间 */
function champCalc(c){
  var pre = taxCalc({sales:c.sales, ent:c.entity, decl:'no',  purch:10, plat:c.platFee, head:c.head});
  var post= taxCalc({sales:c.sales, ent:c.entity, decl:'yes', purch:10, plat:c.platFee, head:c.head});
  var hist= histTaxCalc({gap:c.gap, ent:c.entity, way:'', head:c.head, mon:c.mon});
  return {pre:pre, post:post, hist:hist};
}
/* 老人：仅算合规后综合税负率（轻量测算） */
function lightCalc(c){
  return taxCalc({sales:c.sales, ent:c.entity, decl:'yes', purch:10, plat:(c.platFee||50), head:(c.head||0)});
}
/* —— 试卷端（题干） —— */
function champPaperHtml(c, idx){
  var d='客户经营数据：年销售额 <b>'+c.sales+'</b> 万元；一般纳税人（年销售额已超 500 万）；平台费及物流约占 <b>'+c.platFee+'%</b>；采购无票约 <b>'+c.noInv+'%</b>（有票采购约 '+(100-c.noInv)+'%），工资 '+(c.head*6)+' 万/年（'+c.head+' 人×6 万）；历史少报销售额约 <b>'+c.gap+'</b> 万元，已逾期约 <b>'+c.mon+'</b> 个月。当前由平台代报（9610，无本公司抬头报关单）。';
  return '<div class="scard"><div class="qno">方案 '+(idx+1)+'（20 分）　客户模型</div>'+
    '<div class="cmodel">'+clientLabel(c)+'</div>'+
    '<div class="sub2">'+d+'</div>'+
    '<div class="sub2">请完成（写出计算过程与结果，数值取整到万元）：</div>'+
    '<div class="ansline">① 四步合规方案（报关模式 / 13 栏可行性 / 套餐档位 / 账务落地路径）：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="ansline">② 测算「维持现状（无报关单）」的增值税、企税、综合税负率：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="ansline">③ 测算「合规后（办进出口权+免税备案、取得本公司抬头报关单走出口免税）」的增值税、企税、综合税负率，及较现状节省：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="ansline">④ 测算「历史少报若被稽查」的滞纳金（日万分之五）+ 罚款（0.5~5 倍）合计区间：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="extra">'+CHAMP_EXTRA+'</div></div>';
}
function lightPaperHtml(c, idx){
  var d='客户经营数据：年销售额 <b>'+c.sales+'</b> 万元；团队 <b>'+c.head+'</b> 人。';
  return '<div class="scard"><div class="qno">方案 '+(idx+1)+'（20 分）　客户模型</div>'+
    '<div class="cmodel">'+clientLabel(c)+'</div>'+
    '<div class="sub2">'+d+'</div>'+
    '<div class="sub2">请制定四步合规方案，并测算：若办理进出口权+免税备案、取得本公司抬头报关单走出口免税后，该客户的综合税负率约多少？（写出过程）</div>'+
    '<div class="ansline">① 报关模式：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="ansline">② 13 栏可行性：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="ansline">③ 套餐档位：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="ansline">④ 账务落地路径：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
    '<div class="ansline">⑤ 测算综合税负率：＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div></div>';
}
/* —— 答案端（参考答案） —— */
function champKeyHtml(c, idx){
  var r=champCalc(c);
  var s1='① 四步合规方案：报关模式=9610 零售直发（平台代报→转自有报关）；13 栏=当前无本公司抬头报关单，须先办进出口权+免税备案取得报关单后填报；套餐=一般人星级账（年流水 '+(c.sales>=1000?'超 1000 万走定制':'≤1000 万对应 14888/16888 档')+'）；账务=按平台汇总单 income 申报+平台费明细账+工资/年终奖列支。';
  var s2='② 现状（无报关单、视同内销）：增值税='+c.sales+'×13%='+r.pre.vat+' 万；企税=利润×25%（利润='+c.sales+'−'+(c.sales*c.platFee/100)+'−'+(c.sales*0.1)+'−'+(c.head*6)+'='+(c.sales*0.4-c.head*6).toFixed(1)+' 万）→ '+r.pre.cit+' 万；综合税负率=('+r.pre.vat+'+'+r.pre.cit+')/'+c.sales+'≈'+r.pre.baseRate+'%。';
  var s3='③ 合规后（出口免税）：增值税=0；企税='+r.post.cit+' 万；综合税负率='+r.post.cit+'/'+c.sales+'≈'+r.post.baseRate+'%；较现状节省增值税约 '+r.pre.vat+' 万。（发年终奖 3.6 万/人做工资抵扣，利润降至 300 万内可享 5% 小微优惠，企税进一步下降。）';
  var s4='④ 历史少报 '+c.gap+' 万若被查：增值税='+c.gap+'×13%='+r.hist.vat+' 万；企税≈'+r.hist.cit+' 万；税款合计≈'+r.hist.tax+' 万；滞纳金='+r.hist.tax+'×(逾期 '+c.mon+' 个月≈'+(Math.round(c.mon/12*365))+' 天)×0.05%≈'+r.hist.late+' 万；罚款='+r.hist.tax+'×0.5~×5='+r.hist.fineLow+'~'+r.hist.fineHigh+' 万；合计区间≈'+r.hist.low+'~'+r.hist.high+' 万。';
  return '<div class="akey"><div class="qn" style="display:block">方案 '+(idx+1)+'　客户模型</div><div class="cmodel" style="margin:4px 0 8px">'+clientLabel(c)+'</div>'+
    '<div class="step"><b>客户数据：</b>年销售额 '+c.sales+' 万元；一般纳税人；平台费 '+c.platFee+'%、有票采购 10%、工资 '+(c.head*6)+' 万；历史少报 '+c.gap+' 万、逾期 '+c.mon+' 个月。</div>'+
    '<div class="step"><b>① 四步合规方案（5 分）：</b>'+s1+'</div>'+
    '<div class="step"><b>② 现状税负测算（5 分）：</b>'+s2+'</div>'+
    '<div class="step"><b>③ 合规后税负测算（5 分）：</b>'+s3+'</div>'+
    '<div class="step"><b>④ 历史缺口量化（5 分）：</b>'+s4+'</div>'+
    '<div class="step"><b>附加考核点（销冠加试，参考）：</b>'+CHAMP_EXTRA+'</div></div>';
}
function lightKeyHtml(c, idx){
  var r=lightCalc(c);
  var plan='报关模式='+PLAT[c.platform].ful[c.ful].mode+'（'+PLAT[c.platform].ful[c.ful].n+'）；13 栏='+(c.city==='shenzhen'?'深圳默认开通可直接填报（仍须有报关单）':'外地须先有本公司抬头报关单')+'；套餐='+bPkg(c.entity,c.flow)+'；账务=按平台汇总单 income 申报+平台费明细账+工资/年终奖列支。';
  var calc='合规后出口免税，增值税=0；企税=利润×'+(r.citRate*100)+'%，利润='+c.sales+'−平台费'+(c.sales*0.5)+'−有票采购'+(c.sales*0.1)+'−工资'+(c.head*6)+'='+r.profit+' 万 → 企税='+r.cit+' 万；综合税负率='+r.cit+'/'+c.sales+'≈'+r.baseRate+'%。';
  return '<div class="akey"><div class="qn" style="display:block">方案 '+(idx+1)+'　客户模型</div><div class="cmodel" style="margin:4px 0 8px">'+clientLabel(c)+'</div>'+
    '<div class="step"><b>四步合规方案：</b>'+plan+'</div>'+
    '<div class="step"><b>综合税负率测算：</b>'+calc+'</div></div>';
}
/* —— Word 端纯文本行 —— */
function champPaperLines(c, idx){
  return [
    '方案 '+(idx+1)+'（20 分）　客户模型',
    clientLabel(c),
    '客户经营数据：年销售额 '+c.sales+' 万元；一般纳税人（年销售额已超 500 万）；平台费及物流约占 '+c.platFee+'%；采购无票约 '+c.noInv+'%（有票采购约 '+(100-c.noInv)+'%），工资 '+(c.head*6)+' 万/年；历史少报销售额约 '+c.gap+' 万元，已逾期约 '+c.mon+' 个月。当前由平台代报（9610，无本公司抬头报关单）。',
    '请完成（写出计算过程与结果，数值取整到万元）：',
    '① 四步合规方案（报关模式 / 13 栏可行性 / 套餐档位 / 账务落地路径）：',
    '② 测算「维持现状（无报关单）」的增值税、企税、综合税负率：',
    '③ 测算「合规后（办进出口权+免税备案、取得本公司抬头报关单走出口免税）」的增值税、企税、综合税负率，及较现状节省：',
    '④ 测算「历史少报若被稽查」的滞纳金（日万分之五）+ 罚款（0.5~5 倍）合计区间：'
  ];
}
function lightPaperLines(c, idx){
  return [
    '方案 '+(idx+1)+'（20 分）　客户模型',
    clientLabel(c),
    '客户经营数据：年销售额 '+c.sales+' 万元；团队 '+c.head+' 人。',
    '请制定四步合规方案，并测算：若办理进出口权+免税备案、取得本公司抬头报关单走出口免税后，该客户的综合税负率约多少？（写出过程）',
    '① 报关模式：', '② 13 栏可行性：', '③ 套餐档位：', '④ 账务落地路径：', '⑤ 测算综合税负率：'
  ];
}
function champKeyLines(c, idx){
  var r=champCalc(c);
  return [
    '方案 '+(idx+1)+'　客户模型', clientLabel(c),
    '客户数据：年销售额 '+c.sales+' 万元；一般纳税人；平台费 '+c.platFee+'%、有票采购 10%、工资 '+(c.head*6)+' 万；历史少报 '+c.gap+' 万、逾期 '+c.mon+' 个月。',
    '① 四步合规方案：报关模式=9610 零售直发（平台代报→转自有报关）；13 栏=当前无本公司抬头报关单，须先办进出口权+免税备案取得报关单后填报；套餐=一般人星级账（年流水 '+(c.sales>=1000?'超 1000 万走定制':'≤1000 万对应 14888/16888 档')+'）；账务=按平台汇总单 income 申报+平台费明细账+工资/年终奖列支。',
    '② 现状（无报关单、视同内销）：增值税='+c.sales+'×13%='+r.pre.vat+' 万；企税=利润×25%（利润='+c.sales+'−'+(c.sales*c.platFee/100)+'−'+(c.sales*0.1)+'−'+(c.head*6)+'='+(c.sales*0.4-c.head*6).toFixed(1)+' 万）→ '+r.pre.cit+' 万；综合税负率=('+r.pre.vat+'+'+r.pre.cit+')/'+c.sales+'≈'+r.pre.baseRate+'%。',
    '③ 合规后（出口免税）：增值税=0；企税='+r.post.cit+' 万；综合税负率='+r.post.cit+'/'+c.sales+'≈'+r.post.baseRate+'%；较现状节省增值税约 '+r.pre.vat+' 万。（发年终奖 3.6 万/人做工资抵扣，利润降至 300 万内可享 5% 小微优惠，企税进一步下降。）',
    '④ 历史少报 '+c.gap+' 万若被查：增值税='+c.gap+'×13%='+r.hist.vat+' 万；企税≈'+r.hist.cit+' 万；税款合计≈'+r.hist.tax+' 万；滞纳金='+r.hist.tax+'×(逾期 '+c.mon+' 个月≈'+(Math.round(c.mon/12*365))+' 天)×0.05%≈'+r.hist.late+' 万；罚款='+r.hist.tax+'×0.5~×5='+r.hist.fineLow+'~'+r.hist.fineHigh+' 万；合计区间≈'+r.hist.low+'~'+r.hist.high+' 万。'
  ];
}
function lightKeyLines(c, idx){
  var r=lightCalc(c);
  return [
    '方案 '+(idx+1)+'　客户模型', clientLabel(c),
    '四步合规方案：报关模式='+PLAT[c.platform].ful[c.ful].mode+'（'+PLAT[c.platform].ful[c.ful].n+'）；13 栏='+(c.city==='shenzhen'?'深圳默认开通可直接填报（仍须有报关单）':'外地须先有本公司抬头报关单')+'；套餐='+bPkg(c.entity,c.flow)+'；账务=按平台汇总单 income 申报+平台费明细账+工资/年终奖列支。',
    '综合税负率测算：合规后出口免税，增值税=0；企税=利润×'+(r.citRate*100)+'%，利润='+c.sales+'−平台费'+(c.sales*0.5)+'−有票采购'+(c.sales*0.1)+'−工资'+(c.head*6)+'='+r.profit+' 万 → 企税='+r.cit+' 万；综合税负率='+r.cit+'/'+c.sales+'≈'+r.baseRate+'%。'
  ];
}

var PAPER=null;
function setTier(t){
  TIER=t;
  var bs=document.querySelectorAll('.tier');
  for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on', bs[i].getAttribute('data-t')===t);
  genPaper();
}
function genPaper(){
  var fills=pickFills(5);
  var ex=fills.map(function(f){return f.topic;});
  var singles=pickByTier('single',10,ex,TIER);
  var multis =pickByTier('multi',5,ex,TIER);
  var scen=[]; for(var i=0;i<2;i++){ scen.push(bGenClientTiered(TIER)); }
  PAPER={tier:TIER, single:singles, multi:multis, fill:fills, scen:scen};
  renderPaper(PAPER); renderKey(PAPER);
  document.getElementById('pmeta').textContent='档次：'+TIERNAME[TIER]+' · 编号 '+Math.floor(Math.random()*9000+1000)+' · 生成于 '+new Date().toLocaleDateString('zh-CN');
}

function renderPaper(p){
  var h='<div class="note">考核档次：<b>'+TIERNAME[p.tier]+'</b>（难度递增：新人 &lt; 老人 &lt; 销冠）。'+(
    p.tier==='champ'?'　销冠方案题为<b>复杂客户模型</b>，含附加考核点。':
    p.tier==='new'?'　新人档以基础合规认知为主。':'　老人档为综合应用型。')+'</div>';
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
  h+='<div class="sechead">四、方案题（每题 20 分，共 '+p.scen.length+' 题，合计 '+(p.scen.length*20)+' 分，手写）'+(p.tier==='champ'?'　· 销冠档含复杂客户模型、经营数据与附加考核点，要求按数据测算':'')+'</div>';
  for(var sc=0;sc<p.scen.length;sc++){ var c=p.scen[sc];
    if(c.calc==='full'){ h+=champPaperHtml(c,sc); continue; }
    if(c.calc==='light'){ h+=lightPaperHtml(c,sc); continue; }
    h+='<div class="scard"><div class="qno">方案 '+(sc+1)+'（20 分）　客户模型</div>'+
       '<div class="cmodel">'+clientLabel(c)+'</div>'+
       '<div class="sub2">请为该客户制定合规方案（每步 5 分）：</div>'+
       '<div class="ansline">① 报关模式：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">② 13 栏可行性：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">③ 套餐档位：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">④ 账务落地路径：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       '<div class="ansline">话术要点：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>'+
       (c.extra?'<div class="extra">'+CHAMP_EXTRA+'</div>':'')+'</div>';
  }
  document.getElementById('paper').innerHTML=h;
}

function renderKey(p){
  var h='<div class="note">及格线 <b>'+PASS+'</b> 分 · 满分 '+TOTAL+' 分 · 档次：<b>'+TIERNAME[p.tier]+'</b>。方案题每步 5 分，四步合计 20 分；话术为参考不计分。</div>';
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
  h+='<div class="sechead">四、方案题 标准答案（每题 20 分；销冠含数据测算，四步各 5 分）</div>';
  for(var s2=0;s2<p.scen.length;s2++){ var c=p.scen[s2];
    if(c.calc==='full'){ h+=champKeyHtml(c,s2); continue; }
    if(c.calc==='light'){ h+=lightKeyHtml(c,s2); continue; }
    var std=scenarioStd(c);
    h+='<div class="akey"><div class="qn" style="display:block">方案 '+(s2+1)+'　客户模型</div><div class="cmodel" style="margin:4px 0 8px">'+clientLabel(c)+'</div>';
    for(var x=0;x<std.steps.length;x++){ var st=std.steps[x];
      h+='<div class="step"><b>'+st[0]+'（5 分）：</b>'+esc(st[1])+'<div class="exp">'+esc(st[2])+'</div></div>';
    }
    h+='<div class="step"><b>标准话术参考（不计分）：</b><div class="exp">'+esc(std.talk)+'</div></div>';
    if(c.extra) h+='<div class="step"><b>附加考核点（销冠加试，参考）：</b><div class="exp">'+esc(CHAMP_EXTRA)+'</div></div>';
    h+='</div>';
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
    ch.push(P([R('跨境电商销售顾问 · 考核试卷（'+TIERNAME[PAPER.tier]+'档）',{font:FHei,size:38,bold:true,color:'0C2D5D'})],{align:AlignmentType.CENTER,after:80,line:360}));
    ch.push(P([R('满分 100 分 · 80 分及格 · 四题型：单选 / 多选 / 填空 / 方案'+(PAPER.tier==='champ'?'（销冠档含复杂客户模型与附加考核点）':''),{size:22,color:'595959'})],{align:AlignmentType.CENTER,after:200}));
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
    ch.push(P([R('四、方案题（每题 20 分，共 '+PAPER.scen.length+' 题，合计 '+(PAPER.scen.length*20)+' 分，手写）'+(PAPER.tier==='champ'?'（销冠档含复杂客户模型与附加考核点）':''),{font:FHei,size:26,bold:true,color:'0C2D5D'})],{after:100}));
    var blanks=['① 报关模式：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','② 13 栏可行性：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','③ 套餐档位：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','④ 账务落地路径：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿','话术要点：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿'];
    PAPER.scen.forEach(function(c,s){
      if(c.calc==='full'){ champPaperLines(c,s).forEach(function(t){ ch.push(P([R(t,{size:22})],{indent:400,after:80})); }); return; }
      if(c.calc==='light'){ lightPaperLines(c,s).forEach(function(t){ ch.push(P([R(t,{size:22})],{indent:400,after:80})); }); return; }
      ch.push(P([R('方案 '+(s+1)+'（20 分）　客户模型',{bold:true,size:24})],{after:40}));
      ch.push(P([R(clientLabel(c),{size:22,color:'444444'})],{indent:400,after:40}));
      ch.push(P([R('请为该客户制定合规方案（每步 5 分）：',{bold:true,size:22})],{after:20}));
      blanks.forEach(function(t){ ch.push(P([R(t,{size:22})],{indent:400,after:80})); });
      if(c.extra) ch.push(P([R(CHAMP_EXTRA,{size:21,color:'A85509'})],{indent:400,after:140}));
    });
    var doc=new Document({sections:[{children:ch}]});
    var blob=await Packer.toBlob(doc);
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='跨境电商考核试卷-'+TIERNAME[PAPER.tier]+'档.docx'; document.body.appendChild(a); a.click(); a.remove();
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
    ch.push(P([R('跨境电商销售顾问 · 考核试卷 · 参考答案（'+TIERNAME[PAPER.tier]+'档）',{font:FHei,size:34,bold:true,color:'0C2D5D'})],{align:AlignmentType.CENTER,after:80,line:360}));
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
      if(c.calc==='full'){ champKeyLines(c,s).forEach(function(t){ ch.push(P([R(t,{size:22,color:'333333'})],{indent:400,after:80})); }); return; }
      if(c.calc==='light'){ lightKeyLines(c,s).forEach(function(t){ ch.push(P([R(t,{size:22,color:'333333'})],{indent:400,after:80})); }); return; }
      var std=scenarioStd(c);
      ch.push(P([R('方案 '+(s+1)+'　客户模型',{bold:true,size:24})],{after:20}));
      ch.push(P([R(clientLabel(c),{size:22,color:'444444'})],{indent:400,after:40}));
      std.steps.forEach(function(st){
        ch.push(P([R(st[0]+'（5 分）：'+st[1],{size:24,color:'2f8f5b',bold:true})],{indent:400,after:20}));
        ch.push(P([R(st[2],{size:22,color:'666666'})],{indent:400,after:80}));
      });
      ch.push(P([R('标准话术参考（不计分）：'+std.talk,{size:22,color:'666666'})],{indent:400,after:100}));
      if(c.extra) ch.push(P([R('附加考核点（销冠加试，参考）：'+CHAMP_EXTRA,{size:21,color:'A85509'})],{indent:400,after:140}));
    });
    var doc=new Document({sections:[{children:ch}]});
    var blob=await Packer.toBlob(doc);
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='跨境电商考核试卷-'+TIERNAME[PAPER.tier]+'档-参考答案.docx'; document.body.appendChild(a); a.click(); a.remove();
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

const HTML = HEAD + '<script>' + SCRIPT1 + '<\/script>' + '<script>' + platJs + '<\/script>' + '<script>' + bankJs + '<\/script>' + '<script>' + scenarioJs + '<\/script>' + '<script>' + calcJs + '<\/script>' + '<script>' + SCRIPT3 + '<\/script>' + '</body></html>';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, HTML, 'utf8');
console.log('written:', outPath, 'bytes:', HTML.length, 'platJs len:', platJs.length);
