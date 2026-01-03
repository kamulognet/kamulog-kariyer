import { generateSampleJobs } from './src/lib/job-scraper';

const jobs = generateSampleJobs(6);
console.log(JSON.stringify(jobs.map(j => ({ title: j.title, source: j.sourceUrl })), null, 2));
