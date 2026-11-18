// VM 测试：新主体方案书走「未来税负预测」而非「历史遗留/核定」
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('public/tools/cross/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let code = '';
for (const s of scripts) if (s.includes('var TK=')) code = s;
// 全局作用域，末尾追加暴露
code += '\nwindow.__t={futureTaxParas:futureTaxParas,custNew:custNew,taxCalc:taxCalc,tkToA:tkToA,heDingEligible:heDingEligible,getTK:function(){return TK;},setTK:function(v){TK=v;},getA:function(){return A;}};';
// 注：setTK 后由测试侧 fixTK 补齐 fuls/decls（见下）

// ---- docx 桩：把文本收集到 _text 便于断言 ----
function collect(node){ return node && node._text ? node._text : ''; }
function TextRun(t,o){ return { _text: String(t==null?'':t) }; }
function Paragraph(o){
  var s='';
  (o&&o.children||[]).forEach(function(c){ s+=collect(c); });
  return { _text:s };
}
function TableCell(o){ var s=''; (o&&o.children||[]).forEach(function(c){ s+=collect(c)+'|'; }); return { _text:s }; }
function TableRow(o){ var s=''; (o&&o.children||[]).forEach(function(c){ s+=collect(c); }); return { _text:s }; }
function Table(o){ var s=''; (o&&o.rows||[]).forEach(function(r){ s+=collect(r)+'\n'; }); return { _text:s }; }
var docx={
  TextRun:TextRun, Paragraph:Paragraph, TableCell:TableCell, TableRow:TableRow, Table:Table,
  AlignmentType:{ JUSTIFIED:'both', CENTER:'center' },
  WidthType:{ PERCENTAGE:'pct' },
  BorderStyle:{ SINGLE:'single' }
};

function fakeEl(){ return { value:'', innerHTML:'', textContent:'', style:{}, disabled:false,
  classList:{add(){},remove(){},contains(){return false;}}, appendChild(){}, removeChild(){},
  addEventListener(){}, setAttribute(){}, getAttribute(){return null;}, querySelectorAll(){return [];},
  querySelector(){return fakeEl();}, focus(){}, click(){} }; }
var els={};
var store={};
var localStorageStub={ getItem(k){return store[k]||null;}, setItem(k,v){store[k]=String(v);}, removeItem(k){delete store[k];}, key(i){return Object.keys(store)[i]||null;}, get length(){return Object.keys(store).length;} };
function fixTK(o){ if(!o.fuls)o.fuls={}; if(!o.decls)o.decls={}; (o.plats||[]).forEach(function(p){ if(o.fuls[p]==null)o.fuls[p]='fba'; if(o.decls[p]==null)o.decls[p]='own'; }); return o; }
var sandbox={ document:{ readyState:'complete', getElementById(id){if(!els[id])els[id]=fakeEl();return els[id];},
  querySelector(){return fakeEl();}, querySelectorAll(){return [];}, createElement(){return fakeEl();},
  addEventListener(){}, body:fakeEl() }, window:{}, localStorage:localStorageStub,
  sessionStorage:localStorageStub, navigator:{}, console, setTimeout, clearTimeout,
  scrollTo(){}, alert(){}, confirm(){return true;}, docx:docx };
sandbox.window=sandbox; sandbox.window.scrollTo=function(){}; sandbox.window.addEventListener=function(){};

vm.createContext(sandbox);
try { new vm.Script(code, {filename:'cross-inline.js'}).runInContext(sandbox); }
catch(e){ console.error('SYNTAX/RUN ERROR:', e.message); process.exit(1); }
var t=sandbox.__t;
if(!t){ console.error('FAIL: 函数未暴露'); process.exit(1); }

var pass=true;
function check(name,cond){ if(!cond){ console.log('FAIL:',name); pass=false; } else console.log('ok  :',name); }
function parasText(paras){ return paras.map(collect).join('\n'); }
function setTK(o){ t.setTK(fixTK(o)); }

// 场景1：2026 年起步的新主体 → custNew=true
setTK({cid:'A001',fresh:false,startMonth:'2026-03',file:'real',sms:'n',subs:1,plats:['amazon'],flow:200,staffN:2,impExp:false,taxFiling:false,city:'sz',cityText:'深圳'});
t.tkToA();
check('2026 起步 → custNew true', t.custNew()===true);
check('2026 起步 → heDingEligible false', t.heDingEligible()===false);

// 生成未来预测章节
var fp=t.futureTaxParas({R:TextRun,P:Paragraph,T:Table,TR:TableRow,TC:TableCell,
  WT:docx.WidthType,BS:docx.BorderStyle,AT:docx.AlignmentType,
  FHei:{},FSong:{}});
var txt=parasText(fp);
check('future section has 未来税负预测标题', txt.indexOf('未来税负预测')>=0);
check('future section has 年度税负测算', txt.indexOf('年度税负测算')>=0);
check('future section NO 核定', txt.indexOf('核定')<0);
check('future section NO 历史遗留', txt.indexOf('历史遗留')<0);
check('future section NO 补税', txt.indexOf('补税')<0);
check('future section has 增值税 0', txt.indexOf('0 元')>=0);
check('future section has 综合税负率', txt.indexOf('综合税负率')>=0);

// 数字口径：sales=200, plat=50%=100, purch=20%=40, labor=2×6=12, profit=48, vat=0(免税), cit=48×5%=2.4, baseTax=2.4, rate=1.2%
check('profit 48', txt.indexOf('48 万元')>=0);
check('cit 2.4 万', txt.indexOf('2.4 万元')>=0);
check('baseTax 2.4 万', txt.indexOf('2.4 万元')>=0);
check('rate 1.2%', txt.indexOf('1.2%')>=0);

// 场景2：一键「刚注册无历史」
setTK({fresh:true,startMonth:'na',file:'real',sms:'n',subs:1,plats:['amazon'],flow:300,staffN:0,impExp:false,taxFiling:false,city:'sz',cityText:'深圳'});
t.tkToA();
check('fresh → custNew true', t.custNew()===true);
var fp2=parasText(t.futureTaxParas({R:TextRun,P:Paragraph,T:Table,TR:TableRow,TC:TableCell,WT:docx.WidthType,BS:docx.BorderStyle,AT:docx.AlignmentType,FHei:{},FSong:{}}));
check('fresh intro 刚注册', fp2.indexOf('刚注册的新主体')>=0);
check('fresh NO 核定', fp2.indexOf('核定')<0);

// 场景3：老客户（税局短信）→ custNew=false，仍应走历史章节（不生成未来预测）
setTK({fresh:false,sms:'y',startMonth:'2024-06',file:'zero',subs:1,plats:['amazon'],flow:300,staffN:0,impExp:false,taxFiling:false,city:'sz',cityText:'深圳'});
t.tkToA();
check('短信客户 → custNew false', t.custNew()===false);

// 场景4：没填销售额 → 未来预测给占位提示，不崩
setTK({fresh:true,startMonth:'na',file:'real',sms:'n',subs:1,plats:[],flow:null,staffN:0,impExp:false,taxFiling:false,city:'sz',cityText:'深圳'});
t.tkToA();
var fp4=parasText(t.futureTaxParas({R:TextRun,P:Paragraph,T:Table,TR:TableRow,TC:TableCell,WT:docx.WidthType,BS:docx.BorderStyle,AT:docx.AlignmentType,FHei:{},FSong:{}}));
check('no sales → placeholder', fp4.indexOf('待贵司提供预计年销售额')>=0);
check('no sales → NO crash & NO 核定', fp4.indexOf('核定')<0);

console.log(pass?'\nALL FUTURE-TAX CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
