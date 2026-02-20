import { API_CONFIG } from '../constants/api';
import httpService from './httpService';

export interface AllergenDto {
  key: string;
  name: string;
  emoji: string;
}

export interface SetUserAllergensDto {
  deviceId: string;
  allergenKeys: string[];
}

class UserAllergenService {
  async getAllAllergens(): Promise<AllergenDto[]> {
    return await httpService.get<AllergenDto[]>(API_CONFIG.ENDPOINTS.ALLERGENS_GET_ALL);
  }

  async getUserAllergens(deviceId: string): Promise<string[]> {
    return await httpService.get<string[]>(`${API_CONFIG.ENDPOINTS.ALLERGENS_GET_USER}/${deviceId}`);
  }

  async setUserAllergens(deviceId: string, allergenKeys: string[]): Promise<void> {
    const data: SetUserAllergensDto = { deviceId, allergenKeys };
    await httpService.post(API_CONFIG.ENDPOINTS.ALLERGENS_SET_USER, data);
  }
}

export const userAllergenService = new UserAllergenService();
export default userAllergenService;
