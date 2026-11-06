// node juno-styleframes/shoot.js [frame,...]  -> juno-styleframes/out/{theme}_{frame}.png
const { chromium } = require('playwright'); const path=require('path'); const fs=require('fs');
const all=['fs1','ss1','fs2','ss2','fs3','ss3','fs4','ss4','lt','end'];
const want=process.argv[2]?process.argv[2].split(','):all;
(async()=>{
  const b=await chromium.launch({args:['--allow-file-access-from-files']}); const p=await b.newPage({viewport:{width:1080,height:1920}});
  const out=path.join(__dirname,'out'); fs.mkdirSync(out,{recursive:true});
  for(const theme of ['dark','light']) for(const f of want){
    await p.goto('file://'+path.join(__dirname,'frames.html')+`?theme=${theme}&frame=${f}`);
    await p.waitForSelector('body[data-ready]'); await p.waitForTimeout(250);
    await p.screenshot({path:path.join(out,`${theme}_${f}.png`)}); process.stdout.write(`${theme}_${f} `);
  }
  await b.close();
})();
