import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nutritionGoalsService, CalculateNutritionGoalRequest, ManualNutritionGoalRequest } from '../api/nutritionGoals.service';

export function useNutritionGoal() { return useQuery({ queryKey: ['nutrition-goal'], queryFn: nutritionGoalsService.get, staleTime: 60_000 }); }
export function useSetNutritionGoal() { const client = useQueryClient(); return useMutation({ mutationFn: (request: ManualNutritionGoalRequest) => nutritionGoalsService.setManual(request), onSuccess: () => client.invalidateQueries({ queryKey: ['nutrition-goal'] }) }); }
export function useCalculateNutritionGoal() { const client = useQueryClient(); return useMutation({ mutationFn: (request: CalculateNutritionGoalRequest) => nutritionGoalsService.calculateWithAi(request), onSuccess: (data) => client.setQueryData(['nutrition-goal-calculation'], data) }); }
