import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/types/document';
import { apiClient } from '@/services/apiClient';

export function useSearchState() {
  const queryClient = useQueryClient();

  const { data: searchState = { results: [], query: '', performed: false }, isLoading } = useQuery({
    queryKey: ['searchState'],
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const searchMutation = useMutation({
    mutationFn: async ({ query, isHybrid }: { query: string; isHybrid: boolean }) => {
      const results = await apiClient.searchDocuments(query, isHybrid);
      return { results, query, performed: true };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['searchState'], data);
    },
  });

  return {
    searchResults: searchState.results as Document[],
    searchQuery: searchState.query as string,
    searchPerformed: searchState.performed as boolean,
    isSearching: searchMutation.isPending,
    executeSearch: searchMutation.mutate,
    clearSearch: () => queryClient.setQueryData(['searchState'], { results: [], query: '', performed: false }),
  };
}
