// 测试：全平台「生成即存历史」通用组件 + 4 个出文件/图片工具接入 + backupKeys 同步登记
const fs=require('fs'),vm=require('vm');
let pass=true;function ck(n,c){if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n);}

// 1) 通用组件逻辑
const store={};
const sb={localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=String(v)}},
  document:{
    getElementById(){return null},createElement(){return {style:{},setAttribute(){},appendChild(){},click(){},remove(){}}},
    body:{appendChild(){}}
  },alert(){}};
sb.window=sb;vm.createContext(sb);
new vm.Script(fs.readFileSync('public/tools/gen-history.js','utf8')).runInContext(sb);
const G=sb.GenHistory;
ck('GenHistory API',G&&typeof G.save==='function'&&typeof G.load==='function'&&typeof G.restore==='function'&&typeof G.mount==='function');
const K='test_records_v1';
const r=G.save(K,'测试方案书',{a:1,b:'x'},{customer:'测试客户'});
ck('save returns record with time/id/title',!!r&&!!r.id&&!!r.time&&r.title==='测试方案书');
ck('save writes to localStorage',!!store[K]&&G.load(K).length===1);
ck('snapshot + extra persisted',G.load(K)[0].snapshot==='{"a":1,"b":"x"}'&&G.load(K)[0].customer==='测试客户');
G.save(K,'第二条',{a:2});
ck('newest first',G.load(K)[0].title==='第二条'&&G.load(K).length===2);
let restored=null;sb.GEN_RESTORE=function(s,meta){restored={s:s,meta:meta};};
G.restore(K,r.id);
ck('restore calls GEN_RESTORE with parsed snapshot',restored&&restored.s.a===1&&restored.meta.title==='测试方案书');
G.del(K,r.id);
ck('delete removes record',G.load(K).length===1&&!G.load(K).some(x=>x.id===r.id));
/* 上限 60 条 */
for(let i=0;i<70;i++) G.save(K,'第'+i+'条',{i});
ck('LIMIT 60 enforced',G.load(K).length===60);

// 2) 4 个工具都接入
const tools={
  'plan-doc':{key:'plan_doc_records_v1',mark:'GenHistory.save'},
  'cross-intake':{key:'cross_intake_records_v1',mark:'GenHistory.save'},
  'contract-screen':{key:'contract_screen_records_v1',mark:'GenHistory.save'},
  'flow-chart':{key:'flow_history_v1',mark:'GenHistory.save'}
};
Object.keys(tools).forEach(t=>{
  const h=fs.readFileSync('public/tools/'+t+'/index.html','utf8');
  const cfg=tools[t];
  ck(t+' imports gen-history',h.indexOf('../gen-history.js')>=0);
  ck(t+' saves on generate',h.indexOf(cfg.mark)>=0&&h.indexOf(cfg.key)>=0);
  ck(t+' mounts history UI',h.indexOf('GenHistory.mount')>=0&&h.indexOf(cfg.key)>=0);
  ck(t+' defines GEN_RESTORE',h.indexOf('GEN_RESTORE')>=0);
});

// 3) backupKeys 全量登记（扫描所有工具实际用的 key）
const bk=fs.readFileSync('src/data/backupKeys.js','utf8');
const bkeys=new Set([...bk.matchAll(/'([^']+)'/g)].map(m=>m[1]));
['plan_doc_records_v1','cross_intake_records_v1','contract_screen_records_v1','flow_history_v1',
 'huashu_gh_token','huashu_shared_cache','qref_shared_cache','quote_ai_config'].forEach(k=>{
  ck('backupKeys has '+k,bkeys.has(k));
});
// 4) 生成历史 key 都在白名单（自动进本地文件夹同步）
ck('all gen-history keys registered',['plan_doc_records_v1','cross_intake_records_v1','contract_screen_records_v1','flow_history_v1'].every(k=>bkeys.has(k)));

console.log(pass?'\nALL GEN-HISTORY CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
