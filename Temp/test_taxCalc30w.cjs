const fs = require('fs');
const f = 'public/tools/cross/index.html';
const s = fs.readFileSync(f, 'utf8');
const a = s.indexOf('function pct(');
const b = s.indexOf('\nfunction renderTax(');
const code = s.slice(a, b);
eval(code); // defines pct + taxCalc

function chk(name, got, exp){
  const ok = Math.abs(got - exp) < 1e-6;
  console.log((ok?'PASS':'FAIL')+' '+name+' => got '+got+' exp '+exp);
  if(!ok) process.exitCode = 1;
}

// 1) 小规模 + 季超30万(默认) + 无报关单 => 增值税 = sales*1%
let r = taxCalc({sales:800, ent:'small', decl:'no', q:'yes'});
chk('小规模季超30万 增值税(应为8)', r.vat, 8);
chk('小规模季超30万 smallFree(应为false)', r.smallFree?1:0, 0);

// 2) 小规模 + 季未超30万 + 无报关单 => 增值税免 = 0
r = taxCalc({sales:80, ent:'small', decl:'no', q:'no'});
chk('小规模季≤30万 增值税(应为0)', r.vat, 0);
chk('小规模季≤30万 smallFree(应为true)', r.smallFree?1:0, 1);

// 3) 小规模 + 季未超30万 + 有报关单 => 增值税仍0(出口免税优先)
r = taxCalc({sales:80, ent:'small', decl:'yes', q:'no'});
chk('小规模有报关单 增值税(应为0)', r.vat, 0);
chk('小规模有报关单 smallFree(应为false,因exempt)', r.smallFree?1:0, 0);

// 4) 一般纳税人 不论30万 => 13%
r = taxCalc({sales:80, ent:'general', decl:'no', q:'no'});
chk('一般人季≤30万 增值税(应为10.4)', r.vat, 10.4);
chk('一般人 smallFree(应为false)', r.smallFree?1:0, 0);

// 5) 小规模纳税人季≤30万时 企税计税基础=利润(不减增值税)
r = taxCalc({sales:80, ent:'small', decl:'no', q:'no', head:2, plat:50, purch:20});
// sales80 plat40 purch16 labor12 => profit=80-40-16-12=12 ; citBase=12-0=12 ; cit=12*0.05=0.6
chk('小规模季≤30万 利润(应为12)', r.profit, 12);
chk('小规模季≤30万 citBase(应为12)', r.citBase, 12);
chk('小规模季≤30万 cit(应为0.6)', r.cit, 0.6);

// 6) 节税3(控额拆分)不应在季≤30万小规模出现
r = taxCalc({sales:800, ent:'small', decl:'no', q:'no'});
// 注意 sales>500 但 smallFree=true => 不应有 id=five 的方案
const hasFive = r.plans.some(p=>p.id==='five');
console.log((hasFive?'FAIL':'PASS')+' 小规模季≤30万 不应出现控额拆分方案 => '+hasFive);
if(hasFive) process.exitCode = 1;

// 7) 节税3(控额拆分)在季超30万小规模且>500万应出现
r = taxCalc({sales:800, ent:'small', decl:'no', q:'yes'});
const hasFive2 = r.plans.some(p=>p.id==='five');
console.log((hasFive2?'PASS':'FAIL')+' 小规模季超30万且>500万 应出现控额拆分方案 => '+hasFive2);
if(!hasFive2) process.exitCode = 1;

console.log('DONE exitCode='+(process.exitCode||0));
