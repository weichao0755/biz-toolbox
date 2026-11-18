// 测试：报关离岸价口径 = 国内采购成本 + 合理利润（不再对应平台销售额）
// 验证方式：源码级文案断言（这些文案分布在 roadmap/大纲/talk/FAQ 各分支，构造全部客户状态成本高且易偏；源码清零+新口径存在即覆盖）
const fs = require('fs');
const src = fs.readFileSync('public/tools/cross/index.html', 'utf8');
let pass = true;
function check(name, cond){ if(!cond){ console.log('FAIL:', name); pass=false; } else console.log('ok  :', name); }

var OLD = [
  '金额应与平台销售额一致','金额跟平台销售额对得上','金额和销售额对得上','不得按成本填报',
  '报关金额按成本填是最大的坑','照着平台销售额填，别按成本填','报关凭证金额 = 平台销售额',
  '单价一般填平台货物的平均销售额','报关单金额跟销售额对得上','清单金额应与平台销售额一致',
  '核对'+String.fromCharCode(39)+'_cd'+String.fromCharCode(39)+'+_cd+', // placeholder, skip below
  '金额与销售额接近'
];
OLD = OLD.filter(function(s){ return s.indexOf('placeholder')<0 && s.indexOf("_cd")<0; });
OLD.forEach(function(s){ check('旧口径清零: '+s.slice(0,16), src.indexOf(s)<0); });

// 新口径必须出现在这些关键文案块
var NEW = [
  ['大纲说明', '报关单 / 报关清单的离岸价（FOB）按国内采购成本加合理利润申报'],
  ['9810 roadmap acts', '离岸价按国内采购成本加合理利润申报，与实际采购成本、SKU、数量相匹配'],
  ['9610 roadmap acts', '报关清单出具后，逐票核对：离岸价按国内采购成本加合理利润申报'],
  ['roadmap done', '拿到自己抬头的报关单，离岸价按成本加利润申报、与采购成本对得上'],
  ['roadmap watch', '报关金额要按国内成本加合理利润填，不是照平台销售额填'],
  ['s6 前置', 's6:{pre:\'已经有一票用该模式成功报关，且报关离岸价按国内采购成本加合理利润申报\''],
  ['9810 talk 单价', '单价按国内采购成本加合理利润来填，跟货代说清楚是 FOB 出口估价'],
  ['话术 s3', '报关单上的离岸价得按国内采购成本加合理利润来填'],
  ['话术 s5(9610)', '报关离岸价按国内采购成本加合理利润填，别照平台零售销售额填'],
  ['话术 s6 深圳', '深圳的 13 栏可以直接填免税，但前提是报关离岸价按国内成本加合理利润申报'],
  ['FAQ 单价怎么填', '应按国内采购成本加合理利润（FOB 离岸价口径）来填'],
  ['FAQ 免税保证', '报关单的出口离岸价按国内采购成本加合理利润申报'],
  ['FAQ 买单混合风险', '报关按国内成本加合理利润如实申报、与实际采购成本匹配即可']
];
NEW.forEach(function(pair){ check('新口径存在: '+pair[0], src.indexOf(pair[1])>=0); });

// 整体密度：成本加合理利润 至少 10 处（覆盖 FAQ/话术/roadmap/大纲）
check('新口径覆盖密度 >=10', (src.split('成本加合理利润').length-1)>=10);

console.log(pass?'\nALL FOB PRICING CHECKS PASSED':'\nSOME CHECKS FAILED');
process.exit(pass?0:1);
