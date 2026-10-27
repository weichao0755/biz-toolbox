const fs = require('fs');
const path = require('path');

const root = 'C:/Users/PC/WorkBuddy/2026-09-03-11-14-56/biz-toolbox';
const srcPath = path.join(root, 'public/tools/cross/index.html');
const outDir = path.join(root, 'public/tools/cross-quiz');
const outPath = path.join(outDir, 'index.html');

const lines = fs.readFileSync(srcPath, 'utf8').split('\n');
// 1-based lines 4555..5049  → array slice(4554, 5049)
const bankJs = lines.slice(4554, 5049).join('\n');

const CSS = `
:root{
  --bg:#faf7f2; --surface:#fffefb; --surface-2:#fdf6ec; --border:#ece3d6;
  --text:#2a2118; --text-2:#6b5d4a; --muted:#9a8a72;
  --accent:#b45309; --accent-2:#e0901a; --grad:linear-gradient(135deg,#e0901a 0%,#b45309 100%);
  --accent-bg:#fdf3e3; --green:#2f8f5b; --green-bg:#e8f3ec; --red:#c0392f; --red-bg:#fbecea;
  --amber:#b5730a; --amber-bg:#fbf0dd; --r:12px; --r-lg:18px;
  --sh:0 1px 2px rgba(60,40,10,.05),0 2px 8px -4px rgba(60,40,10,.08);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
  background-color:var(--bg);
  background-image:radial-gradient(circle at 1px 1px,rgba(224,144,26,.07) 1px,transparent 0);
  background-size:24px 24px;color:var(--text);font-size:14px;line-height:1.65}
.wrap{max-width:560px;margin:0 auto;padding:20px 16px 48px}
.brand{display:inline-block;font-size:11px;font-weight:500;padding:3px 10px;border-radius:999px;background:var(--accent-bg);color:var(--accent);margin-bottom:8px}
h1{font-size:20px;font-weight:600;margin-bottom:6px}
.sub{color:var(--text-2);font-size:12.5px;margin-bottom:14px}
.tabs{display:flex;gap:6px;margin-bottom:16px;background:var(--surface);padding:4px;border:1px solid var(--border);border-radius:12px;box-shadow:var(--sh)}
.tab{flex:1;text-align:center;padding:9px 4px;border-radius:9px;font-size:13px;font-weight:500;color:var(--text-2);cursor:pointer;transition:.15s}
.tab.on{background:var(--grad);color:#fff;box-shadow:0 4px 12px -4px rgba(224,144,26,.5)}
.pane{display:none}.pane.on{display:block}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:12px;box-shadow:var(--sh)}
.q{font-size:15.5px;font-weight:600;margin-bottom:6px}
.q .sm{display:block;font-weight:400;font-size:11.5px;color:var(--muted);margin-top:3px}
.hint{color:var(--text-2);font-size:12.5px;margin-bottom:8px}
.sm{font-size:12.5px;color:var(--text-2)}
.opt{display:block;width:100%;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;font-size:14px;color:var(--text);cursor:pointer;transition:.15s;box-shadow:var(--sh)}
.opt:active{transform:scale(.995)}
.opt.sel{border-color:var(--accent);background:var(--accent-bg)}
.opt b{color:var(--accent)}
.opt.ok{border-color:var(--green);background:var(--green-bg)}
.opt.no{border-color:var(--red);background:var(--red-bg)}
.qtype{display:inline-block;background:var(--accent-bg);color:var(--accent);border-radius:999px;padding:1px 7px;font-size:11px;margin-right:6px}
.tip{background:var(--amber-bg);border-radius:8px;padding:9px 12px;margin-top:6px;font-size:12.5px}
.warn{background:var(--red-bg);border-radius:8px;padding:10px 12px;margin-top:6px;font-size:12.5px;color:var(--red)}
.btn{width:100%;border:none;border-radius:9px;padding:12px;font-size:14.5px;font-weight:600;cursor:pointer;background:var(--grad);color:#fff;box-shadow:0 6px 16px -6px rgba(224,144,26,.4);transition:.15s}
.btn:hover{opacity:.93;transform:translateY(-1px)}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.btn.ghost{background:var(--surface);color:var(--text-2);border:1px solid var(--border);box-shadow:var(--sh)}
.badge{display:inline-block;background:var(--green-bg);color:var(--green);border-radius:999px;padding:1px 8px;font-size:11px;margin-left:6px}
.redo{font-size:12px;color:var(--accent);cursor:pointer;text-decoration:underline;margin-left:8px}
.ordnum{display:inline-block;min-width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;background:var(--accent);color:#fff;font-size:11px;margin-right:6px;padding:0 4px}
.papers{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.pchip{flex:1;min-width:96px;text-align:center;padding:9px 10px;border:1px solid var(--border);border-radius:999px;font-size:13px;color:var(--text-2);background:var(--surface);cursor:pointer;box-shadow:var(--sh)}
.pchip.on{background:var(--grad);color:#fff;border-color:transparent;box-shadow:0 4px 12px -4px rgba(224,144,26,.5)}
.kchip{flex:0 0 auto;border:1px solid var(--border);background:var(--surface);color:var(--text-2);border-radius:999px;padding:5px 11px;font-size:12px;font-family:inherit;cursor:pointer;white-space:nowrap}
.kchip.on{background:var(--grad);color:#fff;border-color:transparent}
input[type=text]{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;background:var(--surface);color:var(--text);margin-bottom:12px;outline:none}
input[type=text]:focus{border-color:var(--accent-2);box-shadow:0 0 0 3px rgba(224,144,26,.16)}
.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.stat{display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.stat .pill{background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:5px 12px;font-size:12.5px;box-shadow:var(--sh)}
.stat .pill b{color:var(--accent)}
.row{padding:12px 0;border-bottom:1px dashed var(--border)}.row:last-child{border:none}
.k{font-size:11.5px;color:var(--muted);margin-bottom:3px}
.v{font-size:15px;font-weight:600}.v.amber{color:var(--accent)}
.bank-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:13px;margin-bottom:10px;box-shadow:var(--sh)}
.bank-opt{display:block;padding:8px 11px;border:1px solid var(--border);border-radius:8px;margin-bottom:6px;font-size:13.5px;color:var(--text)}
.bank-opt.correct{border-color:var(--green);background:var(--green-bg);color:var(--green);font-weight:600}
.reveal-line{background:var(--accent-bg);border-radius:8px;padding:8px 11px;margin-top:6px;font-size:12.5px;color:var(--text-2);line-height:1.7}
.reveal-line b{color:var(--accent)}
`;

const HEAD = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>跨境电商销售考核题库</title>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
  <span class="brand">跨境 · 销售训练</span>
  <h1>跨境电商销售考核题库</h1>
  <p class="sub">从「跨境销售辅助工具」拆出的独立训练题库 · 学习浏览 + 随机考核自测</p>

  <div class="tabs">
    <div class="tab on" data-t="study" onclick="tab('study')">学习模式</div>
    <div class="tab" data-t="exam" onclick="tab('exam')">考核模式</div>
  </div>

  <!-- 学习模式 -->
  <div class="pane on" id="p-study">
    <div class="toolbar">
      <input type="text" id="bkw" placeholder="搜索题目 / 解析，如 9810 / 红线 / 套餐" oninput="onKw()" style="margin-bottom:0;flex:1;min-width:180px">
      <button class="btn ghost" id="rbtn" style="width:auto;flex:0 0 auto;padding:10px 16px" onclick="toggleReveal()">显示答案</button>
    </div>
    <div class="stat">
      <div class="pill">总题数 <b id="bcount">0</b></div>
      <div class="pill">红线题 <b id="rcount">0</b></div>
      <div class="pill">分类 <b id="ccount">0</b></div>
    </div>
    <div class="kbf" id="bchips" style="display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px"></div>
    <div id="bank"></div>
  </div>

  <!-- 考核模式 -->
  <div class="pane" id="p-exam">
    <p class="hint" id="qzhint"></p>
    <div class="papers" id="papers">
      <div class="pchip on" onclick="setPaper('p1')">新人卷</div>
      <div class="pchip" onclick="setPaper('p2')">进阶卷</div>
      <div class="pchip" onclick="setPaper('p3')">主管卷</div>
    </div>
    <div class="stat">
      <div class="pill">历史正确率 <b id="s-rate">—</b></div>
      <div class="pill">最高分 <b id="s-best">—</b></div>
    </div>
    <div id="qz"></div>
    <div class="card" id="recbox"></div>
  </div>
</div>
`;

const SCRIPT1 = `
var KEY='cross_quiz_v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{attempts:[]}}catch(e){return{attempts:[]}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
var ST=load();
`;

const SCRIPT3 = `
/* ===== 学习模式 ===== */
var ALL = POOL_G.concat(POOL_R);
var CATS = {};
ALL.forEach(function(q){ if(TAGN[q.tag]) CATS[q.tag]=TAGN[q.tag]; });
var studyReveal=false, studyCat='all', studyKw='';
document.getElementById('rcount').textContent = POOL_R.length;
document.getElementById('ccount').textContent = Object.keys(CATS).length;
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function buildChips(){
  var h="<span class=\\"kchip"+(studyCat==='all'?' on':'')+"\\" onclick=\\"setStudyCat('all')\\">全部</span>";
  for(var t in CATS){ h+="<span class=\\"kchip"+(studyCat===t?' on':'')+"\\" onclick=\\"setStudyCat('"+t+"')\\">"+CATS[t]+"</span>"; }
  document.getElementById('bchips').innerHTML=h;
}
function setStudyCat(t){ studyCat=t; buildChips(); renderBank(); }
function onKw(){ studyKw=document.getElementById('bkw').value.trim(); renderBank(); }
function toggleReveal(){ studyReveal=!studyReveal; document.getElementById('rbtn').textContent= studyReveal?'隐藏答案':'显示答案'; renderBank(); }
function renderBank(){
  var list=ALL.filter(function(q){
    if(studyCat!=='all' && q.tag!==studyCat) return false;
    if(studyKw){
      var k=studyKw.toLowerCase();
      var hit=(q.q||'').toLowerCase().indexOf(k)>=0 || (q.e||'').toLowerCase().indexOf(k)>=0 || (TAGN[q.tag]||'').toLowerCase().indexOf(k)>=0;
      if(!hit) return false;
    }
    return true;
  });
  var h='';
  if(!list.length){ h='<p class="hint">没有匹配的题目。</p>'; }
  for(var i=0;i<list.length;i++){
    var q=list[i];
    var tn=q.type==='multi'?'多选':(q.type==='order'?'排序':'单选');
    h+='<div class="bank-card"><p class="q" style="margin-bottom:8px">'+esc(q.q)+
       (q.rl?' <span class="qtype" style="background:var(--red-bg);color:var(--red)">红线</span>':'')+
       ' <span class="qtype">'+tn+'</span> <span class="qtype" style="opacity:.7">'+(TAGN[q.tag]||q.tag)+'</span></p>';
    for(var j=0;j<q.o.length;j++){
      var correct = Array.isArray(q.a)? (q.a.indexOf(j)>=0) : (j===q.a);
      h+='<div class="bank-opt'+(studyReveal&&correct?' correct':'')+'">'+(studyReveal&&correct?'✔ ':'')+esc(q.o[j])+'</div>';
    }
    if(q.type==='order' && studyReveal){
      var ot=[]; for(var k=0;k<q.a.length;k++) ot.push((k+1)+'. '+esc(q.o[q.a[k]]));
      h+='<div class="reveal-line"><b>正确顺序：</b>'+ot.join(' → ')+'</div>';
    }
    if(studyReveal && q.e){ h+='<div class="reveal-line"><b>解析：</b>'+esc(q.e)+'</div>'; }
    h+='</div>';
  }
  document.getElementById('bank').innerHTML=h;
  document.getElementById('bcount').textContent=list.length;
}

/* ===== 标签页切换 ===== */
function tab(n){
  var ts=document.querySelectorAll('.tab'); for(var i=0;i<ts.length;i++) ts[i].classList.toggle('on', ts[i].dataset.t===n);
  document.getElementById('p-study').classList.toggle('on', n==='study');
  document.getElementById('p-exam').classList.toggle('on', n==='exam');
}

/* ===== 覆盖 updProg：去掉名词库依赖，只统计考核成绩 ===== */
function updProg(){
  var sr=document.getElementById('s-rate'), sb=document.getElementById('s-best');
  if(ST.attempts.length){
    var tot=0,cor=0,best=0;
    for(var i=0;i<ST.attempts.length;i++){
      var a=ST.attempts[i]; best=Math.max(best,a.score);
      var t=a.total||(POOL_G.length+POOL_R.length);
      var c=a.cor!=null?a.cor:(t-(a.wrong?a.wrong.length:0));
      tot+=t; cor+=c;
    }
    if(sr) sr.textContent=Math.round(cor/tot*100)+'%';
    if(sb) sb.textContent=best+' 分';
  }else{
    if(sr) sr.textContent='—';
    if(sb) sb.textContent='—';
  }
}

/* ===== 初始化 ===== */
buildChips();
renderBank();
setPaper('p1');
`;

const HTML = HEAD + '<script>' + SCRIPT1 + '<\/script>' + '<script>' + bankJs + '<\/script>' + '<script>' + SCRIPT3 + '<\/script>' + '</body></html>';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, HTML, 'utf8');
console.log('written:', outPath, 'bytes:', HTML.length);
console.log('bankJs lines:', bankJs.split('\n').length);
