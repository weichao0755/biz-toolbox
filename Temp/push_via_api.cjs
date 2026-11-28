// 当 github.com git 隧道被代理挡住时的备用推送：走 api.github.com Git Data API
// 从 git credential manager 取 token（不打印），把本地 HEAD 相对远端父提交的改动逐个建 blob → tree → commit → 更新 main ref
const {execFileSync}=require('child_process');
const https=require('https');
const fs=require('fs');
const path=require('path');

function getToken(){
  const out=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',stdio:['pipe','pipe','pipe']});
  const m=out.match(/^password=(.+)$/m);
  if(!m) throw new Error('no token from credential manager');
  return m[1].trim();
}
const TOKEN=getToken();
const REPO='weichao0755/biz-toolbox';
const API='api.github.com';
function api(method,p,body){
  return new Promise((resolve,reject)=>{
    const data=body?JSON.stringify(body):null;
    const req=https.request({host:API,path:'/repos/'+REPO+p,method,
      headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+TOKEN,
        'User-Agent':'biz-toolbox-deploy','Content-Type':'application/json',
        ...(data?{'Content-Length':Buffer.byteLength(data)}:{})}},res=>{
      let s='';res.on('data',c=>s+=c);res.on('end',()=>{
        let j=null;try{j=JSON.parse(s);}catch(e){}
        if(res.statusCode>=200&&res.statusCode<300) resolve(j);
        else reject(new Error(method+' '+p+' -> HTTP '+res.statusCode+' '+(j&&j.message||s.slice(0,200))));
      });
    });
    req.on('error',reject);
    if(data)req.write(data);
    req.end();
  });
}
(async()=>{
  const root=process.cwd();
  const localHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const parent=execFileSync('git',['rev-parse','HEAD^'],{encoding:'utf8'}).trim();
  const remote=await api('GET','/commits/main');
  console.log('local HEAD:',localHead);
  console.log('local parent:',parent);
  console.log('remote main:',remote.sha);
  // 允许用远端 SHA 作为 parent（本地与远端为同内容、不同 SHA 的平行提交时）
  const parentSha=process.env.PARENT_OVERRIDE||parent;
  console.log('using parent:',parentSha);
  if(remote.sha!==parentSha) throw new Error('remote main != parentSha; NOT safe to push (diverged)');
  // BASE_OVERRIDE：推送多个本地 commit 时，用基准提交算全部变更文件
  const base=process.env.BASE_OVERRIDE||'HEAD^';
  const files=execFileSync('git',['diff','--name-status',base,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  console.log('files since',base+':',files.length);
  const tree=[];
  for(const line of files){
    const [st,...rest]=line.split('\t');
    const fp=rest.join('\t');
    if(st==='D'){ tree.push({path:fp,mode:'100644',sha:null}); continue; }
    const full=path.join(root,fp);
    const content=fs.readFileSync(full);
    const b=await api('POST','/git/blobs',{content:content.toString('base64'),encoding:'base64'});
    tree.push({path:fp,mode:'100644',type:'blob',sha:b.sha});
    console.log('  blob',fp,b.sha.slice(0,8));
  }
  const parentCommit=await api('GET','/git/commits/'+parentSha);
  const newTree=await api('POST','/git/trees',{base_tree:parentCommit.tree.sha,tree:tree.filter(x=>x.sha)});
  const delEntries=tree.filter(x=>!x.sha);
  const finalTree=delEntries.length?await api('POST','/git/trees',{base_tree:newTree.sha,tree:delEntries.map(x=>({path:x.path,mode:'100644',sha:null}))}):newTree;
  const msg=process.env.MSG_OVERRIDE||execFileSync('git',['log','-1','--pretty=%B'],{encoding:'utf8'}).trim();
  const commit=await api('POST','/git/commits',{message:msg,tree:finalTree.sha,parents:[parentSha]});
  console.log('created commit:',commit.sha);
  await api('PATCH','/git/refs/heads/main',{sha:commit.sha,force:false});
  const check=await api('GET','/commits/main');
  console.log('remote main now:',check.sha);
  if(check.sha!==commit.sha) throw new Error('ref update mismatch');
  console.log('API PUSH SUCCESS');
})().catch(e=>{console.error('FAILED:',e.message);process.exit(1);});
