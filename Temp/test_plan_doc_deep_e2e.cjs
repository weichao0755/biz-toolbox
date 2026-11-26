// E2E：深度方案书全链路（填参数→规则引擎定结论→AI 润色→锁定结论）
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync('public/tools/plan-doc/index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts[scripts.length-1];
function el(){return{value:'',innerHTML:'',innerText:'',textContent:'',style:{},disabled:false,
  classList:{add(){},remove(){},contains(){return false}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null},querySelectorAll(){return[]},querySelector(){return el()},focus(){},click(){}};}
var els={},st={},lastPrompt='';
var MOCK='一、客户情况\n测试公司，亚马逊平台。\n二、现状与关注点\n基础合规待确认。\n三、落地方案\n办理资质。\n四、服务说明\n我方提供协助。';
var ls={getItem(k){return st[k]||null;},setItem(k,v){st[k]=String(v);},removeItem(k){delete st[k];},key(i){return Object.keys(st)[i]||null;},get length(){return Object.keys(st).length;}};
var sb={document:{getElementById(id){if(!els[id])els[id]=el();return els[id];},querySelector(){return el();},querySelectorAll(){return[];},createElement(){return el();},addEventListener(){},body:el()},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console,setTimeout,clearTimeout,location:{origin:'http://test'},alert(){},confirm(){return true;},
  fetch:async function(url,opt){
    var body=JSON.parse(opt.body);
    lastPrompt=body.messages[0].content;
    return {ok:true,json:async function(){return {choices:[{message:{content:MOCK}}]};}};
  }};
sb.window=sb; sb.window.scrollTo=function(){}; sb.window.addEventListener=function(){};
vm.createContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/fields.js','utf8')).runInContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/cross-template.js','utf8')).runInContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/engine.js','utf8')).runInContext(sb);
new vm.Script(fs.readFileSync('public/tools/plan-doc/deep-engine.js','utf8')).runInContext(sb);
new vm.Script(code+'\nwindow.__t={pickInd:pickInd,genOutline:genOutline,setData:function(v){DATA=v;},getOut:function(){return OUTTEXT;},getStatus:function(){return document.getElementById("genStatus").textContent;},getLastDeep:function(){return LAST_DEEP;},getBlocks:function(){return TPL_BLOCKS;}};').runInContext(sb);
const t=sb.__t;
st['cbx_ai']=JSON.stringify({key:'sk-test123',model:'deepseek-chat'});
let pass=true; function ck(n,c){console.log((c?'ok  : ':'FAIL: ')+n);if(!c)pass=false;}
(async function(){
  // 跨境电商：新主体
  t.pickInd('cross');
  t.setData({cid:'深圳测试科技',plats:['亚马逊'],city:'深圳',entity:'小规模纳税人',flow:'200',decl:'平台或物流代报',hist:'刚起步无历史',invoice:'主要是普票',impExp:true,taxFiling:true,need:['出口免税']});
  await t.genOutline();
  var out=t.getOut(), ld=t.getLastDeep();
  /* 跨境电商 v1.22.0 起改为「模板驱动」：规则引擎仍跑，但 AI 只写 3 段客观陈述 */
  ck('cross: outline produced', !!out && out.length>0);
  ck('cross: tpl blocks built (8 chapters)', !!t.getBlocks() && t.getBlocks().filter(function(b){return b.t==='h1';}).length===8);
  ck('cross: LAST_DEEP set', !!ld && ld.industry==='跨境电商');
  ck('cross: isNew true', ld.isNew===true);
  ck('cross: tpl prompt has 3 slots', lastPrompt.indexOf('【业务链路】')>=0 && lastPrompt.indexOf('【服务背景】')>=0 && lastPrompt.indexOf('【客户诉求】')>=0);
  ck('cross: tpl prompt keeps iron rules', lastPrompt.indexOf('严禁编造公司名')>=0);
  ck('cross: prompt has real facts', lastPrompt.indexOf('深圳测试科技')>=0);
  ck('cross: tpl prompt no 核定 / no 四段', lastPrompt.indexOf('核定')<0 && lastPrompt.indexOf('四段')<0);
  ck('cross: status mentions 模板', t.getStatus().indexOf('模板')>=0);

  // 国内电商：零申报
  t.pickInd('domestic');
  t.setData({cid:'杭州测试商贸',plats:['淘宝/天猫'],city:'杭州',entity:'小规模纳税人',flow:'400',decl:'零申报',hist:'按回款申报',invoice:'大多无票',need:[]});
  await t.genOutline();
  var ld2=t.getLastDeep();
  ck('domestic: LAST_DEEP set', !!ld2 && ld2.industry==='国内电商');
  ck('domestic: 收入申报 bad in points', lastPrompt.indexOf('收入申报(不合规)')>=0);
  ck('domestic: prompt locks', lastPrompt.indexOf('结论已锁定')>=0);
  ck('domestic: no 罚款/核定', lastPrompt.indexOf('罚款')<0 && lastPrompt.indexOf('核定')<0);

  // 浅行业仍走 AI 自由模式
  t.pickInd('foreign');
  t.setData({cid:'XX外贸',plats:['自营出口'],flow:'500'});
  await t.genOutline();
  ck('shallow: LAST_DEEP cleared', t.getLastDeep()===null);
  ck('shallow: prompt not locked', lastPrompt.indexOf('结论已锁定')<0 && lastPrompt.indexOf('请严格依据')>=0);

  console.log(pass?'\nE2E DEEP FLOW PASSED':'\nSOME CHECKS FAILED');
  process.exit(pass?0:1);
})().catch(e=>{console.error('E2E ERR:',e.stack||e.message);process.exit(1);});
