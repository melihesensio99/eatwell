import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { API_CONFIG } from '../constants/api';
import { getDeviceId } from '../services/deviceService';

interface Props {
  navigation: any;
  route: any;
}

const ImageScannerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleAnalyzeImage = async (base64: string, uri: string) => {
    setImageUri(uri);
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      // API call to the backend
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/FoodAnalysis/analyze-image`,
        { base64Image: base64, deviceId: deviceId },
        { timeout: 60000 } // it can take a while for LLM to process
      );

      const data = response.data;
      if (data && data.productName !== "HATA OLUŞTU") {
        navigation.replace('Analysis', { 
          analysisData: data, 
          localImageUri: uri,
          ...(route.params || {}) 
        });
      } else {
        Alert.alert('Analiz Hatası', data?.aiAnalysis || 'Görsel analiz edilemedi.');
        setImageUri(null);
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert('Hata', 'Görsel analiz edilirken bir hata oluştu: ' + error.message);
      setImageUri(null);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Galeriye erişim izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      handleAnalyzeImage(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Kamera erişim izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      handleAnalyzeImage(result.assets[0].base64, result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, padding: 0 }]}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
        )}
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>
            Yapay Zeka Analiz Ediyor...
          </Text>
          <Text style={styles.loadingSubText}>
            Lütfen bekleyin, bu işlem birkaç saniye sürebilir.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Görsel Tara</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Yemeğinizin veya barkodlu bir ürünün fotoğrafını çekerek yapay zeka ile analiz edin.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={takePhoto}
        >
          <Text style={styles.buttonIcon}>📸</Text>
          <Text style={styles.buttonText}>Kamera ile Çek</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.galleryButton, { borderColor: colors.primary }]}
          onPress={pickImage}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={[styles.buttonText, { color: colors.primary }]}>Galeriden Seç</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backText, { color: colors.textMuted }]}>← Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  galleryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  backButton: {
    padding: Spacing.md,
  },
  backText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: Spacing.xl,
  },
  loadingText: {
    color: '#FFF',
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  loadingSubText: {
    color: '#EEE',
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});

export default ImageScannerScreen;
