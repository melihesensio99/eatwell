import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../api/analytics.service';
export function useWeeklySummary(weekStart: string) { return useQuery({ queryKey: ['weekly-summary', weekStart], queryFn: () => analyticsService.getWeeklySummary(weekStart), staleTime: 5 * 60_000 }); }
