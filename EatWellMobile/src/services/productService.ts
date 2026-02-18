
import { API_CONFIG } from '../constants/api';
import httpService from './httpService';
import { ProductAnalysis, FoodCalorieInfo } from '../types';

class ProductService {
 
  async getProductAnalysis(barcode: string): Promise<ProductAnalysis> {
    return httpService.get<ProductAnalysis>(
      `${API_CONFIG.ENDPOINTS.ANALYSIS}/${barcode}`
    );
  }

  async getCalorieInfo(barcode: string): Promise<FoodCalorieInfo> {
    return httpService.get<FoodCalorieInfo>(
      `${API_CONFIG.ENDPOINTS.CALORIE}/${barcode}`
    );
  }
}

export const productService = new ProductService();
export default productService;
