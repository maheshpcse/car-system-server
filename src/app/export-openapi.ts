import { writeFileSync } from 'node:fs';
import { openApiDocument } from './openapi.js';

writeFileSync('openapi.json', `${JSON.stringify(openApiDocument, null, 2)}\n`);
console.log('Wrote openapi.json');
