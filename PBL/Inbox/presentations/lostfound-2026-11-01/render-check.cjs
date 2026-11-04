const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/ADVAN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 await page.goto('file:///'+path.join(__dirname,'lostfound-canva.html').replace(/\\/g,'/'));
 await page.evaluate(()=>document.fonts.ready);
 const dir=path.join(__dirname,'render');fs.mkdirSync(dir,{recursive:true});
 const result=await page.evaluate(()=>[...document.querySelectorAll('section')].map((s,i)=>({slide:i+1,text:[...s.querySelectorAll('.txt')].map(t=>({text:t.innerText,x:t.offsetLeft,y:t.offsetTop,w:t.offsetWidth,h:t.offsetHeight,size:parseFloat(getComputedStyle(t).fontSize)})),outside:[...s.querySelectorAll('.txt')].filter(t=>t.offsetLeft+t.offsetWidth>1920||t.offsetTop+t.offsetHeight>1080).map(t=>t.innerText)})));
 for(let i=0;i<12;i++)await page.locator('section').nth(i).screenshot({path:path.join(dir,`slide-${i+1}.png`)});
 fs.writeFileSync(path.join(__dirname,'layout-check.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({font:await page.evaluate(()=>document.fonts.check('30px "DM Sans"')),overflow:result.filter(s=>s.outside.length)}));
 await browser.close();
})();
