import { useQuery } from '@tanstack/react-query';
import { foodsService } from '../api/foods.service';
export function useFoodSearch(query: string) { return useQuery({ queryKey: ['food-search', query], queryFn: () => foodsService.search(query), enabled: query.trim().length >= 2, staleTime: 5 * 60_000 }); }
