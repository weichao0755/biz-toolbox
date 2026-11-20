/* 深度方案模板 · 跨境电商 + 国内电商
 * 原则（同 cross）：规则引擎定结论，AI 只做措辞。所有判定/步骤/话术由本文件生成，
 * 不交给 AI 决定；AI 仅在 genOutline 里把要点连成通顺对客文本，不得改结论、不得加数字。
 * 依赖：engine.js（cross 抽取的判定/测算核心，跨境电商复用）；国内电商用同构自建规则。
 */
(function(scope){
"use strict";

/* ============================================================
   行业一：跨境电商 —— 复用 cross 引擎
   ============================================================ */
var CrossDeep={
  /* 把本工具表单参数映射成 cross 引擎需要的 TK / A 结构 */
  toTK:function(p,E){
    var plats=(p.plats||[]).map(function(n){ return crossKey(n); }).filter(Boolean);
    if(!plats.length) plats=['amazon'];
    var declKey=/自有抬头|报关单/.test(p.decl||'')?'own':(/代报|平台/.test(p.decl||'')?'plat':(/买单|无自有/.test(p.decl||'')?'maidan':'na'));
    /* 履约方式：优先读独立的 p.ful 字段，否则从备注/诉求推断 */
    var wantWh=/海外仓|FBA/.test((p.ful||'')+' '+(p.need||[]).join('')+' '+(p.note||''));
    var fulKey='';
    var P=(E&&E.PLAT)?E.PLAT[plats[0]]:null;
    if(P&&P.ful){
      var ks=Object.keys(P.ful);
      fulKey=wantWh ? (ks.indexOf('wh')>=0?'wh':ks[0]) : (/直邮|小包|专线/.test(p.ful||'')?(ks.indexOf('direct')>=0?'direct':ks[0]):ks[0]);
    }
    if(!fulKey) fulKey='direct';
    var entityKey=/一般/.test(p.entity||'')?'general':(/个人|个体/.test(p.entity||'')?'person':(/小规模/.test(p.entity||'')?'small':'na'));
    var fileSrc=(p.declMethod||'')+' '+(p.hist||'');
    var fileKey=/零申报/.test(fileSrc)?'zero':(/回款/.test(fileSrc)?'cash':(/实际/.test(fileSrc)?'real':'na'));
    var isNew=/刚起步|无历史/.test(p.hist||'')||/刚注册/.test(p.founded||'');
    var sms=/短信/.test(p.hist||'')?'y':'n';
    var fm=/^(\d{4})-(\d{1,2})$/.exec(p.startMonth||'');
    var hasIE=/已办理|已办/.test(p.impExp||''), hasTF=/已备案|已办/.test(p.taxFiling||'');
    var subsM=parseInt(String(p.subs||''),10);
    var TK={
      cid:p.cid||'',subs:isNaN(subsM)?1:subsM,plats:plats,
      fuls:{},decls:{},city:/深圳/.test(p.city||'')?'sz':'out',cityText:p.city||'',
      flow:parseFloat(p.flow)||null,impExp:hasIE,taxFiling:hasTF,
      entity:entityKey,file:fileKey,hist:isNew?'new':'',startMonth:fm?p.startMonth:(isNew?'2026-01':''),
      invoice:/无票|开不了|大多/.test(p.invoice||'')?'none':(/专票/.test(p.invoice||'')?'special':'normal'),
      qual:(hasIE&&hasTF)?'both':(hasIE?'qualOnly':'none'),
      staff:'no',staffN:parseFloat(p.staffN)||null,sms:sms,
      quarters:[],amt:null,qna:false,fresh:isNew,
      genHist:'auto',genFine:'auto',genHed:'auto',asks:[],log:[],confAck:[]
    };
    plats.forEach(function(k){ TK.fuls[k]=fulKey; TK.decls[k]=declKey; });
    var A={
      cid:TK.cid,platforms:plats,platform:plats[0],fuls:TK.fuls,decls:TK.decls,
      ful:fulKey,decl:declKey,city:TK.city==='sz'?'shenzhen':'other',szExempt:TK.city==='sz',
      entity:entityKey,flow:TK.flow,sms:sms,smsQ:[],smsAmt:'na',file:fileKey,
      startMonth:TK.startMonth,hist:isNew?'new':'',invoice:TK.invoice,qual:TK.qual,
      impExp:TK.impExp,taxFiling:TK.taxFiling,staff:'no',staffN:TK.staffN
    };
    return {TK:TK,A:A};
  },
  /* 用规则引擎出结构化结论 */
  build:function(p,E){
    var m=CrossDeep.toTK(p,E);
    scope.TK=m.TK; scope.A=m.A;
    var d={decl:m.TK.decls[m.TK.plats[0]]||'na'};
    var checks=E.planCheck(d);
    var clientChecks=E.ckClient(d);
    var derived=E.derive();
    var htc=E.histTaxCompare();
    var isNew=E.custNew();
    var road=[];
    /* 落地方案：规则驱动（不靠 AI） */
    if(!m.TK.impExp||!m.TK.taxFiling){
      road.push({t:'办理出口资质与免税备案',time:'以主管部门实际出件为准',
        acts:['经营范围增加货物进出口、技术进出口','办理进出口权与收发货人 / 跨境电商企业备案','申领电子口岸 IC 卡','办理出口免税备案，开通申报表 13 栏'],
        cli:['营业执照副本、公章','法人及操作员身份证'],done:'取得 IC 卡，13 栏可填报'});
    }
    road.push({t:'切换报关抬头、核对报关凭证',time:'按货代实际出单时间',
      acts:['与货代确认后续报关凭证以贵司抬头出具','按平台模式走通报关（9810 四项动作 / 9610 索取报关清单）','逐票核对：报关离岸价按国内采购成本加合理利润申报，与采购成本匹配'],
      cli:['货代对接人','SKU、重量、单价与物流资料'],done:'取得贵司抬头的报关凭证，离岸价与采购成本对得上'});
    road.push({t:'按汇总单如实申报、建立明细账',time:'首期申报期内',
      acts:['按平台后台汇总单（销售额−退货）如实申报收入','平台佣金、配送、仓储、广告等按汇总单逐月录入明细账','供应商按票规划，无票部分单列'],
      cli:['平台月度汇总单','供应商票据'],done:'申报收入与平台数据一致，成本明细可追溯'});
    if(isNew){
      road.push({t:'建立规范账务（新主体）',time:'持续',
        acts:['从第一票起按明细账核算，不留历史包袱','企业所得税按真实利润据实申报','按月归集报关凭证与申报表'],
        cli:['每月汇总单','报关凭证'],done:'形成稳定的合规申报口径'});
    }else if(!E.noVatRisk()){
      road.push({t:'处理历史申报数据',time:'合规跑通后启动',
        acts:['调取对应季度汇总单，与原申报表比对形成缺口表','按出口免税口径与税管员沟通更正','金额以逐季核对结果为准'],
        cli:['历史季度汇总单','原申报表与完税凭证'],done:'历史数据形成明确处理结论'});
    }
    return {
      industry:'跨境电商',isNew:isNew,checks:checks,clientChecks:clientChecks,
      derived:{plat:derived.platN,ful:derived.n,mode:derived.mode,mian:derived.mian,tui:derived.tui},
      htc:{ok:htc.ok,realProfit:htc.realProfit,citRate:htc.citRate,hed:htc.hed,sales:htc.sales},
      roadmap:road,
      facts:p,
      /* 给 AI 的事实要点（规则已定结论，AI 只连成文字） */
      points:[
        '客户：'+(p.cid||'待确认')+'；平台：'+((p.plats||[]).join('、')||'待确认')+'；城市：'+(p.city||'待确认'),
        '纳税人身份：'+(p.entity||'待确认')+'；年销售额：'+(p.flow||'待确认')+' 万元',
        '报关情况：'+(p.decl||'待确认')+'；历史申报：'+(p.hist||'待确认'),
        '合规诊断共 '+checks.length+' 项：'+checks.map(function(c){return c.dir+'('+({bad:'不合规',warn:'待确认',ok:'合规'}[c.v]||c.v)+')';}).join('、'),
        '判定：'+derived.platN+' / '+derived.n+' / 模式 '+derived.mode+' / 免税 '+derived.mian+' / 退税 '+derived.tui,
        isNew?'客户为新主体，无历史存量需要处理，方案按未来正常税负视角展开':'客户存在历史经营，按实际申报情况处理历史数据',
        '落地方案 '+road.length+' 步：'+road.map(function(r,i){return (i+1)+'.'+r.t;}).join(' ')
      ].concat(detailPoints(p))
    };
  }
};

/* 把销售填的详细参数整理成「已定事实要点」——AI 只能据此措辞，不得新增。
   只输出实际填写的字段，按主题拼成几行，避免逐项罗列太碎。 */
function detailPoints(p){
  var out=[];
  function line(title,pairs){
    var a=[];
    pairs.forEach(function(x){
      var v=p[x[0]];
      if(v==null||v===''||(Array.isArray(v)&&!v.length))return;
      a.push(x[1]+'：'+(Array.isArray(v)?v.join('、'):v));
    });
    if(a.length) out.push(title+'——'+a.join('；')+'。');
  }
  line('客户基本资料',[['cid','客户'],['subs','主体数量'],['founded','成立时间'],['city','注册城市'],['entity','纳税人身份'],['flow','年销售额(万元)'],['staffN','员工人数']]);
  line('经营盘面',[['plats','平台'],['shopN','店铺/站点'],['category','主营品类'],['skuN','SKU数'],['avgPrice','客单价'],['orderN','年订单量'],['salesChannel','销售模式']]);
  line('报关与资质',[['decl','报关抬头'],['ful','发货方式'],['declMode','报关模式'],['impExp','进出口权'],['taxFiling','免税备案'],['dest','出口市场'],['forwarder','货代'],['customsFee','报关费']]);
  line('票据与成本',[['invoice','供应商票'],['platInvoice','平台费发票'],['platCostPct','平台费占比'],['purchasePct','采购占比'],['noTicketPct','无票占比'],['laborCost','年人力成本']]);
  line('账务与申报',[['bookStatus','记账方式'],['declMethod','增值税申报'],['invoiceIssue','开票情况'],['bankAccount','收款账户'],['reconcile','账票款核对']]);
  line('历史与风险',[['hist','历史申报'],['smsQ','短信季度'],['histGap','预估缺口'],['startMonth','开始经营'],['taxRisk','客户最担心']]);
  line('诉求与决策',[['need','主要诉求'],['deadline','时间要求'],['decision','决策人'],['budget','预算敏感'],['competitor','对比服务商'],['relationship','客户来源']]);
  if(p.note) out.push('销售补充信息——'+p.note+'。');
  return out;
}

/* 平台中文名 → cross 引擎 key */
function crossKey(n){
  n=String(n||'');
  if(/亚马逊|Amazon/i.test(n))return 'amazon';
  if(/TikTok/i.test(n))return 'tiktok';
  if(/Temu/i.test(n))return 'temu';
  if(/Shopee|虾皮/i.test(n))return 'shopee';
  if(/Ozon/i.test(n))return 'ozon';
  if(/速卖通|AliExpress/i.test(n))return 'aliexpress';
  if(/独立站|Shopify/i.test(n))return 'independent';
  return ''; // 其他走默认 amazon
}

/* ============================================================
   行业二：国内电商 —— 同构自建规则（不依赖 cross 引擎的报关逻辑）
   ============================================================ */
var DomesticDeep={
  build:function(p){
    var flow=parseFloat(p.flow)||0;
    var entity=/一般/.test(p.entity||'')?'一般纳税人':(/个人|个体/.test(p.entity||'')?'个人 / 个体户':(/小规模/.test(p.entity||'')?'小规模纳税人':'待确认'));
    var fileKey=/零申报/.test(p.decl||'')?'zero':(/回款/.test(p.decl||'')?'cash':(/实际/.test(p.decl||'')?'real':(/短信/.test(p.decl||'')?'sms':'na')));
    var invoiceKey=/无票|开不了|大多/.test(p.invoice||'')?'none':(/专票/.test(p.invoice||'')?'special':(/普票/.test(p.invoice||'')?'normal':'na'));
    var isNew=/刚起步|无历史/.test(p.hist||'');
    var checks=[];
    function add(dir,v,now,issue){ checks.push({dir:dir,v:v,now:now,issue:issue}); }
    /* 收入申报口径 */
    if(fileKey==='zero') add('收入申报','bad','零申报','平台每季度向税务机关推送营业额数据，零申报与推送数据不一致，易触发预警；应按平台销售额（营业额−退货）如实申报。');
    else if(fileKey==='cash') add('收入申报','bad','按回款申报','回款额通常低于平台营业额（未扣佣金、退款前），与税局掌握的平台数据对不上；应按平台后台销售额如实申报。');
    else if(fileKey==='sms') add('收入申报','bad','收到税局短信','已被税务机关点名，需按平台实际营业额核对并更正历史申报，先算清缺口再处理。');
    else if(fileKey==='real') add('收入申报','ok','按实际申报','收入口径与平台数据一致，保持按月导出汇总单核对。');
    else add('收入申报','warn','待确认','需先确认当前申报口径（按实际 / 回款 / 零申报），才能判断与平台数据的差异。');
    /* 平台成本发票（国内电商关键项：平台费用可开票，与跨境不同） */
    add('平台发票','warn','待确认','国内电商的平台佣金 / 技术服务费 / 广告费可向平台申请增值税发票（接入信息技术服务 / 广告服务，一般纳税人取得专票可抵扣进项、小规模取得普票可税前扣除）；应确认是否已按账单申请开票，汇总单仅用于核对账单金额，不能替代发票。私下达人合作等无法开票部分才单列。');
    /* 成本与发票（供应商采购票，与平台发票分开） */
    if(invoiceKey==='none') add('成本入账','bad','供应商大多无票','供应商采购无票占比高，账面利润虚高；采购成本应尽量向供应商取得发票，确实无票的单列，不与有票成本混记。（平台侧成本另见「平台发票」项，可申请平台开票。）');
    else if(invoiceKey==='special') add('成本入账','warn','供应商专票为主','专票税点较高，需结合税负测算判断是否必要；采购票按真实业务取得，不因省税变更交易主体。');
    else if(invoiceKey==='normal') add('成本入账','ok','供应商普票为主','供应商票据结构合理，按明细账逐笔录入采购成本。');
    else add('成本入账','warn','待确认','需确认供应商票据情况，才能规划采购成本入账口径。');
    /* 纳税人身份 */
    if(entity==='待确认') add('主体身份','warn','待确认','需确认小规模 / 一般纳税人身份，增值税与所得税口径不同。');
    else if(entity==='一般纳税人'&&flow<500) add('主体身份','warn',entity,'一般纳税人进项抵扣充分时税负可控；需核对进项票是否充足。');
    else add('主体身份','ok',entity,'身份明确，按对应口径申报。');
    /* 账务规范 */
    if(!p.plats||!p.plats.length) add('账务规范','warn','平台待确认','需确认经营平台，以便按各平台账单与汇总单逐站点建账、申请平台发票。');
    else add('账务规范','warn','明细账待建立','平台支出（佣金、技术服务费、广告费）按账单申请发票后凭票入明细账，汇总单用于核对金额；不打包一笔入账。');
    /* 历史 */
    if(isNew) add('历史遗留','ok','新主体','从第一票起按规范建账，无历史包袱，不写补税与罚款。');
    else add('历史遗留','warn','待核实','需确认历史申报是否有缺口；若有，先按季度汇总单测算缺口再处理。');
    /* 落地方案：规则驱动 */
    var road=[
      {t:'收入按平台数据如实申报',time:'首期申报期内',
        acts:['按月导出平台后台汇总单','按营业额−退货确认收入，不按回款','核对申报收入与平台推送数据一致'],
        cli:['各平台月度汇总单'],done:'申报收入与平台数据对得上'},
      {t:'平台成本申请发票、按明细账入账',time:'持续',
        acts:['按平台账单申请开票：佣金 / 技术服务费、广告费（直通车、引力魔方、千川等）均可向平台申请增值税发票','一般纳税人取得专票抵扣进项、小规模取得普票税前扣除；平台汇总单仅用于核对账单金额','凭票逐笔入明细账，不打包一笔；私下达人合作等无法开票部分单列'],
        cli:['平台账单与发票申请入口','平台汇总单费用明细页'],done:'平台成本凭票入账、发票金额与账单一致'},
      {t:'供应商票据与人力成本规划',time:'持续',
        acts:['按真实采购规划普票 / 专票','员工工资、社保、年终奖按实际用工合规列支','不虚构供应商或员工'],
        cli:['供应商沟通结果','员工名册与社保情况'],done:'成本结构合规、票据与业务匹配'}
    ];
    if(!isNew&&(fileKey==='zero'||fileKey==='cash'||fileKey==='sms')){
      road.push({t:'处理历史申报缺口',time:'合规跑通后启动',
        acts:['按季度汇总单与原申报表比对，形成缺口表','按实际营业额口径与税管员沟通更正','金额以逐季核对结果为准'],
        cli:['历史季度汇总单','原申报表与完税凭证'],done:'历史数据形成明确结论'});
    }
    var bad=checks.filter(function(c){return c.v==='bad';}).length;
    var warn=checks.filter(function(c){return c.v==='warn';}).length;
    return {
      industry:'国内电商',isNew:isNew,checks:checks,roadmap:road,
      htc:{ok:false},derived:{},
      facts:p,
      points:[
        '客户：'+(p.cid||'待确认')+'；平台：'+((p.plats||[]).join('、')||'待确认')+'；城市：'+(p.city||'待确认'),
        '纳税人身份：'+entity+'；年销售额：'+(p.flow||'待确认')+' 万元',
        '当前申报口径：'+(p.decl||'待确认')+'；供应商票据：'+(p.invoice||'待确认')+'；历史：'+(p.hist||'待确认'),
        '合规诊断共 '+checks.length+' 项（不合规 '+bad+' / 待确认 '+warn+'）：'+checks.map(function(c){return c.dir+'('+({bad:'不合规',warn:'待确认',ok:'合规'}[c.v])+')';}).join('、'),
        '关键判定：收入按平台销售额（营业额−退货）如实申报，不按回款；平台佣金/技术服务费/广告费可向平台申请增值税发票入账，汇总单仅核对金额',
        isNew?'客户为新主体，无历史存量需要处理，侧重从一开始建立规范账务':'客户有经营历史，按申报口径决定是否处理历史缺口',
        '落地方案 '+road.length+' 步：'+road.map(function(r,i){return (i+1)+'.'+r.t;}).join(' ')
      ].concat(detailPoints(p))
    };
  }
};

/* 对外：按行业 key 生成深度方案数据 */
function buildDeep(industryKey,params,E){
  if(industryKey==='cross') return CrossDeep.build(params,E||scope.Engine);
  if(industryKey==='domestic') return DomesticDeep.build(params);
  return null;
}

scope.DeepEngine={ build:buildDeep, CrossDeep:CrossDeep, DomesticDeep:DomesticDeep };
})(typeof window!=='undefined'?window:globalThis);
