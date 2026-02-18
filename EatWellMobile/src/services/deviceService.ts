import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'device_id';

export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Basit bir UUID benzeri string oluşturma
      deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback ID if storage fails, to prevent app crash
    return 'fallback-device-id';
  }
};
