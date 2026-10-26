import test from 'node:test';
import assert from 'node:assert/strict';
import {statusForResponse} from '../public/assets/translation-status.js';

test('translation indicators turn green on success and red for all identified reading failures',()=>{
 for(const status of [200,201,204])assert.equal(statusForResponse(status),'available');
 for(const status of [400,401,403,404,429,500,502,503])assert.equal(statusForResponse(status),'unavailable');
});
