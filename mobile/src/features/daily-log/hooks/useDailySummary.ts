import { useQuery } from '@tanstack/react-query';
import { dailyLogService } from '../api/dailyLog.service';
export function useDailySummary(date: string) { return useQuery({ queryKey: ['daily-log-summary', date], queryFn: () => dailyLogService.getSummary(date), staleTime: 30_000 }); }
