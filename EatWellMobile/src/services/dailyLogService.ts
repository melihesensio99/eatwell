import { API_CONFIG } from '../constants/api';
import httpService from './httpService';

export interface AddConsumptionRequest {
  deviceId: string;
  code: string;
  amount: number;
  date?: string;
}

export interface ConsumedItemDto {
  code: string;
  productName?: string;
  amount: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

export interface DailySummaryDto {
  date: string;
  totalCalorie: number;
  totalFat: number;
  totalProtein: number;
  totalCarb: number;
  consumedItems: ConsumedItemDto[];
}

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
}

export const dailyLogService = new DailyLogService();
export default dailyLogService;
