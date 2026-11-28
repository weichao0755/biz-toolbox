/* 业务链路图 · 模式数据
 * 来源：赛维模式草稿.pdf（用户提供的示意图）
 * 结构：节点(node) + 连线(edge) + 注释框(note) + 模式差异文案(variant)
 * 布局：一张横向链路图（宽 1400），上层采购/销售链，下层仓关/资金链。
 */
(function(scope){
"use strict";

/* ===== 节点类型样式键 =====
 * green 供应商/货代  orange 境内主体/仓库  blue 境外主体  yellow 判断/平台  pink 运营中心  red 风险/税务
 */
var NODES=[
  /* 上层主链（y=210） */
  {id:'supplier', x:60,  y:210, w:132,h:52, shape:'rect', kind:'green',  label:'国内供应商'},
  {id:'trade',    x:270, y:210, w:132,h:52, shape:'rect', kind:'orange', label:'国内贸易公司'},
  {id:'hk',       x:480, y:210, w:132,h:52, shape:'rect', kind:'blue',   label:'HK/境外'},
  {id:'shops',    x:700, y:170, w:250,h:140,shape:'group',kind:'group',  label:'店铺公司群', subs:['店铺公司A 法人张三','店铺公司B 法人李四','店铺公司C 法人王五','店铺公司D 法人赵六']},
  {id:'ops',      x:700, y:365, w:250,h:86, shape:'group',kind:'pink',   label:'境内运营中心', subs:['运营公司','技术/美工']},
  {id:'platform', x:1020,y:210, w:132,h:52, shape:'diamond',kind:'yellow',label:'亚马逊'},
  {id:'buyer',    x:1220,y:210, w:132,h:52, shape:'rect', kind:'green',  label:'消费者'},
  /* 下层仓关链（y=470） */
  {id:'warehouse',x:270, y:485, w:132,h:52, shape:'rect', kind:'orange', label:'国内仓库'},
  {id:'forwarder',x:480, y:485, w:132,h:52, shape:'rect', kind:'green',  label:'货代公司'},
  {id:'customs',  x:700, y:485, w:132,h:52, shape:'diamond',kind:'red',   label:'海关'},
  {id:'tax',      x:960, y:485, w:132,h:52, shape:'diamond',kind:'yellow',label:'FBA仓 / 海外仓'},
  /* 判断/风险节点 */
  {id:'drawback', x:270, y:310, w:132,h:52, shape:'diamond',kind:'red',   label:'税务机关'},
  {id:'third',    x:500, y:130, w:132,h:52, shape:'diamond',kind:'yellow',label:'第三方账户主账户'},
  {id:'taxpath',  x:1080,y:165, w:132,h:52, shape:'diamond',kind:'yellow',label:'资金回流路径'}
];

/* ===== 连线 =====
 * kind: solid 实线 / dash 蓝虚线（货物流）/ red-dot 红点线（资金流）/ gray 灰线
 * label 放在线中点附近
 */
var EDGES=[
  /* —— 主干业务链：常显，不参与开关 —— */
  {from:'supplier',to:'trade',    kind:'solid',  flow:null,     label:'销售商品'},
  {from:'trade',   to:'drawback', kind:'solid',  flow:null,     label:'0110退税', dir:'down'},
  {from:'trade',   to:'hk',       kind:'solid',  flow:null,     label:'出口'},
  {from:'hk',      to:'shops',    kind:'solid',  flow:null,     label:'__HK_TO_SHOP__'},
  {from:'shops',   to:'platform', kind:'solid',  flow:null,     label:'开店'},
  {from:'platform',to:'buyer',    kind:'solid',  flow:null,     label:'零售'},
  {from:'ops',     to:'shops',    kind:'solid',  flow:null,     label:'运营服务'},
  /* —— 货物流（蓝虚线）：订单→货→仓→报关→买家 —— */
  {from:'supplier',to:'warehouse',kind:'dash',   flow:'goods',  label:'发货', path:'left'},
  {from:'warehouse',to:'forwarder',kind:'dash',  flow:'goods',  label:'头程'},
  {from:'forwarder',to:'customs', kind:'dash',   flow:'goods',  label:'报关'},
  {from:'customs', to:'tax',      kind:'dash',   flow:'goods',  label:''},
  {from:'tax',     to:'buyer',    kind:'dash',   flow:'goods',  label:'尾程', path:'right'},
  /* —— 资金流（红点线）：货款→提现→回流 —— */
  {from:'supplier',to:'trade',    kind:'red-dot',flow:'fund',   label:'支付货款', path:'top'},
  {from:'trade',   to:'hk',       kind:'red-dot',flow:'fund',   label:'支付货款', path:'top2'},
  {from:'hk',      to:'third',    kind:'red-dot',flow:'fund',   label:'__WITHDRAW__'},
  {from:'third',   to:'taxpath',  kind:'red-dot',flow:'fund',   label:'__FUND_FLOW__'},
  /* —— 票据流（金长虚线）：供应商发票→出口单证→平台账单 —— */
  {from:'supplier',to:'trade',    kind:'dash',   flow:'invoice',label:'增值税发票', path:'bottom'},
  {from:'trade',   to:'hk',       kind:'dash',   flow:'invoice',label:'出口发票 / 报关单', path:'top3'},
  {from:'platform',to:'shops',    kind:'dash',   flow:'invoice',label:'平台结算单', path:'right2'},
  {from:'third',   to:'ops',      kind:'dash',   flow:'invoice',label:'服务费票据', path:'left2'}
];

/* ===== 三条流开关定义（货物流 / 资金流 / 票据流） ===== */
var FLOW_DEFS={
  goods:{name:'货物流',color:'#2d7fb8',dash:'8 5'},
  fund:{name:'资金流',color:'#c0392b',dash:'2 5'},
  invoice:{name:'票据流',color:'#b8860b',dash:'12 4'}
};
var FLOW_ORDER=['goods','fund','invoice'];

/* ===== 注释框（顶部四块 + 底部税务申报） ===== */
var NOTES=[
  {id:'premise',x:60,  y:30, w:360,h:120,label:'__PREMISE_LABEL__',text:'__PREMISE__'},
  {id:'thirdnote',x:460,y:16, w:280,h:104, text:'__THIRD_NOTE__'},
  {id:'fund',   x:1010,y:16, w:330,h:120,text:'__FUND_NOTE__'},
  {id:'equity', x:1100,y:600,w:280,h:80, text:'__EQUITY_NOTE__'},
  {id:'declare',x:700, y:600, w:400,h:80, text:'__DECLARE_NOTE__'}
];

/* ===== 模式差异 ===== */
var MODES={
  'saiwei1':{
    name:'赛维 1.0（协议控制 · 第三方账户）',
    premiseLabel:'赛维1.0前提条件',
    premise:'一家公司主体，只能注册一个同站点店铺，若平台发现关联（相同网络环境、软件或关联），则会直接封店，封店之后，店铺资金在亚马逊平台未体现资金冻结，需要申请提款或者永久扣留全部资金。\n因此大多会选择一家公司主体开多个站点店铺，或者用多个公司主体，注册站点店铺，形成店铺群模式。',
    hkToShop:'协议控制',
    withdraw:'提现至第三方账户主账户',
    fundFlow:'提现至第三方账户主账户',
    thirdNote:'第三方账户：亚马逊要求每个店铺需要绑定一个店铺主体注册的第三方账户，在店群模式客户业务中，该账号大多为子账号；企业还会注册主账号为HK公司/境外公司账户。',
    fundNote:'资金流：\n1. 收入提现至HK公司账户；\n2. 一部分以货款、运营服务费由HK公司支付给国内贸易公司和境内运营中心主体；\n3. 剩余部分资金在HK按照两级缴纳利得税（8.25%，16.5%）；\n4. 大部分资金回流至国内。',
    equityNote:'股权：赛维100%控股HK公司，因此控制HK公司，最终资金回流至境内主体。',
    declareNote:'税务申报：\n1. 店铺公司0申报；\n2. 国内贸易公司按照外贸收入申报；\n3. 国内投资公司按照境外分红申报纳税。'
  },
  'saiwei2':{
    name:'赛维 2.0（本土账户 · 收入申报）',
    premiseLabel:'赛维2.0前提条件',
    premise:'2026年15号文要求企业把店铺收入申报给税局，赛维1.0店铺收入是0申报的，企业会频繁出现税务申报比对差异。',
    hkToShop:'销售',
    withdraw:'提现至本土银行账户',
    fundFlow:'提现至本土银行账户',
    thirdNote:'第三方账户：亚马逊要求每个店铺需要绑定一个店铺主体注册的第三方账户，在店群模式客户业务中，该账号大多为子账号；企业还会注册主账号为HK公司/境外公司账户。',
    fundNote:'资金流：\n1. 收入提现至本土银行账户；\n2. 店铺主体按照实际销售收入申报纳税；\n3. 剩余部分按当地口径完税；\n4. 资金按需分批回流至国内。',
    equityNote:'股权：赛维100%控股HK公司，因此控制HK公司，最终资金回流至境内主体。',
    declareNote:'税务申报：\n1. 店铺公司按照平台收入如实申报；\n2. 国内贸易公司按照外贸收入申报；\n3. 国内投资公司按照境外分红申报纳税。'
  }
};

/* ===== 报关出口模式族（0110 / 9610 / 9710 / 9810 / 1039） =====
 * 骨架与赛维族不同：供应商 → 出口主体 → 报关 → 海关 → 海外仓/买家 → 平台 → 结汇
 * 各模式差异体现在「报关方式 / 免税退税口径 / 单证要求」三处，数据来自 cross 工具名词速查（公司已验证口径）。
 */
var CUSTOM_NODES=[
  {id:'supplier', x:60,  y:230, w:140,h:56, shape:'rect', kind:'green',  label:'__SUPPLIER__'},
  {id:'exporter', x:280, y:230, w:150,h:56, shape:'rect', kind:'orange', label:'__EXPORTER__'},
  {id:'declare',  x:510, y:230, w:150,h:56, shape:'diamond',kind:'yellow',label:'__DECLARE__'},
  {id:'customs',  x:740, y:230, w:140,h:56, shape:'diamond',kind:'red',   label:'海关'},
  {id:'overseas', x:960, y:230, w:150,h:56, shape:'rect', kind:'blue',   label:'__OVERSEAS__'},
  {id:'platform', x:1180,y:230, w:150,h:56, shape:'diamond',kind:'yellow',label:'__PLATFORM__'},
  {id:'buyer',    x:1180,y:420, w:150,h:56, shape:'rect', kind:'green',  label:'__BUYER__'},
  /* 下层：票据与资金 */
  {id:'invoice',  x:280, y:420, w:150,h:56, shape:'rect', kind:'pink',   label:'__INVOICE__'},
  {id:'tax',      x:510, y:420, w:150,h:56, shape:'diamond',kind:'red',   label:'__TAXMODE__'},
  {id:'fund',     x:740, y:420, w:150,h:56, shape:'rect', kind:'blue',   label:'__FUND__'},
  {id:'settle',   x:960, y:420, w:150,h:56, shape:'rect', kind:'orange', label:'__SETTLE__'}
];
var CUSTOM_EDGES=[
  /* —— 主干业务链：常显 —— */
  {from:'supplier',to:'exporter', kind:'solid',  flow:null,    label:'采购 / 供货'},
  {from:'exporter',to:'declare',  kind:'solid',  flow:null,    label:'__EXPORT_ACT__'},
  {from:'declare', to:'customs',  kind:'solid',  flow:null,    label:'__DECLARE_ACT__'},
  {from:'customs', to:'overseas', kind:'solid',  flow:null,    label:'__CLEAR_ACT__'},
  {from:'overseas',to:'platform', kind:'solid',  flow:null,    label:'__SALE_ACT__'},
  {from:'platform',to:'buyer',    kind:'solid',  flow:null,    label:'__BUYER_ACT__'},
  /* —— 货物流（蓝虚线）：沿主干下方走一遍货物路径 —— */
  {from:'supplier',to:'declare',  kind:'dash',   flow:'goods',  label:'货物离境', path:'bottom'},
  {from:'declare', to:'overseas', kind:'dash',   flow:'goods',  label:'报关放行', path:'bottom'},
  {from:'overseas',to:'buyer',    kind:'dash',   flow:'goods',  label:'送达买家', path:'bottom'},
  /* —— 资金流（红点线）：买家付款→平台→结汇→主体 —— */
  {from:'buyer',   to:'platform', kind:'red-dot',flow:'fund',   label:'支付货款', path:'top'},
  {from:'platform',to:'settle',   kind:'red-dot',flow:'fund',   label:'平台回款', path:'top'},
  {from:'settle',  to:'exporter', kind:'red-dot',flow:'fund',   label:'结汇入公户', path:'top'},
  /* —— 票据流（金长虚线）：进项票→报关单→退税申报 —— */
  {from:'supplier',to:'exporter', kind:'dash',   flow:'invoice',label:'进项发票', path:'bottom'},
  {from:'exporter',to:'declare',  kind:'dash',   flow:'invoice',label:'合同 / 箱单', path:'top'},
  {from:'declare', to:'tax',      kind:'dash',   flow:'invoice',label:'报关单 / 单证', path:'bottom'}
];
var CUSTOM_NOTES=[
  {id:'def',     x:60,  y:20,  w:420,h:110, text:'__DEF_NOTE__'},
  {id:'use',     x:520, y:20,  w:380,h:110, text:'__USE_NOTE__'},
  {id:'limit',   x:930, y:20,  w:410,h:110, text:'__LIMIT_NOTE__'},
  {id:'doc',     x:60,  y:550, w:520,h:110, text:'__DOC_NOTE__'},
  {id:'trap',    x:620, y:550, w:720,h:110, text:'__TRAP_NOTE__'}
];

/* cross 工具名词速查口径（不自造） */
var CUSTOM_MODES={
  'm0110':{
    name:'一般贸易出口 0110', family:'customs',
    supplier:'国内供应商',exporter:'外贸公司 / 生产企业',declare:'一般贸易报关',overseas:'海外客户 / 海外仓',
    platform:'B2B成交',buyer:'境外买家',invoice:'增值税专用发票',taxmode:'免抵退',fund:'出口收汇',settle:'结汇入公户',
    exportAct:'备货',declareAct:'报关',clearAct:'清关',saleAct:'批量销售',buyerAct:'收货付款',
    taxResult:'免抵退申报',fundResult:'外汇核销',
    defNote:'模式定义：\n最正统的出口方式，有票有单走免抵退。销售常把它说成「免税」，其实 0110 是免抵退，两者在申报表上填的地方都不一样。',
    useNote:'适用场景：\nB2B 大货、海外仓批量备货。单证齐全、供应商能开专票的生产型/贸易型企业。',
    limitNote:'边界：\n无单票金额限制；需要增值税专用发票；不适用无票免税；退税按票退（免抵退，不是免税）。',
    docNote:'必备单证：\n报关单、合同、发票、箱单、提单。',
    trapNote:'常见误区：\n销售常把它说成「免税」——0110 走的是免抵退，申报表填列位置不同；无票不能做。'
  },
  'm9610':{
    name:'跨境电商零售出口 9610', family:'customs',
    supplier:'国内供应商 / 平台卖家',exporter:'跨境电商企业',declare:'清单核放',overseas:'境外消费者',
    platform:'跨境电商平台',buyer:'终端买家',invoice:'无票 / 普票',taxmode:'无票免税',fund:'平台回款',settle:'结汇入公户',
    exportAct:'零售直发',declareAct:'清单核放',clearAct:'出境',saleAct:'平台成交',buyerAct:'签收',
    taxResult:'汇总申报免税',fundResult:'平台结汇',
    defNote:'模式定义：\n跨境电商零售出口（清单核放、汇总申报）。零售小包专用，一票一清单，月底汇总报关。',
    useNote:'适用场景：\nB2C 零售直发、平台小包。综试区注册企业可享无票免税（财税〔2018〕103 号）。',
    limitNote:'边界：\n单票 5000 元（单件不可分割可超）；发票不强制；只免不退，不能退税。',
    docNote:'必备单证：\n出口清单、汇总报关单、物流单号、平台订单号。',
    trapNote:'常见误区：\n最容易把 9610 和 9810 混为一谈，跟着写「可退税」——9610 只免不退。平台代报时卖家拿不到报关主体，无票免税也受限。'
  },
  'm9710':{
    name:'跨境电商 B2B 直接出口 9710', family:'customs',
    supplier:'国内供应商',exporter:'跨境电商企业',declare:'9710报关',overseas:'境外企业买家',
    platform:'B2B平台',buyer:'境外采购商',invoice:'增值税专用发票',taxmode:'按票退税',fund:'B2B 收汇',settle:'结汇入公户',
    exportAct:'线上成交',declareAct:'9710 报关',clearAct:'清关',saleAct:'B2B 交易',buyerAct:'付款收货',
    taxResult:'按票退税',fundResult:'外汇核销',
    defNote:'模式定义：\n跨境电商 B2B 直接出口——线上成交的企业对企业出口。',
    useNote:'适用场景：\n阿里国际站等 B2B 线上订单。很多客户不知道自己能走，属于方案加分项。',
    limitNote:'边界：\n无单票金额限制；需要发票；退税按票退。',
    docNote:'必备单证：\n报关单、线上订单、合同、发票。',
    trapNote:'常见误区：\n客户以为是 B2C 就随便走 9610；线上 B2B 订单应走 9710，可正常按票退税。'
  },
  'm9810':{
    name:'跨境电商出口海外仓 9810', family:'customs',
    supplier:'国内供应商',exporter:'跨境电商企业',declare:'9810报关',overseas:'FBA / 自建海外仓',
    platform:'跨境电商平台',buyer:'终端买家',invoice:'进项专票（退税需要）',taxmode:'离境即退税',fund:'平台回款',settle:'结汇入公户',
    exportAct:'头程备货',declareAct:'9810 报关',clearAct:'入海外仓',saleAct:'本地销售',buyerAct:'签收',
    taxResult:'离境即可申报',fundResult:'销售后结算',
    defNote:'模式定义：\n跨境电商出口海外仓——先备货到海外仓，卖出后再结算。',
    useNote:'适用场景：\nFBA 头程、自建/租赁海外仓备货。只有当卖家是报关主体、且拿得到自己名下报关单时，9810 才成立。',
    limitNote:'边界：\n无单票金额限制；退税需要增值税专票；可做无票免税；退税按票退（离境即退税按属地口径）。',
    docNote:'必备单证：\n报关单、海外仓备案、进项专票、后续销售数据。',
    trapNote:'常见误区：\n平台代报就不成立 9810。9810 可做预退税（离境即退税），但公司不建议——流程复杂、目前暂无退税到账案例，建议走常规免税流程。'
  },
  'm1039':{
    name:'市场采购贸易 1039', family:'customs',
    supplier:'专业市场商户',exporter:'市场采购贸易主体',declare:'1039报关',overseas:'境外采购商',
    platform:'专业市场',buyer:'境外买家',invoice:'无进项票',taxmode:'免征不退',fund:'市场采购收汇',settle:'结汇入公户',
    exportAct:'市场集货',declareAct:'1039 报关',clearAct:'清关',saleAct:'市场交易',buyerAct:'付款收货',
    taxResult:'免征不退',fundResult:'外汇结算',
    defNote:'模式定义：\n市场采购贸易——专业市场小商品，无票也能合法出口。',
    useNote:'适用场景：\n无进项票的小商品、个体户货源。“免征不退”是捆绑的：选了免征就永远不能退，不能既免又退。',
    limitNote:'边界：\n单票 15 万美元以下；不需要发票；可免征不退；不可退税。只能在试点市场区域操作。',
    docNote:'必备单证：\n市场采购报关单、采购商备案。',
    trapNote:'常见误区：\n以为“免征”还能再退税——1039 是免征不退捆绑，选了就永远不能退；且只能在试点市场区域操作。'
  }
};

function fillCustom(key){
  var m=CUSTOM_MODES[key]||CUSTOM_MODES.m0110;
  var map={
    SUPPLIER:m.supplier,EXPORTER:m.exporter,DECLARE:m.declare,OVERSEAS:m.overseas,PLATFORM:m.platform,BUYER:m.buyer,
    INVOICE:m.invoice,TAXMODE:m.taxmode,FUND:m.fund,SETTLE:m.settle,
    EXPORT_ACT:m.exportAct,DECLARE_ACT:m.declareAct,CLEAR_ACT:m.clearAct,SALE_ACT:m.saleAct,BUYER_ACT:m.buyerAct,
    TAX_RESULT:m.taxResult,FUND_RESULT:m.fundResult,
    DEF_NOTE:m.defNote,USE_NOTE:m.useNote,LIMIT_NOTE:m.limitNote,DOC_NOTE:m.docNote,TRAP_NOTE:m.trapNote
  };
  var rep=function(s){ var out=String(s); Object.keys(map).forEach(function(k){ out=out.split('__'+k+'__').join(map[k]); }); return out; };
  return {
    nodes:CUSTOM_NODES.map(function(n){return Object.assign({},n,{label:rep(n.label)});}),
    edges:CUSTOM_EDGES.map(function(e){return Object.assign({},e,{label:rep(e.label)});}),
    notes:CUSTOM_NOTES.map(function(n){return Object.assign({},n,{text:rep(n.text)});}),
    mode:m
  };
}

/* 主题色（暖金极简） */
var THEME={
  green:'#e8f4e6',greenLine:'#7fae76',greenText:'#2f5a2a',
  orange:'#f9ead6',orangeLine:'#d9a95f',orangeText:'#8a5a15',
  blue:'#e2ecf7',blueLine:'#7b9dc4',blueText:'#2d5280',
  yellow:'#fdf3d9',yellowLine:'#c9a13c',yellowText:'#8a6a12',
  pink:'#f8e8ef',pinkLine:'#d49cba',pinkText:'#8a3d63',
  red:'#fde8e6',redLine:'#d97b72',redText:'#a3362c',
  group:'#fdf4e6',groupLine:'#e0c89a',
  bg:'#fffefb',ink:'#2a2118',muted:'#8a7a62',accent:'#b45309'
};

function fillMode(mode){
  var m=MODES[mode]||MODES.saiwei1;
  var rep=function(s){ return String(s)
    .split('__PREMISE_LABEL__').join(m.premiseLabel)
    .split('__PREMISE__').join(m.premise)
    .split('__THIRD_NOTE__').join(m.thirdNote)
    .split('__FUND_NOTE__').join(m.fundNote)
    .split('__EQUITY_NOTE__').join(m.equityNote)
    .split('__DECLARE_NOTE__').join(m.declareNote)
    .split('__HK_TO_SHOP__').join(m.hkToShop)
    .split('__WITHDRAW__').join(m.withdraw)
    .split('__FUND_FLOW__').join(m.fundFlow);
  };
  return {
    nodes:NODES.map(function(n){return Object.assign({},n,{label:rep(n.label),subs:(n.subs||[]).map(rep)});}),
    edges:EDGES.map(function(e){return Object.assign({},e,{label:rep(e.label)});}),
    notes:NOTES.map(function(n){return Object.assign({},n,{label:rep(n.label||''),text:rep(n.text)});}),
    mode:m
  };
}

/* ===== 自定义链路图：销售填节点/连线，自动排版 ===== */
var CUSTOM_KEY='flow_custom_v1';
var CUSTOM_DEFAULT={
  nodes:[
    {id:'n1',name:'供应商'},
    {id:'n2',name:'出口主体'},
    {id:'n3',name:'报关行'},
    {id:'n4',name:'海外仓'},
    {id:'n5',name:'平台'},
    {id:'n6',name:'消费者'}
  ],
  edges:[
    {from:'n1',to:'n2',flow:null,label:'采购'},
    {from:'n2',to:'n3',flow:null,label:'报关'},
    {from:'n3',to:'n4',flow:'goods',label:'头程'},
    {from:'n4',to:'n5',flow:'goods',label:'备货'},
    {from:'n5',to:'n6',flow:'goods',label:'销售'},
    {from:'n1',to:'n2',flow:'invoice',label:'进项票'},
    {from:'n6',to:'n5',flow:'fund',label:'支付货款'}
  ]
};
function loadCustom(){
  try{ var s=JSON.parse(localStorage.getItem(CUSTOM_KEY)||'null');
    if(s&&Array.isArray(s.nodes)&&Array.isArray(s.edges)) return s;
  }catch(e){}
  return JSON.parse(JSON.stringify(CUSTOM_DEFAULT));
}
function saveCustom(o){ try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(o));}catch(e){} }
/* 拓扑分层排版：入度0在最左列，按边逐层右推；同列纵向均分 */
function autoLayout(nodes,edges){
  var idx={},indeg={},out={};
  nodes.forEach(function(n,i){ idx[n.id]=i; indeg[n.id]=0; out[n.id]=[]; });
  /* 资金流常是反向（买家→平台），不参与拓扑分层，否则节点被推到后面 */
  edges.forEach(function(e){ if(e.flow==='fund') return; if(idx[e.from]!=null&&idx[e.to]!=null){ indeg[e.to]++; out[e.from].push(e.to); } });
  /* 分层（限制层数防环导致死循环） */
  var layer={}, queue=[], cnt=0;
  nodes.forEach(function(n){ if(indeg[n.id]===0){ layer[n.id]=0; queue.push(n.id); } });
  while(queue.length && cnt++<200){
    var id=queue.shift(), nd=out[id];
    nd.forEach(function(to){ var L=(layer[id]!=null?layer[id]:0)+1; if(layer[to]==null||L>layer[to]){ layer[to]=L; queue.push(to); } });
  }
  nodes.forEach(function(n){ if(layer[n.id]==null) layer[n.id]=0; });
  /* 按层分组，超出6层的压到第6层 */
  var cols={};
  nodes.forEach(function(n){ var L=Math.min(layer[n.id]||0,5); (cols[L]=cols[L]||[]).push(n.id); });
  var keys=Object.keys(cols).map(Number).sort(function(a,b){return a-b;});
  var pos={};
  keys.forEach(function(L){
    var arr=cols[L], per=Math.max(1,Math.floor(6/arr.length));
    arr.forEach(function(id,i){ pos[id]={x:60+L*215, y:170+(i-(arr.length-1)/2)*110}; });
  });
  return pos;
}
function fillCustomUser(data){
  data=data||CUSTOM_DEFAULT;
  var nodes=(data.nodes||[]).map(function(n){ return Object.assign({},n); });
  var edges=(data.edges||[]).filter(function(e){ return e.from&&e.to&&e.from!==e.to; });
  var pos=autoLayout(nodes,edges);
  var outNodes=nodes.map(function(n,i){
    var p=pos[n.id]||{x:60+(i%6)*215,y:170+Math.floor(i/6)*110};
    return {id:n.id, x:p.x, y:p.y, w:130, h:52, shape:'rect', kind:'orange', label:n.name||n.id};
  });
  var outEdges=edges.map(function(e,i){ return {id:'e'+i,from:e.from,to:e.to,kind:e.flow==='fund'?'red-dot':'solid',flow:e.flow||null,label:e.label||''}; });
  return {
    nodes:outNodes, edges:outEdges, notes:[],
    mode:{name:'自定义链路图',defNote:'',useNote:'',limitNote:'',docNote:'',trapNote:''}
  };
}

scope.FlowData={NODES:NODES,EDGES:EDGES,NOTES:NOTES,MODES:MODES,CUSTOM_MODES:CUSTOM_MODES,THEME:THEME,FLOW_DEFS:FLOW_DEFS,FLOW_ORDER:FLOW_ORDER,fillMode:fillMode,fillCustom:fillCustom,CUSTOM_KEY:CUSTOM_KEY,CUSTOM_DEFAULT:CUSTOM_DEFAULT,loadCustom:loadCustom,saveCustom:saveCustom,autoLayout:autoLayout,fillCustomUser:fillCustomUser};
})(typeof window!=='undefined'?window:globalThis);
