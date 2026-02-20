

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.104:5126',
  
  ENDPOINTS: {
    ANALYSIS: '/api/FoodAnalysis',
    CALORIE: '/api/FoodCalorie',
    DAILY_LOG_ADD: '/api/DailyLog/add',
    DAILY_LOG_SUMMARY: '/api/DailyLog/summary',
    DAILY_LOG_DELETE: '/api/DailyLog',
    DAILY_LOG_UPDATE: '/api/DailyLog',
    CALORIE_GOAL_GET: '/api/CalorieGoal',

    CALORIE_GOAL_SET: '/api/CalorieGoal',
    ALLERGENS_GET_ALL: '/api/UserAllergen/all',
    ALLERGENS_GET_USER: '/api/UserAllergen',
    ALLERGENS_SET_USER: '/api/UserAllergen/set',
    PRODUCT_SEARCH: '/api/ProductSearch',
  },

  TIMEOUT: 15000,
};
