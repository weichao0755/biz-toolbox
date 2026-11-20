/* 方案引擎 · 从 cross 工具抽取的已验证核心逻辑（规则引擎定结论，AI 只做措辞）
 * 供 plan-doc 新工具复用；两个行业模板共用此框架，各自配专属数据/规则。
 * 抽取时间 2026-11-20，源 cross v1.19.57。 */
(function(scope){
"use strict";

var SAY_P={amazon:'亚马逊',tiktok:'TikTok',temu:'Temu',ozon:'Ozon',shopee:'虾皮',aliexpress:'速卖通',independent:'独立站'};

var PLAT={
 amazon:{n:'Amazon 亚马逊',ful:{
   fba:{n:'FBA 头程 / 海外仓备货',note:'货先发到亚马逊仓或第三方海外仓',mode:'9810',decl:'有',mian:'可',tui:'可',c:'软约束',
     why:'货是客户自己报关出境的（这段叫头程），报关单上写客户名字，所以 9810 可免税、有进项专票可退税。',
     ok:'免税 + 退税都能做，可报全套',no:'无票也想退税'},
   gt:{n:'一般贸易大货（整柜 / 拼箱）',note:'一次发一大批，走 0110',mode:'0110',decl:'有',mian:'不适用',tui:'可',c:'软约束',
     why:'走一般贸易的“免抵退”——注意这不叫免税。退税额最高，但合同、发票、箱单、提单一样不能少。',
     ok:'可承诺退税，金额通常更高',no:'无票走 0110'},
   fbm:{n:'FBM 自发货（小包 / 专线 / 快递）',note:'不备货，出单后直发',mode:'9610',decl:'部分',mian:'可',tui:'不可',c:'软约束',
     why:'零售小包走 9610，综试区可无票免税；但小包货源几乎拿不到进项专票，退税一线不做。',
     ok:'可承诺免税申报',no:'出口退税'},
 }},
 tiktok:{n:'TikTok Shop',ful:{
   plat:{n:'平台物流 / TikTok Shipping',note:'交给平台指定承运商发',mode:'9610',decl:'无',mian:'有条件',tui:'不可',c:'软约束',
     why:'用平台物流时报关主体是平台物流商；能拿到清单就能免税，拿不到只能做账务。',
     ok:'可承诺账务 + 免税（拿到清单）',no:'平台物流还能退税'},
   fbt:{n:'FBT 平台仓 / 自建海外仓备货',note:'货先进 TikTok 仓或自有海外仓',mode:'9810',decl:'有',mian:'可',tui:'可',c:'软约束',
     why:'货是卖家自己运出境的，头程有报关单。注意：FBT 仓由平台运营，能否做 9810 备案要核实。',
     ok:'可承诺免税 + 退税（备案成功后）',no:'平台仓货物退税'},
 }},
 temu:{n:'Temu',ful:{
   full:{n:'全托管',note:'只供货到平台国内仓，其余平台管',mode:'9610',decl:'无',mian:'有条件',tui:'不可',c:'硬约束',
     why:'全托管由平台统一出境报关，卖家只有平台结算单，拿不到自己名下报关单，13 栏也填不了。',
     ok:'账务合规 + 多主体架构',no:'退税、自行填 13 栏'},
   half:{n:'半托管',note:'自己备海外仓、自己清关',mode:'9810',decl:'有',mian:'可',tui:'可',c:'软约束',
     why:'半托管卖家是报关主体，有报关单有进项，能做全套 + 退税。',
     ok:'全套 + 退税，客单最高',no:'无票退税'},
 }},
 ozon:{n:'Ozon',ful:{
   plat:{n:'Ozon 官方物流（强制）',note:'不能自选货代，货送集运仓',mode:'9610',decl:'无',mian:'有条件',tui:'不可',c:'硬约束',
     why:'平台强制官方物流，报关单主体是 Ozon 或其物流商。必须向其索取“报关清单”，要不到连免税都做不了。',
     ok:'账务合规 + 免税（拿到汇总报关单）',no:'出口退税、自选报关模式'},
 }},
 shopee:{n:'Shopee 虾皮',ful:{
   sls:{n:'SLS 直发',note:'货送国内转运仓，平台统一出境',mode:'9610',decl:'无',mian:'有条件',tui:'不可',c:'硬约束',
     why:'走 SLS 报关单是平台物流商的名字，卖家侧无报关单，只能做免税 + 账务。',
     ok:'账务 + 免税（拿到汇总报关单）',no:'出口退税'},
   wh:{n:'本地仓 / 海外仓备货',note:'备货到新加坡、马来等当地仓',mode:'9810',decl:'有',mian:'可',tui:'可',c:'软约束',
     why:'自建或租赁当地仓并备案后可走 9810，有报关单就能免税，有专票可退税。',
     ok:'免税 + 退税',no:'无票退税'},
 }},
 aliexpress:{n:'速卖通 AliExpress',ful:{
   plat:{n:'菜鸟无忧物流（官方）',note:'货送仓，菜鸟统一出境',mode:'9610',decl:'无',mian:'可',tui:'不可',c:'软约束',
     why:'官方物流为主流，卖家侧多无报关单；无票货源用综试区无票免税。',
     ok:'无票免税 + 账务',no:'出口退税'},
   self:{n:'自发货（自己找货代）',note:'可用货代出出口清单',mode:'9610',decl:'部分',mian:'可',tui:'不可',c:'软约束',
     why:'自发货可让货代出清单走 9610 免税；小包多无进项票，退税不做。',
     ok:'免税申报',no:'出口退税'},
   wh:{n:'海外仓备货',note:'备货到境外仓',mode:'9810',decl:'有',mian:'可',tui:'可',c:'软约束',
     why:'有海外仓备案 + 进项专票，可走 9810 免税 + 退税。',
     ok:'免税 + 退税，客单最高',no:'无票退税'},
 }},
 independent:{n:'独立站（Shopify 等）',ful:{
   self:{n:'自发货（小包 / 专线 / 快递）',note:'无平台约束，自己找货代',mode:'9610',decl:'部分',mian:'可',tui:'不可',c:'软约束',
     why:'卖家可自选报关行；小包货源多无进项票，走 9610 免税，退税不做。',
     ok:'免税 + 账务',no:'出口退税'},
   wh:{n:'自建 / 租赁海外仓备货',note:'最容易做规范的场景',mode:'9810',decl:'有',mian:'可',tui:'可',c:'软约束',
     why:'卖家完全自主，可备案海外仓并退税，是标杆客户和案例来源。',
     ok:'全套 + 退税',no:'收汇不合规也零风险'},
   gt:{n:'一般贸易整柜 / 拼箱',note:'大货出口',mode:'0110',decl:'有',mian:'不适用',tui:'可',c:'软约束',
     why:'正常免抵退（不叫免税），退税金额最高，单证要求最严。',
     ok:'退税',no:'无票走 0110'},
   mp:{n:'市场采购出口（1039）',note:'无票小商品的合法通道',mode:'1039',decl:'有',mian:'可',tui:'不可',c:'软约束',
     why:'1039 是“免征不退”：免增值税，但放弃了退税，二者只能选一个。',
     ok:'免税出口',no:'退税（选了免征就没有）'},
 }},
 /* 其他 / 手动输入平台：销售自填的小众平台共用这套通用履约模板，口径按报关方式判定 */
 other:{n:'其他（手动填写）',ful:{
   direct:{n:'直邮 / 平台物流发货',note:'小包或平台指定物流，无自有报关单',mode:'9610',decl:'部分',mian:'可',tui:'不可',c:'软约束',
     why:'平台物流 / 专线多由物流商统一申报，卖家侧通常无自有报关单；综试区无票免税可用。',
     ok:'账务合规 + 无票免税',no:'无票也承诺退税'},
   wh:{n:'海外仓 / 本地仓备货',note:'货主自主报关出境',mode:'9810',decl:'有',mian:'可',tui:'可',c:'软约束',
     why:'货主自行出口报关并备案海外仓，有进项专票可退税；具体以该平台清关口径为准。',
     ok:'全套 + 退税（有票）',no:'无票退税'},
 }}
};

var MODEN={'9810':'海外仓','9610':'零售直发','0110':'一般贸易','1039':'市场采购'};

var DECLD=[
 {k:'self',n:'自己公司抬头',note:'自己报关，或者货代以您公司名义报关'},
 {k:'maidan',n:'买单（借别人抬头）',note:'花钱买别家公司的报关抬头'},
 {k:'ddp',n:'双清包税（货代全包）',note:'出口进口都货代办，您拿总价'},
 {k:'plat',n:'平台 / 平台物流代报',note:'Ozon 官方物流、Temu 全托、SLS 这类'},
 {k:'na',n:'不确定 / 客户说不清',note:'先按待确认走，事后再补'}
];

function pct(v,def){ var n=parseFloat(v); return (isNaN(n)||n<0)?def:n; }

function platKey(p){ return (typeof p==='string'&&p.indexOf('custom:')===0)?'other':p; }

function platDef(p){ return PLAT[platKey(p)]||PLAT.other; }

function flowBand(v){
  if(v===undefined) v=(typeof A!=='undefined'&&A)?A.flow:undefined;
  var n=(v==='na'||v==null||v==='')?NaN:Number(v);
  if(isNaN(n)) return 'na';
  if(n<=300) return 'f1';
  if(n<=500) return 'f2';
  if(n<=700) return 'f3';
  if(n<=1000) return 'f4';
  return 'f5';
}

function monthsAgo(ym){
  if(!ym||ym==='na') return -1;
  var m=/^(\d{4})-(\d{1,2})$/.exec(ym); if(!m) return -1;
  var now=new Date(), cy=now.getFullYear(), cm=now.getMonth()+1;
  return (cy-(+m[1]))*12+(cm-(+m[2]));
}

function ieState(){
  var ie, tf;
  if(A.qual==='both'){ ie=true; tf=true; }
  else if(A.qual==='qualOnly'){ ie=true; tf=(A.taxFiling===true); }
  else if(A.qual==='none'){ ie=false; tf=false; }
  else { ie=(A.impExp===true); tf=(A.taxFiling===true); }
  return {ie:!!ie, tf:!!tf};
}

function tkHistDerive(){
  if(TK.sms==='y') return 'sms';
  if(!TK.startMonth||TK.startMonth==='na') return 'na';
  var longAgo=monthsAgo(TK.startMonth)>=6;
  var fb=flowBand();
  if(fb==='f3'||fb==='f4'||fb==='f5') return 'upgrade';      /* 大卖架构优先，历史不抢戏 */
  if((TK.file==='zero'||TK.file==='cash')&&longAgo) return ''; /* 空串 → histOf 落 'zero'（隐藏存量） */
  return 'new';
}

function tkHistInferText(){
  if(TK.fresh) return '新主体 / 刚起步，无历史存量';
  if(TK.sms==='y') return '已收到税局短信（存量确认）';
  if(!TK.startMonth||TK.startMonth==='na') return '未问 / 客户不记得';
  var m=monthsAgo(TK.startMonth);
  if((TK.file==='zero'||TK.file==='cash')&&m>=6) return '零/按回款申报且已做 '+m+' 个月 → 数据必然对不上，只是税局尚未点名';
  if(m>=6) return '已做 '+m+' 个月，申报对得上则暂无历史包袱';
  return '刚起步（'+m+' 个月），暂看不出历史问题';
}

function histOf(){
  if(A.sms==='y') return 'sms';
  var h=A.hist;
  /* 兼容 v4.1 及更早：新字段都没写时才回落到旧的 history */
  if(h===undefined&&A.file===undefined) return (A.history||'na');
  if(h==='overdue'||h==='check') return 'sms';   /* 有存量待处理，打法同「存量触发型」 */
  if(h==='na') return 'na';                       /* 客户不记得开始时间 → 信息不足 */
  if(h==='new') return 'new';
  var b=flowBand();
  if(b==='f3'||b==='f4'||b==='f5') return 'upgrade';   /* ≥500 万，身份问题优先 */
  if(A.file==='zero'||A.file==='cash') return 'zero';
  if(h==='none') return 'new';
  return 'na';
}

function custNew(){
  /* 方案书设置：历史数据手动覆盖优先
     forceNo(不计算历史)=强制走新主体式未来税负预测；force(计算历史)=强制走历史遗留章节 */
  var gh=TK&&TK.genHist;
  if(gh==='forceNo') return true;
  if(gh==='force') return false;
  if(TK && TK.fresh) return true;
  return histOf()==='new';
}

function noVatRisk(){
  /* 小规模纳税人且年销售额 < 120 万：增值税依法免征（季度≤30万），
     无增值税滞纳金 / 罚款风险，仅需处理企业所得税，历史遗留可延后。
     注：罚款是否显示的手动开关在 histTaxCompare 的 fineOff 处理，不改变本业务事实判定。 */
  var isSmallLike=(A.entity==='small'||A.entity==='person');
  return (isSmallLike && A.flow!=null && A.flow!=='na' && Number(A.flow)>0 && Number(A.flow)<120);
}

function heDingEligible(){
  /* 方案书设置：核定口径手动覆盖优先（force=可核定 / forceNo=不可核定） */
  var gh=TK&&TK.genHed;
  if(gh==='force') return true;
  if(gh==='forceNo') return false;
  var sm=(A&&A.startMonth&&A.startMonth!=='na')?A.startMonth:(TK&&TK.startMonth&&TK.startMonth!=='na'?TK.startMonth:'');
  if(!sm||sm==='na') return null;
  var yr=parseInt(String(sm).split('-')[0],10);
  return yr<=2025;
}

function taxCalc(o){
  var sales=Number(o.sales);
  if(!(sales>0)) return {ok:false};
  var isGen=(o.ent==='general');
  var exempt=(o.decl==='yes');
  /* 小规模纳税人季度销售额 ≤ 30 万免征增值税（财税〔2019〕13 号等延续政策）；
     一般纳税人无此优惠；已有出口免税备案者本就为 0，三者取免。 */
  var qOver=(o.q==='yes');            // 季度销售额是否超过 30 万
  var smallFree=(!isGen && !exempt && !qOver);
  var vatRate=exempt?0:(isGen?0.13:(smallFree?0:0.01));
  var purchR=pct(o.purch,20)/100;
  var platR=pct(o.plat,50)/100;
  var head=Number(o.head)||0;
  var plat=Math.round(sales*platR*10)/10;
  var purch=Math.round(sales*purchR*10)/10;
  var labor=Math.round(head*6*10)/10;
  var profit=Math.round((sales-plat-purch-labor)*10)/10;
  var vat=Math.round(sales*vatRate*10)/10;
  var citRate=profit<300?0.05:0.25;
  var citBase=Math.round(Math.max(0,profit-vat)*10)/10;
  var cit=Math.round(citBase*citRate*10)/10;
  var baseTax=Math.round((vat+cit)*10)/10;
  var baseRate=Math.round(baseTax/sales*1000)/10;
  var r={ok:true,sales:sales,isGen:isGen,exempt:exempt,smallFree:smallFree,vatRate:vatRate,purchR:purchR,platR:platR,head:head,
    plat:plat,purch:purch,labor:labor,profit:profit,citBase:citBase,citRate:citRate,cit:cit,vat:vat,
    baseTax:baseTax,baseRate:baseRate,plans:[],afterTax:null,afterRate:null};
  /* 节税 1：没有报关单 → 办理进出口权 + 免税备案，取得报关单后走出口免税 */
  if(!exempt&&vat>0){
    r.plans.push({id:'exempt',net:vat,title:'取得报关单后走出口免税',
      desc:'目前没有本公司抬头的报关单，销售额视同内销，增值税 '+vat+' 万。先办理进出口权，再办理免税备案，取得本公司抬头的报关单后出口免税栏（13 栏）可填报，这部分增值税可免。'});
  }
  /* 节税 2：年终奖 3.6 万/人，个税 3% < 企税，做工资抵扣 */
  if(head>0&&citBase>0){
    var bonus=Math.round(head*3.6*10)/10;
    var bonusTax=Math.round(head*3.6*0.03*10)/10;
    var citSaved=Math.round(Math.min(bonus,citBase)*citRate*10)/10;
    var net=Math.round((citSaved-bonusTax)*10)/10;
    var afterCit=Math.round(Math.max(0,citBase-bonus)*citRate*10)/10;
    var afterTax=Math.round((vat+afterCit+bonusTax)*10)/10;
    r.plans.push({id:'bonus',net:net,title:'年终奖做工资抵扣',
      desc:head+' 名员工各发 3.6 万年终奖，个税按 3% 计 '+bonusTax+' 万；利润同步下降，少交企业所得税约 '+citSaved+' 万。净省约 '+net+' 万（3% < 企税 '+(citRate*100)+'%）。'});
    r.afterTax=afterTax; r.afterRate=Math.round(afterTax/sales*1000)/10;
  }
  /* 节税 3：小规模超 500 万 → 控额 / 月份拆分，把增值税尽量留在 1%（已走出口免税或季销售额≤30万免征则增值税本就为 0，此项不适用） */
  if(!isGen&&sales>500&&!exempt&&!smallFree){
    var tol=Math.round(500*1.05), over=Math.max(0,Math.round((sales-tol)*10)/10);
    var allGen=Math.round(sales*0.13*10)/10;
    var planned=Math.round((tol*0.01+over*0.13)*10)/10;
    var save=Math.round((allGen-planned)*10)/10;
    r.plans.push({id:'five',net:save,title:'小规模超 500 万：控额 / 月份拆分',
      desc:'年销售额 '+sales+' 万已超 500 万（税局 5% 波动约容 '+tol+' 万）。'+(over>0
        ? ('建议月份拆分：'+tol+' 万以内按 1% 征，仅超出的 '+over+' 万集中到单月核 13%，比全年按 13% 省约 '+save+' 万增值税。')
        : ('年额可控制在 '+tol+' 万以内，仍按 1% 征，不用升一般人。'))});
  }
  return r;
}

function taxModel(){
  var sales=(A&&A.flow!=null&&A.flow!=='na')?Number(A.flow):null;
  var r={ok:false};
  if(sales==null) return r;
  var isGen=(A.entity==='general');
  var vatRate=isGen?0.13:0.01;
  /* 人数：已填用填的；选了"有人/返聘"但没填，按 1 人估算并标注 */
  var head=A.staffN, headEst=false;
  if(head==null||head===''){ head=(A.staff==='yes'||A.staff==='retired')?1:0; headEst=(head>0); }
  else head=Number(head);
  var plat=Math.round(sales*0.5*10)/10;
  var purch=Math.round(sales*0.2*10)/10;
  var labor=Math.round(head*6*10)/10;          /* 5000 元/月 × 12 = 6 万/人/年 */
  var profit=Math.round((sales-plat-purch-labor)*10)/10;
  var vat=Math.round(sales*vatRate*10)/10;
  var citRate=profit<300?0.05:0.25;
  /* 计税基础 = 利润 − 增值税（企业所得税法：应纳税所得额不含增值税） */
  var citBase=Math.round(Math.max(0,profit-vat)*10)/10;
  var cit=Math.round(citBase*citRate*10)/10;
  var baseTax=Math.round((vat+cit)*10)/10;
  var baseRate=Math.round(baseTax/sales*1000)/10;
  r={ok:true, sales:sales, isGen:isGen, vatRate:vatRate, head:head, headEst:headEst,
      plat:plat, purch:purch, labor:labor, profit:profit, citBase:citBase, citRate:citRate, cit:cit, vat:vat,
      baseTax:baseTax, baseRate:baseRate, plans:[], afterTax:null, afterRate:null};
  /* 方案1：专票收点过高 → 改普票 / 不拿票 */
  if(A.invoice==='special'){
    r.plans.push({id:'inv', title:'发票结构：专票改普票',
      desc:'供应商开专票要加 8%~10% 收点，高于您企业所得税边际税率（'+(citRate*100)+'%）。拿专票不划算：建议沟通开普票（收点约 1%~3%），或评估不拿票（省下收点，但利润上升、企税也随之上升，要权衡）。'});
  }
  /* 方案2：发年终奖 3.6万/人，个税3% < 企税，做工资抵扣 */
  if(head>0&&citBase>0){
    var bonus=Math.round(head*3.6*10)/10;
    var bonusTax=Math.round(head*3.6*0.03*10)/10;
    var citSaved=Math.round(Math.min(bonus,citBase)*citRate*10)/10;
    var net=Math.round((citSaved-bonusTax)*10)/10;
    var afterCit=Math.round(Math.max(0,citBase-bonus)*citRate*10)/10;
    var afterTax=Math.round((vat+afterCit+bonusTax)*10)/10;
    var afterRate=Math.round(afterTax/sales*1000)/10;
    r.plans.push({id:'bonus', title:'年终奖工资抵扣',
      desc:head+' 名员工各发 3.6 万年终奖，个税仅 3%（'+bonusTax+' 万），但利润下降可少交企税约 '+citSaved+' 万；净节税约 '+net+' 万（因 3% < '+(citRate*100)+'%）。',
      bonus:bonus, bonusTax:bonusTax, citSaved:citSaved, net:net});
    r.afterCit=afterCit; r.afterTax=afterTax; r.afterRate=afterRate;
  }
  /* 方案3：小规模超 500 万 → 控额 / 月份拆分，把增值税尽量留在 1% */
  if(A.entity==='small'&&sales>500){
    var tol=Math.round(500*1.05), over=Math.max(0,Math.round((sales-tol)*10)/10);
    var allGen=Math.round(sales*0.13*10)/10;
    var planned=Math.round((tol*0.01+over*0.13)*10)/10;
    var save=Math.round((allGen-planned)*10)/10;
    r.plans.push({id:'five', title:'小规模超 500 万的控额 / 月份拆分',
      desc:'小规模年销售额 '+sales+' 万已超 500 万（税局 5% 波动约容 '+tol+' 万）。'+(over>0
        ? ('建议月份拆分：'+tol+' 万以内按 1% 征，仅超出的 '+over+' 万集中到单月核 13%，比直接升一般人全年 13% 省约 '+save+' 万增值税。')
        : ('年额可控制在 '+tol+' 万以内，仍按 1% 征，不用升一般人。'))});
  }
  return r;
}

function gapInfo(){
  var r={has:false, scope:'', est:null, vat:null, late:null, zero:false, method:''};
  var per=(A&&A.flow!=null&&A.flow!=='na')?Number(A.flow):null;
  var ent=(A&&A.entity==='general')?'g':'s';
  var rate=ent==='g'?0.13:0.01;
  var m=monthsAgo(A.startMonth);
  function setGap(hidden, base){
    r.has=true; r.est=hidden;
    r.vat=Math.round(hidden*rate*10)/10;
    r.late=Math.round(hidden*rate*0.1825*10)/10;
    r.method=base+'；增值税率 '+(ent==='g'?'13%':'1%')+'，滞纳金按日万分之五、拖一年约 18.25%。';
  }
  /* 税局已点名且有金额：最准 */
  if(A.sms==='y'&&typeof A.smsAmt==='number'&&A.smsAmt>0){
    var qs=(A.smsQ||[]);
    r.zero=(A.file==='zero');
    r.scope='税局点名'+(qs.length?('的 '+qs.join('、')+' 季度'):'的季度')+'，合计约 '+A.smsAmt+' 万销售额未如实申报';
    setGap(A.smsAmt,'按被点名季度销售额');
    return r;
  }
  /* 零申报 / 按回款申报且已开始超半年：隐藏存量 */
  if((A.file==='zero'||A.file==='cash')&&m>0){
    r.zero=(A.file==='zero');
    if(per!=null){
      if(A.file==='zero'){
        var hid=Math.round(per*m/12*10)/10;
        r.scope='零申报已 '+m+' 个月，累计未申报销售额约 '+hid+' 万（差额=销售额全额）';
        setGap(hid,'零申报：差额≈销售额全额，按 年流水×月数/12');
      }else{
        var dif=Math.round(per*m/12*0.2*10)/10;
        r.scope='按回款申报已 '+m+' 个月，差额约为销售额 20%（佣金/运费/退款），约 '+dif+' 万';
        setGap(dif,'按回款申报：差额≈销售额 20%，按 年流水×月数/12×20%');
      }
      return r;
    }
    r.has=true;
    r.scope=(A.file==='zero'?'零申报':'按回款申报')+'已 '+m+' 个月，差额为销售额'+(A.file==='zero'?'全额':'约 20%')+'，需提供流水才能算具体数';
    r.method=(A.file==='zero'?'零申报差额=销售额全额':'按回款申报差额≈销售额 20%')+'，缺流水无法定量。';
    return r;
  }
  /* 收到短信但金额未知：确认 100% 有问题，先要数 */
  if(A.sms==='y'){
    r.zero=(A.file==='zero');
    r.has=true;
    r.scope='已收到税局短信（确认有存量），但金额未提供——按申报口径估算需客户提供流水';
    r.method='税局已点名，问题 100% 存在；金额未知，先让客户截图短信或报点名季度流水。';
    return r;
  }
  return r;
}

function declMap(){ if(!A.decls) A.decls={}; return A.decls; }

function declName(p){
  var k=declMap()[p]||'',i;
  for(i=0;i<DECLD.length;i++) if(DECLD[i].k===k) return DECLD[i].n;
  return '待确认';
}

function qualChain(){ if(A.impExp) return '办理链条：申领电子口岸 IC 卡（报关用 U 盾）→ 办理免税备案 → 出口免税栏（13 栏）填报。'; return '办理链条：经营范围增项（货物进出口、技术进出口）→ 办理进出口权 → 进出口权备案（收发货人备案、跨境电商企业备案）→ 申领电子口岸 IC 卡（报关用 U 盾）→ 办理免税备案 → 出口免税栏（13 栏）填报。'; }

function entNameOf(x){ return ({small:'小规模纳税人',general:'一般纳税人',person:'个人 / 个体户',na:'说不清'})[x]||'待确认'; }

function histPlan(d){
  /* 历史遗留数据处理逻辑（按客户实际情况生成，非模板）：
     增值税——一般纳税人可直填免税；小规模+免税备案后 深圳直填 / 外地需报关单；可与税管员沟通历史数据填免税（各城市具体沟通）。
     企业所得税——可沟通核定（2025 Q3 约 2% / Q4 约 4%，部分城市如广州约 8%，其他视沟通）；平台成本按平台汇总单正常录入；采购成本依收票录入。注意：根据最新政策，过往补申报期间的人力成本（工资）无法补录入账，故补申报口径不含人力成本，其规范列支仅在日常合规账务中规划。 */
  var ent=A.entity, city=A.city, ie=ieState(), decl=(d&&d.decl);
  var entName=entNameOf(ent)==='待确认'?'纳税人类型待确认':entNameOf(ent);
  var cityName=(city==='shenzhen')?'深圳':(city==='other'?'外地':'注册地待确认');
  var vat=[], cit=[];
  if(ent==='general'){
    vat.push('一般纳税人可直接填报出口免税（申报表 13 栏），历史数据可优先尝试按免税口径更正申报。');
    vat.push('若历史期间已按内销申报，建议与主管税务机关（税管员）沟通将历史数据调整为免税口径，最终以实际核对数据为准。');
  } else if(ent==='small'){
    if(ie&&ie.tf){
      if(city==='shenzhen'){
        vat.push('小规模纳税人已完成出口免税备案，深圳主体可直接填报免税（13 栏），历史数据可优先按免税口径处理，将增值税降至 0。');
      } else {
        vat.push('小规模纳税人已完成出口免税备案，外地主体须先取得报关单，方可就历史数据填报免税。');
        vat.push((decl==='无'||decl==='部分')?'贵司历史期间报关单不齐，无报关单部分暂按内销补缴增值税，或与税管员沟通争取免税口径。':'贵司已取得报关单，可凭报关单就历史数据申报免税。');
      }
    } else {
      vat.push('小规模纳税人须先完成出口免税备案。备案完成后，深圳主体可直接填报免税，外地主体须凭报关单填报免税。');
      vat.push('历史数据建议与主管税务机关（税管员）沟通按免税口径处理；各地口径不一，须按具体城市具体沟通。');
    }
  } else {
    vat.push('纳税人类型待确认：一般纳税人可直接填报免税；小规模纳税人须完成免税备案后，深圳可直接填报、外地须凭报关单填报免税。');
  }
  vat.push('【沟通要点】可与税管员沟通将之前数据填报免税，但须按具体城市、具体沟通确定，无统一口径。');
  if(ent==='person') cit.push('个人所得税：个人 / 个体户不缴企业所得税，经营所得按个体工商户个人所得税口径计征，具体税率与核定方式须结合注册地与征收方式单独确认；以下企业所得税段落仅供参考，实际以个人所得税口径为准。');
  var hed=heDingEligible();
  if(hed===false){
    cit.push('企业所得税：因贵司 2026 年方开展网店经营，2026 年起各季度均不可沟通核定，按查账征收以真实利润为计税依据（跨境电商真实利润率行业常见约 15%，即 真实利润 × 5%）。');
  } else if(hed===true){
    cit.push('企业所得税：2025 年第三季度、第四季度可尝试与主管税务机关沟通核定征收，核定口径为「销售额 × 核定利润率（约 2%~4%，部分城市如广州约 8%）× 企业所得税税率 5%」，并非直接按销售额的 2%~4% 计征；其余季度及 2026 年起各季度不可核定，按真实利润（约销售额 15%）× 5% 计。');
  } else {
    cit.push('企业所得税：核定仅适用于 2025 年 Q3/Q4 季度（口径为「销售额 × 核定利润率 2%~4% × 5%」），2026 年起各季度不可核定；若贵司于 2026 年方开展网店经营，则按查账征收、以真实利润（约销售额 15%）× 5% 计。具体需结合贵司开始经营网店的时间确定。');
  }
  cit.push('平台成本：可根据平台汇总单正常录入，据实作为成本抵扣。');
  cit.push('采购成本：根据贵司收票情况录入，可取得发票的据实入账，无票部分单列处理。');
  cit.push('人力成本：根据最新政策，过往补申报期间的人力成本（工资）无法补录入账，故本方案不将工资作为补申报的成本抵扣项；其规范列支将在合规后的日常账务中专项规划（如返聘退休人员、工资列支等），合理降低企业所得税税负。');
  return { vat:vat, cit:cit, entName:entName, cityName:cityName };
}

function histTaxCompare(){
  var sales=(A&&A.flow!=null&&A.flow!=='na')?Number(A.flow):null;
  if(!(sales>0)) return {ok:false};
  var isGen=(A.entity==='general');
  var vatRate=isGen?0.13:0.01;
  /* 真实利润：跨境电商（亚马逊为主）行业常见约 15% 销售额；据此估合规后企业所得税（查账/非核定口径） */
  var realProfit=Math.round(sales*0.15*10)/10;
  var citRate=realProfit<300?0.05:0.25;
  /* 路径一（维持原状 / 半合规，视同内销）——增值税按内销补；
     企业所得税按「税局核定利润」：平台费用等成本约占销售额 50%，维持原状或凭证不合规时税局不予认可，
     核定利润上浮至约销售额 65%（= 真实利润 15% + 不被认可成本 50%），企税 = 核定利润 × 税率。 */
  var assessedProfit=Math.round(sales*0.65*10)/10;
  var citRate1=assessedProfit<300?0.05:0.25;
  /* 小规模纳税人季度销售额 ≤ 30 万免征增值税（年销售额 < 120 万即各季度均未超 30 万）；
     此情形下即便被视同内销，路径一亦无须补缴 1% 增值税。一般纳税人无此优惠。 */
  var vatExempt=(!isGen && sales<120);
  var vat1=vatExempt?0:Math.round(sales*vatRate*10)/10;
  var vat1Note=vatExempt?('小规模纳税人季度销售额 ≤ 30 万免征增值税（年销售额 '+sales+' 万 < 120 万），本路径增值税为 0'):('按内销 '+Math.round(vatRate*100)+'% 补缴');
  var cit1=Math.round(assessedProfit*citRate1*10)/10;
  var tax1=Math.round((vat1+cit1)*10)/10;
  var late=Math.round(tax1*0.1825*10)/10;      /* 滞纳金按日万分之五、约 12 个月估算 */
  var fineLow=Math.round(tax1*0.5*10)/10;
  var fineHigh=Math.round(tax1*5*10)/10;
  if(vatExempt){ late=0; fineLow=0; fineHigh=0; }   /* 小规模年销<120万：增值税免征，无增值税滞纳金/罚款风险，仅计企业所得税 */
  /* 方案书设置：genFine 只决定「是否计算/显示罚款与滞纳金」，不碰增值税免征判定（vatExempt 不动） */
  var fineOff=!!vatExempt;
  if(TK&&TK.genFine==='forceNo'){ late=0; fineLow=0; fineHigh=0; fineOff=true; }
  else if(TK&&TK.genFine==='force'){
    /* 强制算罚款：即使小规模免增值税也恢复滞纳金/罚款（按企业所得税缺口 tax1 计） */
    fineOff=false;
    late=Math.round(tax1*0.1825*10)/10;
    fineLow=Math.round(tax1*0.5*10)/10;
    fineHigh=Math.round(tax1*5*10)/10;
  }
  var low1=Math.round((tax1+late+fineLow)*10)/10;
  var high1=Math.round((tax1+late+fineHigh)*10)/10;
  /* 核定判定：仅 2025 Q3/Q4 可沟通核定；2026 起各季度不可核定（以开始经营网店时间判定） */
  var hed=heDingEligible();
  /* 路径二：合规处理——增值税免（出口免税）；企税：可核定时 = 销售额×核定利润率(2%~4%)×5%，不可核定时 = 真实利润×5% */
  var cit2Low, cit2High, cit2Note;
  if(hed===false){
    cit2Low=Math.round(realProfit*citRate*10)/10;   // 同路径一，无核定优惠
    cit2High=cit2Low;
    cit2Note='按真实利润 × '+Math.round(citRate*100)+'%（不可核定）';
  } else {
    cit2Low=Math.round(sales*0.02*0.05*10)/10;     // 销售额 × 2% × 5%
    cit2High=Math.round(sales*0.04*0.05*10)/10;     // 销售额 × 4% × 5%
    cit2Note='核定（销售额 × 核定利润率 2%~4% × 5%）';
  }
  var saveLow=Math.round((low1-cit2High)*10)/10;
  var saveHigh=Math.round((high1-cit2Low)*10)/10;
  return {ok:true, sales:sales, isGen:isGen, vatRate:vatRate,
    realProfit:realProfit, citRate:citRate, assessedProfit:assessedProfit, citRate1:citRate1,
    vat1:vat1, vat1Note:vat1Note, cit1:cit1, tax1:tax1, noVatRisk:fineOff, vatExempt:vatExempt, late:late,
    fineLow:fineLow, fineHigh:fineHigh, low1:low1, high1:high1,
    cit2Low:cit2Low, cit2High:cit2High, cit2Note:cit2Note, hed:hed,
    saveLow:saveLow, saveHigh:saveHigh};
}

function derive(){
  var P=A.platform?platDef(A.platform):null;
  if(!P) return {plat:A.platform,platN:'待确认',n:'待确认',mode:'待确认',decl:'待确认',mian:'待确认',tui:'待确认',why:'平台没拿到，判定做不了',c:'待确认',ok:'—',no:'—',modeShow:'待确认'};
  var f=P.ful[A.ful];
  if(!f) return {plat:A.platform,platN:P.n,n:'待确认',mode:'待确认',decl:'待确认',mian:'待确认',tui:'待确认',why:'发货方式没拿到，判定做不了',c:'待确认',ok:'—',no:'—',modeShow:'待确认'};
  var d={plat:A.platform, platN:P.n, n:f.n, fulN:f.n, mode:f.mode, natMode:f.mode, decl:f.decl, mian:f.mian,
          tui:f.tui, why:f.why, c:f.c, ok:f.ok, no:f.no, declK:(A.decl||''), declN:declName(A.platform),
          cf:'', modeShow:f.mode==='转合规'?(ieState().ie?'转合规报关（改用自有抬头）':'转合规报关（先办进出口权）'):f.mode+' '+MODEN[f.mode]};
  /* —— 第二维：报关方式。报关单写谁的名字，比货怎么发更要紧 —— */
  var dc=A.decl||'';
  if(dc==='maidan'||dc==='ddp'){
    d.mode='转合规'; d.decl='无'; d.mian='不可'; d.tui='不可'; d.c='硬约束';
    d.modeShow=ieState().ie?'转合规报关（改用自有抬头）':'转合规报关（先办进出口权）';
    d.why=(dc==='maidan'
      ?'货是按「'+f.n+'」出去的，但报关单写的是卖单公司的抬头——客户手里没有自己名下报关单，免税、退税都不成立，还会被视同内销补增值税。'
      :'DDP 双清由货代包办出口和进口清关，报关单在货代名下——货怎么发都不改变这个结论，客户拿不到自己的出口凭证。');
    d.ok='可承诺：转合规路径 + 历史两方案对比 + 账务合规';
    d.no='任何免税 / 退税承诺';
    d.cf='履约方式是「'+f.n+'」，报关却是借别人抬头——结论由报关方式决定，别拿发货方式讲免税。';
  }else if(dc==='plat'){
    d.decl='无'; d.tui='不可';
    d.mian=(f.decl==='无')?f.mian:(f.mian==='不适用'?'有条件':f.mian);
    d.mode=(f.mode==='9810'||f.mode==='0110')?'9610':f.mode;
    d.modeShow=f.mode==='转合规'?'待确认（平台代报不能转自报）':(d.mode+' '+MODEN[d.mode]);
    d.why='平台或平台物流代报，报关单主体不是客户——免税要看能不能拿到当月报关清单，退税一定做不了。';
    d.ok='可承诺：账务合规 + 免税（拿到汇总报关单后）';
    d.no='出口退税、自选报关模式';
    if(f.decl==='有') d.cf='这个发货方式本来是客户自己报关的，客户却说平台代报——口径要核实。';
  }else if(dc==='na'){
    d.decl='待确认'; d.mian='待确认'; d.tui='待确认'; d.c='待确认';
    d.modeShow='待确认（先问清谁报关）';
    d.why='报关方式没拿到，免税和退税都判不了——这是整套结论的前提，先补这一条。';
    d.ok='可承诺：先做风险排查'; d.no='任何免税 / 退税结论';
  }else if(dc==='self'&&f.decl==='无'){
    d.cf='客户说自己报关，但这个发货方式通常由平台代报——口径要核实，先按平台规则讲。';
  }
  return d;
}

function planCheck(d){
  var rows=[],f=(PLAT[A.platform]&&PLAT[A.platform].ful[A.ful])||null;
  var declTxt={self:'客户自己公司抬头',maidan:'货代买单',ddp:'双清包税',plat:'平台代报',na:'待确认'}[A.decl]||'还没问';
  var qs=A.smsQ||[],qN=qs.length;

  /* ① 基础合规：进出口权 + 免税备案 —— 整套方案的前置条件 */
  var v0='ok',i0='',q=(A.qual||'');
  if(q==='both'){ i0='进出口权、免税备案均已办理，客户可取得自己名下的出口报关凭证，该项合规基础已具备。'; }
  else if(q==='qualOnly'){ v0='bad';
    i0='有进出口权，但免税备案没做——报关能报，13 栏（出口免税栏）填不进去，等于报了关还是免不了税。需先办理免税备案，出口免税栏（13 栏）才能填报，这是这一步里最容易漏的。'+qualChain(); }
  else if(q==='none'){ v0='bad';
    i0='公司没有进出口权、也没做免税备案，货是借'+declTxt+'的抬头出去的，没有报关单、也没有报关清单。这个基础不存在，销售额在税务上就视同内销。'
      +'需先办理进出口权，再办理免税备案，之后出口免税栏（13 栏）才能填报。'+qualChain()
      +(A.qualFromBase?'<b>基本盘那两个勾没打，按「未办理」计</b>——这是默认口径，不是客户确认过的答案，见到老板时还要再核实一句。':''); }
  else if(q==='na'){ v0='warn'; i0='出口资质客户无法说明——该项为其余各项结论的前置条件，未核实前不宜继续推进。可先依据报关抬头反推。'; }
  else if(d.decl==='有'){ i0='按报关抬头看是客户自己报关，出口凭证拿得到；但进出口权和免税备案有没有，还要再确认一句。'; }
  else if(d.decl==='部分'){ v0='warn'; i0='部分报关单为客户抬头、部分不是，说明资质可能仅办理了一部分；按较不利情形评估，该项基础尚不稳固。'; }
  else if(d.decl==='无'){ v0='bad';
    i0='公司没有进出口权、也没做免税备案，货是借'+declTxt+'的抬头出去的，没有报关单、也没有报关清单。这个基础不存在，销售额在税务上就视同内销。'; }
  else { v0='warn'; i0='出口资质与报关主体均未核实——该项为其余各项结论的前置条件，未确认前不宜继续推进。'; }
  rows.push({dir:'基础合规',now:'出口资质：'+({both:'进出口权 + 免税备案都有',qualOnly:'只有进出口权 · 没做免税备案',none:'两个都没有',na:'待确认'}[q]
      ||(d.decl==='有'?'按报关抬头看是自己报关':'没有进出口权 · 无免税备案')),
    v:v0,issue:i0,fix:['s2']});

  /* ② 出口合规：报关抬头在谁名下 + 履约方式对不对得上 */
  var v1='ok',i1='';
  if(d.decl==='有'){ i1='报关单在客户自己名下，这条路是通的。'; }
  else if(d.decl==='部分'){ v1='warn'; i1='一部分票有客户自己抬头，一部分没有——按最差的那部分算，等于没有。'; }
  else if(d.decl==='无'){ v1='bad';
    i1='报关单位是'+declTxt+'，不是客户公司，客户手里没有自己名下的报关清单——出口这一环不合规。'; }
  else { v1='warn'; i1='报关主体还没问清——这是全部结论的前提，不确认就不能往下讲。'; }
  if(A.decl==='self'&&f&&f.decl==='无'){ v1='bad';
    i1='按「'+d.n+'」出货，报关单通常是平台或物流商的名字，客户记成自己抬头报关——出货方式和报关主体对不上。'; }
  else if(d.cf){ v1=(v1==='ok'?'warn':v1); i1+='　'+d.cf; }
  else if(f&&f.c==='硬约束'&&A.decl!=='plat'){ v1=(v1==='ok'?'warn':v1);
    i1+='　'+d.platN+' 强制指定物流，客户不能自选货代和报关行，想改自报这条路走不通。'; }
  /* 建议报关方式：按发货方式推（FBA/海外仓→9810、直发→9610、一般贸易→0110），无票可考虑 1039 */
  var tgt=(f&&(f.mode==='9810'||f.mode==='9610'||f.mode==='0110'||f.mode==='1039'))?f.mode:'';
  var adv='',advWhy='';
  if(tgt==='9810'){ adv='9810（跨境电商出口海外仓）';
    advWhy='货是批量发到海外仓再卖的，9810 按海外仓备货报关，报关离岸价按国内采购成本加合理利润申报，是最贴你这种发货方式的模式。'
      +'执行上是四个动作：生成订单号（填 SKU、重量、单价）、操作无纸化流程（首次操作一次即可）、推单（把店铺买家订单数据同步给货代仓库报关系统）、授权报关代理机构。'
      +'报关费市场行情 80~300 元/票（渠道不同报价差异大，须对比出货重量与包含项），可与客户现有货代比价，这部分是货代额外收的，可以省。'; }
  else if(tgt==='9610'){ adv='9610（跨境电商零售出口）';
    advWhy='货是零售直发、走小包或平台物流出去的，9610 就是为这种小包直发设的，凭清单汇总报关，能拿到报关单。'; }
  else if(tgt==='0110'){ adv='0110（一般贸易出口）';
    advWhy='这批货是整批出给境外公司的，走一般贸易 0110，单证齐套就能报关、能退税，适合大货一次出。'; }
  else if(tgt==='1039'){ adv='1039（市场采购贸易）';
    advWhy='上游开不了票，1039 免征不退，是没有进项票时让货合法出去的一条路。'; }
  if(A.invoice==='none'&&tgt&&tgt!=='1039') advWhy+='　无票那部分也可以考虑 1039（免征不退）——两条路不冲突，分开走。';
  if(adv){
    i1+=(i1?'　':'')+'<b>建议报关方式：'+adv+'</b>。'+advWhy;
    if(d.decl==='无') i1+='　注意执行顺序：'+(A.impExp?'需先办理免税备案':'需先办理进出口权与免税备案')+'，再按该报关模式申报；前置资质未完成即调整报关模式，不具备实际效果。';
  }else if(d.modeShow&&d.modeShow!=='待确认'){
    i1+=(i1?'　':'')+'<b>建议报关方式：'+d.modeShow+'</b>。';
  }
  rows.push({dir:'出口合规',now:'报关单抬头：'+declTxt+' · '+d.n+(adv?' · 建议走 '+adv.slice(0,4):''),
    v:v1,issue:i1,fix:['s2','s3','s5','s7']});

  /* ③ 申报合规：跟平台推送的数据对不对得上 */
  var v2='ok',i2='';
  if(A.file==='zero'){ v2='bad'; i2='平台有流水却一直零申报，缺口是销售额全额；这不是少报，是没报。'; }
  else if(A.file==='cash'){ v2='bad'; i2='按平台打款额申报，佣金、运费、退款没算进去，差额部分要按合规补增值税。建议收汇走网商银行，免跨境 / 跨行提现手续费，回款流水也更清晰、便于按实申报。'; }
  else if(A.file==='real'){ i2='按实际销售额申报，收入和平台对得上，申报口径站得住。'; }
  else { v2='warn'; i2='申报口径还没问清。'; }
  rows.push({dir:'申报合规',now:'申报口径：'+({real:'按实际申报',cash:'按回款申报',zero:'零申报'}[A.file]||'未填'),v:v2,issue:i2,fix:['s11','s3','s6','s9']});

  /* ④ 成本合规：平台成本 / 采购票 / 人力工资 三块 */
  var v3='ok',i3='',per=(A.flow!=null&&A.subs>0)?A.flow/A.subs:null;
  if(A.file==='zero'||A.file==='cash'){
    v3='warn';
    i3='平台费用（佣金、FBA 仓储费、配送费、广告费）没按明细入账，成本这块是空的。这部分少则占销售额 40%，多则 60% 甚至 70%；不按明细录进明细账，企业所得税就抵不掉——没有明细账，税局也可能不认。'
      +'再加上供应商开具的进项票（约 10%~30%），企业成本可以做到 70% 左右；'
      +'国内成本再把财务服务费、员工工资、交通费、差旅费、餐饮费、业务招待费、货代物流费一并做进去，税务系统里的利润就落在 10%~20%——这个利润贴着实际，甚至比实际还低一点。';
  }
  if(A.invoice==='none'){ v3='bad';
    i3+=(i3?'　':'')+'问了确实开不了票，成本进不来：增值税这边能免，但企业所得税利润虚高，多交 25%——这两件事别混着讲。'; }
  else if(A.invoice==='unknown'){ v3=(v3==='ok'?'warn':v3);
    i3+=(i3?'　':'')+'客户说开不了，但压根没问过供应商——这不是结论。方案第一件事是让他去问一句普票，一般都能开，只加 1~3 个点。'; }
  else if(A.invoice==='special'){
    i3+=(i3?'　':'')+'只能开专票、还要加 8~10 个点：这个模式退不了税，专票只剩抵企税的作用，为它多付的点数白花，谈普票就够。'; }
  else if(A.invoice==='normal'){
    i3+=(i3?'　':'')+'能开普票，采购成本能进账；普票够用，不用为专票多付税点。'; }
  else { v3=(v3==='ok'?'warn':v3); i3+=(i3?'　':'')+'开票情况还没问清。'; }
  if(A.staff==='yes'){ i3+=(i3?'　':'')+'人力这块有在职员工，工资可以按年入账抵企业所得税；月薪 5000 以内不产生个税。'; }
  else if(A.staff==='retired'){ i3+=(i3?'　':'')+'只有退休返聘的，按返聘劳务入账，月薪 5000 以内不产生个税，成本一样能抵。'; }
  else if(A.staff==='no'){ v3=(v3==='ok'?'bad':v3);
    i3+=(i3?'　':'')+'公司一个员工都没有，工资这条路走不通——成本只能靠平台费用和采购票，企业所得税基本抵不掉，这个要跟客户说清楚。'; }
  else { i3+=(i3?'　':'')+'人力成本要问一句：有没有给员工发工资入账？没录工资，这块成本也是空的。'; }
  if(A.flow!=null&&A.flow!=='na'&&Number(A.flow)>=500&&A.entity==='small'){
    var tp=taxModel();
    v3='warn';
    var fp=(tp.plans||[]).filter(function(x){return x.id==='five';})[0];
    i3+='　年销售额约 '+Math.round(A.flow)+' 万，身份还是小规模——已超 500 万。'+(fp?(' '+fp.desc):'不直接升一般人，用控额 / 月份拆分把增值税尽量留在 1%。');
  }
  rows.push({dir:'成本合规',now:'平台成本：'+(A.file==='real'?'按明细入账':'未按明细入账')
      +' · 采购票：'+({normal:'能开普票',special:'只能开专票（税点贵）',unknown:'说开不了，没问过',none:'问了明确不开',na:'待确认'}[A.invoice]||'未填')
      +' · 人力工资：'+({yes:'有在职员工',retired:'只有返聘',no:'没有人员',na:'待确认'}[A.staff]||'待确认'),
    v:v3,issue:i3,fix:['s12','s6','s9','s10']});

  /* ⑤ 历史遗留：税局短信点名 / 被查过 / 零申报隐藏存量 */
  var v4='ok',i4='';
  if(A.hist==='check'){ v4='bad';
    i4='以前被查过、更正过——开工前先确认那个案子结案没有、补没补完。没结案就动新方案，新方案会被一起算进去。'; }
  if(A.sms==='y'){
    v4=(v4==='ok'?'warn':v4);
    i4+=(i4?'　':'')+'税局短信点名 '+(qN?qN+' 个季度（'+qs.join('、')+'）':'了几个季度'+(A.smsAmt?'，合计约 '+A.smsAmt+' 万':''))
      +'，这几个季度要按实际销售额口径更正，金额以实际数据为准。口径是「先合规，再核定」——不合规，税局不给核定。'
      +'需如实告知客户：免税填报目前没有明文规定，若被核查出金额差异，按实际金额更正即可，更正后方案本身仍成立；不得承诺"查不到""不会被查"。';
  }
  if(histOf()==='zero'){
    v4=(v4==='ok'?'warn':v4);
    i4+=(i4?'　':'')+'一直零申报 / 按回款申报，且开始做跨境已超半年——平台按季报送后数据必然对不上，只是税局尚未点名。先算清缺口再动手，别等被通知。';
  }
  /* 深圳主体：历史数据可尝试 13 栏免税填报，把补税敞口压到最低 */
  if(A.szExempt){
    i4+=(i4?'　':'')+'深圳主体：13 栏免税默认开通，过往数据可先尝试按免税填报（出口免税销售额），能免则免，免不了的差额再更正补税。';
  }
  /* 量化缺口：把「问题有多大」算出来 */
  var gp=gapInfo();
  if(gp.has){
    i4+=(i4?'　':'')+'测算缺口：'+gp.scope+(gp.vat!=null?('；如被要求补增值税，约 '+gp.vat+' 万'+(gp.late!=null?('、滞纳金拖一年约 '+gp.late+' 万'):'')):'')+'。';
  }
  if(!i4){ i4='没有存量，历史是干净的，直接从今年开始按合规走。'; }
  rows.push({dir:'历史遗留',now:'历史遗留：'+tkHistInferText()
      +(A.sms==='y'?' · 已收到税局短信'+(qN?'，点名 '+qN+' 个季度':''):''),
    v:v4,issue:i4,fix:['s1']});
  return rows;
}

function ckClient(d){
  var _ie=ieState(), R=[], q=A.qual||'', i;
  /* ① 出口资质 */
  if(q==='both'||(_ie.ie&&_ie.tf)){
    R.push({t:'出口资质　已经没问题',tag:'ok',line:'贵司的进出口权和出口免税备案都已经办好，出海这块的资质是齐的。后面只要把报关抬头换回贵司自己的名字，就有自己的出口凭证了。'});
  } else if(q==='qualOnly'||(_ie.ie&&!_ie.tf)){
    R.push({t:'出口资质　免税备案还没补上',tag:'bad',line:'贵司已经办了进出口权，但出口免税备案还没做。这一项不补上，申报表上的 13 栏（出口免税栏）填不进去，出口免税和退税暂时都还谈不上。'});
  } else if(q==='none'||d.decl==='无'){
    R.push({t:'出口资质　还没办下来',tag:'bad',line:'贵司目前还没有办理进出口权，也没有做出口免税备案，货是借别的抬头出去的，所以手里没有自己名下的报关单。这一项不成立，销售额在税务上只能视同内销处理，出口免税和退税也就没有依据。'});
  } else {
    R.push({t:'出口资质　还需要再确认一次',tag:'warn',line:'出口资质这块我们再跟您对一遍落实情况。确认之后，后面的安排就能一次到位，不用返工。'});
  }
  /* ② 报关单抬头 */
  var dn={self:'贵司自己公司抬头',maidan:'货代买单',ddp:'双清包税',plat:'平台代报',na:'待定'}[A.decl]||'待定';
  if(d.decl==='有'){
    R.push({t:'报关单　已经是贵司抬头',tag:'ok',line:'报关单已经在贵司自己名下，出口这一环是通的，有自己的凭证。'});
  } else if(d.decl==='部分'){
    R.push({t:'报关单　只有一部分是贵司抬头',tag:'warn',line:'现在有一部分报关单是贵司抬头、有一部分不是。按还没有的那部分算，出口凭证这一环还不算完整。'});
  } else if(d.decl==='无'){
    R.push({t:'报关单　拿不到贵司抬头的',tag:'bad',line:'报关现在是走「'+dn+'」出去的，不是贵司的名字，所以贵司手里拿不到自己名下的报关清单。出口这一环没有自己的凭证，免税和退税就没有依据。'});
  } else {
    R.push({t:'报关单　还需要再确认一次',tag:'warn',line:'报关这块我们再跟您对一遍抬头的情况。确认清楚之后，后面的报关方式就能一次定下来。'});
  }
  /* ③ 申报口径 */
  if(A.file==='real'){
    R.push({t:'申报　口径站得住',tag:'ok',line:'贵司是按实际销售额申报的，收入和平台能对得上，这一项没有问题。'});
  } else if(A.file==='cash'){
    R.push({t:'申报　按回款在报，差额要补',tag:'bad',line:'目前是按平台打款额在申报，佣金、运费、退款没有算进去。差额这部分需要按合规口径补缴增值税。'});
  } else if(A.file==='zero'){
    R.push({t:'申报　一直是零申报',tag:'bad',line:'平台有流水，但一直是零申报，缺的是销售额全额。这不是少报，是没报，这部分敞口要先算清楚。'});
  } else {
    R.push({t:'申报　还需要再确认一次',tag:'warn',line:'申报这块我们再跟您对一遍口径。口径一定，后面每一期怎么报就清楚了。'});
  }
  /* ④ 成本 */
  var c=[], costBad=false;
  if(A.file==='zero'||A.file==='cash'){
    c.push('平台费用（佣金、仓储、配送、广告）还没有按明细入账，这块成本暂时是空的。补齐之后，贵司的成本结构和账面利润才会回到合理水平。');
    costBad=true;
  }
  if(A.invoice==='none'){ c.push('上游供应商明确开不了票，采购成本进不来账：增值税这边可以免，但企业所得税的利润会虚高，多交 25%。'); costBad=true; }
  else if(A.invoice==='unknown'){ c.push('上游开票的情况还需要再落实一句，多数情况下普票开得出来，只加 1~3 个点。'); costBad=true; }
  else if(A.invoice==='special'){ c.push('供应商只能开专票、还要加 8~10 个点。这个模式退不了税，专票的意义不大，谈普票就够了。'); }
  else if(A.invoice==='normal'){ c.push('采购能开普票，成本可以正常进账，不用为专票多付税点。'); }
  if(A.staff==='yes'){ c.push('贵司有在职员工，工资可以按年入账抵企业所得税，月薪 5000 以内不产生个税。'); }
  else if(A.staff==='retired'){ c.push('返聘人员的报酬按劳务入账，成本一样能抵，月薪 5000 以内不产生个税。'); }
  else if(A.staff==='no'){ c.push('公司目前没有员工工资这一项，成本只能靠平台费用和采购票来抵，企业所得税基本抵不掉。'); costBad=true; }
  if(!c.length) c.push('成本这一块目前没有特别要处理的地方。');
  R.push({t:'成本　'+(costBad?'还没回到合理水平':'没有明显缺口'),tag:(costBad?'bad':'ok'),line:c.join('')});
  /* ⑤ 历史遗留 */
  var hz=[], hb=false;
  if(A.hist==='check'){ hz.push('以前被查过或者更正过。开工前要先确认那个案子有没有结案、补没补完，没有结案就动新方案，两件事会被算到一起。'); hb=true; }
  if(A.sms==='y'){
    var qz=(A.smsQ&&A.smsQ.length)?A.smsQ.join('、'):'';
    hz.push('税局已经就'+(qz?qz:'前几个季度')+'发过短信。'+(qz?'这几个季度':'这部分')+'要按实际销售额的口径更正，金额以实际数据为准；顺序上是先合规，再谈核定——不合规，核定申请不会被受理。');
    hb=true;
  }
  if(histOf()==='zero'){ hz.push('一直零申报或者按回款申报，做跨境已经超过半年。平台按季报送之后，数据迟早会对不上，先把缺口算清楚再动手会更稳。'); hb=true; }
  if(noVatRisk()){ hz.push('公司目前的主体不存在增值税问题，需要处理的是企业所得税的问题，这部分可以延后处理。'); }
  else if(A.szExempt){ hz.push('深圳主体的 13 栏免税是默认开通的，过往的数据可以先尝试按免税填报，能免则免，免不了的差额再更正补税。'); }
  if(!hz.length) hz.push('历史上没有存量问题，从今年开始按合规走就可以。');
  R.push({t:'历史　'+(hb?'有存量要先处理':'没有问题'),tag:(hb?'bad':'ok'),line:hz.join('')});
  return R;
}

scope.Engine={
  pct:pct,
  platKey:platKey,
  platDef:platDef,
  flowBand:flowBand,
  monthsAgo:monthsAgo,
  ieState:ieState,
  tkHistDerive:tkHistDerive,
  tkHistInferText:tkHistInferText,
  histOf:histOf,
  custNew:custNew,
  noVatRisk:noVatRisk,
  heDingEligible:heDingEligible,
  taxCalc:taxCalc,
  taxModel:taxModel,
  gapInfo:gapInfo,
  declMap:declMap,
  declName:declName,
  qualChain:qualChain,
  entNameOf:entNameOf,
  histPlan:histPlan,
  histTaxCompare:histTaxCompare,
  derive:derive,
  planCheck:planCheck,
  ckClient:ckClient,
  SAY_P:SAY_P,
  PLAT:PLAT,
  MODEN:MODEN,
  DECLD:DECLD
};
})(typeof window!=="undefined"?window:globalThis);
