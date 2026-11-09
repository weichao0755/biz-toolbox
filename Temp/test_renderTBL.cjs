const fs=require('fs');
const html=fs.readFileSync('public/tools/cross/index.html','utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/g)||[];
let target='';
for(const s of m){ if(s.includes('var TBL=')){ target=s.replace(/^<script>/,'').replace(/<\/script>$/,''); } }

function makeEl(){ return { _html:'', set innerHTML(v){ this._html=v; }, get innerHTML(){ return this._html; }, style:{}, classList:{add(){},remove(){},contains(){return false;}} }; }
const els={};
const document={ getElementById(id){ if(!els[id]) els[id]=makeEl(); return els[id]; }, addEventListener(){}, createElement(){return makeEl();} };
const window={ addEventListener(){}, scrollTo(){} };
const localStorage={ getItem(){return null;}, setItem(){} };
const sessionStorage={ getItem(){return null;}, setItem(){} };
const scrollTo=function(){};

const vm=require('vm');
const ctx={ document, window, localStorage, sessionStorage, scrollTo, console, setTimeout, clearTimeout };
vm.createContext(ctx);
vm.runInContext(target, ctx);

ctx.renderTBL();
const out=els['tbllist'].innerHTML;
const chips=els['tblf'].innerHTML;

let pass=true;
function check(name,cond){ if(!cond){ pass=false; console.log('FAIL:',name); } else { console.log('ok  :',name); } }

check('render produced table', out.indexOf('<table')>=0);
check('contains 希音', out.indexOf('希音')>=0);
check('contains 沃尔玛', out.indexOf('沃尔玛')>=0);
check('contains 美客多', out.indexOf('美客多')>=0);
check('contains 酷澎', out.indexOf('酷澎')>=0);
check('contains 来赞达', out.indexOf('来赞达')>=0);
check('contains 野莓', out.indexOf('野莓')>=0);
check('contains Noon', out.indexOf('Noon')>=0);
check('contains Trendyol', out.indexOf('Trendyol')>=0);
check('contains 乐天', out.indexOf('乐天')>=0);
check('contains eBay', out.indexOf('eBay')>=0);
check('contains 亚马逊中东', out.indexOf('中东')>=0);
check('contains 印度', out.indexOf('印度')>=0);
check('contains 巴西(新增站点)', out.indexOf('巴西')>=0);
check('chip count shows 希音', chips.indexOf('希音')>=0);
check('chip count shows 美客多', chips.indexOf('美客多')>=0);
check('免税口径 detail from mi.x', out.indexOf('平台统一申报')>=0);

ctx.setTBLP('shein');
const out2=els['tbllist'].innerHTML;
check('filter shein shows only shein', out2.indexOf('希音')>=0 && out2.indexOf('亚马逊')<0);

console.log(pass?'\nALL RENDER CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
