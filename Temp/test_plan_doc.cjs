// VM 测试：业务方案书生成工具（行业模板 / AI 严格边界 / Word 生成）
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('public/tools/plan-doc/index.html', 'utf8');
// 只取无 src 的 inline script
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = scripts[scripts.length - 1];

function fakeEl(){ return {value:'',innerHTML:'',innerText:'',textContent:'',style:{},disabled:false,
  classList:{add(){},remove(){},contains(){return false;}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null;},querySelectorAll(){return [];},querySelector(){return fakeEl();},focus(){},click(){}}; }
var els={},store={};
var ls={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sb={document:{readyState:'complete',getElementById(id){if(!els[id])els[id]=fakeEl();return els[id];},
  querySelector(){return fakeEl();},querySelectorAll(){return [];},createElement(){return fakeEl();},addEventListener(){},body:fakeEl()},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console,setTimeout,clearTimeout,location:{origin:'http://test'},
  alert(){},confirm(){return true;},fetch:async function(){throw new Error('no network in test');}};
sb.window=sb; sb.window.scrollTo=function(){}; sb.window.addEventListener=function(){};

vm.createContext(sb);
try{
  // 先加载引擎脚本（模拟 <script src> 加载顺序）
  new vm.Script(fs.readFileSync('public/tools/plan-doc/engine.js','utf8'),{filename:'engine.js'}).runInContext(sb);
  new vm.Script(fs.readFileSync('public/tools/plan-doc/deep-engine.js','utf8'),{filename:'deep-engine.js'}).runInContext(sb);
  new vm.Script(code,{filename:'plan-doc-inline.js'}).runInContext(sb);
}
catch(e){ console.error('SYNTAX/RUN ERROR:',e.message); process.exit(1); }

// 暴露内部函数（末尾追加，脚本是全局作用域）
try{
  new vm.Script(code+'\nwindow.__t={INDUSTRIES:INDUSTRIES,IND_KEYS:IND_KEYS,buildPrompt:buildPrompt,buildDeepPrompt:buildDeepPrompt,isDeep:isDeep,DEEP_INDS:DEEP_INDS,collectFacts:collectFacts,pickInd:pickInd,setVal:setVal,toggleChip:toggleChip,genWord:genWord,esc:esc,getData:function(){return DATA;},setData:function(v){DATA=v;},setInd:function(v){curInd=v;}};').runInContext(sb);
}catch(e){ console.error('EXPOSE ERROR:',e.message); process.exit(1); }
var t=sb.__t;
if(!t){ console.error('FAIL: 函数未暴露'); process.exit(1); }

var pass=true;
function check(name,cond){ if(!cond){console.log('FAIL:',name);pass=false;} else console.log('ok  :',name); }

// 1. 行业模板完整
check('14 industries defined', t.IND_KEYS.length===14);
check('cross & domestic defined', t.INDUSTRIES.cross && t.INDUSTRIES.domestic);
check('cross has 9 fields', t.INDUSTRIES.cross.fields.length===9);
check('domestic has 9 fields', t.INDUSTRIES.domestic.fields.length===9);
// 全部行业结构完整（fields/base/rules/icon/desc/tag 齐全，字段数 >=8）
var badInd=[];
t.IND_KEYS.forEach(function(k){
  var it=t.INDUSTRIES[k];
  if(!it || !it.name || !it.icon || !it.desc || !it.tag || !it.base || !Array.isArray(it.fields) || it.fields.length<8 || !Array.isArray(it.rules) || it.rules.length<3) badInd.push(k);
});
check('all 14 industries well-formed', badInd.length===0, badInd.join(','));
// 新增行业专属字段与口径存在
check('foreign has 免抵退', t.INDUSTRIES.foreign.base.indexOf('免抵退')>=0);
check('live has 个税', t.INDUSTRIES.live.rules.join('|').indexOf('个税')>=0);
check('hightech has 加计扣除', t.INDUSTRIES.hightech.rules.join('|').indexOf('加计扣除')>=0);
check('software has 即征即退', t.INDUSTRIES.software.rules.join('|').indexOf('即征即退')>=0);
check('construction has 异地预缴', t.INDUSTRIES.construction.rules.join('|').indexOf('预缴')>=0);
check('cross rules include FOB口径', t.INDUSTRIES.cross.rules.join('|').indexOf('国内采购成本加合理利润')>=0);
check('domestic rules include 回款', t.INDUSTRIES.domestic.rules.join('|').indexOf('回款')>=0);

// 2. 事实收集（只收集填了的）
t.setInd('cross');
t.setData({cid:'A001',plats:['亚马逊','Temu'],flow:'300',note:'客户刚收到短信'});
var facts=t.collectFacts();
check('facts include filled values', facts.indexOf('A001')>=0 && facts.indexOf('亚马逊、Temu')>=0 && facts.indexOf('客户刚收到短信')>=0);
check('facts exclude empty fields', facts.indexOf('待确认')<0 && facts.indexOf('undefined')<0);

// 3. AI prompt 严格边界
var p=t.buildPrompt();
check('prompt has 铁律', p.indexOf('铁律')>=0 && p.indexOf('严禁编造')>=0);
check('prompt bans price numbers', p.indexOf('严禁出现任何对外报价数字')>=0);
check('prompt bans 100% promises', p.indexOf('一定免税')>=0 && p.indexOf('包通过')>=0);
check('prompt has 4 sections', p.indexOf('一、客户情况')>=0 && p.indexOf('二、现状与关注点')>=0 && p.indexOf('三、落地方案')>=0 && p.indexOf('四、服务说明')>=0);
check('prompt includes facts', p.indexOf('A001')>=0 && p.indexOf('亚马逊、Temu')>=0);
check('prompt includes industry rules', p.indexOf(t.INDUSTRIES.cross.base)>=0);
check('prompt no fabricated price', !/\d{4}\s*元/.test(p) && p.indexOf('4888')<0 && p.indexOf('6888')<0);

// 换国内电商行业，prompt 应切模板
t.setInd('domestic'); t.setData({cid:'B002',plats:['淘宝/天猫'],entity:'小规模纳税人'});
var p2=t.buildPrompt();
check('domestic prompt uses domestic base', p2.indexOf('国内电商合规账')>=0);
check('domestic prompt has filled entity', p2.indexOf('小规模纳税人')>=0);

// 4. 转义（XSS 防护）
check('esc escapes quotes', t.esc('a"b<c>').indexOf('&quot;')>=0 && t.esc('a"b<c>').indexOf('&lt;')>=0);

// 5. 深度模式：两行业规则引擎接入
check('DEEP_INDS has cross & domestic', t.DEEP_INDS.length===2 && t.DEEP_INDS.indexOf('cross')>=0 && t.DEEP_INDS.indexOf('domestic')>=0);
check('isDeep(cross) true', t.isDeep('cross')===true);
check('isDeep(domestic) true', t.isDeep('domestic')===true);
check('isDeep(foreign) false (still shallow)', t.isDeep('foreign')===false);
// 深度 prompt：结论已锁定、AI 只润色
var deepData={
  industry:'跨境电商',isNew:true,checks:[{dir:'基础合规',v:'warn'}],clientChecks:[],derived:{},htc:{ok:false},
  roadmap:[{t:'办理资质',time:'x',acts:['a'],cli:[],done:'d'}],facts:{},
  points:['客户：测试公司','合规诊断共 1 项：基础合规(待确认)','落地方案 1 步：1.办理资质']
};
var dp=t.buildDeepPrompt(deepData,t.INDUSTRIES.cross);
check('deep prompt locks conclusions', dp.indexOf('不得更改结论')>=0 && dp.indexOf('结论已锁定')>=0);
check('deep prompt has points', dp.indexOf('客户：测试公司')>=0 && dp.indexOf('落地方案 1 步')>=0);
check('deep prompt has 铁律', dp.indexOf('严禁编造')>=0 && dp.indexOf('对外报价数字')>=0);
check('deep prompt bans promises', dp.indexOf('包通过')>=0);
check('deep prompt 4 sections', dp.indexOf('一、客户情况')>=0 && dp.indexOf('四、服务说明')>=0);

// 6. Word 生成函数存在（不实测 blob，避免 docx 桩复杂度）
check('genWord is function', typeof t.genWord==='function');

// 6. 工具注册（源码层）
var toolsJs=fs.readFileSync('src/data/tools.js','utf8');
check('registered in tools.js', toolsJs.indexOf("path: '/tools/plan-doc'")>=0 && toolsJs.indexOf("url: 'tools/plan-doc/index.html'")>=0);
check('registered as compliance category', /path: '\/tools\/plan-doc'[\s\S]{0,500}category: 'compliance'/.test(toolsJs));
check('compliance category defined', /key: 'compliance', label: '合规类'/.test(toolsJs));

console.log(pass?'\nALL PLAN-DOC CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
