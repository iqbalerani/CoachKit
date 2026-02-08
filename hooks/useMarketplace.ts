import { useState, useCallback } from 'react';
import { MarketplaceCoach, Coach } from '../types';
import {
  browseMarketplace,
  publishCoach,
  marketplaceCoachToLocal,
  incrementDownloadCount,
} from '../services/marketplace';
import { useCoaches } from './useCoaches';

interface MarketplaceFilters {
  category: string;
  sort: 'downloads' | 'newest' | 'name';
  query: string;
}

export function useMarketplace() {
  const { addCoach } = useCoaches();
  const [coaches, setCoaches] = useState<MarketplaceCoach[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: 'All',
    sort: 'downloads',
    query: '',
  });

  const browse = useCallback(async (overrideFilters?: Partial<MarketplaceFilters>) => {
    setIsLoading(true);
    setError(null);
    const activeFilters = { ...filters, ...overrideFilters };

    try {
      const results = await browseMarketplace({
        category: activeFilters.category,
        sort: activeFilters.sort,
        query: activeFilters.query || undefined,
      });
      setCoaches(results);
    } catch (err: any) {
      setError(err.message);
      setCoaches([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const importCoach = useCallback(async (marketplaceCoach: MarketplaceCoach): Promise<Coach> => {
    const local = marketplaceCoachToLocal(marketplaceCoach);
    await addCoach(local);
    incrementDownloadCount(marketplaceCoach.notionPageId);
    return local;
  }, [addCoach]);

  const publish = useCallback(async (coach: Coach, authorName: string) => {
    return publishCoach(coach, authorName);
  }, []);

  return {
    coaches,
    isLoading,
    error,
    browse,
    publish,
    importCoach,
    filters,
    setFilters,
  };
}
