import { z } from 'zod';
export const NoteKindSchema=z.enum(['text','heading','bullet']);
export const ReferenceDraftSchema=z.object({text:z.string().default(''),kind:NoteKindSchema.default('text'),noteId:z.string().nullable().default(null),suggestionKey:z.string().nullable().default(null)});
export const ReferenceNoteSchema=z.object({id:z.string().min(1),text:z.string().refine(value=>value.trim().length>0,'A note must contain text'),kind:NoteKindSchema,origin:z.enum(['personal','authored','edited']),conceptKey:z.string().optional(),topicIds:z.array(z.string()).default([]),sourceIds:z.array(z.string()).default([]),itemId:z.string().optional(),itemVersion:z.number().int().positive().optional(),responseIds:z.array(z.string()).default([]),updatedAt:z.string().datetime()});
export const ReferenceSheetSchema=z.object({ownerId:z.literal('local'),layoutVersion:z.literal(1),title:z.string(),notes:z.array(ReferenceNoteSchema).max(100),draft:ReferenceDraftSchema,revision:z.number().int().nonnegative(),updatedAt:z.string().datetime().nullable()});
export const SuggestionDecisionSchema=z.object({responseId:z.string().min(1),conceptKey:z.string().min(1),decision:z.enum(['added','dismissed']),updatedAt:z.string().datetime()});
export type ReferenceNote=z.infer<typeof ReferenceNoteSchema>;
export type ReferenceSheet=z.infer<typeof ReferenceSheetSchema>;
export type ReferenceDraft=z.infer<typeof ReferenceDraftSchema>;
export type SuggestionDecision=z.infer<typeof SuggestionDecisionSchema>;
export const emptyReferenceSheet=():ReferenceSheet=>({ownerId:'local',layoutVersion:1,title:'',notes:[],draft:ReferenceDraftSchema.parse({}),revision:0,updatedAt:null});
export const SHEET_FONT='StudySheet';
export const SHEET_FONT_CSS='14pt "StudySheet"';
// The same physical layout is used for off-screen measurement, preview, and print.
export function renderSheetContent(container:HTMLElement,sheet:Pick<ReferenceSheet,'title'|'notes'>){
  container.className='reference-content';container.replaceChildren();
  if(sheet.title.trim()){const title=document.createElement('div');title.className='reference-block reference-heading';title.textContent=sheet.title;container.append(title);}
  for(const note of sheet.notes){const block=document.createElement('div');block.className=`reference-block reference-${note.kind}`;block.textContent=note.kind==='bullet'?'• '+note.text:note.text;container.append(block);}
}
export function measureReferenceSheet(sheet:Pick<ReferenceSheet,'title'|'notes'>){
  if(typeof document==='undefined'||!document.fonts.check(SHEET_FONT_CSS))throw new Error('The sheet font must load before capacity can be checked.');
  const container=document.createElement('div');renderSheetContent(container,sheet);
  Object.assign(container.style,{position:'fixed',left:'-10000px',top:'0',visibility:'hidden',height:'auto',minHeight:'0',maxHeight:'none'});
  document.body.append(container);
  try{
    const bounds=container.getBoundingClientRect(),height=bounds.height,width=bounds.width;
    const heightLimit=960; // 10 printable inches at 96 CSS px/in.
    const fit=height<=heightLimit+0.25&&container.scrollWidth<=width+1;
    return {fit,height,heightLimit,usedPercent:Math.min(100,height/heightLimit*100),remaining:Math.max(0,heightLimit-height)};
  }finally{container.remove();}
}
export async function loadSheetFont(){
  const fonts=await document.fonts.load(SHEET_FONT_CSS);
  if(!fonts.length||!document.fonts.check(SHEET_FONT_CSS))throw new Error('The fixed sheet font could not load. Reconnect once to cache it, then try again.');
}
export function revisedSheet(sheet:ReferenceSheet,patch:Partial<Pick<ReferenceSheet,'title'|'notes'|'draft'>>):ReferenceSheet{
  return ReferenceSheetSchema.parse({...sheet,...patch,revision:sheet.revision+1,updatedAt:new Date().toISOString()});
}
