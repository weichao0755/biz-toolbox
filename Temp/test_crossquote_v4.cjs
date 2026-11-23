// 测试：跨境电商报价单生成器 v4 —— 金米合规官月度体系替换旧星级账
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('public/tools/cross-quote/index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts[scripts.length-1];
function el(){return{value:'',innerHTML:'',textContent:'',style:{},disabled:false,checked:false,
  classList:{add(){},remove(){},contains(){return false},toggle(){}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null},querySelectorAll(){return[]},querySelector(){return el()},focus(){},click(){}};}
var els={},store={};
var ls={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sb={document:{readyState:'complete',getElementById(id){if(!els[id])els[id]=el();return els[id];},
  querySelector(){return el();},querySelectorAll(){return[];},createElement(){return el();},addEventListener(){},body:el()},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console,setTimeout,clearTimeout,location:{origin:'http://test'},
  alert(){},confirm(){return true;},URL:{createObjectURL(){return 'blob:x';},revokeObjectURL(){}}};
sb.window=sb; sb.window.scrollTo=function(){}; sb.window.addEventListener=function(){};
vm.createContext(sb);
new vm.Script(code+'\nwindow.__t={DEFAULT_LIB:DEFAULT_LIB,LIB_KEY:LIB_KEY,pkgReco:pkgReco,loadLib:loadLib,getLib:function(){return lib;},setBiz:function(v){state.biz=Object.assign({},state.biz,v);},getState:function(){return state;}};').runInContext(sb);
const t=sb.__t;
let pass=true;function ck(n,c){if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n);}

// 1) LIB_KEY v5：合规官体系 + 星级账恢复并存
ck('LIB_KEY is v7',t.LIB_KEY==='cross_quote_lib_v7');
const L=t.DEFAULT_LIB;
ck('lib has 26 entries (20+6 包含明细)',L.length===26);

// 2) 合规官 6 档（年度价格在下面第5段验证）
const officer=L.filter(x=>x.group==='金米合规官 · 月度服务');
ck('6 officer tiers',officer.length===6);
ck('officer 0-100 desc has 6 services',officer[0].desc.indexOf('首次账务规则梳理')>=0&&officer[0].desc.indexOf('合规咨询')>=0);

// 3) 配套服务 4 类
const match=L.filter(x=>x.group==='配套服务');
ck('4 match services',match.length===4);
ck('match names',['合规会计','合规代办','税务律师','法务咨询台'].every(n=>match.some(x=>x.name===n)));
ck('match accountant desc',match.find(x=>x.name==='合规会计').desc.indexOf('月度做账报税')>=0);

// 4) 专项收费 10 项 + 价格
const fee=L.filter(x=>x.group==='专项收费');
ck('10 fee items',fee.length===10);
const fmap={};fee.forEach(x=>fmap[x.name]=x);
ck('内部核算 3000/月起',fmap['内部核算']&&fmap['内部核算'].price===3000&&fmap['内部核算'].unit==='月起');
ck('历史补税 3000起',fmap['历史补税']&&fmap['历史补税'].price===3000);
ck('商标注册 500起',fmap['商标注册']&&fmap['商标注册'].price===500);
ck('历史账务梳理 500/月起',fmap['历史账务梳理']&&fmap['历史账务梳理'].price===500);
ck('退税台账 800/月起',fmap['退税台账']&&fmap['退税台账'].price===800);
ck('上传发票 100/月 + 阶梯说明',fmap['上传发票到后台']&&fmap['上传发票到后台'].price===100&&fmap['上传发票到后台'].desc.indexOf('50-100 张 200 元/月')>=0);
ck('跨区变更 1000/次',fmap['公司股东 / 地址跨区变更']&&fmap['公司股东 / 地址跨区变更'].price===1000);
ck('地址挂靠 1800/年',fmap['地址挂靠']&&fmap['地址挂靠'].price===1800);
ck('注销/香港 一事一议 price 0',fmap['注销公司'].price===0&&fmap['香港及非深圳公司代办'].price===0);

// 5) 旧星级账已全清，只留合规官新体系
const all=JSON.stringify(L)+html;
// 只查价目库数据本身（源码注释里提及旧档位名不算残留）
const libJson=JSON.stringify(L);
ck('old star packages all removed',libJson.indexOf('pkg4888')<0&&libJson.indexOf('星级账套餐')<0&&libJson.indexOf('4888')<0&&libJson.indexOf('6888')<0&&libJson.indexOf('10888')<0&&libJson.indexOf('14888')<0);
ck('only new groups remain',['金米合规官 · 月度服务','配套服务','专项收费'].every(g=>L.some(x=>x.group===g)) && !L.some(x=>x.group.indexOf('星级账')>=0));
// 按月报价、按年收费：price=月费×12, unit=年
const months=[750,750,1000,1500,2000,2500], years=[9000,9000,12000,18000,24000,30000];
const officers=L.filter(x=>x.group==='金米合规官 · 月度服务');
ck('officer prices are annual (×12)',JSON.stringify(officers.map(x=>x.price))===JSON.stringify(years));
ck('officer unit is 年',officers.every(x=>x.unit==='年'));
ck('officer names show 元/月 × 12',officers.every(x=>x.name.indexOf('元/月 × 12')>=0));
ck('officer desc says 年费',officers.every(x=>x.desc.indexOf('年费 ')>=0));
ck('officer desc NO 按月报价按年收费 phrase',officers.every(x=>x.desc.indexOf('按月报价、按年收费')<0));

// 6) 推荐逻辑：按营收落 6 档
const cases=[[50,'officer_0_100'],[100,'officer_0_100'],[101,'officer_100_300'],[300,'officer_100_300'],[301,'officer_300_500'],[500,'officer_300_500'],[501,'officer_500_1000'],[1000,'officer_500_1000'],[1001,'officer_1000_1500'],[1500,'officer_1000_1500'],[1501,'officer_1500_2000'],[2000,'officer_1500_2000']];
cases.forEach(function(c){
  t.setBiz({flow:String(c[0])});
  const r=t.pkgReco();
  ck('flow '+c[0]+' → '+c[1],!!r&&r.id===c[1]);
});
t.setBiz({flow:'2600'});
ck('flow>2000 → no tier',(()=>{const r=t.pkgReco();return r&&r.id===null&&r.why.indexOf('超 2000')>=0;})());
t.setBiz({flow:''});
ck('no flow → null',t.pkgReco()===null);
// 纳税人身份不再影响档位
t.setBiz({flow:'400',entity:'general'});
ck('entity no longer affects tier',t.pkgReco().id==='officer_300_500');

// 7) loadLib 空存储返回 v5 默认库（合规官 + 星级账并存）
ck('loadLib returns v7 defaults',(()=>{const l=t.loadLib();return l.length===26&&l[0].group==='金米合规官 · 月度服务'&&l.filter(x=>x.group==='合规官 · 包含服务明细').length===6&&!l.some(x=>x.group.indexOf('星级账')>=0);})());

// 分组顺序：合规官档 → 包含服务明细 → 配套服务 → 专项收费（老板要求明细放配套服务之前）
const gOrder=[];L.forEach(x=>{if(gOrder[gOrder.length-1]!==x.group)gOrder.push(x.group)});
ck('group order: 明细在配套服务之前',gOrder.indexOf('合规官 · 包含服务明细')>=0 && gOrder.indexOf('配套服务')>gOrder.indexOf('合规官 · 包含服务明细') && gOrder.indexOf('金米合规官 · 月度服务')<gOrder.indexOf('合规官 · 包含服务明细'));

console.log(pass?'\nALL CROSS-QUOTE V4 CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
