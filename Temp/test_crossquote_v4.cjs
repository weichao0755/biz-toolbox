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
ck('LIB_KEY is v5',t.LIB_KEY==='cross_quote_lib_v5');
const L=t.DEFAULT_LIB;
ck('lib has 32 entries (20+12)',L.length===32);

// 2) 合规官 6 档价格准确
const officer=L.filter(x=>x.group==='金米合规官 · 月度服务');
ck('6 officer tiers',officer.length===6);
const prices=officer.map(x=>x.price);
ck('officer prices 750/750/1000/1500/2000/2500',JSON.stringify(prices)==='[750,750,1000,1500,2000,2500]');
ck('officer unit 月',officer.every(x=>x.unit==='月'));
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

// 5) 星级账套餐恢复保留（老客户仍在用，两套并存）
const star=L.filter(x=>x.group==='星级账套餐 · 老客户沿用');
ck('12 star entries restored',star.length===12);
const starPkg=star.filter(x=>/4888|6888|10888|14888/.test(x.name));
ck('4 star packages restored',starPkg.length===4);
ck('star prices 4888/6888/10888/14888',JSON.stringify(starPkg.map(x=>x.price))==='[4888,6888,10888,14888]');
const included=star.filter(x=>x.price===0);
ck('8 包含服务 items (price=0)',included.length===8);
ck('包含服务 names from screenshot',['办理进出口权','跨境电商企业备案','申领电子口岸 IC 卡（UKey）','出口免税备案 / 13 栏填报申请','出口免税申报（按期）','平台明细账（按站点）','供应商发票规划','人力成本与年终奖个税规划'].every(n=>included.some(x=>x.name===n)));
ck('isIncluded treats price0 as 包含服务',included.every(x=>!(Number(x.price)>0)));

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
ck('loadLib returns v5 defaults',(()=>{const l=t.loadLib();return l.length===32&&l[0].group==='金米合规官 · 月度服务'&&l.some(x=>x.group==='星级账套餐 · 老客户沿用');})());

console.log(pass?'\nALL CROSS-QUOTE V4 CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
