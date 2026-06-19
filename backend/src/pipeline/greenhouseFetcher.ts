import axios from 'axios';
import { RawJob, upsertJobs } from './normalizer';

const GREENHOUSE_COMPANIES = ['stripe', 'discord', 'openai'];

export const fetchGreenhouseJobs = async () => {
  let totalSaved = 0;

  for (const company of GREENHOUSE_COMPANIES) {
    try {
      const response = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`);
      const jobs = response.data.jobs;

      if (!jobs || jobs.length === 0) continue;

      const formattedJobs: RawJob[] = jobs.map((job: any) => {
        const isRemote = job.location?.name?.toLowerCase().includes('remote') || false;
        
        return {
          id: `gh_${job.id}`,
          title: job.title || 'Unknown Title',
          company: company.charAt(0).toUpperCase() + company.slice(1),
          description: job.content || 'No description provided.',
          location: job.location?.name || 'Not Specified',
          remote_status: isRemote,
          url: job.absolute_url,
          source: 'Greenhouse',
          postedAt: new Date(job.updated_at || Date.now())
        };
      });

      const savedCount = await upsertJobs(formattedJobs);
      totalSaved += savedCount;
      console.log(`[Greenhouse] Saved ${savedCount} PM jobs from ${company}`);
    } catch (error) {
      console.error(`[Greenhouse] Failed to fetch from ${company}:`, error);
    }
  }

  return totalSaved;
};
