// 端到端：genPlanDoc 完整跑通，验证新主体无核定/历史章节、老客户仍有
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('public/tools/cross/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let code = '';
for (const s of scripts) if (s.includes('var TK=')) code = s;
code += '\nwindow.__t={genPlanDoc:genPlanDoc,tkToA:tkToA,getTK:function(){return TK;},setTK:function(v){TK=v;},getA:function(){return A;}};';

function collect(n){ return n && n._text ? n._text : ''; }
function TextRun(t,o){
  var v = (t && typeof t==='object') ? t.text : t;
  return { _text:String(v==null?'':v) };
}
function Paragraph(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)); return { _text:s }; }
function TableCell(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)+'|'); return { _text:s }; }
function TableRow(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)); return { _text:s }; }
function Table(o){ var s=''; (o&&o.rows||[]).forEach(c=>s+=collect(c)+'\n'); return { _text:s }; }
function ImageRun(){ return { _text:'' }; }
function Footer(o){ var s=''; (o&&o.children||[]).forEach(c=>s+=collect(c)); return { _text:s }; }
function Document(o){
  var s='';
  if(o&&o.sections) o.sections.forEach(sec=>{
    (sec&&sec.children||[]).forEach(c=>s+=collect(c)+'\n');
    if(sec&&sec.footers&&sec.footers.default) s+=collect(sec.footers.default);
  });
  return { _text:s, __full:s };
}
var docx={
  TextRun, Paragraph, TableCell, TableRow, Table, ImageRun, Footer, Document,
  AlignmentType:{ JUSTIFIED:'both', CENTER:'center' },
  WidthType:{ PERCENTAGE:'pct' }, BorderStyle:{ SINGLE:'single', NONE:'none' },
  PageNumber:{ CURRENT:'CURRENT' }, Packer:{ toBlob:async function(doc){ return { __doc:doc }; } }
};

function fakeEl(){ return { value:'', innerHTML:'', textContent:'', style:{}, disabled:false,
  classList:{add(){},remove(){},contains(){return false;}}, appendChild(){}, removeChild(){},
  addEventListener(){}, setAttribute(){}, getAttribute(){return null;}, querySelectorAll(){return [];},
  querySelector(){return fakeEl();}, focus(){}, click(){} }; }
var els={}, store={};
var lsStub={ getItem(k){return store[k]||null;}, setItem(k,v){store[k]=String(v);}, removeItem(k){delete store[k];}, key(i){return Object.keys(store)[i]||null;}, get length(){return Object.keys(store).length;} };
var sandbox={ document:{ readyState:'complete', getElementById(id){if(!els[id])els[id]=fakeEl();return els[id];},
  querySelector(){return fakeEl();}, querySelectorAll(){return [];}, createElement(){return fakeEl();},
  addEventListener(){}, body:fakeEl() }, window:{}, localStorage:lsStub, sessionStorage:lsStub,
  navigator:{}, console, setTimeout, clearTimeout, scrollTo(){}, alert(){}, confirm(){return true;},
  docx,
  // buildCover / loadImg 走 best-effort，桩成 null/异步 null
  buildCover:async function(){ return null; },
  loadImg:async function(){ return null; }
};
sandbox.window=sandbox; sandbox.window.scrollTo=function(){}; sandbox.window.addEventListener=function(){};

vm.createContext(sandbox);
try { new vm.Script(code, {filename:'cross-inline.js'}).runInContext(sandbox); }
catch(e){ console.error('SYNTAX/RUN ERROR:', e.message); process.exit(1); }
var t=sandbox.__t;
if(!t){ console.error('FAIL: 函数未暴露'); process.exit(1); }

function fixTK(o){ if(!o.fuls)o.fuls={}; if(!o.decls)o.decls={}; (o.plats||[]).forEach(function(p){ if(o.fuls[p]==null)o.fuls[p]='fba'; if(o.decls[p]==null)o.decls[p]='own'; }); return o; }

var pass=true;
function check(name,cond){ if(!cond){ console.log('FAIL:',name); pass=false; } else console.log('ok  :',name); }

(async function(){
  // 新主体：2026 年起步
  t.setTK(fixTK({cid:'A001',fresh:false,startMonth:'2026-03',file:'real',sms:'n',subs:1,
    plats:['amazon'],flow:200,staffN:2,impExp:false,taxFiling:false,city:'sz',cityText:'深圳',
    entity:'small',hist:'new'}));
  t.tkToA();
  var blob=await t.genPlanDoc('',{decl:'own'});
  var text=blob.__doc.__full;
  check('NEW: has 未来税负预测', text.indexOf('未来税负预测')>=0);
  check('NEW: NO 历史遗留数据处理方案', text.indexOf('历史遗留数据处理方案')<0);
  check('NEW: NO 税局核定利润', text.indexOf('税局核定利润')<0);
  check('NEW: NO 先合规、再核定', text.indexOf('先合规、再核定')<0);
  check('NEW: has 先合规、稳经营', text.indexOf('先合规、稳经营')>=0);
  check('NEW: has 年度税负测算', text.indexOf('年度税负测算')>=0);

  // 老客户：税局短信 + 零申报 + 2024 起
  t.setTK(fixTK({cid:'B002',fresh:false,startMonth:'2024-06',file:'zero',sms:'y',subs:1,
    plats:['amazon'],flow:300,staffN:0,impExp:false,taxFiling:false,city:'sz',cityText:'深圳',
    entity:'small',hist:'sms'}));
  t.tkToA();
  var blob2=await t.genPlanDoc('',{decl:'own'});
  var text2=blob2.__doc.__full;
  check('OLD: has 历史遗留数据处理方案', text2.indexOf('历史遗留数据处理方案')>=0);
  check('OLD: NO 未来税负预测', text2.indexOf('未来税负预测')<0);
  check('OLD: has 税局核定利润(路径一)', text2.indexOf('税局核定利润')>=0);

  console.log(pass?'\nALL PLAN-DOC E2E CHECKS PASSED':'\nSOME CHECKS FAILED');
  process.exit(pass?0:1);
})().catch(e=>{ console.error('E2E ERROR:', e.stack||e.message); process.exit(1); });
