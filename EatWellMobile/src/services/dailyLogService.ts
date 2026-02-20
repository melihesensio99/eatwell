import { API_CONFIG } from '../constants/api';
import httpService from './httpService';

import {
  AddConsumptionRequest,
  DailySummaryDto,
  CalorieGoalResponse,
  SetCalorieGoalRequest
} from '../types/dailyLog';


class DailyLogService {
  async addConsumption(deviceId: string, code: string, amount: number, date?: Date): Promise<void> {
    const payload: AddConsumptionRequest = {
      deviceId,
      code,
      amount,
      date: date ? date.toISOString() : undefined
    };
    return httpService.post(API_CONFIG.ENDPOINTS.DAILY_LOG_ADD || '/dailylog/add', payload);
  }

  async getDailySummary(deviceId: string, date?: Date): Promise<DailySummaryDto> {
    const url = `${API_CONFIG.ENDPOINTS.DAILY_LOG_SUMMARY || '/dailylog/summary'}/${deviceId}`;
    const params = date ? `?date=${date.toISOString()}` : '';
    return httpService.get<DailySummaryDto>(url + params);
  }

  async deleteConsumption(logId: number, deviceId: string): Promise<void> {
    const url = `${API_CONFIG.ENDPOINTS.DAILY_LOG_DELETE || '/dailylog'}/${logId}?deviceId=${deviceId}`;
    return httpService.delete(url);
  }

  async updateConsumption(logId: number, deviceId: string, amount: number): Promise<void> {
    const url = `${API_CONFIG.ENDPOINTS.DAILY_LOG_UPDATE || '/dailylog'}/${logId}?deviceId=${deviceId}`;
    return httpService.put(url, { amount });
  }
}

export const dailyLogService = new DailyLogService();



class CalorieGoalService {
  async getGoal(deviceId: string): Promise<{ hasGoal: boolean; goal?: CalorieGoalResponse }> {
    return httpService.get(`${API_CONFIG.ENDPOINTS.CALORIE_GOAL_GET}?deviceId=${deviceId}`);
  }

  async setGoal(deviceId: string, data: SetCalorieGoalRequest): Promise<{ message: string; goal: CalorieGoalResponse }> {
    return httpService.post(`${API_CONFIG.ENDPOINTS.CALORIE_GOAL_SET}?deviceId=${deviceId}`, data);
  }
}

export const calorieGoalService = new CalorieGoalService();
export default dailyLogService;
