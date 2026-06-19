import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RawJob {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  remote_status: boolean;
  url: string;
  source: string;
  postedAt: Date;
}

export const isProductRole = (title: string): boolean => {
  const lowercaseTitle = title.toLowerCase();
  const hasPMKeyword = 
    lowercaseTitle.includes('product manager') || 
    lowercaseTitle.includes('pm') || 
    lowercaseTitle.includes('product analyst') ||
    lowercaseTitle.includes('associate product manager') ||
    lowercaseTitle.includes('apm');

  const isFalsePositive = 
    lowercaseTitle.includes('designer') ||
    lowercaseTitle.includes('marketing') ||
    lowercaseTitle.includes('engineer') ||
    lowercaseTitle.includes('sales');

  return hasPMKeyword && !isFalsePositive;
};

export const isIndiaLocation = (location: string): boolean => {
  const loc = location.toLowerCase();
  return loc.includes('india') || loc.includes('bengaluru') || loc.includes('bangalore') || 
         loc.includes('mumbai') || loc.includes('delhi') || loc.includes('pune') || 
         loc.includes('hyderabad') || loc.includes('gurgaon') || loc.includes('noida') || loc.includes('chennai');
};

export const isRecent = (postedAt: Date): boolean => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return postedAt >= thirtyDaysAgo;
};

export const upsertJobs = async (jobs: RawJob[]) => {
  let count = 0;
  for (const job of jobs) {
    if (isProductRole(job.title) && isIndiaLocation(job.location) && isRecent(job.postedAt)) {
      await prisma.job.upsert({
        where: { id: job.id },
        update: {
          title: job.title,
          description: job.description,
          location: job.location,
          remote_status: job.remote_status,
          url: job.url,
          updatedAt: new Date()
        },
        create: {
          id: job.id,
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          remote_status: job.remote_status,
          url: job.url,
          source: job.source,
          createdAt: job.postedAt
        }
      });
      count++;
    }
  }
  return count;
};
