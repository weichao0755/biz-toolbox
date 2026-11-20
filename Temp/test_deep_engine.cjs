// 测试：深度方案引擎（规则定结论）——跨境电商复用 cross 引擎，国内电商自建同构规则
const fs = require('fs');
const vm = require('vm');
const sb = {console}; sb.window=sb; vm.createContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/engine.js','utf8')).runInContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/deep-engine.js','utf8')).runInContext(sb);
const E=sb.Engine, D=sb.DeepEngine;
let pass=true;
function ck(n,c){ if(!c){console.log('FAIL:',n);pass=false;} else console.log('ok  :',n); }

ck('Engine loaded', !!E && typeof E.planCheck==='function');
ck('DeepEngine loaded', !!D && typeof D.build==='function');

// ===== 跨境电商深度：新主体（刚起步） =====
var pNew={cid:'深圳某某科技',plats:['亚马逊','Temu'],city:'深圳',entity:'小规模纳税人',flow:'200',
  decl:'平台或物流代报、无自有凭证',hist:'刚起步无历史',invoice:'主要是普票',impExp:true,taxFiling:true,subs:1,need:['出口免税','账务规范']};
var dNew=D.build('cross',pNew,E);
ck('cross new: built', !!dNew && dNew.industry==='跨境电商');
ck('cross new: isNew true', dNew.isNew===true);
ck('cross new: has checks', Array.isArray(dNew.checks) && dNew.checks.length>=4);
ck('cross new: roadmap has 新主体 step', dNew.roadmap.some(r=>/新主体/.test(r.t)));
ck('cross new: NO history step', !dNew.roadmap.some(r=>/处理历史申报数据/.test(r.t)));
ck('cross new: points flag new', dNew.points.join('|').indexOf('新主体')>=0);
ck('cross new: points no 核定/补税', dNew.points.join('|').indexOf('核定')<0);

// ===== 跨境电商深度：有历史 + 零申报 =====
var pHist={cid:'广州某某贸易',plats:['Shopee'],city:'广州',entity:'一般纳税人',flow:'600',
  decl:'买单出口、无自有凭证',hist:'收到税局短信',invoice:'大多无票',impExp:false,taxFiling:false,subs:2,need:[]};
var dHist=D.build('cross',pHist,E);
ck('cross hist: isNew false', dHist.isNew===false);
ck('cross hist: has bad checks', dHist.checks.some(c=>c.v==='bad'));
ck('cross hist: roadmap has 资质 step', dHist.roadmap.some(r=>/出口资质/.test(r.t)));
ck('cross hist: roadmap has 报关 step', dHist.roadmap.some(r=>/报关抬头/.test(r.t)));
ck('cross hist: roadmap has 历史 step', dHist.roadmap.some(r=>/历史/.test(r.t)));
ck('cross hist: points include 诊断', dHist.points.join('|').indexOf('合规诊断')>=0);
// 引擎结论：买单出口 decl=maidan -> 不可免税
ck('cross hist: derived mian 不可', /不可/.test(dHist.derived.mian));

// ===== 国内电商深度：零申报（应判 bad） =====
var dZero={cid:'杭州某某商贸',plats:['淘宝/天猫','拼多多'],city:'杭州',entity:'小规模纳税人',flow:'400',
  decl:'零申报',hist:'按回款申报',invoice:'大多无票',subs:1,need:[]};
var rZero=D.build('domestic',dZero);
ck('domestic zero: built', rZero.industry==='国内电商');
ck('domestic zero: 收入申报 bad', rZero.checks.some(c=>c.dir==='收入申报'&&c.v==='bad'));
ck('domestic zero: 成本入账 bad', rZero.checks.some(c=>c.dir==='成本入账'&&c.v==='bad'));
ck('domestic zero: roadmap 如实申报 step', rZero.roadmap.some(r=>/如实申报/.test(r.t)));
ck('domestic zero: roadmap 历史 step', rZero.roadmap.some(r=>/历史申报缺口/.test(r.t)));
ck('domestic zero: points 按平台销售额', rZero.points.join('|').indexOf('按平台销售额')>=0);

// ===== 国内电商深度：新主体（不应有历史 step） =====
var dNewD={cid:'新店',plats:['抖音电商'],city:'深圳',entity:'个人 / 个体户',flow:'80',
  decl:'按实际申报',hist:'刚起步无历史',invoice:'主要是普票',subs:1,need:[]};
var rNewD=D.build('domestic',dNewD);
ck('domestic new: isNew true', rNewD.isNew===true);
ck('domestic new: 历史遗留 ok', rNewD.checks.some(c=>c.dir==='历史遗留'&&c.v==='ok'));
ck('domestic new: NO 历史 step', !rNewD.roadmap.some(r=>/历史申报缺口/.test(r.t)));
ck('domestic new: points no 罚款/补税', rNewD.points.join('|').indexOf('罚款')<0 && rNewD.points.join('|').indexOf('补税')<0);

// ===== 规则结论不含价格/承诺 =====
[dNew,dHist,rZero,rNewD].forEach(function(x,i){
  var all=JSON.stringify(x);
  ck('case'+i+' no price numbers', !/4888|6888|10888|14888|\d{4}元/.test(all));
  ck('case'+i+' no 100%承诺', all.indexOf('一定免税')<0 && all.indexOf('包通过')<0);
});

console.log(pass?'\nALL DEEP-ENGINE CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
