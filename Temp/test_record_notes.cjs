// 测试：录音纪要工具 —— 默认混合音源 + 共享音频引导（解决只录到自己声音）
const fs=require('fs');
let pass=true;function ck(n,c){if(!c){console.log('FAIL:',n);pass=false;}else console.log('ok  :',n);}
const h=fs.readFileSync('public/tools/record-notes/index.html','utf8');
ck('default source = mixed',h.indexOf('data-src="mixed" active')>=0||/data-src="mixed"><span class="so-radio"><\/span><b>系统声音 \+ 麦克风<\/b><small>[^<]*<\/small><\/button>/.test(h)&&h.indexOf('class="source-opt" data-src="mic"')>=0);
ck('startRecording defaults to mixed',h.indexOf("startRecording(window._recSource||'mixed')")>=0);
ck('share guide modal exists',h.indexOf('id="shareGuideMask"')>=0&&h.indexOf('录对方声音 · 一步不能漏')>=0);
ck('guide stresses Share audio',h.indexOf('分享音频 / Share audio')>=0&&h.indexOf('勾选')>=0);
ck('guide functions',h.indexOf('function showShareGuide')>=0&&h.indexOf('function proceedShare')>=0&&h.indexOf('function closeShareGuide')>=0);
ck('mixed first-run gate',h.indexOf("if(source==='mixed' && !window._shareGuideDone)")>=0);
ck('no-audio-track hint improved',h.indexOf('没有捕获到对方的声音')>=0&&h.indexOf('漏勾了')>=0);
ck('mic warn updated',h.indexOf('仅麦克风只能录到你自己的声音')>=0);
const ss=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let bad=0;ss.forEach((s,i)=>{try{new Function(s)}catch(e){bad++;console.log('JS FAIL',i,e.message)}});
ck('inline JS syntax',bad===0);
console.log(pass?'\nALL RECORD-NOTES CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
