
import { API_CONFIG } from '../constants/api';
import httpService from './httpService';
import { ProductAnalysis, FoodCalorieInfo } from '../types';

class ProductService {
 
  async getProductAnalysis(barcode: string, deviceId?: string): Promise<ProductAnalysis> {
    const url = deviceId 
      ? `${API_CONFIG.ENDPOINTS.ANALYSIS}/${barcode}?deviceId=${deviceId}`
      : `${API_CONFIG.ENDPOINTS.ANALYSIS}/${barcode}`;
      
    return httpService.get<ProductAnalysis>(url);
  }

  async getCalorieInfo(barcode: string): Promise<FoodCalorieInfo> {
    return httpService.get<FoodCalorieInfo>(
      `${API_CONFIG.ENDPOINTS.CALORIE}/${barcode}`
    );
  }
}

export const productService = new ProductService();
export default productService;
