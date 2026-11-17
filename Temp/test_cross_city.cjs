// VM 冒烟测试：cross 沟通台城市改手动输入（cityText + sz/out 推断 + 显示回退）
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('public/tools/cross/index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let code = '';
for (const s of scripts) if (s.includes('var TK=')) code = s;

// 暴露内部函数用于断言：脚本是全局作用域（非 IIFE），直接在末尾追加即可
const testCode = code + '\nwindow.__t={tkReset:tkReset,tkCityIn:tkCityIn,tkCityText:tkCityText,tkCityShow:tkCityShow,tkToA:tkToA,tkBodyHTML:tkBodyHTML,tkAnsText:tkAnsText,getTK:function(){return TK;},getA:function(){return A;}};';

function fakeEl() {
  return {
    value: '', innerHTML: '', textContent: '', style: {}, disabled: false,
    classList: { add(){}, remove(){}, toggle(){}, contains(){return false;} },
    appendChild(){}, removeChild(){}, addEventListener(){}, removeEventListener(){},
    setAttribute(){}, getAttribute(){return null;}, querySelectorAll(){return [];},
    querySelector(){return fakeEl();}, focus(){}, click(){}, onclick: null
  };
}
const els = {};
const documentStub = {
  readyState: 'complete',
  getElementById(id){ if(!els[id]) els[id]=fakeEl(); return els[id]; },
  querySelector(){ return fakeEl(); },
  querySelectorAll(){ return []; },
  createElement(){ return fakeEl(); },
  addEventListener(){}, body: fakeEl()
};
const localStorageStub = { getItem(){return null;}, setItem(){}, removeItem(){}, key(){return null;}, get length(){return 0;} };
const sandbox = {
  document: documentStub, window: {}, localStorage: localStorageStub,
  sessionStorage: localStorageStub, navigator: {}, console,
  setTimeout, clearTimeout, scrollTo(){}, alert(){}, confirm(){return true;}
};
sandbox.window = sandbox;
sandbox.window.scrollTo = function(){};
sandbox.window.addEventListener = function(){};

vm.createContext(sandbox);
try {
  new vm.Script(testCode, { filename: 'cross-inline.js' }).runInContext(sandbox);
} catch (e) {
  console.error('SYNTAX/RUN ERROR:', e.message);
  process.exit(1);
}

const t = sandbox.__t;
if (!t) { console.error('FAIL: 函数未暴露'); process.exit(1); }

let pass = true;
function check(name, cond){ if(!cond){ console.log('FAIL:', name); pass=false; } else { console.log('ok  :', name); } }
function input(v){ const el={value:v}; t.tkCityIn(el); }

t.tkReset();

// 1. UI：base 卡片含手动输入框，不再有旧的 sz/out 按钮
const baseHtml = t.tkBodyHTML('base');
check('base has text input for city', baseHtml.indexOf('oninput="tkCityIn(this)"') >= 0);
check('base no longer has 有深圳 button', baseHtml.indexOf('有深圳') < 0);
check('base no longer has 全在外地 button', baseHtml.indexOf('全在外地</button>') < 0);
check('base has placeholder hint', baseHtml.indexOf('深圳 / 广州 / 义乌') >= 0);

// 2. 推断：含深圳 -> sz
input('深圳');
check('深圳 -> city sz', t.getTK().city === 'sz');
check('深圳 -> cityText', t.tkCityText() === '深圳');
check('深圳 -> show text', t.tkCityShow() === '深圳');

// 3. 多城市含深圳 -> sz
input('深圳、东莞');
check('深圳、东莞 -> sz', t.getTK().city === 'sz');
check('深圳、东莞 -> show', t.tkCityShow() === '深圳、东莞');

// 4. 外地城市 -> out
input('广州');
check('广州 -> city out', t.getTK().city === 'out');
check('广州 -> show', t.tkCityShow() === '广州');

input('义乌');
check('义乌 -> city out', t.getTK().city === 'out');

// 5. 清空 -> city 空
input('');
check('empty -> city blank', t.getTK().city === '');
check('empty -> show 未填', t.tkCityShow() === '未填');

// 6. 特殊字符转义：value 不裸拼引号
input('深圳" onclick="alert(1)');
const escHtml = t.tkBodyHTML('base');
check('cityText escaped in value attribute', escHtml.indexOf('value="深圳&quot;') >= 0 && escHtml.indexOf('value="深圳" onclick') < 0);

// 7. tkToA 映射：深圳文本 -> shenzhen / szExempt true；外地 -> other
input('深圳');
t.tkToA();
check('tkToA 深圳 -> A.city shenzhen', t.getA().city === 'shenzhen');
check('tkToA 深圳 -> szExempt true', t.getA().szExempt === true);
input('广州');
t.tkToA();
check('tkToA 广州 -> A.city other', t.getA().city === 'other');
check('tkToA 广州 -> szExempt false', t.getA().szExempt === false);

// 8. 老存档兼容：只有 city 无 cityText，显示回退
t.tkReset();
t.getTK().city = 'sz';
check('legacy sz -> 含深圳', t.tkCityShow() === '含深圳');
t.getTK().city = 'out';
check('legacy out -> 全在外地', t.tkCityShow() === '全在外地');
t.getTK().city = '';
check('legacy blank -> 未填', t.tkCityShow() === '未填');

// 9. tkAnsText 显示具体城市
t.tkReset();
t.getTK().subs = 1;
t.getTK().plats = ['amazon'];
t.getTK().flow = 100;
input('成都');
const ans = t.tkAnsText('base');
check('tkAnsText shows 成都', ans.indexOf('成都') >= 0 && ans.indexOf('全在外地') < 0);

console.log(pass ? '\nALL CITY CHECKS PASSED' : '\nSOME CITY CHECKS FAILED');
process.exit(pass ? 0 : 1);
