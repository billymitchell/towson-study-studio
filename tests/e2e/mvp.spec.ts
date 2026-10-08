import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { content } from '../../src/lib/contentRepository';
const key='ait624-study-progress';
const store=(page:Page)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{"attempts":[],"diagrams":[],"sessions":[]}'),key);
async function addNode(page:Page,label:string,kind:string,inside:boolean){
  const toolbar=page.locator('.diagram-toolbar').first();
  await toolbar.getByLabel('Node label',{exact:true}).fill(label);
  await toolbar.getByRole('combobox',{name:'Node type',exact:true}).selectOption(kind);
  await toolbar.getByRole('combobox',{name:'Boundary',exact:true}).selectOption(inside?'inside':'outside');
  await toolbar.getByRole('button',{name:'Add node',exact:true}).click();
}
async function addConnection(page:Page,from:string,to:string,label:string,relation:string){
  const controls=page.locator('.graph-controls');
  const nodes=await controls.getByRole('combobox',{name:'From',exact:true}).locator('option').evaluateAll(options=>options.map(o=>({value:(o as HTMLOptionElement).value,text:o.textContent})));
  await controls.getByRole('combobox',{name:'From',exact:true}).selectOption(nodes.find(n=>n.text===from)!.value);
  await controls.getByRole('combobox',{name:'To',exact:true}).selectOption(nodes.find(n=>n.text===to)!.value);
  await controls.getByRole('combobox',{name:'Relationship',exact:true}).selectOption(relation);
  await controls.getByLabel('Connection label',{exact:true}).fill(label);
  await controls.getByRole('button',{name:'Add connection',exact:true}).click();
}
test('course scope, source PDFs, required confidence, fixed queue and reload recovery',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByRole('heading',{name:'A little progress, every session.'})).toBeVisible();
  await page.goto('/blueprint');await expect(page.locator('.concept-panel')).toHaveCount(22);
  await page.goto('/study?topic=requirements');await expect(page.locator('.concept-panel')).toHaveCount(6);
  await page.locator('.concept-panel').first().locator('summary').first().click();
  await page.locator('.concept-panel').first().locator('.sources summary').click();
  const href=await page.getByRole('link',{name:'Lecture 4 · p. 6 (L4-P6)'}).getAttribute('href');expect(href).toContain('#page=6');
  const pdf=await page.request.get(href!.split('#')[0]);expect(pdf.status()).toBe(200);expect(pdf.headers()['content-type']).toContain('pdf');
  await page.goto('/practice/multiple-choice');await expect(page.locator('.practice-card')).toBeVisible();
  await page.getByRole('checkbox',{name:'Auto-advance after recording'}).uncheck();
  const original=(await store(page)).studySessions[0];expect(original.items).toHaveLength(20);
  const first=original.items[0];await page.getByRole('radio').nth((first.answer+1)%4).check();
  await expect(page.getByRole('button',{name:'Submit answer'})).toBeDisabled();expect((await store(page)).attempts).toHaveLength(0);
  await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('Low');
  await page.reload();await expect(page.getByRole('radio').nth((first.answer+1)%4)).toBeChecked();await expect(page.getByRole('combobox',{name:'Confidence',exact:true})).toHaveValue('Low');
  await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.getByRole('heading',{name:'✕ Incorrect — review this one',exact:true})).toBeVisible();
  await expect(page.locator('.session-score')).toContainText('0% practice score');await expect(page.locator('.session-heading')).toContainText('1/20 submitted');
  await expect(page.locator('.feedback')).toHaveClass(/feedback-incorrect/);await expect(page.getByRole('combobox',{name:'Confidence',exact:true})).toHaveCount(0);
  await page.reload();expect((await store(page)).attempts).toHaveLength(1);expect((await store(page)).studySessions[0].items.map((q:{id:string})=>q.id)).toEqual(original.items.map((q:{id:string})=>q.id));
  await page.getByRole('button',{name:'Next now'}).click();await expect(page.locator('.session-heading')).toContainText('Question 2/20');
  const second=original.items[1];await page.getByRole('radio').nth(second.answer).check();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.getByRole('button',{name:'Submit answer'}).click();
  await expect(page.getByRole('heading',{name:'✓ Correct',exact:true})).toBeVisible();await expect(page.locator('.session-score')).toContainText('50% practice score');
  await page.goto('/progress');await expect(page.getByText('2 topic attempts',{exact:true})).toBeVisible();await page.getByRole('link',{name:'Resume session'}).click();await expect(page.locator('.session-heading')).toContainText('Question 2/20');expect(errors).toEqual([]);
});
test('select-all exact-set feedback, cancelable auto-advance and persisted settings',async({page})=>{
  await page.goto('/practice/multiple-choice');await expect(page.locator('.practice-card')).toBeVisible();
  await page.locator('.session-config>summary').click();await page.getByRole('combobox',{name:'Question style',exact:true}).selectOption('multiple');await page.getByRole('combobox',{name:'Session length',exact:true}).selectOption('5');await page.getByRole('button',{name:'Start new study session',exact:true}).click();
  const session=(await store(page)).studySessions.at(-1);expect(session.items.every((q:{type:string})=>q.type==='multiple-answer')).toBe(true);
  for(const input of await page.locator('.choice input').all())await input.check();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.getByRole('button',{name:'Submit answer'}).click();await page.getByRole('button',{name:'Stay and review',exact:true}).click();
  await page.waitForTimeout(3400);await expect(page.locator('.session-heading')).toContainText('Question 1/5');await expect(page.getByText('✕ Incorrect option · selected',{exact:true}).first()).toBeVisible();
  const result=await new AxeBuilder({page}).analyze();expect(result.violations.map(v=>v.id)).toEqual([]);
  await page.getByRole('button',{name:'Next now'}).click();const q=session.items[1];for(const id of q.correctChoiceIds)await page.locator('.choice input[value="'+id+'"]').check();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('Medium');await page.getByRole('button',{name:'Submit answer'}).click();
  await expect(page.getByRole('heading',{name:'✓ Correct',exact:true})).toBeVisible();await expect(page.locator('.session-heading')).toContainText('Question 3/5',{timeout:7000});
  await page.getByRole('checkbox',{name:'Auto-advance after recording'}).uncheck();await page.getByRole('spinbutton',{name:'Practice target (%)'}).fill('80');await page.reload();await expect(page.getByRole('checkbox',{name:'Auto-advance after recording'})).not.toBeChecked();await expect(page.getByRole('spinbutton',{name:'Practice target (%)'})).toHaveValue('80');expect((await store(page)).attempts).toHaveLength(2);
  await page.screenshot({path:'test-results/session-select-all.png',fullPage:true});
});
test('written and case drafts, confidence, checklist and pending scores survive reloads',async({page})=>{
  await page.goto('/practice/short-answer');await page.getByRole('checkbox',{name:'Auto-advance after recording'}).uncheck();
  await expect(page.getByRole('heading',{name:'Model response'})).toHaveCount(0);
  const answer='Software includes programs and documentation. Engineering covers the production and maintenance lifecycle.';
  await page.getByLabel('Your response',{exact:true}).fill(answer);await expect(page.getByRole('button',{name:'Submit answer'})).toBeDisabled();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('Medium');await page.reload();await expect(page.locator('textarea')).toHaveValue(answer);
  await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.getByRole('heading',{name:'Model response'})).toBeVisible();await expect(page.locator('.session-score')).toContainText('— practice score');
  await page.locator('.rubric-list input').first().check();await page.getByRole('combobox',{name:'Self-check score',exact:true}).selectOption('2');await page.reload();await expect(page.locator('.rubric-list input').first()).toBeChecked();await expect(page.getByRole('combobox',{name:'Self-check score',exact:true})).toHaveValue('2');
  await page.getByRole('button',{name:'Record self-check score'}).click();expect((await store(page)).attempts[0].score).toBeCloseTo(2/3);await expect(page.locator('.session-score')).toContainText('67% practice score');
  await page.goto('/practice/cases');await page.getByRole('checkbox',{name:'Auto-advance after recording'}).uncheck();
  for(const [i,textarea] of (await page.locator('textarea').all()).entries())await textarea.fill('Original case reasoning '+i);await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.reload();await expect(page.locator('textarea').first()).toHaveValue('Original case reasoning 0');
  await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.getByRole('heading',{name:'Common mistakes',exact:true})).toBeVisible();await page.getByRole('combobox',{name:'Self-check score',exact:true}).selectOption('3');await page.getByRole('button',{name:'Record self-check score'}).click();expect((await store(page)).attempts).toHaveLength(3);await expect(page.locator('.session-score')).toContainText('1/1 fully correct scored items');
});
test('diagram add, rename, move, delete, connect, save, reload, and semantic feedback',async({page})=>{
  await page.goto('/practice/diagrams');
  await addNode(page,'Portal','system',true);await addNode(page,'Patient','actor',false);await addNode(page,'Identity service','external',false);await addNode(page,'Notification service','external',false);
  await addNode(page,'Temporary','external',false);await page.getByRole('button',{name:'Delete node',exact:true}).click();
  await addConnection(page,'Patient','Portal','uses','context');await addConnection(page,'Identity service','Portal','authenticates','context');await addConnection(page,'Notification service','Portal','sends confirmations','context');
  await page.getByRole('button',{name:'Save diagram',exact:true}).click();await expect(page.getByText('Diagram saved on this browser.',{exact:true})).toBeVisible();
  await page.reload();await expect(page.locator('.semantic-node')).toHaveCount(4);await expect(page.locator('.connection-list li')).toHaveCount(3);
  const controls=page.locator('.graph-controls');await controls.getByRole('combobox',{name:'Edit node',exact:true}).selectOption({label:'Portal'});await controls.getByLabel('Rename node',{exact:true}).fill('Appointment portal');await controls.getByRole('button',{name:'Move node →',exact:true}).click();
  await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.getByRole('button',{name:'Submit for semantic feedback',exact:true}).click();await expect(page.getByRole('heading',{name:'Semantic score: 100%',exact:true})).toBeVisible();expect((await store(page)).attempts).toHaveLength(1);await expect(page.getByRole('combobox',{name:'Confidence',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Reset canvas',exact:true}).click();await expect(page.locator('.semantic-node')).toHaveCount(0);
  await page.getByRole('combobox',{name:'Exercise',exact:true}).selectOption('diagram-booking');const d=content.diagrams.find(d=>d.id==='diagram-booking')!;
  for(const n of d.requiredElements)await addNode(page,n.label,n.kind,n.inside);
  for(const e of d.requiredConnections)await addConnection(page,d.requiredElements.find(n=>n.id===e.source)!.label,d.requiredElements.find(n=>n.id===e.target)!.label,e.label,e.relation);
  await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.getByRole('button',{name:'Submit for semantic feedback',exact:true}).click();await expect(page.getByRole('heading',{name:'Semantic score: 100%',exact:true})).toBeVisible();
  await page.locator('.diagram-canvas').screenshot({path:'test-results/use-case-workspace.png'});
});
test('corrupt storage is preserved, invalid imports rejected, export and intentional reset work',async({page})=>{
  await page.goto('/');await page.evaluate(k=>localStorage.setItem(k,'corrupt backup'),key);await page.reload();
  await expect(page.locator('.storage-alert')).toContainText('Writing is paused');await page.goto('/progress');
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export raw backup',exact:true}).click();expect((await download).suggestedFilename()).toBe('study-progress-raw-backup.json');
  page.on('dialog',d=>d.accept());await page.getByLabel('Import backup',{exact:true}).setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":9}')});await expect(page.getByRole('status').filter({hasText:'Import rejected'})).toBeVisible();expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe('corrupt backup');
  await page.getByRole('button',{name:'Clear personal data',exact:true}).click();await page.getByRole('button',{name:'Confirm clear',exact:true}).click();await expect(page.locator('.storage-alert')).toHaveCount(0);expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
});
test('mock resumes all four formats and reveals solutions only after final submission',async({page})=>{
  await page.goto('/mock-midterm');for(const label of ['Multiple choice','Short answer','Cases','Diagrams'])await page.getByRole('combobox',{name:label,exact:true}).selectOption('1');
  await page.getByRole('button',{name:'Start mock midterm'}).click();await page.getByRole('checkbox',{name:'Auto-advance after recording'}).uncheck();
  const original=(await store(page)).studySessions[0];await page.locator('.choice input').first().check();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.getByRole('button',{name:'Save exam response',exact:false}).click();await expect(page.locator('.feedback')).toHaveCount(0);expect((await store(page)).attempts).toHaveLength(0);
  await page.getByRole('button',{name:'Next now'}).click();await page.locator('textarea').fill('A source-grounded written response for this practice item.');await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('Low');await page.reload();await expect(page.locator('textarea')).toHaveValue('A source-grounded written response for this practice item.');expect((await store(page)).studySessions[0].items.map((q:{id:string})=>q.id)).toEqual(original.items.map((q:{id:string})=>q.id));
  await page.getByRole('button',{name:'Save exam response',exact:false}).click();await expect(page.getByRole('heading',{name:'Model response'})).toHaveCount(0);await page.getByRole('button',{name:'Next now'}).click();
  for(const textarea of await page.locator('textarea').all())await textarea.fill('Explain the problem, apply relevant concepts, and justify the proposed solution.');await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('Medium');await page.getByRole('button',{name:'Save exam response',exact:false}).click();await page.getByRole('button',{name:'Next now'}).click();
  const title=await page.locator('.diagram-editor h2').textContent(),d=content.diagrams.find(d=>d.title===title)!;
  for(const n of d.requiredElements)await addNode(page,n.label,n.kind,n.inside);
  for(const e of d.requiredConnections)await addConnection(page,d.requiredElements.find(n=>n.id===e.source)!.label,d.requiredElements.find(n=>n.id===e.target)!.label,e.label,e.relation);
  await page.reload();await expect(page.locator('.semantic-node')).toHaveCount(d.requiredElements.length);await expect(page.locator('.connection-list li')).toHaveCount(d.requiredConnections.length);
  await expect(page.getByRole('button',{name:'Save exam diagram',exact:true})).toBeDisabled();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.getByRole('button',{name:'Save exam diagram',exact:true}).click();await expect(page.locator('.feedback')).toHaveCount(0);await expect(page.getByRole('heading',{name:'Correct diagram',exact:true})).toHaveCount(0);expect((await store(page)).attempts).toHaveLength(0);
  await page.getByRole('button',{name:'Finish mock and reveal review',exact:true}).click();await expect(page.getByRole('heading',{name:'Mock complete · review your work',exact:true})).toBeVisible();expect((await store(page)).sessions).toHaveLength(1);
  for(const details of await page.locator('.session-review').all())if(!(await details.getAttribute('open')!==null))await details.locator(':scope > summary').click();
  await expect(page.getByRole('heading',{name:'Model response'})).toHaveCount(2);await expect(page.getByRole('heading',{name:'Semantic score: 100%',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Correct diagram',exact:true})).toBeVisible();
  const result=await new AxeBuilder({page}).analyze();expect(result.violations.map(v=>({id:v.id,target:v.nodes.map(n=>n.target)}))).toEqual([]);
  const scores=page.getByRole('combobox',{name:'Self-check score',exact:true});for(const select of await scores.all())await select.selectOption('3');while(await page.getByRole('button',{name:'Record self-check score',exact:true}).count())await page.getByRole('button',{name:'Record self-check score',exact:true}).first().click();
  const attempts=(await store(page)).attempts;expect(attempts.length).toBeGreaterThanOrEqual(4);expect(new Set(attempts.map((a:{id:string})=>a.id)).size).toBe(attempts.length);
  await page.goto('/progress');await page.getByRole('link',{name:'Review session'}).click();await expect(page.getByRole('heading',{name:'Mock complete · review your work',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Score recorded',exact:true}).first()).toBeVisible();
});
for(const route of ['/','/blueprint','/study','/practice/multiple-choice','/practice/short-answer','/practice/cases','/practice/diagrams','/mock-midterm','/progress']){
  test(`accessibility smoke check: ${route}`,async({page})=>{
    await page.goto(route);await expect(page.getByRole('heading',{level:1})).toBeVisible();
    const result=await new AxeBuilder({page}).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  });
}
test('desktop and mobile layout',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.getByRole('heading',{name:'A little progress, every session.'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'test-results/mobile-overview.png',fullPage:true});await page.goto('/practice/multiple-choice');await expect(page.locator('.practice-card')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'test-results/mobile-study-session.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.reload();await expect(page.locator('.app-shell')).toHaveCount(1);await page.screenshot({path:'test-results/desktop-overview.png'});
});
test('cached production app remains navigable and usable offline',async({page,context})=>{
  await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:30000}).toBe(true);
  await context.setOffline(true);await page.getByRole('link',{name:'03 Study guide'}).click();await expect(page.getByRole('heading',{name:'Understand the course.'})).toBeVisible();
  await page.getByRole('link',{name:'04 Multiple choice'}).click();await page.getByRole('radio').first().check();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('Medium');await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.locator('.feedback')).toBeVisible();expect((await store(page)).attempts).toHaveLength(1);await context.setOffline(false);
});
test('v1 migration preserves old attempts and a successfully retried missed queue stays fixed',async({page})=>{
  await page.goto('/progress');const q=content.questions.find(q=>q.id==='mcq-1')!;
  const legacy={version:1,attempts:[{id:'old-attempt',itemId:q.id,topicId:q.topicId,itemType:q.type,response:1,score:0,confidence:'Low',completedAt:'2026-10-05T12:00:00.000Z',sourceIds:q.sourceIds}],diagrams:[],sessions:[]};
  await page.evaluate(({key,legacy})=>localStorage.setItem(key,JSON.stringify(legacy)),{key,legacy});await page.reload();await expect(page.getByText('1 topic attempts',{exact:true})).toBeVisible();
  await page.goto('/practice/multiple-choice');await expect(page.locator('.practice-card')).toBeVisible();expect(await page.evaluate(k=>localStorage.getItem(k+'-before-v2'),key)).toBe(JSON.stringify(legacy));
  await page.locator('.session-config>summary').click();await page.getByRole('combobox',{name:'Queue',exact:true}).selectOption('missed');await page.getByRole('button',{name:'Start new study session',exact:true}).click();await page.getByRole('checkbox',{name:'Auto-advance after recording'}).uncheck();
  expect((await store(page)).studySessions.at(-1).items.map((i:{id:string})=>i.id)).toEqual(['mcq-1']);
  if(q.type!=='multiple-choice')throw Error();await page.getByRole('radio').nth(q.answer).check();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('Medium');await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.getByRole('heading',{name:'✓ Correct',exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'✓ Correct',exact:true})).toBeVisible();expect((await store(page)).attempts).toHaveLength(2);await page.getByRole('button',{name:'Finish study session',exact:true}).click();await expect(page.getByRole('heading',{name:'Study session complete',exact:true})).toBeVisible();
});
test('failed storage write preserves the draft and prevents feedback and auto-advance',async({page})=>{
  await page.goto('/practice/multiple-choice');await expect(page.locator('.practice-card')).toBeVisible();await page.getByRole('radio').first().check();await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');
  const before=await page.evaluate(k=>localStorage.getItem(k),key);
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Storage full','QuotaExceededError');};});
  await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.locator('.storage-alert')).toContainText('could not be saved');await expect(page.locator('.feedback')).toHaveCount(0);await page.waitForTimeout(3400);await expect(page.locator('.session-heading')).toContainText('Question 1/20');expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(before);
  await page.reload();await expect(page.locator('.storage-alert')).toHaveCount(0);await expect(page.getByRole('radio').first()).toBeChecked();await expect(page.getByRole('combobox',{name:'Confidence',exact:true})).toHaveValue('High');
});
test('a valid backup recovers corrupt storage without forcing a reset',async({page})=>{
  await page.goto('/progress');await page.evaluate(k=>localStorage.setItem(k,'corrupt'),key);await page.reload();await expect(page.locator('.storage-alert')).toBeVisible();page.on('dialog',d=>d.accept());
  await page.getByLabel('Import backup',{exact:true}).setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,attempts:[],diagrams:[],sessions:[]}))});await expect(page.locator('.storage-alert')).toHaveCount(0);await expect(page.getByRole('status').filter({hasText:'Backup imported.'})).toBeVisible();expect((await store(page)).version).toBe(4);
});
test('confidence and acronym explanations are visible to learners',async({page})=>{
  await page.goto('/study?topic=agile');await page.getByText('Acronym reference',{exact:true}).click();await expect(page.locator('.glossary')).toContainText('Extreme Programming');
  const xp=page.locator('.concept-panel').filter({has:page.locator('summary').filter({hasText:'Extreme Programming and test-first development'})}).first();await xp.locator('summary').first().click();await expect(xp).toContainText('XP (Extreme Programming)');
  await page.goto('/practice/multiple-choice');await expect(page.getByText('How sure are you before seeing the answer? This guides what to review next and never changes your score.',{exact:true})).toBeVisible();
});
test('Towson colors and helpful notes work with hover, keyboard, dismissal and touch',async({page,browser})=>{
  await page.goto('/');expect(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(21, 21, 0)');expect(await page.locator('.brand-mark').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(255, 187, 0)');
  await page.screenshot({path:'test-results/towson-overview.png'});await page.goto('/practice/multiple-choice');await expect(page.locator('.practice-card')).toBeVisible();
  const help=page.getByRole('button',{name:'Help: Confidence',exact:true});await help.focus();await expect(page.getByRole('tooltip')).toContainText('Confidence never changes correctness');await help.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.locator('.question-heading').click();await help.hover();await expect(page.getByRole('tooltip')).toBeVisible();await page.getByRole('tooltip').hover();await expect(page.getByRole('tooltip')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.getByRole('button',{name:'Help: Practice accuracy',exact:true}).click();await expect(page.getByRole('tooltip')).toContainText('denominator');const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.map(v=>v.id)).toEqual([]);await page.locator('.question-heading').click();await expect(page.getByRole('tooltip')).toHaveCount(0);
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),touch=await mobile.newPage();await touch.goto('http://127.0.0.1:3000/practice/multiple-choice');await touch.getByRole('button',{name:'Help: Confidence',exact:true}).tap();await expect(touch.getByRole('tooltip')).toBeVisible();const bounds=await touch.getByRole('tooltip').boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(390);await touch.getByRole('button',{name:'Help: Confidence',exact:true}).tap();await expect(touch.getByRole('tooltip')).toHaveCount(0);await mobile.close();
});
test('textbook chapter, section, printed/PDF pages and subject index links resolve',async({page,context})=>{
  await page.goto('/study?topic=requirements');const panel=page.locator('.concept-panel').filter({has:page.locator('summary').filter({hasText:'Use-case template and notation'})}).first();await panel.locator('summary').first().click();const reading=panel.locator('.further-reading');await expect(reading).toContainText('§ 4.4.3');await expect(reading).toContainText('printed pp. 125–126');await expect(reading).toContainText('PDF pp. 126–127');
  const link=reading.getByRole('link').first(),href=await link.getAttribute('href');expect(href).toContain('#page=126');const pdf=await page.request.get(href!.split('#')[0]);expect(pdf.ok()).toBe(true);expect(pdf.headers()['content-type']).toContain('pdf');const index=await reading.getByRole('link',{name:/Index: use cases/}).first().getAttribute('href');expect(index).toContain('#page=801');
  await page.goto('/practice/multiple-choice?subtopic=xp');await expect(page.locator('.practice-card .further-reading')).toContainText('§ 3.2');await expect(page.locator('.practice-card .further-reading')).toContainText('80–81');await page.getByRole('button',{name:'Help: Textbook page links',exact:true}).click();await expect(page.getByRole('tooltip')).toContainText('Printed page numbers and PDF viewer page numbers differ');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  // Fetch through the page so the worker caches this local PDF, then verify it offline.
  await page.evaluate(async url=>{const response=await fetch(url);if(!response.ok)throw Error('PDF unavailable');await response.arrayBuffer();},href!.split('#')[0]);await context.setOffline(true);expect(await page.evaluate(async url=>(await fetch(url)).ok,href!.split('#')[0])).toBe(true);await context.setOffline(false);
});
test('diagram comparison reveals the authored key, highlights mistakes and preserves learner work',async({page})=>{
  await page.setViewportSize({width:1600,height:1000});await page.goto('/practice/diagrams');await page.getByRole('combobox',{name:'Exercise',exact:true}).selectOption('diagram-booking');const d=content.diagrams.find(d=>d.id==='diagram-booking')!;
  await expect(page.getByRole('heading',{name:'Correct diagram',exact:true})).toHaveCount(0);
  for(const n of d.requiredElements)await addNode(page,n.label,n.kind,n.id==='patient'?true:n.inside);
  for(const e of d.requiredConnections)await addConnection(page,d.requiredElements.find(n=>n.id===(e.relation==='include'?e.target:e.source))!.label,d.requiredElements.find(n=>n.id===(e.relation==='include'?e.source:e.target))!.label,e.label,e.relation);
  const include=page.locator('.react-flow__edge').filter({has:page.locator('.react-flow__edge-text').filter({hasText:'«include»'})});await expect(include.locator('.react-flow__edge-path')).toHaveAttribute('marker-end',/-open/);
  await page.getByRole('button',{name:'Save diagram',exact:true}).click();const saved=(await store(page)).diagrams[0].graph;await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');await page.getByRole('button',{name:'Submit for semantic feedback',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Your submitted diagram',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Correct diagram',exact:true})).toBeVisible();await expect(page.locator('.diagram-difference').filter({hasText:'Move outside'})).toBeVisible();await expect(page.locator('.diagram-difference').filter({hasText:'Point toward Check availability'})).toBeVisible();expect((await store(page)).diagrams[0].graph).toEqual(saved);expect((await store(page)).attempts[0].response).toEqual(saved);
  const ids=await page.locator('marker[id]').evaluateAll(markers=>markers.map(m=>m.id));expect(new Set(ids).size).toBe(ids.length);const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  await page.getByRole('heading',{name:'Compare with the correct diagram',exact:true}).click();await page.locator('.diagram-comparison').screenshot({path:'test-results/diagram-solution-comparison.png'});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.getByRole('heading',{name:'Compare with the correct diagram',exact:true}).click();await page.locator('.diagram-comparison').screenshot({path:'test-results/mobile-diagram-comparison.png'});const preview=page.locator('.diagram-comparison .diagram-preview-scroll').first();expect(await preview.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.getByRole('button',{name:'Enlarge diagram: Your submitted diagram',exact:true}).click();expect(await preview.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);await page.getByRole('button',{name:'Fit diagram: Your submitted diagram',exact:true}).click();
  await page.getByRole('button',{name:'Reverse connection include',exact:true}).click();await expect(page.getByRole('heading',{name:'Correct diagram',exact:true})).toHaveCount(0);expect((await store(page)).attempts[0].response).toEqual(saved);
});
test('canvas renders hollow generalization and open extension arrows with readable direction cues',async({page})=>{
  await page.goto('/practice/diagrams');await page.getByRole('combobox',{name:'Exercise',exact:true}).selectOption('diagram-booking');await addNode(page,'Special case','usecase',true);await addNode(page,'General case','usecase',true);await addConnection(page,'Special case','General case','generalization','generalization');
  const general=page.locator('.react-flow__edge').filter({has:page.locator('.react-flow__edge-text').filter({hasText:'generalization'})});await expect(general.locator('.react-flow__edge-path')).toHaveAttribute('marker-end',/-triangle/);const marker=(await general.locator('.react-flow__edge-path').getAttribute('marker-end'))!.slice(5,-1);await expect(page.locator('[id="'+marker+'"] path')).toHaveAttribute('fill','var(--tu-white)');await expect(page.locator('.relationship-hint')).toContainText('Special case → General case');
  await addConnection(page,'Special case','General case','extend','extend');const extend=page.locator('.react-flow__edge').filter({has:page.locator('.react-flow__edge-text').filter({hasText:'«extend»'})});await expect(extend.locator('.react-flow__edge-path')).toHaveAttribute('marker-end',/-open/);await expect(page.locator('.relationship-hint')).toContainText('toward the base');
});
