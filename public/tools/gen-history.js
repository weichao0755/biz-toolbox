/* ============================================================================
 * 通用「生成历史」组件（各出文件/图片的工具共用）
 *
 * 用法（工具页）：
 *   1) <script src="../gen-history.js"></script>   （同目录工具用相对路径）
 *   2) 生成成功后调一行：GenHistory.save('xxx_records_v1', '标题', SNAPSHOT, {extra:'...'})
 *   3) 页面放一个按钮：<button id="genHistBtn">📜 生成历史</button>
 *      并插入弹窗容器：<div id="genHistModal" style="display:none">...</div>
 *      简单做法：直接调 GenHistory.mount('xxx_records_v1', '按钮所在父容器id') 自动注入
 *   4) 可选：window.GEN_RESTORE = function(snapshot, meta){ ...把数据载回表单... }
 *
 * 数据存 localStorage（key 必须登记 src/data/backupKeys.js 才会进本地文件夹同步）。
 * SNAPSHOT 一律 JSON 字符串，避免大对象循环引用。
 * ============================================================================ */
(function(scope){
"use strict";
var LIMIT=60;
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function stamp(){
  var d=new Date(),p=function(n){return String(n).padStart(2,'0');};
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
}
function load(key){ try{var a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];} }
function persist(key,arr){ try{localStorage.setItem(key,JSON.stringify(arr.slice(0,LIMIT)));return true;}catch(e){return false;} }
function save(key,title,snapshot,extra){
  try{
    var arr=load(key), snap=typeof snapshot==='string'?snapshot:JSON.stringify(snapshot||{});
    var rec={id:'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),time:stamp(),title:String(title||'生成记录').slice(0,60),snapshot:snap};
    if(extra&&typeof extra==='object') Object.keys(extra).forEach(function(k){ rec[k]=extra[k]; });
    arr.unshift(rec); persist(key,arr); return rec;
  }catch(e){ return null; }
}
function del(key,id){ persist(key,load(key).filter(function(r){return r.id!==id;})); }
function restore(key,id){
  var r=load(key).find(function(x){return x.id===id;}); if(!r)return false;
  var snap;try{snap=JSON.parse(r.snapshot);}catch(e){snap=null;}
  if(typeof scope.GEN_RESTORE!=='function'){ alert('该工具暂不支持载入历史（未定义恢复函数）'); return false; }
  scope.GEN_RESTORE(snap,r); return true;
}
/* 自动注入按钮 + 弹窗到页面（parentId 为按钮所在卡片的 id；省略则放 body） */
function mount(key,parentId){
  if(document.getElementById('genHistModal')) return;   /* 已挂载 */
  var host=parentId?document.getElementById(parentId):document.body;
  if(!host) host=document.body;
  var btn=document.createElement('button');
  btn.className='btn ghost'; btn.textContent='📜 生成历史'; btn.style.marginLeft='8px';
  btn.onclick=function(){ open(key); };
  host.appendChild(btn);
  var m=document.createElement('div');
  m.id='genHistModal';
  m.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(42,33,24,.45);z-index:9999;display:none;align-items:center;justify-content:center';
  m.innerHTML='<div style="background:#fffefb;border-radius:12px;padding:20px 22px;width:min(680px,92vw);max-height:80vh;overflow:auto;box-shadow:0 12px 40px rgba(0,0,0,.2)">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="color:#b45309;font-size:16px">生成历史</b><button onclick="GenHistory.close()" style="border:0;background:none;cursor:pointer;font-size:20px;color:#8a7a62">×</button></div>'
    +'<div id="genHistBody"></div></div>';
  m.onclick=function(e){ if(e.target===m) close(); };
  document.body.appendChild(m);
}
function open(key){
  var m=document.getElementById('genHistModal'); if(!m)return;
  var arr=load(key), h='';
  if(!arr.length){
    h='<div style="color:#9a8a72;font-size:13px;line-height:1.8">暂无历史。<br>每次生成文件/图片后会自动保存一条，可随时载入数据重新生成。</div>';
  }else{
    h='<div style="color:#9a8a72;font-size:12px;margin-bottom:10px">共 '+arr.length+' 条（最多 '+LIMIT+' 条）· 自动随首页「本地文件夹同步」保存到「储存」文件夹</div>';
    h+=arr.map(function(r){
      var meta=[];
      if(r.customer) meta.push(esc(r.customer));
      if(r.amount!=null) meta.push('¥'+r.amount);
      if(r.mode) meta.push(esc(r.mode));
      return '<div style="display:flex;align-items:center;gap:10px;border:1px solid #ece3d6;border-radius:8px;background:#fffdf8;padding:9px 11px;margin-bottom:8px;font-size:12.5px">'
        +'<div style="flex:1;min-width:0"><div style="font-weight:600;color:#2a2118;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(r.title)+'</div>'
        +'<div style="color:#9a8a72;font-size:11.5px;margin-top:2px">🕐 '+esc(r.time)+(meta.length?' · '+meta.join(' · '):'')+'</div></div>'
        +(typeof scope.GEN_RESTORE==='function'?'<button onclick="GenHistory.restore(\''+key+'\',\''+r.id+'\')" style="border:0;background:#f6ecdc;color:#b45309;border-radius:6px;cursor:pointer;padding:6px 9px;font-size:12px">载入</button>':'')
        +'<button onclick="GenHistory.del(\''+key+'\',\''+r.id+'\')" style="border:0;background:#f6ecdc;color:#b45309;border-radius:6px;cursor:pointer;padding:6px 9px;font-size:12px">删</button></div>';
    }).join('');
  }
  document.getElementById('genHistBody').innerHTML=h;
  m.style.display='flex';
}
function close(){ var m=document.getElementById('genHistModal'); if(m)m.style.display='none'; }
scope.GenHistory={save:save,load:load,del:del,restore:restore,mount:mount,open:open,close:close,LIMIT:LIMIT};
})(typeof window!=='undefined'?window:globalThis);
