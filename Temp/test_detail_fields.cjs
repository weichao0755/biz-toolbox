// 测试：分组详表参数（字段池 / 分组渲染 / 详细参数进入引擎结论）
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('public/tools/plan-doc/index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts[scripts.length-1];
function el(){return{value:'',innerHTML:'',innerText:'',textContent:'',style:{},disabled:false,
  classList:{add(){},remove(){},contains(){return false}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null},querySelectorAll(){return[]},querySelector(){return el()},focus(){},click(){}};}
var els={},st={};
var ls={getItem(k){return st[k]||null;},setItem(k,v){st[k]=String(v);},removeItem(k){delete st[k];},key(i){return Object.keys(st)[i]||null;},get length(){return Object.keys(st).length;}};
var sb={document:{getElementById(id){if(!els[id])els[id]=el();return els[id];},querySelector(){return el();},querySelectorAll(){return[];},createElement(){return el();},addEventListener(){},body:el()},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console,setTimeout,clearTimeout,location:{origin:'http://test'},alert(){},confirm(){return true;},fetch:async()=>{throw new Error('no net');}};
sb.window=sb;sb.window.scrollTo=function(){};sb.window.addEventListener=function(){};
vm.createContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/fields.js','utf8')).runInContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/engine.js','utf8')).runInContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/deep-engine.js','utf8')).runInContext(sb);
new vm.Script(code+'\nwindow.__t={pickInd:pickInd,renderForm:renderForm,fieldsForCurrent:fieldsForCurrent,collectFacts:collectFacts,toggleSec:toggleSec,getData:function(){return DATA;},setData:function(v){DATA=v;},getForm:function(){return document.getElementById("paramForm").innerHTML;},buildPrompt:buildPrompt};').runInContext(sb);
const t=sb.__t,F=sb.Fields;
let pass=true;function ck(n,c){if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n);}

// 1. 字段池与分组
ck('field pool >40 fields',Object.keys(F.F).length>=40);
ck('cross 45 fields / 7 groups',F.fieldsFor('cross').length===45&&F.groupsFor('cross').length===7);
ck('domestic 37 fields / 6 groups',F.fieldsFor('domestic').length===37&&F.groupsFor('domestic').length===6);
ck('no duplicate field keys across groups',function(){
  const keys=F.fieldsFor('cross');return new Set(keys.map(f=>f.k)).size===keys.length;
}());
ck('groups cover all fields',function(){
  const g=F.groupsFor('cross').flatMap(x=>x.keys);const f=F.fieldsFor('cross').map(x=>x.k);
  return g.length===f.length && g.every(k=>f.indexOf(k)>=0);
}());

// 2. 分组渲染
t.pickInd('cross');
var form=t.getForm();
ck('form renders group headers',(form.match(/class="fsec"/g)||[]).length===7);
ck('form has 45 fields',(form.match(/class="field"/g)||[]).length===45);
ck('form group titles',form.indexOf('A · 基本盘')>=0&&form.indexOf('G · 诉求与决策')>=0);
ck('form shows total count',form.indexOf('45 项参数')>=0);
t.toggleSec(0);
ck('toggleSec collapses group',t.getForm().indexOf('fsec closed')>=0);
t.toggleSec(0);

// 3. 详细参数进入事实与 prompt（不再只 9 项）
t.setData({cid:'深圳测试科技',plats:['亚马逊'],city:'深圳',entity:'一般纳税人',flow:'800',
  founded:'2024 年及以前',subs:'2 个',staffN:'12',shopN:'5 个站点',category:'3C 配件',
  skuN:'300',avgPrice:'180',orderN:'12',salesChannel:'平台自营/店铺',
  ful:'FBA / 平台仓',declMode:'9810 海外仓',impExp:'已办理',taxFiling:'已备案',dest:'美国 / 欧盟',
  forwarder:'有稳定货代',customsFee:'80~300',
  invoice:'主要是普票',platInvoice:'已按月申请',platCostPct:'40%~60%',purchasePct:'40%~60%',noTicketPct:'30% 以下',laborCost:'72',
  bookStatus:'代理记账（一笔打包）',declMethod:'按实际申报',invoiceIssue:'正常开票',bankAccount:'基本公户',reconcile:'部分对不上',
  hist:'按实际申报',smsQ:'',histGap:'',startMonth:'2024-06',taxRisk:'怕被查',
  need:['出口免税','账务规范'],deadline:'本月内',decision:'老板本人拍板',budget:'看价值，合理就行',
  competitor:'是，在对比',relationship:'老客户介绍',note:'老板要求本周内出方案'});
var facts=t.collectFacts();
ck('facts include detailed fields',facts.indexOf('3C 配件')>=0&&facts.indexOf('12')>=0&&facts.indexOf('已按月申请')>=0);
ck('facts count >=25 lines',facts.split('\n').length>=25);
var p=t.buildPrompt();
ck('prompt includes 客户原话',p.indexOf('老板要求本周内出方案')>=0);
ck('prompt includes 决策人/预算',p.indexOf('老板本人拍板')>=0&&p.indexOf('看价值')>=0);

// 4. 详细参数真正影响引擎结论（中文值映射）
var d=sb.DeepEngine.build('cross',t.getData(),sb.Engine);
ck('engine TK.impExp true from 已办理',sb.TK.impExp===true);
ck('engine TK.taxFiling true from 已备案',sb.TK.taxFiling===true);
ck('engine TK.subs parsed 2',sb.TK.subs===2);
ck('engine TK.staffN 12',sb.TK.staffN===12);
ck('engine points include 经营盘面',d.points.join('|').indexOf('经营盘面')>=0);
ck('engine points include 票据与成本',d.points.join('|').indexOf('票据与成本')>=0);
ck('engine points include 决策',d.points.join('|').indexOf('诉求与决策')>=0);
ck('engine no old 汇总单入账 in domestic',function(){
  var r=sb.DeepEngine.build('domestic',{cid:'X',plats:['淘宝/天猫'],flow:'400',declMethod:'按实际申报',invoice:'主要是普票',platInvoice:'已按月申请'});
  return r.points.join('|').indexOf('凭汇总单按明细账入账')<0 && r.points.join('|').indexOf('申请增值税发票')>=0;
}());

// 5. 国内电商详表
t.pickInd('domestic');
var form2=t.getForm();
ck('domestic form renders 6 groups',(form2.match(/class="fsec"/g)||[]).length===6);
ck('domestic form has 37 fields',(form2.match(/class="field"/g)||[]).length===37);

console.log(pass?'\nALL DETAIL-FIELDS CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
