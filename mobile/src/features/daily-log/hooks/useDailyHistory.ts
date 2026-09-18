import { useQuery } from '@tanstack/react-query';
import { dailyLogService } from '../api/dailyLog.service';
export function useDailyHistory(fromDate: string, toDate: string) { return useQuery({ queryKey: ['daily-log-history', fromDate, toDate], queryFn: () => dailyLogService.getHistory(fromDate, toDate), staleTime: 30_000 }); }
