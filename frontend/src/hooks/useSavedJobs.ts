import useSWR from 'swr';
import { useAuth } from '@clerk/nextjs';
import { Job } from './useJobs';

export const useSavedJobs = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetcher = async (url: string) => {
    const token = await getToken();
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch saved jobs');
    return res.json();
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const { data, error, mutate, isLoading } = useSWR<{ savedJobs: Job[] }>(
    isLoaded && isSignedIn ? `${API_URL}/api/saved` : null,
    fetcher
  );

  const toggleSave = async (jobId: string) => {
    const token = await getToken();
    
    // Optimistic update
    const previousData = data;
    const isCurrentlySaved = data?.savedJobs.some(j => j.id === jobId);
    
    mutate(
      (currentData: { savedJobs: Job[] } | undefined) => {
        if (!currentData) return { savedJobs: [] };
        if (isCurrentlySaved) {
          return { savedJobs: currentData.savedJobs.filter((j: Job) => j.id !== jobId) };
        } else {
          // We don't have the full job object here easily to add optimistic, so we just refetch
          return currentData; 
        }
      },
      false // don't revalidate immediately
    );

    try {
      const res = await fetch(`${API_URL}/api/saved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      });

      if (!res.ok) throw new Error('Failed to toggle save');
      
      // Revalidate after actual server response
      mutate();
      
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      mutate(previousData, true);
    }
  };

  return {
    savedJobs: data?.savedJobs || [],
    isLoading,
    isError: error,
    toggleSave,
    mutate
  };
};
