import { selectNextTopics } from './src/lib/marketing/autonomous-selector.ts';
const result = await selectNextTopics(2);
console.log(JSON.stringify(result, null, 2));
