// 测试：旧报价单服务项迁移清理（草稿 state.items + 历史记录 snapshot）
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('public/tools/cross-quote/index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts[scripts.length-1];
function el(){return{value:'',innerHTML:'',textContent:'',style:{},disabled:false,checked:false,
  classList:{add(){},remove(){},contains(){return false},toggle(){}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null},querySelectorAll(){return[]},querySelector(){return el()},focus(){},click(){}};}
var els={},store={};
// 预置：旧草稿含星级账 pkg4888 + 旧imp + 当前合规官项 + 自定义项
const OLD_ITEMS=[
  {libId:'pkg4888',name:'跨境电商星级账 4888 / 年',desc:'旧',unit:'年',qty:1,price:4888},
  {libId:'imp',name:'办理进出口权',desc:'旧',unit:'项',qty:1,price:0},
  {libId:'officer_0_100',name:'合规官服务 · 营收 0-100 万',desc:'新',unit:'年',qty:1,price:9000},
  {libId:'c1234567890',name:'我的自定义服务',desc:'自定义',unit:'项',qty:2,price:500}
];
store['cross_quote_data_v1']=JSON.stringify({step:2,customer:{name:'旧客户'},biz:{flow:'200'},items:OLD_ITEMS,quote:{no:'Q001'}});
// 预置：历史记录快照同样含旧项
const snap={step:4,customer:{name:'历史客户'},items:OLD_ITEMS.slice(0,2).concat([{libId:'fee_trademark',name:'商标注册',price:500,unit:'起',qty:1}]),quote:{no:'Q000'}};
store['cross_quote_records_v1']=JSON.stringify([{id:'r1',time:1,timeStr:'x',customer:'历史客户',snapshot:JSON.stringify(snap)}]);
var ls={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sb={document:{getElementById(id){if(!els[id])els[id]=el();return els[id];},querySelector(){return el();},querySelectorAll(){return[];},createElement(){return el();},addEventListener(){},body:el()},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console:{log(){},warn(){}},setTimeout,clearTimeout,location:{origin:'http://test'},alert(){},confirm(){return true;},URL:{createObjectURL(){return 'blob:x';},revokeObjectURL(){}}};
sb.window=sb;sb.window.scrollTo=function(){};sb.window.addEventListener=function(){};
vm.createContext(sb);
new vm.Script(code+'\nwindow.__t={pruneItems:pruneItems,pruneState:pruneState,migrateOldItems:migrateOldItems,getState:function(){return state;},getItems:getItems,loadRecords:loadRecords};').runInContext(sb);
const t=sb.__t;
let pass=true;function ck(n,c){if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n);}

// 初始化已跑 migrateOldItems
const st=t.getState();
const ids=st.items.map(x=>x.libId);
ck('draft: old pkg4888 removed',ids.indexOf('pkg4888')<0);
ck('draft: old imp removed',ids.indexOf('imp')<0);
ck('draft: new officer kept',ids.indexOf('officer_0_100')>=0);
ck('draft: custom item kept',ids.indexOf('c1234567890')>=0);
ck('draft: exactly 2 items remain',st.items.length===2);

// 历史快照也被清洗
const recs=t.loadRecords();
const snap2=JSON.parse(recs[0].snapshot);
const sids=snap2.items.map(x=>x.libId);
ck('history snapshot: old pkg removed',sids.indexOf('pkg4888')<0);
ck('history snapshot: old imp removed',sids.indexOf('imp')<0);
ck('history snapshot: new fee kept',sids.indexOf('fee_trademark')>=0);
ck('history record itself preserved',recs.length===1&&recs[0].customer==='历史客户');

// 纯函数测试：pruneItems 保留逻辑
const test=[{libId:'pkg4888'},{libId:'c999'},{libId:'officer_300_500'},{libId:'obsolete_xyz'}];
const pruned=t.pruneItems(test);
ck('pruneItems keeps valid+custom',pruned.length===2&&pruned[0].libId==='c999'&&pruned[1].libId==='officer_300_500');

console.log(pass?'\nALL MIGRATION CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
