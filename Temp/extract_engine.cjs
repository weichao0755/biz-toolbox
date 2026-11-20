// 从 cross/index.html 精确抽取方案引擎函数/常量，组装成 plan-doc/engine.js
// 抽取的是已验证的 cross 源码，不重写、不改写含义
const fs = require('fs');
const src = fs.readFileSync('public/tools/cross/index.html', 'utf8');
const L = src.split('\n');

// 按「函数签名行起始 → 大括号配平结束」提取完整函数体
function extractFn(name){
  const re = new RegExp('^(async\\s+)?function\\s+' + name + '\\s*\\(');
  let s = -1;
  for (let i=0;i<L.length;i++){ if(re.test(L[i])){ s=i; break; } }
  if(s<0){ console.error('NOT FOUND fn:',name); return null; }
  let depth=0, started=false;
  for(let i=s;i<L.length;i++){
    for(const c of L[i]){ if(c==='{'){depth++;started=true;} else if(c==='}'){depth--;} }
    if(started && depth<=0){ return L.slice(s,i+1).join('\n'); }
  }
  console.error('UNCLOSED fn:',name); return null;
}
// 按「var NAME= 起始 → 分号/配平」提取常量块（对象用大括号配平）
function extractVar(name){
  const re = new RegExp('^var\\s+' + name + '\\s*=');
  let s=-1; for(let i=0;i<L.length;i++){ if(re.test(L[i])){ s=i; break; } }
  if(s<0){ console.error('NOT FOUND var:',name); return null; }
  // 单行以 ; 结束
  if(/;\s*$/.test(L[s])) return L[s];
  let depth=0,started=false;
  for(let i=s;i<L.length;i++){
    for(const c of L[i]){ if(c==='{'){depth++;started=true;} else if(c==='}'){depth--;} }
    if(started&&depth<=0 && /;\s*$/.test(L[i])) return L.slice(s,i+1).join('\n');
  }
  console.error('UNCLOSED var:',name); return null;
}

const FNS=['pct','platKey','platDef','flowBand','monthsAgo','ieState',
  'tkHistDerive','tkHistInferText','histOf','custNew','noVatRisk','heDingEligible',
  'taxCalc','taxModel','gapInfo','declMap','declName','qualChain','entNameOf',
  'histPlan','histTaxCompare','derive','planCheck','ckClient'];
const VARS=['SAY_P','PLAT','MODEN','DECLD'];

let out='/* 方案引擎 · 从 cross 工具抽取的已验证核心逻辑（规则引擎定结论，AI 只做措辞）\n'+
  ' * 供 plan-doc 新工具复用；两个行业模板共用此框架，各自配专属数据/规则。\n'+
  ' * 抽取时间 2026-11-20，源 cross v1.19.57。 */\n'+
  '(function(scope){\n"use strict";\n';
let missing=[];
VARS.forEach(n=>{ const t=extractVar(n); if(t) out+='\n'+t+'\n'; else missing.push('var '+n); });
FNS.forEach(n=>{ const t=extractFn(n); if(t) out+='\n'+t+'\n'; else missing.push('fn '+n); });
// 暴露到 scope
out+='\nscope.Engine={\n';
out+=FNS.concat(VARS).map(n=>'  '+n+':'+n).join(',\n');
out+='\n};\n})(typeof window!=="undefined"?window:globalThis);\n';

if(missing.length){ console.error('MISSING:',missing.join(', ')); process.exit(1); }
fs.writeFileSync('public/tools/plan-doc/engine.js',out,'utf8');
console.log('engine.js written:',out.length,'chars,',out.split('\n').length,'lines');
