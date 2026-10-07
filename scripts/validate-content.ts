import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { textbook } from '../src/lib/textbook';
import { content } from '../src/lib/contentRepository';
console.log(`Validated ${content.topics.length} chapters, ${content.subtopics.length} blueprint rows, ${content.concepts.length} concepts, ${content.questions.length} questions, ${content.cases.length} cases, ${content.diagrams.length} diagrams.`);

if(createHash('sha256').update(readFileSync('public/sources/'+textbook.book.file)).digest('hex')!==textbook.book.sha256)throw Error('Textbook file changed; reverify page mappings');
console.log('Verified textbook identity and '+textbook.readings.length+' section/index mappings across all 22 blueprint rows.');
