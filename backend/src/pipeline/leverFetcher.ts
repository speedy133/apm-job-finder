import axios from 'axios';
import { RawJob, upsertJobs } from './normalizer';

const LEVER_COMPANIES = ['netflix', 'figma'];

export const fetchLeverJobs = async () => {
  let totalSaved = 0;

  for (const company of LEVER_COMPANIES) {
    try {
      const response = await axios.get(`https://api.lever.co/v0/postings/${company}?mode=json`);
      const jobs = response.data;

      if (!jobs || jobs.length === 0) continue;

      const formattedJobs: RawJob[] = jobs.map((job: any) => {
        const locationStr = job.categories?.location || 'Not Specified';
        const isRemote = locationStr.toLowerCase().includes('remote') || false;
        
        return {
          id: `lv_${job.id}`,
          title: job.text || 'Unknown Title',
          company: company.charAt(0).toUpperCase() + company.slice(1),
          description: job.descriptionPlain || 'No description provided.',
          location: locationStr,
          remote_status: isRemote,
          url: job.hostedUrl,
          source: 'Lever',
          postedAt: new Date(job.createdAt || Date.now())
        };
      });

      const savedCount = await upsertJobs(formattedJobs);
      totalSaved += savedCount;
      console.log(`[Lever] Saved ${savedCount} PM jobs from ${company}`);
    } catch (error) {
      console.error(`[Lever] Failed to fetch from ${company}:`, error);
    }
  }

  return totalSaved;
};
