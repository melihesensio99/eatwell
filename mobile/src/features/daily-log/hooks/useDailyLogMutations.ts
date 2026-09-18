import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyLogService, AddDailyLogItemRequest } from '../api/dailyLog.service';

export function useAddDailyLogItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (request: AddDailyLogItemRequest) => dailyLogService.addItem(request), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['daily-log-summary', date] }); queryClient.invalidateQueries({ queryKey: ['daily-log', date] }); queryClient.invalidateQueries({ queryKey: ['daily-log-history'] }); queryClient.invalidateQueries({ queryKey: ['weekly-summary'] }); } });
}

export function useAddWater(date: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (milliliters: number) => dailyLogService.addWater(milliliters, date), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['daily-log-summary', date] }); queryClient.invalidateQueries({ queryKey: ['daily-log', date] }); queryClient.invalidateQueries({ queryKey: ['daily-log-history'] }); queryClient.invalidateQueries({ queryKey: ['weekly-summary'] }); } });
}
