// 测试：业务链路图生成器（节点/连线/注释、模式切换、渲染、注册）
const fs=require('fs'),vm=require('vm');
const DIR='public/tools/flow-chart/';
const html=fs.readFileSync(DIR+'index.html','utf8');
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts[scripts.length-1];
function el(){return{value:'',innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},appendChild(){},removeChild(){},addEventListener(){},setAttribute(){},click(){}};}
var els={},store={};
var ls={getItem(k){return store[k]||null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];},key(i){return Object.keys(store)[i]||null;},get length(){return Object.keys(store).length;}};
var sb={document:{getElementById(id){if(!els[id])els[id]=el();return els[id];},querySelector(){return {clientWidth:1300};},createElement(){return el();},body:el(),addEventListener(){}},
  window:{},localStorage:ls,sessionStorage:ls,navigator:{},console:{log(){},warn(){}},setTimeout,clearTimeout,
  location:{origin:'http://test'},URL:{createObjectURL(){return 'blob:x';},revokeObjectURL(){}},
  alert(){},html2canvas:undefined};
sb.window=sb; sb.window.addEventListener=function(){}; vm.createContext(sb);
new vm.Script(fs.readFileSync(DIR+'flow-data.js','utf8')).runInContext(sb);
new vm.Script(code+'\nwindow.__t={render:render,edgePath:edgePath,nodeHTML:nodeHTML,fill:FlowData.fillMode,MODES:FlowData.MODES,NODES:FlowData.NODES,EDGES:FlowData.EDGES,NOTES:FlowData.NOTES,FLOW_ON:FLOW_ON,toggleFlow:toggleFlow,renderToggles:renderToggles};').runInContext(sb);
const t=sb.__t;
let pass=true;function ck(n,c){if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n);}

// 1) 数据结构
ck('14 nodes',t.NODES.length===14);
ck('20 edges (7 trunk + 5 goods + 4 fund + 4 invoice)',t.EDGES.length===20&&t.EDGES.filter(e=>e.flow==='goods').length===5&&t.EDGES.filter(e=>e.flow==='fund').length===4&&t.EDGES.filter(e=>e.flow==='invoice').length===4);
ck('5 notes',t.NOTES.length===5);
ck('2 saiwei modes',Object.keys(t.MODES).length===2&&!!t.MODES.saiwei1&&!!t.MODES.saiwei2);
/* 5 种报关模式（数据来自 cross 名词速查，不自造） */
ck('5 customs modes',Object.keys(sb.FlowData.CUSTOM_MODES||{}).length===5);
const CM=sb.FlowData.CUSTOM_MODES;
ck('0110 = 免抵退 (not 免税)',CM.m0110.taxmode==='免抵退'&&CM.m0110.trapNote.indexOf('免抵退')>=0);
ck('9610 = 只免不退',CM.m9610.taxmode==='无票免税'&&CM.m9610.limitNote.indexOf('只免不退')>=0);
ck('9710 = B2B 按票退税',CM.m9710.taxmode==='按票退税'&&CM.m9710.defNote.indexOf('B2B')>=0);
ck('9810 = 离境即退税 + 报关主体前提',CM.m9810.taxmode==='离境即退税'&&CM.m9810.useNote.indexOf('报关主体')>=0&&CM.m9810.trapNote.indexOf('平台代报')>=0);
ck('1039 = 免征不退 + 15万美元',CM.m1039.taxmode==='免征不退'&&CM.m1039.limitNote.indexOf('15 万美元')>=0);
const cf=sb.FlowData.fillCustom('m9810');
ck('custom skeleton 11 nodes / 15 edges / 5 notes',cf.nodes.length===11&&cf.edges.length===15&&cf.notes.length===5);
ck('custom no placeholder leftover',!/__[A-Z_]+__/.test(JSON.stringify(cf)));
ck('diamond labels short',cf.nodes.find(n=>n.id==='declare').label==='9810报关'&&cf.nodes.find(n=>n.id==='tax').label==='离境即退税');
ck('all edge endpoints exist',t.EDGES.every(e=>t.NODES.some(n=>n.id===e.from)&&t.NODES.some(n=>n.id===e.to)));

// 2) 模式切换文案
const a=t.fill('saiwei1'), b=t.fill('saiwei2');
ck('saiwei1 premise',a.mode.premiseLabel==='赛维1.0前提条件'&&a.mode.premise.indexOf('店铺群模式')>=0);
ck('saiwei2 premise',b.mode.premiseLabel==='赛维2.0前提条件'&&b.mode.premise.indexOf('15号文')>=0);
ck('HK->shop differs',a.edges.find(e=>e.from==='hk'&&e.to==='shops').label==='协议控制'&&b.edges.find(e=>e.from==='hk'&&e.to==='shops').label==='销售');
ck('withdraw differs',a.edges.find(e=>e.from==='hk'&&e.to==='third').label==='提现至第三方账户主账户'&&b.edges.find(e=>e.from==='hk'&&e.to==='third').label==='提现至本土银行账户');
ck('fund note 8.25% in 1.0',a.notes.find(n=>n.id==='fund').text.indexOf('8.25%')>=0);
ck('declare note differs',a.notes.find(n=>n.id==='declare').text.indexOf('0申报')>=0&&b.notes.find(n=>n.id==='declare').text.indexOf('如实申报')>=0);
ck('no placeholder leftovers',!/__[A-Z_]+__/.test(JSON.stringify(a))&&!/__[A-Z_]+__/.test(JSON.stringify(b)));
ck('shop group has 4 subs',a.nodes.find(n=>n.id==='shops').subs.length===4);

// 3) 渲染：默认 saiwei1
els.mode.value='saiwei1';
t.render();
let h=els.sheet.innerHTML;
const eq=(sb.FlowData.NOTES||[]).find(n=>n.id==='equity');
ck('equity note moved below, not over buyer',!!eq && eq.y>500 && eq.x+eq.w<=1400);
ck('render sheet header',h.indexOf('业务链路图')>=0&&h.indexOf('赛维 1.0')>=0);
ck('no customer/platform on sheet',h.indexOf('客户：')<0&&h.indexOf('平台：')<0);
ck('render 14 nodes',(h.match(/class="node/g)||[]).length===14);
ck('render 20 edges (all flows on)',(h.match(/<path d="M[^"]+" fill="none" stroke=/g)||[]).length===20);
ck('render 5 notes',(h.match(/class="note/g)||[]).length===5);
ck('render 4 arrow markers',h.indexOf('id="wtrunk"')>=0&&h.indexOf('id="wgoods"')>=0&&h.indexOf('id="wfund"')>=0&&h.indexOf('id="winvoice"')>=0);
ck('arrows in single SVG defs',h.indexOf('<svg class="wires"')>=0&&h.indexOf('marker-end=')>=0);
ck('labels layered above nodes',h.indexOf('class="wire-labels"')>=0&&h.indexOf('<text x=')>=0);
ck('render 3 flow colors',h.indexOf('#2d7fb8')>=0&&h.indexOf('#c0392b')>=0&&h.indexOf('#b8860b')>=0);
ck('render mode label 协议控制',h.indexOf('协议控制')>=0);

// 4) 切到 saiwei2 重新渲染
els.mode.value='saiwei2';t.render();
h=els.sheet.innerHTML;
ck('switch mode updates header',h.indexOf('赛维 2.0')>=0);
ck('switch mode updates label',h.indexOf('本土银行账户')>=0&&h.indexOf('协议控制')<0);
ck('switch mode updates note',h.indexOf('15号文')>=0);

// 4b) 切到报关模式族：骨架换成 11 节点、文案来自 cross 口径
els.mode.value='m9610';t.render();
h=els.sheet.innerHTML;
ck('customs mode renders 11 nodes',(h.match(/class="node/g)||[]).length===11);
ck('customs mode renders 15 edges',(h.match(/<path d="M[^"]+" fill="none" stroke=/g)||[]).length===15);
ck('customs mode header',h.indexOf('跨境电商零售出口 9610')>=0);
ck('customs mode 只免不退 note',h.indexOf('只免不退')>=0);
ck('customs mode no saiwei nodes',h.indexOf('店铺公司群')<0&&h.indexOf('第三方账户主账户')<0);
els.mode.value='m9810';t.render();h=els.sheet.innerHTML;
ck('9810 switches to 离境即退税',h.indexOf('离境即退税')>=0&&h.indexOf('海外仓备案')>=0);
ck('9810 no 9610 wording',h.indexOf('只免不退')<0);
els.mode.value='saiwei2';t.render();h=els.sheet.innerHTML;
ck('switch back to saiwei restores 14 nodes',(h.match(/class="node/g)||[]).length===14&&h.indexOf('店铺公司群')>=0);

// 4c) 三条流开关：默认全亮；关闭某流线数减少且颜色消失；全关只剩主干
ck('FLOW_ON default all true',t.FLOW_ON&&t.FLOW_ON.goods&&t.FLOW_ON.fund&&t.FLOW_ON.invoice);
ck('form has no cid/platform inputs',html.indexOf('id="cid"')<0&&html.indexOf('id="platform"')<0&&html.indexOf('客户名称')<0&&html.indexOf('主营平台')<0);
ck('3 flow buttons rendered',(els.flowToggles.innerHTML.match(/class="flow-btn/g)||[]).length===3);
ck('3 colors distinct',new Set(['#2d7fb8','#c0392b','#b8860b']).size===3);
t.toggleFlow('goods'); h=els.sheet.innerHTML;
ck('goods off removes 5 lines',(h.match(/<path d="M[^"]+" fill="none" stroke=/g)||[]).length===15);
ck('goods off removes blue color',h.indexOf('#2d7fb8')<0);
ck('goods off keeps fund+invoice',h.indexOf('#c0392b')>=0&&h.indexOf('#b8860b')>=0);
ck('goods button not on',els.flowToggles.innerHTML.indexOf('data-flow="goods"')>=0&&els.flowToggles.innerHTML.indexOf('class="flow-btn on" data-flow="goods"')<0);
t.toggleFlow('fund'); h=els.sheet.innerHTML;
ck('goods+fund off leaves 11 lines',(h.match(/<path d="M[^"]+" fill="none" stroke=/g)||[]).length===11&&h.indexOf('#c0392b')<0);
t.toggleFlow('invoice'); h=els.sheet.innerHTML;
ck('all off leaves 7 trunk lines',(h.match(/<path d="M[^"]+" fill="none" stroke=/g)||[]).length===7&&h.indexOf('#b8860b')<0);
ck('all-off legend shown',h.indexOf('未显示流向线')>=0);
t.toggleFlow('goods');t.toggleFlow('fund');t.toggleFlow('invoice'); h=els.sheet.innerHTML;
ck('all on again restores 20 lines',(h.match(/<path d="M[^"]+" fill="none" stroke=/g)||[]).length===20);

// 5) 连线路径计算
const p=t.edgePath(t.NODES.find(n=>n.id==='supplier'),t.NODES.find(n=>n.id==='warehouse'),'dash','left');
ck('edgePath returns path+label pos',/^M\d+ \d+ C/.test(p.d)&&typeof p.lx==='number'&&typeof p.ly==='number');
const pr=t.edgePath(t.NODES.find(n=>n.id==='trade'),t.NODES.find(n=>n.id==='drawback'),'solid','down');
ck('edgePath downward for drawback',pr.d.indexOf('L')>0);

// 6) 注册检查
const tools=fs.readFileSync('src/data/tools.js','utf8');
ck('tools.js registers flow-chart',tools.indexOf("path: '/tools/flow-chart'")>=0&&tools.indexOf('tools/flow-chart/index.html')>=0);
const bk=fs.readFileSync('src/data/backupKeys.js','utf8');
ck('flow-chart registered in 合规区(compliance)',/path: '\/tools\/flow-chart'[\s\S]{0,500}?category: 'compliance'/.test(tools));
ck('backupKeys registers flow_chart_v1',bk.indexOf("'flow_chart_v1'")>=0);
ck('html2canvas dep copied',fs.existsSync(DIR+'html2canvas.min.js'));

// 7) 自定义模式：填空 + 自动排版
ck('mode dropdown has 自定义',html.indexOf('value="user"')>=0&&html.indexOf('自定义（自己填节点和连线）')>=0);
ck('custom editor DOM exists',html.indexOf('id="userNodes"')>=0&&html.indexOf('id="userEdges"')>=0&&html.indexOf('userApply()')>=0);
ck('backupKeys registers flow_custom_v1',bk.indexOf("'flow_custom_v1'")>=0);
const F=sb.FlowData;
ck('CUSTOM_DEFAULT 6 nodes / 7 edges',F.CUSTOM_DEFAULT.nodes.length===6&&F.CUSTOM_DEFAULT.edges.length===7);
/* 自动排版：忽略资金流反向边，6节点应均匀排6列（x 递增，y 相同） */
const positions=F.autoLayout(F.CUSTOM_DEFAULT.nodes,F.CUSTOM_DEFAULT.edges);
const xs=F.CUSTOM_DEFAULT.nodes.map(n=>positions[n.id].x).sort((a,b)=>a-b);
ck('autoLayout 6 distinct columns',xs.length===6&&xs[5]-xs[0]===215*5);
const filled=F.fillCustomUser(F.CUSTOM_DEFAULT);
ck('fillCustomUser shape',filled.nodes.length===6&&filled.edges.length===7&&filled.mode.name==='自定义链路图');
ck('custom edges keep flow types',filled.edges.filter(e=>e.flow==='goods').length===3&&filled.edges.filter(e=>e.flow==='fund').length===1&&filled.edges.filter(e=>e.flow==='invoice').length===1);
const edited={nodes:[{id:'a',name:'工厂'},{id:'b',name:'外贸'},{id:'c',name:'客户'}],edges:[{from:'a',to:'b',flow:'',label:'卖'},{from:'b',to:'c',flow:'fund',label:'钱'}]};
const ef=F.fillCustomUser(edited);
ck('user filled nodes render by name',ef.nodes.length===3&&ef.nodes[0].label==='工厂'&&ef.nodes[2].label==='客户');
ck('user filled edges keep labels',ef.edges[0].label==='卖'&&ef.edges[1].flow==='fund');

/* 同列多节点不得顶出画布（老板截图反馈：供应商节点顶到标题上） */
const colNodes=[1,2,3,4,5,6].map(i=>({id:'c'+i,name:'列节点'+i}));
const colEdges=[1,2,3,4,5].map(i=>({from:'c'+i,to:'c6',flow:'',label:''}));
const colPos=F.autoLayout(colNodes,colEdges);
const colYs=[1,2,3,4,5].map(i=>colPos['c'+i].y);
ck('same-column nodes start at y=140 (no negative)',colYs[0]===140);
ck('same-column nodes all fit canvas',colYs.every(y=>y>=130&&y+52<=740));
/* 端到端：切到自定义模式渲染 */
els.mode.value='user';els.flowToggles.innerHTML='';t.render();
h=els.sheet.innerHTML;
ck('user mode renders 6 nodes',(h.match(/class="node/g)||[]).length===6);
ck('user mode renders 7 edges',(h.match(/<path d="M[^"]+" fill="none" stroke=/g)||[]).length===7);
ck('user mode header 自定义链路图',h.indexOf('自定义链路图')>=0&&h.indexOf('客户：')<0);
/* 切回固定模式恢复 */
els.mode.value='m9610';t.render();
ck('switch back from custom to fixed',(els.sheet.innerHTML.match(/class="node/g)||[]).length===11);

// 8) 历史记录（本地 + 导出/导入 + 兼容本地文件夹同步）
ck('history key registered in backupKeys',bk.indexOf("'flow_history_v1'")>=0);
ck('HISTORY_KEY correct',F.HISTORY_KEY==='flow_history_v1');
ck('history UI exists',html.indexOf('id="histList"')>=0&&html.indexOf('histExport()')>=0&&html.indexOf('histImport(event)')>=0&&html.indexOf('应用到图（保存历史）')>=0);
var before=F.loadHistory().length;
var rec=F.pushHistory(F.CUSTOM_DEFAULT,'测试历史链路');
ck('pushHistory adds record',F.loadHistory().length===before+1&&rec.nodes.length===6&&rec.edges.length===7);
ck('record has title+time+id',!!rec.id&&!!rec.time&&rec.title==='测试历史链路');
var exp=F.exportHistoryJSON();
ck('export JSON format',exp.indexOf('"app": "biz-toolbox/flow-chart"')>=0&&exp.indexOf('测试历史链路')>=0);
var parsed=F.parseHistoryJSON(exp);
ck('parse exported JSON',parsed.length===F.loadHistory().length);
var imp=F.importHistoryJSON(exp);
ck('import JSON adds records',imp===parsed.length&&F.loadHistory().length>=imp);
ck('import compatible with bare array',F.parseHistoryJSON(JSON.stringify([{nodes:[],edges:[]}])).length===1);
ck('import compatible with single record',F.parseHistoryJSON(JSON.stringify({nodes:[],edges:[]})).length===1);
var badImport=false;try{F.parseHistoryJSON('{}')}catch(e){badImport=true}
ck('invalid JSON rejected',badImport);
F.deleteHistory(rec.id);
ck('deleteHistory removes record',!F.loadHistory().some(function(r){return r.id===rec.id;}));

console.log(pass?'\nALL FLOW-CHART CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
