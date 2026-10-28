import {readFileSync,writeFileSync} from 'node:fs';
// Only the project's original assessments are bundled. Linked publisher text stays external.
const data=JSON.parse(readFileSync('public/data/citation-review.json','utf8'));
writeFileSync('public/assets/citation-review-data.js','export const CITATION_REVIEW = '+JSON.stringify(data,null,2)+';\n');
console.log('Bundled '+data.records.length+' citation assessments');
