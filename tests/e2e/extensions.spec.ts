import { expect,test,type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { content } from '../../src/lib/contentRepository';
import { correctIds } from '../../src/lib/questions';
import { newStudySession,submitSessionItem,sessionAttempts } from '../../src/lib/studySession';
import { emptyStore } from '../../src/lib/storage';
import { diagramLesson } from '../../src/lib/diagramLesson';
import type { StudySession, ChoiceQuestion } from '../../src/content/types';
const key='ait624-study-progress';
const multi=content.questions.find(q=>q.type==='multiple-answer'&&q.correctChoiceIds.length===2)! as ChoiceQuestion;
const single=content.questions.find(q=>q.id==='mcq-expanded-03')! as ChoiceQuestion;
const written=content.questions.find(q=>q.type==='short-answer')!,caseItem=content.cases[0],diagram=content.diagrams[0];
const store=(page:Page)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),key);
async function seed(page:Page,session:StudySession,route:string){
  await page.goto('/');await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key,value:JSON.stringify({...emptyStore(),studySessions:[session]})});await page.goto(`${route}?session=${session.id}`);
}
async function confidence(page:Page){await page.getByRole('combobox',{name:'Confidence',exact:true}).selectOption('High');}

test('partial credit displays fractional points separately from exact accuracy and survives export/reload',async({page})=>{
  const session=newStudySession('multiple-choice',[multi,single],{autoAdvance:false},'partial-session');
  await seed(page,session,'/practice/multiple-choice');
  await page.locator(`.choice input[value="${correctIds(multi)[0]}"]`).check();await confidence(page);await page.getByRole('button',{name:'Submit answer'}).click();
  await expect(page.getByRole('heading',{name:'◐ Partially correct — 50% credit',exact:true})).toBeVisible();
  await expect(page.locator('.session-score')).toContainText('50% practice score');await expect(page.locator('.session-score')).toContainText('0% exact-answer accuracy');
  await expect(page.locator('.score-explanation')).toContainText('1/2 correct options selected minus 0/2');
  await page.reload();await expect(page.locator('.feedback-partial')).toBeVisible();expect((await store(page)).attempts[0]).toMatchObject({score:0.5,exactCorrect:false,scoringPolicy:'partial',scoringVersion:1});
  await page.getByRole('button',{name:'Next now'}).click();await page.locator('.choice input[value="a"]').check();await confidence(page);await page.getByRole('button',{name:'Submit answer'}).click();
  await expect(page.getByText('◐ Partial-credit option · selected',{exact:true})).toBeVisible();await expect(page.locator('.score-explanation')).toContainText('post-delivery maintenance');await expect(page.locator('.session-score')).toContainText('50% practice score');
  const issues=await new AxeBuilder({page}).analyze();expect(issues.violations.map(v=>({id:v.id,target:v.nodes.map(n=>n.target)}))).toEqual([]);
  await page.screenshot({path:'test-results/partial-credit-feedback.png',fullPage:true});
  await page.goto('/progress');const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export progress',exact:true}).click();expect((await download).suggestedFilename()).toBe('study-progress.json');
  await expect(page.getByText('Partial credit · not exactly correct',{exact:true}).first()).toBeVisible();
});

test('new sample exam config uses partial credit and immediate navigation',async({page})=>{
  await page.goto('/mock-midterm');for(const label of ['Multiple choice','Short answer','Cases','Diagrams'])await page.getByRole('combobox',{name:label,exact:true}).selectOption('1');
  await expect(page.getByRole('combobox',{name:'Multiple-choice scoring',exact:true})).toHaveValue('partial');await page.getByRole('button',{name:'Start mock midterm'}).click();
  await expect(page.getByRole('combobox',{name:'Exam advance timing',exact:true})).toHaveValue('immediate');
  await page.locator('.choice input').first().check();await confidence(page);await page.getByRole('button',{name:'Save exam response'}).click();
  await expect(page.locator('.session-heading')).toContainText('Question 2/4');expect((await store(page)).studySessions[0].index).toBe(1);await expect(page.locator('.question-heading')).toBeFocused();await expect(page.locator('.feedback')).toHaveCount(0);
});

test('immediate mock submission covers every format and withholds fractional points until final submission',async({page})=>{
  await seed(page,newStudySession('mock',[multi,written,caseItem,diagram],{},'four-format-mock'),'/mock-midterm');
  await page.locator(`.choice input[value="${correctIds(multi)[0]}"]`).check();await confidence(page);await page.getByRole('button',{name:'Save exam response'}).click();
  await expect(page.locator('.session-heading')).toContainText('Question 2/4');await page.reload();await expect(page.locator('.session-heading')).toContainText('Question 2/4');
  const pending=await store(page);expect(pending.studySessions[0].submissions[multi.id]).toMatchObject({score:null,exactCorrect:null});expect(pending.attempts).toHaveLength(0);
  await page.locator('textarea').fill('Programs and associated documentation, with maintenance after delivery.');await confidence(page);await page.getByRole('button',{name:'Save exam response'}).click();await expect(page.locator('.session-heading')).toContainText('Question 3/4');
  for(const field of await page.locator('textarea').all())await field.fill('Apply the course concepts and explain the scenario.');await confidence(page);await page.getByRole('button',{name:'Save exam response'}).click();await expect(page.locator('.session-heading')).toContainText('Question 4/4');await expect(page.locator('.diagram-editor .question-heading')).toBeFocused();
  const toolbar=page.locator('.diagram-toolbar').first();await toolbar.getByLabel('Node label',{exact:true}).fill('Appointment portal');await toolbar.getByRole('combobox',{name:'Node type',exact:true}).selectOption('system');await toolbar.getByRole('combobox',{name:'Boundary',exact:true}).selectOption('inside');await toolbar.getByRole('button',{name:'Add node',exact:true}).click();
  await confidence(page);await page.getByRole('button',{name:'Save exam diagram',exact:true}).click();
  await expect(page.locator('.session-heading')).toContainText('4/4 submitted');await expect(page.locator('.feedback')).toHaveCount(0);await expect(page.getByRole('heading',{name:'Correct diagram',exact:true})).toHaveCount(0);
  expect((await store(page)).studySessions[0].status).toBe('active');await page.reload();await expect(page.getByRole('button',{name:'Finish mock and reveal review',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Finish mock and reveal review',exact:true}).click();const finished=await store(page);expect(finished.studySessions[0].submissions[multi.id]).toMatchObject({score:0.5,exactCorrect:false});expect(finished.studySessions[0].status).toBe('completed');expect(finished.attempts.filter((a:{itemId:string})=>a.itemId===multi.id)).toHaveLength(1);
  await page.locator('.session-review').first().locator(':scope > summary').click();await expect(page.getByRole('heading',{name:'◐ Partially correct — 50% credit',exact:true})).toBeVisible();
});

test('failed immediate mock save preserves the current question and draft',async({page})=>{
  await seed(page,newStudySession('mock',[multi,written],{},'failed-mock'),'/mock-midterm');await page.locator(`.choice input[value="${correctIds(multi)[0]}"]`).check();await confidence(page);
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError');};});await page.getByRole('button',{name:'Save exam response'}).click();
  await expect(page.locator('.storage-alert')).toBeVisible();await expect(page.locator('.session-heading')).toContainText('Question 1/2');const saved=await store(page);expect(saved.studySessions[0].submissions).toEqual({});expect(saved.studySessions[0].drafts[multi.id].response).toEqual([correctIds(multi)[0]]);
});

test('v2 sessions retain their exact scores and countdown settings after migration',async({page})=>{
  const session=submitSessionItem(newStudySession('multiple-choice',[multi,single],{scoringPolicy:'exact',mockAdvance:'countdown',autoAdvance:false},'old-scoring'),multi.id,[correctIds(multi)[0]],'Low');
  const legacy=JSON.parse(JSON.stringify({...emptyStore(),studySessions:[session],attempts:sessionAttempts(session)}));legacy.version=2;delete legacy.studySessions[0].settings.scoringPolicy;delete legacy.studySessions[0].settings.scoringVersion;delete legacy.studySessions[0].settings.mockAdvance;delete legacy.studySessions[0].submissions[multi.id].exactCorrect;
  for(const attempt of legacy.attempts){delete attempt.scoringPolicy;delete attempt.scoringVersion;delete attempt.exactCorrect;}
  await page.goto('/');await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key,value:JSON.stringify(legacy)});await page.goto('/practice/multiple-choice?session=old-scoring');
  await expect(page.locator('.session-score')).toContainText('0% practice score');await expect(page.locator('.session-score')).toContainText('Exact answer only');
  await page.getByRole('button',{name:'Next now'}).click();expect((await store(page)).version).toBe(4);expect((await store(page)).attempts[0].score).toBe(0);expect(await page.evaluate(k=>localStorage.getItem(k+'-before-v3'),key)).toBe(JSON.stringify(legacy));
});

test('diagram lesson teaches ATM alternatives, airline relations, source differences and accessible checks',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/study');await page.getByRole('link',{name:'Explore the diagram lesson'}).click();await expect(page).toHaveURL(/\/study\/diagrams$/);
  await expect(page.getByRole('heading',{name:diagramLesson.title,exact:true})).toBeVisible();await page.getByRole('button',{name:'Next ATM step',exact:true}).click();await expect(page.locator('.lesson-step').first()).toContainText('Step 2/6: Verify the card');
  await page.getByRole('button',{name:'Card blocked',exact:true}).click();await expect(page.getByRole('button',{name:'Card blocked',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('img',{name:'ATM withdrawal sequence diagram'})).toContainText('Keep hold of the card');
  await page.getByRole('combobox',{name:'Explore airline use case',exact:true}).selectOption('pass');await expect(page.locator('.lesson-step').nth(1)).toContainText('TSA participates');await expect(page.locator('.lesson-source-note')).toContainText('handwritten instructor solution');
  const include=page.locator('.lesson-relation.include[data-from="checkin"][data-to="pass"] path');await expect(include).toHaveAttribute('marker-end',/-include/);await expect(include).toHaveAttribute('stroke-dasharray','8 6');
  const check=page.locator('.lesson-checks form').first();await expect(check.getByRole('button',{name:'Check answer'})).toBeDisabled();await check.getByRole('radio',{name:'Use-case diagram',exact:true}).check();await check.getByRole('button',{name:'Check answer'}).click();await expect(check.getByRole('status')).toContainText('Correct.');
  for(const title of ['ATM sequence','airline use-case'])await page.getByText(`View original ${title} class solution`,{exact:true}).click();
  for(const file of ['Sequence diagram class activity solution.pdf','Use Case Diagram class activity solution.pdf']){const response=await page.request.get('/sources/'+encodeURIComponent(file));expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('pdf');}
  const result=await new AxeBuilder({page}).analyze();expect(result.violations.map(v=>({id:v.id,target:v.nodes.map(n=>n.target)}))).toEqual([]);
  await page.locator('.lesson-diagram-scroll').first().screenshot({path:'test-results/atm-lesson-diagram.png'});await page.locator('.airline-diagram').screenshot({path:'test-results/airline-lesson-diagram.png'});await page.screenshot({path:'test-results/diagram-lesson-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.getByLabel('Enlarge airline diagram',{exact:true}).check();const scroll=page.locator('.airline-diagram');expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.getByLabel('Enlarge airline diagram',{exact:true}).uncheck();await page.screenshot({path:'test-results/diagram-lesson-mobile.png',fullPage:true});expect(errors).toEqual([]);
});

test('diagram lesson, original images, and opened activity PDFs remain usable offline',async({page,context})=>{
  await page.goto('/study/diagrams');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  const assets=['/lessons/atm-original.png','/lessons/airline-original.png',...['Sequence diagram class activity solution.pdf','Use Case Diagram class activity solution.pdf'].map(f=>'/sources/'+encodeURIComponent(f))];
  await page.evaluate(async urls=>{for(const url of urls){const response=await fetch(url);if(!response.ok)throw Error('Source missing');await response.arrayBuffer();}},assets);
  await context.setOffline(true);await page.goto('/study');await page.getByRole('link',{name:'Explore the diagram lesson'}).click();await expect(page.getByRole('heading',{name:diagramLesson.title,exact:true})).toBeVisible();await page.getByRole('button',{name:'Transaction rejected',exact:true}).click();await expect(page.getByRole('button',{name:'Transaction rejected',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(async urls=>Promise.all(urls.map(async url=>(await fetch(url)).ok)),assets)).toEqual([true,true,true,true]);await context.setOffline(false);
});
