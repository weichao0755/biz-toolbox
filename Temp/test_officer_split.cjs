// 测试：合规官6项服务从描述拆成独立项目 + 选档自动带上/取消移除
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('public/tools/cross-quote/index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts[scripts.length-1];
function el(){return{value:'',innerHTML:'',textContent:'',style:{},disabled:false,checked:false,
  classList:{add(){},remove(){},contains(){return false},toggle(){}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null},querySelectorAll(){return[]},querySelector(){return el()},focus(){},click(){}};}
var els={},store={};
var ls={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sb={document:{getElementById(id){if(!els[id])els[id]=el();return els[id];},querySelector(){return el();},querySelectorAll(){return[];},createElement(){return el();},addEventListener(){},body:el()},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console:{log(){},warn(){}},setTimeout,clearTimeout,location:{origin:'http://test'},alert(){},confirm(){return true;},URL:{createObjectURL(){return 'blob:x';},revokeObjectURL(){}}};
sb.window=sb;sb.window.scrollTo=function(){};sb.window.addEventListener=function(){};
vm.createContext(sb);
new vm.Script(code+'\nwindow.__t={DEFAULT_LIB:DEFAULT_LIB,LIB_KEY:LIB_KEY,OFFICER_DETAIL_IDS:OFFICER_DETAIL_IDS,isOfficerPkg:isOfficerPkg,syncOfficerDetails:syncOfficerDetails,toggleSvc:toggleSvc,getState:function(){return state;},getItems:getItems,setState:function(v){state=v;}};').runInContext(sb);
const t=sb.__t;
let pass=true;function ck(n,c){if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n);}

const L=t.DEFAULT_LIB;
const details=L.filter(x=>x.group==='合规官 · 包含服务明细');
ck('LIB_KEY v7',t.LIB_KEY==='cross_quote_lib_v7');
ck('6 detail items in lib',details.length===6);
ck('detail ids s1-s6',JSON.stringify(details.map(x=>x.id))==='["officer_s1","officer_s2","officer_s3","officer_s4","officer_s5","officer_s6"]');
ck('all detail price=0',details.every(x=>x.price===0));
ck('s1 content',details.find(x=>x.id==='officer_s1').desc.indexOf('出口模式选择与流程')>=0);
ck('s3 content',details.find(x=>x.id==='officer_s3').desc.indexOf('资金回流')>=0&&details.find(x=>x.id==='officer_s3').desc.indexOf('账上差异')>=0);
ck('s4 content',details.find(x=>x.id==='officer_s4').desc.indexOf('多店铺退税方案')>=0);
ck('s5 content',details.find(x=>x.id==='officer_s5').desc.indexOf('下户核查预演')>=0);
ck('s6 content',details.find(x=>x.id==='officer_s6').desc.indexOf('知识产权')>=0);
ck('isOfficerPkg detects tiers',t.isOfficerPkg('officer_0_100')&&t.isOfficerPkg('officer_1500_2000')&&!t.isOfficerPkg('officer_s1')&&!t.isOfficerPkg('fee_trademark'));

// 选合规官档 → 自动带 6 项
t.setState({step:1,customer:{},biz:{},items:[],quote:{no:'X'}});
t.toggleSvc('officer_300_500',true);
let ids=t.getState().items.map(x=>x.libId);
ck('select pkg → 6 details auto added',t.OFFICER_DETAIL_IDS.every(id=>ids.indexOf(id)>=0));
ck('select pkg → pkg itself present',ids.indexOf('officer_300_500')>=0);
ck('total 7 items after select',t.getState().items.length===7);
// 明细项不计价
let items=t.getItems();
ck('details are 包含服务 (price 0)',t.OFFICER_DETAIL_IDS.every(id=>{const it=items.find(x=>x.libId===id);return it&&it.price===0&&it.line===0;}));
ck('pkg annual price 12000',(()=>{const it=items.find(x=>x.libId==='officer_300_500');return it&&it.price===12000&&it.unit==='年';})());

// 取消档 → 6 项自动移除
t.toggleSvc('officer_300_500',false);
ids=t.getState().items.map(x=>x.libId);
ck('deselect pkg → 6 details removed',t.OFFICER_DETAIL_IDS.every(id=>ids.indexOf(id)<0));
ck('deselect pkg → only 6? no, 0 remain',t.getState().items.length===0);

// 手动勾明细（无档位）→ sync 清掉
t.toggleSvc('officer_s1',true);
ids=t.getState().items.map(x=>x.libId);
ck('detail alone without pkg removed by sync',ids.indexOf('officer_s1')<0);

// 换档：取消旧档选新档 → 明细仍在
t.toggleSvc('officer_0_100',true);
t.toggleSvc('officer_0_100',false);
t.toggleSvc('officer_500_1000',true);
ids=t.getState().items.map(x=>x.libId);
ck('switch pkg → details still there',t.OFFICER_DETAIL_IDS.every(id=>ids.indexOf(id)>=0)&&ids.indexOf('officer_500_1000')>=0);

console.log(pass?'\nALL OFFICER-SPLIT CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
