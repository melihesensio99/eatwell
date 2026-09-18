import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from '../../../theme';
import { foodsService } from '../../foods/api/foods.service';
import { useFavoriteFood } from '../../foods/hooks/useFavoriteFood';
import { useAddDailyLogItem } from '../../daily-log/hooks/useDailyLogMutations';
import { MealType } from '../../daily-log/types';
import { getLocalDateString } from '../../../utils/date';

interface ScanScreenProps { readonly navigation: any; }
type Result = { readonly name: string; readonly externalId: string; readonly barcode?: string | null; readonly calories?: number | null; readonly protein?: number | null; readonly carbs?: number | null; readonly fat?: number | null; readonly imageUrl?: string | null; readonly details?: string; readonly advice?: string[]; readonly allergens?: string[]; };

export function ScanScreen({ navigation }: ScanScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [meal, setMeal] = useState<MealType>('Ara Öğün');
  const [grams, setGrams] = useState('100');
  const date = useMemo(() => getLocalDateString(), []);
  const addItem = useAddDailyLogItem(date);
  const favorite = useFavoriteFood();

  const scanBarcode = async (barcode: string) => {
    if (busy) return;
    setBusy(true); setCameraOpen(false);
    try {
      const food = await foodsService.getByBarcode(barcode);
      if (!food) throw new Error('Ürün bulunamadı.');
      setResult({ name: food.name, externalId: food.externalId, barcode: food.barcode ?? barcode, calories: food.caloriesPer100Grams, protein: food.proteinPer100Grams, carbs: food.carbohydratesPer100Grams, fat: food.fatPer100Grams, imageUrl: food.imageUrl, details: `Nutri-Score: ${food.nutriScore ?? 'bilinmiyor'} · NOVA: ${food.novaGroup ?? 'bilinmiyor'}`, allergens: food.matchedUserAllergens ?? [] });
    } catch (error) { Alert.alert('Ürün alınamadı', error instanceof Error ? error.message : 'Barkod servisine ulaşılamadı.'); }
    finally { setBusy(false); }
  };

  const openBarcode = async () => {
    if (!permission?.granted) { const response = await requestPermission(); if (!response.granted) { Alert.alert('Kamera izni gerekli', 'Barkod taramak için kamera izni vermelisiniz.'); return; } }
    setResult(null); setCameraOpen(true);
  };

  const pickAndAnalyze = async () => {
    const response = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.8 });
    if (response.canceled || !response.assets[0].base64) return;
    setBusy(true);
    try {
      const asset = response.assets[0];
      const analysis = await foodsService.analyzeImage({ imageBase64: asset.base64!, mimeType: asset.mimeType ?? 'image/jpeg' });
      setResult({ name: analysis.productName, externalId: `ai-${Date.now()}`, calories: analysis.caloriesPer100Grams, protein: analysis.proteinPer100Grams, carbs: analysis.carbohydratesPer100Grams, fat: analysis.fatPer100Grams, imageUrl: asset.uri, details: analysis.analysis, advice: analysis.healthAdvice, allergens: analysis.allergens ?? [] });
    } catch (error) { Alert.alert('Fotoğraf analiz edilemedi', error instanceof Error ? error.message : 'AI servisine ulaşılamadı.'); }
    finally { setBusy(false); }
  };

  const addToToday = async () => {
    if (!result) return;
    const quantity = Number(grams.replace(',', '.'));
    if (!Number.isFinite(quantity) || quantity <= 0) { Alert.alert('Gramaj gerekli', 'Geçerli bir gramaj girin.'); return; }
    setBusy(true);
    try {
      await addItem.mutateAsync({ foodExternalId: result.externalId, foodName: result.name, quantityGrams: quantity, mealType: meal, logDate: date, caloriesPer100Grams: result.calories ?? null, proteinPer100Grams: result.protein ?? null, carbohydratesPer100Grams: result.carbs ?? null, fatPer100Grams: result.fat ?? null, barcode: result.barcode ?? null });
      Alert.alert('Eklendi', `${result.name} bugünkü ${meal} öğününe eklendi.`, [{ text: 'Tamam', onPress: () => navigation.navigate('Bugün') }]);
    } catch (error) { Alert.alert('Eklenemedi', error instanceof Error ? error.message : 'DailyLog kaydı oluşturulamadı.'); }
    finally { setBusy(false); }
  };

  if (cameraOpen) return <View style={styles.cameraPage}><CameraView style={StyleSheet.absoluteFill} facing="back" onBarcodeScanned={({ data }) => void scanBarcode(data)} barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }} /><View style={styles.cameraOverlay}><Text style={styles.cameraTitle}>Barkodu çerçeveye alın</Text><View style={styles.scanFrame} /><Pressable style={styles.cancelCamera} onPress={() => setCameraOpen(false)}><Text style={styles.cancelCameraText}>Vazgeç</Text></Pressable></View></View>;

  const saveFavorite = () => { if (!result) return; favorite.mutate({ foodExternalId: result.externalId, foodName: result.name, barcode: result.barcode ?? null, caloriesPer100Grams: result.calories ?? null, proteinPer100Grams: result.protein ?? null, carbohydratesPer100Grams: result.carbs ?? null, fatPer100Grams: result.fat ?? null, imageUrl: result.imageUrl ?? null }, { onSuccess: () => Alert.alert('Favorilere eklendi', result.name) }); };
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}><Text style={styles.eyebrow}>TARA</Text><Text style={styles.title}>Gıda ekle</Text><Text style={styles.subtitle}>Barkodla ürün bilgisi alın veya yemek fotoğrafını analiz edin.</Text><View style={styles.preview}><Text style={styles.previewIcon}>▣</Text><Text style={styles.previewTitle}>Hızlı analiz</Text><Text style={styles.previewText}>Sonuç geldikten sonra besin değerlerini kontrol edip bugüne ekleyebilirsiniz.</Text></View><View style={styles.actions}><Pressable style={styles.primary} onPress={() => void openBarcode}><Text style={styles.primaryText}>Barkod tara</Text></Pressable><Pressable style={styles.secondary} onPress={() => void pickAndAnalyze}><Text style={styles.secondaryText}>Galeriden fotoğraf seç</Text></Pressable></View>{busy ? <ActivityIndicator color={colors.coral} style={styles.loader} /> : null}{result ? <View style={styles.resultCard}>{result.imageUrl ? <Image source={{ uri: result.imageUrl }} style={styles.resultImage} /> : null}<Text style={styles.resultTitle}>{result.name}</Text>{result.details ? <Text style={styles.resultDetails}>{result.details}</Text> : null}{result.allergens && result.allergens.length > 0 ? <View style={styles.allergenWarning}><Text style={styles.warningTitle}>Alerjen uyarısı</Text><Text style={styles.warningText}>{result.allergens.join(', ')}</Text><Text style={styles.warningHint}>Bu ürün profilindeki alerjenlerle eşleşiyor. Yine de ekleyebilirsin; karar senin.</Text></View> : null}<Pressable style={styles.favoriteButton} onPress={saveFavorite} disabled={favorite.isPending}><Text style={styles.favoriteText}>{favorite.isPending ? 'Kaydediliyor…' : '☆ Favorilere ekle'}</Text></Pressable><View style={styles.nutrition}><Nutrition label="Kalori" value={result.calories} unit="kcal" /><Nutrition label="Protein" value={result.protein} unit="g" /><Nutrition label="Karb." value={result.carbs} unit="g" /><Nutrition label="Yağ" value={result.fat} unit="g" /></View>{result.advice?.map((item) => <Text key={item} style={styles.advice}>• {item}</Text>)}<Text style={styles.sectionLabel}>Bugüne ekle</Text><View style={styles.meals}>{(['Kahvaltı', 'Öğle', 'Akşam', 'Ara Öğün'] as MealType[]).map((item) => <Pressable key={item} style={[styles.mealChip, meal === item && styles.mealChipActive]} onPress={() => setMeal(item)}><Text style={[styles.mealChipText, meal === item && styles.mealChipTextActive]}>{item}</Text></Pressable>)}</View><TextInput value={grams} onChangeText={setGrams} keyboardType="decimal-pad" style={styles.grams} placeholder="Gramaj (g)" placeholderTextColor={colors.textMuted} /><Pressable style={styles.primary} onPress={() => void addToToday} disabled={busy}><Text style={styles.primaryText}>Bugüne ekle</Text></Pressable></View> : null}</ScrollView>;
}

function Nutrition({ label, value, unit }: { readonly label: string; readonly value?: number | null; readonly unit: string }) { return <View style={styles.nutritionItem}><Text style={styles.nutritionLabel}>{label}</Text><Text style={styles.nutritionValue}>{value == null ? '—' : Math.round(value)} {unit}</Text></View>; }

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 120 }, cameraPage: { flex: 1, backgroundColor: colors.ink }, cameraOverlay: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: spacing.xl, paddingTop: 90, paddingBottom: 50 }, cameraTitle: { ...typography.heading, color: colors.white }, scanFrame: { width: 260, height: 180, borderWidth: 3, borderColor: colors.coral, borderRadius: radius.lg }, cancelCamera: { backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill }, cancelCameraText: { ...typography.label, color: colors.white }, eyebrow: { ...typography.label, color: colors.coral, letterSpacing: 1.4 }, title: { ...typography.title, color: colors.text, marginTop: 4 }, subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm }, preview: { minHeight: 230, borderRadius: radius.xl, backgroundColor: colors.ink, marginTop: spacing.xl, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }, previewIcon: { color: colors.coral, fontSize: 48 }, previewTitle: { ...typography.heading, color: colors.white, marginTop: spacing.md }, previewText: { ...typography.body, color: '#CBD5E1', marginTop: spacing.sm, textAlign: 'center' }, actions: { gap: spacing.sm, marginTop: spacing.lg }, primary: { minHeight: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.coral, paddingHorizontal: spacing.lg }, primaryText: { ...typography.label, color: colors.white }, secondary: { minHeight: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, secondaryText: { ...typography.label, color: colors.text }, loader: { marginTop: spacing.lg }, resultCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.xl }, resultImage: { width: '100%', height: 180, borderRadius: radius.md, marginBottom: spacing.md }, resultTitle: { ...typography.heading, color: colors.text }, resultDetails: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm }, allergenWarning: { backgroundColor: '#FFF1F0', borderWidth: 1, borderColor: '#FFB8B0', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }, warningTitle: { ...typography.heading, color: colors.error, fontSize: 15 }, warningText: { ...typography.label, color: colors.error, marginTop: 4 }, warningHint: { ...typography.body, color: colors.text, marginTop: 4, fontSize: 12 }, favoriteButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.coral, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 9, marginTop: spacing.md }, favoriteText: { ...typography.label, color: colors.coral }, nutrition: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }, nutritionItem: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.sm, minWidth: '46%' }, nutritionLabel: { ...typography.label, color: colors.textMuted }, nutritionValue: { ...typography.heading, color: colors.text, marginTop: 3 }, advice: { ...typography.body, color: colors.text, marginTop: spacing.sm }, sectionLabel: { ...typography.label, color: colors.text, marginTop: spacing.lg }, meals: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }, mealChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: spacing.sm }, mealChipActive: { borderColor: colors.coral, backgroundColor: '#FFF0EC' }, mealChipText: { ...typography.label, color: colors.textMuted }, mealChipTextActive: { color: colors.coral }, grams: { height: 52, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.md, color: colors.text, marginTop: spacing.md, fontSize: 17 } });
