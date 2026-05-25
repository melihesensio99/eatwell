import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';
import { userAllergenService, AllergenDto } from '../services/userAllergenService';
import { getDeviceId } from '../services/deviceService';

interface Props {
  navigation: any;
}

const AllergenSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allAllergens, setAllAllergens] = useState<AllergenDto[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const deviceId = await getDeviceId();
      const [allData, userData] = await Promise.all([
        userAllergenService.getAllAllergens(),
        userAllergenService.getUserAllergens(deviceId),
      ]);
      setAllAllergens(allData);
      setSelectedKeys(userData);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Alerjen bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter(k => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const handleSave = async () => {
    console.log('[AllergenSettings] Kaydet butonuna basıldı. Seçili anahtarlar:', selectedKeys);
    setErrorMessage(null);
    try {
      setSaving(true);
      const deviceId = await getDeviceId();
      console.log('[AllergenSettings] DeviceId alındı:', deviceId);
      
      await userAllergenService.setUserAllergens(deviceId, selectedKeys);
      console.log('[AllergenSettings] Kayıt başarılı.');

      const message = 'Alerjen tercihleriniz başarıyla kaydedildi.';
      if (Platform.OS === 'web') {
        window.alert(message);
        navigation.goBack();
      } else {
        Alert.alert('Başarılı', message, [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('[AllergenSettings] Kaydetme hatası:', error);
      const errorText = error.response?.data?.message || 'Kaydedilemedi. Lütfen bağlantınızı kontrol edin.';
      setErrorMessage(errorText);
      
      if (Platform.OS === 'web') {
        window.alert('Hata: ' + errorText);
      } else {
        Alert.alert('Hata', errorText);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Aşağıdaki listeden alerjiniz olan veya kaçınmak istediğiniz besin gruplarını seçin.
          Ürün analizlerinde bu maddeler tespit edilirse sizi uyaracağız.
        </Text>

        <View style={styles.grid}>
          {allAllergens.map((allergen) => {
            const isSelected = selectedKeys.includes(allergen.key);
            return (
              <TouchableOpacity
                key={allergen.key}
                style={[
                  styles.card,
                  { 
                    backgroundColor: isSelected ? colors.primary + '20' : colors.backgroundCard,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => toggleAllergen(allergen.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{allergen.emoji}</Text>
                <Text style={[
                  styles.name, 
                  { 
                    color: isSelected ? colors.primary : colors.textPrimary,
                    fontWeight: isSelected ? '700' : '500'
                  }
                ]}>
                  {allergen.name}
                </Text>
                {isSelected && (
                  <View style={[styles.checkIcon, { backgroundColor: colors.primary }]}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1, marginTop: Spacing.xl }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
             <ActivityIndicator color="#FFF" />
          ) : (
             <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>

        {errorMessage && (
          <Text style={{ color: '#ff4d6a', marginTop: Spacing.sm, textAlign: 'center', fontWeight: '600' }}>
            {errorMessage}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  description: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%', // roughly 2 columns
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  emoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});

export default AllergenSettingsScreen;
