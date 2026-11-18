// VM 测试：①平台手动输入+其他 ②纳税人身份加个人 ③客户情况表含补充信息
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('public/tools/cross/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let code = '';
for (const s of scripts) if (s.includes('var TK=')) code = s;
code += '\nwindow.__t={tkReset:tkReset,tkToA:tkToA,tkBodyHTML:tkBodyHTML,tkPName:tkPName,platDef:platDef,platKey:platKey,' +
  'tkToggleOther:tkToggleOther,tkOtherIn:tkOtherIn,tkAddCustom:tkAddCustom,tkDelCustom:tkDelCustom,tkCustomPlats:tkCustomPlats,' +
  'entNameOf:entNameOf,entShortOf:entShortOf,noVatRisk:noVatRisk,histTaxCompare:histTaxCompare,histPlan:histPlan,' +
  'custBuild:custBuild,derive:derive,getTK:function(){return TK;},setTK:function(v){TK=v;},getA:function(){return A;}};';

function fakeEl(){ return { value:'',innerHTML:'',textContent:'',style:{},disabled:false,
  classList:{add(){},remove(){},contains(){return false;}},appendChild(){},removeChild(){},addEventListener(){},
  setAttribute(){},getAttribute(){return null;},querySelectorAll(){return [];},querySelector(){return fakeEl();},focus(){},click(){} }; }
var els={},store={};
var lsStub={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sandbox={ document:{readyState:'complete',getElementById(id){if(!els[id])els[id]=fakeEl();return els[id];},
  querySelector(){return fakeEl();},querySelectorAll(){return [];},createElement(){return fakeEl();},addEventListener(){},body:fakeEl()},
  window:{},localStorage:lsStub,sessionStorage:lsStub,navigator:{},console,setTimeout,clearTimeout,scrollTo(){},alert(){},confirm(){return true;} };
sandbox.window=sandbox; sandbox.window.scrollTo=function(){}; sandbox.window.addEventListener=function(){};
vm.createContext(sandbox);
try{ new vm.Script(code,{filename:'cross-inline.js'}).runInContext(sandbox); }
catch(e){ console.error('SYNTAX/RUN ERROR:',e.message); process.exit(1); }
var t=sandbox.__t;
if(!t){ console.error('FAIL: 函数未暴露'); process.exit(1); }

function fixTK(o){
  if(!o.fuls)o.fuls={}; if(!o.decls)o.decls={};
  (o.plats||[]).forEach(function(p){ if(o.fuls[p]==null)o.fuls[p]='direct'; if(o.decls[p]==null)o.decls[p]='na'; });
  if(!o.asks)o.asks=[]; if(!o.log)o.log=[]; if(!o.quarters)o.quarters=[]; if(!o.confAck)o.confAck=[];
  return o;
}
function setup(over){
  var base={cid:'A001',fresh:false,startMonth:'2026-03',file:'real',sms:'n',subs:1,
    plats:['amazon'],fuls:{amazon:'fba'},decls:{amazon:'own'},flow:200,staffN:0,
    impExp:false,taxFiling:false,city:'sz',cityText:'深圳',entity:'small',hist:'new',
    genHist:'auto',genFine:'auto',genHed:'auto',note:''};
  Object.keys(over||{}).forEach(function(k){ base[k]=over[k]; });
  t.setTK(fixTK(base)); t.tkToA();
}
var pass=true;
function check(name,cond){ if(!cond){console.log('FAIL:',name);pass=false;} else console.log('ok  :',name); }

// ===== 需求1：平台手动输入 + 其他 =====
setup({});
var baseHtml=t.tkBodyHTML('base');
check('base has 其他 button', baseHtml.indexOf('tkToggleOther()')>=0);
check('base no custom input when closed', baseHtml.indexOf('id="tkOtherPlat"')<0);

t.tkToggleOther();
baseHtml=t.tkBodyHTML('base');
check('toggle other -> input appears', baseHtml.indexOf('id="tkOtherPlat"')>=0);
t.tkOtherIn('Lazada');
t.tkAddCustom();
check('custom platform added', t.getTK().plats.indexOf('custom:Lazada')>=0);
check('custom name display', t.tkPName('custom:Lazada')==='Lazada');
check('customPlats list', t.tkCustomPlats().length===1);
check('other closed after add', t.getTK().otherOpen===false);

// 自定义平台履约卡片不崩、用通用模板
var fulHtml=t.tkBodyHTML('ful');
check('ful card no crash for custom', fulHtml.indexOf('Lazada')>=0);
check('ful card uses generic options', fulHtml.indexOf('直邮')>=0 && fulHtml.indexOf('海外仓')>=0);
check('platDef maps custom to other', t.platDef('custom:Lazada')===t.platDef('other'));

// derive 对自定义平台不崩
t.tkToA();
t.getA().platform='custom:Lazada';
var d=t.derive();
check('derive custom returns valid', !!d && d.platN==='其他（手动填写）');

// 删除自定义平台
t.tkDelCustom('custom:Lazada');
check('custom platform removed', t.getTK().plats.indexOf('custom:Lazada')<0);

// ===== 需求2：纳税人身份加个人 =====
check('entNameOf person', t.entNameOf('person')==='个人 / 个体户');
check('entShortOf person', t.entShortOf('person')==='个人');
setup({entity:'person',flow:80});
check('person -> noVatRisk true (<120万)', t.noVatRisk()===true);
check('person -> histTaxCompare ok', t.histTaxCompare().ok===true);
check('person -> vatExempt true', t.histTaxCompare().vatExempt===true);
var hp=t.histPlan({});
var citAll=hp.cit.join('|');
check('person plan has 个人所得税 note', citAll.indexOf('个人所得税')>=0);
check('person plan notes no CIT', citAll.indexOf('不缴企业所得税')>=0);
var entHtml=t.tkBodyHTML('entity');
check('entity card has 个人 button', entHtml.indexOf("tkChoice('entity','person')")>=0);
setup({entity:'person'});
check('person ansText shows', t.getTK().entity==='person');

// ===== 需求3：客户情况表含补充信息 =====
setup({note:'老板本人不在国内，真正拍板的是运营主管；担心补税占现金流。'});
var b=t.custBuild();
var sec5=b.filter(function(x){return x.ty==='sec'&&x.t.indexOf('补充信息')>=0;});
check('custBuild has section 五、补充信息', sec5.length===1);
var noteRow=b.filter(function(x){return x.ty==='kv'&&x.k==='补充信息';})[0];
check('custBuild includes note text', !!noteRow && noteRow.v.indexOf('运营主管')>=0);
setup({note:''});
var b2=t.custBuild();
var noteRow2=b2.filter(function(x){return x.ty==='kv'&&x.k==='补充信息';})[0];
check('empty note -> 未填', !!noteRow2 && noteRow2.v==='未填');

console.log(pass?'\nALL PLATFORM/PERSON/NOTE CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
