import useSWR from 'swr';

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  remote_status: boolean;
  url: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface JobsResponse {
  jobs: Job[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useJobs = (page: number, search: string, remote: boolean) => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...(search && { search }),
    ...(remote && { remote: 'true' })
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const { data, error, isLoading } = useSWR<JobsResponse>(
    `${API_URL}/api/jobs?${queryParams.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    data,
    isLoading,
    isError: error
  };
};
