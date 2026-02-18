import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants/api';

class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[HTTP] Request Error:', error);
        return Promise.reject(error);
      }
    );
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error(`[HTTP] Response Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
          console.error('[HTTP] Network Error — Sunucuya ulaşılamadı');
        } else {
          console.error('[HTTP] Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
  setBaseUrl(url: string): void {
    this.client.defaults.baseURL = url;
  }
}

export const httpService = new HttpService();
export default httpService;
