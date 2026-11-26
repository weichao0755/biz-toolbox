// 测试：跨境电商「模板驱动方案书」（模板数据化 + AI 只写3段 + 其他行业不受影响）
const fs=require('fs'),vm=require('vm');
const DIR='public/tools/plan-doc/';
const html=fs.readFileSync(DIR+'index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts[scripts.length-1];
function el(){return{value:'',innerHTML:'',innerText:'',textContent:'',style:{},disabled:false,checked:false,
  classList:{add(){},remove(){},contains(){return false},toggle(){}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(k,v){(this._attrs=this._attrs||{})[k]=v;},getAttribute(k){return (this._attrs||{})[k]||null;},
  querySelectorAll(){return[];},querySelector(){return el();},focus(){},click(){}};}
var els={},store={};
store['cbx_ai']=JSON.stringify({key:'sk-test-key-1234',model:'deepseek-chat'});
var ls={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sb={document:{getElementById(id){if(!els[id])els[id]=el();return els[id];},querySelector(){return el();},
  querySelectorAll(sel){ if(sel==='#outBox .tpl-ai') return sb.__aiNodes||[]; return [];},
  createElement(){return el();},addEventListener(){},body:el()},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console:{log(){},warn(){}},setTimeout,clearTimeout,
  location:{origin:'http://test'},URL:{createObjectURL(){return 'blob:x';},revokeObjectURL(){}},
  alert(){},confirm(){return true;}};
sb.window=sb; sb.window.scrollTo=function(){}; sb.window.addEventListener=function(){};
vm.createContext(sb);
['cross-template.js','fields.js','engine.js','deep-engine.js'].forEach(f=>{
  new vm.Script(fs.readFileSync(DIR+f,'utf8')).runInContext(sb);
});
// 桩：docx 组件（供 genWord 调用，只记录调用不真生成）
var WORDCALLS={paras:0,tables:0,download:''};
function FakeP(o){ this.o=o; WORDCALLS.paras++; }
function FakeT(o){ this.o=o; WORDCALLS.tables++; }
sb.docx={AlignmentType:{CENTER:'center'},Paragraph:FakeP,Document:function(o){this.o=o;},
  Packer:{toBlob:async()=>({fake:true})},Table:FakeT,TableRow:function(o){this.o=o;},TableCell:function(o){this.o=o;},
  WidthType:{PERCENTAGE:'pct'},BorderStyle:{SINGLE:'single'},TextRun:function(o){this.o=o;},Footer:function(o){this.o=o;}};
var AI_PROMPT='';
new vm.Script(code+`\nwindow.__t={
  pickInd:pickInd,isTplMode:isTplMode,buildTplPrompt:buildTplPrompt,parseTplAI:parseTplAI,
  genOutline:genOutline,genWord:genWord,tplHTML:tplHTML,tplWordParas:tplWordParas,
  CrossTemplate:CrossTemplate,Fields:Fields,
  getData:function(){return DATA;},setData:function(v){DATA=v;},getBlocks:function(){return TPL_BLOCKS;},
  getAI:function(){return TPL_AI;},getOut:function(){return document.getElementById('outBox').innerHTML;},
  getOutText:function(){return OUTTEXT;},setAINodes:function(a){sb.__aiNodes=a;},
  resetOut:function(){document.getElementById('outBox').innerHTML='';}
};`).runInContext(sb);
// 桩必须在 code 执行后设置，否则会被 index.html 里的函数声明覆盖
sb.aiFetch=async function(msgs){ AI_PROMPT=msgs[0].content; return [
  '【业务链路】','贵司目前通过亚马逊面向美国销售 3C 配件，订单与回款通过平台结算。','出口环节由深圳主体办理。','',
  '【服务背景】','此前未合作过财税服务机构，未被税务自查或稽查过。','',
  '【客户诉求】','1. 梳理出口业务模式','2. 规范平台回款的收入申报','3. 完善出口退税流程'
].join('\n'); };
// 注入 AI 节点桩（模拟预览里的可编辑段落）
sb.__aiNodes=[
  {getAttribute:()=> 'bizStatus', innerText:'贵司业务链路（销售改过的）'},
  {getAttribute:()=> 'bizBackground', innerText:'服务背景（销售改过的）'},
  {getAttribute:()=> 'needs', innerText:'1. 诉求A'}
];
const t=sb.__t;
let pass=true; function ck(n,c){ if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n); }

(async()=>{
// 1) 仅跨境是模板模式
t.pickInd('cross');
ck('cross isTplMode',t.isTplMode()===true);
t.pickInd('domestic');
ck('domestic NOT tplMode',t.isTplMode()===false);
t.pickInd('hightech');
ck('hightech NOT tplMode',t.isTplMode()===false);

// 2) 字段：跨境 8 组 67 项，国内不变 37
ck('cross 67 fields / 8 groups',t.Fields.fieldsFor('cross').length===67&&t.Fields.groupsFor('cross').length===8);
ck('domestic unchanged 37',t.Fields.fieldsFor('domestic').length===37);

// 3) 模板构建：8章+4附录+16表+3段AI
const B=t.CrossTemplate.build({cid:'深圳测试科技',city:'深圳',riskCheck:['平台回款与账面收入口径不一致','账务核算混乱']},
  {bizStatus:'链路',bizBackground:'背景',needs:'诉求'},null);
ck('8 chapters',B.filter(x=>x.t==='h1').length===8);
ck('4 appendix',B.filter(x=>x.t==='h1x').length===4);
ck('16 tables',B.filter(x=>x.t==='table').length===16);
ck('3 AI paragraphs',B.filter(x=>x.t==='aitext').length===3);
ck('cover + toc',B.filter(x=>x.t==='cover').length===1&&B.filter(x=>x.t==='toc').length===1);
ck('guide blocks exist (internal only)',B.filter(x=>x.t==='guide').length>=5);
ck('no unresolved placeholder',!/\{\{[a-zA-Z0-9_]+\}\}/.test(JSON.stringify(B)));
ck('risk table rows from chips',B.find(x=>x.t==='table'&&x.head.indexOf('优先级')>=0).rows.length===2);
ck('annual fee tiers present',JSON.stringify(B).indexOf('9,000')>=0&&JSON.stringify(B).indexOf('30,000')>=0);
ck('no monthly-only fee wording',JSON.stringify(B).indexOf('按月报价、按年收费')<0);

// 4) AI prompt：只写三段、含铁律、不要求四段
t.pickInd('cross');
const pr=t.buildTplPrompt();
ck('tpl prompt has 3 slots',pr.indexOf('【业务链路】')>=0&&pr.indexOf('【服务背景】')>=0&&pr.indexOf('【客户诉求】')>=0);
ck('tpl prompt NO 四段',pr.indexOf('四段')<0);
ck('tpl prompt keeps AI_RULES',pr.indexOf('严禁编造客户痛点')>=0);

// 5) parseTplAI 三段解析
const ai=t.parseTplAI('```markdown\n【业务链路】\nAAA\n【服务背景】\nBBB\n【客户诉求】\n1. C\n```');
ck('parse 3 slots',ai.bizStatus==='AAA'&&ai.bizBackground==='BBB'&&ai.needs==='1. C');
ck('parse fallback no markers',t.parseTplAI('纯文本').bizStatus==='纯文本');

// 6) 端到端：填参数 → genOutline → 预览 → genWord
t.setData({cid:'深圳测试科技',city:'深圳',plats:['亚马逊'],category:'3C 配件',flow:'400',
  bizModel:'自营出口',grossMargin:'35',netMargin:'12',staffN:'12',
  riskCheck:['平台回款与账面收入口径不一致'],need:['账务规范']});
await t.genOutline();
ck('genOutline produced blocks',Array.isArray(t.getBlocks())&&t.getBlocks().length>100);
ck('preview HTML has 8 chapters',(t.getOut().match(/class="tpl-h1"/g)||[]).length===12); // 8章+4附录
ck('preview HTML has tables',(t.getOut().match(/class="tpl-table"/g)||[]).length===16);
ck('preview HTML has AI editable blocks',(t.getOut().match(/class="tpl-ai"/g)||[]).length===3);
ck('preview has guide (internal)',t.getOut().indexOf('内部填写指引')>=0);
ck('AI called with tpl prompt',AI_PROMPT.indexOf('【业务链路】')>=0);
ck('OUTTEXT = AI 3 paragraphs only',t.getOutText().indexOf('一、客户情况')<0);

await t.genWord();
ck('genWord built paragraphs',WORDCALLS.paras>100);
ck('genWord built tables',WORDCALLS.tables===16);
ck('sales edits synced into AI',t.getAI().bizStatus==='贵司业务链路（销售改过的）');

// 7) 其他行业仍走四段（不受模板影响）
t.pickInd('domestic');
t.resetOut();
await t.genOutline();
ck('domestic clears tpl blocks',t.getBlocks()===null&&t.getOut().indexOf('tpl-cover')<0);
ck('domestic OUTTEXT is raw AI text',t.getOutText().indexOf('【业务链路】')>=0);

console.log(pass?'\nALL TEMPLATE-MODE CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
})().catch(e=>{console.error('THREW:',e.stack);process.exit(1)});
