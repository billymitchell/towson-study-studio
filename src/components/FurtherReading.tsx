import type { StudyItem } from '@/content/types';
import { textbook, readingHref, readingsForItem, readingsForSubtopics } from '@/lib/textbook';
import { HelpTip } from './HelpTip';
export function FurtherReading({item,subtopicIds,headingLevel=3}:{item?:StudyItem;subtopicIds?:string[];headingLevel?:3|4}){
  const Heading=headingLevel===4?'h4':'h3';
  const readings=item?readingsForItem(item):readingsForSubtopics(subtopicIds??[]);if(!readings.length)return null;
  return <div className="further-reading" role="group" aria-label="Textbook further reading"><div className="reading-heading"><Heading>Read more in the textbook</Heading><HelpTip label="Textbook page links">Links open the local {textbook.book.edition}. Printed page numbers and PDF viewer page numbers differ; each link uses the verified PDF page. Index links open the matching subject-index entry. Lectures remain the authority for exam scope.</HelpTip></div><p>{textbook.book.author} · {textbook.book.title} · {textbook.book.edition}</p><ul>{readings.map(r=><li key={r.id}><a href={readingHref(r)} target="_blank" rel="noreferrer">{r.title} · {r.section==='Chapter introduction'?'chapter introduction':'§ '+r.section} · printed pp. {r.printedStart}{r.printedEnd!==r.printedStart?'–'+r.printedEnd:''}</a><span className="reading-location">Ch. {r.chapter} · PDF pp. {r.pdfStart}–{r.pdfEnd}</span><a className="index-link" href={readingHref(r,true)} target="_blank" rel="noreferrer">Index: {r.indexTerm} · printed p. {r.indexPrintedPage}</a>{r.note&&<small>{r.note}</small>}</li>)}</ul></div>;
}
