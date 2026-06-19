import axios from 'axios';
import { RawJob } from './normalizer';
import dotenv from 'dotenv';

dotenv.config();

const RAPID_API_KEY = process.env.RAPID_API_KEY;

export const fetchRapidApiJobs = async (): Promise<RawJob[]> => {
  if (!RAPID_API_KEY) {
    console.warn('No RAPID_API_KEY provided. Skipping RapidAPI JSearch integration.');
    return [];
  }

  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: 'Product Manager in India',
      page: '1',
      num_pages: '1',
      date_posted: 'month'
    },
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    const jobsData = response.data.data;

    if (!Array.isArray(jobsData)) return [];

    return jobsData.map((job: any) => {
      // JSearch returns an ISO datetime for posted_at, or a string
      const postedAt = job.job_posted_at_datetime_utc 
        ? new Date(job.job_posted_at_datetime_utc) 
        : new Date();

      return {
        id: `jsearch_${job.job_id}`,
        title: job.job_title || 'Unknown Title',
        company: job.employer_name || 'Unknown Company',
        description: job.job_description || 'No description provided.',
        location: `${job.job_city || ''}, ${job.job_state || ''}, ${job.job_country || ''}`.replace(/^[,\s]+|[,\s]+$/g, ''),
        remote_status: job.job_is_remote === true,
        url: job.job_apply_link || job.job_google_link || '',
        source: job.job_publisher || 'JSearch',
        postedAt: postedAt
      };
    });
  } catch (error) {
    console.error(`Error fetching RapidAPI jobs:`, error);
    return [];
  }
};
