const { chromium } = require('playwright'); const path=require('path');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});
await p.goto('file://'+path.join(__dirname,'motion.html'));await p.waitForSelector('body[data-ready]');await p.waitForTimeout(200);
await p.screenshot({path:path.join(__dirname,'out','00_motion_spec.png')});await b.close();})();
