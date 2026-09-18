import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const fallbackApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5248' : 'http://localhost:5248';
const apiBaseUrl = configuredApiUrl ?? fallbackApiUrl;

export const apiClient = axios.create({ baseURL: apiBaseUrl, timeout: 15000, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
apiClient.interceptors.request.use((config) => { const token = useAuthStore.getState().token; if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
apiClient.interceptors.response.use((response) => response, async (error) => { if (axios.isAxiosError(error) && error.response?.status === 401) await useAuthStore.getState().signOut(); return Promise.reject(error); });
export function getProblemDetail(error: unknown): string { if (axios.isAxiosError(error)) { const problem = error.response?.data as { detail?: string; title?: string } | undefined; if (error.response?.status === 429) return 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.'; return problem?.detail ?? problem?.title ?? 'Bir hata oluştu.'; } return 'Bir hata oluştu.'; }
