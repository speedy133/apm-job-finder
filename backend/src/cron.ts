import dotenv from 'dotenv';
dotenv.config();
import cron from 'node-cron';
import { fetchGreenhouseJobs } from './pipeline/greenhouseFetcher';
import { fetchLeverJobs } from './pipeline/leverFetcher';
import { fetchRapidApiJobs } from './pipeline/rapidApiFetcher';
import { upsertJobs } from './pipeline/normalizer';

const GREENHOUSE_COMPANIES = ['stripe', 'discord', 'airbnb', 'twitch'];
const LEVER_COMPANIES = ['netflix', 'figma', 'canva'];

let isRunning = false;

export const runPipeline = async () => {
  if (isRunning) {
    console.log('[Pipeline] Skip: Already running.');
    return;
  }

  isRunning = true;
  console.log('[Pipeline] Starting manual/scheduled run...');
  try {
    const greenhouseCount = await fetchGreenhouseJobs();
    const leverCount = await fetchLeverJobs();

    // Fetch from RapidAPI (LinkedIn, Indeed, etc.)
    const rapidApiJobs = await fetchRapidApiJobs();
    console.log(`[Pipeline] Fetched total ${rapidApiJobs.length} jobs from RapidAPI. Normalizing and storing...`);
    const rapidApiCount = await upsertJobs(rapidApiJobs);
    
    console.log(`[Pipeline] Finished! Total PM Jobs added/updated: ${greenhouseCount + leverCount + rapidApiCount}`);
  } catch (error) {
    console.error('[Pipeline] Error running pipeline:', error);
  } finally {
    isRunning = false;
  }
};

// Schedule to run every 6 hours
export const startCron = () => {
  console.log('Job aggregation cron initialized. Runs every 6 hours.');
  cron.schedule('0 */6 * * *', async () => {
    await runPipeline();
  });
};

// If run directly via CLI (e.g., npx ts-node src/cron.ts)
if (require.main === module) {
  runPipeline().then(() => {
    console.log('Manual pipeline execution finished.');
    process.exit(0);
  });
}
