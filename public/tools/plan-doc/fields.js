/* 详细参数字段池 · 按主题分组
 * 每个行业通过 groups:[{t:'组名',keys:[...]}] 引用；平铺 fields 仍保留兼容。
 * 设计原则：销售照着填，字段尽量覆盖影响方案结论的真实经营信息；不诱导编造。 */
(function(scope){
"use strict";

/* ============ 字段池（key → 字段定义） ============ */
var F={
  /* A 基本盘 */
  cid:{k:'cid',label:'客户名称 / 编号',type:'text',ph:'例：深圳某某科技 / A001'},
  subs:{k:'subs',label:'主体数量',type:'select',opts:['1 个','2 个','3 个及以上']},
  founded:{k:'founded',label:'公司成立时间',type:'select',opts:['','2026 年','2025 年','2024 年及以前','刚注册还没开始','待确认']},
  city:{k:'city',label:'注册城市',type:'text',ph:'例：深圳 / 广州 / 义乌 / 深圳、东莞'},
  entity:{k:'entity',label:'纳税人身份',type:'select',opts:['','小规模纳税人','一般纳税人','个人 / 个体户','待确认']},
  flow:{k:'flow',label:'年销售额（万元）',type:'text',ph:'例：300'},
  staffN:{k:'staffN',label:'员工人数（含兼职）',type:'text',ph:'例：5'},
  /* B 经营盘面 */
  plats:{k:'plats',label:'经营平台 / 渠道',type:'chips',opts:['亚马逊','TikTok Shop','Temu','Shopee','速卖通','Ozon','独立站','淘宝/天猫','拼多多','抖音电商','京东','小红书','视频号','其他']},
  shopN:{k:'shopN',label:'店铺 / 站点数量',type:'text',ph:'例：3 个店铺 / 5 个站点'},
  category:{k:'category',label:'主营品类',type:'text',ph:'例：3C 配件 / 服装 / 家居 / 美妆'},
  skuN:{k:'skuN',label:'在售 SKU 数量',type:'text',ph:'例：200'},
  avgPrice:{k:'avgPrice',label:'客单价（元）',type:'text',ph:'例：150'},
  orderN:{k:'orderN',label:'年订单量（万单）',type:'text',ph:'例：8'},
  salesChannel:{k:'salesChannel',label:'主要销售模式',type:'select',opts:['','平台自营/店铺','平台代运营','经销/批发','线上线下结合','待确认']},
  /* C 跨境专属：报关与物流 */
  decl:{k:'decl',label:'报关抬头情况',type:'select',opts:['','已有本公司抬头报关单/清单','平台或物流代报、无自有凭证','买单出口、无自有凭证','待确认']},
  ful:{k:'ful',label:'发货方式',type:'select',opts:['','FBA / 平台仓','自建或租赁海外仓','直邮 / 小包 / 专线','一般贸易整柜','市场采购 1039','待确认']},
  declMode:{k:'declMode',label:'报关模式',type:'select',opts:['','9810 海外仓','9610 零售直发','0110 一般贸易','1039 市场采购','不清楚 / 待确认']},
  impExp:{k:'impExp',label:'是否已办进出口权',type:'select',opts:['','已办理','未办理','办理中','待确认']},
  taxFiling:{k:'taxFiling',label:'是否已办出口免税备案',type:'select',opts:['','已备案','未备案','办理中','待确认']},
  dest:{k:'dest',label:'主要出口市场',type:'text',ph:'例：美国 / 欧盟 / 东南亚'},
  forwarder:{k:'forwarder',label:'货代 / 物流合作情况',type:'select',opts:['','有稳定货代','货代频繁更换','走平台指定物流','待确认']},
  customsFee:{k:'customsFee',label:'报关费用（元/票）',type:'text',ph:'例：80~300'},
  /* C' 国内专属 + 共用：票据与成本 */
  invoice:{k:'invoice',label:'供应商发票情况',type:'select',opts:['','能开专票','主要是普票','大多无票','部分能开','待确认']},
  platInvoice:{k:'platInvoice',label:'平台费用是否已申请发票',type:'select',opts:['','已按月申请','部分申请','从没申请过','不知道能申请','待确认']},
  platCostPct:{k:'platCostPct',label:'平台费用占销售额比例',type:'select',opts:['','20% 以下','20%~40%','40%~60%','60% 以上','不清楚']},
  purchasePct:{k:'purchasePct',label:'采购成本占销售额比例',type:'select',opts:['','20% 以下','20%~40%','40%~60%','60% 以上','不清楚']},
  noTicketPct:{k:'noTicketPct',label:'无票成本占比',type:'select',opts:['','几乎没有','30% 以下','30%~60%','60% 以上','不清楚']},
  laborCost:{k:'laborCost',label:'年人力成本（万元）',type:'text',ph:'例：36'},
  /* D 账务与申报 */
  bookStatus:{k:'bookStatus',label:'当前记账方式',type:'select',opts:['','代理记账（一笔打包）','自建明细账','有账但不全','基本没账','待确认']},
  declMethod:{k:'declMethod',label:'增值税申报方式',type:'select',opts:['','按实际申报','按回款申报','零申报','核定征收','待确认']},
  invoiceIssue:{k:'invoiceIssue',label:'开票情况',type:'select',opts:['','正常开票','很少开票','客户大多不要票','待确认']},
  bankAccount:{k:'bankAccount',label:'收款账户情况',type:'select',opts:['','基本公户','部分私户 / 第三方','几乎全私户','待确认']},
  reconcile:{k:'reconcile',label:'账 / 票 / 款是否能对上',type:'select',opts:['','能对上','部分对不上','完全对不上','从没核对过']},
  /* E 历史与风险 */
  hist:{k:'hist',label:'历史申报情况',type:'select',opts:['','一直零申报','按回款申报','按实际申报','收到税局短信','刚起步无历史','待确认']},
  smsQ:{k:'smsQ',label:'税局短信涉及季度',type:'text',ph:'例：2025 Q3、Q4（没有可不填）'},
  histGap:{k:'histGap',label:'预估历史缺口（万元）',type:'text',ph:'例：200（不清楚可不填）'},
  startMonth:{k:'startMonth',label:'开始经营时间',type:'text',ph:'例：2025-07 / 记不清'},
  taxRisk:{k:'taxRisk',label:'客户目前最担心的事',type:'text',ph:'例：怕被查、怕补税、怕影响店铺'},
  /* F 诉求与决策 */
  need:{k:'need',label:'客户主要诉求',type:'chips',opts:['合规报关','出口免税','账务规范','历史数据更正','成本票缺失','税负优化','资质办理','风险排查','回头看账']},
  deadline:{k:'deadline',label:'时间要求',type:'select',opts:['','越快越好','本月内','季度内','不着急','待确认']},
  decision:{k:'decision',label:'决策人',type:'select',opts:['','老板本人拍板','运营负责人','财务负责人','多人共同决定','待确认']},
  budget:{k:'budget',label:'预算敏感度',type:'select',opts:['','价格敏感，要对比','看价值，合理就行','预算充足','待确认']},
  competitor:{k:'competitor',label:'是否在对比其他服务商',type:'select',opts:['','是，在对比','否，只找我们','还没定','待确认']},
  relationship:{k:'relationship',label:'客户来源 / 关系',type:'select',opts:['','老客户介绍','自己找来','渠道转介绍','我们主动联系','待确认']},
  note:{k:'note',label:'补充信息（客户原话 / 特殊情况）',type:'textarea',ph:'例：老板本人不在国内，真正拍板的是运营主管；平台后台数据完整；之前找过一家代账做砸了……'}
};

/* ============ 分组定义 ============ */
var GROUPS={
  cross:[
    {t:'A · 基本盘',keys:['cid','subs','founded','city','entity','flow','staffN']},
    {t:'B · 经营盘面',keys:['plats','shopN','category','skuN','avgPrice','orderN','salesChannel']},
    {t:'C · 报关与物流',keys:['decl','ful','declMode','impExp','taxFiling','dest','forwarder','customsFee']},
    {t:'D · 票据与成本',keys:['invoice','platInvoice','platCostPct','purchasePct','noTicketPct','laborCost']},
    {t:'E · 账务与申报',keys:['bookStatus','declMethod','invoiceIssue','bankAccount','reconcile']},
    {t:'F · 历史与风险',keys:['hist','smsQ','histGap','startMonth','taxRisk']},
    {t:'G · 诉求与决策',keys:['need','deadline','decision','budget','competitor','relationship','note']}
  ],
  domestic:[
    {t:'A · 基本盘',keys:['cid','subs','founded','city','entity','flow','staffN']},
    {t:'B · 经营盘面',keys:['plats','shopN','category','skuN','avgPrice','orderN','salesChannel']},
    {t:'C · 票据与成本',keys:['invoice','platInvoice','platCostPct','purchasePct','noTicketPct','laborCost']},
    {t:'D · 账务与申报',keys:['bookStatus','declMethod','invoiceIssue','bankAccount','reconcile']},
    {t:'E · 历史与风险',keys:['hist','smsQ','histGap','startMonth','taxRisk']},
    {t:'F · 诉求与决策',keys:['need','deadline','decision','budget','competitor','relationship','note']}
  ]
};

function fieldsFor(industryKey){
  var gs=GROUPS[industryKey];
  if(!gs) return null;
  var out=[];
  gs.forEach(function(g){ g.keys.forEach(function(k){ if(F[k]) out.push(F[k]); }); });
  return out;
}
function groupsFor(industryKey){ return GROUPS[industryKey]||null; }

scope.Fields={F:F,GROUPS:GROUPS,fieldsFor:fieldsFor,groupsFor:groupsFor};
})(typeof window!=='undefined'?window:globalThis);
