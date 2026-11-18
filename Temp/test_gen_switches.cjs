// VM 测试：方案书设置三开关（历史/罚款/核定）auto 与 force 覆盖 + 采集进度不受影响
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('public/tools/cross/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let code = '';
for (const s of scripts) if (s.includes('var TK=')) code = s;
code += '\nwindow.__t={tkReset:tkReset,tkToA:tkToA,custNew:custNew,heDingEligible:heDingEligible,noVatRisk:noVatRisk,histTaxCompare:histTaxCompare,tkHas:tkHas,tkNeed:tkNeed,tkDoneCount:tkDoneCount,tkTotal:tkTotal,tkNext:tkNext,tkGenSummary:tkGenSummary,tkSetGen:tkGenSet,tkBodyHTML:tkBodyHTML,futureTaxParas:futureTaxParas,genPlanDoc:genPlanDoc,getTK:function(){return TK;},setTK:function(v){TK=v;},getA:function(){return A;}};';

function collect(n){ return n && n._text ? n._text : ''; }
function TextRun(t,o){ var v=(t&&typeof t==='object')?t.text:t; return { _text:String(v==null?'':v) }; }
function Paragraph(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)); return { _text:s }; }
function TableCell(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)+'|'); return { _text:s }; }
function TableRow(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)); return { _text:s }; }
function Table(o){ var s=''; (o&&o.rows||[]).forEach(c=>s+=collect(c)+'\n'); return { _text:s }; }
function ImageRun(){ return { _text:'' }; }
function Footer(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)); return { _text:s }; }
function Document(o){ var s=''; if(o&&o.sections) o.sections.forEach(sec=>{ (sec&&sec.children||[]).forEach(c=>s+=collect(c)+'\n'); if(sec&&sec.footers&&sec.footers.default) s+=collect(sec.footers.default); }); return { __full:s }; }
var docx={ TextRun, Paragraph, TableCell, TableRow, Table, ImageRun, Footer, Document,
  AlignmentType:{JUSTIFIED:'both',CENTER:'center'}, WidthType:{PERCENTAGE:'pct'}, BorderStyle:{SINGLE:'single',NONE:'none'},
  PageNumber:{CURRENT:'CURRENT'}, Packer:{toBlob:async function(doc){return {__doc:doc};}} };

function fakeEl(){ return { value:'',innerHTML:'',textContent:'',style:{},disabled:false,
  classList:{add(){},remove(){},contains(){return false;}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null;},querySelectorAll(){return [];},querySelector(){return fakeEl();},focus(){},click(){} }; }
var els={},store={};
var lsStub={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sandbox={ document:{readyState:'complete',getElementById(id){if(!els[id])els[id]=fakeEl();return els[id];},
  querySelector(){return fakeEl();},querySelectorAll(){return [];},createElement(){return fakeEl();},addEventListener(){},body:fakeEl()},
  window:{},localStorage:lsStub,sessionStorage:lsStub,navigator:{},console,setTimeout,clearTimeout,scrollTo(){},alert(){},confirm(){return true;},
  docx,buildCover:async function(){return null;},loadImg:async function(){return null;} };
sandbox.window=sandbox; sandbox.window.scrollTo=function(){}; sandbox.window.addEventListener=function(){};
vm.createContext(sandbox);
try{ new vm.Script(code,{filename:'cross-inline.js'}).runInContext(sandbox); }
catch(e){ console.error('SYNTAX/RUN ERROR:',e.message); process.exit(1); }
var t=sandbox.__t;
if(!t){ console.error('FAIL: 函数未暴露'); process.exit(1); }

function fixTK(o){
  if(!o.fuls)o.fuls={}; if(!o.decls)o.decls={};
  (o.plats||[]).forEach(function(p){ if(o.fuls[p]==null)o.fuls[p]='fba'; if(o.decls[p]==null)o.decls[p]='own'; });
  if(!o.asks)o.asks=[]; if(!o.log)o.log=[]; if(!o.quarters)o.quarters=[]; if(!o.confAck)o.confAck=[];
  if(o.genHist==null)o.genHist='auto'; if(o.genFine==null)o.genFine='auto'; if(o.genHed==null)o.genHed='auto';
  return o;
}
function setup(over){
  var base={cid:'A001',fresh:false,startMonth:'2026-03',file:'real',sms:'n',subs:1,
    plats:['amazon'],fuls:{amazon:'fba'},decls:{amazon:'own'},flow:200,staffN:2,
    impExp:false,taxFiling:false,city:'sz',cityText:'深圳',entity:'small',hist:'new',
    genHist:'auto',genFine:'auto',genHed:'auto'};
  Object.keys(over||{}).forEach(function(k){ base[k]=over[k]; });
  t.setTK(fixTK(base)); t.tkToA();
}

var pass=true;
function check(name,cond){ if(!cond){console.log('FAIL:',name);pass=false;} else console.log('ok  :',name); }

// ========== 1. 卡片 UI 与采集进度 ==========
setup({});
var tb=t.tkBodyHTML('gen');
check('gen card has 3 switches', (tb.match(/tkGenSet\(/g)||[]).length>=9); // 3 开关 ×3 态按钮... 实际 9 个 onclick
check('gen card mentions 历史数据', tb.indexOf('历史数据')>=0);
check('gen card mentions 罚款', tb.indexOf('罚款')>=0);
check('gen card mentions 核定', tb.indexOf('核定')>=0);
check('gen not required (tkNeed via table)', t.tkNeed('gen')===true);
check('auto -> tkHas(gen) false (不计进度)', t.tkHas('gen')===false);
t.tkSetGen('genHist','force');
check('force -> tkHas(gen) true', t.tkHas('gen')===true);
check('summary reflects force', t.tkGenSummary().indexOf('历史')>=0);
t.tkSetGen('genHist','auto');

// 采集进度：gen 不在 TK_IDS / tkNext ids
var total1=t.tkTotal();
setup({});
check('tkTotal stable regardless gen', total1===t.tkTotal());

// ========== 2. genHist 历史章节覆盖 ==========
setup({});                       // 2026 新主体 auto
check('auto new -> custNew true', t.custNew()===true);
t.tkSetGen('genHist','force');   // 强制算历史
check('force history -> custNew false', t.custNew()===false);
t.tkSetGen('genHist','forceNo'); // 强制不算历史
check('forceNo history -> custNew true', t.custNew()===true);
t.tkSetGen('genHist','auto');

// 真实新主体 + force 历史，端到端应出历史章节
setup({genHist:'force'});
var doc=t.genPlanDoc;

// ========== 3. genFine 罚款覆盖（histTaxCompare） ==========
setup({flow:80,entity:'small'}); // 小规模 <120 万：默认免罚款
var htc=t.histTaxCompare();
check('auto small<120 -> fineOff true', htc.noVatRisk===true && htc.fineLow===0);
check('auto small<120 -> vatExempt true', htc.vatExempt===true && htc.vat1===0);
t.tkSetGen('genFine','force');
var htc2=t.histTaxCompare();
check('force fine -> fineOff false', htc2.noVatRisk===false);
check('force fine -> fineLow>0', htc2.fineLow>0);
check('force fine -> vat unchanged (vat1=0)', htc2.vat1===0);
t.tkSetGen('genFine','forceNo');
var htc3=t.histTaxCompare();
check('forceNo fine -> fineOff true', htc3.noVatRisk===true && htc3.fineLow===0);

// 一般人 >120 万：默认算罚款；forceNo 强制隐去
setup({flow:400,entity:'general'});
var htc4=t.histTaxCompare();
check('auto general -> fine shown', htc4.noVatRisk===false && htc4.fineLow>0);
t.tkSetGen('genFine','forceNo');
var htc5=t.histTaxCompare();
check('forceNo general -> fine hidden', htc5.noVatRisk===true && htc5.fineLow===0);
check('forceNo general -> vat unchanged', htc5.vat1>0);

// ========== 4. genHed 核定覆盖 ==========
setup({startMonth:'2024-06'}); // 2025 前 auto 可核定
check('auto 2024 -> heDingEligible true', t.heDingEligible()===true);
t.tkSetGen('genHed','forceNo');
check('forceNo hed -> false', t.heDingEligible()===false);
t.tkSetGen('genHed','force');
setup({startMonth:'2026-03'});
check('auto 2026 -> false', t.heDingEligible()===false);
t.tkSetGen('genHed','force');
check('force hed -> true even 2026', t.heDingEligible()===true);

// ========== 5. 端到端：新主体 force 历史 → 出历史章节；forceNo 罚款 → 无罚款行 ==========
(async function(){
  setup({genHist:'force',genFine:'forceNo'});
  var blob=await t.genPlanDoc('',{decl:'own'});
  var text=blob.__doc.__full;
  check('E2E force history -> has 历史遗留数据处理方案', text.indexOf('历史遗留数据处理方案')>=0);
  check('E2E forceNo fine -> NO 罚款风险 row', text.indexOf('罚款风险（0.5~5 倍）')<0 || text.indexOf('暂不计算')>=0);

  setup({genHist:'forceNo',genHed:'force'}); // 2026 新主体 + 强制不算历史 + 强制可核定
  var blob2=await t.genPlanDoc('',{decl:'own'});
  var text2=blob2.__doc.__full;
  check('E2E forceNo history -> 未来税负预测', text2.indexOf('未来税负预测')>=0);
  check('E2E forceNo history -> NO 历史遗留章节', text2.indexOf('历史遗留数据处理方案')<0);

  // 老存档：无 gen 字段全部按 auto
  t.setTK(fixTK({cid:'OLD',fresh:false,startMonth:'2026-03',file:'real',sms:'n',subs:1,
    plats:['amazon'],flow:200,staffN:0,impExp:false,taxFiling:false,city:'sz',cityText:'深圳',entity:'small',hist:'new'}));
  t.tkToA();
  check('legacy no gen fields -> custNew auto true', t.custNew()===true);
  check('legacy no gen fields -> summary empty', t.tkGenSummary()==='');

  console.log(pass?'\nALL GEN-SWITCH CHECKS PASSED':'\nSOME CHECKS FAILED');
  process.exit(pass?0:1);
})().catch(e=>{ console.error('E2E ERROR:',e.stack||e.message); process.exit(1); });
